import 'react-checkbox-tree/lib/react-checkbox-tree.css';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faSquare } from '@fortawesome/free-regular-svg-icons';
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { difference } from 'lodash';
import {
  ChangeEvent,
  Component,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import ReactCheckboxTree, { CheckboxProps, Node } from 'react-checkbox-tree';
import { useQueryClient } from 'react-query';

import {
  useAddOfferLabelMutation,
  useRemoveOfferLabelMutation,
} from '@/hooks/api/offers';
import { useGetEntityByIdAndScope } from '@/hooks/api/scope';
import { StepProps } from '@/pages/steps/Steps';
import { Input } from '@/ui/Input';
import { Stack } from '@/ui/Stack';
import { colors } from '@/ui/theme';
import { getUniqueLabels } from '@/utils/getUniqueLabels';

const icons = {
  check: (
    <FontAwesomeIcon
      className="rct-icon rct-icon-check"
      icon={faCheckSquare as IconProp}
      color={colors.udbBlue}
    />
  ),
  uncheck: (
    <FontAwesomeIcon
      className="rct-icon rct-icon-uncheck"
      icon={faSquare as IconProp}
    />
  ),
  halfCheck: (
    <FontAwesomeIcon
      className="rct-icon rct-icon-half-check"
      icon={faCheckSquare as IconProp}
      color={colors.udbBlue}
    />
  ),
  expandClose: (
    <FontAwesomeIcon
      className="rct-icon rct-icon-expand-close"
      icon={faChevronRight as IconProp}
    />
  ),
  expandOpen: (
    <FontAwesomeIcon
      className="rct-icon rct-icon-expand-open"
      icon={faChevronDown as IconProp}
    />
  ),
  expandAll: (
    <FontAwesomeIcon
      className="rct-icon rct-icon-expand-all"
      icon={faPlusSquare as IconProp}
    />
  ),
  collapseAll: (
    <FontAwesomeIcon
      className="rct-icon rct-icon-collapse-all"
      icon={faMinusSquare as IconProp}
    />
  ),
  parentClose: (
    <FontAwesomeIcon
      className="rct-icon rct-icon-parent-close"
      icon={faFolder as IconProp}
      color={colors.udbMainBlue}
    />
  ),
  parentOpen: (
    <FontAwesomeIcon
      className="rct-icon rct-icon-parent-open"
      icon={faFolderOpen as IconProp}
      color={colors.udbMainBlue}
    />
  ),
  leaf: (
    <FontAwesomeIcon
      className="rct-icon rct-icon-leaf-close"
      icon={faFile as IconProp}
    />
  ),
};

type CheckboxState = {
  model: {
    flatNodes: any[];
  };
};

type ReactCheckboxTreeRef = Component<CheckboxProps, CheckboxState> & {
  expandAllNodes: () => void;
};

const LabelsCheckboxTree = ({
  nodes,
  offerId,
  scope,
}: CheckboxProps & Pick<StepProps, 'offerId' | 'scope'>) => {
  const treeRef = useRef<ReactCheckboxTreeRef>(null);
  const [expanded, setExpanded] = useState([]);
  const [filter, setFilter] = useState('');
  const getEntityByIdQuery = useGetEntityByIdAndScope({ id: offerId, scope });
  const entity = getEntityByIdQuery.data;
  const queryClient = useQueryClient();
  const [labels, setLabels] = useState<string[]>(getUniqueLabels(entity) ?? []);
  const addLabelMutation = useAddOfferLabelMutation();
  const removeLabelMutation = useRemoveOfferLabelMutation();
  const isWriting = addLabelMutation.isLoading || removeLabelMutation.isLoading;

  const getRelevantLabels = (entity) => {
    const existing = Object.values(
      (treeRef.current.state as CheckboxState).model.flatNodes,
    ).map((node) => node.value);

    return getUniqueLabels(entity).filter((label) => existing.includes(label));
  };

  const handleLabelChange = useCallback(async () => {
    const from = getRelevantLabels(entity);
    const to = Object.values(
      (treeRef.current.state as CheckboxState).model.flatNodes,
    )
      .filter((node) => node.checkState)
      .map((node) => node.value);
    const added = difference(to, from);
    const removed = difference(from, to);

    for (const label of added) {
      await addLabelMutation.mutateAsync({ id: offerId, scope, label });
    }
    for (const label of removed) {
      await removeLabelMutation.mutateAsync({ id: offerId, scope, label });
    }

    await queryClient.invalidateQueries('events');
  }, [
    queryClient,
    addLabelMutation,
    removeLabelMutation,
    entity,
    offerId,
    scope,
  ]);

  useEffect(() => {
    handleLabelChange();
  }, [labels]);

  const filterNodes = useCallback(
    (filtered: Node[], node: Node) => {
      const children = (node.children || []).reduce(filterNodes, []);

      if (
        // Node's label matches the search string
        (node.label as string)
          .toLocaleLowerCase()
          .indexOf(filter.toLocaleLowerCase()) > -1 ||
        // Or a children has a matching node
        children.length
      ) {
        filtered.push({ ...node, children: children.length ? children : null });
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
        disabled={isWriting}
      />
    </Stack>
  );
};

export { LabelsCheckboxTree };
