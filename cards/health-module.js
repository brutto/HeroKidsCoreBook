// cards/health-module.js
export class HealthModule {
  constructor(max = 4) {
    this.id = 'health';
    this.title = 'Здоровье';
    this.max = Math.max(1, Math.min(8, max));
  }

  headerActions() {
    return `
      <span class="muted">Состояние: </span>
      <span data-el="status">0 / ${this.max}</span>
      <button class="btn small ghost" data-act="reset">Сброс</button>
    `;
  }

  mount(ctx) {
    // по умолчанию здоровье полное = max
    const defaults = { value: this.max, max: this.max };
    const getState = () => ctx.store.getModule(this.id, defaults);
    const setState = (patch) => ctx.store.patchModule(this.id, patch);

    const root = document.createElement('div');
    root.className = 'health-wrap';
    root.innerHTML = `<div class="pips" data-el="pips" role="group" aria-label="Здоровье"></div>`;
    ctx.el.appendChild(root);

    const header   = ctx.shell.querySelector('.mod-hd');
    const statusEl = header.querySelector('[data-el="status"]');
    header.querySelector('[data-act="reset"]')?.addEventListener('click', () => {
      setState({ value: getState().max }); // полное здоровье
      render();
    });

    const pipsEl = root.querySelector('[data-el="pips"]');

    function buildPips() {
      const { max } = getState();
      pipsEl.innerHTML = '';
      for (let i = 0; i < max; i++) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'pip heart';
        btn.dataset.idx = String(i);
        btn.setAttribute('aria-pressed', 'true');
        btn.setAttribute('aria-label', `${i + 1}`);
        btn.innerHTML = HEART_SVG;
        btn.addEventListener('click', () => onPipClick(btn, i));
        pipsEl.appendChild(btn);
      }
    }

    function onPipClick(btn, idx) {
      const s = getState();
      const cur  = clamp(Number(s.value || 0), 0, s.max);
      const next = (idx + 1 > cur) ? (idx + 1) : idx;  // логика «как у характеристик»

      if (next < cur) {
        // Гасим: анимируем именно кликнутый pip (и, при желании, всё что гаснет)
        animateShake(btn); // ← ключевая правка: анимация на нажатом

        // Если хочешь «гасить» всей полосой, раскомментируй:
        for (let i = Math.max(next, 0); i < cur; i++) {
          animateShake(pipsEl.children[i]);
        }
      }

      setState({ value: clamp(next, 0, s.max) });
      render();
    }

    // перезапускаем анимацию, даже если класс уже был
    function animateShake(el) {
      el.classList.remove('shake');   // сброс, чтобы анимация могла перезапуститься
      // форс-рефлоу
      // eslint-disable-next-line no-unused-expressions
      el.offsetWidth;

      // одноразовый слушатель окончания анимации
      const onEnd = () => {
        el.classList.remove('shake');
        el.removeEventListener('animationend', onEnd);
      };
      el.addEventListener('animationend', onEnd);

      el.classList.add('shake');
    }

    function render() {
      const s = getState();
      statusEl.textContent = `${s.value} / ${s.max}`;
      if (pipsEl.children.length !== s.max) buildPips();

      [...pipsEl.children].forEach((el, i) => {
        const on = i < s.value;       // включены слева направо
        el.classList.toggle('off', !on);
        el.classList.toggle('on', on);
        el.setAttribute('aria-pressed', String(on));
      });
    }

    buildPips();
    render();
  }
}

/* utils */
function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

const HEART_SVG = `
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
       stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M20.8 8.6c0 5.2-8.8 10-8.8 10S3.2 13.8 3.2 8.6c0-2.7 2.2-4 4.1-4 1.3 0 2.7.6 3.7 2 1-1.4 2.4-2 3.7-2 1.9 0 4.1 1.3 4.1 4z"/>
  </svg>
`;
