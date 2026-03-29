import { CommonModule, Location } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Movie } from '../../models/movie';
import { RatingLevelPipe } from '../../pipes/rating-level.pipe';
import { MovieService } from '../../services/movie.service';

@Component({
  selector: 'app-movie-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    RatingLevelPipe
  ],
  templateUrl: './movie-detail.component.html',
  styleUrl: './movie-detail.component.scss'
})
export class MovieDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly movieService = inject(MovieService);
  private readonly location = inject(Location);
  private readonly destroyRef = inject(DestroyRef);

  protected movie?: Movie;
  protected prevMovieId?: number;
  protected nextMovieId?: number;
  protected readonly fallbackPoster =
    'https://placehold.co/400x600/0f1e33/e7efff?text=CinemaFlow';

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const id = Number(params.get('id'));
        if (Number.isNaN(id)) {
          this.resetState();
          return;
        }

        this.loadMovie(id);
      });
  }

  protected goBack(): void {
    this.location.back();
  }

  protected deleteMovie(): void {
    if (!this.movie || !confirm(`确定要删除《${this.movie.title}》吗？`)) {
      return;
    }

    this.movieService.deleteMovie(this.movie.id);
    void this.router.navigate(['/movies']);
  }

  private loadMovie(id: number): void {
    this.movie = this.movieService.getMovieById(id);
    if (!this.movie) {
      this.prevMovieId = undefined;
      this.nextMovieId = undefined;
      return;
    }

    const movies = this.movieService.getMovies();
    const currentIndex = movies.findIndex((movie) => movie.id === id);
    this.prevMovieId = currentIndex > 0 ? movies[currentIndex - 1]?.id : undefined;
    this.nextMovieId =
      currentIndex < movies.length - 1 ? movies[currentIndex + 1]?.id : undefined;
  }

  private resetState(): void {
    this.movie = undefined;
    this.prevMovieId = undefined;
    this.nextMovieId = undefined;
  }
}
