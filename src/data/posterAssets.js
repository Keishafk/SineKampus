// React Native must know local images while bundling the app.
// Add every new file here, then use the same filename in seed.js.
const posterAssets = {
  'ccis.jpg': require('../../assets/posters/ccis.jpg'),
  'ccis2024.jpg': require('../../assets/posters/ccis2024.jpg'),
  'ccis2026.jpg': require('../../assets/posters/ccis2026.jpg'),
  'cat2024.jpg': require('../../assets/posters/cat2024.jpg'),
  'cat2026.jpg': require('../../assets/posters/cat2026.jpg'),
  'ccjs2024.jpg': require('../../assets/posters/ccjs2024.jpg'),
  'ccjs.jpg': require('../../assets/posters/ccjs.jpg'),
  'ccjs2026.jpg': require('../../assets/posters/ccjs2026.jpg'),
  'cea.jpg': require('../../assets/posters/cea.jpg'),
  'cea2024.jpg': require('../../assets/posters/cea2024.jpg'),
  'cea2026.jpg': require('../../assets/posters/cea2026.jpg'),
  'coed.jpg': require('../../assets/posters/coed.jpg'),
  'coed2024.jpg': require('../../assets/posters/coed2024.jpg'),
  'coed2026.jpg': require('../../assets/posters/coed2026.jpg'),
  'com2026.jpg': require('../../assets/posters/com2026.jpg'),
  'con2024.jpg': require('../../assets/posters/con2024.jpg'),
  'con2026.jpg': require('../../assets/posters/con2026.jpg'),
};

export function resolvePoster(film) {
  // Prefer a bundled poster because it works offline and loads immediately.
  if (film.posterAsset && posterAssets[film.posterAsset]) {
    return posterAssets[film.posterAsset];
  }
  // Remote poster URLs are a fallback for films not bundled with the app.
  return film.posterUrl ? { uri: film.posterUrl } : null;
}
