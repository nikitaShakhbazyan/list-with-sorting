import { State } from './types';

class Storage {
  private elements: Set<number>;
  private selectedIds: Set<number>;
  private sortOrder: number[];

  constructor() {
    // Initialize 1,000,000 elements
    this.elements = new Set<number>();
    for (let i = 1; i <= 1000000; i++) {
      this.elements.add(i);
    }

    this.selectedIds = new Set<number>();
    this.sortOrder = [];
  }

  // Get all elements
  getAllElements(): number[] {
    return Array.from(this.elements);
  }

  // Get unselected elements
  getUnselectedElements(): number[] {
    return Array.from(this.elements).filter(id => !this.selectedIds.has(id));
  }

  // Get selected elements in sort order
  getSelectedElements(): number[] {
    // Return elements in the order defined by sortOrder
    const selected = Array.from(this.selectedIds);

    // If sortOrder is empty, return selected in natural order
    if (this.sortOrder.length === 0) {
      return selected.sort((a, b) => a - b);
    }

    // Return in custom sort order
    const ordered = this.sortOrder.filter(id => this.selectedIds.has(id));

    // Add any selected items not in sortOrder (newly selected)
    const notInOrder = selected.filter(id => !this.sortOrder.includes(id));

    return [...ordered, ...notInOrder];
  }

  // Check if element exists
  hasElement(id: number): boolean {
    return this.elements.has(id);
  }

  // Add new element
  addElement(id: number): boolean {
    if (this.elements.has(id)) {
      return false; // Element already exists
    }
    this.elements.add(id);
    return true;
  }

  // Select element
  selectElement(id: number): boolean {
    if (!this.elements.has(id)) {
      return false; // Element doesn't exist
    }
    if (this.selectedIds.has(id)) {
      return false; // Already selected
    }
    this.selectedIds.add(id);

    // Add to end of sort order
    this.sortOrder.push(id);

    return true;
  }

  // Deselect element
  deselectElement(id: number): boolean {
    if (!this.selectedIds.has(id)) {
      return false; // Not selected
    }
    this.selectedIds.delete(id);

    // Remove from sort order
    this.sortOrder = this.sortOrder.filter(sortId => sortId !== id);

    return true;
  }

  // Update sort order
  updateSortOrder(newOrder: number[]): boolean {
    // Validate that all IDs in newOrder are selected
    const validOrder = newOrder.filter(id => this.selectedIds.has(id));

    // Keep any selected IDs not in the new order at the end
    const notInNewOrder = Array.from(this.selectedIds).filter(id => !newOrder.includes(id));

    this.sortOrder = [...validOrder, ...notInNewOrder];
    return true;
  }

  // Get current state
  getState(): State {
    return {
      selectedIds: Array.from(this.selectedIds),
      sortOrder: [...this.sortOrder],
    };
  }

  // Check if ID is selected
  isSelected(id: number): boolean {
    return this.selectedIds.has(id);
  }
}

export const storage = new Storage();
