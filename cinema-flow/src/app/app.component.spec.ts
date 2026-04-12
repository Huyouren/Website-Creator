import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { MovieStateService } from './services/movie-state.service';

describe('AppComponent', () => {
  let movieStateServiceSpy: jasmine.SpyObj<MovieStateService>;

  beforeEach(async () => {
    movieStateServiceSpy = jasmine.createSpyObj<MovieStateService>('MovieStateService', [
      'load'
    ]);

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        { provide: MovieStateService, useValue: movieStateServiceSpy }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should trigger an initial movie-state load', () => {
    TestBed.createComponent(AppComponent);
    expect(movieStateServiceSpy.load).toHaveBeenCalled();
  });

  it('should render app brand', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.brand')?.textContent).toContain('CinemaFlow');
  });
});
