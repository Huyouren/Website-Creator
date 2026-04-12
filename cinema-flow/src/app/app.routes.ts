import { Routes } from '@angular/router';
import { movieDetailGuard } from './guards/movie-detail.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
    title: 'CinemaFlow - 首页'
  },
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
    path: 'movies/:id',
    canActivate: [movieDetailGuard],
    loadComponent: () =>
      import('./pages/movie-detail/movie-detail.component').then(
        (m) => m.MovieDetailPageComponent
      ),
    title: 'CinemaFlow - 电影详情'
  },
  {
    path: 'add',
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
  { path: '**', redirectTo: '/home' }
];
