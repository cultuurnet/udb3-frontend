import { HierarchicalData } from '@/hooks/api/cultuurkuur';

export class CultuurkuurLabelsManager {
  selected: string[] = [];

  constructor(
    public available: HierarchicalData[],
    selected: string[] = [],
    private updater?: (labels: string[]) => void,
  ) {
    const flattened = this.getFlattened();
    for (let label of selected) {
      const entity = flattened.find((e) => e.label === label);
      if (entity && !this.selected.includes(entity.label)) {
        this.handleSelectionToggle(entity);
      }
    }
  }

  isLabelSelected(label: string) {
    return this.selected.includes(label);
  }

  flattenEntity(entity: HierarchicalData): HierarchicalData[] {
    return [entity].concat(
      entity.children?.flatMap((child) =>
        [child].concat(child.children ?? []),
      ) ?? [],
    );
  }

  areAllLeafsSelected(leafEntities: HierarchicalData[]) {
    return leafEntities.every((leaf) => this.isLabelSelected(leaf.label));
  }

  isGroupFullySelected(group: HierarchicalData) {
    const allLeafEntities = this.flattenEntity(group);

    return this.areAllLeafsSelected(allLeafEntities);
  }

  toggleSelectAllLeafs(leafEntities: HierarchicalData[]) {
    const allSelected = this.areAllLeafsSelected(leafEntities);
    if (allSelected) {
      this.selected = this.selected.filter(
        (sel) => !leafEntities.some((leaf) => leaf.label === sel),
      );
    } else {
      const newSelections = leafEntities.filter(
        (leaf) => !this.isLabelSelected(leaf.label),
      );
      this.selected = [...this.selected, ...newSelections.map((l) => l.label)];
    }
  }

  handleSelectionToggle(entity: HierarchicalData) {
    const isGroup = !!entity.children;

    const alreadySelected = this.isLabelSelected(entity.label);
    if (alreadySelected) {
      let newSelected = this.selected.filter((e) => e !== entity.label);

      // If it's not a group, also check if any parent groups need to be deselected
      if (!isGroup) {
        const flattened = this.getFlattened();
        const parentGroups = flattened.filter((e) =>
          this.flattenEntity(e).some((child) => child.label === entity.label),
        );

        parentGroups.forEach((parent) => {
          if (newSelected.includes(parent.label)) {
            newSelected = newSelected.filter((label) => label !== parent.label);
          }
        });
      }

      return this.setSelected(newSelected);
    }

    if (isGroup) {
      const allLeafEntities = this.flattenEntity(entity);
      if (this.isGroupFullySelected(entity)) {
        this.setSelected(
          this.selected.filter(
            (sel) => !allLeafEntities.some((leaf) => leaf.label === sel),
          ),
        );
      }

      return this.setSelected([
        ...this.selected,
        ...allLeafEntities.map((l) => l.label),
      ]);
    }

    this.setSelected([...this.selected, entity.label]);
  }

  setSelected(newSelected: string[]) {
    this.selected = newSelected;
    this.updater?.(newSelected);
  }
}
