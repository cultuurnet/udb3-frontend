import { HierarchicalData } from '@/hooks/api/cultuurkuur';
import { SupportedLanguages } from '@/i18n/index';
import { getLanguageObjectOrFallback } from '@/utils/getLanguageObjectOrFallback';

export class CultuurkuurLabelsManager {
  selected: string[] = [];

  constructor(
    public available: HierarchicalData[],
    selected: string[] = [],
    private updater?: (labels: string[]) => void,
  ) {
    this.flattenEntity = this.flattenEntity.bind(this);

    const flattened = this.getFlattened();
    for (let label of selected) {
      const entity = flattened.find((e) => this.getIdentifier(e) === label);
      if (entity && !this.selected.includes(this.getIdentifier(entity))) {
        this.handleSelectionToggle(entity);
      }
    }
  }

  getIdentifier(entity: HierarchicalData) {
    return (
      entity.label ??
      getLanguageObjectOrFallback(entity.name, SupportedLanguages.NL)
    );
  }

  getFlattened() {
    return this.available.flatMap(this.flattenEntity);
  }

  getFlattenedSelection() {
    return this.getFlattened().filter((e) =>
      this.isLabelSelected(this.getIdentifier(e)),
    );
  }

  isLabelSelected(label: string) {
    return label ? this.selected.includes(label) : false;
  }

  flattenEntity(entity: HierarchicalData): HierarchicalData[] {
    return [entity].concat(
      entity.children?.flatMap((child) =>
        [child].concat(child.children ?? []).map((subchild) => ({
          ...subchild,
          parent:
            this.getIdentifier(subchild) === this.getIdentifier(child)
              ? entity
              : child,
        })),
      ) ?? [],
    );
  }

  areAllLeafsSelected(leafEntities: HierarchicalData[]) {
    return leafEntities.every((leaf) =>
      this.isLabelSelected(this.getIdentifier(leaf)),
    );
  }

  isGroupFullySelected(group: HierarchicalData) {
    return this.areAllLeafsSelected(this.flattenEntity(group));
  }

  handleSelectionToggle(entity: HierarchicalData) {
    const isGroup = !!entity.children;
    const parent = entity.parent;

    const alreadySelected = this.isLabelSelected(this.getIdentifier(entity));
    if (alreadySelected && !isGroup) {
      let newSelected = this.selected.filter(
        (e) => e !== this.getIdentifier(entity),
      );

      const flattened = this.getFlattened();
      const parentGroups = flattened.filter((e) =>
        this.flattenEntity(e).some(
          (child) => this.getIdentifier(child) === this.getIdentifier(entity),
        ),
      );

      parentGroups.forEach((parent) => {
        if (newSelected.includes(this.getIdentifier(parent))) {
          newSelected = newSelected.filter(
            (label) => label !== this.getIdentifier(parent),
          );
        }
      });

      return this.setSelected(newSelected);
    }

    if (isGroup) {
      const allLeafEntities = this.flattenEntity(entity);
      if (this.isGroupFullySelected(entity)) {
        this.setSelected(
          this.selected.filter(
            (sel) =>
              !allLeafEntities.some((leaf) => this.getIdentifier(leaf) === sel),
          ),
        );
      } else {
        return this.setSelected([
          ...this.selected,
          ...allLeafEntities.map((l) => this.getIdentifier(l)),
        ]);
      }
    } else {
      this.setSelected([...this.selected, this.getIdentifier(entity)]);
    }

    if (parent && this.areAllLeafsSelected(parent.children)) {
      this.setSelected([...this.selected, this.getIdentifier(parent)]);
    }
  }

  setSelected(newSelected: string[]) {
    this.selected = newSelected;
    this.updater?.(newSelected);
  }
}
