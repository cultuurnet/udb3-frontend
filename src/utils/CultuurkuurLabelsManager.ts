import { HierarchicalData } from '@/hooks/api/cultuurkuur';

export class CultuurkuurLabelsManager {
  constructor(
    public available: HierarchicalData[],
    public selected: HierarchicalData[] = [],
  ) {}

  getSelectedLabels() {
    return this.selected.map((selected) => selected.label);
  }

  isLabelSelected(label: string) {
    return this.selected.some((selected) => selected.label === label);
  }

  areAllLeafsSelected(leafEntities: HierarchicalData[]) {
    console.log(
      leafEntities,
      leafEntities.every((leaf) => this.isLabelSelected(leaf.label)),
    );
    return leafEntities.every((leaf) => this.isLabelSelected(leaf.label));
  }

  isGroupFullySelected(level1Entity: HierarchicalData) {
    const allLeafEntities = level1Entity.children.flatMap(
      (level2) => level2.children,
    );
    return this.areAllLeafsSelected(allLeafEntities);
  }

  toggleSelectAllLeafs(leafEntities: HierarchicalData[]) {
    const allSelected = this.areAllLeafsSelected(leafEntities);
    if (allSelected) {
      this.selected = this.selected.filter(
        (sel) => !leafEntities.some((leaf) => leaf.label === sel.label),
      );
    } else {
      const newSelections = leafEntities.filter(
        (leaf) => !this.isLabelSelected(leaf.label),
      );
      this.selected = [...this.selected, ...newSelections];
    }
  }

  handleSelectionToggle(entity: HierarchicalData) {
    const isGroup = !!entity.children;

    const alreadySelected = this.isLabelSelected(entity.label);
    if (alreadySelected) {
      this.selected = this.selected.filter((e) => e.label !== entity.label);
      return;
    }

    if (isGroup) {
      const allLeafEntities = entity.children.flatMap(
        (level2) => level2.children,
      );
      if (this.isGroupFullySelected(entity)) {
        this.selected = this.selected.filter(
          (sel) => !allLeafEntities.some((leaf) => leaf.label === sel.label),
        );
      }
      this.selected = [...this.selected, ...allLeafEntities, entity];
      return;
    }

    this.selected = [...this.selected, entity];
  }
}
