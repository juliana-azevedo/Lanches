import { api } from "../api.service";

export default async function atualizarEntrada(id: number, quantidade: number, fornecedor: string) {
  try {
    const res = await api.put("/deposito/atualizar", {
      id,
      quantidade,
      fornecedor,
    });
    return { success: true, data: res.data };
  } catch (error) {
    console.error(error);
    return { success: false, error };
  }
}
