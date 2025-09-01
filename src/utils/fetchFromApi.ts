import getConfig from 'next/config';

class FetchError<TBody = any> extends Error {
  title?: string;
  status: number;
  body?: TBody;

  constructor(status: number, message: string, body?: any) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

class CustomValidationError extends Error {
  body?: ErrorBody | DuplicatePlaceErrorBody;
  constructor(message: string, body?: ErrorBody | DuplicatePlaceErrorBody) {
    super(message);
    this.body = body;
  }
}

type ErrorObject = {
  type: 'ERROR';
  status?: number;
  message: string;
};

export type ErrorBody = {
  detail?: string;
  status?: number;
  title?: string;
  type?: string;
};

export type DuplicatePlaceErrorBody = ErrorBody & {
  query?: string;
  duplicatePlaceUri?: string;
};

const isErrorObject = (value: any): value is ErrorObject => {
  return (
    value.type === 'ERROR' &&
    typeof value.message === 'string' &&
    (!value.status || typeof value.status === 'number')
  );
};

type FetchFromApiArguments = {
  path: string;
  searchParams?: Record<string, string> | URLSearchParams;
  options?: RequestInit;
  silentError?: boolean;
};

const { publicRuntimeConfig } = getConfig();

const fetchFromApi = async <TConfig extends FetchFromApiArguments>({
  path,
  searchParams: searchParamsInit,
  options = {},
  silentError = false,
}: TConfig): Promise<
  TConfig extends { silentError?: true } ? Response | ErrorObject : Response
> => {
  let response: Response;
  let url: URL;

  try {
    url = new URL(`${publicRuntimeConfig.apiUrl}${path}`);
    const searchParams = new URLSearchParams(searchParamsInit ?? {});
    searchParams.delete('queryKey');

    if (searchParams.has('q') && searchParams.get('q') === '') {
      searchParams.delete('q');
    }

    url.search = searchParams.toString();
  } catch (e) {
    if (!silentError) {
      throw new FetchError(400, e?.message ?? 'Unknown error');
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
      throw new FetchError(response?.status, e?.message ?? 'Unknown error');
    }

    return {
      type: 'ERROR',
      message: e.message ?? 'Unknown error',
    };
  }

  if (!response.ok) {
    let result: { title: string };

    const data = await response.text();

    try {
      result = JSON.parse(data);
    } catch (error) {
      result = { title: data };
    }

    if (!silentError) {
      throw new FetchError(
        response?.status,
        result.title || 'Unknown error',
        result,
      );
    }

    return {
      type: 'ERROR',
      status: response?.status,
      message: result.title || 'Unknown error',
    };
  }

  return response;
};

export { CustomValidationError, FetchError, fetchFromApi, isErrorObject };
export type { ErrorObject };
