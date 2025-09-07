export class InventoryModule {
  constructor() {
    this.id = 'inventory';
    this.title = 'Инвентарь';
  }

  headerActions() {
    return `
      <span class="muted">Лимит:</span>
      <input class="input" type="number" min="1" max="12" step="1" data-act="cap" style="width:72px">
      <button class="btn small ghost" data-act="clear">Очистить</button>
    `;
  }

  mount(ctx) {
    const defaults = { capacity: 5, items: [] };
    const state = ctx.store.getModule(this.id, defaults);

    // ── каркас UI
    const root = document.createElement('div');
    root.innerHTML = `
      <div class="row" style="margin-bottom:8px">
        <input class="input" type="text" placeholder="Название предмета…" data-el="name" style="flex:1 1 auto; min-width:200px">
        <button class="btn" data-act="add">Добавить</button>
      </div>
      <div class="inv-grid" data-el="grid"></div>
      <p class="muted" data-el="status" style="margin-top:8px"></p>
    `;
    ctx.el.appendChild(root);

    // ── элементы управления в хедере
    const header = ctx.shell.querySelector('.mod-hd');
    const capInput = header.querySelector('[data-act="cap"]');
    const btnClear = header.querySelector('[data-act="clear"]');

    capInput.value = state.capacity;
    capInput.addEventListener('change', () => {
      const next = clamp(parseInt(capInput.value, 10), 1, 12);
      // урезаем список, если лимит уменьшился
      const cur = ctx.store.getModule(this.id, defaults);
      if (cur.items.length > next) cur.items = cur.items.slice(0, next);
      ctx.store.patchModule(this.id, { capacity: next, items: cur.items });
      render();
    });

    btnClear.addEventListener('click', () => {
      ctx.store.setModule(this.id, { ...defaults, capacity: current().capacity });
      render();
    });

    // ── элементы внутри тела
    const nameInput = root.querySelector('[data-el="name"]');
    const btnAdd    = root.querySelector('[data-act="add"]');
    const grid      = root.querySelector('[data-el="grid"]');
    const statusEl  = root.querySelector('[data-el="status"]');

    btnAdd.addEventListener('click', addFromInput);
    nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addFromInput();
    });

    function current() {
      return ctx.store.getModule(ctx.moduleId ?? 'inventory', defaults);
    }

    function addFromInput() {
      const name = (nameInput.value || '').trim();
      if (!name) return;
      const s = current();
      if (s.items.length >= s.capacity) {
        statusEl.textContent = 'Инвентарь полон.';
        return;
      }
      s.items.push({ name });
      ctx.store.patchModule('inventory', { items: s.items });
      nameInput.value = '';
      render();
    }

    function removeAt(idx) {
      const s = current();
      s.items.splice(idx, 1);
      ctx.store.patchModule('inventory', { items: s.items });
      render();
    }

    function render() {
      const s = current();
      // сетка предметов
      grid.innerHTML = '';
      for (let i = 0; i < s.capacity; i++) {
        const filled = i < s.items.length;
        const cell = document.createElement('div');
        cell.className = 'inv-cell' + (filled ? ' filled' : '');
        if (filled) {
          const item = s.items[i];
          cell.innerHTML = `
            <span class="inv-chip" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</span>
            <button class="inv-remove" aria-label="Удалить" title="Удалить">×</button>
          `;
          cell.querySelector('.inv-remove').addEventListener('click', (e) => {
            e.stopPropagation();
            removeAt(i);
          });
        } else {
          cell.textContent = '+';
          cell.title = 'Свободно';
          cell.addEventListener('click', () => nameInput.focus());
        }
        grid.appendChild(cell);
      }
      statusEl.textContent = `Занято ${s.items.length} / ${s.capacity}`;
    }

    render();
  }
}

/* ── утилиты ───────────────────────────── */
function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
