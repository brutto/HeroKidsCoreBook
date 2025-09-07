export class NameModule {
  constructor() { this.id = 'name'; this.title = 'Имя героя'; }
  mount(ctx) {
    const slot = ctx.store.activeSlot();
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'input';
    input.placeholder = 'Введите имя героя';
    input.value = slot.name || '';

    input.addEventListener('input', () => {
      ctx.store.renameSlot(slot.id, input.value);  // ← сохраняет сам Store
      ctx.bus?.emit('slot:renamed', { id: slot.id, name: input.value });
    });

    ctx.el.appendChild(input);
  }
}
