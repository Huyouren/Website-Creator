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
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { catchError, finalize, of, take } from 'rxjs';
import { Director } from '../../models/director';
import { MovieDraft } from '../../models/movie';
import { DirectorService } from '../../services/director.service';
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
    MatIconModule,
    MatSelectModule
  ],
  templateUrl: './movie-add.component.html',
  styleUrl: './movie-add.component.scss'
})
export class MovieAddPageComponent {
  private readonly directorService = inject(DirectorService);
  private readonly movieStateService = inject(MovieStateService);
  private readonly router = inject(Router);

  protected readonly genres = ['剧情', '动画', '科幻', '动作', '武侠'];
  protected directors: Director[] = [];
  protected newMovie: MovieDraft = this.createInitialMovie();
  protected saving = false;
  protected errorMsg = '';

  constructor() {
    this.directorService
      .getDirectors()
      .pipe(
        take(1),
        catchError((error: unknown) => {
          this.errorMsg =
            error instanceof Error
              ? error.message
              : '导演数据加载失败，请稍后重试。';
          return of([]);
        })
      )
      .subscribe((directors) => {
        this.directors = directors;
        this.onDirectorChange(this.newMovie.directorId);
      });
  }

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
    this.onDirectorChange(this.newMovie.directorId);
  }

  protected onDirectorChange(directorId: number): void {
    const selectedDirector = this.directors.find(
      (director) => director.id === Number(directorId)
    );

    if (!selectedDirector) {
      return;
    }

    this.newMovie.directorId = selectedDirector.id;
    this.newMovie.director = selectedDirector.name;
  }

  private createInitialMovie(): MovieDraft {
    return {
      title: '',
      director: 'Christopher Nolan',
      directorId: 3,
      genre: '科幻',
      releaseDate: new Date(),
      rating: 7,
      isWatched: false,
      posterUrl: ''
    };
  }
}
