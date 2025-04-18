import type { Node } from 'react-checkbox-tree';
import { useQuery } from 'react-query';

const dummyData: Node[] = [
  {
    label: 'Basisonderwijs',
    value: 'cultuurkuur_basisonderwijs',
    children: [
      {
        label: 'Gewoon basisonderwijs',
        value: 'cultuurkuur_Gewoon-basisonderwijs',
        children: [
          {
            label: 'Gewoon kleuteronderwijs',
            value: 'cultuurkuur_Gewoon-kleuteronderwijs',
            children: [
              {
                label: 'Kleuter (2-3 jaar)',
                value: 'cultuurkuur_Kleuter-2-3-jaar',
              },
              {
                label: 'Kleuter (3-4 jaar)',
                value: 'cultuurkuur_Kleuter-3-4-jaar',
              },
              {
                label: 'Kleuter (4-5 jaar)',
                value: 'cultuurkuur_Kleuter-4-5-jaar',
              },
            ],
          },
          {
            label: 'Gewoon lager onderwijs',
            value: 'cultuurkuur_Gewoon-lager-onderwijs',
            children: [
              {
                label: 'Eerste graad',
                value: 'cultuurkuur_1ste-graad',
              },
              {
                label: 'Tweede graad',
                value: 'cultuurkuur_2de-graad',
              },
              {
                label: 'Derde graad',
                value: 'cultuurkuur_3de-graad',
              },
            ],
          },
          {
            label: 'Onthaalonderwijs voor anderstalige nieuwkomers (OKAN)',
            value:
              'cultuurkuur_Onthaalonderwijs-voor-anderstalige-nieuwkomers (OKAN)',
          },
        ],
      },
      {
        label: 'Buitengewoon basisonderwijs',
        value: 'cultuurkuur_Buitengewoon-basisonderwijs',
        children: [
          {
            label: 'Buitengewoon kleuteronderwijs',
            value: 'cultuurkuur_Buitengewoon-kleuteronderwijs',
          },
          {
            label: 'Buitengewoon lager onderwijs',
            value: 'cultuurkuur_Buitengewoon-lager-onderwijs',
          },
        ],
      },
    ],
  },
  {
    label: 'Secundair onderwijs',
    value: 'cultuurkuur_Secundair-onderwijs',
    children: [
      {
        label: 'Voltijds gewoon secundair onderwijs',
        value: 'cultuurkuur_Voltijds-gewoon-secundair-onderwijs',
        children: [
          {
            label: 'Eerste graad',
            value: 'cultuurkuur_eerste-graad',
            children: [
              {
                label: 'A-stroom',
                value: 'cultuurkuur_A-stroom',
              },
              {
                label: 'B-stroom',
                value: 'cultuurkuur_B-stroom',
              },
            ],
          },
          {
            label: 'Tweede graad',
            value: 'cultuurkuur_tweede-graad',
            children: [
              {
                label: 'Finaliteit doorstroom',
                value: 'cultuurkuur_finaliteit-tweede-doorstroom',
              },
              {
                label: 'Finaliteit arbeidsmarkt',
                value: 'cultuurkuur_finaliteit-tweede-arbeidsmarkt',
              },
              {
                label: 'Dubbele finaliteit',
                value: 'cultuurkuur_dubbele-tweede-finaliteit',
              },
            ],
          },
          {
            label: 'Derde graad',
            value: 'cultuurkuur_derde-graad',
            children: [
              {
                label: 'Finaliteit doorstroom',
                value: 'cultuurkuur_finaliteit-derdre-doorstroom',
              },
              {
                label: 'Finaliteit arbeidsmarkt',
                value: 'cultuurkuur_finaliteit-derdre-arbeidsmarkt',
              },
              {
                label: 'Dubbele finaliteit',
                value: 'cultuurkuur_dubbele-derdre-finaliteit',
              },
            ],
          },
          {
            label: 'Secundair na Secundair (Se-n-Se)',
            value: 'cultuurkuur_Secundair-na-secundair-(Se-n-Se)',
          },
          {
            label: 'Onthaalonderwijs voor anderstalige nieuwkomers (OKAN)',
            value:
              'cultuurkuur_Onthaalonderwijs-voor-anderstalige-nieuwkomers-OKAN',
          },
        ],
      },
      {
        label: 'Buitengewoon secundair onderwijs',
        value: 'cultuurkuur_Buitengewoon-secundair-onderwijs',
      },
      {
        label: 'Deeltijds leren en werken',
        value: 'cultuurkuur_Deeltijds-leren-en-werken',
      },
    ],
  },
  {
    label: 'Hoger onderwijs',
    value: 'cultuurkuur_Hoger-onderwijs',
  },
  {
    label: 'Volwassenenonderwijs',
    value: 'cultuurkuur_Volwassenenonderwijs',
  },
  {
    label: 'Deeltijds kunstonderwijs',
    value: 'cultuurkuur_Deeltijds-kunstonderwijs-DKO',
    children: [
      {
        label: 'Beeldende en audiovisuele kunst',
        value: 'cultuurkuur_Beeldende-en-audiovisuele-kunst',
      },
      {
        label: 'Dans',
        value: 'cultuurkuur_dans',
      },
      {
        label: 'Muziek',
        value: 'cultuurkuur_muziek',
      },
      {
        label: 'Woordkunst & drama',
        value: 'cultuurkuur_Woordkunst-drama',
      },
    ],
  },
];

const useGetEducationLevelsQuery = () => {
  return useQuery({
    retry: false,
    staleTime: Infinity,
    queryFn: async () => dummyData,
  });
};

export { useGetEducationLevelsQuery };
