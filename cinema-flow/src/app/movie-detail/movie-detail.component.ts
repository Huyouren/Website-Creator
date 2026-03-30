import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Movie } from '../models/movie';
import { RatingLevelPipe } from '../pipes/rating-level.pipe';
import { MovieService } from '../services/movie.service';
import { MovieCommentsComponent } from '../components/movie-comments/movie-comments.component';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    RatingLevelPipe,
    MovieCommentsComponent
  ],
  templateUrl: './movie-detail.component.html',
  styleUrl: './movie-detail.component.scss'
})
export class MovieDetailComponent implements OnChanges {
  @Input() movie?: Movie;
  isEditMode = false;
  editedMovie?: Movie;

  constructor(private movieService: MovieService) {}

  ngOnChanges(): void {
    // 当选中新电影时，增加浏览次数
    if (this.movie) {
      this.movieService.incrementViewCount(this.movie.id);
    }
  }

  toggleEditMode(): void {
    if (!this.movie) return;
    
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode) {
      this.editedMovie = { ...this.movie };
    }
  }

  saveChanges(): void {
    if (this.editedMovie) {
      this.movieService.updateMovie(this.editedMovie);
      this.movie = this.editedMovie;
      this.isEditMode = false;
      alert('电影信息已更新！');
    }
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.editedMovie = undefined;
  }

  updateWatchStatus(status: 'want' | 'watching' | 'watched'): void {
    if (this.movie) {
      this.movieService.updateWatchStatus(this.movie.id, status);
    }
  }

  rateMovie(rating: number): void {
    if (this.movie) {
      this.movieService.updateUserRating(this.movie.id, rating);
    }
  }

  getStarArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }

  getWatchStatusText(status?: string): string {
    const statusMap: any = {
      'want': '想看',
      'watching': '在看',
      'watched': '看过'
    };
    return status ? statusMap[status] : '未标记';
  }
}