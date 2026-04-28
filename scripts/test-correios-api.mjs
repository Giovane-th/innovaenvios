import axios from "axios";

const CARTAO = process.env.CORREIOS_CARTAO_POSTAGEM || "0076337634";
const SENHA = process.env.CORREIOS_SENHA || "082117tH#";

console.log("🔍 Testando API dos Correios...");
console.log(`Cartão: ${CARTAO}`);
console.log(`Senha: ${SENHA.substring(0, 3)}***`);
console.log("");

const client = axios.create({
  baseURL: "https://cwshom.correios.com.br",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

try {
  console.log("📤 Enviando requisição de autenticação...");
  const response = await client.post("/token", {
    cartaoPostagem: CARTAO,
    senha: SENHA,
  });

  console.log("✅ Resposta recebida!");
  console.log("Status:", response.status);
  console.log("Headers:", response.headers);
  console.log("Data:", JSON.stringify(response.data, null, 2));
} catch (error) {
  console.error("❌ Erro na requisição:");
  if (error.response) {
    console.error("Status:", error.response.status);
    console.error("Headers:", error.response.headers);
    console.error("Data:", JSON.stringify(error.response.data, null, 2));
  } else if (error.request) {
    console.error("Nenhuma resposta recebida:", error.request);
  } else {
    console.error("Erro:", error.message);
  }
}
