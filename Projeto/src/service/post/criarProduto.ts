import { api } from "../api.service";

export default async function criarProduto(nome: string, preco: number, categoria_id: number, descricao: string, custo: number) {
  try {
    const response = await api.post("/produto/criarProduto", { nome, preco, categoria_id, descricao, custo });
    return {success: true, data: response.data};
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    return {success: false, error}
  }
}