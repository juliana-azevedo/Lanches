import { api } from "../api.service";

interface LucroParams {
  dataInicio: string;
  dataFim: string;
  produto_id?: number;
}

export default async function getLucroPorProduto(dataInicio: string, dataFim: string, produto_id?: number) {
  try {
    const params: LucroParams = { dataInicio, dataFim };
    if (produto_id) params.produto_id = produto_id;

    const res = await api.get("/relatorios/lucro", { params });
    return res.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}
