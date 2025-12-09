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
  showHeader = true,
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
        &.table td {
          padding: 0.75rem;
          vertical-align: top;
          border-top: 1px solid ${getValue('borderColor')};
        }
        &.table thead th {
          padding: 0.75rem;
          vertical-align: top;
          border-bottom: 2px solid ${getValue('borderColor')};
          font-weight: 600;
        }
      `}
      {...getTableProps(props)}
      {...getBoxProps(props)}
    >
      <thead>
        {showHeader &&
          headerGroups.map((headerGroup, indexHeaderGroup) => {
            const { key, ...headerGroupProps } =
              headerGroup.getHeaderGroupProps();
            return (
              <tr key={key || indexHeaderGroup} {...headerGroupProps}>
                {headerGroup.headers.map((column, indexHeader) => {
                  const { key, ...headerProps } = column.getHeaderProps();
                  return (
                    <Box
                      as="th"
                      key={key || indexHeader}
                      {...headerProps}
                      color={getValue('color')}
                    >
                      {column.render('Header')}
                    </Box>
                  );
                })}
              </tr>
            );
          })}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, indexRow) => {
          prepareRow(row);
          const { key, ...rowProps } = row.getRowProps();
          return (
            <tr key={key || indexRow} {...rowProps}>
              {row.cells.map((cell, indexCell) => {
                const { key, ...cellProps } = cell.getCellProps();
                return (
                  <td key={key || indexCell} {...cellProps}>
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

export { Table };
