import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MessageService } from '../../services/message.service';

@Component({
  selector: 'app-message-panel',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <ng-container *ngIf="messageService.messages$ | async as messages">
      <aside class="message-panel" *ngIf="messages.length">
        <header>
          <div class="title-wrap">
            <mat-icon>chat</mat-icon>
            <div>
              <strong>服务消息</strong>
              <p>最多保留最近 20 条服务日志</p>
            </div>
          </div>

          <button
            mat-icon-button
            type="button"
            aria-label="清空服务消息"
            (click)="messageService.clear()"
          >
            <mat-icon>close</mat-icon>
          </button>
        </header>

        <ul>
          <li *ngFor="let message of messages">{{ message }}</li>
        </ul>
      </aside>
    </ng-container>
  `,
  styles: [
    `
      .message-panel {
        position: fixed;
        right: 16px;
        bottom: 16px;
        z-index: 2000;
        width: min(360px, calc(100vw - 24px));
        max-height: 260px;
        overflow-y: auto;
        padding: 12px;
        border-radius: 16px;
        border: 1px solid rgba(255, 214, 140, 0.22);
        background:
          radial-gradient(circle at 90% -20%, rgba(255, 196, 94, 0.22), transparent 42%),
          rgba(17, 14, 10, 0.96);
        box-shadow: 0 18px 32px rgba(0, 0, 0, 0.34);
        backdrop-filter: blur(16px);
      }

      header {
        display: flex;
        align-items: start;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 10px;
      }

      .title-wrap {
        display: flex;
        gap: 8px;
        align-items: start;
      }

      .title-wrap strong {
        display: block;
        color: #ffe4b1;
      }

      .title-wrap p {
        margin: 2px 0 0;
        color: #bfa57a;
        font-size: 0.78rem;
      }

      ul {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 8px;
      }

      li {
        padding: 8px 10px;
        border-radius: 10px;
        border: 1px solid rgba(255, 214, 140, 0.12);
        background: rgba(255, 214, 140, 0.05);
        color: #f0dcc0;
        font-size: 0.82rem;
        line-height: 1.5;
      }
    `
  ]
})
export class MessagePanelComponent {
  readonly messageService = inject(MessageService);
}
