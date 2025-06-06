import uniqueId from 'lodash/uniqueId';
import PropTypes from 'prop-types';
import { useLayoutEffect, useMemo } from 'react';
import { Table as BootstrapTable } from 'react-bootstrap';
import { useRowSelect, useTable } from 'react-table';

import { Box, getBoxProps } from './Box';
import { Button, ButtonVariants } from './Button';
import { Checkbox } from './Checkbox';
import { Inline } from './Inline';
import { Stack } from './Stack';
import { Text } from './Text';
import { getValueFromTheme } from './theme';

const getValue = getValueFromTheme('selectionTable');

const CheckBoxHeader = ({ getToggleAllRowsSelectedProps }) => {
  const { checked, onChange } = getToggleAllRowsSelectedProps();

  return (
    <Checkbox
      id={uniqueId('checkbox-')}
      checked={checked}
      onToggle={onChange}
    />
  );
};

CheckBoxHeader.propTypes = {
  getToggleAllRowsSelectedProps: PropTypes.func,
};

const CheckBoxCell = ({ row }) => {
  const { checked, onChange } = row.getToggleRowSelectedProps();

  const identifier = `checkbox-${row.id}`;

  return (
    <Checkbox
      id={identifier}
      data-testid={identifier}
      checked={checked}
      onToggle={onChange}
    />
  );
};

CheckBoxCell.propTypes = {
  row: PropTypes.object,
};

const SelectionTable = ({
  columns,
  data,
  onSelectionChanged,
  actions,
  translateSelectedRowCount,
  ...props
}) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    selectedFlatRows,
  } = useTable({ columns, data }, useRowSelect, (hooks) => {
    hooks.visibleColumns.push((columns) => [
      // Add a selection column containing Checkbox components to the left of the table
      {
        id: 'selection',
        Header: CheckBoxHeader,
        Cell: CheckBoxCell,
      },
      ...columns,
    ]);
  });

  useLayoutEffect(() => {
    if (!onSelectionChanged || !selectedFlatRows) return;
    onSelectionChanged(
      selectedFlatRows.map((row) => ({
        id: parseInt(row.id),
        values: { ...row.values },
      })),
    );
  }, [onSelectionChanged, selectedFlatRows]);

  const selectedRowsText = useMemo(
    () => translateSelectedRowCount(selectedFlatRows.length),

    [selectedFlatRows.length, translateSelectedRowCount],
  );

  return (
    <Stack spacing={3}>
      <Inline forwardedAs="div" width="100%" alignItems="center" spacing={5}>
        <Text
          minWidth="11rem"
          css={`
            flex-shrink: 0;
          `}
        >
          {selectedRowsText}
        </Text>
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
            :first-child {
              width: 100px;
            }
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

SelectionTable.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  actions: PropTypes.array,
  onSelectionChanged: PropTypes.func,
  translateSelectedRowCount: PropTypes.func,
};

SelectionTable.defaultProps = {
  actions: [],
  onSelectionChanged: () => {},
};

export { SelectionTable };
