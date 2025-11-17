import { api } from "../api.service";

interface UpdateUserData {
  username?: string;
  email?: string;
  endereco?: string;
  telefone?: string;
}

export default async function atualizarUsuario(data: UpdateUserData) {
  try {
    const response = await api.put(`/user/me`, data);

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return {
      success: false,
      error
    };
  }
}
