import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { MovieDraft } from '../../models/movie';
import { MovieStateService } from '../../services/movie-state.service';

@Component({
  selector: 'app-movie-add-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatIconModule
  ],
  templateUrl: './movie-add.component.html',
  styleUrl: './movie-add.component.scss'
})
export class MovieAddPageComponent {
  private readonly movieStateService = inject(MovieStateService);
  private readonly router = inject(Router);

  protected newMovie: MovieDraft = this.createInitialMovie();
  protected saving = false;
  protected errorMsg = '';

  protected onSubmit(): void {
    if (this.saving) {
      return;
    }

    const normalizedTitle = this.newMovie.title.trim();
    const normalizedDirector = this.newMovie.director.trim();

    if (!normalizedTitle || !normalizedDirector) {
      this.errorMsg = '请先填写电影名称和导演。';
      return;
    }

    this.errorMsg = '';
    this.saving = true;

    this.movieStateService
      .addMovie({
        ...this.newMovie,
        title: normalizedTitle,
        director: normalizedDirector,
        posterUrl: this.newMovie.posterUrl.trim()
      })
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: (createdMovie) => {
          void this.router.navigate(['/movies', createdMovie.id]);
        },
        error: () => {
          this.errorMsg = '添加失败，请稍后重试。';
        }
      });
  }

  protected resetForm(): void {
    this.errorMsg = '';
    this.newMovie = this.createInitialMovie();
  }

  private createInitialMovie(): MovieDraft {
    return {
      title: '',
      director: '',
      releaseDate: new Date(),
      rating: 7,
      isWatched: false,
      posterUrl: ''
    };
  }
}
