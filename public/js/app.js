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
    title: typeof item.title === "string" && item.title.trim() ? item.title.trim() : "Без названия",
    genre: typeof item.genre === "string" && item.genre.trim() ? item.genre.trim() : "Жанр не указан",
    year: typeof item.year === "number" && !Number.isNaN(item.year) ? item.year : null,
    rating: typeof item.rating === "number" && !Number.isNaN(item.rating) ? item.rating : null,
    duration: typeof item.duration === "number" && !Number.isNaN(item.duration) ? item.duration : null,
    sessions: Array.isArray(item.sessions)
      ? item.sessions.filter((s) => typeof s === "string" && s.trim())
      : [],
    tags: Array.isArray(item.tags)
      ? item.tags.filter((t) => typeof t === "string" && t.trim())
      : []
  };
}
function renderMovies(movies) {
  list.replaceChildren();

  if (!movies.length) {
    const emptyEl = document.createElement("div");
    emptyEl.className = "empty";
    emptyEl.textContent = "Фильмы не найдены";
    list.appendChild(emptyEl);
    return;
  }

  movies.forEach((movie) => {
    const card = document.createElement("article");
    card.className = "item";

    const titleEl = document.createElement("h3");
    titleEl.textContent = movie.title;

    const metaEl = document.createElement("p");
    const yearText = movie.year !== null ? movie.year : "—";
    const ratingText = movie.rating !== null ? movie.rating : "—";
    const durationText = movie.duration !== null ? `${movie.duration} мин` : "—";
    metaEl.textContent = `${movie.genre} · ${yearText} · Рейтинг: ${ratingText} · ${durationText}`;

    const sessionEl = document.createElement("p");
    sessionEl.textContent = movie.sessions.length > 0
      ? `Ближайший сеанс: ${movie.sessions[0]} (всего: ${movie.sessions.join(", ")})`
      : "Ближайший сеанс: сеансов пока нет";

    const tagsEl = document.createElement("div");
    tagsEl.className = "meta";
    movie.tags.forEach((tag) => {
      const tagSpan = document.createElement("span");
      tagSpan.className = "chip";
      tagSpan.textContent = tag;
      tagsEl.appendChild(tagSpan);
    });

    card.append(titleEl, metaEl, sessionEl, tagsEl);
    list.appendChild(card);
  });
}
function applyFilters() {
  const query = search.value.trim().toLowerCase();
  const selectedGenre = genre.value;

  const filtered = allMovies.filter((movie) => {
    const matchesTitle = movie.title.toLowerCase().includes(query);
    const matchesGenre = selectedGenre === "all" || movie.genre === selectedGenre;
    return matchesTitle && matchesGenre;
  });

  summary.textContent = `Показано фильмов: ${filtered.length} из ${allMovies.length}`;
  renderMovies(filtered);
}

async function fetchMovies(empty = false) {
  setStatus("Загрузка данных...", "info");
  try {
    const response = await fetch("/api/movies" + (empty ? "?empty=1" : ""));
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const payload = await response.json();
    const rawMovies = payload && payload.data && Array.isArray(payload.data.movies)
      ? payload.data.movies
      : [];
    allMovies = rawMovies.map(normalizeMovie);
    applyFilters();
    setStatus(
      allMovies.length ? "Данные успешно загружены" : "Сервер вернул пустой список фильмов",
      "success"
    );
  } catch (error) {
    allMovies = [];
    applyFilters();
    setStatus(`Ошибка загрузки: ${error.message}`, "error");
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
