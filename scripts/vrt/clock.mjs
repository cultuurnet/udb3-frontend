// Must stay in the past: once Date.now() passes the token's exp, every client query is
// gated off (nav sections and search results silently vanish) and layouts pushes /login.
export const VRT_NOW = new Date('2026-06-15T10:00:00.000Z');

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const vrtDaysFromNow = (days) =>
  new Date(VRT_NOW.getTime() + days * MS_PER_DAY);
