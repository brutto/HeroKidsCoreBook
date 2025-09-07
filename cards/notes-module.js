export class NotesModule{
  constructor(){ this.id='notes'; this.title='Заметки'; }
  headerActions(){ return '' }
  mount(ctx){
    const slot = ctx.store.activeSlot();
    const ta = document.createElement('textarea');
    ta.className='input'; ta.style.width='100%'; ta.style.minHeight='90px'; ta.placeholder='Любые заметки по герою или приключению';
    ta.value = slot.modules[this.id]?.text || '';
    ta.addEventListener('input', ()=>{
      slot.modules[this.id] = { text: ta.value };
      ctx.store.save();
    });
    ctx.el.appendChild(ta);
  }
}