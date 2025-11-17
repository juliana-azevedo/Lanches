import { api } from "../api.service";

export async function deletarUsuario(id: string) {
  try {
    const response = await api.delete(`/user/delete/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    return { success: false, error };
  }
}
