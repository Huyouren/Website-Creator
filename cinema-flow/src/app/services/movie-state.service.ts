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
    return this.addOptimistic(movie);
  }

  addOptimistic(movie: MovieDraft): Observable<Movie> {
    this.clearError();
    const previousMovies = this.moviesSubject.value;
    const optimisticMovie = this.createOptimisticMovie(movie);

    this.moviesSubject.next(
      [...previousMovies, optimisticMovie].sort((a, b) => a.id - b.id)
    );
    this.messageService.add(
      `MovieState: queued optimistic movie "${optimisticMovie.title}"`
    );

    return this.movieService.addMovie(movie).pipe(
      tap((createdMovie) => {
        this.moviesSubject.next(
          this.moviesSubject.value
            .map((item) => (item.id === optimisticMovie.id ? createdMovie : item))
            .sort((a, b) => a.id - b.id)
        );
        this.messageService.add(`MovieState: synced new movie "${createdMovie.title}"`);
      }),
      catchError((error: unknown) => {
        this.moviesSubject.next(previousMovies);
        return this.captureError<Movie>('failed to add movie')(error);
      })
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
    return this.deleteOptimistic(id);
  }

  deleteOptimistic(id: number): Observable<boolean> {
    this.clearError();
    const previousMovies = this.moviesSubject.value;
    const previousVisitedIds = this.visitedIdsSubject.value;
    const targetMovie = previousMovies.find((movie) => movie.id === id);

    if (!targetMovie) {
      const error = new Error(`movie ${id} was not found in state`);
      this.setError('failed to delete movie', error);
      return throwError(() => error);
    }

    this.moviesSubject.next(previousMovies.filter((movie) => movie.id !== id));
    this.visitedIdsSubject.next(
      previousVisitedIds.filter((visitedId) => visitedId !== id)
    );
    this.messageService.add(
      `MovieState: removed movie ${id} from the state store optimistically`
    );

    return this.movieService.deleteMovie(id).pipe(
      tap(() => {
        this.messageService.add(`MovieState: removed movie ${id} from the state store`);
      }),
      catchError((error: unknown) => {
        this.moviesSubject.next(previousMovies);
        this.visitedIdsSubject.next(previousVisitedIds);
        return this.captureError<boolean>('failed to delete movie')(error);
      })
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

  private createOptimisticMovie(movie: MovieDraft): Movie {
    const nextTemporaryId = Math.min(
      0,
      ...this.moviesSubject.value
        .filter((item) => item.id < 0)
        .map((item) => item.id)
    ) - 1;

    return {
      ...movie,
      id: nextTemporaryId,
      title: movie.title.trim(),
      director: movie.director.trim(),
      directorId: Number(movie.directorId) || 0,
      genre: movie.genre.trim() || '未分类',
      posterUrl: movie.posterUrl.trim(),
      releaseDate: new Date(movie.releaseDate),
      comments: movie.comments?.map((comment) => ({
        ...comment,
        createdAt: new Date(comment.createdAt)
      }))
    };
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
