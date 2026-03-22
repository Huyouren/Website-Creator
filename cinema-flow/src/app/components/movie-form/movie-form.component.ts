import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Movie } from '../../models/movie';
import { MovieService } from '../../services/movie.service';

@Component({
  selector: 'app-movie-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule
  ],
  templateUrl: './movie-form.component.html',
  styleUrl: './movie-form.component.scss'
})
export class MovieFormComponent {
  newMovie = {
    title: '',
    director: '',
    releaseDate: new Date(),
    rating: 5,
    isWatched: false,
    posterUrl: ''
  };

  constructor(private movieService: MovieService) {}

  onSubmit(): void {
    if (this.newMovie.title && this.newMovie.director) {
      this.movieService.addMovie(this.newMovie);
      this.resetForm();
      alert('电影添加成功！');
    } else {
      alert('请填写电影名称和导演');
    }
  }

  resetForm(): void {
    this.newMovie = {
      title: '',
      director: '',
      releaseDate: new Date(),
      rating: 5,
      isWatched: false,
      posterUrl: ''
    };
  }
}
