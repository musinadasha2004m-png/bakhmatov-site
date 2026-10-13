/* Страница дня */
(function () {
  "use strict";
  var M = window.Marathon, C = M.config;
  var root = document.getElementById("app");
  var n = parseInt(new URLSearchParams(location.search).get("day"), 10);

  function nav(days, idx) {
    var prev = days[idx - 1], next = days[idx + 1];
    var left = prev
      ? '<a class="btn btn-secondary" href="' + M.dayLink(prev.day) + '">' + M.icon("arrowLeft") + "Предыдущий</a>"
      : "<span></span>";
    var right = "";
    if (next) {
      right = M.isOpen(next.day)
        ? '<a class="btn btn-secondary" href="' + M.dayLink(next.day) + '">Следующий' + M.icon("arrowRight") + "</a>"
        : '<span class="chip chip-muted">' + M.icon("lock") + "День " + next.day + " откроется " + M.openLabel(next.day) + "</span>";
    }
    return '<nav class="day-nav" aria-label="Соседние дни">' + left + right + "</nav>";
  }

  function completeButton() {
    return M.isDone(n)
      ? '<div class="done-row"><span class="chip chip-green chip-lg">' + M.icon("check") + 'День пройден</span><button type="button" class="link-btn" data-toggle-done>Отменить отметку</button></div>'
      : '<button type="button" class="btn btn-primary btn-block" data-toggle-done>' + M.icon("check") + "Отметить день пройденным</button>";
  }

  function locked(day) {
    root.innerHTML =
      '<a class="back" href="' + M.homeLink() + '">' + M.icon("arrowLeft") + "Все дни</a>" +
      '<div class="card center">' +
        '<span class="badge badge-blue badge-lg">' + M.icon("lock") + "</span>" +
        '<p class="eyebrow">День ' + n + "</p>" +
        "<h1>Этот день <span class=\"hl\">ещё закрыт</span></h1>" +
        '<p class="soft">' + (day ? "Откроется " + M.openLabel(n) + " в " + M.esc(C.openTime) + " " + M.esc(C.timezoneLabel) + ". " : "") + "Пока можно спокойно пройти то, что уже открыто.</p>" +
        '<a class="btn btn-primary" href="' + M.homeLink() + '">К списку дней</a>' +
      "</div>";
  }

  function render(days) {
    var idx = -1;
    days.forEach(function (d, i) { if (d.day === n) idx = i; });
    var day = days[idx];
    if (!day || !M.isOpen(n)) return locked(day);

    document.title = "День " + day.day + ". " + day.title + " — " + C.title;
    var taskKey = "task-" + n;
    var content = M.renderItems(day.items, { dropDayLine: true, taskKey: taskKey });

    root.innerHTML =
      '<a class="back" href="' + M.homeLink() + '">' + M.icon("arrowLeft") + "Все дни</a>" +
      '<header class="day-head">' +
        '<p class="eyebrow">День ' + day.day + " из " + days.length + "</p>" +
        "<h1>" + M.esc(day.title) + "</h1>" +
      "</header>" +
      (content
        ? '<article class="card lesson">' + content + "</article>"
        : '<aside class="note"><span class="badge badge-green badge-lg">' + M.icon("info") + "</span><p>Материалы этого дня скоро появятся. Сегодня можно выдохнуть и вернуться к тому, что хотелось перечитать.</p></aside>") +
      '<div id="complete">' + completeButton() + "</div>" +
      nav(days, idx);

    M.bindChecklist(root, taskKey);
    M.checkDocs(root);

    document.getElementById("complete").addEventListener("click", function (e) {
      if (!e.target.closest("[data-toggle-done]")) return;
      M.setDone(n, !M.isDone(n));
      this.innerHTML = completeButton();
    });
  }

  M.setHeader();
  M.gate().then(M.loadDays).then(render).catch(function () {
    root.innerHTML = '<div class="card"><h2>Не получилось загрузить урок</h2><p class="soft">Обнови страницу. Если не помогло — напиши организатору марафона.</p></div>';
  });
})();
