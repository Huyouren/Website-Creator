import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';
import { Director } from '../models/director';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root'
})
export class DirectorService {
  private readonly messageService = inject(MessageService);

  private readonly directors: Director[] = [
    {
      id: 1,
      name: 'Frank Darabont',
      nationality: '美国',
      birthYear: 1959,
      bio: '以细腻的人性刻画和文学改编见长，代表作包括《The Shawshank Redemption》《The Green Mile》。'
    },
    {
      id: 2,
      name: 'Hayao Miyazaki',
      nationality: '日本',
      birthYear: 1941,
      bio: '吉卜力工作室代表人物，以童话想象力与环保主题塑造了多部经典动画长片。'
    },
    {
      id: 3,
      name: 'Christopher Nolan',
      nationality: '英国 / 美国',
      birthYear: 1970,
      bio: '擅长非线性叙事、时间结构和大银幕奇观，是当代最具辨识度的作者导演之一。'
    },
    {
      id: 4,
      name: 'Bong Joon-ho',
      nationality: '韩国',
      birthYear: 1969,
      bio: '以类型混搭、社会批判和黑色幽默闻名，作品常在娱乐性与现实议题之间取得平衡。'
    },
    {
      id: 5,
      name: 'George Miller',
      nationality: '澳大利亚',
      birthYear: 1945,
      bio: '《Mad Max》系列缔造者，擅长打造节奏凌厉、视觉调度极强的动作电影。'
    },
    {
      id: 6,
      name: 'Damien Chazelle',
      nationality: '美国',
      birthYear: 1985,
      bio: '以音乐、青春与理想主义题材见长，镜头语言充满节奏感与舞台感。'
    }
  ];

  getDirectors(): Observable<Director[]> {
    return of(this.directors).pipe(
      delay(200),
      map((directors) => directors.map((director) => ({ ...director }))),
      tap((directors) =>
        this.messageService.add(`DirectorService: 已加载 ${directors.length} 位导演`)
      )
    );
  }

  getDirectorById(id: number): Observable<Director | undefined> {
    return of(this.directors.find((director) => director.id === id)).pipe(
      delay(150),
      map((director) => (director ? { ...director } : undefined)),
      tap((director) =>
        this.messageService.add(
          director
            ? `DirectorService: 查询到导演 ${director.name}`
            : `DirectorService: id=${id} 未找到`
        )
      )
    );
  }
}
