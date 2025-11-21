import type { Produto } from "../../contexts/mainContext";
import { api } from "../api.service";

interface ApiProduto {
  id: number;
  nomeproduto: string;
  preco: number;
  descricao: string;
  idcategoria: number;
  nomecategoria: string;
  custo: number;
}

export default async function listarProduto() {
  try {
    const response = await api.get<ApiProduto[]>("/produto/listarProduto");

    const returnResponse: Produto[] = response.data.map((itemApi) => {
      return {
        id: itemApi.id,
        nome: itemApi.nomeproduto,
        preco: itemApi.preco,
        descricao: itemApi.descricao,
        idcategoria: itemApi.idcategoria,
        categoria: itemApi.nomecategoria,
        custo: itemApi.custo,
      };
    });

    return {
      success: true,
      data: returnResponse,
    };
  } catch (error) {
    console.error("Erro ao listar produto:", error);
    return {
      success: false,
      error,
    };
  }
}