import { UseMutationOptions, useQuery } from 'react-query';

import { CalendarType } from '@/constants/CalendarType';
import type { EventTypes } from '@/constants/EventTypes';
import { OfferStatus } from '@/constants/OfferStatus';
import { OfferTypes, Scope } from '@/constants/OfferType';
import type { SupportedLanguages } from '@/i18n/index';
import type { Address } from '@/types/Address';
import { Country } from '@/types/Country';
import { OpeningHours, Term } from '@/types/Offer';
import { PaginatedData } from '@/types/PaginatedData';
import type { Place } from '@/types/Place';
import type { Values } from '@/types/Values';
import { WorkflowStatus } from '@/types/WorkflowStatus';
import { createEmbededCalendarSummaries } from '@/utils/createEmbededCalendarSummaries';
import { createSortingArgument } from '@/utils/createSortingArgument';
import { fetchFromApi, isErrorObject } from '@/utils/fetchFromApi';

import {
  AuthenticatedQueryOptions,
  CalendarSummaryFormats,
  ExtendQueryOptions,
  PaginationOptions,
  prefetchAuthenticatedQuery,
  queryOptions,
  ServerSideQueryOptions,
  SortOptions,
} from './authenticated-query';
import {
  useAuthenticatedMutation,
  useAuthenticatedQuery,
} from './authenticated-query';
import type { Headers } from './types/Headers';
import type { User } from './user';

const dummyMunicipalities = [
  {
    label: 'Brussels Hoofdstedelijk Gewest',
    value: 'nis-01000',
    children: [
      {
        label: 'Regio Brussel',
        value: 'reg-brussel',
        children: [
          {
            label: 'Anderlecht deelgemeenten',
            value: 'nis-21001',
          },
          {
            label: 'Brussel deelgemeenten',
            value: 'nis-21004',
          },
          {
            label: 'Elsene deelgemeenten',
            value: 'nis-21009',
          },
          {
            label: 'Etterbeek deelgemeenten',
            value: 'nis-21005',
          },
          {
            label: 'Evere deelgemeenten',
            value: 'nis-21006',
          },
          {
            label: 'Ganshoren deelgemeenten',
            value: 'nis-21008',
          },
          {
            label: 'Jette deelgemeenten',
            value: 'nis-21010',
          },
          {
            label: 'Koekelberg deelgemeenten',
            value: 'nis-21011',
          },
          {
            label: 'Oudergem deelgemeenten',
            value: 'nis-21002',
          },
          {
            label: 'Schaarbeek deelgemeenten',
            value: 'nis-21015',
          },
          {
            label: 'Sint-Agatha-Berchem deelgemeenten',
            value: 'nis-21003',
          },
          {
            label: 'Sint-Gillis deelgemeenten',
            value: 'nis-21013',
          },
          {
            label: 'Sint-Jans-Molenbeek deelgemeenten',
            value: 'nis-21012',
          },
          {
            label: 'Sint-Joost-ten-Node deelgemeenten',
            value: 'nis-21014',
          },
          {
            label: 'Sint-Lambrechts-Woluwe deelgemeenten',
            value: 'nis-21018',
          },
          {
            label: 'Sint-Pieters-Woluwe deelgemeenten',
            value: 'nis-21019',
          },
          {
            label: 'Ukkel deelgemeenten',
            value: 'nis-21016',
          },
          {
            label: 'Vorst deelgemeenten',
            value: 'nis-21007',
          },
          {
            label: 'Watermaal-Bosvoorde deelgemeenten',
            value: 'nis-21017',
          },
        ],
      },
    ],
  },
  {
    label: 'Provincie Antwerpen',
    value: 'nis-10000',
    children: [
      {
        label: 'Regio Antwerpen',
        value: 'reg-antwerpen',
        children: [
          {
            label: 'Antwerpen deelgemeenten',
            value: 'nis-11002',
          },
          {
            label: 'Wommelgem deelgemeenten',
            value: 'nis-11052',
          },
          {
            label: 'Boechout deelgemeenten',
            value: 'nis-11004',
          },
          {
            label: 'Hove deelgemeenten',
            value: 'nis-11021',
          },
          {
            label: 'Lint deelgemeenten',
            value: 'nis-11025',
          },
          {
            label: 'Kontich deelgemeenten',
            value: 'nis-11024',
          },
          {
            label: 'Aartselaar deelgemeenten',
            value: 'nis-11001',
          },
          {
            label: 'Mortsel deelgemeenten',
            value: 'nis-11029',
          },
          {
            label: 'Edegem deelgemeenten',
            value: 'nis-11013',
          },
        ],
      },
      {
        label: 'Regio Mechelen',
        value: 'reg-mechelen',
        children: [
          {
            label: 'Mechelen deelgemeenten',
            value: 'nis-12025',
          },
        ],
      },
      {
        label: 'Regio Scheldeland Antwerpen',
        value: 'reg-scheldeland-antwerpen',
        children: [
          {
            label: 'Hemiksem deelgemeenten',
            value: 'nis-11018',
          },
          {
            label: 'Schelle deelgemeenten',
            value: 'nis-11038',
          },
          {
            label: 'Rumst deelgemeenten',
            value: 'nis-11037',
          },
          {
            label: 'Niel deelgemeenten',
            value: 'nis-11030',
          },
          {
            label: 'Boom deelgemeenten',
            value: 'nis-11005',
          },
          {
            label: 'Willebroek deelgemeenten',
            value: 'nis-12040',
          },
          {
            label: 'Bornem deelgemeenten',
            value: 'nis-12007',
          },
          {
            label: 'Puurs-Sint-Amands deelgemeenten',
            value: 'nis-12041',
          },
        ],
      },
      {
        label: 'Regio Kempen',
        value: 'reg-kempen',
        children: [
          {
            label: 'Wijnegem deelgemeenten',
            value: 'nis-11050',
          },
          {
            label: 'Zandhoven deelgemeenten',
            value: 'nis-11054',
          },
          {
            label: 'Malle deelgemeenten',
            value: 'nis-11057',
          },
          {
            label: 'Ranst deelgemeenten',
            value: 'nis-11035',
          },
          {
            label: 'Schoten deelgemeenten',
            value: 'nis-11040',
          },
          {
            label: 'Essen deelgemeenten',
            value: 'nis-11016',
          },
          {
            label: 'Kalmthout deelgemeenten',
            value: 'nis-11022',
          },
          {
            label: 'Brasschaat deelgemeenten',
            value: 'nis-11008',
          },
          {
            label: 'Stabroek deelgemeenten',
            value: 'nis-11044',
          },
          {
            label: 'Kapellen deelgemeenten',
            value: 'nis-11023',
          },
          {
            label: 'Brecht deelgemeenten',
            value: 'nis-11009',
          },
          {
            label: 'Schilde deelgemeenten',
            value: 'nis-11039',
          },
          {
            label: 'Zoersel deelgemeenten',
            value: 'nis-11055',
          },
          {
            label: 'Wuustwezel deelgemeenten',
            value: 'nis-11053',
          },
          {
            label: 'Duffel deelgemeenten',
            value: 'nis-12009',
          },
          {
            label: 'Bonheiden deelgemeenten',
            value: 'nis-12005',
          },
          {
            label: 'Sint-Katelijne-Waver deelgemeenten',
            value: 'nis-12035',
          },
          {
            label: 'Herentals deelgemeenten',
            value: 'nis-13011',
          },
          {
            label: 'Herselt deelgemeenten',
            value: 'nis-13013',
          },
          {
            label: 'Hulshout deelgemeenten',
            value: 'nis-13016',
          },
          {
            label: 'Olen deelgemeenten',
            value: 'nis-13029',
          },
          {
            label: 'Westerlo deelgemeenten',
            value: 'nis-13049',
          },
          {
            label: 'Herenthout deelgemeenten',
            value: 'nis-13012',
          },
          {
            label: 'Lille deelgemeenten',
            value: 'nis-13019',
          },
          {
            label: 'Grobbendonk deelgemeenten',
            value: 'nis-13010',
          },
          {
            label: 'Vorselaar deelgemeenten',
            value: 'nis-13044',
          },
          {
            label: 'Turnhout deelgemeenten',
            value: 'nis-13040',
          },
          {
            label: 'Rijkevorsel deelgemeenten',
            value: 'nis-13037',
          },
          {
            label: 'Hoogstraten deelgemeenten',
            value: 'nis-13014',
          },
          {
            label: 'Merksplas deelgemeenten',
            value: 'nis-13023',
          },
          {
            label: 'Beerse deelgemeenten',
            value: 'nis-13004',
          },
          {
            label: 'Vosselaar deelgemeenten',
            value: 'nis-13046',
          },
          {
            label: 'Oud-Turnhout deelgemeenten',
            value: 'nis-13031',
          },
          {
            label: 'Arendonk deelgemeenten',
            value: 'nis-13001',
          },
          {
            label: 'Ravels deelgemeenten',
            value: 'nis-13035',
          },
          {
            label: 'Baarle-Hertog deelgemeenten',
            value: 'nis-13002',
          },
          {
            label: 'Mol deelgemeenten',
            value: 'nis-13025',
          },
          {
            label: 'Laakdal deelgemeenten',
            value: 'nis-13053',
          },
          {
            label: 'Geel deelgemeenten',
            value: 'nis-13008',
          },
          {
            label: 'Meerhout deelgemeenten',
            value: 'nis-13021',
          },
          {
            label: 'Kasterlee deelgemeenten',
            value: 'nis-13017',
          },
          {
            label: 'Retie deelgemeenten',
            value: 'nis-13036',
          },
          {
            label: 'Dessel deelgemeenten',
            value: 'nis-13006',
          },
          {
            label: 'Balen deelgemeenten',
            value: 'nis-13003',
          },
          {
            label: 'Heist-op-den-Berg deelgemeenten',
            value: 'nis-12014',
          },
          {
            label: 'Lier deelgemeenten',
            value: 'nis-12021',
          },
          {
            label: 'Nijlen deelgemeenten',
            value: 'nis-12026',
          },
          {
            label: 'Putte deelgemeenten',
            value: 'nis-12029',
          },
          {
            label: 'Berlaar deelgemeenten',
            value: 'nis-12002',
          },
        ],
      },
    ],
  },
  {
    label: 'Provincie Vlaams-Brabant',
    value: 'nis-20001',
    children: [
      {
        label: 'Regio Groene Gordel',
        value: 'reg-groene-gordel',
        children: [
          {
            label: 'Vilvoorde deelgemeenten',
            value: 'nis-23088',
          },
          {
            label: 'Steenokkerzeel deelgemeenten',
            value: 'nis-23081',
          },
          {
            label: 'Machelen deelgemeenten',
            value: 'nis-23047',
          },
          {
            label: 'Grimbergen deelgemeenten',
            value: 'nis-23025',
          },
          {
            label: 'Meise deelgemeenten',
            value: 'nis-23050',
          },
          {
            label: 'Kapelle-op-den-Bos deelgemeenten',
            value: 'nis-23039',
          },
          {
            label: 'Kampenhout deelgemeenten',
            value: 'nis-23038',
          },
          {
            label: 'Zaventem deelgemeenten',
            value: 'nis-23094',
          },
          {
            label: 'Kraainem deelgemeenten',
            value: 'nis-23099',
          },
          {
            label: 'Wezembeek-Oppem deelgemeenten',
            value: 'nis-23103',
          },
          {
            label: 'Zemst deelgemeenten',
            value: 'nis-23096',
          },
          {
            label: 'Halle deelgemeenten',
            value: 'nis-23027',
          },
          {
            label: 'Pajottegem deelgemeenten',
            value: 'nis-23106',
          },
          {
            label: 'Bever deelgemeenten',
            value: 'nis-23009',
          },
          {
            label: 'Hoeilaart deelgemeenten',
            value: 'nis-23033',
          },
          {
            label: 'Sint-Pieters-Leeuw deelgemeenten',
            value: 'nis-23077',
          },
          {
            label: 'Drogenbos deelgemeenten',
            value: 'nis-23098',
          },
          {
            label: 'Linkebeek deelgemeenten',
            value: 'nis-23100',
          },
          {
            label: 'Sint-Genesius-Rode deelgemeenten',
            value: 'nis-23101',
          },
          {
            label: 'Beersel deelgemeenten',
            value: 'nis-23003',
          },
          {
            label: 'Pepingen deelgemeenten',
            value: 'nis-23064',
          },
          {
            label: 'Dilbeek deelgemeenten',
            value: 'nis-23016',
          },
          {
            label: 'Asse deelgemeenten',
            value: 'nis-23002',
          },
          {
            label: 'Ternat deelgemeenten',
            value: 'nis-23086',
          },
          {
            label: 'Opwijk deelgemeenten',
            value: 'nis-23060',
          },
          {
            label: 'Lennik deelgemeenten',
            value: 'nis-23104',
          },
          {
            label: 'Roosdaal deelgemeenten',
            value: 'nis-23097',
          },
          {
            label: 'Liedekerke deelgemeenten',
            value: 'nis-23044',
          },
          {
            label: 'Wemmel deelgemeenten',
            value: 'nis-23102',
          },
          {
            label: 'Merchtem deelgemeenten',
            value: 'nis-23052',
          },
          {
            label: 'Affligem deelgemeenten',
            value: 'nis-23105',
          },
          {
            label: 'Londerzeel deelgemeenten',
            value: 'nis-23045',
          },
          {
            label: 'Herent deelgemeenten',
            value: 'nis-24038',
          },
          {
            label: 'Huldenberg deelgemeenten',
            value: 'nis-24045',
          },
          {
            label: 'Oud-Heverlee deelgemeenten',
            value: 'nis-24086',
          },
          {
            label: 'Bertem deelgemeenten',
            value: 'nis-24009',
          },
          {
            label: 'Kortenberg deelgemeenten',
            value: 'nis-24055',
          },
          {
            label: 'Tervuren deelgemeenten',
            value: 'nis-24104',
          },
          {
            label: 'Overijse deelgemeenten',
            value: 'nis-23062',
          },
          {
            label: 'Keerbergen deelgemeenten',
            value: 'nis-24048',
          },
          {
            label: 'Haacht deelgemeenten',
            value: 'nis-24033',
          },
          {
            label: 'Boortmeerbeek deelgemeenten',
            value: 'nis-24014',
          },
        ],
      },
      {
        label: 'Regio Hageland',
        value: 'reg-hageland',
        children: [
          {
            label: 'Aarschot deelgemeenten',
            value: 'nis-24001',
          },
          {
            label: 'Scherpenheuvel-Zichem deelgemeenten',
            value: 'nis-24134',
          },
          {
            label: 'Diest deelgemeenten',
            value: 'nis-24020',
          },
          {
            label: 'Tienen deelgemeenten',
            value: 'nis-24107',
          },
          {
            label: 'Hoegaarden deelgemeenten',
            value: 'nis-24041',
          },
          {
            label: 'Linter deelgemeenten',
            value: 'nis-24133',
          },
          {
            label: 'Glabbeek deelgemeenten',
            value: 'nis-24137',
          },
          {
            label: 'Tielt-Winge deelgemeenten',
            value: 'nis-24135',
          },
          {
            label: 'Zoutleeuw deelgemeenten',
            value: 'nis-24130',
          },
          {
            label: 'Geetbets deelgemeenten',
            value: 'nis-24028',
          },
          {
            label: 'Bekkevoort deelgemeenten',
            value: 'nis-24008',
          },
          {
            label: 'Kortenaken deelgemeenten',
            value: 'nis-24054',
          },
          {
            label: 'Rotselaar deelgemeenten',
            value: 'nis-24094',
          },
          {
            label: 'Tremelo deelgemeenten',
            value: 'nis-24109',
          },
          {
            label: 'Begijnendijk deelgemeenten',
            value: 'nis-24007',
          },
          {
            label: 'Lubbeek deelgemeenten',
            value: 'nis-24066',
          },
          {
            label: 'Holsbeek deelgemeenten',
            value: 'nis-24043',
          },
          {
            label: 'Bierbeek deelgemeenten',
            value: 'nis-24011',
          },
          {
            label: 'Boutersem deelgemeenten',
            value: 'nis-24016',
          },
        ],
      },
      {
        label: 'Regio Leuven',
        value: 'reg-leuven',
        children: [
          {
            label: 'Leuven deelgemeenten',
            value: 'nis-24062',
          },
        ],
      },
    ],
  },
  {
    label: 'Provincie West-Vlaanderen',
    value: 'nis-30000',
    children: [
      {
        label: 'Regio Brugge',
        value: 'reg-brugge',
        children: [
          {
            label: 'Brugge deelgemeenten',
            value: 'nis-31005',
          },
        ],
      },
      {
        label: 'Regio Brugse Ommeland',
        value: 'reg-brugse-ommeland',
        children: [
          {
            label: 'Oostkamp deelgemeenten',
            value: 'nis-31022',
          },
          {
            label: 'Zedelgem deelgemeenten',
            value: 'nis-31040',
          },
          {
            label: 'Damme deelgemeenten',
            value: 'nis-31006',
          },
          {
            label: 'Zuienkerke deelgemeenten',
            value: 'nis-31042',
          },
          {
            label: 'Ichtegem deelgemeenten',
            value: 'nis-35006',
          },
          {
            label: 'Jabbeke deelgemeenten',
            value: 'nis-31012',
          },
          {
            label: 'Beernem deelgemeenten',
            value: 'nis-31003',
          },
          {
            label: 'Torhout deelgemeenten',
            value: 'nis-31033',
          },
          {
            label: 'Oudenburg deelgemeenten',
            value: 'nis-35014',
          },
          {
            label: 'Gistel deelgemeenten',
            value: 'nis-35005',
          },
          {
            label: 'Lichtervelde deelgemeenten',
            value: 'nis-36011',
          },
          {
            label: 'Tielt deelgemeenten',
            value: 'nis-37022',
          },
          {
            label: 'Pittem deelgemeenten',
            value: 'nis-37011',
          },
          {
            label: 'Wingene +deelgemeenv//Q-',
            value: 'nis-37021',
          },
          {
            label: 'Ardooie deelgemeenten',
            value: 'nis-37020',
          },
        ],
      },
      {
        label: 'Regio Leiestreek West-Vlaanderen',
        value: 'reg-leiestreek-west-vlaanderen',
        children: [
          {
            label: 'Ingelmunster deelgemeenten',
            value: 'nis-36007',
          },
          {
            label: 'Roeselare deelgemeenten',
            value: 'nis-36015',
          },
          {
            label: 'Izegem deelgemeenten',
            value: 'nis-36008',
          },
          {
            label: 'Ledegem deelgemeenten',
            value: 'nis-36010',
          },
          {
            label: 'Moorslede deelgemeenten',
            value: 'nis-36012',
          },
          {
            label: 'Wielsbeke deelgemeenten',
            value: 'nis-37017',
          },
          {
            label: 'Dentergem deelgemeenten',
            value: 'nis-37002',
          },
          {
            label: 'Oostrozebeke deelgemeenten',
            value: 'nis-37010',
          },
          {
            label: 'Kortrijk deelgemeenten',
            value: 'nis-34022',
          },
          {
            label: 'Kuurne deelgemeenten',
            value: 'nis-34023',
          },
          {
            label: 'Harelbeke deelgemeenten',
            value: 'nis-34013',
          },
          {
            label: 'Deerlijk deelgemeenten',
            value: 'nis-34009',
          },
          {
            label: 'Zwevegem deelgemeenten',
            value: 'nis-34042',
          },
          {
            label: 'Wevelgem deelgemeenten',
            value: 'nis-34041',
          },
          {
            label: 'Anzegem deelgemeenten',
            value: 'nis-34002',
          },
          {
            label: 'Avelgem deelgemeenten',
            value: 'nis-34003',
          },
          {
            label: 'Spiere-Helkijn deelgemeenten',
            value: 'nis-34043',
          },
          {
            label: 'Waregem deelgemeenten',
            value: 'nis-34040',
          },
          {
            label: 'Lendelede deelgemeenten',
            value: 'nis-34025',
          },
          {
            label: 'Menen deelgemeenten',
            value: 'nis-34027',
          },
        ],
      },
      {
        label: 'Regio Vlaamse Kust',
        value: 'reg-vlaamse-kust',
        children: [
          {
            label: 'Knokke-Heist deelgemeenten',
            value: 'nis-31043',
          },
          {
            label: 'Blankenberge deelgemeenten',
            value: 'nis-31004',
          },
          {
            label: 'De Haan deelgemeenten',
            value: 'nis-35029',
          },
          {
            label: 'Bredene deelgemeenten',
            value: 'nis-35002',
          },
          {
            label: 'De Panne deelgemeenten',
            value: 'nis-38008',
          },
          {
            label: 'Oostende deelgemeenten',
            value: 'nis-35013',
          },
          {
            label: 'Middelkerke deelgemeenten',
            value: 'nis-35011',
          },
          {
            label: 'Nieuwpoort deelgemeenten',
            value: 'nis-38016',
          },
          {
            label: 'Koksijde deelgemeenten',
            value: 'nis-38014',
          },
        ],
      },
      {
        label: 'Regio Westhoek',
        value: 'reg-westhoek',
        children: [
          {
            label: 'Hooglede deelgemeenten',
            value: 'nis-36006',
          },
          {
            label: 'Staden deelgemeenten',
            value: 'nis-36019',
          },
          {
            label: 'Veurne deelgemeenten',
            value: 'nis-38025',
          },
          {
            label: 'Alveringem deelgemeenten',
            value: 'nis-38002',
          },
          {
            label: 'Diksmuide deelgemeenten',
            value: 'nis-32003',
          },
          {
            label: 'Kortemark deelgemeenten',
            value: 'nis-32011',
          },
          {
            label: 'Lo-Reninge deelgemeenten',
            value: 'nis-32030',
          },
          {
            label: 'Houthulst deelgemeenten',
            value: 'nis-32006',
          },
          {
            label: 'Koekelare deelgemeenten',
            value: 'nis-32010',
          },
          {
            label: 'Vleteren deelgemeenten',
            value: 'nis-33041',
          },
          {
            label: 'Ieper deelgemeenten',
            value: 'nis-33011',
          },
          {
            label: 'Langemark-Poelkapelle deelgemeenten',
            value: 'nis-33040',
          },
          {
            label: 'Heuvelland deelgemeenten',
            value: 'nis-33039',
          },
          {
            label: 'Mesen deelgemeenten',
            value: 'nis-33016',
          },
          {
            label: 'Poperinge deelgemeenten',
            value: 'nis-33021',
          },
          {
            label: 'Zonnebeke deelgemeenten',
            value: 'nis-33037',
          },
          {
            label: 'Wervik deelgemeenten',
            value: 'nis-33029',
          },
        ],
      },
    ],
  },
  {
    label: 'Provincie Oost-Vlaanderen',
    value: 'nis-40000',
    children: [
      {
        label: 'Regio Gent',
        value: 'reg-gent',
        children: [
          {
            label: 'Gent deelgemeenten',
            value: 'nis-44021',
          },
        ],
      },
      {
        label: 'Regio Leiestreek Oost-Vlaanderen',
        value: 'reg-leiestreek-oost-vlaanderen',
        children: [
          {
            label: 'Nazareth-De Pinte deelgemeenten',
            value: 'nis-44086',
          },
          {
            label: 'Sint-Martens-Latem deelgemeenten',
            value: 'nis-44064',
          },
          {
            label: 'Zulte deelgemeenten',
            value: 'nis-44081',
          },
          {
            label: 'Deinze deelgemeenten',
            value: 'nis-44083',
          },
        ],
      },
      {
        label: 'Regio Meetjesland',
        value: 'reg-meetjesland',
        children: [
          {
            label: 'Zelzate deelgemeenten',
            value: 'nis-43018',
          },
          {
            label: 'Eeklo deelgemeenten',
            value: 'nis-43005',
          },
          {
            label: 'Assenede deelgemeenten',
            value: 'nis-43002',
          },
          {
            label: 'Kaprijke deelgemeenten',
            value: 'nis-43007',
          },
          {
            label: 'Sint-Laureins deelgemeenten',
            value: 'nis-43014',
          },
          {
            label: 'Maldegem deelgemeenten',
            value: 'nis-43010',
          },
          {
            label: 'Lochristi deelgemeenten',
            value: 'nis-44087',
          },
          {
            label: 'Evergem deelgemeenten',
            value: 'nis-44019',
          },
          {
            label: 'Aalter deelgemeenten',
            value: 'nis-44084',
          },
          {
            label: 'Lievegem deelgemeenten',
            value: 'nis-44085',
          },
        ],
      },
      {
        label: 'Regio Vlaamse Ardennen',
        value: 'reg-vlaamse-ardennen',
        children: [
          {
            label: 'Geraardsbergen deelgemeenten',
            value: 'nis-41018',
          },
          {
            label: 'Sint-Lievens-Houtem deelgemeenten',
            value: 'nis-41063',
          },
          {
            label: 'Herzele deelgemeenten',
            value: 'nis-41027',
          },
          {
            label: 'Zottegem deelgemeenten',
            value: 'nis-41081',
          },
          {
            label: 'Lierde deelgemeenten',
            value: 'nis-45063',
          },
          {
            label: 'Ronse deelgemeenten',
            value: 'nis-45041',
          },
          {
            label: 'Zwalm deelgemeenten',
            value: 'nis-45065',
          },
          {
            label: 'Brakel deelgemeenten',
            value: 'nis-45059',
          },
          {
            label: 'Horebeke deelgemeenten',
            value: 'nis-45062',
          },
          {
            label: 'Maarkedal deelgemeenten',
            value: 'nis-45064',
          },
          {
            label: 'Kluisbergen deelgemeenten',
            value: 'nis-45060',
          },
          {
            label: 'Oudenaarde deelgemeenten',
            value: 'nis-45035',
          },
          {
            label: 'Wortegem-Petegem deelgemeenten',
            value: 'nis-45061',
          },
          {
            label: 'Oosterzele deelgemeenten',
            value: 'nis-44052',
          },
          {
            label: 'Gavere deelgemeenten',
            value: 'nis-44020',
          },
          {
            label: 'Kruisem deelgemeenten',
            value: 'nis-45068',
          },
        ],
      },
      {
        label: 'Regio Waasland',
        value: 'reg-waasland',
        children: [
          {
            label: 'Sint-Niklaas deelgemeenten',
            value: 'nis-46021',
          },
          {
            label: 'Beveren-Kruibeke-Zwijndrecht deelgemeenten',
            value: 'nis-46030',
          },
          {
            label: 'Temse deelgemeenten',
            value: 'nis-46025',
          },
          {
            label: 'Lokeren deelgemeenten',
            value: 'nis-46029',
          },
          {
            label: 'Sint-Gillis-Waas deelgemeenten',
            value: 'nis-46020',
          },
          {
            label: 'Stekene deelgemeenten',
            value: 'nis-46024',
          },
          {
            label: 'Waasmunster deelgemeenten',
            value: 'nis-42023',
          },
        ],
      },
      {
        label: 'Regio Scheldeland Oost-Vlaanderen',
        value: 'reg-scheldeland-oost-vlaanderen',
        children: [
          {
            label: 'Aalst deelgemeenten',
            value: 'nis-41002',
          },
          {
            label: 'Lede deelgemeenten',
            value: 'nis-41034',
          },
          {
            label: 'Ninove deelgemeenten',
            value: 'nis-41048',
          },
          {
            label: 'Erpe-Mere deelgemeenten',
            value: 'nis-41082',
          },
          {
            label: 'Haaltert deelgemeenten',
            value: 'nis-41024',
          },
          {
            label: 'Denderleeuw deelgemeenten',
            value: 'nis-41011',
          },
          {
            label: 'Dendermonde deelgemeenten',
            value: 'nis-42006',
          },
          {
            label: 'Hamme deelgemeenten',
            value: 'nis-42008',
          },
          {
            label: 'Wetteren deelgemeenten',
            value: 'nis-42025',
          },
          {
            label: 'Zele deelgemeenten',
            value: 'nis-42028',
          },
          {
            label: 'Buggenhout deelgemeenten',
            value: 'nis-42004',
          },
          {
            label: 'Wichelen deelgemeenten',
            value: 'nis-42026',
          },
          {
            label: 'Laarne deelgemeenten',
            value: 'nis-42010',
          },
          {
            label: 'Lebbeke deelgemeenten',
            value: 'nis-42011',
          },
          {
            label: 'Berlare deelgemeenten',
            value: 'nis-42003',
          },
          {
            label: 'Destelbergen deelgemeenten',
            value: 'nis-44013',
          },
          {
            label: 'Merelbeke-Melle deelgemeenten',
            value: 'nis-44088',
          },
        ],
      },
    ],
  },
  {
    label: 'Provincie Limburg',
    value: 'nis-70000',
    children: [
      {
        label: 'Regio Haspengouw',
        value: 'reg-haspengouw',
        children: [
          {
            label: 'Alken deelgemeenten',
            value: 'nis-73001',
          },
          {
            label: 'Tongeren-Borgloon deelgemeenten',
            value: 'nis-73111',
          },
          {
            label: 'Herstappe deelgemeenten',
            value: 'nis-73028',
          },
          {
            label: 'Bilzen-Hoeselt deelgemeenten',
            value: 'nis-73110',
          },
          {
            label: 'Riemst deelgemeenten',
            value: 'nis-73066',
          },
          {
            label: 'Sint-Truiden deelgemeenten',
            value: 'nis-71053',
          },
          {
            label: 'Wellen deelgemeenten',
            value: 'nis-73098',
          },
          {
            label: 'Heers deelgemeenten',
            value: 'nis-73022',
          },
          {
            label: 'Gingelom deelgemeenten',
            value: 'nis-71017',
          },
          {
            label: 'Herk-de-Stad deelgemeenten',
            value: 'nis-71024',
          },
          {
            label: 'Halen deelgemeenten',
            value: 'nis-71020',
          },
          {
            label: 'Nieuwerkerken deelgemeenten',
            value: 'nis-71045',
          },
          {
            label: 'Landen deelgemeenten',
            value: 'nis-24059',
          },
        ],
      },
      {
        label: 'Regio Hasselt',
        value: 'reg-hasselt',
        children: [
          {
            label: 'Hasselt deelgemeenten',
            value: 'nis-71072',
          },
        ],
      },
      {
        label: 'Regio Limburgse Kempen',
        value: 'reg-limburgse-kempen',
        children: [
          {
            label: 'Houthalen-Helchteren deelgemeenten',
            value: 'nis-72039',
          },
          {
            label: 'Lommel deelgemeenten',
            value: 'nis-72020',
          },
          {
            label: 'Hamont-Achel deelgemeenten',
            value: 'nis-72037',
          },
          {
            label: 'Hechtel-Eksel deelgemeenten',
            value: 'nis-72038',
          },
          {
            label: 'Bocholt deelgemeenten',
            value: 'nis-72003',
          },
          {
            label: 'Bree deelgemeenten',
            value: 'nis-72004',
          },
          {
            label: 'Peer deelgemeenten',
            value: 'nis-72030',
          },
          {
            label: 'Zonhoven deelgemeenten',
            value: 'nis-71066',
          },
          {
            label: 'Heusden-Zolder deelgemeenten',
            value: 'nis-71070',
          },
          {
            label: 'Lummen deelgemeenten',
            value: 'nis-71037',
          },
          {
            label: 'Beringen deelgemeenten',
            value: 'nis-71004',
          },
          {
            label: 'Diepenbeek deelgemeenten',
            value: 'nis-71011',
          },
          {
            label: 'Genk deelgemeenten',
            value: 'nis-71016',
          },
          {
            label: 'As deelgemeenten',
            value: 'nis-71002',
          },
          {
            label: 'Zutendaal deelgemeenten',
            value: 'nis-71067',
          },
          {
            label: 'Tessenderlo-Ham deelgemeenten',
            value: 'nis-71071',
          },
          {
            label: 'Leopoldsburg deelgemeenten',
            value: 'nis-71034',
          },
          {
            label: 'Pelt deelgemeenten',
            value: 'nis-72043',
          },
          {
            label: 'Oudsbergen deelgemeenten',
            value: 'nis-72042',
          },
        ],
      },
      {
        label: 'Regio Maasland',
        value: 'reg-maasland',
        children: [
          {
            label: 'Kinrooi deelgemeenten',
            value: 'nis-72018',
          },
          {
            label: 'Dilsen-Stokkem deelgemeenten',
            value: 'nis-72041',
          },
          {
            label: 'Maaseik deelgemeenten',
            value: 'nis-72021',
          },
          {
            label: 'Lanaken deelgemeenten',
            value: 'nis-73042',
          },
          {
            label: 'Maasmechelen deelgemeenten',
            value: 'nis-73107',
          },
        ],
      },
      {
        label: 'Regio Voerstreek',
        value: 'reg-voerstreek',
        children: [
          {
            label: 'Voeren deelgemeenten',
            value: 'nis-73109',
          },
        ],
      },
    ],
  },
];

const getPlaceById = async ({ headers, id }) => {
  const res = await fetchFromApi({
    path: `/places/${id.toString()}`,
    options: {
      headers,
    },
  });
  return (await res.json()) as Place | undefined;
};

type UseGetPlaceByIdArguments = {
  id: string;
  scope?: Values<typeof OfferTypes>;
};

const createGetPlaceByIdQueryOptions = ({
  id,
  scope,
}: {
  id: string;
  scope: Scope;
}) =>
  queryOptions({
    queryKey: ['places'],
    queryFn: getPlaceById,
    queryArguments: { id },
    enabled: !!id && scope === OfferTypes.PLACES,
  });

const useGetPlaceByIdQuery = (
  { id, scope }: UseGetPlaceByIdArguments,
  configuration: ExtendQueryOptions<typeof getPlaceById> = {},
) => {
  const options = createGetPlaceByIdQueryOptions({ id, scope });

  return useAuthenticatedQuery({
    ...options,
    ...configuration,
    enabled: options.enabled !== false && configuration.enabled !== false,
  });
};

export const prefetchGetPlaceByIdQuery = ({
  req,
  queryClient,
  scope,
  id,
}: ServerSideQueryOptions & {
  id: string;
  scope: Scope;
}) =>
  prefetchAuthenticatedQuery({
    req,
    queryClient,
    ...createGetPlaceByIdQueryOptions({ scope, id }),
  });

const getPlacesByCreator = async ({
  headers,
  q,
  limit,
  start,
  embed,
  workflowStatus,
  disableDefaultFilters,
  ...rest
}: {
  headers: Headers;
  q: string;
  disableDefaultFilters: string;
  embed: string;
  limit: string;
  start: string;
  workflowStatus: string;
} & Record<string, string>) => {
  delete headers['Authorization'];

  const sortOptions = Object.entries(rest).filter(([key]) =>
    key.startsWith('sort'),
  );
  const embedCalendarSummaries = Object.entries(rest).filter(([key]) =>
    key.startsWith('embedCalendarSummaries'),
  );

  const res = await fetchFromApi({
    path: '/places/',
    searchParams: {
      q,
      limit,
      start,
      embed,
      workflowStatus,
      disableDefaultFilters,
      ...Object.fromEntries(sortOptions),
      ...Object.fromEntries(embedCalendarSummaries),
    },
    options: {
      headers,
    },
  });
  return (await res.json()) as PaginatedData<Place[]>;
};

const createGetPlacesByCreatorQueryOptions = ({
  creator,
  paginationOptions = { start: 0, limit: 50 },
  sortOptions = { field: 'modified', order: 'desc' },
  calendarSummaryFormats = ['lg-text', 'sm-text', 'xs-text'],
}: PaginationOptions &
  SortOptions &
  CalendarSummaryFormats & {
    creator: User;
  }) => {
  const queryArguments = {
    q: `creator:(${creator?.sub} OR ${
      creator?.['https://publiq.be/uitidv1id']
        ? `${creator?.['https://publiq.be/uitidv1id']} OR`
        : ''
    } ${creator?.email}) OR contributors:${creator?.email}`,
    disableDefaultFilters: 'true',
    embed: 'true',
    limit: `${paginationOptions.limit}`,
    start: `${paginationOptions.start}`,
    workflowStatus: 'DRAFT,READY_FOR_VALIDATION,APPROVED,REJECTED',
  };
  const sortingArguments = createSortingArgument(sortOptions);
  const embededCalendarSummaries = createEmbededCalendarSummaries(
    calendarSummaryFormats,
  );

  return queryOptions({
    queryKey: ['places'],
    queryFn: getPlacesByCreator,
    queryArguments: {
      ...queryArguments,
      ...sortingArguments,
      ...embededCalendarSummaries,
    } as typeof queryArguments &
      typeof sortingArguments &
      typeof embededCalendarSummaries,
    enabled: !!(creator?.sub && creator?.email),
  });
};

const useGetPlacesByCreatorQuery = (
  {
    creator,
    paginationOptions,
    sortOptions,
    calendarSummaryFormats,
  }: PaginationOptions &
    SortOptions &
    CalendarSummaryFormats & {
      creator: User;
    },
  configuration: ExtendQueryOptions<typeof getPlacesByCreator> = {},
) => {
  const options = createGetPlacesByCreatorQueryOptions({
    creator,
    paginationOptions,
    sortOptions,
    calendarSummaryFormats,
  });

  return useAuthenticatedQuery({
    ...options,
    ...configuration,
    enabled: options.enabled !== false && configuration.enabled !== false,
  });
};

export const prefetchGetPlacesByCreatorQuery = ({
  req,
  queryClient,
  creator,
  paginationOptions,
  sortOptions,
  calendarSummaryFormats,
}: ServerSideQueryOptions &
  PaginationOptions &
  SortOptions &
  CalendarSummaryFormats & {
    creator: User;
  }) =>
  prefetchAuthenticatedQuery({
    req,
    queryClient,
    ...createGetPlacesByCreatorQueryOptions({
      creator,
      paginationOptions,
      sortOptions,
      calendarSummaryFormats,
    }),
  });

type GetPlacesByQueryArguments = {
  name: string;
  terms: Array<Values<typeof EventTypes>>;
  zip?: string;
  addressLocality?: string;
  addressCountry?: Country;
};

const getPlacesByQuery = async ({
  headers,
  name,
  terms,
  zip,
  addressLocality,
  addressCountry,
}: { headers: Headers } & GetPlacesByQueryArguments) => {
  const termsString = terms.reduce(
    (acc, currentTerm) => `${acc}terms.id:${currentTerm}`,
    '',
  );
  const queryArguments = [
    termsString,
    zip && addressCountry === 'BE' ? `address.\\*.postalCode:"${zip}"` : '',
    addressLocality ? `address.\\*.addressLocality:${addressLocality}` : '',
  ].filter((argument) => !!argument);

  const res = await fetchFromApi({
    path: '/places/',
    searchParams: {
      // eslint-disable-next-line no-useless-escape
      q: queryArguments.join(' AND '),
      text: `*${name}*`,
      addressCountry,
      embed: 'true',
      disableDefaultFilters: 'true',
      isDuplicate: 'false',
      workflowStatus: 'DRAFT,READY_FOR_VALIDATION,APPROVED',
      ['sort[created]']: 'desc',
      limit: '1000',
      status: OfferStatus.AVAILABLE,
    },
    options: {
      headers,
    },
  });
  return (await res.json()) as PaginatedData<Place[]>;
};

const useGetPlacesByQuery = (
  {
    name,
    terms,
    zip,
    addressLocality,
    addressCountry,
  }: GetPlacesByQueryArguments,
  configuration: ExtendQueryOptions<typeof getPlacesByQuery> = {},
) =>
  useAuthenticatedQuery({
    queryKey: ['places'],
    queryFn: getPlacesByQuery,
    queryArguments: {
      name,
      terms,
      zip,
      addressCountry,
      addressLocality,
    },
    enabled: !!name || terms.length > 0,
    ...configuration,
  });

const changeAddress = async ({ headers, id, address, language }) =>
  fetchFromApi({
    path: `/places/${id.toString()}/address/${language}`,
    options: {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        ...address,
      }),
    },
  });

const useChangeAddressMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: changeAddress,
    mutationKey: 'places-change-address',
    ...configuration,
  });

const deletePlaceById = async ({ headers, id }) =>
  fetchFromApi({
    path: `/places/${id}`,
    options: { headers, method: 'DELETE' },
  });

const useDeletePlaceByIdMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: deletePlaceById,
    mutationKey: 'places-delete-by-id',
    ...configuration,
  });

type ChangeStatusArguments = {
  headers: Headers;
  id: string;
  type: Values<typeof OfferStatus>;
  reason: Record<Values<typeof SupportedLanguages>, string>;
};

const changeStatus = async ({
  headers,
  id,
  type,
  reason,
}: ChangeStatusArguments) =>
  fetchFromApi({
    path: `/places/${id.toString()}/status`,
    options: {
      method: 'PUT',
      headers,
      body: JSON.stringify({ type, reason }),
    },
  });

const useChangeStatusMutation = (configuration: UseMutationOptions = {}) =>
  useAuthenticatedMutation({
    mutationFn: changeStatus,
    mutationKey: 'places-change-status',
    ...configuration,
  });

type PlaceArguments = {
  address: Address;
  mainLanguage: string;
  name: string;
  terms: Term[];
  workflowStatus: WorkflowStatus;
  calendarType: Values<typeof CalendarType>;
  openingHours: OpeningHours[];
  startDate: string;
  endDate: string;
  typicalAgeRange: string;
};

type AddPlaceArguments = PlaceArguments & { headers: Headers };

const addPlace = async ({
  headers,
  calendarType,
  openingHours,
  startDate,
  endDate,
  address,
  mainLanguage,
  name,
  terms,
  workflowStatus,
  typicalAgeRange,
}: AddPlaceArguments) =>
  fetchFromApi({
    path: `/places`,
    options: {
      method: 'POST',
      headers,
      body: JSON.stringify({
        calendarType,
        openingHours,
        address,
        mainLanguage,
        name,
        terms,
        workflowStatus,
        startDate,
        endDate,
        typicalAgeRange,
      }),
    },
  });

const useAddPlaceMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: addPlace,
    mutationKey: 'places-add',
    ...configuration,
  });

const publish = async ({ headers, id, publicationDate }) =>
  fetchFromApi({
    path: `/places/${id}`,
    options: {
      method: 'PATCH',
      headers: {
        ...headers,
        'Content-Type': 'application/ld+json;domain-model=Publish',
      },
      body: JSON.stringify({ publicationDate }),
    },
  });

const usePublishPlaceMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: publish,
    mutationKey: 'places-publish',
    ...configuration,
  });

const useGetMunicipalitiesQuery = () =>
  useQuery({
    retry: false,
    staleTime: Infinity,
    queryFn: async () => dummyMunicipalities,
  });

export {
  getPlaceById,
  useAddPlaceMutation,
  useChangeAddressMutation,
  useChangeStatusMutation,
  useDeletePlaceByIdMutation,
  useGetMunicipalitiesQuery,
  useGetPlaceByIdQuery,
  useGetPlacesByCreatorQuery,
  useGetPlacesByQuery,
  usePublishPlaceMutation,
};
