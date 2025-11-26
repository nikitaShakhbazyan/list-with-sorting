export interface PaginatedResponse {
  data: number[];
  total: number;
  page: number;
  totalPages: number;
}

export interface State {
  selectedIds: number[];
  sortOrder: number[];
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}
