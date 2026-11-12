import { fetchFromApi } from '@/utils/fetchFromApi';

import { useAuthenticatedMutation } from './authenticated-query';

const addImage = async ({
  headers,
  language,
  copyrightHolder,
  description,
  file,
  isAiGenerated,
}) => {
  const formData = new FormData();

  Object.entries({
    description,
    copyrightHolder,
    language,
    file,
    isAiGenerated,
  })
    .filter(([, value]) => value !== undefined)
    .forEach(([key, value]) => formData.append(key, value));

  return fetchFromApi({
    path: `/images/`,
    options: {
      method: 'POST',
      headers: {
        ...headers,
      },
      body: formData,
    },
  });
};

const useAddImageMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: addImage,
    mutationKey: 'images-add',
    ...configuration,
  });

export { useAddImageMutation };
