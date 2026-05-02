-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS innovaenvios_db;
USE innovaenvios_db;

-- Tabela de Clientes
CREATE TABLE IF NOT EXISTS clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  cnpj VARCHAR(20),
  phone VARCHAR(20),
  address TEXT,
  cep VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Funcionários
CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(50),
  cpf VARCHAR(20) UNIQUE NOT NULL,
  admission_date DATE,
  salary DECIMAL(10, 2),
  status ENUM('ativo', 'inativo', 'ferias', 'licenca') DEFAULT 'ativo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name),
  INDEX idx_cpf (cpf),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Etiquetas
CREATE TABLE IF NOT EXISTS labels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  tracking_code VARCHAR(50) UNIQUE NOT NULL,
  weight DECIMAL(8, 2),
  service VARCHAR(100),
  description TEXT,
  object_type VARCHAR(100),
  declared_value DECIMAL(10, 2),
  height DECIMAL(8, 2),
  width DECIMAL(8, 2),
  depth DECIMAL(8, 2),
  diameter DECIMAL(8, 2),
  observations TEXT,
  status ENUM('pending', 'printed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  INDEX idx_tracking_code (tracking_code),
  INDEX idx_client_id (client_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Configurações
CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  key_name VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_key_name (key_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Credenciais dos Correios
CREATE TABLE IF NOT EXISTS correios_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cartao_postagem VARCHAR(50),
  contrato VARCHAR(50),
  login VARCHAR(255),
  senha VARCHAR(255),
  codigo_admin VARCHAR(50),
  api_key VARCHAR(255),
  cep_origem VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Criar usuário do banco de dados (se não existir)
CREATE USER IF NOT EXISTS 'innovaenvios_user'@'localhost' IDENTIFIED BY 'D54sbCnRKDX98w#';
GRANT ALL PRIVILEGES ON innovaenvios_db.* TO 'innovaenvios_user'@'localhost';
FLUSH PRIVILEGES;
