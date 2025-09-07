// простые монохромные SVG-иконки
export const ICONS = {
  sword: `<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4l6 6M3 21l6-6M12 6l6 6-9 9H3v-6l9-9z"/></svg>`,
  hammer:`<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3h6v6l-3 3-6-6z"/><path d="M2 22l8-8"/></svg>`,
  shield:`<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 4v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V7l7-4z"/></svg>`,
  bow:   `<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 3l-8 8"/><path d="M3 21l8-8M3 3l18 18"/></svg>`,
  daggers:`<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l5-5-3-3-5 5 3 3zM20 4l-5 5 3 3 5-5-3-3z"/></svg>`,
  staff: `<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M7 22l10-10"/><circle cx="16" cy="8" r="3"/></svg>`,
  heal:  `<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v8M8 6h8"/><path d="M20 13a8 8 0 11-16 0 8 8 0 0116 0z"/></svg>`,
  cloak: `<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 21l6-18 6 18"/><path d="M6 21h12"/></svg>`
};

export const CLASSES_CATALOG = [
  { id: 'warrior',  name: 'Воин',            icon: ICONS.sword },
  { id: 'brute',    name: 'Бугай',           icon: ICONS.hammer },
  { id: 'knight',   name: 'Рыцарь',          icon: ICONS.shield },
  { id: 'hunter',   name: 'Охотник',         icon: ICONS.bow },
  { id: 'thrower',  name: 'Метатель ножей',  icon: ICONS.daggers },
  { id: 'mage',     name: 'Колдун',          icon: ICONS.staff },
  { id: 'healer',   name: 'Лекарь',          icon: ICONS.heal },
  { id: 'rogue',    name: 'Бродяга',         icon: ICONS.cloak },
];

export const CUSTOM_CLASS_ID = 'custom';
