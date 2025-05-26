import {
  dummyEducationLevels,
  dummyMunicipalities,
} from '@/hooks/api/cultuurkuur';
import { CultuurkuurLabelsManager } from '@/utils/CultuurkuurLabelsManager';

describe('CultururKuurLabelsManager', () => {
  test('can toggle a label', () => {
    const manager = new CultuurkuurLabelsManager(dummyMunicipalities);
    expect(manager.isLabelSelected('cultuurkuur_werkingsregio_nis-21001')).toBe(
      false,
    );
    manager.toggle(dummyMunicipalities[0].children[0].children[0]);
    expect(manager.isLabelSelected('cultuurkuur_werkingsregio_nis-21001')).toBe(
      true,
    );
  });

  test('can toggle a level', () => {
    const manager = new CultuurkuurLabelsManager(dummyMunicipalities);
    expect(
      manager.isLabelSelected(
        dummyMunicipalities[0].children[0].children[0].label,
      ),
    ).toBe(false);
    manager.toggle(dummyMunicipalities[0]);
    expect(manager.getSelected()).toEqual([dummyMunicipalities[0].label]);
    expect(
      manager.isLabelSelected(
        dummyMunicipalities[0].children[0].children[0].label,
      ),
    ).toBe(true);
    manager.toggle(dummyMunicipalities[0]);
    expect(
      manager.isLabelSelected(
        dummyMunicipalities[0].children[0].children[0].label,
      ),
    ).toBe(false);
  });

  test('can test if group is fully selected', () => {
    const manager = new CultuurkuurLabelsManager(dummyMunicipalities);
    manager.toggle(dummyMunicipalities[0]);
    expect(manager.isGroupFullySelected(dummyMunicipalities[0])).toBe(true);
    expect(
      manager.isGroupFullySelected(dummyMunicipalities[0].children[0]),
    ).toBe(true);
    expect(
      manager.isLabelSelected('cultuurkuur_werkingsregio_provincie_nis-01000'),
    ).toBe(true);

    manager.toggle(dummyMunicipalities[0].children[0].children[0]);
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
    expect(manager.getSelected()).toEqual([dummyMunicipalities[0].label]);
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

  test('can keep unknown labels around', () => {
    const manager = new CultuurkuurLabelsManager(dummyMunicipalities, [
      dummyMunicipalities[1].children[1].children[0].label,
      dummyMunicipalities[1].children[0].children[1].label,
      'foobar',
    ]);

    expect(manager.getSelected()).toEqual(
      [
        dummyMunicipalities[1].extraLabel,
        dummyMunicipalities[1].children[1].children[0].label,
        dummyMunicipalities[1].children[0].children[1].label,
      ].sort(),
    );

    manager.toggle(dummyMunicipalities[1].children[1].children[0]);
    manager.toggle(dummyMunicipalities[1].children[0].children[0]);

    expect(manager.getSelected()).toEqual(
      [
        dummyMunicipalities[1].extraLabel,
        dummyMunicipalities[1].children[0].children[0].label,
        dummyMunicipalities[1].children[0].children[1].label,
        'foobar',
      ].sort(),
    );
  });

  test('can send extra labels when present', () => {
    const manager = new CultuurkuurLabelsManager(dummyMunicipalities);

    manager.toggle(dummyMunicipalities[0].children[0].children[0]);

    expect(manager.getSelected()).toEqual([
      dummyMunicipalities[0].extraLabel,
      dummyMunicipalities[0].children[0].children[0].label,
    ]);
  });

  test('can get full chain of parent labels', () => {
    let manager = new CultuurkuurLabelsManager(dummyEducationLevels);
    manager.toggle(dummyEducationLevels[0].children[0].children[0]);

    expect(manager.getSelected()).toEqual([
      dummyEducationLevels[0].label,
      dummyEducationLevels[0].children[0].label,
      dummyEducationLevels[0].children[0].children[0].label,
    ]);

    manager = new CultuurkuurLabelsManager(dummyEducationLevels);
    manager.toggle(dummyEducationLevels[0]);

    expect(manager.selected).toEqual(
      [
        dummyEducationLevels[0].label,
        dummyEducationLevels[0].children[0].label,
        dummyEducationLevels[0].children[0].children[0].label,
        dummyEducationLevels[0].children[0].children[1].label,
        dummyEducationLevels[0].children[0].children[2].label,
        dummyEducationLevels[0].children[1].label,
        dummyEducationLevels[0].children[1].children[0].label,
        dummyEducationLevels[0].children[1].children[1].label,
        dummyEducationLevels[0].children[1].children[2].label,
        dummyEducationLevels[0].children[2].label,
      ].sort(),
    );
  });

  test('ignores parents when using partial toggling', () => {
    let manager = new CultuurkuurLabelsManager(dummyEducationLevels);
    manager.toggle(dummyEducationLevels[0].children[1].children[1]);

    expect(
      manager.isLabelSelected(dummyEducationLevels[0].children[2].label),
    ).toBe(false);
    expect(
      manager.isLabelSelected(
        dummyEducationLevels[0].children[0].children[0].label,
      ),
    ).toBe(false);

    manager.toggle(dummyEducationLevels[0].children[2]);
    expect(
      manager.isLabelSelected(dummyEducationLevels[0].children[2].label),
    ).toBe(true);
  });
});
