import { fetchFromApi } from '@/utils/fetchFromApi';

import {
  ExtendQueryOptions,
  queryOptions,
  useAuthenticatedQuery,
} from './authenticated-query';

export const dummyMunicipalities: HierarchicalData[] = [
  {
    name: { nl: 'Brussels Hoofdstedelijk Gewest' },
    label: 'nis-01000',
    children: [
      {
        name: { nl: 'Regio Brussel' },
        label: 'reg-brussel',
        children: [
          {
            name: { nl: 'Anderlecht deelgemeenten' },
            label: 'nis-21001',
          },
          {
            name: { nl: 'Brussel deelgemeenten' },
            label: 'nis-21004',
          },
          {
            name: { nl: 'Elsene deelgemeenten' },
            label: 'nis-21009',
          },
          {
            name: { nl: 'Etterbeek deelgemeenten' },
            label: 'nis-21005',
          },
          {
            name: { nl: 'Evere deelgemeenten' },
            label: 'nis-21006',
          },
          {
            name: { nl: 'Ganshoren deelgemeenten' },
            label: 'nis-21008',
          },
          {
            name: { nl: 'Jette deelgemeenten' },
            label: 'nis-21010',
          },
          {
            name: { nl: 'Koekelberg deelgemeenten' },
            label: 'nis-21011',
          },
          {
            name: { nl: 'Oudergem deelgemeenten' },
            label: 'nis-21002',
          },
          {
            name: { nl: 'Schaarbeek deelgemeenten' },
            label: 'nis-21015',
          },
          {
            name: { nl: 'Sint-Agatha-Berchem deelgemeenten' },
            label: 'nis-21003',
          },
          {
            name: { nl: 'Sint-Gillis deelgemeenten' },
            label: 'nis-21013',
          },
          {
            name: { nl: 'Sint-Jans-Molenbeek deelgemeenten' },
            label: 'nis-21012',
          },
          {
            name: { nl: 'Sint-Joost-ten-Node deelgemeenten' },
            label: 'nis-21014',
          },
          {
            name: { nl: 'Sint-Lambrechts-Woluwe deelgemeenten' },
            label: 'nis-21018',
          },
          {
            name: { nl: 'Sint-Pieters-Woluwe deelgemeenten' },
            label: 'nis-21019',
          },
          {
            name: { nl: 'Ukkel deelgemeenten' },
            label: 'nis-21016',
          },
          {
            name: { nl: 'Vorst deelgemeenten' },
            label: 'nis-21007',
          },
          {
            name: { nl: 'Watermaal-Bosvoorde deelgemeenten' },
            label: 'nis-21017',
          },
        ],
      },
    ],
  },
  {
    name: { nl: 'Provincie Antwerpen' },
    label: 'nis-10000',
    children: [
      {
        name: { nl: 'Regio Antwerpen' },
        label: 'reg-antwerpen',
        children: [
          {
            name: { nl: 'Antwerpen deelgemeenten' },
            label: 'nis-11002',
          },
          {
            name: { nl: 'Wommelgem deelgemeenten' },
            label: 'nis-11052',
          },
          {
            name: { nl: 'Boechout deelgemeenten' },
            label: 'nis-11004',
          },
          {
            name: { nl: 'Hove deelgemeenten' },
            label: 'nis-11021',
          },
          {
            name: { nl: 'Lint deelgemeenten' },
            label: 'nis-11025',
          },
          {
            name: { nl: 'Kontich deelgemeenten' },
            label: 'nis-11024',
          },
          {
            name: { nl: 'Aartselaar deelgemeenten' },
            label: 'nis-11001',
          },
          {
            name: { nl: 'Mortsel deelgemeenten' },
            label: 'nis-11029',
          },
          {
            name: { nl: 'Edegem deelgemeenten' },
            label: 'nis-11013',
          },
        ],
      },
      {
        name: { nl: 'Regio Mechelen' },
        label: 'reg-mechelen',
        children: [
          {
            name: { nl: 'Mechelen deelgemeenten' },
            label: 'nis-12025',
          },
        ],
      },
      {
        name: { nl: 'Regio Scheldeland Antwerpen' },
        label: 'reg-scheldeland-antwerpen',
        children: [
          {
            name: { nl: 'Hemiksem deelgemeenten' },
            label: 'nis-11018',
          },
          {
            name: { nl: 'Schelle deelgemeenten' },
            label: 'nis-11038',
          },
          {
            name: { nl: 'Rumst deelgemeenten' },
            label: 'nis-11037',
          },
          {
            name: { nl: 'Niel deelgemeenten' },
            label: 'nis-11030',
          },
          {
            name: { nl: 'Boom deelgemeenten' },
            label: 'nis-11005',
          },
          {
            name: { nl: 'Willebroek deelgemeenten' },
            label: 'nis-12040',
          },
          {
            name: { nl: 'Bornem deelgemeenten' },
            label: 'nis-12007',
          },
          {
            name: { nl: 'Puurs-Sint-Amands deelgemeenten' },
            label: 'nis-12041',
          },
        ],
      },
      {
        name: { nl: 'Regio Kempen' },
        label: 'reg-kempen',
        children: [
          {
            name: { nl: 'Wijnegem deelgemeenten' },
            label: 'nis-11050',
          },
          {
            name: { nl: 'Zandhoven deelgemeenten' },
            label: 'nis-11054',
          },
          {
            name: { nl: 'Malle deelgemeenten' },
            label: 'nis-11057',
          },
          {
            name: { nl: 'Ranst deelgemeenten' },
            label: 'nis-11035',
          },
          {
            name: { nl: 'Schoten deelgemeenten' },
            label: 'nis-11040',
          },
          {
            name: { nl: 'Essen deelgemeenten' },
            label: 'nis-11016',
          },
          {
            name: { nl: 'Kalmthout deelgemeenten' },
            label: 'nis-11022',
          },
          {
            name: { nl: 'Brasschaat deelgemeenten' },
            label: 'nis-11008',
          },
          {
            name: { nl: 'Stabroek deelgemeenten' },
            label: 'nis-11044',
          },
          {
            name: { nl: 'Kapellen deelgemeenten' },
            label: 'nis-11023',
          },
          {
            name: { nl: 'Brecht deelgemeenten' },
            label: 'nis-11009',
          },
          {
            name: { nl: 'Schilde deelgemeenten' },
            label: 'nis-11039',
          },
          {
            name: { nl: 'Zoersel deelgemeenten' },
            label: 'nis-11055',
          },
          {
            name: { nl: 'Wuustwezel deelgemeenten' },
            label: 'nis-11053',
          },
          {
            name: { nl: 'Duffel deelgemeenten' },
            label: 'nis-12009',
          },
          {
            name: { nl: 'Bonheiden deelgemeenten' },
            label: 'nis-12005',
          },
          {
            name: { nl: 'Sint-Katelijne-Waver deelgemeenten' },
            label: 'nis-12035',
          },
          {
            name: { nl: 'Herentals deelgemeenten' },
            label: 'nis-13011',
          },
          {
            name: { nl: 'Herselt deelgemeenten' },
            label: 'nis-13013',
          },
          {
            name: { nl: 'Hulshout deelgemeenten' },
            label: 'nis-13016',
          },
          {
            name: { nl: 'Olen deelgemeenten' },
            label: 'nis-13029',
          },
          {
            name: { nl: 'Westerlo deelgemeenten' },
            label: 'nis-13049',
          },
          {
            name: { nl: 'Herenthout deelgemeenten' },
            label: 'nis-13012',
          },
          {
            name: { nl: 'Lille deelgemeenten' },
            label: 'nis-13019',
          },
          {
            name: { nl: 'Grobbendonk deelgemeenten' },
            label: 'nis-13010',
          },
          {
            name: { nl: 'Vorselaar deelgemeenten' },
            label: 'nis-13044',
          },
          {
            name: { nl: 'Turnhout deelgemeenten' },
            label: 'nis-13040',
          },
          {
            name: { nl: 'Rijkevorsel deelgemeenten' },
            label: 'nis-13037',
          },
          {
            name: { nl: 'Hoogstraten deelgemeenten' },
            label: 'nis-13014',
          },
          {
            name: { nl: 'Merksplas deelgemeenten' },
            label: 'nis-13023',
          },
          {
            name: { nl: 'Beerse deelgemeenten' },
            label: 'nis-13004',
          },
          {
            name: { nl: 'Vosselaar deelgemeenten' },
            label: 'nis-13046',
          },
          {
            name: { nl: 'Oud-Turnhout deelgemeenten' },
            label: 'nis-13031',
          },
          {
            name: { nl: 'Arendonk deelgemeenten' },
            label: 'nis-13001',
          },
          {
            name: { nl: 'Ravels deelgemeenten' },
            label: 'nis-13035',
          },
          {
            name: { nl: 'Baarle-Hertog deelgemeenten' },
            label: 'nis-13002',
          },
          {
            name: { nl: 'Mol deelgemeenten' },
            label: 'nis-13025',
          },
          {
            name: { nl: 'Laakdal deelgemeenten' },
            label: 'nis-13053',
          },
          {
            name: { nl: 'Geel deelgemeenten' },
            label: 'nis-13008',
          },
          {
            name: { nl: 'Meerhout deelgemeenten' },
            label: 'nis-13021',
          },
          {
            name: { nl: 'Kasterlee deelgemeenten' },
            label: 'nis-13017',
          },
          {
            name: { nl: 'Retie deelgemeenten' },
            label: 'nis-13036',
          },
          {
            name: { nl: 'Dessel deelgemeenten' },
            label: 'nis-13006',
          },
          {
            name: { nl: 'Balen deelgemeenten' },
            label: 'nis-13003',
          },
          {
            name: { nl: 'Heist-op-den-Berg deelgemeenten' },
            label: 'nis-12014',
          },
          {
            name: { nl: 'Lier deelgemeenten' },
            label: 'nis-12021',
          },
          {
            name: { nl: 'Nijlen deelgemeenten' },
            label: 'nis-12026',
          },
          {
            name: { nl: 'Putte deelgemeenten' },
            label: 'nis-12029',
          },
          {
            name: { nl: 'Berlaar deelgemeenten' },
            label: 'nis-12002',
          },
        ],
      },
    ],
  },
  {
    name: { nl: 'Provincie Vlaams-Brabant' },
    label: 'nis-20001',
    children: [
      {
        name: { nl: 'Regio Groene Gordel' },
        label: 'reg-groene-gordel',
        children: [
          {
            name: { nl: 'Vilvoorde deelgemeenten' },
            label: 'nis-23088',
          },
          {
            name: { nl: 'Steenokkerzeel deelgemeenten' },
            label: 'nis-23081',
          },
          {
            name: { nl: 'Machelen deelgemeenten' },
            label: 'nis-23047',
          },
          {
            name: { nl: 'Grimbergen deelgemeenten' },
            label: 'nis-23025',
          },
          {
            name: { nl: 'Meise deelgemeenten' },
            label: 'nis-23050',
          },
          {
            name: { nl: 'Kapelle-op-den-Bos deelgemeenten' },
            label: 'nis-23039',
          },
          {
            name: { nl: 'Kampenhout deelgemeenten' },
            label: 'nis-23038',
          },
          {
            name: { nl: 'Zaventem deelgemeenten' },
            label: 'nis-23094',
          },
          {
            name: { nl: 'Kraainem deelgemeenten' },
            label: 'nis-23099',
          },
          {
            name: { nl: 'Wezembeek-Oppem deelgemeenten' },
            label: 'nis-23103',
          },
          {
            name: { nl: 'Zemst deelgemeenten' },
            label: 'nis-23096',
          },
          {
            name: { nl: 'Halle deelgemeenten' },
            label: 'nis-23027',
          },
          {
            name: { nl: 'Pajottegem deelgemeenten' },
            label: 'nis-23106',
          },
          {
            name: { nl: 'Bever deelgemeenten' },
            label: 'nis-23009',
          },
          {
            name: { nl: 'Hoeilaart deelgemeenten' },
            label: 'nis-23033',
          },
          {
            name: { nl: 'Sint-Pieters-Leeuw deelgemeenten' },
            label: 'nis-23077',
          },
          {
            name: { nl: 'Drogenbos deelgemeenten' },
            label: 'nis-23098',
          },
          {
            name: { nl: 'Linkebeek deelgemeenten' },
            label: 'nis-23100',
          },
          {
            name: { nl: 'Sint-Genesius-Rode deelgemeenten' },
            label: 'nis-23101',
          },
          {
            name: { nl: 'Beersel deelgemeenten' },
            label: 'nis-23003',
          },
          {
            name: { nl: 'Pepingen deelgemeenten' },
            label: 'nis-23064',
          },
          {
            name: { nl: 'Dilbeek deelgemeenten' },
            label: 'nis-23016',
          },
          {
            name: { nl: 'Asse deelgemeenten' },
            label: 'nis-23002',
          },
          {
            name: { nl: 'Ternat deelgemeenten' },
            label: 'nis-23086',
          },
          {
            name: { nl: 'Opwijk deelgemeenten' },
            label: 'nis-23060',
          },
          {
            name: { nl: 'Lennik deelgemeenten' },
            label: 'nis-23104',
          },
          {
            name: { nl: 'Roosdaal deelgemeenten' },
            label: 'nis-23097',
          },
          {
            name: { nl: 'Liedekerke deelgemeenten' },
            label: 'nis-23044',
          },
          {
            name: { nl: 'Wemmel deelgemeenten' },
            label: 'nis-23102',
          },
          {
            name: { nl: 'Merchtem deelgemeenten' },
            label: 'nis-23052',
          },
          {
            name: { nl: 'Affligem deelgemeenten' },
            label: 'nis-23105',
          },
          {
            name: { nl: 'Londerzeel deelgemeenten' },
            label: 'nis-23045',
          },
          {
            name: { nl: 'Herent deelgemeenten' },
            label: 'nis-24038',
          },
          {
            name: { nl: 'Huldenberg deelgemeenten' },
            label: 'nis-24045',
          },
          {
            name: { nl: 'Oud-Heverlee deelgemeenten' },
            label: 'nis-24086',
          },
          {
            name: { nl: 'Bertem deelgemeenten' },
            label: 'nis-24009',
          },
          {
            name: { nl: 'Kortenberg deelgemeenten' },
            label: 'nis-24055',
          },
          {
            name: { nl: 'Tervuren deelgemeenten' },
            label: 'nis-24104',
          },
          {
            name: { nl: 'Overijse deelgemeenten' },
            label: 'nis-23062',
          },
          {
            name: { nl: 'Keerbergen deelgemeenten' },
            label: 'nis-24048',
          },
          {
            name: { nl: 'Haacht deelgemeenten' },
            label: 'nis-24033',
          },
          {
            name: { nl: 'Boortmeerbeek deelgemeenten' },
            label: 'nis-24014',
          },
        ],
      },
      {
        name: { nl: 'Regio Hageland' },
        label: 'reg-hageland',
        children: [
          {
            name: { nl: 'Aarschot deelgemeenten' },
            label: 'nis-24001',
          },
          {
            name: { nl: 'Scherpenheuvel-Zichem deelgemeenten' },
            label: 'nis-24134',
          },
          {
            name: { nl: 'Diest deelgemeenten' },
            label: 'nis-24020',
          },
          {
            name: { nl: 'Tienen deelgemeenten' },
            label: 'nis-24107',
          },
          {
            name: { nl: 'Hoegaarden deelgemeenten' },
            label: 'nis-24041',
          },
          {
            name: { nl: 'Linter deelgemeenten' },
            label: 'nis-24133',
          },
          {
            name: { nl: 'Glabbeek deelgemeenten' },
            label: 'nis-24137',
          },
          {
            name: { nl: 'Tielt-Winge deelgemeenten' },
            label: 'nis-24135',
          },
          {
            name: { nl: 'Zoutleeuw deelgemeenten' },
            label: 'nis-24130',
          },
          {
            name: { nl: 'Geetbets deelgemeenten' },
            label: 'nis-24028',
          },
          {
            name: { nl: 'Bekkevoort deelgemeenten' },
            label: 'nis-24008',
          },
          {
            name: { nl: 'Kortenaken deelgemeenten' },
            label: 'nis-24054',
          },
          {
            name: { nl: 'Rotselaar deelgemeenten' },
            label: 'nis-24094',
          },
          {
            name: { nl: 'Tremelo deelgemeenten' },
            label: 'nis-24109',
          },
          {
            name: { nl: 'Begijnendijk deelgemeenten' },
            label: 'nis-24007',
          },
          {
            name: { nl: 'Lubbeek deelgemeenten' },
            label: 'nis-24066',
          },
          {
            name: { nl: 'Holsbeek deelgemeenten' },
            label: 'nis-24043',
          },
          {
            name: { nl: 'Bierbeek deelgemeenten' },
            label: 'nis-24011',
          },
          {
            name: { nl: 'Boutersem deelgemeenten' },
            label: 'nis-24016',
          },
        ],
      },
      {
        name: { nl: 'Regio Leuven' },
        label: 'reg-leuven',
        children: [
          {
            name: { nl: 'Leuven deelgemeenten' },
            label: 'nis-24062',
          },
        ],
      },
    ],
  },
  {
    name: { nl: 'Provincie West-Vlaanderen' },
    label: 'nis-30000',
    children: [
      {
        name: { nl: 'Regio Brugge' },
        label: 'reg-brugge',
        children: [
          {
            name: { nl: 'Brugge deelgemeenten' },
            label: 'nis-31005',
          },
        ],
      },
      {
        name: { nl: 'Regio Brugse Ommeland' },
        label: 'reg-brugse-ommeland',
        children: [
          {
            name: { nl: 'Oostkamp deelgemeenten' },
            label: 'nis-31022',
          },
          {
            name: { nl: 'Zedelgem deelgemeenten' },
            label: 'nis-31040',
          },
          {
            name: { nl: 'Damme deelgemeenten' },
            label: 'nis-31006',
          },
          {
            name: { nl: 'Zuienkerke deelgemeenten' },
            label: 'nis-31042',
          },
          {
            name: { nl: 'Ichtegem deelgemeenten' },
            label: 'nis-35006',
          },
          {
            name: { nl: 'Jabbeke deelgemeenten' },
            label: 'nis-31012',
          },
          {
            name: { nl: 'Beernem deelgemeenten' },
            label: 'nis-31003',
          },
          {
            name: { nl: 'Torhout deelgemeenten' },
            label: 'nis-31033',
          },
          {
            name: { nl: 'Oudenburg deelgemeenten' },
            label: 'nis-35014',
          },
          {
            name: { nl: 'Gistel deelgemeenten' },
            label: 'nis-35005',
          },
          {
            name: { nl: 'Lichtervelde deelgemeenten' },
            label: 'nis-36011',
          },
          {
            name: { nl: 'Tielt deelgemeenten' },
            label: 'nis-37022',
          },
          {
            name: { nl: 'Pittem deelgemeenten' },
            label: 'nis-37011',
          },
          {
            name: { nl: 'Wingene +deelgemeenv//Q-' },
            label: 'nis-37021',
          },
          {
            name: { nl: 'Ardooie deelgemeenten' },
            label: 'nis-37020',
          },
        ],
      },
      {
        name: { nl: 'Regio Leiestreek West-Vlaanderen' },
        label: 'reg-leiestreek-west-vlaanderen',
        children: [
          {
            name: { nl: 'Ingelmunster deelgemeenten' },
            label: 'nis-36007',
          },
          {
            name: { nl: 'Roeselare deelgemeenten' },
            label: 'nis-36015',
          },
          {
            name: { nl: 'Izegem deelgemeenten' },
            label: 'nis-36008',
          },
          {
            name: { nl: 'Ledegem deelgemeenten' },
            label: 'nis-36010',
          },
          {
            name: { nl: 'Moorslede deelgemeenten' },
            label: 'nis-36012',
          },
          {
            name: { nl: 'Wielsbeke deelgemeenten' },
            label: 'nis-37017',
          },
          {
            name: { nl: 'Dentergem deelgemeenten' },
            label: 'nis-37002',
          },
          {
            name: { nl: 'Oostrozebeke deelgemeenten' },
            label: 'nis-37010',
          },
          {
            name: { nl: 'Kortrijk deelgemeenten' },
            label: 'nis-34022',
          },
          {
            name: { nl: 'Kuurne deelgemeenten' },
            label: 'nis-34023',
          },
          {
            name: { nl: 'Harelbeke deelgemeenten' },
            label: 'nis-34013',
          },
          {
            name: { nl: 'Deerlijk deelgemeenten' },
            label: 'nis-34009',
          },
          {
            name: { nl: 'Zwevegem deelgemeenten' },
            label: 'nis-34042',
          },
          {
            name: { nl: 'Wevelgem deelgemeenten' },
            label: 'nis-34041',
          },
          {
            name: { nl: 'Anzegem deelgemeenten' },
            label: 'nis-34002',
          },
          {
            name: { nl: 'Avelgem deelgemeenten' },
            label: 'nis-34003',
          },
          {
            name: { nl: 'Spiere-Helkijn deelgemeenten' },
            label: 'nis-34043',
          },
          {
            name: { nl: 'Waregem deelgemeenten' },
            label: 'nis-34040',
          },
          {
            name: { nl: 'Lendelede deelgemeenten' },
            label: 'nis-34025',
          },
          {
            name: { nl: 'Menen deelgemeenten' },
            label: 'nis-34027',
          },
        ],
      },
      {
        name: { nl: 'Regio Vlaamse Kust' },
        label: 'reg-vlaamse-kust',
        children: [
          {
            name: { nl: 'Knokke-Heist deelgemeenten' },
            label: 'nis-31043',
          },
          {
            name: { nl: 'Blankenberge deelgemeenten' },
            label: 'nis-31004',
          },
          {
            name: { nl: 'De Haan deelgemeenten' },
            label: 'nis-35029',
          },
          {
            name: { nl: 'Bredene deelgemeenten' },
            label: 'nis-35002',
          },
          {
            name: { nl: 'De Panne deelgemeenten' },
            label: 'nis-38008',
          },
          {
            name: { nl: 'Oostende deelgemeenten' },
            label: 'nis-35013',
          },
          {
            name: { nl: 'Middelkerke deelgemeenten' },
            label: 'nis-35011',
          },
          {
            name: { nl: 'Nieuwpoort deelgemeenten' },
            label: 'nis-38016',
          },
          {
            name: { nl: 'Koksijde deelgemeenten' },
            label: 'nis-38014',
          },
        ],
      },
      {
        name: { nl: 'Regio Westhoek' },
        label: 'reg-westhoek',
        children: [
          {
            name: { nl: 'Hooglede deelgemeenten' },
            label: 'nis-36006',
          },
          {
            name: { nl: 'Staden deelgemeenten' },
            label: 'nis-36019',
          },
          {
            name: { nl: 'Veurne deelgemeenten' },
            label: 'nis-38025',
          },
          {
            name: { nl: 'Alveringem deelgemeenten' },
            label: 'nis-38002',
          },
          {
            name: { nl: 'Diksmuide deelgemeenten' },
            label: 'nis-32003',
          },
          {
            name: { nl: 'Kortemark deelgemeenten' },
            label: 'nis-32011',
          },
          {
            name: { nl: 'Lo-Reninge deelgemeenten' },
            label: 'nis-32030',
          },
          {
            name: { nl: 'Houthulst deelgemeenten' },
            label: 'nis-32006',
          },
          {
            name: { nl: 'Koekelare deelgemeenten' },
            label: 'nis-32010',
          },
          {
            name: { nl: 'Vleteren deelgemeenten' },
            label: 'nis-33041',
          },
          {
            name: { nl: 'Ieper deelgemeenten' },
            label: 'nis-33011',
          },
          {
            name: { nl: 'Langemark-Poelkapelle deelgemeenten' },
            label: 'nis-33040',
          },
          {
            name: { nl: 'Heuvelland deelgemeenten' },
            label: 'nis-33039',
          },
          {
            name: { nl: 'Mesen deelgemeenten' },
            label: 'nis-33016',
          },
          {
            name: { nl: 'Poperinge deelgemeenten' },
            label: 'nis-33021',
          },
          {
            name: { nl: 'Zonnebeke deelgemeenten' },
            label: 'nis-33037',
          },
          {
            name: { nl: 'Wervik deelgemeenten' },
            label: 'nis-33029',
          },
        ],
      },
    ],
  },
  {
    name: { nl: 'Provincie Oost-Vlaanderen' },
    label: 'nis-40000',
    children: [
      {
        name: { nl: 'Regio Gent' },
        label: 'reg-gent',
        children: [
          {
            name: { nl: 'Gent deelgemeenten' },
            label: 'nis-44021',
          },
        ],
      },
      {
        name: { nl: 'Regio Leiestreek Oost-Vlaanderen' },
        label: 'reg-leiestreek-oost-vlaanderen',
        children: [
          {
            name: { nl: 'Nazareth-De Pinte deelgemeenten' },
            label: 'nis-44086',
          },
          {
            name: { nl: 'Sint-Martens-Latem deelgemeenten' },
            label: 'nis-44064',
          },
          {
            name: { nl: 'Zulte deelgemeenten' },
            label: 'nis-44081',
          },
          {
            name: { nl: 'Deinze deelgemeenten' },
            label: 'nis-44083',
          },
        ],
      },
      {
        name: { nl: 'Regio Meetjesland' },
        label: 'reg-meetjesland',
        children: [
          {
            name: { nl: 'Zelzate deelgemeenten' },
            label: 'nis-43018',
          },
          {
            name: { nl: 'Eeklo deelgemeenten' },
            label: 'nis-43005',
          },
          {
            name: { nl: 'Assenede deelgemeenten' },
            label: 'nis-43002',
          },
          {
            name: { nl: 'Kaprijke deelgemeenten' },
            label: 'nis-43007',
          },
          {
            name: { nl: 'Sint-Laureins deelgemeenten' },
            label: 'nis-43014',
          },
          {
            name: { nl: 'Maldegem deelgemeenten' },
            label: 'nis-43010',
          },
          {
            name: { nl: 'Lochristi deelgemeenten' },
            label: 'nis-44087',
          },
          {
            name: { nl: 'Evergem deelgemeenten' },
            label: 'nis-44019',
          },
          {
            name: { nl: 'Aalter deelgemeenten' },
            label: 'nis-44084',
          },
          {
            name: { nl: 'Lievegem deelgemeenten' },
            label: 'nis-44085',
          },
        ],
      },
      {
        name: { nl: 'Regio Vlaamse Ardennen' },
        label: 'reg-vlaamse-ardennen',
        children: [
          {
            name: { nl: 'Geraardsbergen deelgemeenten' },
            label: 'nis-41018',
          },
          {
            name: { nl: 'Sint-Lievens-Houtem deelgemeenten' },
            label: 'nis-41063',
          },
          {
            name: { nl: 'Herzele deelgemeenten' },
            label: 'nis-41027',
          },
          {
            name: { nl: 'Zottegem deelgemeenten' },
            label: 'nis-41081',
          },
          {
            name: { nl: 'Lierde deelgemeenten' },
            label: 'nis-45063',
          },
          {
            name: { nl: 'Ronse deelgemeenten' },
            label: 'nis-45041',
          },
          {
            name: { nl: 'Zwalm deelgemeenten' },
            label: 'nis-45065',
          },
          {
            name: { nl: 'Brakel deelgemeenten' },
            label: 'nis-45059',
          },
          {
            name: { nl: 'Horebeke deelgemeenten' },
            label: 'nis-45062',
          },
          {
            name: { nl: 'Maarkedal deelgemeenten' },
            label: 'nis-45064',
          },
          {
            name: { nl: 'Kluisbergen deelgemeenten' },
            label: 'nis-45060',
          },
          {
            name: { nl: 'Oudenaarde deelgemeenten' },
            label: 'nis-45035',
          },
          {
            name: { nl: 'Wortegem-Petegem deelgemeenten' },
            label: 'nis-45061',
          },
          {
            name: { nl: 'Oosterzele deelgemeenten' },
            label: 'nis-44052',
          },
          {
            name: { nl: 'Gavere deelgemeenten' },
            label: 'nis-44020',
          },
          {
            name: { nl: 'Kruisem deelgemeenten' },
            label: 'nis-45068',
          },
        ],
      },
      {
        name: { nl: 'Regio Waasland' },
        label: 'reg-waasland',
        children: [
          {
            name: { nl: 'Sint-Niklaas deelgemeenten' },
            label: 'nis-46021',
          },
          {
            name: { nl: 'Beveren-Kruibeke-Zwijndrecht deelgemeenten' },
            label: 'nis-46030',
          },
          {
            name: { nl: 'Temse deelgemeenten' },
            label: 'nis-46025',
          },
          {
            name: { nl: 'Lokeren deelgemeenten' },
            label: 'nis-46029',
          },
          {
            name: { nl: 'Sint-Gillis-Waas deelgemeenten' },
            label: 'nis-46020',
          },
          {
            name: { nl: 'Stekene deelgemeenten' },
            label: 'nis-46024',
          },
          {
            name: { nl: 'Waasmunster deelgemeenten' },
            label: 'nis-42023',
          },
        ],
      },
      {
        name: { nl: 'Regio Scheldeland Oost-Vlaanderen' },
        label: 'reg-scheldeland-oost-vlaanderen',
        children: [
          {
            name: { nl: 'Aalst deelgemeenten' },
            label: 'nis-41002',
          },
          {
            name: { nl: 'Lede deelgemeenten' },
            label: 'nis-41034',
          },
          {
            name: { nl: 'Ninove deelgemeenten' },
            label: 'nis-41048',
          },
          {
            name: { nl: 'Erpe-Mere deelgemeenten' },
            label: 'nis-41082',
          },
          {
            name: { nl: 'Haaltert deelgemeenten' },
            label: 'nis-41024',
          },
          {
            name: { nl: 'Denderleeuw deelgemeenten' },
            label: 'nis-41011',
          },
          {
            name: { nl: 'Dendermonde deelgemeenten' },
            label: 'nis-42006',
          },
          {
            name: { nl: 'Hamme deelgemeenten' },
            label: 'nis-42008',
          },
          {
            name: { nl: 'Wetteren deelgemeenten' },
            label: 'nis-42025',
          },
          {
            name: { nl: 'Zele deelgemeenten' },
            label: 'nis-42028',
          },
          {
            name: { nl: 'Buggenhout deelgemeenten' },
            label: 'nis-42004',
          },
          {
            name: { nl: 'Wichelen deelgemeenten' },
            label: 'nis-42026',
          },
          {
            name: { nl: 'Laarne deelgemeenten' },
            label: 'nis-42010',
          },
          {
            name: { nl: 'Lebbeke deelgemeenten' },
            label: 'nis-42011',
          },
          {
            name: { nl: 'Berlare deelgemeenten' },
            label: 'nis-42003',
          },
          {
            name: { nl: 'Destelbergen deelgemeenten' },
            label: 'nis-44013',
          },
          {
            name: { nl: 'Merelbeke-Melle deelgemeenten' },
            label: 'nis-44088',
          },
        ],
      },
    ],
  },
  {
    name: { nl: 'Provincie Limburg' },
    label: 'nis-70000',
    children: [
      {
        name: { nl: 'Regio Haspengouw' },
        label: 'reg-haspengouw',
        children: [
          {
            name: { nl: 'Alken deelgemeenten' },
            label: 'nis-73001',
          },
          {
            name: { nl: 'Tongeren-Borgloon deelgemeenten' },
            label: 'nis-73111',
          },
          {
            name: { nl: 'Herstappe deelgemeenten' },
            label: 'nis-73028',
          },
          {
            name: { nl: 'Bilzen-Hoeselt deelgemeenten' },
            label: 'nis-73110',
          },
          {
            name: { nl: 'Riemst deelgemeenten' },
            label: 'nis-73066',
          },
          {
            name: { nl: 'Sint-Truiden deelgemeenten' },
            label: 'nis-71053',
          },
          {
            name: { nl: 'Wellen deelgemeenten' },
            label: 'nis-73098',
          },
          {
            name: { nl: 'Heers deelgemeenten' },
            label: 'nis-73022',
          },
          {
            name: { nl: 'Gingelom deelgemeenten' },
            label: 'nis-71017',
          },
          {
            name: { nl: 'Herk-de-Stad deelgemeenten' },
            label: 'nis-71024',
          },
          {
            name: { nl: 'Halen deelgemeenten' },
            label: 'nis-71020',
          },
          {
            name: { nl: 'Nieuwerkerken deelgemeenten' },
            label: 'nis-71045',
          },
          {
            name: { nl: 'Landen deelgemeenten' },
            label: 'nis-24059',
          },
        ],
      },
      {
        name: { nl: 'Regio Hasselt' },
        label: 'reg-hasselt',
        children: [
          {
            name: { nl: 'Hasselt deelgemeenten' },
            label: 'nis-71072',
          },
        ],
      },
      {
        name: { nl: 'Regio Limburgse Kempen' },
        label: 'reg-limburgse-kempen',
        children: [
          {
            name: { nl: 'Houthalen-Helchteren deelgemeenten' },
            label: 'nis-72039',
          },
          {
            name: { nl: 'Lommel deelgemeenten' },
            label: 'nis-72020',
          },
          {
            name: { nl: 'Hamont-Achel deelgemeenten' },
            label: 'nis-72037',
          },
          {
            name: { nl: 'Hechtel-Eksel deelgemeenten' },
            label: 'nis-72038',
          },
          {
            name: { nl: 'Bocholt deelgemeenten' },
            label: 'nis-72003',
          },
          {
            name: { nl: 'Bree deelgemeenten' },
            label: 'nis-72004',
          },
          {
            name: { nl: 'Peer deelgemeenten' },
            label: 'nis-72030',
          },
          {
            name: { nl: 'Zonhoven deelgemeenten' },
            label: 'nis-71066',
          },
          {
            name: { nl: 'Heusden-Zolder deelgemeenten' },
            label: 'nis-71070',
          },
          {
            name: { nl: 'Lummen deelgemeenten' },
            label: 'nis-71037',
          },
          {
            name: { nl: 'Beringen deelgemeenten' },
            label: 'nis-71004',
          },
          {
            name: { nl: 'Diepenbeek deelgemeenten' },
            label: 'nis-71011',
          },
          {
            name: { nl: 'Genk deelgemeenten' },
            label: 'nis-71016',
          },
          {
            name: { nl: 'As deelgemeenten' },
            label: 'nis-71002',
          },
          {
            name: { nl: 'Zutendaal deelgemeenten' },
            label: 'nis-71067',
          },
          {
            name: { nl: 'Tessenderlo-Ham deelgemeenten' },
            label: 'nis-71071',
          },
          {
            name: { nl: 'Leopoldsburg deelgemeenten' },
            label: 'nis-71034',
          },
          {
            name: { nl: 'Pelt deelgemeenten' },
            label: 'nis-72043',
          },
          {
            name: { nl: 'Oudsbergen deelgemeenten' },
            label: 'nis-72042',
          },
        ],
      },
      {
        name: { nl: 'Regio Maasland' },
        label: 'reg-maasland',
        children: [
          {
            name: { nl: 'Kinrooi deelgemeenten' },
            label: 'nis-72018',
          },
          {
            name: { nl: 'Dilsen-Stokkem deelgemeenten' },
            label: 'nis-72041',
          },
          {
            name: { nl: 'Maaseik deelgemeenten' },
            label: 'nis-72021',
          },
          {
            name: { nl: 'Lanaken deelgemeenten' },
            label: 'nis-73042',
          },
          {
            name: { nl: 'Maasmechelen deelgemeenten' },
            label: 'nis-73107',
          },
        ],
      },
      {
        name: { nl: 'Regio Voerstreek' },
        label: 'reg-voerstreek',
        children: [
          {
            name: { nl: 'Voeren deelgemeenten' },
            label: 'nis-73109',
          },
        ],
      },
    ],
  },
];

const getCultuurkuurRegions = async ({ headers }) => {
  return dummyMunicipalities as GetCultuurkuurLocationsResponse;

  const res = await fetchFromApi({
    path: `/cultuurkuur/regions`,
    options: {
      headers,
    },
  });

  return (await res.json()) as GetCultuurkuurLocationsResponse;
};

const useGetCultuurkuurRegions = (
  configuration: ExtendQueryOptions<typeof getCultuurkuurRegions> = {},
) => {
  const options = createGetCultuurkuurRegionsQueryOptions();

  return useAuthenticatedQuery({
    ...options,
    ...configuration,
    enabled: options.enabled !== false && configuration.enabled !== false,
  });
};

const createGetCultuurkuurRegionsQueryOptions = () =>
  queryOptions({
    queryKey: ['cultuurkuur-regions'],
    queryFn: getCultuurkuurRegions,
    refetchOnWindowFocus: false,
  });

export type HierarchicalData = {
  name: {
    nl: string;
  };
  label: string;
  children?: HierarchicalData[];
};

export type GetCultuurkuurLocationsResponse = HierarchicalData[];

export { useGetCultuurkuurRegions };
