import type { Meta, StoryObj } from '@storybook/react';

import { Icons } from './Icon';
import { SelectionTable } from './SelectionTable';

const meta: Meta<typeof SelectionTable> = {
  title: 'Components/SelectionTable',
  component: SelectionTable,
  parameters: {
    controls: {
      include: ['columns', 'data', 'actions'],
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

const actions = [
  {
    iconName: Icons.PENCIL,
    title: 'Action 1',
    onClick: () => {},
    disabled: false,
  },
];

export const Default: Story = {
  args: {
    columns,
    data,
    actions,
    translateSelectedRowCount: (count) => `${count} selected rows`,
    onSelectionChanged: () => {},
  },
};
