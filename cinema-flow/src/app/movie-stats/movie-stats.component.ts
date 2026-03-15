import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Movie } from '../models/movie';

@Component({
  selector: 'app-movie-stats',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressBarModule],
  templateUrl: './movie-stats.component.html',
  styleUrl: './movie-stats.component.scss'
})
export class MovieStatsComponent {
  @Input() movies: Movie[] = [];

  get totalMovies(): number {
    return this.movies.length;
  }

  get watchedMovies(): number {
    return this.movies.filter((movie) => movie.isWatched).length;
  }

  get watchedPercentage(): number {
    if (this.totalMovies === 0) {
      return 0;
    }

    return (this.watchedMovies / this.totalMovies) * 100;
  }

  get averageRating(): number {
    if (this.totalMovies === 0) {
      return 0;
    }

    const totalRating = this.movies.reduce((sum, movie) => sum + movie.rating, 0);
    return totalRating / this.totalMovies;
  }
}