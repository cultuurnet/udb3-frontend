import PropTypes from 'prop-types';
import { Table as BootstrapTable } from 'react-bootstrap';
import { useTable } from 'react-table';

import { Box, getBoxProps } from './Box';
import { getValueFromTheme } from './theme';

const getValue = getValueFromTheme('selectionTable');

const Table = ({
  columns,
  data,
  plugins = [],
  tableHooks = [],
  tableOptions = {},
  onTableReady = null,
  ...props
}) => {
  const tableInstance = useTable(
    { columns, data, ...tableOptions },
    ...plugins,
    ...tableHooks,
  );

  // Expose table instance to parent
  if (onTableReady) {
    onTableReady(tableInstance);
  }

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  return (
    <Box
      forwardedAs={BootstrapTable}
      css={`
        &.table th,
        &.table td {
          padding: 0.75rem;
          vertical-align: top;
          border-top: 1px solid ${getValue('borderColor')};
        }
        &.table thead th {
          border-bottom: 1px solid ${getValue('borderColor')};
        }
      `}
      {...getTableProps(props)}
      {...getBoxProps(props)}
    >
      <thead>
        {headerGroups.map((headerGroup, indexHeaderGroup) => (
          <tr key={indexHeaderGroup} {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column, indexHeader) => (
              <Box
                as="th"
                key={indexHeader}
                {...column.getHeaderProps()}
                color={getValue('color')}
              >
                {column.render('Header')}
              </Box>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, indexRow) => {
          prepareRow(row);
          return (
            <tr key={indexRow} {...row.getRowProps()}>
              {row.cells.map((cell, indexCell) => {
                return (
                  <td key={indexCell} {...cell.getCellProps()}>
                    {cell.render('Cell')}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </Box>
  );
};

Table.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  plugins: PropTypes.array,
  tableHooks: PropTypes.array,
  tableOptions: PropTypes.object,
  onTableReady: PropTypes.func,
};

Table.defaultProps = {
  plugins: [],
  tableHooks: [],
  tableOptions: {},
  onTableReady: null,
};

export { Table };
