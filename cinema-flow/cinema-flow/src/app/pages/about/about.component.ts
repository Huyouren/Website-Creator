import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatListModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutPageComponent {}
