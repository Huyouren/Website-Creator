import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MovieStatsComponent } from '../../components/movie-stats/movie-stats.component';
import { Movie } from '../../models/movie';
import { MovieStateService } from '../../services/movie-state.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MovieStatsComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  private readonly movieStateService = inject(MovieStateService);

  readonly loading$ = this.movieStateService.loading$;
  readonly error$ = this.movieStateService.error$;
  readonly recentMovies$ = this.movieStateService.recentMovies$;
  readonly recentlyVisitedMovies$ = this.movieStateService.recentlyVisitedMovies$;

  protected trackByMovieId(_: number, movie: Movie): number {
    return movie.id;
  }
}
