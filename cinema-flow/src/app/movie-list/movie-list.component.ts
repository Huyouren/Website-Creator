import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Movie } from '../models/movie';
import { MOCK_MOVIES } from '../mock-movies';
import { MovieDetailComponent } from '../movie-detail/movie-detail.component';
import { MovieStatsComponent } from '../movie-stats/movie-stats.component';

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MovieDetailComponent, MovieStatsComponent],
  templateUrl: './movie-list.component.html',
  styleUrl: './movie-list.component.scss'
})
export class MovieListComponent {
  movies: Movie[] = MOCK_MOVIES;
  selectedMovie?: Movie;

  onSelect(movie: Movie): void {
    this.selectedMovie = movie;
  }
}