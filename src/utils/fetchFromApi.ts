import getConfig from 'next/config';

class FetchError extends Error {
  // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'status' implicitly has an 'any' type.
  constructor(status, message) {
    // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'message' implicitly has an 'any' type.
    super(message);
    this.status = status;
  }
}

const fetchFromApi = async ({
  path,
  // @ts-expect-error ts-migrate(2525) FIXME: Initializer provides no value for this binding ele... Remove this comment to see the full error message
  searchParams = {},
  options = {},
  silentError = false,
} = {}) => {
  const { publicRuntimeConfig } = getConfig();

  let response;
  let url;

  try {
    url = new URL(`${publicRuntimeConfig.apiUrl}${path}`);
    // @ts-expect-error ts-migrate(2322) FIXME: Type 'URLSearchParams' is not assignable to type '... Remove this comment to see the full error message
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
