import { api } from "../api.service";

export default async function getUsuario(id: string) {
  try {
    // Colocando o id na URL
    const response = await api.get(`/user/${id}`);
    console.log(response.data)
    return response.data; // { id, username, email, endereco, telefone }
  } catch (error) {
    console.error("Erro ao carregar dados do usuário:", error);
    throw error;
  }
}
