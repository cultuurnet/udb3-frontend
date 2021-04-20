import base64 from 'base-64';

type Token = {
  header?: string;
  payload?: { exp?: number };
  signature?: string;
};

const decode = (value: string) =>
  base64.decode(value.replace(/-/g, '+').replace(/_/g, '/'));

const isTokenValid = (token: string) => {
  if (!token) return false;
  const keys = ['header', 'payload', 'signature'];

  const parts = token.split('.');
  if (parts.length !== 3) return false;

  let decodedToken: Token;

  try {
    decodedToken = parts.reduce<Token>((token, part, index) => {
      if (!part) throw new Error('');
      const data = index < 2 ? JSON.parse(decode(part)) : part;
      return { ...token, [keys[index]]: data };
    }, {});
  } catch {
    return false;
  }

  if (
    !decodedToken?.payload?.exp ||
    Date.now() >= decodedToken.payload.exp * 1000
  ) {
    return false;
  }

  return true;
};

export { isTokenValid };
