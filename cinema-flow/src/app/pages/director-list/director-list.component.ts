import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
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

  readonly directors$ = this.directorService.getDirectors();

  protected trackByDirectorId(_: number, director: Director): number {
    return director.id;
  }
}
