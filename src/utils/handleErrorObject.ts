import { ErrorObject, isErrorObject } from './fetchFromApi';

export const handleErrorObject = async (response: ErrorObject | Response) =>
  // eslint-disable-next-line no-console
  isErrorObject(response) ? console.error(response) : await response.json();
