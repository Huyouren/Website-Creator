export interface Comment {
  id: number;
  userId: string;
  userName: string;
  content: string;
  rating: number;
  likes: number;
  createdAt: Date;
}

export interface Movie {
  id: number;
  title: string;
  releaseDate: Date;
  director: string;
  rating: number;
  isWatched: boolean;
  posterUrl: string;
  comments?: Comment[];
}

export type MovieDraft = Omit<Movie, 'id'>;
