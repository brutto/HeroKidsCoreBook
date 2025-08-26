const sidebar = document.querySelector('#sidebar-menu');
const menuKey = 'cachedMenuHtml';

function normalizePath(href) {
  try {
    // поддержка относительных ссылок в меню
    const url = new URL(href, location.origin);
    let p = url.pathname;

    // убрать /index.html и конечный слэш
    p = p.replace(/\/index\.html?$/i, '/');
    if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);

    return p;
  } catch {
    return href;
  }
}

function highlightActiveLink() {
  // текущая страница, нормализованная
  const current = normalizePath(location.pathname);

  // пройдёмся по всем ссылкам в меню
  const links = sidebar.querySelectorAll('a[href]');
  let best = null;
  let bestScore = -1;

  links.forEach(a => {
    const linkPath = normalizePath(a.getAttribute('href'));

    // точное совпадение — самый высокий приоритет
    if (linkPath === current) {
      best = a;
      bestScore = Infinity;
      return;
    }

    // если меню имеет "разделы" (например /docs/...), берём самый длинный общий префикс
    if (current.startsWith(linkPath) && linkPath !== '' && linkPath !== '/') {
      const score = linkPath.length;
      if (score > bestScore) {
        best = a;
        bestScore = score;
      }
    }
  });

  // снять прошлую активность
  sidebar.querySelectorAll('a.active').forEach(a => a.classList.remove('active'));

  if (best) {
    best.classList.add('active');

    // если пункт вне видимой области — проскроллим к нему мягко
    best.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

function resetOnIndex() {
  const path = location.pathname.replace(/\/+$/, ''); // убираем лишние /
  if (path === '' || path === '/' || path.endsWith('/index.html')) {
    localStorage.removeItem('sidebarScroll');
  }
}

function renderMenu(html) {
  sidebar.innerHTML = html;
  document.dispatchEvent(new Event('menuLoaded'));

  resetOnIndex();

  // подсветить активный пункт после вставки меню
  highlightActiveLink();

  // восстановить скролл
  const scroll = localStorage.getItem('sidebarScroll');
  if (scroll) sidebar.scrollTop = scroll;

  // сохраняем скролл при клике
  sidebar.addEventListener('click', function(e) {
    const a = e.target.closest('a');
    if (!a) return;

    localStorage.setItem('sidebarScroll', sidebar.scrollTop);

    // моментально подсветим выбранный пункт (приятнее при переходе)
    sidebar.querySelectorAll('a.active').forEach(x => x.classList.remove('active'));
    a.classList.add('active');
  });
}

const cached = localStorage.getItem(menuKey);
if (cached) {
  renderMenu(cached);
} else {
  fetch('/menu.html')
    .then(r => r.text())
    .then(html => {
      localStorage.setItem(menuKey, html);
      renderMenu(html);
    });
}

// если у тебя есть клиентская навигация/якоря, можно обновлять подсветку при смене URL:
window.addEventListener('popstate', highlightActiveLink);
window.addEventListener('hashchange', highlightActiveLink);
document.addEventListener('menuLoaded', highlightActiveLink);

document.querySelector('#home').addEventListener('click', () => {
  // сбрасываем сохранённый скролл
  localStorage.removeItem('sidebarScroll');
});

