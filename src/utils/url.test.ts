import { isSameOriginUrl, prefixUrlWithHttps } from './url';

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

  it('rejects a scheme downgrade', () => {
    expect(isSameOriginUrl('http://example.com/dashboard', baseUrl)).toBe(
      false,
    );
  });

  it('rejects a non-string value, such as a repeated query parameter', () => {
    expect(
      isSameOriginUrl([`${baseUrl}/a`, 'https://evil.example.net'], baseUrl),
    ).toBe(false);
  });

  it('rejects when there is no base url', () => {
    expect(isSameOriginUrl(`${baseUrl}/dashboard`, undefined)).toBe(false);
  });
});

describe('prefixUrlWithHttps', () => {
  it('adds https to a url without a protocol', () => {
    expect(prefixUrlWithHttps('example.com/agenda?page=2')).toBe(
      'https://example.com/agenda?page=2',
    );
  });

  it('keeps a url that already uses https', () => {
    expect(prefixUrlWithHttps(`${baseUrl}/agenda`)).toBe(`${baseUrl}/agenda`);
  });

  it('upgrades http to https', () => {
    expect(prefixUrlWithHttps('http://example.com/agenda')).toBe(
      `${baseUrl}/agenda`,
    );
  });
});
