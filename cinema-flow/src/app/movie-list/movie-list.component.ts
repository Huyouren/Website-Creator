import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Movie } from '../models/movie';
import { MovieDetailComponent } from '../movie-detail/movie-detail.component';
import { MovieStatsComponent } from '../movie-stats/movie-stats.component';
import { MovieService } from '../services/movie.service';
import { MovieFormComponent } from '../components/movie-form/movie-form.component';
import { MovieSearchComponent } from '../components/movie-search/movie-search.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MovieDetailComponent,
    MovieStatsComponent,
    MovieFormComponent,
    MovieSearchComponent
  ],
  templateUrl: './movie-list.component.html',
  styleUrl: './movie-list.component.scss'
})
export class MovieListComponent {
  movies$: Observable<Movie[]>;
  selectedMovie?: Movie;
  filteredMovies: Movie[] | null = null;

  // 依赖注入
  constructor(private movieService: MovieService) {
    this.movies$ = this.movieService.movies$;
  }

  onSelect(movie: Movie): void {
    this.selectedMovie = movie;
  }

  onDelete(movie: Movie, event: Event): void {
    event.stopPropagation();
    if (confirm(`确定要删除《${movie.title}》吗？`)) {
      this.movieService.deleteMovie(movie.id);
      if (this.selectedMovie?.id === movie.id) {
        this.selectedMovie = undefined;
      }
    }
  }

  onSearchResults(results: Movie[] | null): void {
    this.filteredMovies = results;
  }

  getDisplayMovies(allMovies: Movie[] | null): Movie[] {
    return this.filteredMovies || allMovies || [];
  }

  getWatchStatusIcon(status?: string): string {
    const iconMap: any = {
      'want': 'bookmark_border',
      'watching': 'play_circle_outline',
      'watched': 'check_circle'
    };
    return status ? iconMap[status] : '';
  }

  getWatchStatusClass(status?: string): string {
    return status ? `status-${status}` : '';
  }
}