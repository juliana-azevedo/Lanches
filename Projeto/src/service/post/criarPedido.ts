import { api } from "../api.service";
import type { CarrinhoItem } from "../../contexts/mainContext";

export async function criarPedido(carrinho: CarrinhoItem[], total: number, pagamento: string) {
  try {
    const res = await api.post("/pedido/criar", {
      carrinho,
      total,
      pagamento
    });

    return res.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
