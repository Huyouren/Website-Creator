import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { filter } from 'rxjs/operators';

interface BreadcrumbItem {
  label: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss'
})
export class BreadcrumbComponent {
  private readonly router = inject(Router);

  protected breadcrumbs: BreadcrumbItem[] = [];

  private readonly routeLabels: Record<string, string> = {
    home: '主页面',
    dashboard: '首页',
    movies: '电影列表',
    add: '添加电影',
    about: '关于'
  };

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        this.breadcrumbs = this.buildBreadcrumbs();
      });

    this.breadcrumbs = this.buildBreadcrumbs();
  }

  private buildBreadcrumbs(): BreadcrumbItem[] {
    const urlWithoutQuery = this.router.url.split('?')[0] ?? '';
    const segments = urlWithoutQuery.split('/').filter((segment) => segment);
    const breadcrumbs: BreadcrumbItem[] = [];
    let currentUrl = '';

    for (const segment of segments) {
      currentUrl += `/${segment}`;
      const label = /^\d+$/.test(segment)
        ? '详情'
        : this.routeLabels[segment] ?? decodeURIComponent(segment);
      breadcrumbs.push({ label, url: currentUrl });
    }

    return breadcrumbs;
  }
}
