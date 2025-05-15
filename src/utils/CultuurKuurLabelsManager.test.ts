import { CultuurkuurLabelsManager } from '@/utils/CultuurkuurLabelsManager';
import { dummyMunicipalities } from '@/hooks/api/cultuurkuur';

describe('CultururKuurLabelsManager', () => {
  test('can toggle a label', () => {
    const manager = new CultuurkuurLabelsManager(dummyMunicipalities);
    expect(manager.isLabelSelected('nis-21001')).toBe(false);
    manager.handleSelectionToggle(
      dummyMunicipalities[0].children[0].children[0],
    );
    expect(manager.isLabelSelected('nis-21001')).toBe(true);
  });

  test('can toggle a level', () => {
    const manager = new CultuurkuurLabelsManager(dummyMunicipalities);
    expect(manager.isLabelSelected('nis-21001')).toBe(false);
    manager.handleSelectionToggle(dummyMunicipalities[0]);
    expect(manager.isGroupFullySelected(dummyMunicipalities[0])).toBe(true);
    expect(manager.isLabelSelected('nis-01000')).toBe(true);
    expect(manager.isLabelSelected('nis-21001')).toBe(true);

    manager.handleSelectionToggle(
      dummyMunicipalities[0].children[0].children[0],
    );
    expect(manager.isLabelSelected('nis-21001')).toBe(false);
    expect(manager.isGroupFullySelected(dummyMunicipalities[0])).toBe(false);
    expect(manager.isLabelSelected('nis-01000')).toBe(true);
  });
});
