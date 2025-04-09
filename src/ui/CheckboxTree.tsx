import 'react-checkbox-tree/lib/react-checkbox-tree.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import ReactCheckboxTree, { Node, CheckboxProps } from 'react-checkbox-tree';
import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
import { Stack } from '@/ui/Stack';
import { getUniqueLabels } from '@/utils/getUniqueLabels';
import {
  useAddOfferLabelMutation,
  useRemoveOfferLabelMutation,
} from '@/hooks/api/offers';
import { ValidationStatus } from '@/pages/steps/AdditionalInformationStep/AdditionalInformationStep';
import { useGetEntityByIdAndScope } from '@/hooks/api/scope';
import { Offer } from '@/types/Offer';
import { Organizer } from '@/types/Organizer';
import { diff } from 'deep-object-diff';
import { difference } from 'lodash';

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

const CheckboxTree = ({ nodes, offerId, scope, ...props }: Props) => {
  const treeRef = useRef<ReactCheckboxTree>(null);
  const [expanded, setExpanded] = useState([]);
  const [filter, setFilter] = useState('');

  const getEntityByIdQuery = useGetEntityByIdAndScope({ id: offerId, scope });
  const entity = getEntityByIdQuery.data;

  const [labels, setLabels] = useState<string[]>(getUniqueLabels(entity) ?? []);
  const addLabelMutation = useAddOfferLabelMutation();
  const removeLabelMutation = useRemoveOfferLabelMutation();

  useEffect(() => {
    const added = difference(labels, getUniqueLabels(entity));
    const removed = difference(getUniqueLabels(entity), labels);
    console.log({ to: labels, from: entity.labels, added, removed });
  }, [entity, labels]);

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
    <Stack width="100%" maxWidth="43rem">
      <Input
        className="filter-text"
        placeholder="Search..."
        value={filter}
        marginBottom={3}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setFilter(event.target.value);
          treeRef.current.expandAllNodes();
        }}
      />
      <ReactCheckboxTree
        ref={treeRef}
        checked={labels}
        expanded={expanded}
        onCheck={(checked) => setLabels(checked)}
        onExpand={(expanded) => setExpanded(expanded)}
        icons={icons}
        nodes={filteredNodes}
        expandOnClick
        checkModel="all"
        showExpandAll
        {...props}
      />
    </Stack>
  );
};

export { CheckboxTree };
