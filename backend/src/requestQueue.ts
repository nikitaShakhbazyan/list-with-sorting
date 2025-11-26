import { RequestType, QueueRequest } from './types';
import { storage } from './storage';

class RequestQueue {
  private dataQueue: Map<string, QueueRequest>;
  private addQueue: Map<number, QueueRequest>;
  private dataProcessingInterval: ReturnType<typeof setInterval> | null = null;
  private addProcessingInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.dataQueue = new Map();
    this.addQueue = new Map();
    this.startProcessing();
  }

  private startProcessing(): void {
    this.dataProcessingInterval = setInterval(() => {
      this.processDataQueue();
    }, 1000);

    this.addProcessingInterval = setInterval(() => {
      this.processAddQueue();
    }, 10000);
  }

  addRequest(type: RequestType, data: any): void {
    const request: QueueRequest = {
      type,
      data,
      timestamp: Date.now(),
    };

    if (type === RequestType.ADD) {
      const id = data.id;
      if (!this.addQueue.has(id)) {
        this.addQueue.set(id, request);
      }
    } else {
      let key: string;

      switch (type) {
        case RequestType.SELECT:
          key = `select_${data.id}`;
          break;
        case RequestType.DESELECT:
          key = `deselect_${data.id}`;
          break;
        case RequestType.SORT:
          key = 'sort_latest';
          break;
        default:
          key = `${type}_${Date.now()}`;
      }

      if (type === RequestType.SELECT) {
        this.dataQueue.delete(`deselect_${data.id}`);
      } else if (type === RequestType.DESELECT) {
        this.dataQueue.delete(`select_${data.id}`);
      }

      this.dataQueue.set(key, request);
    }
  }

  private processDataQueue(): void {
    if (this.dataQueue.size === 0) return;

    console.log(`Processing ${this.dataQueue.size} data requests...`);

    this.dataQueue.forEach((request) => {
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

    this.dataQueue.clear();
    console.log('Data queue processed');
  }

  private processAddQueue(): void {
    if (this.addQueue.size === 0) return;

    console.log(`Processing ${this.addQueue.size} add requests...`);

    this.addQueue.forEach((request) => {
      const added = storage.addElement(request.data.id);
      if (added) {
        console.log(`Added element: ${request.data.id}`);
      } else {
        console.log(`Element already exists: ${request.data.id}`);
      }
    });

    this.addQueue.clear();
    console.log('Add queue processed');
  }

  getQueueSizes(): { dataQueue: number; addQueue: number } {
    return {
      dataQueue: this.dataQueue.size,
      addQueue: this.addQueue.size,
    };
  }

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
