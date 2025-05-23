import { HierarchicalData } from '@/hooks/api/cultuurkuur';
import { SupportedLanguages } from '@/i18n/index';
import { getLanguageObjectOrFallback } from '@/utils/getLanguageObjectOrFallback';

export class CultuurkuurLabelsManager {
  selected: string[] = [];
  unknown: string[] = [];
  partial = false;
  mapping: { [key: string]: string | null } = {};

  constructor(
    public available: HierarchicalData[],
    selected: string[] = [],
    private updater?: (labels: string[]) => void,
  ) {
    this.flattenEntity = this.flattenEntity.bind(this);
    this.partial = !!available[0].extraLabel;

    const flattened = this.getFlattened();
    for (let entity of flattened) {
      this.mapping[this.getIdentifier(entity)] = entity.parent
        ? this.getIdentifier(entity.parent)
        : null;
    }

    for (let label of selected) {
      const entity = this.find(label);
      const isSelected = this.isLabelSelected(label);
      if (entity && !isSelected) {
        this.toggle(entity);
      } else if (!entity) {
        this.unknown.push(label);
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

  getSelected() {
    const finalSelection = this.selected.filter((selected) =>
      this.isRealLabel(selected),
    );

    return finalSelection
      .filter((selected) => {
        const parent = this.mapping[selected];
        if (this.partial && finalSelection.includes(parent)) {
          return false;
        }

        return true;
      })
      .sort();
  }

  find(entity: string | HierarchicalData) {
    const needle =
      typeof entity === 'string' ? entity : this.getIdentifier(entity);
    return this.getFlattened().find((e) => this.getIdentifier(e) === needle);
  }

  getFlattenedSelection() {
    return this.getFlattened().filter((e) =>
      this.isLabelSelected(this.getIdentifier(e)),
    );
  }

  isLabelSelected(label: string) {
    if (!label) {
      return false;
    }
    const parent = this.mapping[label];
    const parents = [label, parent, this.mapping[parent]].filter(Boolean);
    return parents.some((selected) => this.getSelected().includes(selected));
  }

  isRealLabel(label: string | null) {
    return label && !label.includes(' ');
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
    return leafEntities.every((leaf) => {
      const identifier = this.getIdentifier(leaf);

      return !this.isRealLabel(identifier) || this.isLabelSelected(identifier);
    });
  }

  isGroupFullySelected(group: HierarchicalData) {
    return this.areAllLeafsSelected(this.flattenEntity(group));
  }

  toggle(entity: HierarchicalData) {
    const identifier = this.getIdentifier(entity);
    const fullEntity = this.find(entity);
    const isGroup = !!fullEntity.children;

    const alreadySelected = this.isLabelSelected(identifier);
    if (alreadySelected && !isGroup) {
      let newSelected = this.selected.filter((e) => e !== identifier);

      const flattened = this.getFlattened();
      const parentGroups = flattened.filter((e) =>
        this.flattenEntity(e).some(
          (child) => this.getIdentifier(child) === identifier,
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
        const other =
          this.partial && entity.extraLabel ? [entity] : allLeafEntities;
        return this.setSelected([
          ...this.selected,
          ...other.map((l) => this.getIdentifier(l)),
        ]);
      }
    } else {
      this.setSelected([...this.selected, identifier]);
    }

    let parent = this.mapping[identifier];
    while (parent) {
      const fullParent = this.find(parent);
      const parentLabel =
        !this.partial || this.isGroupFullySelected(fullParent)
          ? parent
          : fullParent.extraLabel ?? parent;
      this.setSelected([...this.selected, this.partial ? parentLabel : parent]);
      parent = this.mapping[parent];
    }
  }

  setSelected(newSelected: string[]) {
    newSelected = [...new Set([...newSelected, ...this.unknown])].sort();

    this.selected = newSelected;
    this.updater?.(newSelected);
  }
}
