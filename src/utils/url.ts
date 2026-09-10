const prefixUrlWithHttps = (url: string) => {
  return url.replace(/(https?:\/\/)?(.+)/, 'https://$2');
};

const isSameOriginUrl = (
  url: unknown,
  baseUrl: string | undefined,
): url is string => {
  if (typeof url !== 'string' || typeof baseUrl !== 'string') {
    return false;
  }

  try {
    return new URL(url).origin === new URL(baseUrl).origin;
  } catch {
    return false;
  }
};

export { isSameOriginUrl, prefixUrlWithHttps };
