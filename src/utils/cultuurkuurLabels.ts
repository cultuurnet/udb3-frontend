import { useState } from 'react';

import { HierarchicalData } from '@/hooks/api/cultuurkuur';

const sortByName = (entities: HierarchicalData['children'] = []) => {
  return entities
    ?.slice()
    .sort((a, b) => (a?.name?.nl || '').localeCompare(b?.name?.nl || ''));
};

const dataToLabels = (newData: HierarchicalData[]) => {
  return newData.map((data) => data.label);
};

const getAllLeafNodes = (entity: HierarchicalData): HierarchicalData[] => {
  if (!entity.children || entity.children.length === 0) {
    return [entity];
  }
  return entity.children.flatMap((child) => getAllLeafNodes(child));
};

const expandLevel1WithChildren = (selectedData: HierarchicalData[]) => {
  return selectedData.flatMap((entity) =>
    entity.children && entity.children.length > 0
      ? getAllLeafNodes(entity)
      : [entity],
  );
};

const handleSelectedLocations = (
  selectedEntities: HierarchicalData[],
  data: HierarchicalData[],
): string[] => {
  const provinces = data.filter(
    (entity) => entity.children && entity.children.length > 0,
  );

  const fullySelectedProvinces = provinces.filter((province) => {
    const leaves = getAllLeafNodes(province);
    return leaves.every((leaf) =>
      selectedEntities.some((sel) => sel.name.nl === leaf.name.nl),
    );
  });

  const leafLabelsToKeep = selectedEntities
    .filter((sel) => {
      return !fullySelectedProvinces.some((province) => {
        const leaves = getAllLeafNodes(province);
        return leaves.some((leaf) => leaf.name.nl === sel.name.nl);
      });
    })
    .map((sel) => sel.label);

  let labelSet = new Set<string>(leafLabelsToKeep);

  fullySelectedProvinces.forEach((province) => {
    labelSet.add(province.label);
  });

  provinces.forEach((province) => {
    const leaves = getAllLeafNodes(province);
    const isFullySelected = leaves.every((leaf) =>
      selectedEntities.some((sel) => sel.name.nl === leaf.name.nl),
    );
    const isSomeSelected = leaves.some((leaf) =>
      selectedEntities.some((sel) => sel.name.nl === leaf.name.nl),
    );

    if (!isFullySelected && isSomeSelected && province.extraLabel) {
      labelSet.add(province.extraLabel);
    }
  });

  return Array.from(labelSet);
};

const findParent = (
  target: HierarchicalData,
  list: HierarchicalData[],
): HierarchicalData | null => {
  for (const item of list) {
    if (item.children?.some((c) => c.label === target.label)) {
      return item;
    }
    const found = item.children && findParent(target, item.children);
    if (found) return found;
  }
  return null;
};

const addWithParents = (
  node: HierarchicalData,
  selected: HierarchicalData[],
  data: HierarchicalData[],
) => {
  if (!selected.some((e) => e.label === node.label)) {
    selected.push(node);
  }
  const parent = findParent(node, data);
  if (parent) addWithParents(parent, selected, data);
};

const removeAndCleanParents = (
  node: HierarchicalData,
  selected: HierarchicalData[],
  data: HierarchicalData[],
): HierarchicalData[] => {
  selected = selected.filter((e) => e.label !== node.label);

  const parent = findParent(node, data);
  if (!parent) return selected;

  const hasOtherSelected = parent.children?.some(
    (child) =>
      child.label !== node.label &&
      selected.some((e) => e.label === child.label),
  );

  if (!hasOtherSelected) {
    return removeAndCleanParents(parent, selected, data);
  }

  return selected;
};

const useLabelsManager = (
  labelsKey: string,
  data: HierarchicalData[],
  selectedData: HierarchicalData[] = [],
) => {
  const [selectedEntities, setSelectedEntities] = useState(
    labelsKey === 'location'
      ? expandLevel1WithChildren(selectedData)
      : selectedData,
  );

  const isGroupFullySelected = (entity: HierarchicalData) => {
    const leaves = getAllLeafNodes(entity);

    return leaves.every((leaf) =>
      selectedEntities.some((sel) => sel.label === leaf.label),
    );
  };

  const handleSelectionToggle = (entity: HierarchicalData) => {
    const leaves = getAllLeafNodes(entity);
    const isEducationLabel = !entity.label
      .toLowerCase()
      .includes('werkingsregio');

    setSelectedEntities((prev) => {
      const allSelected = leaves.every((leaf) =>
        prev.some((sel) => sel.label === leaf.label),
      );

      if (allSelected) {
        let updated = prev.filter(
          (sel) => !leaves.some((leaf) => leaf.label === sel.label),
        );

        if (isEducationLabel) {
          leaves.forEach((leaf) => {
            updated = removeAndCleanParents(leaf, updated, data);
          });
        }

        return updated;
      } else {
        let updated = [...prev];
        const newSelections = leaves.filter(
          (leaf) => !prev.some((sel) => sel.label === leaf.label),
        );
        updated.push(...newSelections);

        if (isEducationLabel) {
          newSelections.forEach((leaf) => {
            addWithParents(leaf, updated, data);
          });
        }

        return updated;
      }
    });
  };

  const getSelected = () => {
    const final =
      labelsKey === 'location'
        ? handleSelectedLocations(selectedEntities, data)
        : dataToLabels(selectedEntities);

    return final.sort();
  };

  return {
    selectedEntities,
    setSelectedEntities,
    isGroupFullySelected,
    handleSelectionToggle,
    getSelected,
  } as const;
};

export {
  addWithParents,
  dataToLabels,
  expandLevel1WithChildren,
  findParent,
  getAllLeafNodes,
  handleSelectedLocations,
  removeAndCleanParents,
  sortByName,
  useLabelsManager,
};
