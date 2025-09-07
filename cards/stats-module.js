// cards/stats-module.js
export class StatsModule {
  constructor() {
    this.id = 'stats';
    this.title = 'Характеристики';
  }

  headerActions() {
    return `
      <button class="btn small ghost" data-act="reset">Сбросить всё</button>
    `;
  }

  mount(ctx) {
    const defaults = {
      melee: 0,     // ближний бой
      ranged: 0,    // дальний бой
      magic: 0,     // магический урон
      defense: 0,   // защита
      // Иконки можно переопределить в будущем (напр. через отдельный модуль настроек)
      icons: {
        melee:   defaultIcons.melee,
        ranged:  defaultIcons.ranged,
        magic:   defaultIcons.magic,
        defense: defaultIcons.defense,
      }
    };

    const state = () => ctx.store.getModule(this.id, structuredClone(defaults));
    const header = ctx.shell.querySelector('.mod-hd');

    // Кнопка «Сбросить всё»
    header.querySelector('[data-act="reset"]')
      ?.addEventListener('click', () => {
        const s = state();
        ctx.store.setModule(this.id, { ...structuredClone(defaults), icons: s.icons });
        render();
      });

    // Каркас тела модуля
    const root = document.createElement('div');
    root.className = 'stats-wrap';
    root.innerHTML = `
      ${rowTemplate('melee',   'Ближний бой')}
      ${rowTemplate('ranged',  'Дальний бой')}
      ${rowTemplate('magic',   'Магический урон')}
      ${rowTemplate('defense', 'Защита')}
    `;
    ctx.el.appendChild(root);

    // Навесим обработчики на пипсы
    for (const key of ['melee', 'ranged', 'magic', 'defense']) {
      const row = root.querySelector(`[data-stat="${key}"]`);
      row.addEventListener('click', (e) => {
        const pip = e.target.closest('[data-idx]');
        if (!pip) return;
        const idx = Number(pip.dataset.idx); // 0..3
        const s = state();
        const cur = clamp(Number(s[key] || 0), 0, 4);
        const next = (cur <= idx) ? (idx + 1) : idx; // если кликаем на неактивный — увеличиваем, иначе уменьшаем
        ctx.store.patchModule(this.id, { [key]: clamp(next, 0, 4) });
        render();
      });
    }

    function render() {
      const s = state();
      // для каждой характеристики: актуализируем иконку и заполненность пипсов
      for (const key of ['melee', 'ranged', 'magic', 'defense']) {
        const row = root.querySelector(`[data-stat="${key}"]`);
        // иконка
        const iconEl = row.querySelector('[data-el="icon"]');
        iconEl.innerHTML = s.icons?.[key] || defaultIcons[key];

        // значение 0..4
        const val = clamp(Number(s[key] || 0), 0, 4);
        row.querySelectorAll('[data-idx]').forEach((el, i) => {
          el.classList.toggle('on', i < val);
          el.setAttribute('aria-pressed', String(i < val));
        });
        row.querySelector('[data-el="value"]').textContent = String(val);
      }
    }

    render();
  }
}

/* ---------- шаблоны/утилиты ---------- */
function rowTemplate(key, label) {
  return `
    <div class="stat-row" data-stat="${key}">
      <div class="stat-left">
        <div class="stat-icon" data-el="icon" aria-hidden="true"></div>
        <div class="stat-label">${escapeHtml(label)}</div>
      </div>
      <div class="stat-right" role="group" aria-label="${escapeAttr(label)}">
        <div class="pips" data-el="pips">
          <button type="button" class="pip" data-idx="0" aria-pressed="false" aria-label="1"></button>
          <button type="button" class="pip" data-idx="1" aria-pressed="false" aria-label="2"></button>
          <button type="button" class="pip" data-idx="2" aria-pressed="false" aria-label="3"></button>
          <button type="button" class="pip" data-idx="3" aria-pressed="false" aria-label="4"></button>
        </div>
        <div class="stat-value" aria-live="polite"><span data-el="value">0</span>/4</div>
      </div>
    </div>
  `;
}

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, (m)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function escapeAttr(s) { return escapeHtml(s).replace(/"/g, '&quot;'); }

/* Встроенные SVG-иконки по умолчанию (можно заменить позже) */
const defaultIcons = {
  melee: `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M14.5 3.5l6 6-8.5 8.5a4 4 0 01-2.83 1.17H6v-3.17A4 4 0 017.17 13L14.5 5.67z"></path>
      <path d="M13 7l4 4"></path>
    </svg>
  `,
  ranged: `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M21 3l-6.5 6.5"></path>
      <path d="M17 3h4v4"></path>
      <path d="M3 21l10-10"></path>
      <path d="M12 6l6 6"></path>
    </svg>
  `,
  magic: `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  `,
  defense: `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 3l7 4v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V7l7-4z"></path>
    </svg>
  `,
};
