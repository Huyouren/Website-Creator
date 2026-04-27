import { CommonModule, Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  Observable,
  catchError,
  combineLatest,
  map,
  of,
  shareReplay,
  startWith,
  switchMap
} from 'rxjs';
import { Director } from '../../models/director';
import { Movie } from '../../models/movie';
import { DirectorService } from '../../services/director.service';

interface DirectorNavigation {
  prev: Director | null;
  next: Director | null;
}

interface LoadState<T> {
  loading: boolean;
  value?: T;
  error: string | null;
}

interface DirectorDetailViewModel {
  loading: boolean;
  director?: Director;
  directedMovies: Movie[];
  navigation: DirectorNavigation;
  error: string | null;
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
  private readonly location = inject(Location);

  private readonly directors$ = this.directorService.getDirectors().pipe(shareReplay(1));
  private readonly currentId$ = this.route.paramMap.pipe(
    map((params) => Number(params.get('id'))),
    map((id) => (Number.isNaN(id) ? null : id))
  );

  readonly viewModel$: Observable<DirectorDetailViewModel> = this.currentId$.pipe(
    switchMap((currentId) => {
      if (currentId === null) {
        return of<DirectorDetailViewModel>({
          loading: false,
          director: undefined,
          directedMovies: [],
          navigation: { prev: null, next: null },
          error: '当前地址中的导演编号无效。'
        });
      }

      return combineLatest([
        this.directors$.pipe(startWith<Director[] | null>(null)),
        this.loadDirector(currentId),
        this.loadDirectedMovies(currentId)
      ]).pipe(
        map(([directors, directorState, movieState]) => {
          const resolvedDirectors = directors ?? [];
          const currentIndex = resolvedDirectors.findIndex(
            (director) => director.id === currentId
          );

          return {
            loading:
              directors === null || directorState.loading || movieState.loading,
            director: directorState.value,
            directedMovies: movieState.value ?? [],
            navigation: {
              prev: currentIndex > 0 ? resolvedDirectors[currentIndex - 1] : null,
              next:
                currentIndex >= 0 && currentIndex < resolvedDirectors.length - 1
                  ? resolvedDirectors[currentIndex + 1]
                  : null
            },
            error:
              directorState.error ??
              movieState.error ??
              (!directorState.loading && !directorState.value
                ? '当前地址中的导演编号无效，或者该导演尚未录入导演库。'
                : null)
          };
        })
      );
    })
  );

  protected goBack(): void {
    this.location.back();
  }

  private loadDirector(id: number): Observable<LoadState<Director | undefined>> {
    return this.directorService.getDirectorById(id).pipe(
      map((director) => ({
        loading: false,
        value: director,
        error: director ? null : '当前地址中的导演编号无效，或者该导演尚未录入导演库。'
      })),
      startWith({
        loading: true,
        value: undefined,
        error: null
      }),
      catchError((error: unknown) =>
        of({
          loading: false,
          value: undefined,
          error: this.formatError(error, '导演详情加载失败，请稍后重试。')
        })
      )
    );
  }

  private loadDirectedMovies(id: number): Observable<LoadState<Movie[]>> {
    return this.directorService.getDirectedMovies(id).pipe(
      map((movies) => ({
        loading: false,
        value: movies,
        error: null
      })),
      startWith({
        loading: true,
        value: [] as Movie[],
        error: null
      }),
      catchError((error: unknown) =>
        of({
          loading: false,
          value: [] as Movie[],
          error: this.formatError(error, '导演作品加载失败，请稍后重试。')
        })
      )
    );
  }

  private formatError(error: unknown, fallback: string): string {
    return error instanceof Error ? error.message : fallback;
  }
}
