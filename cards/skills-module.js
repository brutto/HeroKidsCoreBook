// cards/skill-module.js
import { SKILLS_CATALOG } from './skills-catalog.js';

export class SkillModule {
  constructor() {
    this.id = 'skills';
    this.title = 'Навыки';
  }

  headerActions() {
    return `
      <span class="muted">Доступно:</span>
      <span data-el="status">0 / 0</span>
      <input class="input" type="number" min="0" max="8" step="1" value="3" data-el="limit" style="width:72px" title="Лимит навыков">
      <button class="btn small" data-act="open">Добавить навык</button>
      <button class="btn small ghost" data-act="reset">Сбросить</button>
    `;
  }

  mount(ctx) {
    const defaults = { skills: [], limit: 3 };
    const getState = () => ctx.store.getModule(this.id, defaults);
    const setState = (next) => ctx.store.setModule(this.id, next);

    // Корень модуля: выбранные навыки + поповер-пикер
    const root = document.createElement('div');
    root.className = 'skills-wrap';
    root.innerHTML = `
      <div class="skills-selected" data-el="selected"></div>
      <div class="skills-popover" data-el="popover" hidden>
        <div class="skills-popover-content" role="menu" tabindex="-1" data-el="menu"></div>
      </div>
    `;
    ctx.el.appendChild(root);

    // Элементы хедера
    const header   = ctx.shell.querySelector('.mod-hd');
    const statusEl = header.querySelector('[data-el="status"]');
    const limitEl  = header.querySelector('[data-el="limit"]');
    const btnOpen  = header.querySelector('[data-act="open"]');
    const btnReset = header.querySelector('[data-act="reset"]');

    // Элементы тела
    const selectedEl = root.querySelector('[data-el="selected"]');
    const popover    = root.querySelector('[data-el="popover"]');
    const menu       = popover.querySelector('[data-el="menu"]');

    // Инициализация лимита
    limitEl.value = clamp(Number(getState().limit ?? 3), 0, 8);
    limitEl.addEventListener('change', () => {
      const next = clamp(parseInt(limitEl.value, 10) || 0, 0, 8);
      const s = getState();
      if ((s.skills?.length || 0) > next) s.skills = s.skills.slice(0, next);
      setState({ skills: s.skills, limit: next });
      render();
    });

    btnReset.addEventListener('click', () => {
      const s = getState();
      setState({ skills: [], limit: s.limit });
      closePopover();
      render();
    });

    // Открыть/закрыть поповер
    btnOpen.addEventListener('click', () => {
      if (popover.hidden) openPopover();
      else closePopover();
    });

    function openPopover() {
      buildMenu();                         // построить список доступных
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
      if (!popover.contains(e.target) && !header.contains(e.target)) closePopover();
    }
    function onEsc(e) {
      if (e.key === 'Escape') closePopover();
    }

    // Построение меню доступных навыков
    function buildMenu() {
      const s = getState();
      const chosen = new Set(s.skills || []);
      const available = SKILLS_CATALOG.filter(sk => !chosen.has(sk.id));

      menu.innerHTML = '';
      if (available.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'skill-empty muted';
        empty.textContent = 'Нет доступных навыков';
        menu.appendChild(empty);
        return;
      }

      for (const skill of available) {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'skill-item as-option';
        item.setAttribute('role', 'menuitem');
        item.innerHTML = `
          <div class="skill-icon">${skill.icon}</div>
          <div class="skill-body">
            <div class="skill-name">${escapeHtml(skill.name)}</div>
            <div class="skill-desc">${escapeHtml(skill.description)}</div>
          </div>
        `;
        item.addEventListener('click', () => {
          const cur = getState();
          if (cur.skills.length >= cur.limit) {
            // Подсветим статус и кнопку «Добавить»
            pulse(statusEl);
            pulse(btnOpen);
            return;
          }
          const list = Array.from(cur.skills || []);
          list.push(skill.id);
          setState({ skills: list, limit: cur.limit });
          closePopover();
          render();
        });
        menu.appendChild(item);
      }
    }

    // Рендер выбранных навыков
    function renderSelected() {
      const s = getState();
      const chosen = new Set(s.skills || []);
      selectedEl.innerHTML = '';

      if (chosen.size === 0) {
        const hint = document.createElement('div');
        hint.className = 'muted';
        hint.textContent = 'Навыки не выбраны. Нажмите «Добавить навык».';
        selectedEl.appendChild(hint);
        return;
      }

      for (const id of s.skills) {
        const skill = SKILLS_CATALOG.find(x => x.id === id);
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'skill-item on as-chip';
        item.title = 'Нажмите, чтобы удалить навык';
        item.innerHTML = `
          <div class="skill-icon">${(skill?.icon) || ''}</div>
          <div class="skill-body">
            <div class="skill-name">${escapeHtml(skill?.name || 'Неизвестно')}</div>
            <div class="skill-desc">${escapeHtml(skill?.description || '')}</div>
          </div>
        `;
        item.addEventListener('click', () => {
          const cur = getState();
          const list = (cur.skills || []).filter(x => x !== id);
          setState({ skills: list, limit: cur.limit });
          // небольшая анимация «shake» на удалённом элементе
          animateShake(item);
          render(); // перерисуем (вернётся в поповер как доступный)
        });
        selectedEl.appendChild(item);
      }
    }

    function renderHeader() {
      const s = getState();
      statusEl.textContent = `${(s.skills || []).length} / ${s.limit}`;
      limitEl.value = clamp(Number(s.limit ?? 3), 0, 8);
    }

    function render() {
      renderHeader();
      renderSelected();
      if (!popover.hidden) buildMenu(); // если открыт — обновим список
    }

    render();
  }
}

/* ===== utils ===== */
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (m)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

function animateShake(el) {
  el.classList.remove('shake');
  // eslint-disable-next-line no-unused-expressions
  el.offsetWidth;
  const onEnd = () => { el.classList.remove('shake'); el.removeEventListener('animationend', onEnd); };
  el.addEventListener('animationend', onEnd);
  el.classList.add('shake');
}
function pulse(el) {
  el.classList.remove('pulse');
  // eslint-disable-next-line no-unused-expressions
  el.offsetWidth;
  const onEnd = () => { el.classList.remove('pulse'); el.removeEventListener('animationend', onEnd); };
  el.addEventListener('animationend', onEnd);
  el.classList.add('pulse');
}
