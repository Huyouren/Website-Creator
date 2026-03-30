import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Movie } from '../../models/movie';
import { RatingLevelPipe } from '../../pipes/rating-level.pipe';
import { MovieService } from '../../services/movie.service';

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
export class MovieListPageComponent implements OnInit {
  private readonly movieService = inject(MovieService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected movies: Movie[] = [];
  protected filteredMovies: Movie[] = [];
  protected searchTerm = '';
  protected readonly displayedColumns = [
    'title',
    'director',
    'rating',
    'status',
    'actions'
  ];

  ngOnInit(): void {
    this.movies = this.movieService.getMovies();

    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.searchTerm = params.get('search')?.trim() ?? '';
        this.applyFilter();
      });
  }

  protected onSearch(): void {
    const keyword = this.searchTerm.trim();
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

    this.movieService.deleteMovie(id);
    this.movies = this.movieService.getMovies();
    this.applyFilter();
  }

  private applyFilter(): void {
    if (!this.searchTerm) {
      this.filteredMovies = this.movies;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredMovies = this.movies.filter(
      (movie) =>
        movie.title.toLowerCase().includes(term) ||
        movie.director.toLowerCase().includes(term)
    );
  }
}
