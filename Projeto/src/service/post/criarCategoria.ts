import { api } from "../api.service";

export default async function criarCategoria(nome: string, descricao: string) {
  try {
    const response = await api.post("/categoria/criarCategoria", { nome, descricao });
    console.log(response.data)
    return {success: true, data: response.data};
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    return {success: false, error}
  }
}