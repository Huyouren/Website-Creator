import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  Observable,
  catchError,
  delay,
  map,
  of,
  shareReplay,
  tap,
  throwError
} from 'rxjs';
import { Comment, Movie, MovieDraft } from '../models/movie';
import { MessageService } from './message.service';

interface CommentAsset {
  id: number;
  userId: string;
  userName: string;
  content: string;
  rating: number;
  likes: number;
  createdAt: string;
}

interface MovieAsset {
  id: number;
  title: string;
  releaseDate: string;
  director: string;
  rating: number;
  isWatched: boolean;
  posterUrl: string;
  comments?: CommentAsset[];
}

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private readonly http = inject(HttpClient);
  private readonly messageService = inject(MessageService);

  private movies: Movie[] = [];
  private seedLoaded = false;
  private loadFromAssets$?: Observable<Movie[]>;

  getMovies(): Observable<Movie[]> {
    return this.ensureMoviesReady().pipe(
      map((movies) => [...movies].sort((a, b) => a.id - b.id)),
      delay(180),
      tap((movies) =>
        this.messageService.add(`MovieService: loaded ${movies.length} movies`)
      ),
      catchError(this.handleError<Movie[]>('failed to load movies'))
    );
  }

  getMovieById(id: number): Observable<Movie | undefined> {
    return this.ensureMoviesReady().pipe(
      map((movies) => this.cloneMaybeMovie(movies.find((movie) => movie.id === id))),
      delay(140),
      tap((movie) =>
        this.messageService.add(
          movie
            ? `MovieService: resolved details for "${movie.title}"`
            : `MovieService: movie ${id} was not found`
        )
      ),
      catchError(this.handleError<Movie | undefined>('failed to load movie details'))
    );
  }

  addMovie(movie: MovieDraft): Observable<Movie> {
    return this.ensureMoviesReady().pipe(
      map(() => {
        const createdMovie = this.createMovie(movie);
        this.movies = [...this.movies, createdMovie];
        return this.cloneMovie(createdMovie);
      }),
      delay(160),
      tap((createdMovie) =>
        this.messageService.add(`MovieService: created "${createdMovie.title}"`)
      ),
      catchError(this.handleError<Movie>('failed to create movie'))
    );
  }

  updateMovie(movie: Movie): Observable<Movie> {
    return this.ensureMoviesReady().pipe(
      map(() => {
        const movieIndex = this.movies.findIndex((item) => item.id === movie.id);

        if (movieIndex === -1) {
          throw new Error(`movie ${movie.id} was not found`);
        }

        const updatedMovie = this.normalizeMovie(movie);
        this.movies = this.movies.map((item) =>
          item.id === updatedMovie.id ? updatedMovie : item
        );

        return this.cloneMovie(updatedMovie);
      }),
      delay(160),
      tap((updatedMovie) =>
        this.messageService.add(`MovieService: updated "${updatedMovie.title}"`)
      ),
      catchError(this.handleError<Movie>('failed to update movie'))
    );
  }

  deleteMovie(id: number): Observable<boolean> {
    return this.ensureMoviesReady().pipe(
      map(() => {
        const targetMovie = this.movies.find((movie) => movie.id === id);

        if (!targetMovie) {
          throw new Error(`movie ${id} was not found`);
        }

        this.movies = this.movies.filter((movie) => movie.id !== id);
        return targetMovie;
      }),
      delay(140),
      tap((targetMovie) =>
        this.messageService.add(`MovieService: deleted "${targetMovie.title}"`)
      ),
      map(() => true),
      catchError(this.handleError<boolean>('failed to delete movie'))
    );
  }

  addComment(
    movieId: number,
    comment: Omit<Comment, 'id' | 'likes' | 'createdAt'>
  ): Observable<Comment[]> {
    return this.ensureMoviesReady().pipe(
      map(() => {
        const targetMovie = this.movies.find((movie) => movie.id === movieId);

        if (!targetMovie) {
          throw new Error(`movie ${movieId} was not found`);
        }

        const nextComments = [
          ...(targetMovie.comments ?? []),
          {
            ...comment,
            id: this.getNextCommentId(targetMovie),
            likes: 0,
            createdAt: new Date()
          }
        ];

        this.movies = this.movies.map((movie) =>
          movie.id === movieId ? { ...movie, comments: nextComments } : movie
        );

        return this.cloneComments(nextComments) ?? [];
      }),
      delay(120),
      tap(() =>
        this.messageService.add(`MovieService: added a comment to movie ${movieId}`)
      ),
      catchError(this.handleError<Comment[]>('failed to add comment'))
    );
  }

  likeComment(movieId: number, commentId: number): Observable<Comment[]> {
    return this.ensureMoviesReady().pipe(
      map(() => {
        const targetMovie = this.movies.find((movie) => movie.id === movieId);

        if (!targetMovie) {
          throw new Error(`movie ${movieId} was not found`);
        }

        const nextComments = (targetMovie.comments ?? []).map((comment) =>
          comment.id === commentId
            ? { ...comment, likes: comment.likes + 1 }
            : comment
        );

        this.movies = this.movies.map((movie) =>
          movie.id === movieId ? { ...movie, comments: nextComments } : movie
        );

        return this.cloneComments(nextComments) ?? [];
      }),
      delay(100),
      tap(() =>
        this.messageService.add(
          `MovieService: liked comment ${commentId} on movie ${movieId}`
        )
      ),
      catchError(this.handleError<Comment[]>('failed to like comment'))
    );
  }

  private ensureMoviesReady(): Observable<Movie[]> {
    if (this.seedLoaded) {
      return of(this.cloneMovies(this.movies));
    }

    if (!this.loadFromAssets$) {
      this.loadFromAssets$ = this.http.get<MovieAsset[]>('assets/movies.json').pipe(
        map((movies) => movies.map((movie) => this.deserializeMovie(movie))),
        tap((movies) => {
          this.movies = movies;
          this.seedLoaded = true;
          this.messageService.add(
            `MovieService: seeded ${movies.length} movies from assets`
          );
        }),
        map((movies) => this.cloneMovies(movies)),
        shareReplay(1)
      );
    }

    return this.loadFromAssets$;
  }

  private getNextId(): number {
    return Math.max(...this.movies.map((movie) => movie.id), 0) + 1;
  }

  private getNextCommentId(movie: Movie): number {
    return Math.max(...(movie.comments ?? []).map((comment) => comment.id), 0) + 1;
  }

  private createMovie(movie: MovieDraft): Movie {
    return this.normalizeMovie({
      ...movie,
      id: this.getNextId()
    });
  }

  private deserializeMovie(movie: MovieAsset): Movie {
    return this.normalizeMovie({
      ...movie,
      releaseDate: new Date(movie.releaseDate),
      comments: movie.comments?.map((comment) => ({
        ...comment,
        createdAt: new Date(comment.createdAt)
      }))
    });
  }

  private normalizeMovie(movie: Movie): Movie {
    return {
      ...movie,
      title: movie.title.trim(),
      director: movie.director.trim(),
      posterUrl: movie.posterUrl.trim(),
      releaseDate: new Date(movie.releaseDate),
      comments: this.cloneComments(movie.comments)
    };
  }

  private cloneMovie(movie: Movie): Movie {
    return {
      ...movie,
      releaseDate: new Date(movie.releaseDate),
      comments: this.cloneComments(movie.comments)
    };
  }

  private cloneMaybeMovie(movie: Movie | undefined): Movie | undefined {
    return movie ? this.cloneMovie(movie) : undefined;
  }

  private cloneMovies(movies: readonly Movie[]): Movie[] {
    return movies.map((movie) => this.cloneMovie(movie));
  }

  private cloneComments(comments: readonly Comment[] | undefined): Comment[] | undefined {
    return comments?.map((comment) => ({
      ...comment,
      createdAt: new Date(comment.createdAt)
    }));
  }

  private handleError<T>(operation: string) {
    return (error: unknown): Observable<T> => {
      const message =
        error instanceof Error ? error.message : 'an unknown error occurred';
      this.messageService.add(`MovieService: ${operation}. ${message}`);
      return throwError(() =>
        error instanceof Error ? error : new Error(message)
      );
    };
  }
}
