import { useCallback } from 'react';
import { Client } from './use-clients';

export interface LabelData {
  code: string;
  recipient: string;
  email: string;
  phone: string;
  address: string;
  number: string;
  complement: string;
  city: string;
  state: string;
  neighborhood: string;
  zipcode: string;
  reference_point: string;
  status: 'Gerada' | 'Postada' | 'Em trânsito' | 'Entregue';
  date: string;
  created_by: string;
  client_id?: string;
}

export function useLabelClientIntegration() {
  // Converter cliente para dados de etiqueta
  const clientToLabel = useCallback((client: Client, employeeId: string): Partial<LabelData> => {
    return {
      recipient: client.nome,
      email: client.email,
      phone: client.celular || client.telefone,
      address: client.endereco,
      number: client.numero,
      complement: client.complemento,
      city: client.cidade,
      state: client.uf,
      neighborhood: client.bairro,
      zipcode: client.cep,
      reference_point: client.ponto_referencia,
      client_id: client.id,
      created_by: employeeId,
    };
  }, []);

  // Validar dados de etiqueta
  const validateLabel = useCallback((label: Partial<LabelData>): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!label.recipient?.trim()) errors.push('Destinatário é obrigatório');
    if (!label.address?.trim()) errors.push('Endereço é obrigatório');
    if (!label.number?.trim()) errors.push('Número é obrigatório');
    if (!label.city?.trim()) errors.push('Cidade é obrigatória');
    if (!label.state?.trim()) errors.push('Estado é obrigatório');
    if (!label.zipcode?.trim()) errors.push('CEP é obrigatório');

    return {
      valid: errors.length === 0,
      errors,
    };
  }, []);

  // Formatar dados para exibição
  const formatLabelForDisplay = useCallback((label: LabelData) => {
    return {
      ...label,
      fullAddress: `${label.address}, ${label.number}${label.complement ? ` - ${label.complement}` : ''} - ${label.neighborhood} - ${label.city}, ${label.state} ${label.zipcode}`,
    };
  }, []);

  return {
    clientToLabel,
    validateLabel,
    formatLabelForDisplay,
  };
}
