#!/usr/bin/env python3
import pandas as pd
import mysql.connector
import json
import sys
from datetime import datetime

# Configuração do banco de dados
DB_CONFIG = {
    'host': 'localhost',
    'user': 'innovaenvios_user',
    'password': 'D54sbCnRKDX98w#',
    'database': 'innovaenvios_db'
}

def import_clients():
    """Importar clientes do arquivo XLS para o banco de dados"""
    
    try:
        # Ler arquivo XLS
        print("📖 Lendo arquivo XLS...")
        df = pd.read_excel('/home/ubuntu/upload/clientesBkp18619-260429144041.xls')
        
        print(f"✅ Total de clientes: {len(df)}")
        print(f"✅ Colunas: {list(df.columns)}")
        
        # Conectar ao banco de dados
        print("\n🔌 Conectando ao banco de dados...")
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # Limpar tabela de clientes (opcional)
        # cursor.execute("DELETE FROM clients")
        # conn.commit()
        
        # Importar clientes
        print("\n📤 Importando clientes...")
        inserted = 0
        skipped = 0
        errors = []
        
        for idx, row in df.iterrows():
            try:
                # Preparar dados
                name = str(row.get('nome', '')).strip()
                email = str(row.get('email', '')).strip() if pd.notna(row.get('email')) else None
                cnpj = str(row.get('cnpj', '')).strip() if pd.notna(row.get('cnpj')) else None
                phone = str(row.get('telefone', '')).strip() if pd.notna(row.get('telefone')) else None
                celular = str(row.get('celular', '')).strip() if pd.notna(row.get('celular')) else None
                endereco = str(row.get('endereco', '')).strip() if pd.notna(row.get('endereco')) else None
                numero = str(row.get('numero', '')).strip() if pd.notna(row.get('numero')) else None
                complemento = str(row.get('complemento', '')).strip() if pd.notna(row.get('complemento')) else None
                cidade = str(row.get('Cidade', '')).strip() if pd.notna(row.get('Cidade')) else None
                uf = str(row.get('UF', '')).strip() if pd.notna(row.get('UF')) else None
                bairro = str(row.get('BAIRRO', '')).strip() if pd.notna(row.get('BAIRRO')) else None
                cep = str(row.get('cep', '')).strip() if pd.notna(row.get('cep')) else None
                ie = str(row.get('ie', '')).strip() if pd.notna(row.get('ie')) else None
                
                # Validar dados obrigatórios
                if not name:
                    skipped += 1
                    continue
                
                # Se não tiver email, usar um genérico
                if not email or email == 'nan':
                    email = f"cliente_{idx}@innovaenvios.com"
                
                # Montar endereço completo
                address = endereco or ''
                if numero:
                    address += f", {numero}"
                if complemento and complemento != 'nan':
                    address += f" - {complemento}"
                if bairro:
                    address += f" - {bairro}"
                if cidade:
                    address += f" - {cidade}"
                if uf:
                    address += f" - {uf}"
                
                # Inserir no banco de dados
                query = """
                    INSERT INTO clients (name, email, cnpj, phone, address, cep, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, NOW())
                    ON DUPLICATE KEY UPDATE
                    name = VALUES(name),
                    phone = VALUES(phone),
                    address = VALUES(address),
                    cep = VALUES(cep),
                    updated_at = NOW()
                """
                
                cursor.execute(query, (name, email, cnpj, phone or celular, address, cep))
                inserted += 1
                
                # Mostrar progresso a cada 100 clientes
                if (idx + 1) % 100 == 0:
                    print(f"  ✅ {idx + 1} clientes processados...")
                
            except Exception as e:
                skipped += 1
                errors.append(f"Linha {idx}: {str(e)}")
        
        # Commit final
        conn.commit()
        
        # Estatísticas
        print(f"\n📊 Importação concluída!")
        print(f"  ✅ Inseridos/Atualizados: {inserted}")
        print(f"  ⏭️  Pulados: {skipped}")
        
        if errors:
            print(f"\n⚠️  Erros encontrados:")
            for error in errors[:10]:  # Mostrar apenas os 10 primeiros erros
                print(f"  - {error}")
            if len(errors) > 10:
                print(f"  ... e mais {len(errors) - 10} erros")
        
        # Verificar total no banco
        cursor.execute("SELECT COUNT(*) FROM clients")
        total = cursor.fetchone()[0]
        print(f"\n📈 Total de clientes no banco de dados: {total}")
        
        cursor.close()
        conn.close()
        
        print("\n✅ Importação finalizada com sucesso!")
        
    except Exception as e:
        print(f"\n❌ Erro durante importação: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    import_clients()
