import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { z } from 'zod';
import { asyncHandler, errorHandler, HttpError, notFound } from './errors.js';
import { filmInclude, serializeFilm } from './serializers.js';
import { filmQuerySchema, parse } from './validation.js';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const posterDirectory = path.resolve(currentDirectory, '../../assets/posters');
// Film IDs come from route parameters, so validate their length before querying.
const idSchema = z.string().trim().min(1).max(100);

// Dependency injection makes the Express app easy to test with a mock Prisma client.
export function createApp({ prisma, corsOrigin = '*' }) {
  const app = express();

  // Security and parsing middleware runs before every API route.
  app.disable('x-powered-by');
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({ origin: corsOrigin === '*' ? '*' : corsOrigin.split(',').map((value) => value.trim()) }));
  app.use(express.json({ limit: '100kb' }));
  // Poster files are served by the backend for clients that cannot bundle them.
  app.use('/assets/posters', express.static(posterDirectory, { fallthrough: false, maxAge: '1d' }));

  // Health checks verify both Express and the PostgreSQL connection.
  app.get('/api/health', asyncHandler(async (req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  }));

  // Return the published catalog with optional search/filter/pagination values.
  app.get('/api/films', asyncHandler(async (req, res) => {
    const query = parse(filmQuerySchema, req.query);
    const searchTitle = query.search ?? query.title;
    // Prisma's where object is built only from filters supplied by the client.
    const where = {
      publicationStatus: 'PUBLISHED',
      ...(searchTitle ? { title: { contains: searchTitle, mode: 'insensitive' } } : {}),
      ...(query.year ? { releaseYear: query.year } : {}),
      ...(query.department ? { department: { name: { equals: query.department, mode: 'insensitive' } } } : {}),
      ...(query.genre ? { genres: { some: { genre: { name: { equals: query.genre, mode: 'insensitive' } } } } } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    // Fetch the requested page and its total count in one database transaction.
    const [items, total] = await prisma.$transaction([
      prisma.film.findMany({
        where,
        include: filmInclude,
        orderBy: [{ releaseYear: 'desc' }, { title: 'asc' }],
        skip,
        take: query.limit,
      }),
      prisma.film.count({ where }),
    ]);

    res.json({
      data: items.map((film) => serializeFilm(film, req)),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  }));

  // Return one published film or a safe 404 response.
  app.get('/api/films/:id', asyncHandler(async (req, res) => {
    const id = parse(idSchema, req.params.id);
    const film = await prisma.film.findFirst({
      where: { id, publicationStatus: 'PUBLISHED' },
      include: filmInclude,
    });
    if (!film) throw new HttpError(404, 'Film not found.');
    res.json({ data: serializeFilm(film, req) });
  }));

  // These lookup routes populate filter menus and collection rows.
  app.get('/api/genres', asyncHandler(async (req, res) => {
    const genres = await prisma.genre.findMany({
      where: { films: { some: { film: { publicationStatus: 'PUBLISHED' } } } },
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' },
    });
    res.json({ data: genres });
  }));

  app.get('/api/departments', asyncHandler(async (req, res) => {
    const departments = await prisma.department.findMany({
      where: { films: { some: { publicationStatus: 'PUBLISHED' } } },
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' },
    });
    res.json({ data: departments });
  }));

  app.get('/api/collections', asyncHandler(async (req, res) => {
    const collections = await prisma.collection.findMany({
      orderBy: { id: 'asc' },
      include: {
        films: {
          where: { film: { publicationStatus: 'PUBLISHED' } },
          orderBy: { position: 'asc' },
          include: { film: { include: filmInclude } },
        },
      },
    });
    res.json({
      data: collections.map((collection) => ({
        id: collection.id,
        slug: collection.slug,
        title: collection.title,
        description: collection.description,
        films: collection.films.map(({ film }) => serializeFilm(film, req)),
      })),
    });
  }));

  // Unknown routes and thrown errors finish in these centralized handlers.
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
