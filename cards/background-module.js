// cards/background-module.js
import { idbSet, idbGet, idbDel } from './idb.js';

export class BackgroundModule {
  constructor() {
    this.id = 'background';
    this.title = 'Фон карточки';
  }

  headerActions() {
    return `
      <span class="muted">Непрозрачность:</span>
      <input class="input" type="range" min="0" max="100" value="100" step="1" data-el="opacity">
      <select class="input" data-el="fit" title="Режим">
        <option value="contain">Вписать</option>
        <option value="cover">Заполнить</option>
      </select>
      <button class="btn small ghost" data-act="clear">Удалить фон</button>
    `;
  }

  mount(ctx) {
    const defaults = { opacity: 100, fit: 'contain' };
    const slot = ctx.store.activeSlot();
    const assetKey = `bg:${slot.id}`; // стабильный ключ в IndexedDB

    // ── каркас UI
    const root = document.createElement('div');
    root.innerHTML = `
      <div class="bg-dropzone" data-el="drop">
        <div class="bg-preview" data-el="preview">
          <div class="bg-hint">
            Перетащи изображение, кликни для выбора, либо Ctrl/⌘+V для вставки из буфера.
          </div>
        </div>
        <input type="file" accept="image/*" data-el="file" hidden>
      </div>
      <p class="muted" style="margin-top:6px">
        Картинка хранится в IndexedDB, настройки — в localStorage. Большие файлы автоматически уменьшаются.
      </p>
    `;
    ctx.el.appendChild(root);

    // элементы
    const header    = ctx.shell.querySelector('.mod-hd');
    const opacityEl = header.querySelector('[data-el="opacity"]');
    const fitEl     = header.querySelector('[data-el="fit"]');
    const btnClear  = header.querySelector('[data-act="clear"]');

    const drop      = root.querySelector('[data-el="drop"]');
    const fileInput = root.querySelector('[data-el="file"]');
    const preview   = root.querySelector('[data-el="preview"]');

    // одно img внутри превью — управляем прозрачностью и вписыванием
    const img = document.createElement('img');
    img.className = 'bg-preview-img';
    img.alt = 'Фон карточки';
    preview.appendChild(img);

    const getState = () => ctx.store.getModule(this.id, defaults);

    // init контролов
    const st = getState();
    opacityEl.value = st.opacity ?? 100;
    fitEl.value     = st.fit || 'contain';

    // рендер
    const render = async () => {
      const s = getState();
      preview.style.setProperty('--bg-opacity', (s.opacity ?? 100) / 100);
      preview.style.setProperty('--bg-fit', s.fit || 'contain');

      const dataUrl = await idbGet(assetKey);
      if (dataUrl) {
        img.src = dataUrl;
        preview.classList.add('has-image');
      } else {
        img.removeAttribute('src');
        preview.classList.remove('has-image');
      }
    };

    // события контролов
    opacityEl.addEventListener('input', () => {
      ctx.store.patchModule(this.id, { opacity: parseInt(opacityEl.value, 10) });
      render();
    });

    fitEl.addEventListener('change', () => {
      ctx.store.patchModule(this.id, { fit: fitEl.value });
      render();
    });

    btnClear.addEventListener('click', async () => {
      await idbDel(assetKey);
      ctx.store.setModule(this.id, { ...defaults });
      render();
    });

    // drag & drop / click / paste
    drop.addEventListener('click', () => fileInput.click());
    drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('dragover'); });
    drop.addEventListener('dragleave', () => drop.classList.remove('dragover'));
    drop.addEventListener('drop', async (e) => {
      e.preventDefault(); drop.classList.remove('dragover');
      const f = [...(e.dataTransfer?.files || [])].find((x) => x.type.startsWith('image/'));
      if (f) await handleFile(f);
    });
    root.addEventListener('paste', async (e) => {
      const file = [...(e.clipboardData?.items || [])]
        .map((i) => i.getAsFile && i.getAsFile())
        .find((f) => f && f.type?.startsWith('image/'));
      if (file) { e.preventDefault(); await handleFile(file); }
    });
    fileInput.addEventListener('change', async () => {
      const f = fileInput.files?.[0];
      if (f) await handleFile(f);
      fileInput.value = '';
    });

    // обработка файла: dataURL -> даунскейл -> IndexedDB
    const MAX_SIDE = 1200;
    const JPEG_QUALITY = 0.7;

    async function handleFile(file) {
      const dataUrl = await fileToDataUrl(file);
      const scaled  = await downscaleDataUrl(dataUrl, MAX_SIDE, JPEG_QUALITY);
      await idbSet(assetKey, scaled);
      render();
    }

    render();
  }
}

/* ── утилиты ───────────────────────────── */
function fileToDataUrl(file) {
  return new Promise((res, rej) => {
    const rd = new FileReader();
    rd.onload = () => res(rd.result);
    rd.onerror = rej;
    rd.readAsDataURL(file);
  });
}

function downscaleDataUrl(dataUrl, maxSide, quality = 0.7) {
  return new Promise((res) => {
    const img = new Image();
    img.onload = () => {
      let { width: w, height: h } = img;
      const scale = Math.min(1, maxSide / Math.max(w, h));
      if (scale < 1) { w = Math.round(w * scale); h = Math.round(h * scale); }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      const hasAlpha = dataUrl.startsWith('data:image/png');
      const out = hasAlpha
        ? canvas.toDataURL('image/png')
        : canvas.toDataURL('image/jpeg', quality);
      res(out);
    };
    img.onerror = () => res(dataUrl);
    img.src = dataUrl;
  });
}
