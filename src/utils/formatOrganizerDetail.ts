import { getAddress } from '@/pages/create/OfferForm';
import { Organizer } from '@/types/Organizer';

import { SupportedLanguage } from '../i18n';

const parseAddress = (
  offer: Organizer,
  language: SupportedLanguage,
  mainLanguage: SupportedLanguage,
) => {
  const { addressLocality, postalCode, streetAddress } = getAddress(
    offer.address,
    language,
    mainLanguage,
  );

  return `${streetAddress}\n${postalCode} ${addressLocality}`;
};

const formatEmailAndPhone = ({ email, phone }: Organizer['contactPoint']) => {
  const contactDetails = [...email, ...phone];
  if (contactDetails.length === 0) {
    return null;
  }
  return contactDetails.join('\n');
};

export { formatEmailAndPhone, parseAddress };
