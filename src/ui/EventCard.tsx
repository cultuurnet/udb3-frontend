import { ReactNode } from 'react';

import { cn } from '@/ui/shadcn/utils';

import { Card, CardProps } from './Card';
import { Image } from './Image';
import { Text } from './Text';
import { Title } from './Title';

type EventCardImage = {
  src: string;
  alt: string;
};

type EventCardProps = Omit<CardProps, 'children'> & {
  type?: string;
  title?: string;
  date?: string;
  location?: string;
  organizer?: string;
  image?: EventCardImage;
  description?: string;
  footer?: ReactNode;
};

const EventCard = ({
  type,
  title,
  date,
  location,
  organizer,
  image,
  description,
  footer,
  className,
  ...cardProps
}: EventCardProps) => {
  const trimmedLocation = location?.trim();

  return (
    <Card
      className={cn('tw:flex tw:flex-col tw:gap-8 tw:p-8', className)}
      {...cardProps}
    >
      <div className="tw:flex tw:justify-between tw:gap-8">
        <div className="tw:flex tw:flex-col tw:gap-4">
          {type && <Text>{type}</Text>}
          {(title || date) && (
            <div className="tw:flex tw:flex-col">
              {title && <Title>{title}</Title>}
              {date && <Text>{date}</Text>}
            </div>
          )}
          {trimmedLocation && <Text>{trimmedLocation}</Text>}
          {organizer && <Text>{organizer}</Text>}
        </div>
        {image && (
          <Image
            src={image.src}
            alt={image.alt}
            width={160}
            height={160}
            className="tw:w-40 tw:h-40 tw:object-cover tw:shrink-0"
          />
        )}
      </div>
      {description && <Text>{description}</Text>}
      {footer}
    </Card>
  );
};

export { EventCard };
export type { EventCardProps };
