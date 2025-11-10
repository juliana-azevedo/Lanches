import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import criarCategoria from "../../service/post/criarCategoria";
import listarCategoria from "../../service/get/listarCategoria";
import atualizarCategoria from "../../service/put/putCategoria";
import deletarCategoria from "../../service/delete/deletarCategoria";
import type { Categoria } from "../../contexts/mainContext";
import { useMainContext } from "../../contexts/context";
import listarProduto from "../../service/get/listarProduto";
import { Button, Dialog, DialogActions, DialogTitle } from "@mui/material";
import Alerta, {type alertProps}  from "../../components/alerta";

export default function Categoria() {
  const { categorias, setCategorias, setProdutos, produtos } = useMainContext();
  const [form, setForm] = useState<Categoria>({
    nome: "",
    descricao: "",
  });
  const [editando, setEditando] = useState<number | null>(null);
  const [alertP, setAlertP] = useState<alertProps | null>();
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // 🔹 Carregar do localStorage
  useEffect(() => {
    const reqCategorias = async () => {
      if (categorias.length === 0) {
        const data = await listarCategoria();
        if (data) setCategorias(data);
        console.log("Categoria: Requisação feita!");
      }
    };
    reqCategorias();
  }, []);

  useEffect(() => {
    const reqProdutos = async () => {
      if (produtos.length === 0) {
        const data = await listarProduto();
        if (data) {
          if (data.success && data.data) {
            setProdutos(data.data);
          }
        }
      }
    };
    reqProdutos();
  }, []);

  // 🔹 Salvar no localStorage
  useEffect(() => {
    localStorage.setItem("categorias", JSON.stringify(categorias));
  }, [categorias]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.nome || !form.descricao) {
      setAlertP({id: 1, text: "⚠️ Erro: Preencha todos os campos!"});
      return;
    }

	const verifyNames = categorias.find((cat) => cat.nome.toLowerCase() === form.nome.toLowerCase() && cat.id !== editando);

	if (verifyNames) {
		setAlertP({id: 1, text: "⚠️ Erro: Já existe uma categoria com esse nome!"});
		return ;
	}

    if (editando !== null) {
      const categoriaEscolhida = categorias.find((cat) => cat.id === editando);

      if (categoriaEscolhida?.id == editando) {
        const result = await atualizarCategoria(
          form.nome,
          categoriaEscolhida.id
        );

        if (result.success) {

          const quantity = produtos.filter((produto) => produto.idcategoria === categoriaEscolhida.id).length;

          if(quantity > 0) {
            setAlertP({id: 2, text: "⚠️ Atenção: Produtos serão realocados!"});
          }

          categoriaEscolhida.nome = form.nome;
          categoriaEscolhida.descricao = form.descricao
          setCategorias([...categorias]);
          setEditando(null);
        } else {
          console.error("Erro ao atualizar categoria:", result.error);
        }
      }
    } else {
      const result = await criarCategoria(form.nome, form.descricao);
      if (result.success) {
        const novo: Categoria = {
          id: result.data?.id,
          nome: form.nome,
          descricao: form.descricao,
        };
        setCategorias([...categorias, novo]);
      }
    }

    setForm({ nome: "", descricao: "" });
  };

  const handleEditar = (index: number) => {
    const categoriaEscolhida = categorias.find((cat) => cat.id === index);
    if (categoriaEscolhida) {
      setForm({
        nome: categoriaEscolhida.nome,
        descricao: categoriaEscolhida.descricao,
      });
      setEditando(index);
    }
  };

  const handleDeleteClick = (id: number) => {
    const quantity = produtos.filter((produto) => produto.idcategoria === id).length;

    if (quantity > 0) {
      setAlertP({id: 1, text: "⚠️ Erro: Existem produtos nessa categoria!"});
      return;
    }
    setSelectedId(id);
    setOpen(true); 
  };

  const handleDeletar = async (id: number) => {

    await deletarCategoria(id);
    const novos = categorias.filter((cat) => cat.id !== id);
    setAlertP({id: 0, text: "✅ Sucesso: Categoria excluída com sucesso!"});
    setCategorias(novos);
  };

  useEffect(() => {
    if (alertP !== null) {
      const timer = setTimeout(() => {
        setAlertP(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alertP]);


  return (
  <div className="min-h-screen bg-white bg-cover bg-fixed bg-center p-8 relative">

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Você tem certeza que deseja excluir essa categoria?</DialogTitle>
        <DialogActions>
          <Button onClick={() => {
            setOpen(false);
          }}>Cancelar</Button>
          <Button variant="contained" onClick={() => {
            if (selectedId !== null) {
              handleDeletar(selectedId);
            }
             setOpen(false);
          }}>
            Aceitar
          </Button>
        </DialogActions>
      </Dialog>

    <Alerta id={alertP?.id} text={alertP?.text}/>

    <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-6xl mx-auto border border-red-200">
      <h1 className="text-5xl font-extrabold text-center mb-10 text-red-600 drop-shadow">
        🍔 <span className="text-yellow-500">+Lanches</span> Categorias
      </h1>

      {/* Formulário */}
      <form
        onSubmit={handleSubmit}
        className="bg-gradient-to-b from-yellow-50 to-white border border-yellow-200 shadow-md rounded-2xl p-6 max-w-lg mx-auto mb-12"
      >
        <h2 className="text-2xl font-bold mb-6 text-red-600 text-center">
          {editando !== null ? "✏️ Editar Categoria" : "➕ Cadastrar Categoria"}
        </h2>

        <div className="flex flex-col mb-4">
          <label className="text-gray-700 font-medium mb-1">📂 Nome da categoria</label>
          <input
		  	id="nome"
            type="text"
            name="nome"
            placeholder="Exemplo: Doce"
            value={form.nome}
            onChange={handleChange}
            className="w-full p-3 border-2 border-yellow-200 rounded-lg focus:ring-2 focus:ring-red-400 outline-none"
          />
        </div>

        <div className="flex flex-col mb-6">
          <label className="text-gray-700 font-medium mb-1">📝 Descrição</label>
          <input
		  	id="descricao"
            type="text"
            name="descricao"
            placeholder="Exemplo: Comidas adocicadas"
            value={form.descricao}
            onChange={handleChange}
            className="w-full p-3 border-2 border-yellow-200 rounded-lg focus:ring-2 focus:ring-red-400 outline-none"
          />
        </div>

        <div className="flex w-full gap-3">
          <button
            type="submit"
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2.5 rounded-lg transition-all duration-200 shadow-md"
          >
            {editando !== null ? "Salvar Alterações" : "Adicionar Categoria"}
          </button>

          {editando !== null && (
            <button
              onClick={() => {
                setEditando(null);
                setForm({ nome: "", descricao: "" });
              }}
              type="button"
			  id="submitCategoria"
              className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold px-4 py-2.5 rounded-lg transition-all duration-200 shadow-md"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Lista */}
      <div className="max-w-5xl mx-auto bg-white/95 shadow-xl rounded-2xl overflow-hidden border border-yellow-200">
        {categorias.length === 0 ? (
          <p className="text-center py-10 text-gray-600 text-lg font-medium">
            Nenhuma categoria cadastrada ainda 😕
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-700">
              <thead className="bg-yellow-100 text-red-600 uppercase text-xs border-b-2 border-yellow-200">
                <tr>
                  <th className="py-4 px-6 font-semibold">Nome</th>
                  <th className="py-4 px-6 font-semibold">Descrição</th>
                  <th className="py-4 px-6 font-semibold">Qtd. Produtos</th>
                  <th className="py-4 px-6 font-semibold text-center">Opções</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-yellow-100">
                {[...categorias]
                  .sort((a, b) => a.nome.localeCompare(b.nome))
                  .map((p, index) => {
                    const itemId = p.id ? p.id : index;
                    const qtdProdutos = produtos.filter(
                      (produto) => produto.idcategoria === p.id
                    ).length;

                    console.log(JSON.stringify(produtos, null, 2))

                    return (
                      <tr
                        key={itemId}
                        className="hover:bg-yellow-50 transition-all duration-150"
                      >
                        <td className="py-4 px-6 font-medium">{p.nome}</td>
                        <td className="py-4 px-6">{p.descricao}</td>
                        <td className="py-4 px-6 text-center text-green-700 font-semibold">
                          {qtdProdutos}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex justify-center gap-3">
                            <button
                              onClick={() => handleEditar(itemId)}
                              className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1.5 rounded-lg transition-all shadow-sm"
                            >
                              ✏️ Editar
                            </button>
                            <button
                              onClick={() => handleDeleteClick(itemId)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition-all shadow-sm"
                            >
                              🗑️ Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  </div>
);

}
