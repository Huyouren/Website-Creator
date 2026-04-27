import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import {
  Observable,
  Subject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  startWith,
  switchMap,
  tap
} from 'rxjs';
import { Movie } from '../../models/movie';
import { MovieService } from '../../services/movie.service';

@Component({
  selector: 'app-movie-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './movie-search.component.html',
  styleUrl: './movie-search.component.scss'
})
export class MovieSearchComponent {
  private readonly movieService = inject(MovieService);
  private readonly searchTerms = new Subject<string>();

  protected searchKeyword = '';
  protected loading = false;
  protected error = '';
  protected lastQuery = '';
  protected hasSearched = false;

  readonly results$: Observable<Movie[]> = this.searchTerms.pipe(
    map((keyword) => keyword.trim()),
    debounceTime(300),
    distinctUntilChanged(),
    tap((keyword) => {
      this.lastQuery = keyword;
      this.hasSearched = keyword.length > 0;
      this.loading = keyword.length > 0;
      this.error = '';
    }),
    switchMap((keyword) => {
      if (!keyword) {
        this.loading = false;
        return of<Movie[]>([]);
      }

      return this.movieService.getMovies({ title: keyword }).pipe(
        tap(() => {
          this.loading = false;
        }),
        catchError((error: unknown) => {
          this.loading = false;
          this.error = this.formatError(error);
          return of<Movie[]>([]);
        })
      );
    }),
    startWith([])
  );

  protected onSearchInput(value: string): void {
    this.searchKeyword = value;
    this.searchTerms.next(value);
  }

  protected clearSearch(): void {
    this.searchKeyword = '';
    this.lastQuery = '';
    this.hasSearched = false;
    this.error = '';
    this.loading = false;
    this.searchTerms.next('');
  }

  private formatError(error: unknown): string {
    return error instanceof Error ? error.message : '搜索失败，请稍后重试。';
  }
}
