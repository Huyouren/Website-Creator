import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { Router, RouterLink } from '@angular/router';
import { Movie } from '../../models/movie';
import { MovieService } from '../../services/movie.service';

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
  private readonly movieService = inject(MovieService);
  private readonly router = inject(Router);

  protected newMovie: Omit<Movie, 'id'> = this.createInitialMovie();

  protected onSubmit(): void {
    const normalizedTitle = this.newMovie.title.trim();
    const normalizedDirector = this.newMovie.director.trim();

    if (!normalizedTitle || !normalizedDirector) {
      return;
    }

    this.movieService.addMovie({
      ...this.newMovie,
      title: normalizedTitle,
      director: normalizedDirector,
      posterUrl: this.newMovie.posterUrl.trim()
    });

    void this.router.navigate(['/movies']);
  }

  protected resetForm(): void {
    this.newMovie = this.createInitialMovie();
  }

  private createInitialMovie(): Omit<Movie, 'id'> {
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
