import { api } from "../api.service";

export default async function deletarEntrada(id: number) {
  try {
    const res = await api.delete(`/deposito/deletar/${id}`);
    return { success: true, data: res.data };
  } catch (error) {
    console.error(error);
    return { success: false, error };
  }
}
