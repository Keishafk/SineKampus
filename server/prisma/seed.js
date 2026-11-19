import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Collections become the horizontal rows shown on the Home screen.
// A film joins a collection by adding its slug to the film's tags array.
const collections = [
  { slug: 'winners2025', title: 'Winners of SineLikha 2025' },
  { slug: 'winners2026', title: 'Winners of SineLikha 2026' },
  { slug: 'new', title: 'New this Semester' },
];

// This array is the editable source of truth for the development film catalog.
// Keep every id unique and sequential, and use null when a value is unavailable.
const films = [
  
  {
    id: '1',
    title: 'Uninvited Love',
    description: 'An unexpected romance brings two different worlds together, where complicated feelings, hidden emotions, and difficult choices challenge the meaning of true love.',
    releaseYear: 2024,
    department: 'College of Computing and Information Sciences',
    genres: ['Thriller'],
    tags: [],
    posterReference: 'ccis2024.jpg',
    facebookVideoUrl: 'https://www.facebook.com/reel/1105203207932427',
  },
{
    id: '2',
    title: 'Golden Scenery Of Tommorow',
    description: 'A heartwarming story of young love, dreams, and second chances, where unexpected connections and unforgettable moments shape the journey toward a brighter tomorrow.',
    releaseYear: 2026,
    department: 'College of Computing and Information Sciences',
    genres: ['Drama'],
    tags: ['new'],
    posterReference: 'ccis2026.jpg',
    facebookVideoUrl: 'https://www.facebook.com/reel/1797534958139334',
  },

  {
    id: '3',
    title: 'Four Sisters Before the Wedding',
    description: 'Four sisters join forces to save their parents marriage after discovering a secret that threatens to tear their family apart. Their hilarious and heartfelt adventure teaches them the true meaning of family and togetherness.',
    releaseYear: 2026,
    department: 'College of Management',
    genres: ['Drama'],
    tags: [],
    posterReference: 'com2026.jpg',
    facebookVideoUrl: 'https://www.facebook.com/reel/991933297320256',
  },
  
  {
    id: '4',
    title: 'The Exorcist',
    description: 'When a young girl begins displaying terrifying and unexplained behavior, her desperate mother seeks help from two priests. What follows is a horrifying battle against a powerful evil that tests the limits of faith and courage.',
    releaseYear: 2025,
    department: 'College of Engineering and Architecture',
    genres: ['Drama'],
    tags: ['new'],
    posterReference: 'cea.jpg',
    facebookVideoUrl: 'https://www.facebook.com/100077051572691/videos/pcb.816616084250103/783543854553420',
  },
  {
    id: '5',
    title: 'No Budget Love',
    description: 'Love doesn\'t always require money, but surviving life\'s challenges together is another story. Follow a romantic journey filled with laughter, sacrifices, and the realization that genuine affection is worth more than material things.',
    releaseYear: 2024,
    department: 'College of Engineering and Architecture',
    genres: ['Drama'],
    tags: [],
    posterReference: 'cea2024.jpg',
    facebookVideoUrl: 'https://www.facebook.com/reel/953747870023341',
  },

{
    id: '6',
    title: 'Meet Greet Bye',
    description: 'Four siblings reunite to fulfill their sick mother\'s dream of meeting her favorite Korean celebrity. Along the way, they rediscover the importance of family, forgiveness, and making unforgettable memories together.',
    releaseYear: 2026,
    department: 'College of Engineering and Architecture',
    genres: ['Drama'],
    tags: ['new'],
    posterReference: 'cea2026.jpg',
    facebookVideoUrl: 'https://www.facebook.com/reel/1637946274730048',
  },


  {
    id: '7',
    title: 'Even Sundays',
    description: 'A touching story about love, relationships, and the moments that bring people together, reminding us that even the simplest days can hold the most meaningful memories.',
    releaseYear: 2024,
    department: 'College of Agriculture and Technology',
    genres: ['Drama'],
    tags: ['new'],
    posterReference: 'cat2024.jpg',
    facebookVideoUrl: 'https://www.facebook.com/reel/1986735935086849',
  },
  {
    id: '8',
    title: 'Wonderful Nightmare',
    description: 'A successful lawyer unexpectedly gets a second chance at life, but with a surprising twist: she must live as a wife and mother. Through her unusual experience, she discovers the true meaning of love, family, and happiness.',
    releaseYear: 2026,
    department: 'College of Agriculture and Technology',
    genres: ['Documentary'],
    tags: [],
    posterReference: 'cat2026.jpg',
    facebookVideoUrl: 'https://www.facebook.com/reel/2200788487503462',
  },
  {
    id: '9',
    title: 'Sinetch Itey',
    description: 'Nando and Sabrina, two people living completely different lives, unexpectedly switch places, leading to a series of hilarious misunderstandings and chaotic situations. As they struggle to adjust to each other\'s worlds, they discover surprising lessons about identity, friendship, and understanding one another.',
    releaseYear: 2025,
    department: 'College of Education',
    genres: ['Drama'],
    tags: ['new'],
    posterReference: 'coed.jpg',
    facebookVideoUrl: 'https://www.facebook.com/100077051572691/videos/pcb.816616084250103/819537127496262',
  },
  {
    id: '10',
    title: 'Goodbye,Pare; Hello.Mare!',
    description: 'Inspired by This Guy\'s in Love with U Mare!, this romantic comedy follows an unexpected love triangle filled with jealousy, hilarious schemes, and surprising revelations. When a heartbroken man discovers that his former lover has moved on, he creates an outrageous plan to win him back, leading to a chaotic adventure where love and deception collide.',
    releaseYear: 2024,
    department: 'College of Education',
    genres: ['Drama'],
    tags: [],
    posterReference: 'coed2024.jpg',
    facebookVideoUrl: 'https://www.facebook.com/reel/1124368992438786',
  },

{
    id: '11',
    title: 'Diary ng Panget',
    description: 'A simple, hardworking girl becomes the personal maid of a handsome but arrogant rich boy. Despite their constant arguments and differences, an unexpected romance begins to blossom, proving that true beauty comes from within.',
    releaseYear: 2026,
    department: 'College of Education',
    genres: ['Drama'],
    tags: [],
    posterReference: 'coed2026.jpg',
    facebookVideoUrl: 'https://www.facebook.com/reel/1652864939673676',
  },


  {
    id: '12',
    title: 'Loving in Tandem',
    description: 'Two young people from different backgrounds unexpectedly cross paths and discover a special connection. Through funny misunderstandings, friendship, and romantic adventures, they learn that love can bring even the most unlikely people together.',
    releaseYear: 2025,
    department: 'College of Criminal Justice and Sciences',
    genres: ['Romance', 'Comedy'],
    tags: ['new', 'winners2025'],
    posterReference: 'ccjs.jpg',
    facebookVideoUrl: 'https://www.facebook.com/100077051572691/videos/pcb.816616084250103/1458586675443586',
  },
  

{
    id: '13',
    title: 'Ang Babaeng Walang Pakiramdam',
    description: 'A young woman who cannot feel physical pain meets a man who changes her understanding of love and happiness. Together, they experience an extraordinary journey filled with laughter, emotions, and discoveries about what it truly means to feel.',
    releaseYear: 2026,
    department: 'College of Criminal Justice and Sciences',
    genres: ['Romance', 'Comedy'],
    tags: ['new', 'winners2026'],
    posterReference: 'ccjs2026.jpg',
    facebookVideoUrl: 'https://www.facebook.com/reel/2642958546155567',
  },

  {
    id: '14',
    title: 'Innocence Behind Bars',
    description: '',
    releaseYear: 2024,
    department: 'College of Nursing',
    genres: ['Crime'],
    tags: ['winners2025'],
    posterReference: 'con2024.jpg',
    facebookVideoUrl: 'https://www.facebook.com/reel/1018736560011364',
  },

  {
    id: '15',
    title: '2 Valid Ids',
    description: 'When a struggling farmer desperately needs money for her husband\'s medical treatment, she faces an unexpected obstacle: a requirement for two valid identification cards. Her emotional journey reveals the harsh realities of poverty, bureaucracy, and the fight to survive.',
    releaseYear: 2026,
    department: 'College of Nursing',
    genres: ['Crime'],
    tags: ['winners2025'],
    posterReference: 'con2026.jpg',
    facebookVideoUrl: 'https://www.facebook.com/reel/1758277148610970',
  },
];

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

async function main() {
  // Create collection rows first because films refer to them later by slug.
  for (const item of collections) {
    await prisma.collection.upsert({
      where: { slug: item.slug },
      update: { title: item.title },
      create: item,
    });
  }

  // Upsert means rerunning the seed updates existing IDs instead of duplicating them.
  for (const item of films) {
    // Reuse one department record for every film from the same college.
    const department = await prisma.department.upsert({
      where: { name: item.department },
      update: {},
      create: { name: item.department, slug: slugify(item.department) },
    });

    // Store the main film fields and always expose seeded films as published.
    await prisma.film.upsert({
      where: { id: item.id },
      update: {
        title: item.title,
        description: item.description,
        releaseYear: item.releaseYear,
        posterReference: item.posterReference,
        facebookVideoUrl: item.facebookVideoUrl,
        publicationStatus: 'PUBLISHED',
        departmentId: department.id,
      },
      create: {
        id: item.id,
        title: item.title,
        description: item.description,
        releaseYear: item.releaseYear,
        posterReference: item.posterReference,
        facebookVideoUrl: item.facebookVideoUrl,
        publicationStatus: 'PUBLISHED',
        departmentId: department.id,
      },
    });

    // Rebuild genre relationships so removed genres do not remain in PostgreSQL.
    await prisma.filmGenre.deleteMany({
      where: { filmId: item.id },
    });

    // Each genre name is shared and connected through the FilmGenre join table.
    for (const genreName of item.genres) {
      const genre = await prisma.genre.upsert({
        where: { name: genreName },
        update: {},
        create: { name: genreName, slug: slugify(genreName) },
      });
      await prisma.filmGenre.create({
        data: {
          filmId: item.id,
          genreId: genre.id,
        },
      });
    }

    // Rebuild collection relationships from the tags array above.
    await prisma.collectionFilm.deleteMany({
      where: { filmId: item.id },
    });

    // position preserves the order when a collection contains several films.
    for (const [position, tag] of item.tags.entries()) {
      const collection = await prisma.collection.findUniqueOrThrow({
        where: { slug: tag },
      });

      await prisma.collectionFilm.create({
        data: {
          filmId: item.id,
          collectionId: collection.id,
          position,
        },
      });
    }
  }

  // Remove records deleted from this file so the database mirrors this catalog.
  await prisma.film.deleteMany({
    where: {
      id: { notIn: films.map((film) => film.id) },
    },
  });
}

// Run the seed, report failures to the terminal, and always close PostgreSQL.
main()
  .then(() => console.log(`Seeded ${films.length} films with their original IDs.`))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
