import { api } from "../api.service";

export default async function atualizarCategoria(nome: string, id: number) {
  try {
    const response = await api.put("/categoria/atualizarCategoria", { nome, id });
    return {success: true, data: response.data};
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    return {success: false, error};
  }
}