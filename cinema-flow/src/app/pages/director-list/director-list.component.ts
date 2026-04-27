import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { catchError, map, of, shareReplay, startWith } from 'rxjs';
import { Director } from '../../models/director';
import { DirectorService } from '../../services/director.service';

@Component({
  selector: 'app-director-list-page',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './director-list.component.html',
  styleUrl: './director-list.component.scss'
})
export class DirectorListPageComponent {
  private readonly directorService = inject(DirectorService);

  readonly viewModel$ = this.directorService.getDirectors().pipe(
    map((directors) => ({
      directors,
      loading: false,
      error: null as string | null
    })),
    startWith({
      directors: [] as Director[],
      loading: true,
      error: null as string | null
    }),
    catchError((error: unknown) =>
      of({
        directors: [] as Director[],
        loading: false,
        error:
          error instanceof Error ? error.message : '导演列表加载失败，请稍后重试。'
      })
    ),
    shareReplay(1)
  );

  protected trackByDirectorId(_: number, director: Director): number {
    return director.id;
  }
}
