// cards/class-module.js
import { CLASSES_CATALOG, CUSTOM_CLASS_ID, ICONS } from './classes-catalog.js';

export class ClassModule {
  constructor() {
    this.id = 'class';
    this.title = 'Класс';
    this.layout = 'half'; // стоит рядом с модулем Имя
  }

  headerActions() {
    // в хедере кнопки не нужны — весь UX в теле модуля
    return `<button class="btn small ghost" data-act="clear">Сброс</button>`;
  }

  mount(ctx) {
    const defaults = { classId: '', customName: '' };
    const getState = () => ctx.store.getModule(this.id, defaults);
    const setState = (next) => ctx.store.setModule(this.id, next);

    // Корпус: текущая карточка (кнопка) + поповер-пикер
    const root = document.createElement('div');
    root.className = 'class-wrap';
    root.innerHTML = `
      <button type="button" class="class-card as-toggle" data-el="current" title="Нажмите, чтобы выбрать класс">
        <div class="class-icon" data-el="icon">${ICONS.shield}</div>
        <div class="class-name" data-el="name">Не выбран</div>
      </button>

      <div class="class-popover" data-el="popover" hidden>
        <div class="class-popover-content" role="menu" tabindex="-1" data-el="menu"></div>
      </div>

      <div class="class-custom" data-el="customRow" hidden>
        <input class="input" type="text" placeholder="Свой класс…" data-el="customInput">
      </div>
    `;
    ctx.el.appendChild(root);

    // Элементы
    const header     = ctx.shell.querySelector('.mod-hd');
    const btnClear   = header.querySelector('[data-act="clear"]');

    const curBtn     = root.querySelector('[data-el="current"]');
    const iconEl     = root.querySelector('[data-el="icon"]');
    const nameEl     = root.querySelector('[data-el="name"]');

    const popover    = root.querySelector('[data-el="popover"]');
    const menu       = popover.querySelector('[data-el="menu"]');

    const customRow  = root.querySelector('[data-el="customRow"]');
    const customInput= root.querySelector('[data-el="customInput"]');

    // Сброс
    btnClear.addEventListener('click', () => {
      setState({ classId: '', customName: '' });
      closePopover();
      render();
    });

    // Открыть/закрыть поповер
    curBtn.addEventListener('click', () => (popover.hidden ? openPopover() : closePopover()));

    function openPopover() {
      buildMenu();                          // построить варианты
      popover.hidden = false;
      menu.focus();
      document.addEventListener('click', onDocClick, true);
      document.addEventListener('keydown', onEsc, true);
    }
    function closePopover() {
      popover.hidden = true;
      document.removeEventListener('click', onDocClick, true);
      document.removeEventListener('keydown', onEsc, true);
    }
    function onDocClick(e) {
      if (!popover.contains(e.target) && e.target !== curBtn) closePopover();
    }
    function onEsc(e) { if (e.key === 'Escape') closePopover(); }

    // Построение меню
    function buildMenu() {
      const s = getState();
      menu.innerHTML = '';

      // Пункт «не выбран»
      menu.appendChild(optionItem({
        id: '',
        name: '— Не выбран —',
        icon: ICONS.shield
      }, s.classId === '', () => { setState({ classId: '', customName: '' }); closePopover(); render(); }));

      // Справочник классов
      for (const c of CLASSES_CATALOG) {
        menu.appendChild(optionItem(c, s.classId === c.id, () => {
          setState({ classId: c.id, customName: '' });
          closePopover();
          render();
        }));
      }

      // Кастомный
      menu.appendChild(optionItem({
        id: CUSTOM_CLASS_ID,
        name: 'Свой класс…',
        icon: ICONS.cloak
      }, s.classId === CUSTOM_CLASS_ID, () => {
        const cur = getState();
        setState({ classId: CUSTOM_CLASS_ID, customName: cur.customName || '' });
        closePopover();
        render();
        customInput?.focus();
      }));
    }

    // Ввод «Свой класс»
    customInput.addEventListener('input', () => {
      const s = getState();
      if (s.classId === CUSTOM_CLASS_ID) {
        setState({ classId: s.classId, customName: customInput.value });
        renderCurrent();
      }
    });

    // Рендер карточки текущего выбора
    function renderCurrent() {
      const s = getState();
      if (!s.classId) {
        iconEl.innerHTML = ICONS.shield;
        nameEl.textContent = 'Не выбран';
        customRow.hidden = true;
        return;
      }
      if (s.classId === CUSTOM_CLASS_ID) {
        iconEl.innerHTML = ICONS.cloak;
        nameEl.textContent = (s.customName || 'Свой класс').trim();
        customRow.hidden = false;
        return;
      }
      const found = CLASSES_CATALOG.find(c => c.id === s.classId);
      if (found) {
        iconEl.innerHTML = found.icon;
        nameEl.textContent = found.name;
      } else {
        iconEl.innerHTML = ICONS.shield;
        nameEl.textContent = 'Неизвестный класс';
      }
      customRow.hidden = true;
    }

    function render() {
      renderCurrent();
      if (!popover.hidden) buildMenu();
    }

    render();

    /* ===== helpers (внутри mount) ===== */
    function optionItem(cls, isActive, onPick) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'class-option';
      btn.setAttribute('role', 'menuitem');
      btn.innerHTML = `
        <div class="class-option-icon">${cls.icon || ICONS.shield}</div>
        <div class="class-option-name">${escapeHtml(cls.name || '')}</div>
        ${isActive ? '<div class="class-option-check" aria-hidden="true">✓</div>' : ''}
      `;
      btn.addEventListener('click', onPick);
      return btn;
    }
  }
}

/* ===== утилиты (вне класса) ===== */
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (m)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
