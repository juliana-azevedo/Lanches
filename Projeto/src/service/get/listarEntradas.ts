import { api } from "../api.service";

export default async function listarEntradas() {
  try {
    const res = await api.get("/deposito/listar");
    return res.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}
