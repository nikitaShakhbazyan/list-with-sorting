import { State } from './types';

class Storage {
  private elements: Set<number>;
  private selectedIds: Set<number>;
  private sortOrder: number[];

  constructor() {
    this.elements = new Set<number>();
    for (let i = 1; i <= 1000000; i++) {
      this.elements.add(i);
    }

    this.selectedIds = new Set<number>();
    this.sortOrder = [];
  }

  getAllElements(): number[] {
    return Array.from(this.elements);
  }

  getUnselectedElements(): number[] {
    return Array.from(this.elements).filter(id => !this.selectedIds.has(id));
  }

  getSelectedElements(): number[] {
    const selected = Array.from(this.selectedIds);

    if (this.sortOrder.length === 0) {
      return selected.sort((a, b) => a - b);
    }

    const ordered = this.sortOrder.filter(id => this.selectedIds.has(id));
    const notInOrder = selected.filter(id => !this.sortOrder.includes(id));

    return [...ordered, ...notInOrder];
  }

  hasElement(id: number): boolean {
    return this.elements.has(id);
  }

  addElement(id: number): boolean {
    if (this.elements.has(id)) {
      return false;
    }
    this.elements.add(id);
    return true;
  }

  selectElement(id: number): boolean {
    if (!this.elements.has(id)) {
      return false;
    }
    if (this.selectedIds.has(id)) {
      return false;
    }
    this.selectedIds.add(id);
    this.sortOrder.push(id);
    return true;
  }

  deselectElement(id: number): boolean {
    if (!this.selectedIds.has(id)) {
      return false;
    }
    this.selectedIds.delete(id);
    this.sortOrder = this.sortOrder.filter(sortId => sortId !== id);
    return true;
  }

  updateSortOrder(newOrder: number[]): boolean {
    const validOrder = newOrder.filter(id => this.selectedIds.has(id));
    const notInNewOrder = Array.from(this.selectedIds).filter(id => !newOrder.includes(id));
    this.sortOrder = [...validOrder, ...notInNewOrder];
    return true;
  }

  getState(): State {
    return {
      selectedIds: Array.from(this.selectedIds),
      sortOrder: [...this.sortOrder],
    };
  }

  isSelected(id: number): boolean {
    return this.selectedIds.has(id);
  }
}

export const storage = new Storage();
