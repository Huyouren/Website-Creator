import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Movie } from '../models/movie';
import { MovieService } from '../services/movie.service';

@Component({
  selector: 'app-movie-stats',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressBarModule],
  templateUrl: './movie-stats.component.html',
  styleUrl: './movie-stats.component.scss'
})
export class MovieStatsComponent {
  movies$ = this.movieService.movies$;

  // 依赖注入
  constructor(private movieService: MovieService) {}

  get totalMovies(): number {
    let count = 0;
    this.movies$.subscribe(movies => count = movies.length);
    return count;
  }

  get watchedMovies(): number {
    let count = 0;
    this.movies$.subscribe(movies => count = movies.filter(m => m.isWatched).length);
    return count;
  }

  get watchedPercentage(): number {
    if (this.totalMovies === 0) {
      return 0;
    }
    return (this.watchedMovies / this.totalMovies) * 100;
  }

  get averageRating(): number {
    let avg = 0;
    this.movies$.subscribe(movies => {
      if (movies.length === 0) {
        avg = 0;
      } else {
        const total = movies.reduce((sum, movie) => sum + movie.rating, 0);
        avg = total / movies.length;
      }
    });
    return avg;
  }
}