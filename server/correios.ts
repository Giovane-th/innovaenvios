/**
 * Serviço de integração com API SIGEP Web dos Correios
 * Proxy SOAP para o backend
 */

import soap from "soap";

const WSDL_URL = "https://apps.correios.com.br/SigepClienteService/AtendeClienteService/AtendeCliente?wsdl";

interface CorreiosConfig {
  cartaoPostagem: string;
  contrato: string;
  usuario: string;
  senha: string;
}

let soapClient: any = null;

/**
 * Inicializa o cliente SOAP
 */
async function initializeSoapClient(): Promise<any> {
  if (soapClient) return soapClient;

  try {
    soapClient = await soap.createClientAsync(WSDL_URL, {
      disableCache: true,
    });
    return soapClient;
  } catch (error) {
    console.error("Erro ao inicializar cliente SOAP:", error);
    throw new Error(`Erro ao conectar com Correios: ${error}`);
  }
}

/**
 * Autentica com a API SIGEP Web e retorna um token
 */
export async function autenticarCorreios(config: CorreiosConfig): Promise<{
  token: string;
  dataVigenciaFim: string;
}> {
  try {
    const client = await initializeSoapClient();

    const result = await client.buscaTokenClienteAsync({
      idContrato: config.contrato,
      idCartaoPostagem: config.cartaoPostagem,
      usuario: config.usuario,
      senha: config.senha,
    });

    if (!result[0] || !result[0].return) {
      throw new Error("Resposta inválida da API: token não encontrado");
    }

    return {
      token: result[0].return.token,
      dataVigenciaFim: result[0].return.dataVigenciaFim,
    };
  } catch (error) {
    console.error("Erro ao autenticar com Correios:", error);
    throw error;
  }
}

/**
 * Busca informações de CEP
 */
export async function buscarCEP(
  token: string,
  cep: string
): Promise<{
  cep: string;
  end: string;
  bairro: string;
  cidade: string;
  uf: string;
  complemento?: string;
}> {
  try {
    const client = await initializeSoapClient();
    const cleanCEP = cep.replace(/\D/g, "");

    const result = await client.buscaCEPAsync({
      token,
      cep: cleanCEP,
    });

    if (!result[0] || !result[0].return) {
      throw new Error("CEP não encontrado");
    }

    return result[0].return;
  } catch (error) {
    console.error("Erro ao buscar CEP:", error);
    throw error;
  }
}

/**
 * Solicita uma pré-postagem (etiqueta)
 */
export async function solicitarPostal(
  token: string,
  cartaoPostagem: string,
  dados: any
): Promise<{
  codigoRastreamento: string;
  idPlpMaster: number;
}> {
  try {
    const client = await initializeSoapClient();

    const result = await client.solicitarPostalAsync({
      token,
      idCartaoPostagem: cartaoPostagem,
      ...dados,
    });

    if (!result[0] || !result[0].return) {
      throw new Error("Erro ao solicitar postal");
    }

    return result[0].return;
  } catch (error) {
    console.error("Erro ao solicitar postal:", error);
    throw error;
  }
}

/**
 * Gera etiqueta de um objeto postal
 */
export async function gerarEtiqueta(
  token: string,
  idPlpMaster: number,
  sequencialPostal: number
): Promise<{
  codigoBarras: string;
  urlEtiqueta: string;
}> {
  try {
    const client = await initializeSoapClient();

    const result = await client.gerarEtiquetaAsync({
      token,
      idPlpMaster,
      sequencialPostal,
    });

    if (!result[0] || !result[0].return) {
      throw new Error("Erro ao gerar etiqueta");
    }

    return result[0].return;
  } catch (error) {
    console.error("Erro ao gerar etiqueta:", error);
    throw error;
  }
}
