import uniqueId from 'lodash/uniqueId';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRowSelect } from 'react-table';

import { Button, ButtonVariants } from './Button';
import { Checkbox } from './Checkbox';
import { Inline } from './Inline';
import { Stack } from './Stack';
import { Table } from './Table';
import { Text } from './Text';

const CheckBoxHeader = ({
  getToggleAllRowsSelectedProps,
  toggleAllRowsSelected,
}) => {
  const { t } = useTranslation();
  const { checked } = getToggleAllRowsSelectedProps();

  return (
    <span className="tw:flex tw:w-full tw:justify-center">
      <Checkbox
        id={uniqueId('checkbox-')}
        checked={checked}
        onCheckedChange={toggleAllRowsSelected}
        aria-label={t('selectionTable.selectAll')}
      />
    </span>
  );
};

CheckBoxHeader.propTypes = {
  getToggleAllRowsSelectedProps: PropTypes.func,
  toggleAllRowsSelected: PropTypes.func,
};

const CheckBoxCell = ({ row }) => {
  const { t } = useTranslation();
  const { checked } = row.getToggleRowSelectedProps();

  const identifier = `checkbox-${row.id}`;

  return (
    <span className="tw:flex tw:w-full tw:justify-center">
      <Checkbox
        id={identifier}
        data-testid={identifier}
        checked={checked}
        onCheckedChange={row.toggleRowSelected}
        aria-label={t('selectionTable.selectRow')}
      />
    </span>
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
  const onSelectionChangedRef = useRef(onSelectionChanged);

  onSelectionChangedRef.current = onSelectionChanged;

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
    setTimeout(() => {
      setSelectedFlatRows(currentSelection);
    }, 0);
  };

  useEffect(() => {
    if (!selectedFlatRows) return;

    const mappedRows = selectedFlatRows.map((row) => ({
      id: parseInt(row.id),
      values: { ...row.values },
    }));

    onSelectionChangedRef.current(mappedRows);
  }, [selectedFlatRows]);

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
          &.table th:first-child,
          &.table td:first-child {
            width: 100px;
            vertical-align: middle;
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
