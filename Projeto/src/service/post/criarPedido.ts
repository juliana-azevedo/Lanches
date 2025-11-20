import { api } from "../api.service";

export async function criarPedido(carrinho: any[], total: number) {
  try {
    const res = await api.post("/pedido/criar", {
      carrinho,
      total,
    });

    return res.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
