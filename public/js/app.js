const list = document.querySelector("#movie-list");
const status = document.querySelector("#status");
const summary = document.querySelector("#summary");
const search = document.querySelector("#search");
const genre = document.querySelector("#genre");
let allMovies = [];

function setStatus(message, kind = "info") {
  status.textContent = message;
  status.dataset.kind = kind;
}

function normalizeMovie(raw) {
  const item = raw && typeof raw === "object" ? raw : {};

  return {
    title: typeof item.title === "string" && item.title.trim() !== ""
      ? item.title.trim()
      : "Без названия",
    genre: typeof item.genre === "string" && item.genre.trim() !== ""
      ? item.genre.trim()
      : "Жанр не указан",
    year: item.year !== null && item.year !== "" && Number.isFinite(Number(item.year))
      ? Number(item.year)
      : null,
    rating: item.rating !== null && item.rating !== "" && Number.isFinite(Number(item.rating))
      ? Number(item.rating)
      : null,
    duration: item.duration !== null && item.duration !== "" && Number.isFinite(Number(item.duration))
      ? Number(item.duration)
      : null,
    sessions: Array.isArray(item.sessions)
      ? item.sessions.filter((s) => s !== null && s !== undefined).map(String)
      : [],
    tags: Array.isArray(item.tags)
      ? item.tags.filter((t) => t !== null && t !== undefined).map(String)
      : []
  };
}

function renderMovies(movies) {
  list.replaceChildren();

  if (movies.length === 0) {
    const emptyEl = document.createElement("div");
    emptyEl.className = "empty";
    emptyEl.textContent = "Фильмы не найдены.";
    list.appendChild(emptyEl);
    return;
  }

  const fragment = document.createDocumentFragment();

  movies.forEach((movie) => {
    const card = document.createElement("article");
    card.className = "movie-card";

    const titleEl = document.createElement("h3");
    titleEl.textContent = movie.title;

    const metaEl = document.createElement("p");
    const yearText = movie.year !== null ? `${movie.year} г.` : "Год не указан";
    const ratingText = movie.rating !== null ? `Рейтинг: ${movie.rating}` : "Без оценки";
    const durationText = movie.duration !== null ? `${movie.duration} мин.` : "Длительность не указана";
    metaEl.textContent = `${movie.genre} • ${yearText} • ${ratingText} • ${durationText}`;

    const sessionsEl = document.createElement("p");
    sessionsEl.textContent = movie.sessions.length > 0
      ? `Сеансы: ${movie.sessions.join(", ")} (ближайший: ${movie.sessions[0]})`
      : "Сеансы пока не назначены";

    const tagsEl = document.createElement("div");
    tagsEl.className = "tags";
    movie.tags.forEach((tag) => {
      const tagBadge = document.createElement("span");
      tagBadge.className = "tag";
      tagBadge.textContent = `#${tag}`;
      tagsEl.appendChild(tagBadge);
    });

    card.append(titleEl, metaEl, sessionsEl, tagsEl);
    fragment.appendChild(card);
  });

  list.appendChild(fragment);
}

function applyFilters() {
  const query = search.value.trim().toLowerCase();
  const selectedGenre = genre.value;

  const filtered = allMovies.filter((movie) => {
    const matchesTitle = movie.title.toLowerCase().includes(query);
    const matchesGenre = !selectedGenre || selectedGenre === "all" || movie.genre === selectedGenre;
    return matchesTitle && matchesGenre;
  });

  summary.textContent = `Показано: ${filtered.length} из ${allMovies.length}`;
  renderMovies(filtered);
}

async function fetchMovies(empty = false) {
  setStatus("Загрузка данных...", "info");

  try {
    const response = await fetch("/api/movies" + (empty ? "?empty=1" : ""));
    if (!response.ok) {
      throw new Error(`Ошибка сервера: HTTP ${response.status}`);
    }

    const payload = await response.json();
    const rawMovies = payload?.data?.movies;

    if (!Array.isArray(rawMovies)) {
      throw new Error("Некорректный формат ответа: отсутствует массив data.movies");
    }

    allMovies = rawMovies.map(normalizeMovie);
    applyFilters();

    if (allMovies.length === 0) {
      setStatus("Сервер вернул пустой список фильмов.", "info");
    } else {
      setStatus(`Загружено фильмов: ${allMovies.length}`, "success");
    }
  } catch (error) {
    allMovies = [];
    summary.textContent = "Показано: 0 из 0";
    renderMovies([]);
    setStatus(error.message, "error");
  }
}

document
  .querySelector("#load-button")
  .addEventListener("click", () => fetchMovies());
document
  .querySelector("#clear-button")
  .addEventListener("click", () => fetchMovies(true));
search.addEventListener("input", applyFilters);
genre.addEventListener("change", applyFilters);

fetchMovies();

