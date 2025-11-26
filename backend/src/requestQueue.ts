import { RequestType, QueueRequest } from './types';
import { storage } from './storage';

class RequestQueue {
  private dataQueue: Map<string, QueueRequest>; // For SELECT, DESELECT, SORT (1 second batching)
  private addQueue: Map<number, QueueRequest>; // For ADD (10 seconds batching)

  private dataProcessingInterval: ReturnType<typeof setInterval> | null = null;
  private addProcessingInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.dataQueue = new Map();
    this.addQueue = new Map();
    this.startProcessing();
  }

  // Start batch processing intervals
  private startProcessing(): void {
    // Process data requests (SELECT, DESELECT, SORT) every 1 second
    this.dataProcessingInterval = setInterval(() => {
      this.processDataQueue();
    }, 1000);

    // Process add requests every 10 seconds
    this.addProcessingInterval = setInterval(() => {
      this.processAddQueue();
    }, 10000);
  }

  // Add request to appropriate queue with deduplication
  addRequest(type: RequestType, data: any): void {
    const request: QueueRequest = {
      type,
      data,
      timestamp: Date.now(),
    };

    if (type === RequestType.ADD) {
      // For ADD, use element ID as key for deduplication
      const id = data.id;
      if (!this.addQueue.has(id)) {
        this.addQueue.set(id, request);
      }
    } else {
      // For other operations, use a composite key for deduplication
      let key: string;

      switch (type) {
        case RequestType.SELECT:
          key = `select_${data.id}`;
          break;
        case RequestType.DESELECT:
          key = `deselect_${data.id}`;
          break;
        case RequestType.SORT:
          // For sort, use a single key as we only need the latest sort order
          key = 'sort_latest';
          break;
        default:
          key = `${type}_${Date.now()}`;
      }

      // Remove conflicting operations (e.g., if selecting then deselecting, keep only deselect)
      if (type === RequestType.SELECT) {
        this.dataQueue.delete(`deselect_${data.id}`);
      } else if (type === RequestType.DESELECT) {
        this.dataQueue.delete(`select_${data.id}`);
      }

      this.dataQueue.set(key, request);
    }
  }

  // Process data queue (SELECT, DESELECT, SORT)
  private processDataQueue(): void {
    if (this.dataQueue.size === 0) return;

    console.log(`Processing ${this.dataQueue.size} data requests...`);

    // Process all requests in queue
    this.dataQueue.forEach((request, key) => {
      switch (request.type) {
        case RequestType.SELECT:
          storage.selectElement(request.data.id);
          break;
        case RequestType.DESELECT:
          storage.deselectElement(request.data.id);
          break;
        case RequestType.SORT:
          storage.updateSortOrder(request.data.order);
          break;
      }
    });

    // Clear the queue
    this.dataQueue.clear();
    console.log('Data queue processed');
  }

  // Process add queue
  private processAddQueue(): void {
    if (this.addQueue.size === 0) return;

    console.log(`Processing ${this.addQueue.size} add requests...`);

    // Process all add requests
    this.addQueue.forEach((request) => {
      const added = storage.addElement(request.data.id);
      if (added) {
        console.log(`Added element: ${request.data.id}`);
      } else {
        console.log(`Element already exists: ${request.data.id}`);
      }
    });

    // Clear the queue
    this.addQueue.clear();
    console.log('Add queue processed');
  }

  // Get queue sizes (for monitoring)
  getQueueSizes(): { dataQueue: number; addQueue: number } {
    return {
      dataQueue: this.dataQueue.size,
      addQueue: this.addQueue.size,
    };
  }

  // Stop processing (for cleanup)
  stop(): void {
    if (this.dataProcessingInterval) {
      clearInterval(this.dataProcessingInterval);
    }
    if (this.addProcessingInterval) {
      clearInterval(this.addProcessingInterval);
    }
  }
}

export const requestQueue = new RequestQueue();
