import { Movie } from './models/movie';

// Reminder: JavaScript Date month is zero-based (0 = January).
export const MOCK_MOVIES: Movie[] = [
  {
    id: 1,
    title: 'The Shawshank Redemption',
    releaseDate: new Date(1994, 8, 23),
    director: 'Frank Darabont',
    rating: 9.7,
    isWatched: true,
    posterUrl: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg'
  },
  {
    id: 2,
    title: 'Spirited Away',
    releaseDate: new Date(2001, 6, 20),
    director: 'Hayao Miyazaki',
    rating: 9.2,
    isWatched: true,
    posterUrl: 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg'
  },
  {
    id: 3,
    title: 'Interstellar',
    releaseDate: new Date(2014, 10, 7),
    director: 'Christopher Nolan',
    rating: 9.0,
    isWatched: false,
    posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg'
  },
  {
    id: 4,
    title: 'Parasite',
    releaseDate: new Date(2019, 4, 30),
    director: 'Bong Joon-ho',
    rating: 8.8,
    isWatched: true,
    posterUrl: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg'
  },
  {
    id: 5,
    title: 'Mad Max: Fury Road',
    releaseDate: new Date(2015, 4, 15),
    director: 'George Miller',
    rating: 8.5,
    isWatched: false,
    posterUrl: 'https://image.tmdb.org/t/p/w500/hA2ple9q4qnwxp3hKVNhroipsir.jpg'
  },
  {
    id: 6,
    title: 'La La Land',
    releaseDate: new Date(2016, 11, 9),
    director: 'Damien Chazelle',
    rating: 8.1,
    isWatched: true,
    posterUrl: 'https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg'
  }
];