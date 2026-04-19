import { CommonModule, Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { combineLatest, map, shareReplay, startWith } from 'rxjs';
import { Director } from '../../models/director';
import { Movie } from '../../models/movie';
import { DirectorService } from '../../services/director.service';
import { MovieStateService } from '../../services/movie-state.service';

interface DirectorNavigation {
  prev: Director | null;
  next: Director | null;
}

interface DirectorDetailViewModel {
  loading: boolean;
  director?: Director;
  directedMovies: Movie[];
  navigation: DirectorNavigation;
}

@Component({
  selector: 'app-director-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './director-detail.component.html',
  styleUrl: './director-detail.component.scss'
})
export class DirectorDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly directorService = inject(DirectorService);
  private readonly movieStateService = inject(MovieStateService);
  private readonly location = inject(Location);

  private readonly directors$ = this.directorService.getDirectors().pipe(shareReplay(1));
  private readonly currentId$ = this.route.paramMap.pipe(
    map((params) => Number(params.get('id'))),
    map((id) => (Number.isNaN(id) ? null : id))
  );

  readonly viewModel$ = combineLatest([
    this.currentId$,
    this.directors$.pipe(startWith<Director[] | null>(null)),
    this.movieStateService.movies$,
    this.movieStateService.loading$
  ]).pipe(
    map(([currentId, directors, movies, movieLoading]): DirectorDetailViewModel => {
      const resolvedDirectors = directors ?? [];
      const loading = directors === null || movieLoading;

      if (currentId === null) {
        return {
          loading: false,
          director: undefined,
          directedMovies: [],
          navigation: { prev: null, next: null }
        };
      }

      const currentIndex = resolvedDirectors.findIndex(
        (director) => director.id === currentId
      );
      const director = currentIndex >= 0 ? resolvedDirectors[currentIndex] : undefined;

      return {
        loading,
        director,
        directedMovies: movies.filter((movie) => movie.directorId === currentId),
        navigation: {
          prev: currentIndex > 0 ? resolvedDirectors[currentIndex - 1] : null,
          next:
            currentIndex >= 0 && currentIndex < resolvedDirectors.length - 1
              ? resolvedDirectors[currentIndex + 1]
              : null
        }
      };
    })
  );

  protected goBack(): void {
    this.location.back();
  }
}
