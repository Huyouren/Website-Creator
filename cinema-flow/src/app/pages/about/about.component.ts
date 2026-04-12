import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { combineLatest, map } from 'rxjs';
import { MessageService } from '../../services/message.service';
import { MovieStateService } from '../../services/movie-state.service';

interface ServiceMeta {
  name: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatListModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutPageComponent {
  private readonly movieStateService = inject(MovieStateService);
  private readonly messageService = inject(MessageService);

  private readonly services: ServiceMeta[] = [
    {
      name: 'MovieService',
      icon: 'movie',
      description: '负责提供 Observable 形式的电影数据访问接口。'
    },
    {
      name: 'MovieStateService',
      icon: 'hub',
      description: '使用 BehaviorSubject 维护全局电影状态，实现跨页面同步。'
    },
    {
      name: 'MessageService',
      icon: 'chat',
      description: '统一记录服务调用日志，并在右下角消息面板中实时展示。'
    }
  ];

  readonly viewModel$ = combineLatest([
    this.movieStateService.stats$,
    this.movieStateService.loading$,
    this.movieStateService.error$,
    this.movieStateService.visitedIds$,
    this.messageService.latestMessage$
  ]).pipe(
    map(([stats, loading, error, visitedIds, latestMessage]) => ({
      services: this.services,
      latestMessage,
      loading,
      error,
      totalMovies: stats.totalMovies,
      watchedMovies: stats.watchedMovies,
      averageRating: stats.averageRating,
      visitedCount: visitedIds.length
    }))
  );
}
