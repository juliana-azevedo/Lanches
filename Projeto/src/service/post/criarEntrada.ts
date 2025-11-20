import { api } from "../api.service";

export default async function criarEntrada(nome_produto: string, quantidade: number, fornecedor: string) {
  try {
    const res = await api.post("/deposito/criar", {
      nome_produto,
      quantidade,
      fornecedor,
    });
    return { success: true, data: res.data };
  } catch (error) {
    console.error(error);
    return { success: false, error };
  }
}
