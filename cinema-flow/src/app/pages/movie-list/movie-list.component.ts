import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  finalize,
  map,
  of,
  startWith,
  switchMap,
  tap
} from 'rxjs';
import { Movie } from '../../models/movie';
import { RatingLevelPipe } from '../../pipes/rating-level.pipe';
import { MovieService } from '../../services/movie.service';
import { MovieStateService } from '../../services/movie-state.service';

interface ListFilters {
  currentGenre: string;
  currentSort: string;
  searchTerm: string;
}

@Component({
  selector: 'app-movie-list-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatInputModule,
    MatFormFieldModule,
    RatingLevelPipe
  ],
  templateUrl: './movie-list.component.html',
  styleUrl: './movie-list.component.scss'
})
export class MovieListPageComponent {
  protected readonly sortOptions = [
    { value: 'default', label: '默认顺序' },
    { value: 'rating', label: '按评分排序' },
    { value: 'year', label: '按年份排序' }
  ] as const;

  private readonly movieService = inject(MovieService);
  private readonly movieStateService = inject(MovieStateService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected searchTerm = '';
  protected currentGenre = '';
  protected currentSort = 'default';
  protected readonly displayedColumns = [
    'title',
    'director',
    'genre',
    'rating',
    'status',
    'actions'
  ];

  private readonly deletingIds = new Set<number>();
  private readonly refreshToken$ = new BehaviorSubject(0);
  private readonly filters$ = combineLatest([
    this.route.paramMap,
    this.route.queryParamMap
  ]).pipe(
    map(([paramMap, queryParamMap]): ListFilters => ({
      currentGenre: paramMap.get('genre')?.trim() ?? '',
      searchTerm: queryParamMap.get('search')?.trim() ?? '',
      currentSort: queryParamMap.get('sort')?.trim() ?? 'default'
    }))
  );

  readonly viewModel$ = combineLatest([
    this.filters$,
    this.movieStateService.movies$.pipe(startWith([] as Movie[])),
    this.refreshToken$
  ]).pipe(
    switchMap(([filters, allMovies]) =>
      this.movieService
        .getMovies({
          title: filters.searchTerm,
          genre: filters.currentGenre
        })
        .pipe(
          map((movies) =>
            this.createViewModel(
              filters,
              this.applySort(movies, filters.currentSort),
              allMovies,
              false,
              null
            )
          ),
          startWith(
            this.createViewModel(filters, [], allMovies, true, null)
          ),
          catchError((error: unknown) =>
            of(
              this.createViewModel(
                filters,
                [],
                allMovies,
                false,
                this.formatError(error)
              )
            )
          )
        )
    ),
    tap(({ currentGenre, currentSort, searchTerm }) => {
      this.currentGenre = currentGenre;
      this.currentSort = currentSort;
      this.searchTerm = searchTerm;
    })
  );

  protected onSearchChange(value: string): void {
    const keyword = value.trim();
    this.searchTerm = value;

    void this.router.navigate(this.getCurrentListRoute(), {
      queryParams: this.buildQueryParams(keyword, this.currentSort)
    });
  }

  protected clearSearch(): void {
    this.searchTerm = '';
    void this.router.navigate(this.getCurrentListRoute(), {
      queryParams: this.buildQueryParams('', this.currentSort)
    });
  }

  protected onSortChange(sortValue: string): void {
    this.currentSort = sortValue;
    void this.router.navigate(this.getCurrentListRoute(), {
      queryParams: this.buildQueryParams(this.searchTerm, sortValue)
    });
  }

  protected deleteMovie(id: number): void {
    if (!confirm('确定要删除这部电影吗？')) {
      return;
    }

    this.deletingIds.add(id);
    this.movieStateService
      .deleteMovie(id)
      .pipe(
        finalize(() => {
          this.deletingIds.delete(id);
        })
      )
      .subscribe({
        next: () => {
          this.refreshToken$.next(this.refreshToken$.value + 1);
        },
        error: () => {
          // 具体错误信息已写入服务消息面板和状态中心。
        }
      });
  }

  protected isDeleting(id: number): boolean {
    return this.deletingIds.has(id);
  }

  protected getFilterQueryParams(
    searchTerm: string,
    sortValue = this.currentSort
  ): Record<string, string> | null {
    const params = this.buildQueryParams(searchTerm, sortValue);
    return Object.keys(params).length ? params : null;
  }

  private createViewModel(
    filters: ListFilters,
    filteredMovies: Movie[],
    allMovies: Movie[],
    loading: boolean,
    error: string | null
  ) {
    return {
      filteredMovies,
      currentGenre: filters.currentGenre,
      currentSort: filters.currentSort,
      genres: [...new Set(allMovies.map((movie) => movie.genre))].sort((a, b) =>
        a.localeCompare(b, 'zh-Hans-CN')
      ),
      loading,
      error,
      searchTerm: filters.searchTerm
    };
  }

  private applySort(movies: Movie[], currentSort: string): Movie[] {
    if (currentSort === 'rating') {
      return [...movies].sort((a, b) => b.rating - a.rating);
    }

    if (currentSort === 'year') {
      return [...movies].sort(
        (a, b) => b.releaseDate.getTime() - a.releaseDate.getTime()
      );
    }

    return movies;
  }

  private getCurrentListRoute(): string[] {
    return this.currentGenre ? ['/movies/genre', this.currentGenre] : ['/movies'];
  }

  private buildQueryParams(searchTerm: string, sortValue: string): Record<string, string> {
    const params: Record<string, string> = {};
    const keyword = searchTerm.trim();

    if (keyword) {
      params['search'] = keyword;
    }

    if (sortValue && sortValue !== 'default') {
      params['sort'] = sortValue;
    }

    return params;
  }

  private formatError(error: unknown): string {
    return error instanceof Error ? error.message : '电影列表加载失败，请稍后重试。';
  }
}
