import { CommonModule, Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, combineLatest, finalize, map, of, tap } from 'rxjs';
import { Movie } from '../../models/movie';
import { RatingLevelPipe } from '../../pipes/rating-level.pipe';
import { MovieStateService } from '../../services/movie-state.service';

interface DetailViewModel {
  id: number | null;
  movie?: Movie;
  prevMovieId?: number;
  nextMovieId?: number;
  loading: boolean;
  error: string | null;
}

@Component({
  selector: 'app-movie-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSliderModule,
    MatSlideToggleModule,
    RatingLevelPipe
  ],
  templateUrl: './movie-detail.component.html',
  styleUrl: './movie-detail.component.scss'
})
export class MovieDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly movieStateService = inject(MovieStateService);
  private readonly location = inject(Location);

  protected readonly fallbackPoster =
    'https://placehold.co/400x600/0f1e33/e7efff?text=CinemaFlow';

  protected deleting = false;
  protected actionError = '';
  protected editing = false;
  protected savingEdit = false;
  protected editError = '';
  protected editDraft?: Movie;

  readonly viewModel$ = combineLatest([
    this.route.paramMap,
    this.movieStateService.movies$,
    this.movieStateService.loading$,
    this.movieStateService.error$
  ]).pipe(
    map(([params, movies, loading, error]): DetailViewModel => {
      const id = Number(params.get('id'));

      if (Number.isNaN(id)) {
        return {
          id: null,
          movie: undefined,
          prevMovieId: undefined,
          nextMovieId: undefined,
          loading: false,
          error: '当前电影编号无效。'
        };
      }

      const currentIndex = movies.findIndex((item) => item.id === id);
      const movie = currentIndex >= 0 ? this.cloneMovie(movies[currentIndex]) : undefined;

      return {
        id,
        movie,
        prevMovieId: currentIndex > 0 ? movies[currentIndex - 1]?.id : undefined,
        nextMovieId:
          currentIndex >= 0 && currentIndex < movies.length - 1
            ? movies[currentIndex + 1]?.id
            : undefined,
        loading,
        error
      };
    }),
    tap((viewModel) => {
      if (viewModel.movie) {
        this.movieStateService.markAsVisited(viewModel.movie.id);
      }

      if (this.editing && viewModel.movie && this.editDraft?.id === viewModel.movie.id) {
        this.editDraft = this.cloneMovie(viewModel.movie);
      }
    }),
    catchError(() =>
      of<DetailViewModel>({
        id: null,
        movie: undefined,
        prevMovieId: undefined,
        nextMovieId: undefined,
        loading: false,
        error: '详情页加载失败，请稍后重试。'
      })
    )
  );

  protected goBack(): void {
    this.location.back();
  }

  protected startEdit(movie: Movie): void {
    this.actionError = '';
    this.editError = '';
    this.editing = true;
    this.editDraft = this.cloneMovie(movie);
  }

  protected cancelEdit(): void {
    this.editing = false;
    this.savingEdit = false;
    this.editError = '';
    this.editDraft = undefined;
  }

  protected saveEdit(movieId: number): void {
    if (!this.editDraft || this.savingEdit) {
      return;
    }

    const normalizedTitle = this.editDraft.title.trim();
    const normalizedDirector = this.editDraft.director.trim();

    if (!normalizedTitle || !normalizedDirector) {
      this.editError = '请先填写电影名称和导演。';
      return;
    }

    this.editError = '';
    this.savingEdit = true;

    this.movieStateService
      .updateMovie({
        ...this.editDraft,
        id: movieId,
        title: normalizedTitle,
        director: normalizedDirector,
        posterUrl: this.editDraft.posterUrl.trim()
      })
      .pipe(finalize(() => (this.savingEdit = false)))
      .subscribe({
        next: (updatedMovie) => {
          this.editDraft = this.cloneMovie(updatedMovie);
          this.editing = false;
        },
        error: () => {
          this.editError = '更新失败，请稍后重试。';
        }
      });
  }

  protected deleteMovie(movieId: number, title: string): void {
    if (!confirm(`确定要删除《${title}》吗？`)) {
      return;
    }

    this.actionError = '';
    this.deleting = true;
    this.cancelEdit();

    this.movieStateService
      .deleteMovie(movieId)
      .pipe(finalize(() => (this.deleting = false)))
      .subscribe({
        next: () => {
          void this.router.navigate(['/movies']);
        },
        error: () => {
          this.actionError = '删除失败，请稍后重试。';
        }
      });
  }

  private cloneMovie(movie: Movie): Movie {
    return {
      ...movie,
      releaseDate: new Date(movie.releaseDate),
      comments: movie.comments?.map((comment) => ({
        ...comment,
        createdAt: new Date(comment.createdAt)
      }))
    };
  }
}
