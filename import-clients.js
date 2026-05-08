const fs = require('fs');
const path = require('path');

// Import drizzle and schema
const { drizzle } = require('drizzle-orm/mysql2');
const { clients } = require('./drizzle/schema');
const { eq } = require('drizzle-orm');

async function importClients() {
  try {
    // Read JSON file
    const jsonPath = path.join(__dirname, 'public/clients-import.json');
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    
    console.log(`📥 Importando ${data.length} clientes...`);
    
    // Get database URL
    let dbUrl = process.env.DATABASE_URL;
    if (!dbUrl && process.env.DB_HOST) {
      const host = process.env.DB_HOST || 'localhost';
      const port = process.env.DB_PORT || '3306';
      const user = process.env.DB_USER || 'root';
      const password = process.env.DB_PASSWORD || '';
      const database = process.env.DB_NAME || 'innovaenvios';
      dbUrl = `mysql://${user}${password ? ':' + password : ''}@${host}:${port}/${database}`;
    }
    
    if (!dbUrl) {
      throw new Error('No database URL provided');
    }
    
    const db = drizzle(dbUrl);
    
    // Clear existing clients
    console.log('🗑️  Limpando clientes antigos...');
    await db.delete(clients);
    
    // Insert clients in batches
    const batchSize = 100;
    let imported = 0;
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      
      const clientsToInsert = batch.map(item => ({
        nome: item.nome || '',
        email: item.email || null,
        cpf_cnpj: item.cnpj || item.cpf || null,
        telefone: item.telefone || null,
        celular: item.celular || null,
        endereco: item.endereco || item.ENDERECO || null,
        numero: item.numero || item.NUMERO || null,
        complemento: item.complemento || item.COMPLEMENTO || null,
        cidade: item.cidade || item.CIDADE || null,
        uf: item.uf || item.UF || null,
        bairro: item.bairro || item.BAIRRO || null,
        cep: item.cep || item.CEP || null,
        ponto_referencia: item.ponto_referencia || null,
      }));
      
      await db.insert(clients).values(clientsToInsert);
      imported += batch.length;
      console.log(`✅ ${imported}/${data.length} clientes importados...`);
    }
    
    console.log(`\n✅ Importação concluída! ${imported} clientes no banco.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro na importação:', error);
    process.exit(1);
  }
}

importClients();
