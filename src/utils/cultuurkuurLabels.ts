import { useState } from 'react';

import { CULTUURKUUR_ON_SITE_LABEL } from '@/constants/Cultuurkuur';
import { HierarchicalData } from '@/hooks/api/cultuurkuur';

const sortByName = (entities: HierarchicalData['children'] = []) => {
  return entities
    ?.slice()
    .sort((a, b) => (a?.name?.nl || '').localeCompare(b?.name?.nl || ''));
};

const dataToLabels = (newData: HierarchicalData[]) => {
  return newData.map((data) => data.label);
};

const getLocationLabels = (labels: string[]) => {
  return labels?.filter(
    (label) =>
      label.startsWith('cultuurkuur_werkingsregio') ||
      label === CULTUURKUUR_ON_SITE_LABEL,
  );
};

const getEducationLabels = (labels: string[]) => {
  return labels?.filter(
    (label) =>
      label.startsWith('cultuurkuur_') &&
      label !== CULTUURKUUR_ON_SITE_LABEL &&
      !label.startsWith('cultuurkuur_werkingsregio'),
  );
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

  const isSelected = (leaf: HierarchicalData) =>
    selectedEntities.some((sel) => sel.label === leaf.label);

  const isGroupFullySelected = (entity: HierarchicalData) => {
    const leaves = getAllLeafNodes(entity);

    return leaves.every((leaf) => isSelected(leaf));
  };

  const handleSelectionToggleEducation = (entity: HierarchicalData) => {
    setSelectedEntities((prev) => {
      let updated = [...prev];
      const isSelected = updated.some((e) => e.label === entity.label);

      if (isSelected) {
        updated = removeAndCleanParents(entity, updated, data);
      } else {
        addWithParents(entity, updated, data);
      }

      return updated;
    });
  };

  const handleSelectionToggle = (entity: HierarchicalData) => {
    if (labelsKey === 'education') {
      handleSelectionToggleEducation(entity);
      toggleSelectAllLeafs(entity.children);
      return;
    }

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

  // Level2 children
  const areAllLeafsSelected = (entities: HierarchicalData[] = []) => {
    const allLeaves = entities.flatMap(getAllLeafNodes);
    return allLeaves.every((leaf) =>
      selectedEntities.some((sel) => sel.label === leaf.label),
    );
  };

  // Select All - Clear All
  const toggleSelectAllLeafs = (entities: HierarchicalData[] = []) => {
    const allLeaves = entities.flatMap(getAllLeafNodes);

    const isEducationLabel = !entities.some((e) =>
      e.label.toLowerCase().includes('werkingsregio'),
    );

    const allSelected = allLeaves.every((leaf) =>
      selectedEntities.some((sel) => sel.label === leaf.label),
    );

    if (allSelected) {
      setSelectedEntities((prev) => {
        let updated = prev.filter(
          (sel) => !allLeaves.some((leaf) => leaf.label === sel.label),
        );

        if (isEducationLabel) {
          allLeaves.forEach((leaf) => {
            updated = removeAndCleanParents(leaf, updated, data);
          });
        }

        return updated;
      });
    } else {
      setSelectedEntities((prev) => {
        const updated = [...prev];
        allLeaves.forEach((leaf) => {
          if (!updated.some((e) => e.label === leaf.label)) {
            if (isEducationLabel) {
              addWithParents(leaf, updated, data);
            } else {
              updated.push(leaf);
            }
          }
        });
        return updated;
      });
    }
  };

  return {
    isGroupFullySelected,
    handleSelectionToggle,
    getSelected,
    areAllLeafsSelected,
    toggleSelectAllLeafs,
    isSelected,
  } as const;
};

export {
  addWithParents,
  dataToLabels,
  expandLevel1WithChildren,
  findParent,
  getAllLeafNodes,
  getEducationLabels,
  getLocationLabels,
  handleSelectedLocations,
  removeAndCleanParents,
  sortByName,
  useLabelsManager,
};
