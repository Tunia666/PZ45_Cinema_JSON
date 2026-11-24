const list = document.querySelector('#movie-list');
const status = document.querySelector('#status');
const summary = document.querySelector('#summary');
const search = document.querySelector('#search');
const genre = document.querySelector('#genre');

const movies = [
  {
    title: 'Интерстеллар',
    genre: 'Фантастика',
    year: 2014,
    rating: 8.7,
    duration: 169,
    sessions: ['14:30', '18:00', '21:45'],
    tags: ['космос', 'драма', 'IMAX']
  },
  {
    title: 'Дюна: Часть вторая',
    genre: 'Фантастика',
    year: 2024,
    rating: 8.5,
    duration: 166,
    sessions: ['16:15', '20:00'],
    tags: ['эпос', 'приключения', 'пустыня']
  },
  {
    title: 'Джентльмены',
    genre: 'Криминал',
    year: 2019,
    rating: 8.6,
    duration: 113,
    sessions: ['19:10', '22:30'],
    tags: ['комедия', 'боевик', 'Гай Ричи']
  },
  {
    title: 'Оппенгеймер',
    genre: 'Драма',
    year: 2023,
    rating: 8.3,
    duration: 180,
    sessions: ['15:00', '21:00'],
    tags: ['биография', 'история']
  },
  {
    title: '1+1',
    genre: 'Комедия',
    year: 2011,
    rating: 8.8,
    duration: 112,
    sessions: ['13:20', '17:40'],
    tags: ['дружба', 'французское кино']
  },
  {
    title: 'Начало',
    genre: 'Боевик',
    year: 2010,
    rating: 8.8,
    duration: 148,
    sessions: ['18:45', '23:15'],
    tags: ['сны', 'триллер', 'Кристофер Нолан']
  },
  {
    title: 'Тайна старого театра',
    genre: 'Детектив',
    year: 'неизвестно',
    rating: null,
    duration: 95,
    sessions: [],
    tags: null
  }
];

let allMovies = [];

function setStatus(message, kind = 'info') {
  status.textContent = message;
  status.dataset.kind = kind;
}

function normalizeMovie(raw) {
  const item = raw && typeof raw === 'object' ? raw : {};

  return {
    title: typeof item.title === 'string' && item.title.trim() ? item.title.trim() : 'Без названия',
    genre: typeof item.genre === 'string' && item.genre.trim() ? item.genre.trim() : 'Не указан',
    year: typeof item.year === 'number' && Number.isFinite(item.year) ? item.year : null,
    rating: typeof item.rating === 'number' && Number.isFinite(item.rating) ? item.rating : null,
    duration: typeof item.duration === 'number' && Number.isFinite(item.duration) ? item.duration : null,
    sessions: Array.isArray(item.sessions)
      ? item.sessions.filter((s) => typeof s === 'string' && s.trim() !== '')
      : [],
    tags: Array.isArray(item.tags)
      ? item.tags.filter((t) => typeof t === 'string' && t.trim() !== '')
      : []
  };
}

function renderMovies(moviesList) {
  list.replaceChildren();

  if (moviesList.length === 0) {
    const emptyEl = document.createElement('div');
    emptyEl.className = 'empty';
    emptyEl.textContent = 'Фильмы не найдены.';
    list.append(emptyEl);
    return;
  }

  const fragment = document.createDocumentFragment();

  moviesList.forEach((movie) => {
    const card = document.createElement('article');
    card.className = 'movie-card';

    const titleEl = document.createElement('h3');
    titleEl.textContent = movie.title;

    const metaEl = document.createElement('p');
    const yearText = movie.year !== null ? movie.year : '—';
    const ratingText = movie.rating !== null ? `★ ${movie.rating}` : 'без рейтинга';
    const durationText = movie.duration !== null ? `${movie.duration} мин.` : 'длительность не указана';
    metaEl.textContent = `${movie.genre} • ${yearText} • ${ratingText} • ${durationText}`;

    const sessionEl = document.createElement('p');
    const nextSession = movie.sessions.length > 0 ? movie.sessions : 'нет сеансов';
    sessionEl.textContent = `Ближайший сеанс: ${nextSession}`;

    const tagsEl = document.createElement('p');
    tagsEl.textContent = movie.tags.length > 0 ? `Теги: ${movie.tags.join(', ')}` : 'Теги: отсутствуют';

    card.append(titleEl, metaEl, sessionEl, tagsEl);
    fragment.append(card);
  });

  list.append(fragment);
}

function applyFilters() {
  const query = search.value.trim().toLowerCase();
  const selectedGenre = genre.value;

  const filtered = allMovies.filter((movie) => {
    const matchesTitle = movie.title.toLowerCase().includes(query);
    const matchesGenre = !selectedGenre || selectedGenre === 'all' || movie.genre === selectedGenre;
    return matchesTitle && matchesGenre;
  });

  summary.textContent = `Показано: ${filtered.length} из ${allMovies.length}`;
  renderMovies(filtered);
}

async function fetchMovies(empty = false) {
  setStatus('Загрузка списка фильмов...', 'info');

  try {
    const url = '/api/movies' + (empty ? '?empty=1' : '');
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }

    const data = await response.json();

    if (!data || !Array.isArray(data.movies)) {
      throw new Error('Некорректный формат ответа: отсутствует массив movies');
    }

    allMovies = data.movies.map(normalizeMovie);
    applyFilters();
    setStatus(`Загружено фильмов: ${allMovies.length}`, 'success');
  } catch (error) {
    const fallback = empty ? [] : movies;
    allMovies = fallback.map(normalizeMovie);
    applyFilters();
    setStatus(`Загружено локально: ${allMovies.length}`, 'success');
  }
}

document.querySelector('#load-button').addEventListener('click', () => fetchMovies());
document.querySelector('#clear-button').addEventListener('click', () => fetchMovies(true));
search.addEventListener('input', applyFilters);
genre.addEventListener('change', applyFilters);

fetchMovies();
