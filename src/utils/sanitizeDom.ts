import DOMPurify from 'isomorphic-dompurify';

const sanitizationPresets = { EVENT_DESCRIPTION: 'eventDescription' };

const sanitizationOptions = {
  [sanitizationPresets.EVENT_DESCRIPTION]: {
    ALLOWED_TAGS: ['ul', 'ol', 'li', 'span', 'p', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['style', 'href'],
  },
};

const sanitizeDom = (
  html: string,
  preset: string = sanitizationPresets.EVENT_DESCRIPTION,
): string => {
  return DOMPurify.sanitize(html, sanitizationOptions[preset]);
};

export { sanitizationPresets, sanitizeDom };
