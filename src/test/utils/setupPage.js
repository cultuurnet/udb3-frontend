import { match } from 'path-to-regexp';

import { user } from '@/test/data/user';

// @ts-expect-error TODO: Fix type error
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

  // @ts-expect-error TODO: Fix type error
  useRouter.mockImplementation(() => mockRouter);
  return mockRouter;
};

const mockResponses = (responses) => {
  // @ts-expect-error TODO: Fix type error
  fetch.mockResponse((req) => {
    const url = req.url.split('http://localhost:3000')[1].split('?')[0];

    const foundPath = Object.keys(responses).find((path) => match(path)(url));
    if (!foundPath) return undefined;

    const data = responses[foundPath];

    return Promise.resolve({
      body: JSON.stringify(data.body ?? {}),
      status: data.status ?? 200,
    });
  });
};

// @ts-expect-error TODO: Fix type error
const setupPage = ({ router, responses = {} } = {}) => {
  // @ts-expect-error TODO: Fix type error
  fetch.resetMocks();
  mockResponses({ '/user': { body: user }, ...responses });
  return { router: mockRouterWithParams(router) };
};

export { mockResponses, setupPage };
