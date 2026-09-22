// The completeness gauge animates its needle with a D3 transition, which is
// JavaScript, so toHaveScreenshot's CSS animation reset never reaches it.
// DynamicBarometerIcon reads this query and stops animating when it matches.

export const pinReducedMotion = (page) =>
  page.emulateMedia({ reducedMotion: 'reduce' });
