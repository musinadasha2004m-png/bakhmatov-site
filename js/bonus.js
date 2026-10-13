/* Дополнительные материалы: список разделов и страница раздела */
(function () {
  "use strict";
  var M = window.Marathon, C = M.config;
  var root = document.getElementById("app");
  var groupId = new URLSearchParams(location.search).get("group");

  function stepNumber(item) {
    var m = /(\d+)/.exec(item.step || "");
    return m ? parseInt(m[1], 10) : -1;
  }
  // ["33", "42-50"] → функция «входит ли номер»
  function matcher(steps) {
    var ranges = (steps || []).map(function (s) {
      var p = String(s).split("-");
      return [parseInt(p[0], 10), parseInt(p[p.length - 1], 10)];
    });
    return function (n) { return ranges.some(function (r) { return n >= r[0] && n <= r[1]; }); };
  }

  // Раскладываем материалы по разделам, порядок внутри раздела — как в файле
  function build(items, cfg) {
    var hidden = matcher(cfg.hidden);
    var groups = cfg.groups.map(function (g) {
      return { id: g.id, title: g.title, about: g.about, icon: g.icon, color: g.color, match: matcher(g.steps), items: [] };
    });
    var rest = { id: "raznoe", title: "Разное", about: "Материалы, которые пока не отнесены ни к одному разделу.", icon: "gift", color: "blue", items: [] };
    items.forEach(function (it) {
      var n = stepNumber(it);
      if (hidden(n)) return;
      var g = groups.filter(function (x) { return x.match(n); })[0] || rest;
      g.items.push(it);
    });
    if (rest.items.length) groups.push(rest);
    return groups.filter(function (g) { return g.items.length; });
  }

  function plural(n, one, few, many) {
    var a = n % 10, b = n % 100;
    return a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 12 || b > 14) ? few : many;
  }
  function summary(g) {
    var video = 0, audio = 0, photo = 0;
    g.items.forEach(function (it) {
      if (it.type === "video" || it.type === "video_note" || it.type === "document") video++;
      else if (it.type === "voice") audio++;
      else if (it.type === "photo") photo++;
    });
    var parts = [];
    if (video) parts.push(video + " видео");
    if (audio) parts.push(audio + " аудио");
    if (photo) parts.push(photo + " " + plural(photo, "картинка", "картинки", "картинок"));
    return parts.length ? parts.join(" · ") : "Текст";
  }

  function renderList(groups) {
    document.title = "Дополнительные материалы — " + C.title;
    root.innerHTML =
      '<a class="back" href="' + M.homeLink() + '">' + M.icon("arrowLeft") + "Все дни</a>" +
      '<section class="hero">' +
        '<p class="eyebrow">Не привязаны к дням</p>' +
        '<h1>Дополнительные <span class="hl">материалы</span></h1>' +
        '<p class="lead">Темы, к которым можно заглянуть в любой момент — когда появился вопрос или просто интересно. Ничего из этого не обязательно.</p>' +
      "</section>" +
      '<ul class="bonus-grid">' + groups.map(function (g) {
        return '<li><a class="bonus-card" href="' + M.bonusLink(g.id) + '">' +
          '<span class="badge badge-' + (g.color === "green" ? "green" : "blue") + ' badge-lg">' + M.icon(g.icon) + "</span>" +
          '<div class="bonus-card-body"><h2>' + M.esc(g.title) + "</h2><p>" + M.esc(g.about || "") + "</p>" +
          '<span class="chip chip-' + (g.color === "green" ? "green" : "blue") + '">' + summary(g) + "</span></div></a></li>";
      }).join("") + "</ul>";
  }

  function renderGroup(groups, idx) {
    var g = groups[idx], prev = groups[idx - 1], next = groups[idx + 1];
    document.title = g.title + " — " + C.title;
    root.classList.add("narrow");
    root.innerHTML =
      '<a class="back" href="' + M.bonusLink() + '">' + M.icon("arrowLeft") + "Все материалы</a>" +
      '<header class="day-head">' +
        '<p class="eyebrow">Дополнительные материалы</p>' +
        "<h1>" + M.esc(g.title) + "</h1>" +
      "</header>" +
      '<article class="card lesson">' + M.renderItems(g.items) + "</article>" +
      '<nav class="day-nav" aria-label="Соседние разделы">' +
        (prev ? '<a class="btn btn-secondary" href="' + M.bonusLink(prev.id) + '">' + M.icon("arrowLeft") + "Назад</a>" : "<span></span>") +
        (next ? '<a class="btn btn-secondary" href="' + M.bonusLink(next.id) + '">Дальше' + M.icon("arrowRight") + "</a>" : "") +
      "</nav>";
    M.checkDocs(root);
  }

  function render(data) {
    var groups = build(data[0], data[1]);
    var idx = -1;
    groups.forEach(function (g, i) { if (g.id === groupId) idx = i; });
    if (idx === -1) renderList(groups); else renderGroup(groups, idx);
  }

  M.setHeader();
  M.gate()
    .then(function () { return Promise.all([M.loadJson("data/bonus_with_media.json"), M.loadJson("data/bonus_groups.json")]); })
    .then(render)
    .catch(function () {
      root.innerHTML = '<div class="card"><h2>Не получилось загрузить материалы</h2><p class="soft">Обнови страницу. Если не помогло — напиши организатору марафона.</p></div>';
    });
})();
