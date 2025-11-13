import { api } from "../api.service";

export default async function listarCategoria() {
  try {
    const response = await api.get("/categoria/listarCategoria");
    return response.data;
  } catch (error) {
    console.error("Erro ao listar categorias:", error);
    throw error;
  }
}