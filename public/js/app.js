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
  // TODO 1: верните объект с title, genre, year, rating, duration,
  // sessions (массив строк) и tags (массив строк).
  // Учтите отсутствие либо неверный тип отдельных полей.
  return {
    title: typeof raw.title === "string"
      ? raw.title
      : "Без названия",
    genre: typeof raw.genre === "string"
      ? raw.genre
      : "Не указан",
    year: Number.isFinite(Number(raw.year))
      && raw.year !== null
      ? Number(raw.year)
      : null,
    rating: Number.isFinite(Number(raw.rating))
      && raw.rating !== null
      ? Number(raw.rating)
      : null,
    duration: Number.isFinite(Number(raw.duration))
      && raw.duration !== null
      ? Number(raw.duration)
      : null,
    sessions: Array.isArray(raw.sessions)
      ? raw.sessions.filter(item => typeof item === "string")
      : [],
    tags: Array.isArray(raw.tags)
      ? raw.tags.filter(item => typeof item === "string")
      : []
  };
}
function createTextElement(tag, text, className = "") {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) {
    element.className = className;
  }
  return element;
}

  // TODO 2: создайте карточки createElement/textContent (без innerHTML).
  // Покажите жанр, год, рейтинг, длительность, ближайший сеанс и теги.
  // Для пустого списка создайте элемент .empty.
  function renderMovies(movies) {
  list.replaceChildren();
  if (movies.length === 0) {
    const empty = createElement(
      "div",
      "Фильмы не найдены.",
      "empty"
    );
    list.appendChild(empty);
    return;
  }
  movies.forEach(movie => {
    const card = document.createElement("article");
    card.className = "item";
    // Название
    const title = createElement("h3", movie.title);
    card.appendChild(title);

    // Жанр, год и рейтинг
    const meta = document.createElement("div");
    meta.className = "meta";
    meta.append(
      createElement("span", movie.genre, "chip"),
      createElement(
        "span",
        movie.year === null ? "Год не указан" : String(movie.year),
        "chip"
      ),
      createElement(
        "span",
        movie.rating === null ? "Нет рейтинга" : `★ ${movie.rating}`,
        "chip"
      )
    );
    card.appendChild(meta);
    card.appendChild(
      createElement(
        "p",
        movie.duration === null
          ? "Длительность не указана"
          : `Длительность: ${movie.duration} мин.`
      )
    );
    card.appendChild(
      createElement(
        "p",
        movie.sessions.length > 0
          ? `Сеансы: ${movie.sessions.join(", ")}`
          : "Сеансы пока не назначены"
      )
    );
    card.appendChild(
      createElement(
        "p",
        movie.tags.length > 0
          ? `Теги: ${movie.tags.join(", ")}`
          : "Теги отсутствуют"
      )
    );
    list.appendChild(card);
  });
}

  // TODO 3: найдите фильмы по подстроке названия (без учёта регистра),
  // затем примените фильтр жанра и обновите #summary и карточки.
  function applyFilters() {
  const searchValue = search.value.trim().toLowerCase();
  const selectedGenre = genre.value;
  const filteredMovies = allMovies.filter(movie => {
    const matchesTitle = movie.title
      .toLowerCase()
      .includes(searchValue);
    const matchesGenre =
      selectedGenre === "all" ||
      movie.genre === selectedGenre;
    return matchesTitle && matchesGenre;
  });
  summary.textContent =
    `Найдено фильмов: ${filteredMovies.length} из ${allMovies.length}`;
  renderMovies(filteredMovies);
}

  // TODO 4: fetch('/api/movies' + (empty?'?empty=1':'')), response.ok, response.json().
  // Извлеките data.movies, проверьте Array.isArray, преобразуйте normalizeMovie,
  // запишите в allMovies и вызовите applyFilters().
async function fetchMovies(empty = false) {
  try {
    setStatus("Загрузка данных...", "loading");
    const url = empty
      ? "/api/movies?empty=1"
      : "/api/movies";
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    const result = await response.json();
    if (!Array.isArray(result.data?.movies)) {
      throw new Error("Массив data.movies не найден");
    }
    allMovies = result.data.movies.map(normalizeMovie);
    applyFilters();
    setStatus(
      "Данные успешно загружены.",
      "success"
    );
  } catch (error) {
    console.error("Ошибка:", error);
    allMovies = [];
    summary.textContent = "Найдено фильмов: 0 из 0";
    renderMovies([]);
    setStatus(
      `Ошибка загрузки: ${error.message}`,
      "error"
    );
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
// TODO 5: вызовите fetchMovies() при открытии страницы.
fetchMovies();