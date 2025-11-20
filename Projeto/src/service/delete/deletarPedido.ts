import { api } from "../api.service";

export default async function deletarPedido(id: number) {
  try {
    const res = await api.delete(`/pedido/deletar/${id}`);
    return res.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
