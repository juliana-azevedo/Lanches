import { api } from "../api.service";

export default async function register(username: string, email: string, password: string, endereco: string, telefone: string) {
  try {
    const response = await api.post("/user/createUser", { username, email, password, endereco, telefone });
    return {success: true, data: response.data};
  } catch (error) {
    console.error("Erro ao criar usuario:", error);
    return {success: false, error}
  }
}