import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { movieDetailGuard } from './guards/movie-detail.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
    title: 'CinemaFlow - 仪表盘'
  },
  {
    path: 'movies',
    loadComponent: () =>
      import('./pages/movie-list/movie-list.component').then(
        (m) => m.MovieListPageComponent
      ),
    title: 'CinemaFlow - 电影列表'
  },
  {
    path: 'movies/genre/:genre',
    loadComponent: () =>
      import('./pages/movie-list/movie-list.component').then(
        (m) => m.MovieListPageComponent
      ),
    title: 'CinemaFlow - 分类浏览'
  },
  {
    path: 'movies/:id',
    canActivate: [movieDetailGuard],
    loadComponent: () =>
      import('./pages/movie-detail/movie-detail.component').then(
        (m) => m.MovieDetailPageComponent
      ),
    title: 'CinemaFlow - 电影详情'
  },
  {
    path: 'directors',
    loadComponent: () =>
      import('./pages/director-list/director-list.component').then(
        (m) => m.DirectorListPageComponent
      ),
    title: 'CinemaFlow - 导演库'
  },
  {
    path: 'directors/:id',
    loadComponent: () =>
      import('./pages/director-detail/director-detail.component').then(
        (m) => m.DirectorDetailPageComponent
      ),
    title: 'CinemaFlow - 导演详情'
  },
  {
    path: 'add',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/movie-add/movie-add.component').then(
        (m) => m.MovieAddPageComponent
      ),
    title: 'CinemaFlow - 添加电影'
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./pages/about/about.component').then((m) => m.AboutPageComponent),
    title: 'CinemaFlow - 关于'
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then(
        (m) => m.NotFoundPageComponent
      ),
    title: 'CinemaFlow - 404'
  }
];
