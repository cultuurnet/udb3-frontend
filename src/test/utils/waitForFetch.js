import { waitFor } from '@testing-library/react';
import getConfig from 'next/config';

const waitForFetch = async (path) => {
  await waitFor(() =>
    expect(fetch).toBeCalledWith(
      `${process.env.NEXT_PUBLIC_API_URL}${path}`,
      expect.anything(),
    ),
  );
};

export { waitForFetch };
