import { useState, type ReactNode } from "react";
import { MainContext } from "./context";


export interface Categoria {
  id?: number;
  nome: string;
  descricao: string,
}

export interface Produto {
  id?: number;
  nome: string;
  preco: number | null;
  descricao: string;
  idcategoria?: number;
  categoria: string;
  custo?: number;
}
export interface CarrinhoItem {
  id: number;
  nome: string;
  preco: number;
  quantidade: number;
}

export interface MainContextType {
  categorias: Categoria[];
  setCategorias: (value: Categoria[]) => void;
  produtos: Produto[];
  setProdutos: (value: Produto[]) => void;
  carrinho: CarrinhoItem[];
  setCarrinho: (value: CarrinhoItem[]) => void;
}

export function MainProvider({ children }: { children: ReactNode }) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carrinho, setCarrinho] = useState<CarrinhoItem[]>([]);


  return (
    <MainContext.Provider
      value={{
        categorias, setCategorias, produtos, setProdutos, carrinho, setCarrinho
      }}
    >
     {children}
    </MainContext.Provider>
  );
}


