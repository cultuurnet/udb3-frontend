import { Stack } from '@/ui/Stack';
import { Table } from '@/ui/Table';
import { colors, getGlobalBorderRadius, getValueFromTheme } from '@/ui/theme';

type TableRow = {
  field: React.ReactNode;
  value: React.ReactNode;
};

type Props = {
  showEventId: boolean;
  tableData: TableRow[];
};

export const columns = [
  { Header: 'Field', accessor: 'field' },
  { Header: 'Value', accessor: 'value' },
];

const getGlobalValue = getValueFromTheme('global');
const { grey4, grey5 } = colors;

const DetailsTabContent = ({ showEventId, tableData }: Props) => {
  return (
    <Stack
      marginTop={4}
      backgroundColor="white"
      padding={4}
      borderRadius={getGlobalBorderRadius}
      css={`
        box-shadow: ${getGlobalValue('boxShadow.medium')};
      `}
    >
      <Table
        bordered
        showHeader={false}
        columns={columns}
        data={tableData}
        className="details-table"
        css={`
          tbody tr td:nth-child(1) {
            font-weight: 600;
            width: 25%;
          }
          tbody tr:first-child td {
            border-top: none;
          }
          td strong,
          td b {
            font-weight: 700 !important;
          }

          td em,
          td i {
            font-style: italic !important;
          }
          tr:has(td:nth-child(2) .empty-value) td {
            background-color: ${grey4};
          }
          tr:has(td:nth-child(2) .empty-value) td:nth-child(2) {
            color: ${grey5};
          }
          tbody {
            opacity: ${showEventId ? 1 : 0.4};
          }
        `}
      />
    </Stack>
  );
};

export { DetailsTabContent };
