import getConfig from 'next/config';

class FetchError extends Error {
  status: number;
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

type FetchFromApiOptions = {
  path?: string;
  searchParams?: Record<string, string>;
  options?: Record<string, unknown>;
  silentError?: boolean;
};

const fetchFromApi = async ({
  path,
  searchParams = {},
  options = {},
  silentError = false,
}: FetchFromApiOptions = {}) => {
  const { publicRuntimeConfig } = getConfig();

  let response;
  let url;

  try {
    url = new URL(`${publicRuntimeConfig.apiUrl}${path}`);
    url.search = new URLSearchParams(searchParams);
  } catch (e) {
    if (!silentError) {
      throw new Error(e.message);
    }
    return {
      type: 'ERROR',
      message: e.message ?? 'Unknown error',
    };
  }

  try {
    response = await fetch(url.toString(), options);
  } catch (e) {
    if (!silentError) {
      throw new Error(e.message);
    }

    return {
      type: 'ERROR',
      message: e.message ?? 'Unknown error',
    };
  }

  if (!response.ok) {
    const result = await response.json();

    if (!silentError) {
      throw new FetchError(response?.status, result?.title ?? 'Unknown error');
    }

    return {
      type: 'ERROR',
      status: response?.status,
      message: result?.title ?? 'Unknown error',
    };
  }

  return response;
};

export { fetchFromApi };
