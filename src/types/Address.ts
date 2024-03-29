import { Country } from '@/types/Country';

import type { SupportedLanguages } from '../i18n';
import type { Values } from './Values';

type AddressLocality = string;

type AddressInternal = {
  addressCountry: Country;
  addressLocality: AddressLocality;
  postalCode: string;
  streetAddress: string;
};

type Address =
  | AddressInternal
  | Partial<Record<Values<typeof SupportedLanguages>, AddressInternal>>;

export type { Address, AddressInternal };
