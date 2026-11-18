export function serializeFilm(film, req) {
  const genreNames = film.genres.map(({ genre }) => genre.name);
  const tags = film.collections.map(({ collection }) => collection.slug);
  const posterUrl = film.posterReference
    ? `${req.protocol}://${req.get('host')}/assets/posters/${encodeURIComponent(film.posterReference)}`
    : null;

  return {
    id: film.id,
    title: film.title,
    description: film.description,
    genre: genreNames.join(','),
    genres: genreNames,
    year: film.releaseYear,
    releaseYear: film.releaseYear,
    department: film.department.name,
    departmentDetails: {
      id: film.department.id,
      name: film.department.name,
      slug: film.department.slug,
    },
    poster: posterUrl,
    posterUrl,
    posterAsset: film.posterReference,
    link: film.facebookVideoUrl ?? '',
    facebookVideoUrl: film.facebookVideoUrl,
    publicationStatus: film.publicationStatus,
    tags,
    collections: film.collections.map(({ collection }) => ({
      id: collection.id,
      slug: collection.slug,
      title: collection.title,
    })),
    createdAt: film.createdAt,
    updatedAt: film.updatedAt,
  };
}

export const filmInclude = {
  department: true,
  genres: { include: { genre: true }, orderBy: { genre: { name: 'asc' } } },
  collections: { include: { collection: true }, orderBy: { position: 'asc' } },
};
