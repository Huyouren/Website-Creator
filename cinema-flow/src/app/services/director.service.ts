import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  Observable,
  catchError,
  map,
  of,
  tap,
  throwError
} from 'rxjs';
import { Director } from '../models/director';
import { Movie } from '../models/movie';
import { MessageService } from './message.service';

interface DirectorApiModel {
  id: number;
  name: string;
  nationality: string;
  birthYear: number;
  bio: string;
}

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

@Injectable({
  providedIn: 'root'
})
export class DirectorService {
  private readonly http = inject(HttpClient);
  private readonly messageService = inject(MessageService);

  private readonly apiUrl = 'http://localhost:5000/api/directors';
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  getDirectors(): Observable<Director[]> {
    return this.http.get<DirectorApiModel[]>(this.apiUrl).pipe(
      map((directors) => directors.map((director) => ({ ...director }))),
      tap((directors) =>
        this.messageService.add(`DirectorService: loaded ${directors.length} directors`)
      ),
      catchError(this.handleError<Director[]>('getDirectors'))
    );
  }

  getDirectorById(id: number): Observable<Director | undefined> {
    return this.http.get<DirectorApiModel>(`${this.apiUrl}/${id}`).pipe(
      map((director) => ({ ...director })),
      tap((director) =>
        this.messageService.add(`DirectorService: resolved ${director.name}`)
      ),
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 404) {
          this.messageService.add(`DirectorService: director ${id} was not found`);
          return of(undefined);
        }

        return this.handleError<Director | undefined>('getDirectorById')(error);
      })
    );
  }

  getDirectedMovies(id: number): Observable<Movie[]> {
    return this.http.get<MovieApiModel[]>(`${this.apiUrl}/${id}/movies`).pipe(
      map((movies) =>
        movies.map((movie) => ({
          ...movie,
          releaseDate: new Date(movie.releaseDate),
          comments: movie.comments?.map((comment) => ({
            ...comment,
            createdAt: new Date(comment.createdAt)
          }))
        }))
      ),
      tap((movies) =>
        this.messageService.add(
          `DirectorService: loaded ${movies.length} directed movies for director ${id}`
        )
      ),
      catchError(this.handleError<Movie[]>('getDirectedMovies'))
    );
  }

  addDirector(director: Omit<Director, 'id'>): Observable<Director> {
    return this.http
      .post<DirectorApiModel>(this.apiUrl, director, this.httpOptions)
      .pipe(
        map((createdDirector) => ({ ...createdDirector })),
        tap((createdDirector) =>
          this.messageService.add(`DirectorService: created ${createdDirector.name}`)
        ),
        catchError(this.handleError<Director>('addDirector'))
      );
  }

  deleteDirector(id: number): Observable<boolean> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      map(() => true),
      tap(() => this.messageService.add(`DirectorService: deleted director ${id}`)),
      catchError(this.handleError<boolean>('deleteDirector'))
    );
  }

  private handleError<T>(operation: string) {
    return (error: unknown): Observable<T> => {
      const message = this.formatError(operation, error);
      this.messageService.add(`DirectorService: ${message}`);
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
