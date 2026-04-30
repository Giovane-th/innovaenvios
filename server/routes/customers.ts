import express from 'express';
import { db } from '../db';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Listar todos os clientes
router.get('/', authenticate, async (req, res) => {
  try {
    const customers = await db.query(
      'SELECT * FROM customers ORDER BY created_at DESC'
    );
    res.json(customers.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar clientes' });
  }
});

// Obter cliente por ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const customer = await db.query(
      'SELECT * FROM customers WHERE id = $1',
      [req.params.id]
    );
    if (customer.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    res.json(customer.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar cliente' });
  }
});

// Criar cliente
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      cpf_cnpj,
      address,
      address_number,
      complement,
      city,
      state,
      postal_code,
    } = req.body;

    const result = await db.query(
      `INSERT INTO customers 
       (name, email, phone, cpf_cnpj, address, address_number, complement, city, state, postal_code, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        name,
        email,
        phone,
        cpf_cnpj,
        address,
        address_number,
        complement,
        city,
        state,
        postal_code,
        req.user.id,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'CPF/CNPJ já cadastrado' });
    }
    res.status(500).json({ error: 'Erro ao criar cliente' });
  }
});

// Atualizar cliente
router.put('/:id', authenticate, async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      cpf_cnpj,
      address,
      address_number,
      complement,
      city,
      state,
      postal_code,
    } = req.body;

    const result = await db.query(
      `UPDATE customers 
       SET name = $1, email = $2, phone = $3, cpf_cnpj = $4, address = $5, 
           address_number = $6, complement = $7, city = $8, state = $9, postal_code = $10,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $11
       RETURNING *`,
      [
        name,
        email,
        phone,
        cpf_cnpj,
        address,
        address_number,
        complement,
        city,
        state,
        postal_code,
        req.params.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar cliente' });
  }
});

// Deletar cliente
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM customers WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json({ message: 'Cliente deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar cliente' });
  }
});

// Importar clientes (CSV)
router.post('/import/csv', authenticate, async (req, res) => {
  try {
    const { customers } = req.body;

    if (!Array.isArray(customers)) {
      return res.status(400).json({ error: 'Formato inválido' });
    }

    const inserted = [];

    for (const customer of customers) {
      try {
        const result = await db.query(
          `INSERT INTO customers 
           (name, email, phone, cpf_cnpj, address, address_number, complement, city, state, postal_code, created_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           RETURNING *`,
          [
            customer.name,
            customer.email,
            customer.phone,
            customer.cpf_cnpj,
            customer.address,
            customer.address_number,
            customer.complement,
            customer.city,
            customer.state,
            customer.postal_code,
            req.user.id,
          ]
        );
        inserted.push(result.rows[0]);
      } catch (error) {
        // Ignorar duplicatas
      }
    }

    res.json({
      message: `${inserted.length} clientes importados com sucesso`,
      customers: inserted,
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao importar clientes' });
  }
});

export default router;
