const axios = require('axios');

// Credenciais SIGEP Web
const usuario = 'correios';
const senha = '1234456';
const cartaoPostagem = '0076337634';
const contrato = '991252834';

// URL do SIGEP Web (produção)
const SIGEP_URL = 'https://webservice.correios.com.br/webservice/ClientePostal/AtendeCliente/Servidor.asmx';

async function testarConexao() {
  console.log('🧪 Testando conexão com SIGEP Web dos Correios...\n');
  
  try {
    // Teste 1: Autenticação
    console.log('1️⃣ Testando autenticação...');
    const authPayload = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cli="http://cliente.bean.master.sigep.bsb.correios.com.br/">
  <soap:Header />
  <soap:Body>
    <cli:buscaPostalLoggingCliente>
      <idContrato>${contrato}</idContrato>
      <idCartaoPostagem>${cartaoPostagem}</idCartaoPostagem>
      <usuario>${usuario}</usuario>
      <senha>${senha}</senha>
    </cli:buscaPostalLoggingCliente>
  </soap:Body>
</soap:Envelope>`;

    const authResponse = await axios.post(SIGEP_URL, authPayload, {
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': ''
      },
      timeout: 10000
    });

    console.log('✅ Autenticação bem-sucedida!');
    console.log('Resposta:', authResponse.data.substring(0, 200) + '...\n');

    // Teste 2: Buscar dados do contrato
    console.log('2️⃣ Buscando dados do contrato...');
    const contratoPayload = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cli="http://cliente.bean.master.sigep.bsb.correios.com.br/">
  <soap:Header />
  <soap:Body>
    <cli:buscaContrato>
      <idContrato>${contrato}</idContrato>
      <idCartaoPostagem>${cartaoPostagem}</idCartaoPostagem>
      <usuario>${usuario}</usuario>
      <senha>${senha}</senha>
    </cli:buscaContrato>
  </soap:Body>
</soap:Envelope>`;

    const contratoResponse = await axios.post(SIGEP_URL, contratoPayload, {
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': ''
      },
      timeout: 10000
    });

    console.log('✅ Dados do contrato obtidos!');
    console.log('Resposta:', contratoResponse.data.substring(0, 300) + '...\n');

    // Teste 3: Buscar serviços disponíveis
    console.log('3️⃣ Buscando serviços disponíveis...');
    const servicosPayload = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cli="http://cliente.bean.master.sigep.bsb.correios.com.br/">
  <soap:Header />
  <soap:Body>
    <cli:buscaServicosPostais>
      <idContrato>${contrato}</idContrato>
      <idCartaoPostagem>${cartaoPostagem}</idCartaoPostagem>
      <usuario>${usuario}</usuario>
      <senha>${senha}</senha>
    </cli:buscaServicosPostais>
  </soap:Body>
</soap:Envelope>`;

    const servicosResponse = await axios.post(SIGEP_URL, servicosPayload, {
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': ''
      },
      timeout: 10000
    });

    console.log('✅ Serviços obtidos!');
    console.log('Resposta:', servicosResponse.data.substring(0, 300) + '...\n');

    console.log('🎉 TODOS OS TESTES PASSARAM!');
    console.log('✅ Comunicação com Correios funcionando perfeitamente!\n');

  } catch (error) {
    console.error('❌ Erro na comunicação:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Resposta:', error.response.data.substring(0, 500));
    }
  }
}

testarConexao();
