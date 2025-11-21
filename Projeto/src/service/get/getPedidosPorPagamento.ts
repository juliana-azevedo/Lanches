import { api } from "../api.service";

interface PagamentosParams {
  dataInicio: string;
  dataFim: string;
}

export default async function getPedidosPorPagamento(dataInicio: string, dataFim: string) {
  try {
    const params: PagamentosParams = { dataInicio, dataFim };

    const res = await api.get("/relatorios/pagamentos", { params });
    return res.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}
