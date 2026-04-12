import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { combineLatest, map } from 'rxjs';
import { MovieStateService } from '../../services/movie-state.service';

@Component({
  selector: 'app-movie-stats',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './movie-stats.component.html',
  styleUrl: './movie-stats.component.scss'
})
export class MovieStatsComponent {
  private readonly movieStateService = inject(MovieStateService);

  readonly viewModel$ = combineLatest([
    this.movieStateService.stats$,
    this.movieStateService.loading$
  ]).pipe(
    map(([stats, loading]) => ({
      ...stats,
      loading,
      watchedPercent: stats.totalMovies
        ? (stats.watchedMovies / stats.totalMovies) * 100
        : 0
    }))
  );
}
