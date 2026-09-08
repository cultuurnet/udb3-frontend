import { isSameOriginUrl } from './url';

const baseUrl = 'https://example.com';

describe('isSameOriginUrl', () => {
  it('allows a url on the base origin', () => {
    expect(isSameOriginUrl(`${baseUrl}/dashboard?tab=events`, baseUrl)).toBe(
      true,
    );
  });

  it('rejects another origin', () => {
    expect(isSameOriginUrl('https://evil.example.net/phish', baseUrl)).toBe(
      false,
    );
  });

  it('rejects origins that merely start with the base url', () => {
    expect(isSameOriginUrl(`${baseUrl}.evil.example.net`, baseUrl)).toBe(false);
    expect(isSameOriginUrl(`${baseUrl}@evil.example.net`, baseUrl)).toBe(false);
  });
});
