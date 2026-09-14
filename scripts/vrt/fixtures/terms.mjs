export const termsFixture = {
  terms: [
    {
      id: 'vrt-mock-term-1',
      domain: 'eventtype',
      name: {
        nl: 'VRT mock type — evenement',
        fr: 'VRT mock type — évènement',
        de: 'VRT mock type — Veranstaltung',
        en: 'VRT mock type — event',
      },
      scope: ['events'],
    },
    {
      id: 'vrt-mock-term-2',
      domain: 'eventtype',
      name: {
        nl: 'VRT mock type — locatie',
        fr: 'VRT mock type — lieu',
        de: 'VRT mock type — Ort',
        en: 'VRT mock type — place',
      },
      scope: ['places'],
    },
    {
      id: 'vrt-mock-term-3',
      domain: 'theme',
      name: {
        nl: 'VRT mock thema',
        fr: 'VRT mock thème',
        de: 'VRT mock Thema',
        en: 'VRT mock theme',
      },
      scope: ['events'],
    },
    {
      id: '0.51.0.0.0',
      domain: 'eventtype',
      name: {
        nl: 'VRT mock type — uitgeschakeld',
        fr: 'VRT mock type — désactivé',
        de: 'VRT mock type — deaktiviert',
        en: 'VRT mock type — disabled',
      },
      scope: ['events'],
    },
  ],
};
