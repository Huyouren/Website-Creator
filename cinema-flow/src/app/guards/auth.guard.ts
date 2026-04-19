import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MessageService } from '../services/message.service';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const messageService = inject(MessageService);

  if (authService.isLoggedIn) {
    return true;
  }

  messageService.add('AuthGuard: 未登录，已阻止访问 /add');
  return router.createUrlTree(['/dashboard'], {
    queryParams: { loginRequired: true }
  });
};
