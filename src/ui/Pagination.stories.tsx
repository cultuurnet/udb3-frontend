import type { Meta, StoryObj } from '@storybook/nextjs';
import { useEffect, useState } from 'react';

import { Pagination } from './Pagination';

const meta: Meta<typeof Pagination> = {
  title: 'Components/Pagination',
  component: Pagination,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['currentPage', 'totalItems', 'perPage', 'limitPages'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    currentPage: 1,
    totalItems: 200,
    perPage: 5,
    limitPages: 5,
  },
  render: (args) => {
    const [currentPage, setCurrentPage] = useState(args.currentPage);
    useEffect(() => {
      setCurrentPage(args.currentPage);
    }, [args.currentPage]);
    return (
      <Pagination
        {...args}
        currentPage={currentPage}
        onChangePage={setCurrentPage}
      />
    );
  },
};
