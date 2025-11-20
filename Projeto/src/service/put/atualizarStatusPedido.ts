import { api } from "../api.service";

export default async function atualizarStatusPedido(id: number, status: string) {
  try {
    const res = await api.put("/pedido/atualizarStatus", { id, status });
    return res.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
