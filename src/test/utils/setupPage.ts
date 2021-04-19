import { match } from 'path-to-regexp';
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '@/test/data/user' or its corre... Remove this comment to see the full error message
import { user } from '@/test/data/user';

const mockRouterWithParams = ({ query, ...rest } = {}) => {
  const useRouter = jest.spyOn(require('next/router'), 'useRouter');

  const push = jest.fn();

  const mockRouter = {
    pathname: '/',
    query: {
      ...(query ?? {}),
    },
    asPath: '/',
    push,
    prefetch: jest.fn().mockResolvedValue(undefined),
    ...rest,
  };

  useRouter.mockImplementation(() => mockRouter);
  return mockRouter;
};

const mockResponses = (responses) => {
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'mockResponse' does not exist on type '(i... Remove this comment to see the full error message
  fetch.mockResponse((req) => {
    const url = req.url.split('http://localhost:3000')[1];

    const foundPath = Object.keys(responses).find((path) => match(path)(url));
    if (!foundPath) return undefined;

    const data = responses[foundPath];

    return Promise.resolve({
      body: JSON.stringify(data.body ?? {}),
      status: data.status ?? 200,
    });
  });
};

const setupPage = ({ router, responses = {} } = {}) => {
  fetch.resetMocks();
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'resetMocks' does not exist on type '(inp... Remove this comment to see the full error message
  mockResponses({ '/user': { body: user }, ...responses });
  return { router: mockRouterWithParams(router) };
};

export { setupPage, mockResponses };
