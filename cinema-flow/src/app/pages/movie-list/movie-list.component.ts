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
import { combineLatest, finalize, map, tap } from 'rxjs';
import { RatingLevelPipe } from '../../pipes/rating-level.pipe';
import { MovieStateService } from '../../services/movie-state.service';

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

  readonly viewModel$ = combineLatest([
    this.movieStateService.movies$,
    this.route.paramMap,
    this.route.queryParamMap,
    this.movieStateService.loading$,
    this.movieStateService.error$
  ]).pipe(
    map(([movies, paramMap, queryParamMap, loading, error]) => {
      const currentGenre = paramMap.get('genre')?.trim() ?? '';
      const searchTerm = queryParamMap.get('search')?.trim() ?? '';
      const currentSort = queryParamMap.get('sort')?.trim() ?? 'default';
      const loweredTerm = searchTerm.toLowerCase();
      const genres = [...new Set(movies.map((movie) => movie.genre))].sort((a, b) =>
        a.localeCompare(b, 'zh-Hans-CN')
      );

      let filteredMovies = movies;

      if (currentGenre) {
        filteredMovies = filteredMovies.filter((movie) => movie.genre === currentGenre);
      }

      if (loweredTerm) {
        filteredMovies = filteredMovies.filter(
          (movie) =>
            movie.title.toLowerCase().includes(loweredTerm) ||
            movie.director.toLowerCase().includes(loweredTerm) ||
            movie.genre.toLowerCase().includes(loweredTerm)
        );
      }

      if (currentSort === 'rating') {
        filteredMovies = [...filteredMovies].sort((a, b) => b.rating - a.rating);
      } else if (currentSort === 'year') {
        filteredMovies = [...filteredMovies].sort(
          (a, b) => b.releaseDate.getTime() - a.releaseDate.getTime()
        );
      }

      return {
        filteredMovies,
        currentGenre,
        currentSort,
        genres,
        loading,
        error,
        searchTerm
      };
    }),
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
}
