import { waitFor } from '@testing-library/react';

const waitForFetch = async (path) => {
  await waitFor(() =>
    expect(fetch).toBeCalledWith(
      `${process.env.NEXT_PUBLIC_API_URL}${path}`,
      expect.anything(),
    ),
  );
};

export { waitForFetch };
