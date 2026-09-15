/*
 * Лёгкий трекер прогресса по марафону — просто чтобы на странице со списком
 * дней было видно, какие дни уже открывались. Хранится в localStorage
 * браузера конкретного человека, ни с кем не синхронизируется.
 */

const PROGRESS_KEY = "bakhmatov_marathon_progress";

function getVisitedDays() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function markDayVisited(dayNumber) {
  try {
    const visited = new Set(getVisitedDays());
    visited.add(dayNumber);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(Array.from(visited)));
  } catch (e) {
    /* тихо игнорируем — прогресс просто не запомнится */
  }
}
