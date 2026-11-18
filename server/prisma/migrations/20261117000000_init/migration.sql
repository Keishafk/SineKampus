CREATE TYPE "PublicationStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

CREATE TABLE "departments" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "slug" TEXT NOT NULL UNIQUE,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "genres" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "slug" TEXT NOT NULL UNIQUE,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "films" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "release_year" INTEGER NOT NULL,
  "poster_reference" TEXT,
  "facebook_video_url" TEXT,
  "publication_status" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
  "department_id" INTEGER NOT NULL REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "film_genres" (
  "film_id" TEXT NOT NULL REFERENCES "films"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "genre_id" INTEGER NOT NULL REFERENCES "genres"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY ("film_id", "genre_id")
);

CREATE TABLE "collections" (
  "id" SERIAL PRIMARY KEY,
  "slug" TEXT NOT NULL UNIQUE,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "collection_films" (
  "collection_id" INTEGER NOT NULL REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "film_id" TEXT NOT NULL REFERENCES "films"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "position" INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY ("collection_id", "film_id")
);

CREATE INDEX "films_title_idx" ON "films"("title");
CREATE INDEX "films_release_year_idx" ON "films"("release_year");
CREATE INDEX "films_department_id_idx" ON "films"("department_id");
CREATE INDEX "collection_films_film_id_idx" ON "collection_films"("film_id");
