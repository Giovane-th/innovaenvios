/**
 * Tipo para dados de alunos/clientes importados
 */
export interface Student {
  id: string; // UUID gerado localmente
  nome: string;
  email?: string;
  telefone?: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}

export interface StudentImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export interface StudentSearchResult {
  students: Student[];
  total: number;
}
