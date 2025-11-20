import { api } from "../api.service";

export default async function listarPedidos() {
  try {
    const res = await api.get("/pedido/listar");
    return res.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}
