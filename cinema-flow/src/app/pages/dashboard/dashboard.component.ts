import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { combineLatest, map } from 'rxjs';
import { MovieSearchComponent } from '../../components/movie-search/movie-search.component';
import { MovieStatsComponent } from '../../components/movie-stats/movie-stats.component';
import { Director } from '../../models/director';
import { Movie } from '../../models/movie';
import { DirectorService } from '../../services/director.service';
import { MovieStateService } from '../../services/movie-state.service';

interface DirectorCard extends Director {
  movieCount: number;
  featuredGenre: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MovieSearchComponent,
    MovieStatsComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly directorService = inject(DirectorService);
  private readonly movieStateService = inject(MovieStateService);

  readonly loading$ = this.movieStateService.loading$;
  readonly error$ = this.movieStateService.error$;
  readonly loginRequired$ = this.route.queryParamMap.pipe(
    map((params) => params.get('loginRequired') === 'true')
  );
  readonly recentMovies$ = this.movieStateService.recentMovies$;
  readonly recentlyVisitedMovies$ = this.movieStateService.recentlyVisitedMovies$;
  readonly topDirectors$ = combineLatest([
    this.directorService.getDirectors(),
    this.movieStateService.movies$
  ]).pipe(
    map(([directors, movies]) =>
      directors
        .map(
          (director): DirectorCard => ({
            ...director,
            movieCount: movies.filter((movie) => movie.directorId === director.id).length,
            featuredGenre:
              movies.find((movie) => movie.directorId === director.id)?.genre ?? '未分类'
          })
        )
        .sort((a, b) => b.movieCount - a.movieCount || a.id - b.id)
        .slice(0, 4)
    )
  );

  protected trackByMovieId(_: number, movie: Movie): number {
    return movie.id;
  }

  protected trackByDirectorId(_: number, director: DirectorCard): number {
    return director.id;
  }
}
