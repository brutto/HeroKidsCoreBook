fetch('/menu.html')
  .then(response => response.text())
  .then(html => {

    const sidebar = document.querySelector('#sidebar-menu');
    sidebar.insertAdjacentHTML('beforeend', html);

    // Восстанавливаем скролл
    const scroll = localStorage.getItem('sidebarScroll');
    if (scroll) sidebar.scrollTop = scroll;

    // Сохраняем скролл при клике
    sidebar.addEventListener('click', function(e) {
      if (e.target.tagName === 'A') {
        localStorage.setItem('sidebarScroll', sidebar.scrollTop);
      }
    });
  });
