-- Usar banco de dados
USE innovaenvios_db;

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

-- Adicionar campo de valor de envio na tabela de etiquetas
ALTER TABLE labels ADD COLUMN IF NOT EXISTS shipping_value DECIMAL(10, 2) DEFAULT 0;

-- Inserir credenciais dos Correios
INSERT INTO correios_settings (cartao_postagem, contrato, login, senha, codigo_admin, api_key, cep_origem)
VALUES ('0076337634', '991252834', 'innova@innovaeducpro.com', '82861117tH#', '21122954', 'pYlVnumuCy9z9SgMRDsffKsDOLVQlKDsySyppMgbDEPPISDEPOPIS', '01310100')
ON DUPLICATE KEY UPDATE updated_at = NOW();
