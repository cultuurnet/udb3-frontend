import {
  getStatusFromResults,
  QueryStatus,
  useAuthenticatedQuery,
} from './authenticated-query';

// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/test/utils/setupPage' or its... Remove this comment to see the full error message
import { mockResponses, setupPage } from '@/test/utils/setupPage';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/test/utils/renderHookWithWra... Remove this comment to see the full error message
import { renderHookWithWrapper } from '@/test/utils/renderHookWithWrapper';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/utils/fetchFromApi' or its c... Remove this comment to see the full error message
import { fetchFromApi } from '@/utils/fetchFromApi';

const queryFn = async ({ headers, ...queryData }) => {
  const res = await fetchFromApi({
    path: '/random',
    options: {
      headers,
    },
  });

  return await res.json();
};

describe('getStatusFromResults', () => {
  it('returns error when one result is errror', async () => {
    const result = getStatusFromResults([
      { status: QueryStatus.SUCCESS },
      { status: QueryStatus.ERROR, error: 'this is an error' },
      { status: QueryStatus.ERROR, error: 'this is another error' },
      { status: QueryStatus.SUCCESS },
    ]);
    expect(result).toStrictEqual({
      status: QueryStatus.ERROR,
      error: ['this is an error', 'this is another error'],
    });
  });

  it('returns success when every result is a success', async () => {
    const result = getStatusFromResults([
      { status: QueryStatus.SUCCESS },
      { status: QueryStatus.SUCCESS },
    ]);
    expect(result).toStrictEqual({
      status: QueryStatus.SUCCESS,
    });
  });

  it('returns idle when one results is idle', async () => {
    const result = getStatusFromResults([
      { status: QueryStatus.SUCCESS },
      { status: QueryStatus.IDLE },
    ]);
    expect(result).toStrictEqual({
      status: QueryStatus.IDLE,
    });
  });

  it('returns loading when one results is loading', async () => {
    const result = getStatusFromResults([
      { status: QueryStatus.IDLE },
      { status: QueryStatus.LOADING },
    ]);
    expect(result).toStrictEqual({
      status: QueryStatus.LOADING,
    });
  });
});

describe('useAuthenticatedQuery', () => {
  let page;

  beforeEach(() => {
    fetch.resetMocks();
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'resetMocks' does not exist on type '(inp... Remove this comment to see the full error message
    page = setupPage();
  });

  it('returns data', async () => {
    const body = { data: '12345' };

    mockResponses({
      '/random': { body },
    });

    const { result, waitForNextUpdate } = renderHookWithWrapper(() =>
      useAuthenticatedQuery({
        queryKey: ['random'],
        queryFn,
      }),
    );

    await waitForNextUpdate();

    expect(result.current.data).toStrictEqual(body);
  });
  it('fails on response not ok', async () => {
    const title = 'This is an error';

    mockResponses({
      '/random': { body: { title }, status: 400 },
    });

    const { result, waitForNextUpdate } = renderHookWithWrapper(() =>
      useAuthenticatedQuery({
        retry: false, // disable retry, otherwise the waitFor times out
        queryKey: ['random'],
        queryFn,
      }),
    );

    await waitForNextUpdate();

    expect(result.current.error.message).toStrictEqual(title);
  });

  it('redirects on 401', async () => {
    mockResponses({
      '/random': { status: 401 },
    });

    const { waitForNextUpdate } = renderHookWithWrapper(() =>
      useAuthenticatedQuery({
        retry: false, // disable retry, otherwise the waitFor times out
        queryKey: ['random'],
        queryFn,
      }),
    );

    await waitForNextUpdate();
    expect(page.router.push).toBeCalledWith('/login');
  });

  it('redirects on 403', async () => {
    mockResponses({
      '/random': { status: 403 },
    });

    const { waitForNextUpdate } = renderHookWithWrapper(() =>
      useAuthenticatedQuery({
        retry: false, // disable retry, otherwise the waitFor times out
        queryKey: ['random'],
        queryFn,
      }),
    );

    await waitForNextUpdate();
    expect(page.router.push).toBeCalledWith('/login');
  });
});
