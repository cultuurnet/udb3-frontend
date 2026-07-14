import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Alert, AlertVariants } from './Alert';
import { EventCard } from './EventCard';
import { Text } from './Text';

const meta: Meta<typeof EventCard> = {
  title: 'Components/EventCard',
  component: EventCard,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="tw:w-150">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <EventCard
      type="Concert"
      title="Night of the Flemish Opera"
      date="Saturday 14 June 2025"
      location="Opera Ghent, Ghent"
      organizer="Flemish Opera"
      description="An unforgettable evening of classical opera arias performed by international soloists and the symphony orchestra. From Verdi to Puccini — a programme bringing together the best of Flemish and international opera."
    />
  ),
};

export const WithImage: Story = {
  render: () => (
    <EventCard
      type="Concert"
      title="Night of the Flemish Opera"
      date="Saturday 14 June 2025"
      location="Opera Ghent, Ghent"
      organizer="Flemish Opera"
      image={{
        src: '/assets/storybook-image-placeholder.png',
        alt: 'Night of the Flemish Opera',
      }}
      description="An unforgettable evening of classical opera arias performed by international soloists and the symphony orchestra."
    />
  ),
};

export const PartOfProduction: Story = {
  render: () => (
    <EventCard
      type="Concert"
      title="Night of the Flemish Opera"
      date="Saturday 14 June 2025"
      location="Opera Ghent, Ghent"
      organizer="Flemish Opera"
      description="An unforgettable evening of classical opera arias performed by international soloists and the symphony orchestra."
      footer={
        <Alert variant={AlertVariants.INFO}>
          This event is part of the production{' '}
          <Text fontWeight="bold">Opera Series Ghent 2025</Text>
        </Alert>
      }
    />
  ),
};
