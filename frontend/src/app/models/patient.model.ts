export interface Patient {
  id: string;
  nome: string;
  documento: string;
  dataNascimento: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
