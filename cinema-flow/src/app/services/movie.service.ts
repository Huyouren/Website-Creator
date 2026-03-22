import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { Movie } from '../models/movie';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  // 私有数据存储
  private movies: Movie[] = [
    {
      id: 1,
      title: 'The Shawshank Redemption',
      releaseDate: new Date(1994, 8, 23),
      director: 'Frank Darabont',
      rating: 9.7,
      isWatched: true,
      posterUrl: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
      watchStatus: 'watched',
      tags: ['剧情', '犯罪', '经典'],
      summary: '20世纪40年代末，小有成就的青年银行家安迪因涉嫌杀害妻子及她的情人而锒铛入狱。在这座名为肖申克的监狱内，希望似乎虚无缥缈，终身监禁的惩罚无疑注定了安迪接下来灰暗绝望的人生。',
      cast: ['蒂姆·罗宾斯', '摩根·弗里曼', '鲍勃·冈顿'],
      userRating: 5,
      comments: [
        {
          id: 1,
          userId: 'user1',
          userName: '影迷小王',
          content: '经典中的经典，每次重看都有新的感悟。希望是美好的，也许是人间至善，而美好的事物永不消逝。',
          rating: 5,
          createdAt: new Date(2024, 2, 15),
          likes: 128
        }
      ],
      viewCount: 15420
    },
    {
      id: 2,
      title: 'Spirited Away',
      releaseDate: new Date(2001, 6, 20),
      director: 'Hayao Miyazaki',
      rating: 9.2,
      isWatched: true,
      posterUrl: 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
      watchStatus: 'watched',
      tags: ['动画', '奇幻', '冒险', '宫崎骏'],
      summary: '千寻和爸爸妈妈一同驱车前往新家，在郊外的小路上不慎进入了神秘的隧道——他们去到了另外一个诡异世界。',
      cast: ['柊瑠美', '入野自由', '夏木真理'],
      userRating: 5,
      comments: [
        {
          id: 2,
          userId: 'user2',
          userName: '动画爱好者',
          content: '宫崎骏的巅峰之作，每一帧都是艺术品。千寻的成长故事感人至深。',
          rating: 5,
          createdAt: new Date(2024, 1, 20),
          likes: 95
        }
      ],
      viewCount: 12350
    },
    {
      id: 3,
      title: 'Interstellar',
      releaseDate: new Date(2014, 10, 7),
      director: 'Christopher Nolan',
      rating: 9.0,
      isWatched: false,
      posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
      watchStatus: 'want',
      tags: ['科幻', '冒险', '剧情', '诺兰'],
      summary: '在不远的未来，随着地球自然环境的恶化，人类面临着无法生存的威胁。这时科学家们在太阳系中的土星附近发现了一个虫洞，通过它可以打破人类的能力限制，到更遥远外太空寻找延续生命希望的机会。',
      cast: ['马修·麦康纳', '安妮·海瑟薇', '杰西卡·查斯坦'],
      userRating: 0,
      comments: [],
      viewCount: 8920
    },
    {
      id: 4,
      title: 'Parasite',
      releaseDate: new Date(2019, 4, 30),
      director: 'Bong Joon-ho',
      rating: 8.8,
      isWatched: true,
      posterUrl: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
      watchStatus: 'watched',
      tags: ['剧情', '惊悚', '黑色幽默'],
      summary: '韩国首尔，无业游民基宇在好友的推荐下，来到富豪朴社长家应聘家教。朴社长一家对基宇赞赏有加，基宇也趁机让妹妹、父亲、母亲陆续进入朴家工作。',
      cast: ['宋康昊', '李善均', '赵茹珍'],
      userRating: 4,
      comments: [
        {
          id: 3,
          userId: 'user3',
          userName: '电影评论家',
          content: '奉俊昊导演对阶级问题的深刻剖析，黑色幽默与社会批判完美结合。',
          rating: 5,
          createdAt: new Date(2024, 0, 10),
          likes: 156
        }
      ],
      viewCount: 11200
    },
    {
      id: 5,
      title: 'Mad Max: Fury Road',
      releaseDate: new Date(2015, 4, 15),
      director: 'George Miller',
      rating: 8.5,
      isWatched: false,
      posterUrl: 'https://image.tmdb.org/t/p/w500/hA2ple9q4qnwxp3hKVNhroipsir.jpg',
      watchStatus: 'watching',
      tags: ['动作', '科幻', '冒险'],
      summary: '未来世界陷入一片混乱，汽油成为最珍贵的资源。麦克斯被迫与弗瑞奥萨一起逃离暴君的追杀。',
      cast: ['汤姆·哈迪', '查理兹·塞隆', '尼古拉斯·霍尔特'],
      userRating: 4,
      comments: [],
      viewCount: 6780
    },
    {
      id: 6,
      title: 'La La Land',
      releaseDate: new Date(2016, 11, 9),
      director: 'Damien Chazelle',
      rating: 8.1,
      isWatched: true,
      posterUrl: 'https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg',
      watchStatus: 'watched',
      tags: ['爱情', '歌舞', '剧情'],
      summary: '米娅的志向是成为一名演员，但她在片场的咖啡厅里做着咖啡师。塞巴斯蒂安是一名爵士乐钢琴家，他在餐厅演奏维持生计。',
      cast: ['瑞恩·高斯林', '艾玛·斯通', 'J·K·西蒙斯'],
      userRating: 4,
      comments: [
        {
          id: 4,
          userId: 'user4',
          userName: '音乐电影迷',
          content: '美轮美奂的歌舞片，致敬经典好莱坞。结局虽然遗憾但很真实。',
          rating: 4,
          createdAt: new Date(2024, 2, 5),
          likes: 72
        }
      ],
      viewCount: 9450
    }
  ];

  // BehaviorSubject 用于响应式数据流
  private moviesSubject = new BehaviorSubject<Movie[]>(this.movies);
  public movies$ = this.moviesSubject.asObservable();

  constructor(private logger: LoggerService) {
    this.logger.log('MovieService 已初始化');
  }

  // 获取所有电影 (Observable 版本)
  getMovies(): Observable<Movie[]> {
    this.logger.log(`获取所有电影，共 ${this.movies.length} 部`);
    return of(this.movies);
  }

  // 获取所有电影 (同步版本，保持向后兼容)
  getMoviesSync(): Movie[] {
    return this.movies;
  }

  // 根据 ID 获取电影 (Observable 版本)
  getMovieById(id: number): Observable<Movie | undefined> {
    const movie = this.movies.find(movie => movie.id === id);
    if (movie) {
      this.logger.log(`获取电影: ${movie.title} (ID: ${id})`);
    } else {
      this.logger.warn(`未找到 ID 为 ${id} 的电影`);
    }
    return of(movie);
  }

  // 添加新电影
  addMovie(movie: Omit<Movie, 'id'>): void {
    const newId = Math.max(...this.movies.map(m => m.id), 0) + 1;
    this.movies.push({ ...movie, id: newId });
    this.moviesSubject.next(this.movies);
    this.logger.log(`添加新电影: ${movie.title} (ID: ${newId})`);
  }

  // 删除电影
  deleteMovie(id: number): boolean {
    const index = this.movies.findIndex(m => m.id === id);
    if (index > -1) {
      const title = this.movies[index].title;
      this.movies.splice(index, 1);
      this.moviesSubject.next(this.movies);
      this.logger.log(`删除电影: ${title} (ID: ${id})`);
      return true;
    }
    this.logger.warn(`删除失败: 未找到 ID 为 ${id} 的电影`);
    return false;
  }

  // 更新电影
  updateMovie(updatedMovie: Movie): boolean {
    const index = this.movies.findIndex(m => m.id === updatedMovie.id);
    if (index > -1) {
      this.movies[index] = updatedMovie;
      this.moviesSubject.next(this.movies);
      this.logger.log(`更新电影: ${updatedMovie.title} (ID: ${updatedMovie.id})`);
      return true;
    }
    this.logger.warn(`更新失败: 未找到 ID 为 ${updatedMovie.id} 的电影`);
    return false;
  }
}


  // ========== 豆瓣风格功能 ==========

  // 搜索电影
  searchMovies(keyword: string): Observable<Movie[]> {
    const lowerKeyword = keyword.toLowerCase();
    const results = this.movies.filter(movie => 
      movie.title.toLowerCase().includes(lowerKeyword) ||
      movie.director.toLowerCase().includes(lowerKeyword) ||
      movie.tags?.some(tag => tag.toLowerCase().includes(lowerKeyword)) ||
      movie.cast?.some(actor => actor.toLowerCase().includes(lowerKeyword))
    );
    this.logger.log(`搜索关键词 "${keyword}"，找到 ${results.length} 部电影`);
    return of(results);
  }

  // 按标签筛选
  filterByTag(tag: string): Observable<Movie[]> {
    const results = this.movies.filter(movie => 
      movie.tags?.includes(tag)
    );
    this.logger.log(`按标签 "${tag}" 筛选，找到 ${results.length} 部电影`);
    return of(results);
  }

  // 按观看状态筛选
  filterByWatchStatus(status: 'want' | 'watching' | 'watched'): Observable<Movie[]> {
    const results = this.movies.filter(movie => movie.watchStatus === status);
    this.logger.log(`按状态 "${status}" 筛选，找到 ${results.length} 部电影`);
    return of(results);
  }

  // 排序电影
  sortMovies(sortBy: 'rating' | 'date' | 'views', order: 'asc' | 'desc' = 'desc'): Observable<Movie[]> {
    const sorted = [...this.movies].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'rating':
          comparison = a.rating - b.rating;
          break;
        case 'date':
          comparison = a.releaseDate.getTime() - b.releaseDate.getTime();
          break;
        case 'views':
          comparison = (a.viewCount || 0) - (b.viewCount || 0);
          break;
      }
      return order === 'desc' ? -comparison : comparison;
    });
    this.logger.log(`按 ${sortBy} ${order} 排序`);
    return of(sorted);
  }

  // 更新观看状态
  updateWatchStatus(id: number, status: 'want' | 'watching' | 'watched'): boolean {
    const movie = this.movies.find(m => m.id === id);
    if (movie) {
      movie.watchStatus = status;
      this.moviesSubject.next(this.movies);
      this.logger.log(`更新电影 ${movie.title} 的状态为 ${status}`);
      return true;
    }
    return false;
  }

  // 添加评论
  addComment(movieId: number, comment: Omit<Comment, 'id' | 'createdAt' | 'likes'>): boolean {
    const movie = this.movies.find(m => m.id === movieId);
    if (movie) {
      if (!movie.comments) {
        movie.comments = [];
      }
      const newComment: Comment = {
        ...comment,
        id: Math.max(...movie.comments.map(c => c.id), 0) + 1,
        createdAt: new Date(),
        likes: 0
      };
      movie.comments.push(newComment);
      this.moviesSubject.next(this.movies);
      this.logger.log(`为电影 ${movie.title} 添加评论`);
      return true;
    }
    return false;
  }

  // 点赞评论
  likeComment(movieId: number, commentId: number): boolean {
    const movie = this.movies.find(m => m.id === movieId);
    if (movie && movie.comments) {
      const comment = movie.comments.find(c => c.id === commentId);
      if (comment) {
        comment.likes++;
        this.moviesSubject.next(this.movies);
        this.logger.log(`评论 ${commentId} 点赞数 +1`);
        return true;
      }
    }
    return false;
  }

  // 更新用户评分
  updateUserRating(movieId: number, rating: number): boolean {
    const movie = this.movies.find(m => m.id === movieId);
    if (movie) {
      movie.userRating = rating;
      this.moviesSubject.next(this.movies);
      this.logger.log(`更新电影 ${movie.title} 的用户评分为 ${rating} 星`);
      return true;
    }
    return false;
  }

  // 增加浏览次数
  incrementViewCount(movieId: number): void {
    const movie = this.movies.find(m => m.id === movieId);
    if (movie) {
      movie.viewCount = (movie.viewCount || 0) + 1;
      this.moviesSubject.next(this.movies);
    }
  }

  // 获取所有标签
  getAllTags(): string[] {
    const tagsSet = new Set<string>();
    this.movies.forEach(movie => {
      movie.tags?.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }

  // 获取热门电影（按浏览量）
  getPopularMovies(limit: number = 5): Observable<Movie[]> {
    const popular = [...this.movies]
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      .slice(0, limit);
    return of(popular);
  }

  // 获取高分电影
  getTopRatedMovies(limit: number = 5): Observable<Movie[]> {
    const topRated = [...this.movies]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
    return of(topRated);
  }
}
