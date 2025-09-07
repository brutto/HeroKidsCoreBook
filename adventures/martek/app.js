(function(){
  const cfg = window.__APP_CONFIG__;
  const pageInput = document.getElementById('pageInput');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const resetBtn = document.getElementById('resetBtn');
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const importFile = document.getElementById('importFile');
  const editor = document.getElementById('editor');
  const pdfFrame = document.getElementById('pdfFrame');
  const pdfWrap = document.getElementById('pdfWrap');
  const lightbox = document.getElementById('lightbox');
  const pdfFull = document.getElementById('pdfFull');
  const closeLightbox = document.getElementById('closeLightbox');

  // State
  let page = 1;
  const clamp = v => Math.max(1, Math.min(cfg.totalPages, v));

  // Storage helpers
  function loadState(){
    try{
      const raw = localStorage.getItem(cfg.storageKey);
      return raw ? JSON.parse(raw) : { pages: {} };
    }catch(e){
      console.warn('Storage parse error', e);
      return { pages: {} };
    }
  }
  function saveState(state){
    localStorage.setItem(cfg.storageKey, JSON.stringify(state));
  }
  let state = loadState();

  function saveCurrent(){
    state.pages[page] = editor.innerHTML.trim();
    saveState(state);
  }

  function render(){
    // Load editor content for current page
    editor.innerHTML = state.pages[page] || '';
    pageInput.value = page;
    // Update PDF iframe
    // Use '#page=N&zoom=page-fit' to request a given page
    pdfFrame.src = cfg.pdfPath + '#page=' + page + '&zoom=page-fit';
    // And update the lightbox src if open
    if(lightbox.classList.contains('show')){
      pdfFull.src = cfg.pdfPath + '#page=' + page + '&zoom=page-fit';
    }
  }

  // Navigation
  function goTo(newPage){
    newPage = clamp(newPage);
    if(newPage === page) return;
    saveCurrent();
    page = newPage;
    render();
  }

  prevBtn.addEventListener('click', ()=> goTo(page - 1));
  nextBtn.addEventListener('click', ()=> goTo(page + 1));
  pageInput.addEventListener('change', (e)=> goTo(parseInt(e.target.value || '1', 10)));
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'ArrowLeft') goTo(page - 1);
    if(e.key === 'ArrowRight') goTo(page + 1);
    if((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's'){
      e.preventDefault(); saveCurrent();
    }
    if(e.key === 'Escape' && lightbox.classList.contains('show')){
      toggleLightbox(false);
    }
  });

  // Auto-save on input
  let saveTimer = null;
  editor.addEventListener('input', ()=>{
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveCurrent, 400);
  });

  // Clear current page translation
  resetBtn.addEventListener('click', ()=>{
    if(confirm('Очистить перевод на этой странице?')){
      delete state.pages[page];
      saveState(state);
      render();
    }
  });

  // Export/import translations
  exportBtn.addEventListener('click', ()=>{
    saveCurrent();
    const blob = new Blob([JSON.stringify(state, null, 2)], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'martek-ru-translations.json';
    a.click();
    setTimeout(()=> URL.revokeObjectURL(a.href), 1000);
  });
  importBtn.addEventListener('click', ()=> importFile.click());
  importFile.addEventListener('change', (e)=>{
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try{
        const data = JSON.parse(reader.result);
        if(!data || typeof data !== 'object' || !data.pages){
          throw new Error('Некорректный формат файла');
        }
        state = data;
        saveState(state);
        render();
        alert('Импорт выполнен');
      }catch(err){
        alert('Ошибка импорта: ' + err.message);
      }
    };
    reader.readAsText(file, 'utf-8');
  });

  // Lightbox (fullscreen PDF)
  function toggleLightbox(show){
    lightbox.classList.toggle('show', !!show);
    lightbox.setAttribute('aria-hidden', show ? 'false' : 'true');
    if(show){
      pdfFull.src = cfg.pdfPath + '#page=' + page + '&zoom=page-fit';
    }else{
      pdfFull.src = '';
    }
  }
  pdfWrap.addEventListener('click', ()=> toggleLightbox(true));
  closeLightbox.addEventListener('click', ()=> toggleLightbox(false));

  // Initialize
  render();
})();