import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { MovieService } from '../services/movie.service';

export const movieDetailGuard: CanActivateFn = (route) => {
  const movieService = inject(MovieService);
  const router = inject(Router);
  const id = Number(route.paramMap.get('id'));

  if (Number.isNaN(id)) {
    return of(router.createUrlTree(['/movies']));
  }

  return movieService.getMovieById(id).pipe(
    map((movie) => (movie ? true : router.createUrlTree(['/movies']))),
    catchError(() => of(router.createUrlTree(['/movies'])))
  );
};
