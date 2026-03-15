import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ratingLevel',
  standalone: true
})
export class RatingLevelPipe implements PipeTransform {
  transform(rating?: number | null): string {
    if (rating == null) {
      return '未评分';
    }

    if (rating >= 9) {
      return '神作';
    }

    if (rating >= 7.5) {
      return '推荐';
    }

    return '平庸';
  }
}