import 'react-checkbox-tree/lib/react-checkbox-tree.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import ReactCheckboxTree, { Node, CheckboxProps } from 'react-checkbox-tree';
import { ChangeEvent, useCallback, useMemo, useRef, useState } from 'react';
import {
  faCheckSquare,
  faChevronDown,
  faChevronRight,
  faFile,
  faFolder,
  faFolderOpen,
  faMinusSquare,
  faPlusSquare,
} from '@fortawesome/free-solid-svg-icons';
import { faSquare } from '@fortawesome/free-regular-svg-icons';
import { Controller, Path, UseFormReturn } from 'react-hook-form';
import { FormDataUnion } from '@/pages/steps/Steps';
import { colors } from '@/ui/theme';
import { Input } from '@/ui/Input';

const icons = {
  check: (
    <FontAwesomeIcon
      className="rct-icon rct-icon-check"
      icon={faCheckSquare}
      color={colors.udbBlue}
    />
  ),
  uncheck: (
    <FontAwesomeIcon className="rct-icon rct-icon-uncheck" icon={faSquare} />
  ),
  halfCheck: (
    <FontAwesomeIcon
      className="rct-icon rct-icon-half-check"
      icon={faCheckSquare}
      color={colors.udbBlue}
    />
  ),
  expandClose: (
    <FontAwesomeIcon
      className="rct-icon rct-icon-expand-close"
      icon={faChevronRight}
    />
  ),
  expandOpen: (
    <FontAwesomeIcon
      className="rct-icon rct-icon-expand-open"
      icon={faChevronDown}
    />
  ),
  expandAll: (
    <FontAwesomeIcon
      className="rct-icon rct-icon-expand-all"
      icon={faPlusSquare}
    />
  ),
  collapseAll: (
    <FontAwesomeIcon
      className="rct-icon rct-icon-collapse-all"
      icon={faMinusSquare}
    />
  ),
  parentClose: (
    <FontAwesomeIcon
      className="rct-icon rct-icon-parent-close"
      icon={faFolder}
      color={colors.udbMainBlue}
    />
  ),
  parentOpen: (
    <FontAwesomeIcon
      className="rct-icon rct-icon-parent-open"
      icon={faFolderOpen}
      color={colors.udbMainBlue}
    />
  ),
  leaf: (
    <FontAwesomeIcon className="rct-icon rct-icon-leaf-close" icon={faFile} />
  ),
};

type Props = CheckboxProps &
  UseFormReturn<FormDataUnion> & {
    name: Path<FormDataUnion>;
  };

const CheckboxTree = ({ name, control, nodes, props }: Props) => {
  const treeRef = useRef<ReactCheckboxTree>(null);
  const [expanded, setExpanded] = useState([]);
  const [filter, setFilter] = useState('');

  const filterNodes = useCallback(
    (filtered: Node[], node: Node) => {
      const children = (node.children || []).reduce(filterNodes, []);

      if (
        // Node's label matches the search string
        node.label.toLocaleLowerCase().indexOf(filter.toLocaleLowerCase()) >
          -1 ||
        // Or a children has a matching node
        children.length
      ) {
        filtered.push({ ...node, children });
      }

      return filtered;
    },
    [filter],
  );

  const filteredNodes = useMemo(
    () => nodes.reduce(filterNodes, []),
    [filterNodes, nodes],
  );

  return (
    <div>
      <Input
        className="filter-text"
        placeholder="Search..."
        value={filter}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setFilter(event.target.value);
          treeRef.current.expandAllNodes();
        }}
      />
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <ReactCheckboxTree
            ref={treeRef}
            checked={field.value}
            expanded={expanded}
            onCheck={(checked) => field.onChange(checked)}
            onExpand={(expanded) => setExpanded(expanded)}
            icons={icons}
            nodes={filteredNodes}
            expandOnClick
            checkModel="all"
            showExpandAll
            {...props}
          />
        )}
      />
    </div>
  );
};

export { CheckboxTree };
