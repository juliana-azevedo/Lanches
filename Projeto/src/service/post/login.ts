import { api } from "../api.service";

export default async function login(email: string, password: string) {
  try {
    const response = await api.post("/user/login", { email, password });
    return {success: true, data: response.data};
  } catch (error) {
    console.error("Erro ao criar Login:", error);
    return {success: false, error}
  }
}