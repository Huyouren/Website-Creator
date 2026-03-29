import { Injectable } from '@angular/core';
import { MOCK_MOVIES } from '../mock-movies';
import { Movie } from '../models/movie';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private movies: Movie[] = MOCK_MOVIES.map((movie) => ({
    ...movie,
    releaseDate: new Date(movie.releaseDate)
  }));

  getMovies(): Movie[] {
    return [...this.movies].sort((a, b) => a.id - b.id);
  }

  getMovieById(id: number): Movie | undefined {
    return this.movies.find((movie) => movie.id === id);
  }

  addMovie(movie: Omit<Movie, 'id'>): Movie {
    const newMovie: Movie = {
      ...movie,
      id: this.getNextId(),
      releaseDate: new Date(movie.releaseDate)
    };

    this.movies = [...this.movies, newMovie];
    return newMovie;
  }

  deleteMovie(id: number): boolean {
    const previousLength = this.movies.length;
    this.movies = this.movies.filter((movie) => movie.id !== id);
    return this.movies.length < previousLength;
  }

  private getNextId(): number {
    return Math.max(...this.movies.map((movie) => movie.id), 0) + 1;
  }
}
