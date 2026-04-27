import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  Observable,
  catchError,
  map,
  of,
  switchMap,
  tap,
  throwError
} from 'rxjs';
import { Comment, Movie, MovieDraft } from '../models/movie';
import { MessageService } from './message.service';

interface CommentApiModel {
  id: number;
  userId: string;
  userName: string;
  content: string;
  rating: number;
  likes: number;
  createdAt: string;
}

interface MovieApiModel {
  id: number;
  title: string;
  releaseDate: string;
  director: string;
  directorId: number;
  genre: string;
  rating: number;
  isWatched: boolean;
  posterUrl: string;
  comments?: CommentApiModel[];
}

export interface MovieFilters {
  title?: string;
  genre?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private readonly http = inject(HttpClient);
  private readonly messageService = inject(MessageService);

  private readonly apiUrl = 'http://localhost:5000/api/movies';
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  getMovies(filters: MovieFilters = {}): Observable<Movie[]> {
    const params = this.buildMovieParams(filters);

    return this.http.get<MovieApiModel[]>(this.apiUrl, { params }).pipe(
      map((movies) =>
        movies
          .map((movie) => this.deserializeMovie(movie))
          .sort((a, b) => a.id - b.id)
      ),
      tap((movies) => {
        const filterNote = [
          filters.title ? `title=${filters.title}` : '',
          filters.genre ? `genre=${filters.genre}` : ''
        ]
          .filter(Boolean)
          .join(', ');

        this.messageService.add(
          `MovieService: loaded ${movies.length} movies${
            filterNote ? ` (${filterNote})` : ''
          }`
        );
      }),
      catchError(this.handleError<Movie[]>('getMovies'))
    );
  }

  getMovieById(id: number): Observable<Movie | undefined> {
    return this.http.get<MovieApiModel>(`${this.apiUrl}/${id}`).pipe(
      map((movie) => this.deserializeMovie(movie)),
      tap((movie) =>
        this.messageService.add(`MovieService: resolved details for "${movie.title}"`)
      ),
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 404) {
          this.messageService.add(`MovieService: movie ${id} was not found`);
          return of(undefined);
        }

        return this.handleError<Movie | undefined>('getMovieById')(error);
      })
    );
  }

  addMovie(movie: MovieDraft): Observable<Movie> {
    const payload = this.serializeMovieDraft(movie);

    return this.http
      .post<MovieApiModel>(this.apiUrl, payload, this.httpOptions)
      .pipe(
        map((createdMovie) => this.deserializeMovie(createdMovie)),
        tap((createdMovie) =>
          this.messageService.add(`MovieService: created "${createdMovie.title}"`)
        ),
        catchError(this.handleError<Movie>('addMovie'))
      );
  }

  updateMovie(movie: Movie): Observable<Movie> {
    const payload = this.serializeMovie(movie);

    return this.http
      .put<MovieApiModel>(
        `${this.apiUrl}/${movie.id}`,
        payload,
        this.httpOptions
      )
      .pipe(
        map((updatedMovie) => this.deserializeMovie(updatedMovie)),
        tap((updatedMovie) =>
          this.messageService.add(`MovieService: updated "${updatedMovie.title}"`)
        ),
        catchError(this.handleError<Movie>('updateMovie'))
      );
  }

  deleteMovie(id: number): Observable<boolean> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      map(() => true),
      tap(() => this.messageService.add(`MovieService: deleted movie ${id}`)),
      catchError(this.handleError<boolean>('deleteMovie'))
    );
  }

  addComment(
    movieId: number,
    comment: Omit<Comment, 'id' | 'likes' | 'createdAt'>
  ): Observable<Comment[]> {
    return this.getMovieById(movieId).pipe(
      switchMap((movie) => {
        if (!movie) {
          return throwError(() => new Error(`movie ${movieId} was not found`));
        }

        const nextComments = [
          ...(movie.comments ?? []),
          {
            ...comment,
            id: this.getNextCommentId(movie),
            likes: 0,
            createdAt: new Date()
          }
        ];

        return this.updateMovie({ ...movie, comments: nextComments }).pipe(
          map((updatedMovie) => updatedMovie.comments ?? [])
        );
      }),
      tap(() =>
        this.messageService.add(`MovieService: added a comment to movie ${movieId}`)
      ),
      catchError(this.handleError<Comment[]>('addComment'))
    );
  }

  likeComment(movieId: number, commentId: number): Observable<Comment[]> {
    return this.getMovieById(movieId).pipe(
      switchMap((movie) => {
        if (!movie) {
          return throwError(() => new Error(`movie ${movieId} was not found`));
        }

        const nextComments = (movie.comments ?? []).map((comment) =>
          comment.id === commentId
            ? { ...comment, likes: comment.likes + 1 }
            : comment
        );

        return this.updateMovie({ ...movie, comments: nextComments }).pipe(
          map((updatedMovie) => updatedMovie.comments ?? [])
        );
      }),
      tap(() =>
        this.messageService.add(
          `MovieService: liked comment ${commentId} on movie ${movieId}`
        )
      ),
      catchError(this.handleError<Comment[]>('likeComment'))
    );
  }

  private buildMovieParams(filters: MovieFilters): HttpParams {
    let params = new HttpParams();

    if (filters.title?.trim()) {
      params = params.set('title', filters.title.trim());
    }

    if (filters.genre?.trim()) {
      params = params.set('genre', filters.genre.trim());
    }

    return params;
  }

  private getNextCommentId(movie: Movie): number {
    return Math.max(...(movie.comments ?? []).map((comment) => comment.id), 0) + 1;
  }

  private deserializeMovie(movie: MovieApiModel): Movie {
    return {
      ...movie,
      releaseDate: new Date(movie.releaseDate),
      comments: movie.comments?.map((comment) => this.deserializeComment(comment))
    };
  }

  private deserializeComment(comment: CommentApiModel): Comment {
    return {
      ...comment,
      createdAt: new Date(comment.createdAt)
    };
  }

  private serializeMovieDraft(movie: MovieDraft): Omit<MovieApiModel, 'id'> {
    return {
      ...movie,
      title: movie.title.trim(),
      director: movie.director.trim(),
      genre: movie.genre.trim() || '未分类',
      posterUrl: movie.posterUrl.trim(),
      releaseDate: movie.releaseDate.toISOString(),
      comments: movie.comments?.map((comment) => this.serializeComment(comment))
    };
  }

  private serializeMovie(movie: Movie): MovieApiModel {
    return {
      ...this.serializeMovieDraft(movie),
      id: movie.id
    };
  }

  private serializeComment(comment: Comment): CommentApiModel {
    return {
      ...comment,
      createdAt: comment.createdAt.toISOString()
    };
  }

  private handleError<T>(operation: string) {
    return (error: unknown): Observable<T> => {
      const message = this.formatError(operation, error);
      this.messageService.add(`MovieService: ${message}`);
      return throwError(() =>
        error instanceof Error ? error : new Error(message)
      );
    };
  }

  private formatError(operation: string, error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const backendMessage =
        typeof error.error?.message === 'string'
          ? error.error.message
          : error.message;

      return `${operation} failed. ${backendMessage}`;
    }

    const detail =
      error instanceof Error ? error.message : 'an unknown error occurred';

    return `${operation} failed. ${detail}`;
  }
}
