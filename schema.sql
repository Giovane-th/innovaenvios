-- Schema para In'Nova Envios - App Interno de Gestão de Envios

-- Tabela de Usuários (Funcionários)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'employee', -- 'admin' ou 'employee'
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Clientes
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  cpf_cnpj VARCHAR(20) UNIQUE,
  address VARCHAR(255),
  address_number VARCHAR(20),
  complement VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(2),
  postal_code VARCHAR(10),
  country VARCHAR(100) DEFAULT 'Brasil',
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Envios
CREATE TABLE IF NOT EXISTS shipments (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id),
  tracking_number VARCHAR(50) UNIQUE,
  service_type VARCHAR(50), -- 'PAC', 'SEDEX', etc
  weight DECIMAL(10, 2),
  height DECIMAL(10, 2),
  width DECIMAL(10, 2),
  depth DECIMAL(10, 2),
  declared_value DECIMAL(10, 2),
  recipient_name VARCHAR(255),
  recipient_address VARCHAR(255),
  recipient_address_number VARCHAR(20),
  recipient_complement VARCHAR(255),
  recipient_city VARCHAR(100),
  recipient_state VARCHAR(2),
  recipient_postal_code VARCHAR(10),
  recipient_phone VARCHAR(20),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'posted', 'in_transit', 'delivered', 'returned'
  label_url VARCHAR(500),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Rastreamento
CREATE TABLE IF NOT EXISTS tracking_history (
  id SERIAL PRIMARY KEY,
  shipment_id INTEGER REFERENCES shipments(id),
  status VARCHAR(50),
  location VARCHAR(255),
  description TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_customers_cpf_cnpj ON customers(cpf_cnpj);
CREATE INDEX IF NOT EXISTS idx_shipments_tracking ON shipments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_shipments_customer ON shipments(customer_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_tracking_shipment ON tracking_history(shipment_id);
