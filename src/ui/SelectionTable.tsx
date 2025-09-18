import uniqueId from 'lodash/uniqueId';
import PropTypes from 'prop-types';
import { useLayoutEffect, useMemo, useState } from 'react';
import { useRowSelect } from 'react-table';

import { Button, ButtonVariants } from './Button';
import { Checkbox } from './Checkbox';
import { Inline } from './Inline';
import { Stack } from './Stack';
import { Table } from './Table';
import { Text } from './Text';

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
  onSelectionChanged = (_rows) => {},
  actions = [],
  translateSelectedRowCount,
  ...props
}) => {
  const [selectedFlatRows, setSelectedFlatRows] = useState([]);

  const selectionHook = (hooks) => {
    hooks.visibleColumns.push((columns) => [
      {
        id: 'selection',
        Header: CheckBoxHeader,
        Cell: CheckBoxCell,
      },
      ...columns,
    ]);
  };

  const handleTableReady = (tableInstance) => {
    const { selectedFlatRows: currentSelection } = tableInstance;
    setSelectedFlatRows(currentSelection);
  };

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

      <Table
        columns={columns}
        data={data}
        plugins={[useRowSelect]}
        tableHooks={[selectionHook]}
        onTableReady={handleTableReady}
        css={`
          &.table th,
          &.table td {
            :first-child {
              width: 100px;
            }
          }
        `}
        {...props}
      />
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

export { SelectionTable };
