const searchLabels = async (page, term) => {
  await page
    .getByPlaceholder('Schrijf een zoekopdracht van minstens 2 karakters.')
    .fill(term);
  await page.waitForResponse(
    (response) =>
      response.url().includes('/labels/') &&
      response.url().includes(`query=${term}`),
  );
};

export const labelsInteractionsByShotName = {
  'pages--labels-search-results': (page) => searchLabels(page, 'verborgen'),
  'pages--labels-no-results': (page) =>
    searchLabels(page, 'geen-resultaten-mock'),
};
