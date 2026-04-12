import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { combineLatest, map } from 'rxjs';
import { Movie } from '../../models/movie';
import { RatingLevelPipe } from '../../pipes/rating-level.pipe';
import { MovieStateService } from '../../services/movie-state.service';

interface MovieSection {
  id: string;
  title: string;
  subtitle: string;
  tone: 'gold' | 'green' | 'red' | 'blue' | 'amber';
  movies: Movie[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RatingLevelPipe
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private readonly movieStateService = inject(MovieStateService);

  protected readonly fallbackPoster =
    'https://placehold.co/500x760/10213d/e8f2ff?text=CinemaFlow';

  readonly viewModel$ = combineLatest([
    this.movieStateService.movies$,
    this.movieStateService.loading$,
    this.movieStateService.error$
  ]).pipe(
    map(([movies, loading, error]) => {
      const featuredMovie = [...movies].sort((a, b) => b.rating - a.rating)[0];
      const watchedCount = movies.filter((movie) => movie.isWatched).length;
      const averageRating = movies.length
        ? movies.reduce((sum, movie) => sum + movie.rating, 0) / movies.length
        : 0;

      return {
        movies,
        loading,
        error,
        featuredMovie,
        watchedCount,
        averageRating,
        sections: this.buildMovieSections(movies)
      };
    })
  );

  protected trackByMovieId(_: number, movie: Movie): number {
    return movie.id;
  }

  private buildMovieSections(movies: Movie[]): MovieSection[] {
    const groups = new Map<number, Movie[]>();

    for (const movie of movies) {
      const releaseYear = movie.releaseDate.getFullYear();
      const decade = Math.floor(releaseYear / 10) * 10;
      const bucket = groups.get(decade) ?? [];
      bucket.push(movie);
      groups.set(decade, bucket);
    }

    const tones: MovieSection['tone'][] = ['gold', 'green', 'red', 'blue', 'amber'];

    return [...groups.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([decade, groupedMovies], index) => ({
        id: `decade-${decade}`,
        title: `${decade}年代片单`,
        subtitle: `${decade} - ${decade + 9}`,
        tone: tones[index % tones.length] ?? 'gold',
        movies: [...groupedMovies].sort((a, b) => b.rating - a.rating)
      }));
  }
}
