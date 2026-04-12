import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MovieDraft } from '../models/movie';
import { MessageService } from './message.service';
import { MovieService } from './movie.service';

describe('MovieService', () => {
  let service: MovieService;
  let messageService: MessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MovieService);
    messageService = TestBed.inject(MessageService);
    messageService.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return movies through an observable', fakeAsync(() => {
    let moviesLength = 0;

    service.getMovies().subscribe((movies) => {
      moviesLength = movies.length;
    });

    tick(180);
    expect(moviesLength).toBeGreaterThan(0);
  }));

  it('should add a movie and keep the state in memory', fakeAsync(() => {
    const newMovie: MovieDraft = {
      title: 'Arrival',
      director: 'Denis Villeneuve',
      releaseDate: new Date('2016-09-01'),
      rating: 8.6,
      isWatched: true,
      posterUrl: 'https://example.com/arrival.jpg'
    };

    let createdId = 0;
    service.addMovie(newMovie).subscribe((createdMovie) => {
      createdId = createdMovie.id;
    });

    tick(160);
    expect(createdId).toBeGreaterThan(0);

    let titles: string[] = [];
    service.getMovies().subscribe((movies) => {
      titles = movies.map((movie) => movie.title);
    });

    tick(180);
    expect(titles).toContain('Arrival');
  }));

  it('should write operation logs into MessageService', fakeAsync(() => {
    service.getMovies().subscribe();

    tick(180);
    expect(messageService.messages.length).toBeGreaterThan(0);
    expect(messageService.messages[0]).toContain('MovieService');
  }));
});
