const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Pool de conexões MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'innovaenvios_user',
  password: process.env.DB_PASSWORD || 'D54sbCnRKDX98w#',
  database: process.env.DB_NAME || 'innovaenvios_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ========== CLIENTES ==========

// GET todos os clientes
app.get('/api/clients', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM clients ORDER BY name ASC');
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET cliente por ID
app.get('/api/clients/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM clients WHERE id = ?', [req.params.id]);
    connection.release();
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST novo cliente
app.post('/api/clients', async (req, res) => {
  const { name, email, cnpj, phone, address, cep } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ error: 'Nome e email são obrigatórios' });
  }
  
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO clients (name, email, cnpj, phone, address, cep, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [name, email, cnpj, phone, address, cep]
    );
    connection.release();
    
    res.status(201).json({
      id: result.insertId,
      name,
      email,
      cnpj,
      phone,
      address,
      cep,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT atualizar cliente
app.put('/api/clients/:id', async (req, res) => {
  const { name, email, cnpj, phone, address, cep } = req.body;
  
  try {
    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE clients SET name = ?, email = ?, cnpj = ?, phone = ?, address = ?, cep = ?, updated_at = NOW() WHERE id = ?',
      [name, email, cnpj, phone, address, cep, req.params.id]
    );
    connection.release();
    
    res.json({ message: 'Cliente atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE cliente
app.delete('/api/clients/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM clients WHERE id = ?', [req.params.id]);
    connection.release();
    
    res.json({ message: 'Cliente deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== FUNCIONÁRIOS ==========

// GET todos os funcionários
app.get('/api/employees', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM employees ORDER BY name ASC');
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar funcionários:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST novo funcionário
app.post('/api/employees', async (req, res) => {
  const { name, email, phone, role, cpf, admission_date, salary, status } = req.body;
  
  if (!name || !email || !cpf) {
    return res.status(400).json({ error: 'Nome, email e CPF são obrigatórios' });
  }
  
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO employees (name, email, phone, role, cpf, admission_date, salary, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [name, email, phone, role, cpf, admission_date, salary, status || 'ativo']
    );
    connection.release();
    
    res.status(201).json({
      id: result.insertId,
      name,
      email,
      phone,
      role,
      cpf,
      admission_date,
      salary,
      status: status || 'ativo',
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao criar funcionário:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT atualizar funcionário
app.put('/api/employees/:id', async (req, res) => {
  const { name, email, phone, role, cpf, admission_date, salary, status } = req.body;
  
  try {
    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE employees SET name = ?, email = ?, phone = ?, role = ?, cpf = ?, admission_date = ?, salary = ?, status = ?, updated_at = NOW() WHERE id = ?',
      [name, email, phone, role, cpf, admission_date, salary, status, req.params.id]
    );
    connection.release();
    
    res.json({ message: 'Funcionário atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar funcionário:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE funcionário
app.delete('/api/employees/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM employees WHERE id = ?', [req.params.id]);
    connection.release();
    
    res.json({ message: 'Funcionário deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar funcionário:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== ETIQUETAS ==========

// GET todas as etiquetas
app.get('/api/labels', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM labels ORDER BY created_at DESC');
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar etiquetas:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST nova etiqueta
app.post('/api/labels', async (req, res) => {
  const {
    client_id,
    tracking_code,
    weight,
    service,
    description,
    object_type,
    declared_value,
    height,
    width,
    depth,
    diameter,
    observations
  } = req.body;
  
  if (!client_id || !tracking_code) {
    return res.status(400).json({ error: 'Client ID e tracking code são obrigatórios' });
  }
  
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      `INSERT INTO labels (client_id, tracking_code, weight, service, description, object_type, declared_value, height, width, depth, diameter, observations, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [client_id, tracking_code, weight, service, description, object_type, declared_value, height, width, depth, diameter, observations]
    );
    connection.release();
    
    res.status(201).json({
      id: result.insertId,
      client_id,
      tracking_code,
      weight,
      service,
      description,
      object_type,
      declared_value,
      height,
      width,
      depth,
      diameter,
      observations,
      status: 'pending',
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao criar etiqueta:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT atualizar etiqueta
app.put('/api/labels/:id', async (req, res) => {
  const { status } = req.body;
  
  try {
    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE labels SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, req.params.id]
    );
    connection.release();
    
    res.json({ message: 'Etiqueta atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar etiqueta:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== CORREIOS ==========

// POST calcular frete com Correios
app.post('/api/correios/calculate-shipping', async (req, res) => {
  const { cepOrigem, cepDestino, peso, altura, largura, comprimento, servico } = req.body;
  
  if (!cepOrigem || !cepDestino || !peso || !servico) {
    return res.status(400).json({ error: 'CEP origem, CEP destino, peso e serviço são obrigatórios' });
  }
  
  try {
    // Tabela de preços simulada (em produção, usar API real dos Correios)
    const precos = {
      '04162': { basePrice: 25.00, perKg: 8.50, minPrice: 25.00 }, // SEDEX
      '04014': { basePrice: 15.00, perKg: 5.00, minPrice: 15.00 }  // PAC
    };
    
    const priceTable = precos[servico];
    if (!priceTable) {
      return res.status(400).json({ error: 'Serviço não encontrado' });
    }
    
    let price = priceTable.basePrice + (peso * priceTable.perKg);
    price = Math.max(price, priceTable.minPrice);
    
    res.json({
      cepOrigem,
      cepDestino,
      peso,
      servico,
      valor: parseFloat(price.toFixed(2)),
      prazo: servico === '04162' ? '1-2 dias' : '4-7 dias',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao calcular frete:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET salvar credenciais dos Correios
app.post('/api/correios/settings', async (req, res) => {
  const {
    cartaoPostagem,
    contrato,
    login,
    senha,
    codigoAdmin,
    apiKey,
    cepOrigem
  } = req.body;
  
  try {
    const connection = await pool.getConnection();
    
    // Verificar se já existe
    const [existing] = await connection.query('SELECT * FROM correios_settings LIMIT 1');
    
    if (existing.length > 0) {
      await connection.query(
        `UPDATE correios_settings SET 
          cartao_postagem = ?, 
          contrato = ?, 
          login = ?, 
          senha = ?, 
          codigo_admin = ?, 
          api_key = ?, 
          cep_origem = ?,
          updated_at = NOW() 
        WHERE id = 1`,
        [cartaoPostagem, contrato, login, senha, codigoAdmin, apiKey, cepOrigem]
      );
    } else {
      await connection.query(
        `INSERT INTO correios_settings 
          (cartao_postagem, contrato, login, senha, codigo_admin, api_key, cep_origem, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [cartaoPostagem, contrato, login, senha, codigoAdmin, apiKey, cepOrigem]
      );
    }
    
    connection.release();
    
    res.json({ message: 'Credenciais dos Correios salvas com sucesso' });
  } catch (error) {
    console.error('Erro ao salvar credenciais:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET credenciais dos Correios
app.get('/api/correios/settings', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM correios_settings LIMIT 1');
    connection.release();
    
    if (rows.length === 0) {
      return res.json({ message: 'Nenhuma configuração encontrada' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar credenciais:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== ESTATÍSTICAS ==========
// GET dashboard statss
app.get('/api/stats', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [clientsCount] = await connection.query('SELECT COUNT(*) as count FROM clients');
    const [employeesCount] = await connection.query('SELECT COUNT(*) as count FROM employees');
    const [labelsCount] = await connection.query('SELECT COUNT(*) as count FROM labels WHERE DATE(created_at) = CURDATE()');
    const [totalRevenue] = await connection.query('SELECT SUM(declared_value) as total FROM labels WHERE DATE(created_at) = CURDATE()');
    
    connection.release();
    
    res.json({
      clients: clientsCount[0].count,
      employees: employeesCount[0].count,
      labels_today: labelsCount[0].count,
      revenue_today: totalRevenue[0].total || 0
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: error.message });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
  console.log(`📊 Banco de dados: ${process.env.DB_NAME}`);
  console.log(`🔌 Porta MySQL: ${process.env.DB_PORT}`);
});
