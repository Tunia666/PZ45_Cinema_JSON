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

// TODO 1: нормализация объекта фильма с защитой от неверных типов и пустых полей
function normalizeMovie(raw) {
  const item = raw && typeof raw === "object" ? raw : {};

  return {
    title: typeof item.title === "string" && item.title.trim() ? item.title.trim() : "Без названия",
    genre: typeof item.genre === "string" && item.genre.trim() ? item.genre.trim() : "Жанр не указан",
    year: typeof item.year === "number" && Number.isFinite(item.year) ? item.year : "—",
    rating: typeof item.rating === "number" && Number.isFinite(item.rating) ? item.rating : "—",
    duration: typeof item.duration === "number" && Number.isFinite(item.duration)
      ? `${item.duration} мин`
      : typeof item.duration === "string" && item.duration.trim()
        ? item.duration.trim()
        : "—",
    sessions: Array.isArray(item.sessions)
      ? item.sessions.filter((s) => typeof s === "string" && s.trim())
      : [],
    tags: Array.isArray(item.tags)
      ? item.tags.filter((t) => typeof t === "string" && t.trim())
      : [],
  };
}

// TODO 2: безопасная отрисовка карточек через createElement и textContent
function renderMovies(movies) {
  list.replaceChildren();

  if (!movies.length) {
    const emptyEl = document.createElement("div");
    emptyEl.className = "empty";
    emptyEl.textContent = "Фильмы не найдены.";
    list.append(emptyEl);
    return;
  }

  const fragment = document.createDocumentFragment();

  for (const movie of movies) {
    const card = document.createElement("article");
    card.className = "movie-card";

    const titleEl = document.createElement("h3");
    titleEl.textContent = movie.title;

    const metaEl = document.createElement("p");
    metaEl.className = "movie-meta";
    metaEl.textContent = `${movie.genre} • ${movie.year} • Рейтинг: ${movie.rating} • ${movie.duration}`;

    const sessionEl = document.createElement("p");
    sessionEl.className = "movie-session";
    const nextSession = movie.sessions.length > 0 ? movie.sessions[0] : "нет сеансов";
    const allSessions = movie.sessions.length > 0 ? ` (все: ${movie.sessions.join(", ")})` : "";
    sessionEl.textContent = `Ближайший сеанс: ${nextSession}${allSessions}`;

    const tagsEl = document.createElement("div");
    tagsEl.className = "movie-tags";

    if (movie.tags.length > 0) {
      for (const tag of movie.tags) {
        const tagSpan = document.createElement("span");
        tagSpan.className = "tag";
        tagSpan.textContent = tag;
        tagsEl.append(tagSpan);
      }
    } else {
      const noTags = document.createElement("span");
      noTags.className = "tag empty-tag";
      noTags.textContent = "Без тегов";
      tagsEl.append(noTags);
    }

    card.append(titleEl, metaEl, sessionEl, tagsEl);
    fragment.append(card);
  }

  list.append(fragment);
}

// TODO 3: совместная фильтрация по названию и жанру + обновление счётчика
function applyFilters() {
  const query = search.value.trim().toLowerCase();
  const selectedGenre = genre.value.trim().toLowerCase();

  const filtered = allMovies.filter((movie) => {
    const matchesTitle = movie.title.toLowerCase().includes(query);
    const matchesGenre = !selectedGenre || selectedGenre === "all" || movie.genre.toLowerCase() === selectedGenre;
    return matchesTitle && matchesGenre;
  });

  if (summary) {
    summary.textContent = `Показано ${filtered.length} из ${allMovies.length}`;
  }

  renderMovies(filtered);
}

// TODO 4: загрузка данных с сервера, проверка ответа и обновление состояния
async function fetchMovies(empty = false) {
  const url = "/api/movies" + (empty ? "?empty=1" : "");
  setStatus("Загрузка списка фильмов...", "info");

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }

    const payload = await response.json();
    const rawList = payload?.data?.movies;

    if (!Array.isArray(rawList)) {
      throw new Error("Некорректный формат ответа: ожидался массив data.movies");
    }

    allMovies = rawList.map(normalizeMovie);
    applyFilters();
    setStatus(`Загружено фильмов: ${allMovies.length}`, "success");
  } catch (error) {
    allMovies = [];
    applyFilters();
    setStatus(error.message || "Не удалось загрузить фильмы", "error");
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

// TODO 5: начальная загрузка данных при открытии страницы
fetchMovies();
