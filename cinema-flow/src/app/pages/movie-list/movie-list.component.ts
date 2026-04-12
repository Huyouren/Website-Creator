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
  private readonly movieStateService = inject(MovieStateService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected searchTerm = '';
  protected readonly displayedColumns = [
    'title',
    'director',
    'rating',
    'status',
    'actions'
  ];

  private readonly deletingIds = new Set<number>();

  readonly filteredMovies$ = combineLatest([
    this.movieStateService.movies$,
    this.route.queryParamMap
  ]).pipe(
    tap(([_, params]) => {
      this.searchTerm = params.get('search')?.trim() ?? '';
    }),
    map(([movies, params]) => {
      const term = params.get('search')?.trim().toLowerCase() ?? '';

      if (!term) {
        return movies;
      }

      return movies.filter(
        (movie) =>
          movie.title.toLowerCase().includes(term) ||
          movie.director.toLowerCase().includes(term)
      );
    })
  );

  readonly viewModel$ = combineLatest([
    this.filteredMovies$,
    this.movieStateService.loading$,
    this.movieStateService.error$
  ]).pipe(
    map(([filteredMovies, loading, error]) => ({
      filteredMovies,
      loading,
      error
    }))
  );

  protected onSearchChange(value: string): void {
    const keyword = value.trim();

    void this.router.navigate(['/movies'], {
      queryParams: keyword ? { search: keyword } : {}
    });
  }

  protected clearSearch(): void {
    this.searchTerm = '';
    void this.router.navigate(['/movies']);
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
}
