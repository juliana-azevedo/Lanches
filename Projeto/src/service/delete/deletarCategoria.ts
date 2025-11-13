import { api } from "../api.service";

export default async function deletarCategoria(id : number) {
  try {
    const response = await api.delete("/categoria/deletarCategoria", { data: { id } });
    return response.data;
  } catch (error) {
    console.error("Erro ao deletar categoria:", error);
    throw error;
  }
}