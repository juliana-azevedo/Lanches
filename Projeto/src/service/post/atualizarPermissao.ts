import { api } from "../api.service";

export default async function atualizarUsuarioPermissao(id: string, isadmin: number) {
  try {
    const response = await api.post("/user/atualizarPermissao", { id, isadmin });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Erro ao atualizar permissao:", error);
    return { success: false, error };
  }
}
