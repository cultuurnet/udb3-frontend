import { ContactPoint } from '@/types/ContactPoint';
import { Link } from '@/ui/Link';
import { Stack } from '@/ui/Stack';

type Props = {
  contactPoint: ContactPoint;
};

const ContactInfoPreview = ({ contactPoint }: Props) => {
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
