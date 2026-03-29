import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Movie } from '../../models/movie';
import { MovieService } from '../../services/movie.service';

@Component({
  selector: 'app-movie-stats',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './movie-stats.component.html',
  styleUrl: './movie-stats.component.scss'
})
export class MovieStatsComponent {
  private readonly movieService = inject(MovieService);

  private get movies(): Movie[] {
    return this.movieService.getMovies();
  }

  get totalMovies(): number {
    return this.movies.length;
  }

  get watchedMovies(): number {
    return this.movies.filter((movie) => movie.isWatched).length;
  }

  get unwatchedMovies(): number {
    return this.totalMovies - this.watchedMovies;
  }

  get averageRating(): number {
    if (!this.movies.length) {
      return 0;
    }

    const total = this.movies.reduce((sum, movie) => sum + movie.rating, 0);
    return total / this.movies.length;
  }

  get watchedPercent(): number {
    if (!this.totalMovies) {
      return 0;
    }

    return (this.watchedMovies / this.totalMovies) * 100;
  }
}
