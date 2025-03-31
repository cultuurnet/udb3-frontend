import 'react-checkbox-tree/lib/react-checkbox-tree.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import ReactCheckboxTree, { Node, CheckboxProps } from 'react-checkbox-tree';
import { useCallback, useMemo, useState } from 'react';
import {
  faCheckSquare,
  faChevronDown,
  faChevronRight,
  faFile,
  faFolder,
  faFolderOpen,
  faMinusSquare,
  faPlusSquare,
  faSquare,
} from '@fortawesome/free-solid-svg-icons';

const icons = {
  check: (
    <FontAwesomeIcon
      className="rct-icon rct-icon-check"
      icon={faCheckSquare}
      width={18}
      height={18}
    />
  ),
  uncheck: (
    <FontAwesomeIcon className="rct-icon rct-icon-uncheck" icon={faSquare} />
  ),
  halfCheck: (
    <FontAwesomeIcon
      className="rct-icon rct-icon-half-check"
      icon="check-square"
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
    />
  ),
  parentOpen: (
    <FontAwesomeIcon
      className="rct-icon rct-icon-parent-open"
      icon={faFolderOpen}
    />
  ),
  leaf: (
    <FontAwesomeIcon className="rct-icon rct-icon-leaf-close" icon={faFile} />
  ),
};

const CheckboxTree = ({ nodes, props }: CheckboxProps) => {
  const [checked, setChecked] = useState([]);
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
    <>
      <input
        className="filter-text"
        placeholder="Search..."
        type="text"
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
      />
      <ReactCheckboxTree
        checked={checked}
        expanded={expanded}
        onCheck={(checked) => setChecked(checked)}
        onExpand={(expanded) => setExpanded(expanded)}
        icons={icons}
        nodes={filteredNodes}
        expandOnClick
        showExpandAll
        {...props}
      />
    </>
  );
};

export { CheckboxTree };
