import type { Meta, StoryObj } from '@storybook/react';

import { Icons } from './Icon';
import { Table } from './Table';

const meta: Meta<typeof Table> = {
  title: 'Components/Table',
  component: Table,
  parameters: {
    controls: {
      include: ['columns', 'data'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const columns = [
  {
    Header: 'Header 1',
    accessor: 'header1',
  },
  {
    Header: 'Header 2',
    accessor: 'header2',
  },
];

const data = [
  {
    header1: 'data 1 header 1',
    header2: 'data 1 header 2',
  },
  {
    header1: 'data 2 header 1',
    header2: 'data 2 header 2',
  },
];

export const Default: Story = {
  args: {
    columns,
    data,
  },
};
