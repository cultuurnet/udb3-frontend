const ID_TOKEN_COOKIE_NAME = 'idToken';

const PINNED_CLAIMS = {
  email: 'vrt-mock@example.com',
  'https://publiq.be/first_name': 'VRT Mock User',
  // Temporary — swap for a real avatar placeholder when VRT-DATA-IMAGES lands.
  picture: '/assets/storybook-image-placeholder.png',
};

const unpinnableError = (reason) =>
  new Error(
    `\nThe ${ID_TOKEN_COOKIE_NAME} cookie ${reason}, so baselines would show the real account's name and email.\n`,
  );

const decodeClaims = (payload) => {
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
  } catch {
    throw unpinnableError('does not carry decodable JWT claims');
  }
};

const pinClaims = (idToken) => {
  const [header, payload, signature] = idToken.split('.');
  const claims = { ...decodeClaims(payload), ...PINNED_CLAIMS };
  const pinned = Buffer.from(JSON.stringify(claims)).toString('base64url');

  return `${header}.${pinned}.${signature}`;
};

export const pinProfileClaims = (cookies) => {
  if (!cookies.some((cookie) => cookie.name === ID_TOKEN_COOKIE_NAME)) {
    throw unpinnableError('is missing from the authenticated session');
  }

  return cookies.map((cookie) =>
    cookie.name === ID_TOKEN_COOKIE_NAME
      ? { ...cookie, value: pinClaims(cookie.value) }
      : cookie,
  );
};
