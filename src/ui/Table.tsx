import PropTypes from 'prop-types';
import { Table as BootstrapTable } from 'react-bootstrap';
import { useTable } from 'react-table';

import { Box, getBoxProps } from './Box';
import { Button, ButtonVariants } from './Button';
import { Inline } from './Inline';
import { Stack } from './Stack';
import { getValueFromTheme } from './theme';

const getValue = getValueFromTheme('selectionTable');

const Table = ({ columns, data, actions, ...props }) => {
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data });

  return (
    <Stack spacing={3}>
      <Inline forwardedAs="div" width="100%" alignItems="center" spacing={5}>
        <Inline></Inline>
        <Inline spacing={3}>
          {actions.map(({ iconName, title, onClick, disabled }) => (
            <Button
              key={title}
              variant={ButtonVariants.SECONDARY}
              onClick={onClick}
              disabled={disabled}
              iconName={iconName}
              spacing={3}
            >
              {title}
            </Button>
          ))}
        </Inline>
      </Inline>
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
        {...getTableProps()}
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
    </Stack>
  );
};

Table.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  actions: PropTypes.array,
};

Table.defaultProps = {
  actions: [],
};

export { Table };
