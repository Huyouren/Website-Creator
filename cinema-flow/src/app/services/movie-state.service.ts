import { Injectable, inject } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  catchError,
  combineLatest,
  finalize,
  map,
  tap,
  throwError
} from 'rxjs';
import { Movie, MovieDraft } from '../models/movie';
import { MessageService } from './message.service';
import { MovieService } from './movie.service';

@Injectable({
  providedIn: 'root'
})
export class MovieStateService {
  private readonly movieService = inject(MovieService);
  private readonly messageService = inject(MessageService);
  private readonly moviesSubject = new BehaviorSubject<Movie[]>([]);
  private readonly loadingSubject = new BehaviorSubject<boolean>(true);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  private readonly visitedIdsSubject = new BehaviorSubject<number[]>([]);

  private hasLoaded = false;

  readonly movies$ = this.moviesSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();
  readonly visitedIds$ = this.visitedIdsSubject.asObservable();

  readonly totalCount$ = this.movies$.pipe(map((movies) => movies.length));
  readonly watchedCount$ = this.movies$.pipe(
    map((movies) => movies.filter((movie) => movie.isWatched).length)
  );
  readonly unwatchedCount$ = combineLatest([
    this.totalCount$,
    this.watchedCount$
  ]).pipe(map(([totalCount, watchedCount]) => totalCount - watchedCount));
  readonly averageRating$ = this.movies$.pipe(
    map((movies) => {
      if (!movies.length) {
        return 0;
      }

      const totalRating = movies.reduce((sum, movie) => sum + movie.rating, 0);
      return totalRating / movies.length;
    })
  );
  readonly recentMovies$ = this.movies$.pipe(
    map((movies) => [...movies].sort((a, b) => b.id - a.id).slice(0, 3))
  );
  readonly recentlyVisitedMovies$ = combineLatest([
    this.movies$,
    this.visitedIds$
  ]).pipe(
    map(([movies, visitedIds]) =>
      visitedIds
        .map((id) => movies.find((movie) => movie.id === id))
        .filter((movie): movie is Movie => !!movie)
        .slice(0, 3)
    )
  );
  readonly stats$ = combineLatest([
    this.totalCount$,
    this.watchedCount$,
    this.unwatchedCount$,
    this.averageRating$
  ]).pipe(
    map(([totalMovies, watchedMovies, unwatchedMovies, averageRating]) => ({
      totalMovies,
      watchedMovies,
      unwatchedMovies,
      averageRating
    }))
  );

  load(force = false): void {
    if (this.hasLoaded && !force) {
      return;
    }

    this.loadingSubject.next(true);
    this.clearError();

    this.movieService
      .getMovies()
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe({
        next: (movies) => {
          this.moviesSubject.next(movies);
          this.hasLoaded = true;
          this.messageService.add(
            `MovieState: synced ${movies.length} movies into the state store`
          );
        },
        error: (error: unknown) => {
          this.setError('failed to load movie state', error);
        }
      });
  }

  getMovieById(id: number): Observable<Movie | undefined> {
    return this.movies$.pipe(
      map((movies) => movies.find((movie) => movie.id === id))
    );
  }

  addMovie(movie: MovieDraft): Observable<Movie> {
    this.clearError();

    return this.movieService.addMovie(movie).pipe(
      tap((createdMovie) => {
        const nextMovies = [...this.moviesSubject.value, createdMovie].sort(
          (a, b) => a.id - b.id
        );
        this.moviesSubject.next(nextMovies);
        this.messageService.add(`MovieState: synced new movie "${createdMovie.title}"`);
      }),
      catchError(this.captureError<Movie>('failed to add movie'))
    );
  }

  updateMovie(movie: Movie): Observable<Movie> {
    this.clearError();

    return this.movieService.updateMovie(movie).pipe(
      tap((updatedMovie) => {
        this.moviesSubject.next(
          this.moviesSubject.value.map((item) =>
            item.id === updatedMovie.id ? updatedMovie : item
          )
        );
        this.messageService.add(
          `MovieState: synced updated movie "${updatedMovie.title}"`
        );
      }),
      catchError(this.captureError<Movie>('failed to update movie'))
    );
  }

  deleteMovie(id: number): Observable<boolean> {
    this.clearError();

    return this.movieService.deleteMovie(id).pipe(
      tap(() => {
        this.moviesSubject.next(
          this.moviesSubject.value.filter((movie) => movie.id !== id)
        );
        this.visitedIdsSubject.next(
          this.visitedIdsSubject.value.filter((visitedId) => visitedId !== id)
        );
        this.messageService.add(`MovieState: removed movie ${id} from the state store`);
      }),
      catchError(this.captureError<boolean>('failed to delete movie'))
    );
  }

  markAsVisited(id: number): void {
    const exists = this.moviesSubject.value.some((movie) => movie.id === id);

    if (!exists) {
      return;
    }

    const nextVisitedIds = [
      id,
      ...this.visitedIdsSubject.value.filter((visitedId) => visitedId !== id)
    ].slice(0, 5);

    this.visitedIdsSubject.next(nextVisitedIds);
  }

  private captureError<T>(operation: string) {
    return (error: unknown): Observable<T> => {
      this.setError(operation, error);
      return throwError(() =>
        error instanceof Error ? error : new Error(this.formatError(operation, error))
      );
    };
  }

  private clearError(): void {
    this.errorSubject.next(null);
  }

  private setError(operation: string, error: unknown): void {
    const message = this.formatError(operation, error);
    this.errorSubject.next(message);
    this.messageService.add(`MovieState: ${message}`);
  }

  private formatError(operation: string, error: unknown): string {
    const detail = error instanceof Error ? error.message : 'an unknown error occurred';
    return `${operation}. ${detail}`;
  }
}
