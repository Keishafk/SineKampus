import { Platform } from 'react-native';
import { resolvePoster } from '../data/posterAssets';

// Android emulators use a special address to reach the development computer.
// Web, iOS Simulator, and desktop development can use localhost.
const developmentHost = Platform.select({
  android: '10.0.2.2',
  default: 'localhost',
});

// EXPO_PUBLIC_API_URL takes priority when it is defined in the root .env file.
// Removing the final slash prevents URLs such as http://host:4000//api/films.
export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? `http://${developmentHost}:4000`
).replace(/\/$/, '');

// Convert the API response into the single shape expected by every screen.
// Keeping this conversion here prevents UI components from knowing database details.
function normalizeFilm(film) {
  // Older data may contain one comma-separated genre; newer data returns an array.
  const genres = film.genres ?? (film.genre ? film.genre.split(',') : []);

  return {
    ...film,
    id: String(film.id),
    year: film.year ?? film.releaseYear,
    department: film.department ?? film.departmentDetails?.name ?? '',
    genres,
    genre: film.genre ?? genres.join(', '),
    link: film.facebookVideoUrl ?? film.link ?? '',
    // resolvePoster changes a poster filename into a bundled React Native image.
    poster: resolvePoster(film),
    tags: film.tags ?? (film.collections ?? []).map((collection) => collection.slug),
  };
}

// Shared request helper for consistent JSON parsing and readable error messages.
async function request(path, signal) {
  // The AbortSignal lets a screen cancel its request when the user leaves it.
  const response = await fetch(`${API_URL}${path}`, { signal });
  // Some server errors may not contain JSON, so parsing failure returns null safely.
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.error?.message ?? `Request failed with status ${response.status}.`);
  }
  return body;
}

// Load the catalog shown by Home and Favorites.
export async function getFilms(signal) {
  const body = await request('/api/films?limit=100', signal);
  return body.data.map(normalizeFilm);
}

// Load the latest details for one selected film.
export async function getFilm(id, signal) {
  const body = await request(`/api/films/${encodeURIComponent(id)}`, signal);
  return normalizeFilm(body.data);
}
