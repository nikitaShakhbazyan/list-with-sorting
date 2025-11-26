export interface Element {
  id: number;
}

export interface State {
  selectedIds: number[];
  sortOrder: number[];
}

export enum RequestType {
  SELECT = 'SELECT',
  DESELECT = 'DESELECT',
  SORT = 'SORT',
  ADD = 'ADD',
}

export interface QueueRequest {
  type: RequestType;
  data: any;
  timestamp: number;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  filter?: string;
}
