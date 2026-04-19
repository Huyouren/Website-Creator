import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, DestroyRef, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';
import { filter } from 'rxjs/operators';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { MessagePanelComponent } from './components/message-panel/message-panel.component';
import { AuthService } from './services/auth.service';
import { MessageService } from './services/message.service';
import { MovieStateService } from './services/movie-state.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    BreadcrumbComponent,
    MessagePanelComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  protected readonly authService = inject(AuthService);
  protected readonly isLoggedIn$ = this.authService.isLoggedIn$;

  private readonly destroyRef = inject(DestroyRef);
  private readonly movieStateService = inject(MovieStateService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  constructor() {
    this.movieStateService.load();

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event) => {
        this.messageService.add(`Router: 导航至 ${event.urlAfterRedirects}`);
      });
  }

  protected showLogin(): void {
    const username = window.prompt('请输入用户名（admin）');

    if (username === null) {
      return;
    }

    const password = window.prompt('请输入密码（admin）');

    if (password === null) {
      return;
    }

    const success = this.authService.login(username.trim(), password.trim());

    if (!success) {
      window.alert('登录失败，请使用 admin / admin。');
    }
  }

  protected logout(): void {
    this.authService.logout();
  }
}
