import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Comment, Movie } from '../../models/movie';
import { MovieService } from '../../services/movie.service';

@Component({
  selector: 'app-movie-comments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './movie-comments.component.html',
  styleUrl: './movie-comments.component.scss'
})
export class MovieCommentsComponent {
  @Input() movie?: Movie;
  
  newComment = {
    userId: 'current_user',
    userName: '当前用户',
    content: '',
    rating: 5
  };

  constructor(private movieService: MovieService) {}

  onSubmitComment(): void {
    if (this.movie && this.newComment.content.trim()) {
      this.movieService.addComment(this.movie.id, this.newComment);
      this.newComment.content = '';
      this.newComment.rating = 5;
    }
  }

  onLikeComment(commentId: number): void {
    if (this.movie) {
      this.movieService.likeComment(this.movie.id, commentId);
    }
  }

  setRating(rating: number): void {
    this.newComment.rating = rating;
  }

  getStarArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }
}
