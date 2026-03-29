import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Movie } from '../../models/movie';
import { RatingLevelPipe } from '../../pipes/rating-level.pipe';
import { MovieService } from '../../services/movie.service';

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
  private readonly movieService = inject(MovieService);

  protected readonly fallbackPoster =
    'https://placehold.co/500x760/10213d/e8f2ff?text=CinemaFlow';

  get movies(): Movie[] {
    return this.movieService.getMovies();
  }

  get featuredMovie(): Movie | undefined {
    return [...this.movies].sort((a, b) => b.rating - a.rating)[0];
  }

  get watchedCount(): number {
    return this.movies.filter((movie) => movie.isWatched).length;
  }

  get averageRating(): number {
    if (!this.movies.length) {
      return 0;
    }

    const total = this.movies.reduce((sum, movie) => sum + movie.rating, 0);
    return total / this.movies.length;
  }

  get movieSections(): MovieSection[] {
    const groups = new Map<number, Movie[]>();

    for (const movie of this.movies) {
      const releaseYear = movie.releaseDate.getFullYear();
      const decade = Math.floor(releaseYear / 10) * 10;
      const bucket = groups.get(decade) ?? [];
      bucket.push(movie);
      groups.set(decade, bucket);
    }

    const tones: MovieSection['tone'][] = ['gold', 'green', 'red', 'blue', 'amber'];

    return [...groups.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([decade, movies], index) => ({
        id: `decade-${decade}`,
        title: `${decade}年代片单`,
        subtitle: `${decade} - ${decade + 9}`,
        tone: tones[index % tones.length] ?? 'gold',
        movies: [...movies].sort((a, b) => b.rating - a.rating)
      }));
  }

  protected trackByMovieId(_: number, movie: Movie): number {
    return movie.id;
  }
}
