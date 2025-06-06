import { act, renderHook } from '@testing-library/react-hooks';

import { HierarchicalData } from '@/hooks/api/cultuurkuur';
import { useLabelsManager } from '@/utils/cultuurkuurLabels';

export const dummyMunicipalities: HierarchicalData[] = [
  {
    name: {
      nl: 'Brussels Hoofdstedelijk Gewest',
    },
    label: 'cultuurkuur_werkingsregio_provincie_nis-01000',
    extraLabel: 'cultuurkuur_werkingsregio_nis-01000',
    children: [
      {
        name: {
          nl: 'Regio Brussel',
        },
        children: [
          {
            name: {
              nl: 'Anderlecht',
            },
            label: 'cultuurkuur_werkingsregio_nis-21001',
          },
          {
            name: {
              nl: 'Brussel',
            },
            label: 'cultuurkuur_werkingsregio_nis-21004',
          },
          {
            name: {
              nl: 'Elsene',
            },
            label: 'cultuurkuur_werkingsregio_nis-21009',
          },
          {
            name: {
              nl: 'Etterbeek',
            },
            label: 'cultuurkuur_werkingsregio_nis-21005',
          },
          {
            name: {
              nl: 'Evere',
            },
            label: 'cultuurkuur_werkingsregio_nis-21006',
          },
          {
            name: {
              nl: 'Ganshoren',
            },
            label: 'cultuurkuur_werkingsregio_nis-21008',
          },
          {
            name: {
              nl: 'Jette',
            },
            label: 'cultuurkuur_werkingsregio_nis-21010',
          },
          {
            name: {
              nl: 'Koekelberg',
            },
            label: 'cultuurkuur_werkingsregio_nis-21011',
          },
          {
            name: {
              nl: 'Oudergem',
            },
            label: 'cultuurkuur_werkingsregio_nis-21002',
          },
          {
            name: {
              nl: 'Schaarbeek',
            },
            label: 'cultuurkuur_werkingsregio_nis-21015',
          },
          {
            name: {
              nl: 'Sint-Agatha-Berchem',
            },
            label: 'cultuurkuur_werkingsregio_nis-21003',
          },
          {
            name: {
              nl: 'Sint-Gillis',
            },
            label: 'cultuurkuur_werkingsregio_nis-21013',
          },
          {
            name: {
              nl: 'Sint-Jans-Molenbeek',
            },
            label: 'cultuurkuur_werkingsregio_nis-21012',
          },
          {
            name: {
              nl: 'Sint-Joost-ten-Node',
            },
            label: 'cultuurkuur_werkingsregio_nis-21014',
          },
          {
            name: {
              nl: 'Sint-Lambrechts-Woluwe',
            },
            label: 'cultuurkuur_werkingsregio_nis-21018',
          },
          {
            name: {
              nl: 'Sint-Pieters-Woluwe',
            },
            label: 'cultuurkuur_werkingsregio_nis-21019',
          },
          {
            name: {
              nl: 'Ukkel',
            },
            label: 'cultuurkuur_werkingsregio_nis-21016',
          },
          {
            name: {
              nl: 'Vorst',
            },
            label: 'cultuurkuur_werkingsregio_nis-21007',
          },
          {
            name: {
              nl: 'Watermaal-Bosvoorde',
            },
            label: 'cultuurkuur_werkingsregio_nis-21017',
          },
        ],
      },
    ],
  },
  {
    name: {
      nl: 'Provincie Antwerpen',
    },
    label: 'cultuurkuur_werkingsregio_provincie_nis-10000',
    extraLabel: 'cultuurkuur_werkingsregio_nis-10000',
    children: [
      {
        name: {
          nl: 'Regio Antwerpen',
        },
        children: [
          {
            name: {
              nl: 'Antwerpen',
            },
            label: 'cultuurkuur_werkingsregio_nis-11002',
          },
          {
            name: {
              nl: 'Wommelgem',
            },
            label: 'cultuurkuur_werkingsregio_nis-11052',
          },
          {
            name: {
              nl: 'Boechout',
            },
            label: 'cultuurkuur_werkingsregio_nis-11004',
          },
          {
            name: {
              nl: 'Hove',
            },
            label: 'cultuurkuur_werkingsregio_nis-11021',
          },
          {
            name: {
              nl: 'Lint',
            },
            label: 'cultuurkuur_werkingsregio_nis-11025',
          },
          {
            name: {
              nl: 'Kontich',
            },
            label: 'cultuurkuur_werkingsregio_nis-11024',
          },
          {
            name: {
              nl: 'Aartselaar',
            },
            label: 'cultuurkuur_werkingsregio_nis-11001',
          },
          {
            name: {
              nl: 'Mortsel',
            },
            label: 'cultuurkuur_werkingsregio_nis-11029',
          },
          {
            name: {
              nl: 'Edegem',
            },
            label: 'cultuurkuur_werkingsregio_nis-11013',
          },
        ],
      },
      {
        name: {
          nl: 'Regio Mechelen',
        },
        children: [
          {
            name: {
              nl: 'Mechelen',
            },
            label: 'cultuurkuur_werkingsregio_nis-12025',
          },
        ],
      },
      {
        name: {
          nl: 'Regio Scheldeland Antwerpen',
        },
        children: [
          {
            name: {
              nl: 'Hemiksem',
            },
            label: 'cultuurkuur_werkingsregio_nis-11018',
          },
          {
            name: {
              nl: 'Schelle',
            },
            label: 'cultuurkuur_werkingsregio_nis-11038',
          },
          {
            name: {
              nl: 'Rumst',
            },
            label: 'cultuurkuur_werkingsregio_nis-11037',
          },
          {
            name: {
              nl: 'Niel',
            },
            label: 'cultuurkuur_werkingsregio_nis-11030',
          },
          {
            name: {
              nl: 'Boom',
            },
            label: 'cultuurkuur_werkingsregio_nis-11005',
          },
          {
            name: {
              nl: 'Willebroek',
            },
            label: 'cultuurkuur_werkingsregio_nis-12040',
          },
          {
            name: {
              nl: 'Bornem',
            },
            label: 'cultuurkuur_werkingsregio_nis-12007',
          },
          {
            name: {
              nl: 'Puurs-Sint-Amands',
            },
            label: 'cultuurkuur_werkingsregio_nis-12041',
          },
        ],
      },
      {
        name: {
          nl: 'Regio Kempen',
        },
        children: [
          {
            name: {
              nl: 'Wijnegem',
            },
            label: 'cultuurkuur_werkingsregio_nis-11050',
          },
          {
            name: {
              nl: 'Zandhoven',
            },
            label: 'cultuurkuur_werkingsregio_nis-11054',
          },
          {
            name: {
              nl: 'Malle',
            },
            label: 'cultuurkuur_werkingsregio_nis-11057',
          },
          {
            name: {
              nl: 'Ranst',
            },
            label: 'cultuurkuur_werkingsregio_nis-11035',
          },
          {
            name: {
              nl: 'Schoten',
            },
            label: 'cultuurkuur_werkingsregio_nis-11040',
          },
          {
            name: {
              nl: 'Essen',
            },
            label: 'cultuurkuur_werkingsregio_nis-11016',
          },
          {
            name: {
              nl: 'Kalmthout',
            },
            label: 'cultuurkuur_werkingsregio_nis-11022',
          },
          {
            name: {
              nl: 'Brasschaat',
            },
            label: 'cultuurkuur_werkingsregio_nis-11008',
          },
          {
            name: {
              nl: 'Stabroek',
            },
            label: 'cultuurkuur_werkingsregio_nis-11044',
          },
          {
            name: {
              nl: 'Kapellen',
            },
            label: 'cultuurkuur_werkingsregio_nis-11023',
          },
          {
            name: {
              nl: 'Brecht',
            },
            label: 'cultuurkuur_werkingsregio_nis-11009',
          },
          {
            name: {
              nl: 'Schilde',
            },
            label: 'cultuurkuur_werkingsregio_nis-11039',
          },
          {
            name: {
              nl: 'Zoersel',
            },
            label: 'cultuurkuur_werkingsregio_nis-11055',
          },
          {
            name: {
              nl: 'Wuustwezel',
            },
            label: 'cultuurkuur_werkingsregio_nis-11053',
          },
          {
            name: {
              nl: 'Duffel',
            },
            label: 'cultuurkuur_werkingsregio_nis-12009',
          },
          {
            name: {
              nl: 'Bonheiden',
            },
            label: 'cultuurkuur_werkingsregio_nis-12005',
          },
          {
            name: {
              nl: 'Sint-Katelijne-Waver',
            },
            label: 'cultuurkuur_werkingsregio_nis-12035',
          },
          {
            name: {
              nl: 'Herentals',
            },
            label: 'cultuurkuur_werkingsregio_nis-13011',
          },
          {
            name: {
              nl: 'Herselt',
            },
            label: 'cultuurkuur_werkingsregio_nis-13013',
          },
          {
            name: {
              nl: 'Hulshout',
            },
            label: 'cultuurkuur_werkingsregio_nis-13016',
          },
          {
            name: {
              nl: 'Olen',
            },
            label: 'cultuurkuur_werkingsregio_nis-13029',
          },
          {
            name: {
              nl: 'Westerlo',
            },
            label: 'cultuurkuur_werkingsregio_nis-13049',
          },
          {
            name: {
              nl: 'Herenthout',
            },
            label: 'cultuurkuur_werkingsregio_nis-13012',
          },
          {
            name: {
              nl: 'Lille',
            },
            label: 'cultuurkuur_werkingsregio_nis-13019',
          },
          {
            name: {
              nl: 'Grobbendonk',
            },
            label: 'cultuurkuur_werkingsregio_nis-13010',
          },
          {
            name: {
              nl: 'Vorselaar',
            },
            label: 'cultuurkuur_werkingsregio_nis-13044',
          },
          {
            name: {
              nl: 'Turnhout',
            },
            label: 'cultuurkuur_werkingsregio_nis-13040',
          },
          {
            name: {
              nl: 'Rijkevorsel',
            },
            label: 'cultuurkuur_werkingsregio_nis-13037',
          },
          {
            name: {
              nl: 'Hoogstraten',
            },
            label: 'cultuurkuur_werkingsregio_nis-13014',
          },
          {
            name: {
              nl: 'Merksplas',
            },
            label: 'cultuurkuur_werkingsregio_nis-13023',
          },
          {
            name: {
              nl: 'Beerse',
            },
            label: 'cultuurkuur_werkingsregio_nis-13004',
          },
          {
            name: {
              nl: 'Vosselaar',
            },
            label: 'cultuurkuur_werkingsregio_nis-13046',
          },
          {
            name: {
              nl: 'Oud-Turnhout',
            },
            label: 'cultuurkuur_werkingsregio_nis-13031',
          },
          {
            name: {
              nl: 'Arendonk',
            },
            label: 'cultuurkuur_werkingsregio_nis-13001',
          },
          {
            name: {
              nl: 'Ravels',
            },
            label: 'cultuurkuur_werkingsregio_nis-13035',
          },
          {
            name: {
              nl: 'Baarle-Hertog',
            },
            label: 'cultuurkuur_werkingsregio_nis-13002',
          },
          {
            name: {
              nl: 'Mol',
            },
            label: 'cultuurkuur_werkingsregio_nis-13025',
          },
          {
            name: {
              nl: 'Laakdal',
            },
            label: 'cultuurkuur_werkingsregio_nis-13053',
          },
          {
            name: {
              nl: 'Geel',
            },
            label: 'cultuurkuur_werkingsregio_nis-13008',
          },
          {
            name: {
              nl: 'Meerhout',
            },
            label: 'cultuurkuur_werkingsregio_nis-13021',
          },
          {
            name: {
              nl: 'Kasterlee',
            },
            label: 'cultuurkuur_werkingsregio_nis-13017',
          },
          {
            name: {
              nl: 'Retie',
            },
            label: 'cultuurkuur_werkingsregio_nis-13036',
          },
          {
            name: {
              nl: 'Dessel',
            },
            label: 'cultuurkuur_werkingsregio_nis-13006',
          },
          {
            name: {
              nl: 'Balen',
            },
            label: 'cultuurkuur_werkingsregio_nis-13003',
          },
          {
            name: {
              nl: 'Heist-op-den-Berg',
            },
            label: 'cultuurkuur_werkingsregio_nis-12014',
          },
          {
            name: {
              nl: 'Lier',
            },
            label: 'cultuurkuur_werkingsregio_nis-12021',
          },
          {
            name: {
              nl: 'Nijlen',
            },
            label: 'cultuurkuur_werkingsregio_nis-12026',
          },
          {
            name: {
              nl: 'Putte',
            },
            label: 'cultuurkuur_werkingsregio_nis-12029',
          },
          {
            name: {
              nl: 'Berlaar',
            },
            label: 'cultuurkuur_werkingsregio_nis-12002',
          },
        ],
      },
    ],
  },
  {
    name: {
      nl: 'Provincie Vlaams-Brabant',
    },
    label: 'cultuurkuur_werkingsregio_provincie_nis-20001',
    extraLabel: 'cultuurkuur_werkingsregio_nis-20001',
    children: [
      {
        name: {
          nl: 'Regio Groene Gordel',
        },
        children: [
          {
            name: {
              nl: 'Vilvoorde',
            },
            label: 'cultuurkuur_werkingsregio_nis-23088',
          },
          {
            name: {
              nl: 'Steenokkerzeel',
            },
            label: 'cultuurkuur_werkingsregio_nis-23081',
          },
          {
            name: {
              nl: 'Machelen',
            },
            label: 'cultuurkuur_werkingsregio_nis-23047',
          },
          {
            name: {
              nl: 'Grimbergen',
            },
            label: 'cultuurkuur_werkingsregio_nis-23025',
          },
          {
            name: {
              nl: 'Meise',
            },
            label: 'cultuurkuur_werkingsregio_nis-23050',
          },
          {
            name: {
              nl: 'Kapelle-op-den-Bos',
            },
            label: 'cultuurkuur_werkingsregio_nis-23039',
          },
          {
            name: {
              nl: 'Kampenhout',
            },
            label: 'cultuurkuur_werkingsregio_nis-23038',
          },
          {
            name: {
              nl: 'Zaventem',
            },
            label: 'cultuurkuur_werkingsregio_nis-23094',
          },
          {
            name: {
              nl: 'Kraainem',
            },
            label: 'cultuurkuur_werkingsregio_nis-23099',
          },
          {
            name: {
              nl: 'Wezembeek-Oppem',
            },
            label: 'cultuurkuur_werkingsregio_nis-23103',
          },
          {
            name: {
              nl: 'Zemst',
            },
            label: 'cultuurkuur_werkingsregio_nis-23096',
          },
          {
            name: {
              nl: 'Halle',
            },
            label: 'cultuurkuur_werkingsregio_nis-23027',
          },
          {
            name: {
              nl: 'Pajottegem',
            },
            label: 'cultuurkuur_werkingsregio_nis-23106',
          },
          {
            name: {
              nl: 'Bever',
            },
            label: 'cultuurkuur_werkingsregio_nis-23009',
          },
          {
            name: {
              nl: 'Hoeilaart',
            },
            label: 'cultuurkuur_werkingsregio_nis-23033',
          },
          {
            name: {
              nl: 'Sint-Pieters-Leeuw',
            },
            label: 'cultuurkuur_werkingsregio_nis-23077',
          },
          {
            name: {
              nl: 'Drogenbos',
            },
            label: 'cultuurkuur_werkingsregio_nis-23098',
          },
          {
            name: {
              nl: 'Linkebeek',
            },
            label: 'cultuurkuur_werkingsregio_nis-23100',
          },
          {
            name: {
              nl: 'Sint-Genesius-Rode',
            },
            label: 'cultuurkuur_werkingsregio_nis-23101',
          },
          {
            name: {
              nl: 'Beersel',
            },
            label: 'cultuurkuur_werkingsregio_nis-23003',
          },
          {
            name: {
              nl: 'Pepingen',
            },
            label: 'cultuurkuur_werkingsregio_nis-23064',
          },
          {
            name: {
              nl: 'Dilbeek',
            },
            label: 'cultuurkuur_werkingsregio_nis-23016',
          },
          {
            name: {
              nl: 'Asse',
            },
            label: 'cultuurkuur_werkingsregio_nis-23002',
          },
          {
            name: {
              nl: 'Ternat',
            },
            label: 'cultuurkuur_werkingsregio_nis-23086',
          },
          {
            name: {
              nl: 'Opwijk',
            },
            label: 'cultuurkuur_werkingsregio_nis-23060',
          },
          {
            name: {
              nl: 'Lennik',
            },
            label: 'cultuurkuur_werkingsregio_nis-23104',
          },
          {
            name: {
              nl: 'Roosdaal',
            },
            label: 'cultuurkuur_werkingsregio_nis-23097',
          },
          {
            name: {
              nl: 'Liedekerke',
            },
            label: 'cultuurkuur_werkingsregio_nis-23044',
          },
          {
            name: {
              nl: 'Wemmel',
            },
            label: 'cultuurkuur_werkingsregio_nis-23102',
          },
          {
            name: {
              nl: 'Merchtem',
            },
            label: 'cultuurkuur_werkingsregio_nis-23052',
          },
          {
            name: {
              nl: 'Affligem',
            },
            label: 'cultuurkuur_werkingsregio_nis-23105',
          },
          {
            name: {
              nl: 'Londerzeel',
            },
            label: 'cultuurkuur_werkingsregio_nis-23045',
          },
          {
            name: {
              nl: 'Herent',
            },
            label: 'cultuurkuur_werkingsregio_nis-24038',
          },
          {
            name: {
              nl: 'Huldenberg',
            },
            label: 'cultuurkuur_werkingsregio_nis-24045',
          },
          {
            name: {
              nl: 'Oud-Heverlee',
            },
            label: 'cultuurkuur_werkingsregio_nis-24086',
          },
          {
            name: {
              nl: 'Bertem',
            },
            label: 'cultuurkuur_werkingsregio_nis-24009',
          },
          {
            name: {
              nl: 'Kortenberg',
            },
            label: 'cultuurkuur_werkingsregio_nis-24055',
          },
          {
            name: {
              nl: 'Tervuren',
            },
            label: 'cultuurkuur_werkingsregio_nis-24104',
          },
          {
            name: {
              nl: 'Overijse',
            },
            label: 'cultuurkuur_werkingsregio_nis-23062',
          },
          {
            name: {
              nl: 'Keerbergen',
            },
            label: 'cultuurkuur_werkingsregio_nis-24048',
          },
          {
            name: {
              nl: 'Haacht',
            },
            label: 'cultuurkuur_werkingsregio_nis-24033',
          },
          {
            name: {
              nl: 'Boortmeerbeek',
            },
            label: 'cultuurkuur_werkingsregio_nis-24014',
          },
        ],
      },
      {
        name: {
          nl: 'Regio Hageland',
        },
        children: [
          {
            name: {
              nl: 'Aarschot',
            },
            label: 'cultuurkuur_werkingsregio_nis-24001',
          },
          {
            name: {
              nl: 'Scherpenheuvel-Zichem',
            },
            label: 'cultuurkuur_werkingsregio_nis-24134',
          },
          {
            name: {
              nl: 'Diest',
            },
            label: 'cultuurkuur_werkingsregio_nis-24020',
          },
          {
            name: {
              nl: 'Tienen',
            },
            label: 'cultuurkuur_werkingsregio_nis-24107',
          },
          {
            name: {
              nl: 'Hoegaarden',
            },
            label: 'cultuurkuur_werkingsregio_nis-24041',
          },
          {
            name: {
              nl: 'Linter',
            },
            label: 'cultuurkuur_werkingsregio_nis-24133',
          },
          {
            name: {
              nl: 'Glabbeek',
            },
            label: 'cultuurkuur_werkingsregio_nis-24137',
          },
          {
            name: {
              nl: 'Tielt-Winge',
            },
            label: 'cultuurkuur_werkingsregio_nis-24135',
          },
          {
            name: {
              nl: 'Zoutleeuw',
            },
            label: 'cultuurkuur_werkingsregio_nis-24130',
          },
          {
            name: {
              nl: 'Geetbets',
            },
            label: 'cultuurkuur_werkingsregio_nis-24028',
          },
          {
            name: {
              nl: 'Bekkevoort',
            },
            label: 'cultuurkuur_werkingsregio_nis-24008',
          },
          {
            name: {
              nl: 'Kortenaken',
            },
            label: 'cultuurkuur_werkingsregio_nis-24054',
          },
          {
            name: {
              nl: 'Rotselaar',
            },
            label: 'cultuurkuur_werkingsregio_nis-24094',
          },
          {
            name: {
              nl: 'Tremelo',
            },
            label: 'cultuurkuur_werkingsregio_nis-24109',
          },
          {
            name: {
              nl: 'Begijnendijk',
            },
            label: 'cultuurkuur_werkingsregio_nis-24007',
          },
          {
            name: {
              nl: 'Lubbeek',
            },
            label: 'cultuurkuur_werkingsregio_nis-24066',
          },
          {
            name: {
              nl: 'Holsbeek',
            },
            label: 'cultuurkuur_werkingsregio_nis-24043',
          },
          {
            name: {
              nl: 'Bierbeek',
            },
            label: 'cultuurkuur_werkingsregio_nis-24011',
          },
          {
            name: {
              nl: 'Boutersem',
            },
            label: 'cultuurkuur_werkingsregio_nis-24016',
          },
        ],
      },
      {
        name: {
          nl: 'Regio Leuven',
        },
        children: [
          {
            name: {
              nl: 'Leuven',
            },
            label: 'cultuurkuur_werkingsregio_nis-24062',
          },
        ],
      },
    ],
  },
  {
    name: {
      nl: 'Provincie West-Vlaanderen',
    },
    label: 'cultuurkuur_werkingsregio_provincie_nis-30000',
    extraLabel: 'cultuurkuur_werkingsregio_nis-30000',
    children: [
      {
        name: {
          nl: 'Regio Brugge',
        },
        children: [
          {
            name: {
              nl: 'Brugge',
            },
            label: 'cultuurkuur_werkingsregio_nis-31005',
          },
        ],
      },
      {
        name: {
          nl: 'Regio Brugse Ommeland',
        },
        children: [
          {
            name: {
              nl: 'Oostkamp',
            },
            label: 'cultuurkuur_werkingsregio_nis-31022',
          },
          {
            name: {
              nl: 'Zedelgem',
            },
            label: 'cultuurkuur_werkingsregio_nis-31040',
          },
          {
            name: {
              nl: 'Damme',
            },
            label: 'cultuurkuur_werkingsregio_nis-31006',
          },
          {
            name: {
              nl: 'Zuienkerke',
            },
            label: 'cultuurkuur_werkingsregio_nis-31042',
          },
          {
            name: {
              nl: 'Ichtegem',
            },
            label: 'cultuurkuur_werkingsregio_nis-35006',
          },
          {
            name: {
              nl: 'Jabbeke',
            },
            label: 'cultuurkuur_werkingsregio_nis-31012',
          },
          {
            name: {
              nl: 'Beernem',
            },
            label: 'cultuurkuur_werkingsregio_nis-31003',
          },
          {
            name: {
              nl: 'Torhout',
            },
            label: 'cultuurkuur_werkingsregio_nis-31033',
          },
          {
            name: {
              nl: 'Oudenburg',
            },
            label: 'cultuurkuur_werkingsregio_nis-35014',
          },
          {
            name: {
              nl: 'Gistel',
            },
            label: 'cultuurkuur_werkingsregio_nis-35005',
          },
          {
            name: {
              nl: 'Lichtervelde',
            },
            label: 'cultuurkuur_werkingsregio_nis-36011',
          },
          {
            name: {
              nl: 'Tielt',
            },
            label: 'cultuurkuur_werkingsregio_nis-37022',
          },
          {
            name: {
              nl: 'Pittem',
            },
            label: 'cultuurkuur_werkingsregio_nis-37011',
          },
          {
            name: {
              nl: 'Wingene',
            },
            label: 'cultuurkuur_werkingsregio_nis-37021',
          },
          {
            name: {
              nl: 'Ardooie',
            },
            label: 'cultuurkuur_werkingsregio_nis-37020',
          },
        ],
      },
      {
        name: {
          nl: 'Regio Leiestreek West-Vlaanderen',
        },
        children: [
          {
            name: {
              nl: 'Ingelmunster',
            },
            label: 'cultuurkuur_werkingsregio_nis-36007',
          },
          {
            name: {
              nl: 'Roeselare',
            },
            label: 'cultuurkuur_werkingsregio_nis-36015',
          },
          {
            name: {
              nl: 'Izegem',
            },
            label: 'cultuurkuur_werkingsregio_nis-36008',
          },
          {
            name: {
              nl: 'Ledegem',
            },
            label: 'cultuurkuur_werkingsregio_nis-36010',
          },
          {
            name: {
              nl: 'Moorslede',
            },
            label: 'cultuurkuur_werkingsregio_nis-36012',
          },
          {
            name: {
              nl: 'Wielsbeke',
            },
            label: 'cultuurkuur_werkingsregio_nis-37017',
          },
          {
            name: {
              nl: 'Dentergem',
            },
            label: 'cultuurkuur_werkingsregio_nis-37002',
          },
          {
            name: {
              nl: 'Oostrozebeke',
            },
            label: 'cultuurkuur_werkingsregio_nis-37010',
          },
          {
            name: {
              nl: 'Kortrijk',
            },
            label: 'cultuurkuur_werkingsregio_nis-34022',
          },
          {
            name: {
              nl: 'Kuurne',
            },
            label: 'cultuurkuur_werkingsregio_nis-34023',
          },
          {
            name: {
              nl: 'Harelbeke',
            },
            label: 'cultuurkuur_werkingsregio_nis-34013',
          },
          {
            name: {
              nl: 'Deerlijk',
            },
            label: 'cultuurkuur_werkingsregio_nis-34009',
          },
          {
            name: {
              nl: 'Zwevegem',
            },
            label: 'cultuurkuur_werkingsregio_nis-34042',
          },
          {
            name: {
              nl: 'Wevelgem',
            },
            label: 'cultuurkuur_werkingsregio_nis-34041',
          },
          {
            name: {
              nl: 'Anzegem',
            },
            label: 'cultuurkuur_werkingsregio_nis-34002',
          },
          {
            name: {
              nl: 'Avelgem',
            },
            label: 'cultuurkuur_werkingsregio_nis-34003',
          },
          {
            name: {
              nl: 'Spiere-Helkijn',
            },
            label: 'cultuurkuur_werkingsregio_nis-34043',
          },
          {
            name: {
              nl: 'Waregem',
            },
            label: 'cultuurkuur_werkingsregio_nis-34040',
          },
          {
            name: {
              nl: 'Lendelede',
            },
            label: 'cultuurkuur_werkingsregio_nis-34025',
          },
          {
            name: {
              nl: 'Menen',
            },
            label: 'cultuurkuur_werkingsregio_nis-34027',
          },
        ],
      },
      {
        name: {
          nl: 'Regio Vlaamse Kust',
        },
        children: [
          {
            name: {
              nl: 'Knokke-Heist',
            },
            label: 'cultuurkuur_werkingsregio_nis-31043',
          },
          {
            name: {
              nl: 'Blankenberge',
            },
            label: 'cultuurkuur_werkingsregio_nis-31004',
          },
          {
            name: {
              nl: 'De Haan',
            },
            label: 'cultuurkuur_werkingsregio_nis-35029',
          },
          {
            name: {
              nl: 'Bredene',
            },
            label: 'cultuurkuur_werkingsregio_nis-35002',
          },
          {
            name: {
              nl: 'De Panne',
            },
            label: 'cultuurkuur_werkingsregio_nis-38008',
          },
          {
            name: {
              nl: 'Oostende',
            },
            label: 'cultuurkuur_werkingsregio_nis-35013',
          },
          {
            name: {
              nl: 'Middelkerke',
            },
            label: 'cultuurkuur_werkingsregio_nis-35011',
          },
          {
            name: {
              nl: 'Nieuwpoort',
            },
            label: 'cultuurkuur_werkingsregio_nis-38016',
          },
          {
            name: {
              nl: 'Koksijde',
            },
            label: 'cultuurkuur_werkingsregio_nis-38014',
          },
        ],
      },
      {
        name: {
          nl: 'Regio Westhoek',
        },
        children: [
          {
            name: {
              nl: 'Hooglede',
            },
            label: 'cultuurkuur_werkingsregio_nis-36006',
          },
          {
            name: {
              nl: 'Staden',
            },
            label: 'cultuurkuur_werkingsregio_nis-36019',
          },
          {
            name: {
              nl: 'Veurne',
            },
            label: 'cultuurkuur_werkingsregio_nis-38025',
          },
          {
            name: {
              nl: 'Alveringem',
            },
            label: 'cultuurkuur_werkingsregio_nis-38002',
          },
          {
            name: {
              nl: 'Diksmuide',
            },
            label: 'cultuurkuur_werkingsregio_nis-32003',
          },
          {
            name: {
              nl: 'Kortemark',
            },
            label: 'cultuurkuur_werkingsregio_nis-32011',
          },
          {
            name: {
              nl: 'Lo-Reninge',
            },
            label: 'cultuurkuur_werkingsregio_nis-32030',
          },
          {
            name: {
              nl: 'Houthulst',
            },
            label: 'cultuurkuur_werkingsregio_nis-32006',
          },
          {
            name: {
              nl: 'Koekelare',
            },
            label: 'cultuurkuur_werkingsregio_nis-32010',
          },
          {
            name: {
              nl: 'Vleteren',
            },
            label: 'cultuurkuur_werkingsregio_nis-33041',
          },
          {
            name: {
              nl: 'Ieper',
            },
            label: 'cultuurkuur_werkingsregio_nis-33011',
          },
          {
            name: {
              nl: 'Langemark-Poelkapelle',
            },
            label: 'cultuurkuur_werkingsregio_nis-33040',
          },
          {
            name: {
              nl: 'Heuvelland',
            },
            label: 'cultuurkuur_werkingsregio_nis-33039',
          },
          {
            name: {
              nl: 'Mesen',
            },
            label: 'cultuurkuur_werkingsregio_nis-33016',
          },
          {
            name: {
              nl: 'Poperinge',
            },
            label: 'cultuurkuur_werkingsregio_nis-33021',
          },
          {
            name: {
              nl: 'Zonnebeke',
            },
            label: 'cultuurkuur_werkingsregio_nis-33037',
          },
          {
            name: {
              nl: 'Wervik',
            },
            label: 'cultuurkuur_werkingsregio_nis-33029',
          },
        ],
      },
    ],
  },
  {
    name: {
      nl: 'Provincie Oost-Vlaanderen',
    },
    label: 'cultuurkuur_werkingsregio_provincie_nis-40000',
    extraLabel: 'cultuurkuur_werkingsregio_nis-40000',
    children: [
      {
        name: {
          nl: 'Regio Gent',
        },
        children: [
          {
            name: {
              nl: 'Gent',
            },
            label: 'cultuurkuur_werkingsregio_nis-44021',
          },
        ],
      },
      {
        name: {
          nl: 'Regio Leiestreek Oost-Vlaanderen',
        },
        children: [
          {
            name: {
              nl: 'Nazareth-De Pinte',
            },
            label: 'cultuurkuur_werkingsregio_nis-44086',
          },
          {
            name: {
              nl: 'Sint-Martens-Latem',
            },
            label: 'cultuurkuur_werkingsregio_nis-44064',
          },
          {
            name: {
              nl: 'Zulte',
            },
            label: 'cultuurkuur_werkingsregio_nis-44081',
          },
          {
            name: {
              nl: 'Deinze',
            },
            label: 'cultuurkuur_werkingsregio_nis-44083',
          },
        ],
      },
      {
        name: {
          nl: 'Regio Meetjesland',
        },
        children: [
          {
            name: {
              nl: 'Zelzate',
            },
            label: 'cultuurkuur_werkingsregio_nis-43018',
          },
          {
            name: {
              nl: 'Eeklo',
            },
            label: 'cultuurkuur_werkingsregio_nis-43005',
          },
          {
            name: {
              nl: 'Assenede',
            },
            label: 'cultuurkuur_werkingsregio_nis-43002',
          },
          {
            name: {
              nl: 'Kaprijke',
            },
            label: 'cultuurkuur_werkingsregio_nis-43007',
          },
          {
            name: {
              nl: 'Sint-Laureins',
            },
            label: 'cultuurkuur_werkingsregio_nis-43014',
          },
          {
            name: {
              nl: 'Maldegem',
            },
            label: 'cultuurkuur_werkingsregio_nis-43010',
          },
          {
            name: {
              nl: 'Lochristi',
            },
            label: 'cultuurkuur_werkingsregio_nis-44087',
          },
          {
            name: {
              nl: 'Evergem',
            },
            label: 'cultuurkuur_werkingsregio_nis-44019',
          },
          {
            name: {
              nl: 'Aalter',
            },
            label: 'cultuurkuur_werkingsregio_nis-44084',
          },
          {
            name: {
              nl: 'Lievegem',
            },
            label: 'cultuurkuur_werkingsregio_nis-44085',
          },
        ],
      },
      {
        name: {
          nl: 'Regio Vlaamse Ardennen',
        },
        children: [
          {
            name: {
              nl: 'Geraardsbergen',
            },
            label: 'cultuurkuur_werkingsregio_nis-41018',
          },
          {
            name: {
              nl: 'Sint-Lievens-Houtem',
            },
            label: 'cultuurkuur_werkingsregio_nis-41063',
          },
          {
            name: {
              nl: 'Herzele',
            },
            label: 'cultuurkuur_werkingsregio_nis-41027',
          },
          {
            name: {
              nl: 'Zottegem',
            },
            label: 'cultuurkuur_werkingsregio_nis-41081',
          },
          {
            name: {
              nl: 'Lierde',
            },
            label: 'cultuurkuur_werkingsregio_nis-45063',
          },
          {
            name: {
              nl: 'Ronse',
            },
            label: 'cultuurkuur_werkingsregio_nis-45041',
          },
          {
            name: {
              nl: 'Zwalm',
            },
            label: 'cultuurkuur_werkingsregio_nis-45065',
          },
          {
            name: {
              nl: 'Brakel',
            },
            label: 'cultuurkuur_werkingsregio_nis-45059',
          },
          {
            name: {
              nl: 'Horebeke',
            },
            label: 'cultuurkuur_werkingsregio_nis-45062',
          },
          {
            name: {
              nl: 'Maarkedal',
            },
            label: 'cultuurkuur_werkingsregio_nis-45064',
          },
          {
            name: {
              nl: 'Kluisbergen',
            },
            label: 'cultuurkuur_werkingsregio_nis-45060',
          },
          {
            name: {
              nl: 'Oudenaarde',
            },
            label: 'cultuurkuur_werkingsregio_nis-45035',
          },
          {
            name: {
              nl: 'Wortegem-Petegem',
            },
            label: 'cultuurkuur_werkingsregio_nis-45061',
          },
          {
            name: {
              nl: 'Oosterzele',
            },
            label: 'cultuurkuur_werkingsregio_nis-44052',
          },
          {
            name: {
              nl: 'Gavere',
            },
            label: 'cultuurkuur_werkingsregio_nis-44020',
          },
          {
            name: {
              nl: 'Kruisem',
            },
            label: 'cultuurkuur_werkingsregio_nis-45068',
          },
        ],
      },
      {
        name: {
          nl: 'Regio Waasland',
        },
        children: [
          {
            name: {
              nl: 'Sint-Niklaas',
            },
            label: 'cultuurkuur_werkingsregio_nis-46021',
          },
          {
            name: {
              nl: 'Beveren-Kruibeke-Zwijndrecht',
            },
            label: 'cultuurkuur_werkingsregio_nis-46030',
          },
          {
            name: {
              nl: 'Temse',
            },
            label: 'cultuurkuur_werkingsregio_nis-46025',
          },
          {
            name: {
              nl: 'Lokeren',
            },
            label: 'cultuurkuur_werkingsregio_nis-46029',
          },
          {
            name: {
              nl: 'Sint-Gillis-Waas',
            },
            label: 'cultuurkuur_werkingsregio_nis-46020',
          },
          {
            name: {
              nl: 'Stekene',
            },
            label: 'cultuurkuur_werkingsregio_nis-46024',
          },
          {
            name: {
              nl: 'Waasmunster',
            },
            label: 'cultuurkuur_werkingsregio_nis-42023',
          },
        ],
      },
      {
        name: {
          nl: 'Regio Scheldeland Oost-Vlaanderen',
        },
        children: [
          {
            name: {
              nl: 'Aalst',
            },
            label: 'cultuurkuur_werkingsregio_nis-41002',
          },
          {
            name: {
              nl: 'Lede',
            },
            label: 'cultuurkuur_werkingsregio_nis-41034',
          },
          {
            name: {
              nl: 'Ninove',
            },
            label: 'cultuurkuur_werkingsregio_nis-41048',
          },
          {
            name: {
              nl: 'Erpe-Mere',
            },
            label: 'cultuurkuur_werkingsregio_nis-41082',
          },
          {
            name: {
              nl: 'Haaltert',
            },
            label: 'cultuurkuur_werkingsregio_nis-41024',
          },
          {
            name: {
              nl: 'Denderleeuw',
            },
            label: 'cultuurkuur_werkingsregio_nis-41011',
          },
          {
            name: {
              nl: 'Dendermonde',
            },
            label: 'cultuurkuur_werkingsregio_nis-42006',
          },
          {
            name: {
              nl: 'Hamme',
            },
            label: 'cultuurkuur_werkingsregio_nis-42008',
          },
          {
            name: {
              nl: 'Wetteren',
            },
            label: 'cultuurkuur_werkingsregio_nis-42025',
          },
          {
            name: {
              nl: 'Zele',
            },
            label: 'cultuurkuur_werkingsregio_nis-42028',
          },
          {
            name: {
              nl: 'Buggenhout',
            },
            label: 'cultuurkuur_werkingsregio_nis-42004',
          },
          {
            name: {
              nl: 'Wichelen',
            },
            label: 'cultuurkuur_werkingsregio_nis-42026',
          },
          {
            name: {
              nl: 'Laarne',
            },
            label: 'cultuurkuur_werkingsregio_nis-42010',
          },
          {
            name: {
              nl: 'Lebbeke',
            },
            label: 'cultuurkuur_werkingsregio_nis-42011',
          },
          {
            name: {
              nl: 'Berlare',
            },
            label: 'cultuurkuur_werkingsregio_nis-42003',
          },
          {
            name: {
              nl: 'Destelbergen',
            },
            label: 'cultuurkuur_werkingsregio_nis-44013',
          },
          {
            name: {
              nl: 'Merelbeke-Melle',
            },
            label: 'cultuurkuur_werkingsregio_nis-44088',
          },
        ],
      },
    ],
  },
  {
    name: {
      nl: 'Provincie Limburg',
    },
    label: 'cultuurkuur_werkingsregio_provincie_nis-70000',
    extraLabel: 'cultuurkuur_werkingsregio_nis-70000',
    children: [
      {
        name: {
          nl: 'Regio Haspengouw',
        },
        children: [
          {
            name: {
              nl: 'Alken',
            },
            label: 'cultuurkuur_werkingsregio_nis-73001',
          },
          {
            name: {
              nl: 'Tongeren-Borgloon',
            },
            label: 'cultuurkuur_werkingsregio_nis-73111',
          },
          {
            name: {
              nl: 'Herstappe',
            },
            label: 'cultuurkuur_werkingsregio_nis-73028',
          },
          {
            name: {
              nl: 'Bilzen-Hoeselt',
            },
            label: 'cultuurkuur_werkingsregio_nis-73110',
          },
          {
            name: {
              nl: 'Riemst',
            },
            label: 'cultuurkuur_werkingsregio_nis-73066',
          },
          {
            name: {
              nl: 'Sint-Truiden',
            },
            label: 'cultuurkuur_werkingsregio_nis-71053',
          },
          {
            name: {
              nl: 'Wellen',
            },
            label: 'cultuurkuur_werkingsregio_nis-73098',
          },
          {
            name: {
              nl: 'Heers',
            },
            label: 'cultuurkuur_werkingsregio_nis-73022',
          },
          {
            name: {
              nl: 'Gingelom',
            },
            label: 'cultuurkuur_werkingsregio_nis-71017',
          },
          {
            name: {
              nl: 'Herk-de-Stad',
            },
            label: 'cultuurkuur_werkingsregio_nis-71024',
          },
          {
            name: {
              nl: 'Halen',
            },
            label: 'cultuurkuur_werkingsregio_nis-71020',
          },
          {
            name: {
              nl: 'Nieuwerkerken',
            },
            label: 'cultuurkuur_werkingsregio_nis-71045',
          },
          {
            name: {
              nl: 'Landen',
            },
            label: 'cultuurkuur_werkingsregio_nis-24059',
          },
        ],
      },
      {
        name: {
          nl: 'Regio Hasselt',
        },
        children: [
          {
            name: {
              nl: 'Hasselt',
            },
            label: 'cultuurkuur_werkingsregio_nis-71072',
          },
        ],
      },
      {
        name: {
          nl: 'Regio Limburgse Kempen',
        },
        children: [
          {
            name: {
              nl: 'Houthalen-Helchteren',
            },
            label: 'cultuurkuur_werkingsregio_nis-72039',
          },
          {
            name: {
              nl: 'Lommel',
            },
            label: 'cultuurkuur_werkingsregio_nis-72020',
          },
          {
            name: {
              nl: 'Hamont-Achel',
            },
            label: 'cultuurkuur_werkingsregio_nis-72037',
          },
          {
            name: {
              nl: 'Hechtel-Eksel',
            },
            label: 'cultuurkuur_werkingsregio_nis-72038',
          },
          {
            name: {
              nl: 'Bocholt',
            },
            label: 'cultuurkuur_werkingsregio_nis-72003',
          },
          {
            name: {
              nl: 'Bree',
            },
            label: 'cultuurkuur_werkingsregio_nis-72004',
          },
          {
            name: {
              nl: 'Peer',
            },
            label: 'cultuurkuur_werkingsregio_nis-72030',
          },
          {
            name: {
              nl: 'Zonhoven',
            },
            label: 'cultuurkuur_werkingsregio_nis-71066',
          },
          {
            name: {
              nl: 'Heusden-Zolder',
            },
            label: 'cultuurkuur_werkingsregio_nis-71070',
          },
          {
            name: {
              nl: 'Lummen',
            },
            label: 'cultuurkuur_werkingsregio_nis-71037',
          },
          {
            name: {
              nl: 'Beringen',
            },
            label: 'cultuurkuur_werkingsregio_nis-71004',
          },
          {
            name: {
              nl: 'Diepenbeek',
            },
            label: 'cultuurkuur_werkingsregio_nis-71011',
          },
          {
            name: {
              nl: 'Genk',
            },
            label: 'cultuurkuur_werkingsregio_nis-71016',
          },
          {
            name: {
              nl: 'As',
            },
            label: 'cultuurkuur_werkingsregio_nis-71002',
          },
          {
            name: {
              nl: 'Zutendaal',
            },
            label: 'cultuurkuur_werkingsregio_nis-71067',
          },
          {
            name: {
              nl: 'Tessenderlo-Ham',
            },
            label: 'cultuurkuur_werkingsregio_nis-71071',
          },
          {
            name: {
              nl: 'Leopoldsburg',
            },
            label: 'cultuurkuur_werkingsregio_nis-71034',
          },
          {
            name: {
              nl: 'Pelt',
            },
            label: 'cultuurkuur_werkingsregio_nis-72043',
          },
          {
            name: {
              nl: 'Oudsbergen',
            },
            label: 'cultuurkuur_werkingsregio_nis-72042',
          },
        ],
      },
      {
        name: {
          nl: 'Regio Maasland',
        },
        children: [
          {
            name: {
              nl: 'Kinrooi',
            },
            label: 'cultuurkuur_werkingsregio_nis-72018',
          },
          {
            name: {
              nl: 'Dilsen-Stokkem',
            },
            label: 'cultuurkuur_werkingsregio_nis-72041',
          },
          {
            name: {
              nl: 'Maaseik',
            },
            label: 'cultuurkuur_werkingsregio_nis-72021',
          },
          {
            name: {
              nl: 'Lanaken',
            },
            label: 'cultuurkuur_werkingsregio_nis-73042',
          },
          {
            name: {
              nl: 'Maasmechelen',
            },
            label: 'cultuurkuur_werkingsregio_nis-73107',
          },
        ],
      },
      {
        name: {
          nl: 'Regio Voerstreek',
        },
        children: [
          {
            name: {
              nl: 'Voeren',
            },
            label: 'cultuurkuur_werkingsregio_nis-73109',
          },
        ],
      },
    ],
  },
];

export const dummyEducationLevels: HierarchicalData[] = [
  {
    name: {
      nl: 'Gewoon basisonderwijs (kleuter- en basis)',
    },
    label: 'cultuurkuur_Gewoon-basisonderwijs',
    children: [
      {
        name: {
          nl: 'Gewoon kleuteronderwijs',
        },
        label: 'cultuurkuur_Gewoon-kleuteronderwijs',
        children: [
          {
            name: {
              nl: 'Kleuter (2-3 jaar)',
            },
            label: 'cultuurkuur_Kleuter-2-3-jaar',
          },
          {
            name: {
              nl: 'Kleuter (3-4 jaar)',
            },
            label: 'cultuurkuur_Kleuter-3-4-jaar',
          },
          {
            name: {
              nl: 'Kleuter (4-5 jaar)',
            },
            label: 'cultuurkuur_Kleuter-4-5-jaar',
          },
        ],
      },
      {
        name: {
          nl: 'Gewoon lager onderwijs',
        },
        label: 'cultuurkuur_Gewoon-lager-onderwijs',
        children: [
          {
            name: {
              nl: 'Eerste graad',
            },
            label: 'cultuurkuur_1ste-graad',
          },
          {
            name: {
              nl: 'Tweede graad',
            },
            label: 'cultuurkuur_2de-graad',
          },
          {
            name: {
              nl: 'Derde graad',
            },
            label: 'cultuurkuur_3de-graad',
          },
        ],
      },
      {
        name: {
          nl: 'Onthaalonderwijs voor anderstalige nieuwkomers (OKAN)',
        },
        label:
          'cultuurkuur_Onthaalonderwijs-voor-anderstalige-nieuwkomers (OKAN)',
      },
    ],
  },
  {
    name: {
      nl: 'Buitengewoon basisonderwijs',
    },
    label: 'cultuurkuur_Buitengewoon-basisonderwijs',
    children: [
      {
        name: {
          nl: 'Buitengewoon kleuteronderwijs',
        },
        label: 'cultuurkuur_Buitengewoon-kleuteronderwijs',
      },
      {
        name: {
          nl: 'Buitengewoon lager onderwijs',
        },
        label: 'cultuurkuur_Buitengewoon-lager-onderwijs',
      },
    ],
  },
  {
    name: {
      nl: 'Gewoon secundair onderwijs',
    },
    label: 'cultuurkuur_Voltijds-gewoon-secundair-onderwijs',
    children: [
      {
        name: {
          nl: 'Eerste graad',
        },
        label: 'cultuurkuur_eerste-graad',
        children: [
          {
            name: {
              nl: 'A-stroom',
            },
            label: 'cultuurkuur_eerste-graad-A-stroom',
          },
          {
            name: {
              nl: 'B-stroom',
            },
            label: 'cultuurkuur_eerste-graad-B-stroom',
          },
        ],
      },
      {
        name: {
          nl: 'Tweede graad',
        },
        label: 'cultuurkuur_tweede-graad',
        children: [
          {
            name: {
              nl: 'Finaliteit doorstroom',
            },
            label: 'cultuurkuur_tweede-graad-finaliteit-doorstroom',
          },
          {
            name: {
              nl: 'Finaliteit arbeidsmarkt',
            },
            label: 'cultuurkuur_tweede-graad-finaliteit-arbeidsmarkt',
          },
          {
            name: {
              nl: 'Dubbele finaliteit',
            },
            label: 'cultuurkuur_tweede-graad-dubbele-finaliteit',
          },
        ],
      },
      {
        name: {
          nl: 'Derde graad',
        },
        label: 'cultuurkuur_derde-graad',
        children: [
          {
            name: {
              nl: 'Finaliteit doorstroom',
            },
            label: 'cultuurkuur_derde-graad-finaliteit-doorstroom',
          },
          {
            name: {
              nl: 'Finaliteit arbeidsmarkt',
            },
            label: 'cultuurkuur_derde-graad-finaliteit-arbeidsmarkt',
          },
          {
            name: {
              nl: 'Dubbele finaliteit',
            },
            label: 'cultuurkuur_derde-graad-dubbele-finaliteit',
          },
        ],
      },
      {
        name: {
          nl: 'Secundair na Secundair (Se-n-Se)',
        },
        label: 'cultuurkuur_Secundair-na-secundair-(Se-n-Se)',
      },
      {
        name: {
          nl: 'Onthaalonderwijs voor anderstalige nieuwkomers (OKAN)',
        },
        label:
          'cultuurkuur_Onthaalonderwijs-voor-anderstalige-nieuwkomers-OKAN',
      },
    ],
  },
  {
    name: {
      nl: 'Buitengewoon secundair onderwijs',
    },
    label: 'cultuurkuur_Buitengewoon-secundair-onderwijs',
  },
  {
    name: {
      nl: 'Deeltijds leren en werken',
    },
    label: 'cultuurkuur_Deeltijds-leren-en-werken',
  },
  {
    name: {
      nl: 'Hoger onderwijs',
    },
    label: 'cultuurkuur_Hoger-onderwijs',
  },
  {
    name: {
      nl: 'Volwassenenonderwijs',
    },
    label: 'cultuurkuur_Volwassenenonderwijs',
  },
  {
    name: {
      nl: 'Deeltijds kunstonderwijs',
    },
    label: 'cultuurkuur_Deeltijds-kunstonderwijs-DKO',
    children: [
      {
        name: {
          nl: 'Beeldende en audiovisuele kunst',
        },
        label: 'cultuurkuur_Beeldende-en-audiovisuele-kunst',
      },
      {
        name: {
          nl: 'Dans',
        },
        label: 'cultuurkuur_dans',
      },
      {
        name: {
          nl: 'Muziek',
        },
        label: 'cultuurkuur_muziek',
      },
      {
        name: {
          nl: 'Woordkunst & drama',
        },
        label: 'cultuurkuur_Woordkunst-drama',
      },
    ],
  },
];

describe('useLabelsManager', () => {
  test('can toggle a single leaf', () => {
    const { result } = renderHook(() =>
      useLabelsManager('location', dummyMunicipalities),
    );

    expect(
      result.current.isGroupFullySelected(
        dummyMunicipalities[0].children[0].children[0],
      ),
    ).toBe(false);

    act(() => {
      result.current.handleSelectionToggle(
        dummyMunicipalities[0].children[0].children[0],
      );
    });

    expect(
      result.current.isGroupFullySelected(
        dummyMunicipalities[0].children[0].children[0],
      ),
    ).toBe(true);
  });

  test('can toggle an entire level', () => {
    const { result } = renderHook(() =>
      useLabelsManager('location', dummyMunicipalities),
    );

    expect(
      result.current.isGroupFullySelected(
        dummyMunicipalities[0].children[0].children[0],
      ),
    ).toBe(false);

    act(() => {
      result.current.handleSelectionToggle(dummyMunicipalities[0]);
    });

    expect(result.current.getSelected()).toEqual([
      dummyMunicipalities[0].label,
    ]);
    expect(
      result.current.isGroupFullySelected(
        dummyMunicipalities[0].children[0].children[0],
      ),
    ).toBe(true);

    act(() => {
      result.current.handleSelectionToggle(dummyMunicipalities[0]);
    });

    expect(
      result.current.isGroupFullySelected(
        dummyMunicipalities[0].children[0].children[0],
      ),
    ).toBe(false);
  });

  test('can untoggle a leaf from a toggled group', () => {
    const { result } = renderHook(() =>
      useLabelsManager('location', dummyMunicipalities),
    );

    act(() => {
      result.current.handleSelectionToggle(dummyMunicipalities[0]);
    });

    expect(result.current.isGroupFullySelected(dummyMunicipalities[0])).toBe(
      true,
    );
    expect(
      result.current.isGroupFullySelected(dummyMunicipalities[0].children[0]),
    ).toBe(true);

    act(() => {
      result.current.handleSelectionToggle(
        dummyMunicipalities[0].children[0].children[0],
      );
    });

    expect(
      result.current.isGroupFullySelected(
        dummyMunicipalities[0].children[0].children[0],
      ),
    ).toBe(false);
    expect(result.current.isGroupFullySelected(dummyMunicipalities[0])).toBe(
      false,
    );
    expect(result.current.isGroupFullySelected(dummyMunicipalities[0])).toBe(
      false,
    );
  });

  test('can pass initial selection state', () => {
    const { result } = renderHook(() =>
      useLabelsManager('location', dummyMunicipalities, [
        dummyMunicipalities[0],
        dummyMunicipalities[0].children[0].children[0],
      ]),
    );

    expect(result.current.getSelected()).toEqual([
      dummyMunicipalities[0].label,
    ]);
    expect(result.current.isGroupFullySelected(dummyMunicipalities[0])).toBe(
      true,
    );
    expect(
      result.current.isGroupFullySelected(dummyMunicipalities[0].children[0]),
    ).toBe(true);
    expect(result.current.isGroupFullySelected(dummyMunicipalities[0])).toBe(
      true,
    );
    expect(
      result.current.isGroupFullySelected(
        dummyMunicipalities[0].children[0].children[1],
      ),
    ).toBe(true);
  });

  test('can expand selection from initial selection state', () => {
    const { result } = renderHook(() =>
      useLabelsManager('location', dummyMunicipalities, [
        dummyMunicipalities[1].children[1].children[0],
      ]),
    );

    expect(
      result.current.isGroupFullySelected(dummyMunicipalities[1].children[1]),
    ).toBe(true);
  });

  test('can use extraLabel fields when present', () => {
    const { result } = renderHook(() =>
      useLabelsManager('location', dummyMunicipalities),
    );

    act(() =>
      result.current.handleSelectionToggle(
        dummyMunicipalities[0].children[0].children[0],
      ),
    );

    expect(result.current.getSelected()).toEqual([
      dummyMunicipalities[0].extraLabel,
      dummyMunicipalities[0].children[0].children[0].label,
    ]);
  });

  test('can expand selection from leaves', () => {
    const { result } = renderHook(() =>
      useLabelsManager('education', dummyEducationLevels),
    );

    act(() => {
      result.current.handleSelectionToggle(
        dummyEducationLevels[0].children[0].children[0],
      );
    });

    expect(result.current.getSelected()).toEqual(
      [
        dummyEducationLevels[0].label,
        dummyEducationLevels[0].children[0].label,
        dummyEducationLevels[0].children[0].children[0].label,
      ].sort(),
    );
  });

  test('can expand selection from parents', () => {
    const { result } = renderHook(() =>
      useLabelsManager('education', dummyEducationLevels),
    );

    act(() => {
      result.current.handleSelectionToggle(dummyEducationLevels[0]);
    });

    expect(result.current.getSelected()).toEqual(
      [
        dummyEducationLevels[0].label,
        dummyEducationLevels[0].children[0].label,
        dummyEducationLevels[0].children[0].children[0].label,
        dummyEducationLevels[0].children[0].children[1].label,
        dummyEducationLevels[0].children[0].children[2].label,
        dummyEducationLevels[0].children[1].label,
        dummyEducationLevels[0].children[1].children[0].label,
        dummyEducationLevels[0].children[1].children[1].label,
        dummyEducationLevels[0].children[1].children[2].label,
        dummyEducationLevels[0].children[2].label,
      ].sort(),
    );
  });

  test('does not toggle siblings when parent gets partially toggled', () => {
    const { result } = renderHook(() =>
      useLabelsManager('education', dummyEducationLevels),
    );

    act(() =>
      result.current.handleSelectionToggle(
        dummyEducationLevels[0].children[1].children[1],
      ),
    );

    expect(
      result.current.isGroupFullySelected(dummyEducationLevels[0].children[2]),
    ).toBe(false);

    expect(
      result.current.isGroupFullySelected(
        dummyEducationLevels[0].children[0].children[0],
      ),
    ).toBe(false);

    act(() =>
      result.current.handleSelectionToggle(dummyEducationLevels[0].children[2]),
    );

    expect(
      result.current.isGroupFullySelected(dummyEducationLevels[0].children[2]),
    ).toBe(true);
  });
});
