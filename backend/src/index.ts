import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { storage } from './storage';
import { requestQueue } from './requestQueue';
import { RequestType, PaginationQuery } from './types';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

function paginateAndFilter(
  elements: number[],
  page: number = 1,
  limit: number = 20,
  filter?: string
): { data: number[]; total: number; page: number; totalPages: number } {
  let filtered = elements;

  if (filter) {
    const filterStr = filter.toLowerCase();
    filtered = elements.filter(id => id.toString().includes(filterStr));
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const end = start + limit;
  const data = filtered.slice(start, end);

  return { data, total, page, totalPages };
}

app.get('/api/elements', (req: Request<{}, {}, {}, PaginationQuery>, res: Response) => {
  try {
    const page = parseInt(req.query.page || '1');
    const limit = parseInt(req.query.limit || '20');
    const filter = req.query.filter;

    const unselected = storage.getUnselectedElements();
    const result = paginateAndFilter(unselected, page, limit, filter);

    res.json(result);
  } catch (error) {
    console.error('Error getting elements:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/selected', (req: Request<{}, {}, {}, PaginationQuery>, res: Response) => {
  try {
    const page = parseInt(req.query.page || '1');
    const limit = parseInt(req.query.limit || '20');
    const filter = req.query.filter;

    const selected = storage.getSelectedElements();
    const result = paginateAndFilter(selected, page, limit, filter);

    res.json(result);
  } catch (error) {
    console.error('Error getting selected elements:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/select', (req: Request, res: Response) => {
  try {
    const { id } = req.body;

    if (typeof id !== 'number') {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    if (!storage.hasElement(id)) {
      return res.status(404).json({ error: 'Element not found' });
    }

    if (storage.isSelected(id)) {
      return res.status(400).json({ error: 'Element already selected' });
    }

    requestQueue.addRequest(RequestType.SELECT, { id });

    res.json({ success: true, message: 'Request queued' });
  } catch (error) {
    console.error('Error selecting element:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/deselect', (req: Request, res: Response) => {
  try {
    const { id } = req.body;

    if (typeof id !== 'number') {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    if (!storage.isSelected(id)) {
      return res.status(400).json({ error: 'Element not selected' });
    }

    requestQueue.addRequest(RequestType.DESELECT, { id });

    res.json({ success: true, message: 'Request queued' });
  } catch (error) {
    console.error('Error deselecting element:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/sort', (req: Request, res: Response) => {
  try {
    const { order } = req.body;

    if (!Array.isArray(order)) {
      return res.status(400).json({ error: 'Order must be an array' });
    }

    requestQueue.addRequest(RequestType.SORT, { order });

    res.json({ success: true, message: 'Request queued' });
  } catch (error) {
    console.error('Error updating sort order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/add', (req: Request, res: Response) => {
  try {
    const { id } = req.body;

    if (typeof id !== 'number') {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    if (storage.hasElement(id)) {
      return res.status(400).json({ error: 'Element already exists' });
    }

    requestQueue.addRequest(RequestType.ADD, { id });

    res.json({ success: true, message: 'Request queued (will be processed within 10s)' });
  } catch (error) {
    console.error('Error adding element:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/state', (req: Request, res: Response) => {
  try {
    const state = storage.getState();
    res.json(state);
  } catch (error) {
    console.error('Error getting state:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/queue-status', (req: Request, res: Response) => {
  try {
    const sizes = requestQueue.getQueueSizes();
    res.json(sizes);
  } catch (error) {
    console.error('Error getting queue status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Total elements: ${storage.getAllElements().length}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  requestQueue.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  requestQueue.stop();
  process.exit(0);
});
