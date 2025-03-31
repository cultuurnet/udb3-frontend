import { useQuery } from 'react-query';
import type { Node } from 'react-checkbox-tree';

const dummyData: Node[] = [
  {
    label: 'Basisonderwijs',
    value: 'cultuurkuur+AF8-basisonderwijs',
    children: [
      {
        label: 'Gewoon basisonderwijs',
        value: 'cultuurkuur+AF8-Gewoon+AC0-basisonderwijs',
        children: [
          {
            label: 'Gewoon kleuteronderwijs',
            value: 'cultuurkuur+AF8-Gewoon+AC0-kleuteronderwijs',
            children: [
              {
                label: 'Kleuter (2+AC0-3 jaar)',
                value: 'cultuurkuur+AF8-Kleuter+AC0-2+AC0-3+AC0-jaar',
              },
              {
                label: 'Kleuter (3+AC0-4 jaar)',
                value: 'cultuurkuur+AF8-Kleuter+AC0-3+AC0-4+AC0-jaar',
              },
              {
                label: 'Kleuter (4+AC0-5 jaar)',
                value: 'cultuurkuur+AF8-Kleuter+AC0-4+AC0-5+AC0-jaar',
              },
            ],
          },
          {
            label: 'Gewoon lager onderwijs',
            value: 'cultuurkuur+AF8-Gewoon+AC0-lager+AC0-onderwijs',
            children: [
              {
                label: 'Eerste graad',
                value: 'cultuurkuur+AF8-1ste+AC0-graad',
              },
              {
                label: 'Tweede graad',
                value: 'cultuurkuur+AF8-2de+AC0-graad',
              },
              {
                label: 'Derde graad',
                value: 'cultuurkuur+AF8-3de+AC0-graad',
              },
            ],
          },
          {
            label: 'Onthaalonderwijs voor anderstalige nieuwkomers (OKAN)',
            value:
              'cultuurkuur+AF8-Onthaalonderwijs+AC0-voor+AC0-anderstalige+AC0-nieuwkomers (OKAN)',
          },
        ],
      },
      {
        label: 'Buitengewoon basisonderwijs',
        value: 'cultuurkuur+AF8-Buitengewoon+AC0-basisonderwijs',
        children: [
          {
            label: 'Buitengewoon kleuteronderwijs',
            value: 'cultuurkuur+AF8-Buitengewoon+AC0-kleuteronderwijs',
          },
          {
            label: 'Buitengewoon lager onderwijs',
            value: 'cultuurkuur+AF8-Buitengewoon+AC0-lager+AC0-onderwijs',
          },
        ],
      },
    ],
  },
  {
    label: 'Secundair onderwijs',
    value: 'cultuurkuur+AF8-Secundair+AC0-onderwijs',
    children: [
      {
        label: 'Voltijds gewoon secundair onderwijs',
        value:
          'cultuurkuur+AF8-Voltijds+AC0-gewoon+AC0-secundair+AC0-onderwijs',
        children: [
          {
            label: 'Eerste graad',
            value: 'cultuurkuur+AF8-eerste+AC0-graad',
            children: [
              {
                label: 'A+AC0-stroom',
                value: 'cultuurkuur+AF8-A+AC0-stroom',
              },
              {
                label: 'B+AC0-stroom',
                value: 'cultuurkuur+AF8-B+AC0-stroom',
              },
            ],
          },
          {
            label: 'Tweede graad',
            value: 'cultuurkuur+AF8-tweede+AC0-graad',
            children: [
              {
                label: 'Finaliteit doorstroom',
                value: 'cultuurkuur+AF8-finaliteit-tweede+AC0-doorstroom',
              },
              {
                label: 'Finaliteit arbeidsmarkt',
                value: 'cultuurkuur+AF8-finaliteit-tweede+AC0-arbeidsmarkt',
              },
              {
                label: 'Dubbele finaliteit',
                value: 'cultuurkuur+AF8-dubbele+AC0-tweede-finaliteit',
              },
            ],
          },
          {
            label: 'Derde graad',
            value: 'cultuurkuur+AF8-derde+AC0-graad',
            children: [
              {
                label: 'Finaliteit doorstroom',
                value: 'cultuurkuur+AF8-finaliteit-derdre+AC0-doorstroom',
              },
              {
                label: 'Finaliteit arbeidsmarkt',
                value: 'cultuurkuur+AF8-finaliteit-derdre+AC0-arbeidsmarkt',
              },
              {
                label: 'Dubbele finaliteit',
                value: 'cultuurkuur+AF8-dubbele+AC0-derdre-finaliteit',
              },
            ],
          },
          {
            label: 'Secundair na Secundair (Se+AC0-n+AC0-Se)',
            value:
              'cultuurkuur+AF8-Secundair+AC0-na+AC0-secundair+AC0-(Se+AC0-n+AC0-Se)',
          },
          {
            label: 'Onthaalonderwijs voor anderstalige nieuwkomers (OKAN)',
            value:
              'cultuurkuur+AF8-Onthaalonderwijs+AC0-voor+AC0-anderstalige+AC0-nieuwkomers+AC0-OKAN',
          },
        ],
      },
      {
        label: 'Buitengewoon secundair onderwijs',
        value: 'cultuurkuur+AF8-Buitengewoon+AC0-secundair+AC0-onderwijs',
      },
      {
        label: 'Deeltijds leren en werken',
        value: 'cultuurkuur+AF8-Deeltijds+AC0-leren+AC0-en+AC0-werken',
      },
    ],
  },
  {
    label: 'Hoger onderwijs',
    value: 'cultuurkuur+AF8-Hoger+AC0-onderwijs',
  },
  {
    label: 'Volwassenenonderwijs',
    value: 'cultuurkuur+AF8-Volwassenenonderwijs',
  },
  {
    label: 'Deeltijds kunstonderwijs',
    value: 'cultuurkuur+AF8-Deeltijds+AC0-kunstonderwijs+AC0-DKO',
    children: [
      {
        label: 'Beeldende en audiovisuele kunst',
        value: 'cultuurkuur+AF8-Beeldende+AC0-en+AC0-audiovisuele+AC0-kunst',
      },
      {
        label: 'Dans',
        value: 'cultuurkuur+AF8-dans',
      },
      {
        label: 'Muziek',
        value: 'cultuurkuur+AF8-muziek',
      },
      {
        label: 'Woordkunst +ACY- drama',
        value: 'cultuurkuur+AF8-Woordkunst+AC0-drama',
      },
    ],
  },
];

const useEducationLevels = () => {
  return useQuery({
    queryFn: async () => dummyData,
  });
};

export { useEducationLevels };
