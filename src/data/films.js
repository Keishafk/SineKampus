// films.js — the MOCK DATABASE for SineKampus.

// `export` makes this array available to other files.
// Other files get it with: import { films } from '../data/films';
export const films = [
  {
    // id: a UNIQUE text value for each film, never reuse one.
    id: '1',

    // title: the film's name, shown on the card and details page.
    title: 'RPG Metanoia',

    // poster: the picture shown on the card, loaded from assets/posters/.
    // TODO (SineKampus): change the file name to swap the poster.
    poster: require('../../assets/posters/rpg-metanoia.jpg'),

    // genre: used by the Genre filter chip, keep the spelling the same across films.
    genre: 'Animation',

    // year: used by the Year filter, a number with no quotes.
    year: 2024,

    // department: used by the Department filter.
    department: 'Entertainment and Multimedia Computing',

    // tags: the rows this film appears in, use the ids from rows.js.
    // TODO (SineKampus): change the tags for each film, [] means no special row.
    tags: ['winners2025'],

    // description: the text on the details page, '' hides it.
    // TODO (SineKampus): write a short synopsis for each film.
    description: 'A short description of the film goes here.',

    // link: where "Watch now" opens, '' shows a "Coming soon" message.
    // TODO (SineKampus): paste the film's YouTube or Facebook link here.
    link: 'https://www.youtube.com/',
  },
  {
    id: '2',
    title: 'Spider-Man: Brand New Day',
    poster: require('../../assets/posters/spiderman-bnd.jpg'),
    genre: 'Action',
    year: 2024,
    department: 'Development Communication',
    tags: ['new'],
    description: 'A short description of the film goes here.',
    link: '',
  },
  {
    id: '3',
    title: '3 Body Problem',
    poster: require('../../assets/posters/3-body-problem.jpg'),
    genre: 'Sci-Fi',
    year: 2023,
    department: 'Mechanical Engineering',
    tags: ['new'],
    description: 'A short description of the film goes here.',
    link: '',
  },
  {
    id: '4',
    title: 'Missing Poster',
    // poster: null shows the dark fallback box with the title.
    // TODO (SineKampus): replace null with require('../../assets/posters/your-file.jpg').
    poster: null,
    genre: 'Drama',
    year: 2022,
    department: 'Agriculture',
    tags: [],
    description: '',
    link: '',
  },
];