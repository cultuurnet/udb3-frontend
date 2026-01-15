import { useTranslation } from 'react-i18next';

import { ContactPoint } from '@/types/ContactPoint';
import { Link } from '@/ui/Link';
import { Stack } from '@/ui/Stack';
import { Text } from '@/ui/Text';

type Props = {
  contactPoint: ContactPoint;
};

const ContactInfoPreview = ({ contactPoint }: Props) => {
  const { t } = useTranslation();
  const hasContactInfo =
    contactPoint &&
    (contactPoint.url.length ||
      contactPoint.phone.length ||
      contactPoint.email.length);

  if (!hasContactInfo) {
    return (
      <Text className="empty-value">{t('preview.empty_value.contact')}</Text>
    );
  }

  return (
    <Stack>
      {contactPoint.url && (
        <Stack>
          {contactPoint.url.map((website, index) => (
            <Link
              key={index}
              href={website}
              target="_blank"
              rel="noopener noreferrer"
            >
              {website}
            </Link>
          ))}
        </Stack>
      )}
      {contactPoint.email && (
        <Stack>
          {contactPoint.email.map((email, index) => (
            <Link
              key={index}
              href={`mailto:${email}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {email}
            </Link>
          ))}
        </Stack>
      )}
      {contactPoint.phone && (
        <Stack>
          {contactPoint.phone.map((phone, index) => (
            <Link
              key={index}
              href={`tel:${phone}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {phone}
            </Link>
          ))}
        </Stack>
      )}
    </Stack>
  );
};

export { ContactInfoPreview };
