import 'react-checkbox-tree/lib/react-checkbox-tree.css';

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
import { diff } from 'deep-object-diff';
import { difference } from 'lodash';
import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import ReactCheckboxTree, { CheckboxProps, Node } from 'react-checkbox-tree';
import { Controller, Path, UseFormReturn } from 'react-hook-form';
import { useQueryClient } from 'react-query';

import {
  useAddOfferLabelMutation,
  useRemoveOfferLabelMutation,
} from '@/hooks/api/offers';
import { useGetEntityByIdAndScope } from '@/hooks/api/scope';
import { ValidationStatus } from '@/pages/steps/AdditionalInformationStep/AdditionalInformationStep';
import { FormDataUnion } from '@/pages/steps/Steps';
import { Offer } from '@/types/Offer';
import { Organizer } from '@/types/Organizer';
import { Input } from '@/ui/Input';
import { Stack } from '@/ui/Stack';
import { colors } from '@/ui/theme';
import { getUniqueLabels } from '@/utils/getUniqueLabels';

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

const getCultuurKuurLabels = (entity) =>
  getUniqueLabels(entity).filter((label) => label.startsWith('cultuurkuur_'));

const CheckboxTree = ({ nodes, offerId, scope, ...props }: Props) => {
  const treeRef = useRef<ReactCheckboxTree>(null);
  const [expanded, setExpanded] = useState([]);
  const [filter, setFilter] = useState('');

  const getEntityByIdQuery = useGetEntityByIdAndScope({ id: offerId, scope });
  const entity = getEntityByIdQuery.data;
  const queryClient = useQueryClient();
  const [labels, setLabels] = useState<string[]>(getUniqueLabels(entity) ?? []);
  const addLabelMutation = useAddOfferLabelMutation();
  const removeLabelMutation = useRemoveOfferLabelMutation();
  const isWriting = addLabelMutation.isLoading || removeLabelMutation.isLoading;

  const handleLabelChange = useCallback(async () => {
    const from = getCultuurKuurLabels(entity);
    const to = Object.values(treeRef.current.state.model.flatNodes)
      .filter((node) => node.checkState)
      .map((node) => node.value);
    const added = difference(to, from);
    const removed = difference(from, to);

    return Promise.all([
      ...added.map((label) =>
        addLabelMutation.mutateAsync({ id: offerId, scope, label }),
      ),
      ...removed.map((label) =>
        removeLabelMutation.mutateAsync({ id: offerId, scope, label }),
      ),
      queryClient.invalidateQueries('events'),
    ]);
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
        onCheck={(checked) => {
          setLabels(checked);
          handleLabelChange();
        }}
        onExpand={(expanded) => setExpanded(expanded)}
        icons={icons}
        nodes={filteredNodes}
        expandOnClick
        checkModel="all"
        showExpandAll
        disabled={isWriting}
        {...props}
      />
    </Stack>
  );
};

export { CheckboxTree };
