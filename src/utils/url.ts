const prefixUrlWithHttps = (url: string) => {
  return url.replace(/(https?:\/\/)?(.+)/, 'https://$2');
};

const isSameOriginUrl = (
  url: unknown,
  baseUrl: string | undefined,
): url is string => {
  try {
    return new URL(String(url)).origin === new URL(String(baseUrl)).origin;
  } catch {
    return false;
  }
};

export { isSameOriginUrl, prefixUrlWithHttps };
