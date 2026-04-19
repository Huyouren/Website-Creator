import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { combineLatest, map } from 'rxjs';
import { AuthService } from '../../services/auth.service';
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
  private readonly authService = inject(AuthService);
  private readonly movieStateService = inject(MovieStateService);
  private readonly messageService = inject(MessageService);
  private readonly routeTopology = `
/                     → 重定向到 /dashboard
/dashboard            → DashboardComponent（仪表盘）
/movies               → MovieListPageComponent（全部电影）
/movies/genre/:genre  → MovieListPageComponent（分类筛选）
/movies/:id           → MovieDetailPageComponent（电影详情）
/directors            → DirectorListPageComponent（导演库）
/directors/:id        → DirectorDetailPageComponent（导演详情）
/add                  → MovieAddPageComponent（添加电影，受 authGuard 保护）
/about                → AboutPageComponent（关于）
/**                   → NotFoundPageComponent（404 页面）
`.trim();

  private readonly services: ServiceMeta[] = [
    {
      name: 'MovieService',
      icon: 'movie',
      description: '负责提供 Observable 形式的电影数据访问接口。'
    },
    {
      name: 'DirectorService',
      icon: 'person_search',
      description: '提供导演实体查询能力，并为导演列表、详情和仪表盘卡片提供数据。'
    },
    {
      name: 'AuthService',
      icon: 'lock',
      description: '维护登录状态，为添加电影页面的路由守卫提供认证依据。'
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
    this.messageService.latestMessage$,
    this.authService.isLoggedIn$
  ]).pipe(
    map(([stats, loading, error, visitedIds, latestMessage, isLoggedIn]) => ({
      services: this.services,
      routeTopology: this.routeTopology,
      latestMessage,
      loading,
      error,
      isLoggedIn,
      totalMovies: stats.totalMovies,
      watchedMovies: stats.watchedMovies,
      averageRating: stats.averageRating,
      visitedCount: visitedIds.length
    }))
  );
}
