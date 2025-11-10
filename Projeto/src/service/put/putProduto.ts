import { api } from "../api.service";

export default async function atualizarProduto(nome: string, preco: number, categoria_id: number, descricao: string, id: number) {
  try {
    const response = await api.put("/produto/atualizarProduto", { nome, preco, categoria_id, descricao, id });
    return {success: true, data: response.data};
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    return {success: false, error};
  }
}