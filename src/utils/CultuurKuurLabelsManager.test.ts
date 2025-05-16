import { CultuurkuurLabelsManager } from '@/utils/CultuurkuurLabelsManager';
import { dummyMunicipalities } from '@/hooks/api/cultuurkuur';

describe('CultururKuurLabelsManager', () => {
  test('can toggle a label', () => {
    const manager = new CultuurkuurLabelsManager(dummyMunicipalities);
    expect(manager.isLabelSelected('cultuurkuur_werkingsregio_nis-21001')).toBe(
      false,
    );
    manager.handleSelectionToggle(
      dummyMunicipalities[0].children[0].children[0],
    );
    expect(manager.isLabelSelected('cultuurkuur_werkingsregio_nis-21001')).toBe(
      true,
    );
  });

  test('can toggle a level', () => {
    const manager = new CultuurkuurLabelsManager(dummyMunicipalities);
    expect(manager.isLabelSelected('cultuurkuur_werkingsregio_nis-21001')).toBe(
      false,
    );
    manager.handleSelectionToggle(dummyMunicipalities[0]);
    expect(manager.isLabelSelected('cultuurkuur_werkingsregio_nis-21001')).toBe(
      true,
    );
  });

  test('can test if group is fully selected', () => {
    const manager = new CultuurkuurLabelsManager(dummyMunicipalities);
    manager.handleSelectionToggle(dummyMunicipalities[0]);
    expect(manager.isGroupFullySelected(dummyMunicipalities[0])).toBe(true);
    expect(
      manager.isGroupFullySelected(dummyMunicipalities[0].children[0]),
    ).toBe(true);
    expect(
      manager.isLabelSelected('cultuurkuur_werkingsregio_provincie_nis-01000'),
    ).toBe(true);

    manager.handleSelectionToggle(
      dummyMunicipalities[0].children[0].children[0],
    );
    expect(manager.isLabelSelected('cultuurkuur_werkingsregio_nis-21001')).toBe(
      false,
    );
    expect(manager.isGroupFullySelected(dummyMunicipalities[0])).toBe(false);
    expect(
      manager.isLabelSelected('cultuurkuur_werkingsregio_provincie_nis-01000'),
    ).toBe(false);
  });

  test('can pass pre-selected data', () => {
    const manager = new CultuurkuurLabelsManager(dummyMunicipalities, [
      dummyMunicipalities[0].label,
      dummyMunicipalities[0].children[0].children[0].label,
    ]);
    expect(manager.isGroupFullySelected(dummyMunicipalities[0])).toBe(true);
    expect(
      manager.isGroupFullySelected(dummyMunicipalities[0].children[0]),
    ).toBe(true);
    expect(
      manager.isLabelSelected('cultuurkuur_werkingsregio_provincie_nis-01000'),
    ).toBe(true);
    expect(manager.isLabelSelected('cultuurkuur_werkingsregio_nis-21001')).toBe(
      true,
    );
  });

  test('can infer a full state from leaf states', () => {
    const manager = new CultuurkuurLabelsManager(dummyMunicipalities, [
      dummyMunicipalities[1].children[1].children[0].label,
    ]);
    expect(
      manager.isGroupFullySelected(dummyMunicipalities[1].children[1]),
    ).toBe(true);
  });
});
