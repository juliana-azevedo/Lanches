import { api } from "../api.service";

export default async function deletarProduto(id : number) {
  try {
    const response = await api.delete("/produto/deletarProduto", { data: { id } });
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.error("Erro ao deletar produto:", error);
    throw error;
  }
}