import { useCallback } from 'react';
import { Client } from './use-clients';

export function useClientReport() {
  // Gerar relatório em CSV
  const generateCSVReport = useCallback((clients: Client[], title: string = 'Relatório de Clientes') => {
    const headers = [
      'Nome',
      'Email',
      'CPF/CNPJ',
      'Telefone',
      'Celular',
      'Endereço',
      'Número',
      'Complemento',
      'Bairro',
      'CEP',
      'Cidade',
      'Estado',
      'Ponto de Referência',
      'Data de Cadastro',
    ];

    const rows = clients.map((client) => [
      client.nome,
      client.email,
      client.cpf_cnpj,
      client.telefone,
      client.celular,
      client.endereco,
      client.numero,
      client.complemento,
      client.bairro,
      client.cep,
      client.cidade,
      client.uf,
      client.ponto_referencia || '',
      new Date(client.createdAt).toLocaleDateString('pt-BR'),
    ]);

    // Construir CSV
    const csv = [
      [title],
      [`Gerado em: ${new Date().toLocaleString('pt-BR')}`],
      [`Total de clientes: ${clients.length}`],
      [],
      headers,
      ...rows,
    ]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    return csv;
  }, []);

  // Gerar relatório por estado
  const generateStateReport = useCallback((clients: Client[]) => {
    const byState: Record<string, Client[]> = {};

    clients.forEach((client) => {
      if (!byState[client.uf]) {
        byState[client.uf] = [];
      }
      byState[client.uf].push(client);
    });

    return byState;
  }, []);

  // Gerar relatório por cidade
  const generateCityReport = useCallback((clients: Client[]) => {
    const byCity: Record<string, Client[]> = {};

    clients.forEach((client) => {
      const key = `${client.cidade}, ${client.uf}`;
      if (!byCity[key]) {
        byCity[key] = [];
      }
      byCity[key].push(client);
    });

    return byCity;
  }, []);

  // Gerar relatório em formato HTML para impressão
  const generateHTMLReport = useCallback(
    (clients: Client[], title: string = 'Relatório de Clientes') => {
      const stateReport = generateStateReport(clients);

      let html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            h1 {
              text-align: center;
              color: #0a7ea4;
              margin-bottom: 10px;
            }
            .info {
              text-align: center;
              color: #666;
              margin-bottom: 20px;
              font-size: 12px;
            }
            h2 {
              color: #0a7ea4;
              border-bottom: 2px solid #0a7ea4;
              padding-bottom: 10px;
              margin-top: 30px;
              margin-bottom: 15px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th {
              background-color: #0a7ea4;
              color: white;
              padding: 10px;
              text-align: left;
              font-weight: bold;
            }
            td {
              padding: 8px;
              border-bottom: 1px solid #ddd;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .summary {
              background-color: #f0f0f0;
              padding: 10px;
              border-radius: 5px;
              margin-bottom: 20px;
            }
            .page-break {
              page-break-after: always;
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <div class="info">
            <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
            <p>Total de clientes: ${clients.length}</p>
          </div>
      `;

      // Adicionar relatório por estado
      Object.entries(stateReport).forEach(([state, stateClients]) => {
        html += `
          <h2>Estado: ${state} (${stateClients.length} clientes)</h2>
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>CPF/CNPJ</th>
                <th>Telefone</th>
                <th>Cidade</th>
                <th>Endereço</th>
              </tr>
            </thead>
            <tbody>
        `;

        stateClients.forEach((client) => {
          html += `
            <tr>
              <td>${client.nome}</td>
              <td>${client.cpf_cnpj}</td>
              <td>${client.telefone || client.celular}</td>
              <td>${client.cidade}</td>
              <td>${client.endereco}, ${client.numero}</td>
            </tr>
          `;
        });

        html += `
            </tbody>
          </table>
        `;
      });

      html += `
        </body>
        </html>
      `;

      return html;
    },
    [generateStateReport]
  );

  return {
    generateCSVReport,
    generateStateReport,
    generateCityReport,
    generateHTMLReport,
  };
}
