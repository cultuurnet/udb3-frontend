const searchLabels = async (page, term, expectedText) => {
  await page
    .getByPlaceholder('Schrijf een zoekopdracht van minstens 2 karakters.')
    .fill(term);
  await page.getByText(expectedText).waitFor();
};

export const labelsInteractionsByShotName = {
  'pages--labels-search-results': (page) =>
    searchLabels(page, 'verborgen', 'VRT mock label — verborgen'),
  'pages--labels-no-results': (page) =>
    searchLabels(page, 'geen-resultaten-mock', 'Geen labels gevonden.'),
};
