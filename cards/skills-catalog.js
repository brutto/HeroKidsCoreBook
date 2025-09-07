// cards/skills-catalog.js
// В реальном проекте можно загружать JSON или хранить в IndexedDB.
// Пока это статический список.
export const SKILLS_CATALOG = [
  {
    id: 'history',
    name: 'Истории и предания',
    description: 'Герой разбирается в истории и преданиях.',
    icon: `
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 19.5A2.5 2.5 0 006.5 22h11a2.5 2.5 0 002.5-2.5V4.5A2.5 2.5 0 0017.5 2h-11A2.5 2.5 0 004 4.5v15z"></path>
      </svg>
    `,
  },
  {
    id: 'stealth',
    name: 'Маскировка и скрытность',
    description: 'Герой умеет маскироваться и красться.',
    icon: `
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z"></path>
      </svg>
    `,
  },
  {
    id: 'tracking',
    name: 'Выслеживание',
    description: 'Герой может выслеживать людей или животных.',
    icon: `
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.364-7.364l-1.414 1.414M7.05 16.95l-1.414 1.414M16.95 16.95l1.414 1.414M7.05 7.05L5.636 5.636"></path>
      </svg>
    `,
  },
  {
    id: 'speech',
    name: 'Красноречие',
    description: 'Герой хорошо говорит и способен расположить к себе даже враждебных персонажей.',
    icon: `
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"></path>
      </svg>
    `,
  },
  {
    id: 'flight',
    name: 'Полет',
    description: 'Герой может перелетать через преграды и врагов.',
    icon: `
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6">
        <path d="M2.5 19.5L21.5 12 2.5 4.5v5l15 2.5-15 2.5v5z"></path>
      </svg>
    `,
  },
  {
    id: 'darkvision',
    name: 'Ночное зрение',
    description: 'Герой видит в темноте и при слабом освещении.',
    icon: `
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z"></path>
      </svg>
    `,
  },
];
