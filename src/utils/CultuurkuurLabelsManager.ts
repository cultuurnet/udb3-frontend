import { HierarchicalData } from '@/hooks/api/cultuurkuur';

export class CultuurkuurLabelsManager {
  selected: string[] = [];

  constructor(public available: HierarchicalData[], selected: string[] = []) {
    const flattened = this.available.flatMap(this.flattenEntity);
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
    console.log({ entity, isGroup, alreadySelected });
    if (alreadySelected) {
      this.selected = this.selected
        .filter((e) => e !== entity.label)
        .filter((e) => {
          return this.isGroupFullySelected(e);
        });
      return;
    }

    if (isGroup) {
      const allLeafEntities = this.flattenEntity(entity);
      if (this.isGroupFullySelected(entity)) {
        this.selected = this.selected.filter(
          (sel) => !allLeafEntities.some((leaf) => leaf.label === sel),
        );
      }
      this.selected = [
        ...this.selected,
        ...allLeafEntities.map((l) => l.label),
      ];
      return;
    }

    this.selected = [...this.selected, entity.label];
  }
}
