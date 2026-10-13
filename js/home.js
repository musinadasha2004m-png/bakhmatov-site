/* Главная: прогресс и сетка дней */
(function () {
  "use strict";
  var M = window.Marathon, C = M.config;
  var root = document.getElementById("app");

  function plural(n, one, few, many) {
    var a = n % 10, b = n % 100;
    return a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 12 || b > 14) ? few : many;
  }

  function render(days) {
    var total = days.length;
    var done = M.doneDays().filter(function (n) { return n >= 1 && n <= total; });
    var openCount = days.filter(function (d) { return M.isOpen(d.day); }).length;

    // «Текущий» день: по расписанию — последний открывшийся; когда открыто всё — первый непройденный
    var current = 0;
    if (M.allOpen) {
      for (var i = 0; i < days.length; i++) if (done.indexOf(days[i].day) === -1) { current = days[i].day; break; }
    } else {
      current = M.scheduledDay();
    }

    var cta = "";
    if (current) {
      cta = '<a class="btn btn-primary" href="' + M.dayLink(current) + '">' +
        (done.length ? "Продолжить: день " : "Начать: день ") + current + M.icon("arrowRight") + "</a>";
    } else if (!openCount) {
      cta = '<span class="chip chip-blue">' + M.icon("calendar") + "Старт " + M.openLabel(1) + "</span>";
    }

    var cards = days.map(function (d) {
      var open = M.isOpen(d.day), isDone = done.indexOf(d.day) !== -1, isCurrent = d.day === current;
      var status = !open
        ? '<span class="chip chip-muted">' + M.icon("lock") + "Откроется " + M.openLabel(d.day) + "</span>"
        : isDone ? '<span class="chip chip-green">' + M.icon("check") + "Пройден</span>"
        : isCurrent ? '<span class="chip chip-blue">' + (M.allOpen ? "Следующий" : "Сегодня") + "</span>"
        : '<span class="chip chip-ghost">Открыт</span>';
      var badge = '<span class="badge ' + (isDone ? "badge-green" : open ? "badge-blue" : "badge-muted") + '">' +
        (isDone ? M.icon("check") : open ? d.day : M.icon("lock")) + "</span>";
      var inner = '<div class="day-top">' + badge + '<span class="day-num">День ' + d.day + "</span></div>" +
        '<h3 class="day-title">' + M.esc(d.title) + "</h3>" + status;
      var cls = "day-card" + (isDone ? " is-done" : "") + (isCurrent ? " is-current" : "");
      return open
        ? '<li><a class="' + cls + '" href="' + M.dayLink(d.day) + '">' + inner + "</a></li>"
        : '<li><div class="' + cls + ' is-locked" aria-disabled="true">' + inner + "</div></li>";
    }).join("");

    var pct = total ? Math.round(done.length / total * 100) : 0;

    root.innerHTML =
      '<section class="hero">' +
        '<p class="eyebrow">Марафон по питанию · ' + total + " дней</p>" +
        '<h1>Привет! Твой путь к <span class="hl">энергии</span> и <mark>балансу</mark></h1>' +
        '<p class="lead">Без революций, но с реальными изменениями. Один небольшой шаг в день — в своём темпе и без чувства вины.</p>' +
        cta +
      "</section>" +

      '<section class="card progress-card" aria-label="Твой прогресс">' +
        '<div class="stats">' +
          '<div class="stat"><span class="badge badge-blue">' + M.icon("calendar") + '</span><div><b>' + openCount + " из " + total + "</b><span>" + plural(openCount, "день открыт", "дня открыто", "дней открыто") + "</span></div></div>" +
          '<div class="stat"><span class="badge badge-green">' + M.icon("check") + '</span><div><b>' + done.length + "</b><span>" + plural(done.length, "день пройден", "дня пройдено", "дней пройдено") + "</span></div></div>" +
        "</div>" +
        '<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="' + total + '" aria-valuenow="' + done.length + '" aria-label="Пройдено дней"><span style="width:' + pct + '%"></span></div>' +
      "</section>" +

      '<aside class="note">' +
        '<span class="badge badge-green badge-lg">' + M.icon("info") + "</span>" +
        "<p>Новый урок открывается каждый день в " + M.esc(C.openTime) + " " + M.esc(C.timezoneLabel) + ". Пропущенный день никуда не денется — к нему можно вернуться, когда будет удобно.</p>" +
      "</aside>" +

      (M.preview ? '<p class="preview-flag">Режим предпросмотра: открыты все дни, видны места под видео и аудио.</p>' : "") +

      '<section aria-labelledby="days-h">' +
        '<h2 id="days-h">Все <span class="hl">дни</span> марафона</h2>' +
        '<ul class="days">' + cards + "</ul>" +
      "</section>" +

      '<a class="bonus-banner" href="' + M.bonusLink() + '">' +
        '<span class="badge badge-blue badge-lg">' + M.icon("gift") + "</span>" +
        '<div><h2>Дополнительные <span class="hl">материалы</span></h2>' +
        "<p>Отёки, кофе, вечерний жор, метаболизм, тренировки с видео упражнений — можно заглянуть в любой день.</p></div>" +
        M.icon("arrowRight") +
      "</a>";
  }

  M.setHeader();
  document.title = C.title;
  M.gate().then(M.loadDays).then(render).catch(function () {
    root.innerHTML = '<div class="card"><h2>Не получилось загрузить уроки</h2><p class="soft">Обнови страницу. Если не помогло — напиши организатору марафона.</p></div>';
  });
})();
