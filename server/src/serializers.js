// Convert a Prisma Film record into the simpler JSON shape used by the app.
// Keeping this conversion in one place prevents every API route from having
// to repeat the same field-renaming and URL-building logic.
export function serializeFilm(film, req) {
  // Prisma returns genres through the FilmGenre join table. This extracts
  // only their readable names, for example: ['Drama', 'Comedy'].
  const genreNames = film.genres.map(({ genre }) => genre.name);

  // Collections are exposed as short tags so the mobile app can easily decide
  // which homepage row a film belongs to.
  const tags = film.collections.map(({ collection }) => collection.slug);

  // posterReference stores only a filename in the database. Build a complete
  // URL here so phones and browsers can request the image from this server.
  const posterUrl = film.posterReference
    ? `${req.protocol}://${req.get('host')}/assets/posters/${encodeURIComponent(film.posterReference)}`
    : null;

  return {
    // Basic information displayed on film cards and the details screen.
    id: film.id,
    title: film.title,
    description: film.description,

    // `genre` supports older app code; `genres` is the preferred array form.
    genre: genreNames.join(','),
    genres: genreNames,

    // Both names are returned for compatibility with existing screens.
    year: film.releaseYear,
    releaseYear: film.releaseYear,
    department: film.department.name,

    // The nested object is useful when the client needs more than the name.
    departmentDetails: {
      id: film.department.id,
      name: film.department.name,
      slug: film.department.slug,
    },

    // `poster` and `posterUrl` contain the public URL. `posterAsset` keeps the
    // original filename so it can be matched to a bundled local image.
    poster: posterUrl,
    posterUrl,
    posterAsset: film.posterReference,

    // `link` is retained for older client code. The full field name is clearer
    // for newer code. An empty string prevents old components receiving null.
    link: film.facebookVideoUrl ?? '',
    facebookVideoUrl: film.facebookVideoUrl,
    publicationStatus: film.publicationStatus,
    tags,

    // Return collection details in display order, not just their tag names.
    collections: film.collections.map(({ collection }) => ({
      id: collection.id,
      slug: collection.slug,
      title: collection.title,
    })),
    createdAt: film.createdAt,
    updatedAt: film.updatedAt,
  };
}

// Reusable Prisma `include` configuration. Every film query using this object
// receives the related department, genres, and collections required above.
export const filmInclude = {
  department: true,
  // Alphabetical genres give the API a predictable response order.
  genres: { include: { genre: true }, orderBy: { genre: { name: 'asc' } } },
  // Collection positions control the order chosen in the seed data.
  collections: { include: { collection: true }, orderBy: { position: 'asc' } },
};
