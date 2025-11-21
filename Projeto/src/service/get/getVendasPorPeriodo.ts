import { api } from "../api.service";

interface VendasParams {
  dataInicio: string;
  dataFim: string;
  categoria_id?: number;
}

export default async function getVendasPorPeriodo(dataInicio: string, dataFim: string, categoria_id?: number) {
  try {
    const params: VendasParams = { dataInicio, dataFim };
    if (categoria_id) params.categoria_id = categoria_id;

    const res = await api.get("/relatorios/vendas", { params });
    return res.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}
