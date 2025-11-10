import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import listarCategoria from "../../service/get/listarCategoria";
import { useMainContext } from "../../contexts/context";
import deletarProduto from "../../service/delete/deletarProduto";
import atualizarProduto from "../../service/put/putProduto";
import criarProduto from "../../service/post/criarProduto";
import listarProduto from "../../service/get/listarProduto";
import type { Produto } from "../../contexts/mainContext";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import Alerta, { type alertProps } from "../../components/alerta";

export default function Produto() {
  const { categorias, setCategorias, produtos, setProdutos } = useMainContext();
  const [form, setForm] = useState<Produto>({
    nome: "",
    preco: null,
    descricao: "",
    categoria: "",
  });
  const [editando, setEditando] = useState<number | null>(null);
  const [busca, setBusca] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [alertP, setAlertP] = useState<alertProps | null>();

  useEffect(() => {
    const reqCategorias = async () => {
      if (categorias.length === 0) {
        const data = await listarCategoria();
        if (data) setCategorias(data);
        console.log("Produto: Requisação feita!");
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
    localStorage.setItem("produtos", JSON.stringify(produtos));
  }, [produtos]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "preco") {
      const formattedValue = value.replace(/[^0-9.,]/g, "");
      const normalized = formattedValue.replace(",", ".");

      if (normalized === "") {
        setForm({ ...form, preco: null });
        return;
      }
      const match = normalized.match(/^(\d+)([.,](\d{0,2}))?$/);
      if (match) {
        setForm({ ...form, preco: Number(normalized) });
      }
      return;
    }

    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.nome || !form.preco || !form.categoria || !form.descricao) {
      setAlertP({id: 1, text: "⚠️ Erro: Preencha todos os campos!"});
      return;
    }

    const verifyNames = produtos.find(
      (cat) =>
        cat.nome.toLowerCase() === form.nome.toLowerCase() &&
        cat.id !== editando
    );

    if (verifyNames) {
      setAlertP({
        id: 1,
        text: "⚠️ Erro: Já existe uma categoria com esse nome!",
      });
      return;
    }

    if (editando !== null) {
      const produtoEscolhido = produtos.find((cat) => cat.id === editando);

      if (produtoEscolhido?.id == editando) {
        const categoriaEscolhido = categorias.find(
          (cat) => form.categoria === cat.nome
        );

        if (categoriaEscolhido && categoriaEscolhido.id) {
          const result = await atualizarProduto(
            form.nome,
            form.preco,
            categoriaEscolhido.id,
            form.descricao,
            produtoEscolhido.id
          );

          if (result.success) {
            produtoEscolhido.nome = form.nome;
            produtoEscolhido.preco = form.preco;
            produtoEscolhido.descricao = form.descricao;
            produtoEscolhido.categoria = form.categoria;

            setProdutos([...produtos]);
            setEditando(null);
          } else {
            console.error("Erro ao atualizar categoria:", result.error);
          }
        }
      }
      setEditando(null);
    } else {
      const categoriaEscolhido = categorias.find(
        (cat) => form.categoria === cat.nome
      );
      if (categoriaEscolhido && categoriaEscolhido.id) {
        const result = await criarProduto(
          form.nome,
          form.preco,
          categoriaEscolhido.id,
          form.descricao
        );
        if (result.success) {
          const novo: Produto = {
            id: result.data?.id,
            nome: form.nome,
            preco: form.preco,
            descricao: form.descricao,
            categoria: form.categoria,
          };
          setProdutos([...produtos, novo]);
        }
      }
    }

    setForm({ nome: "", preco: 0, descricao: "", categoria: "" });
  };

  const handleEditar = (index: number) => {
    const produtoEscolhido = produtos.find((cat) => cat.id === index);
    console.log(produtoEscolhido);
    if (produtoEscolhido) {
      setForm({
        nome: produtoEscolhido.nome,
        preco: produtoEscolhido.preco,
        descricao: produtoEscolhido.descricao,
        categoria: produtoEscolhido.categoria,
      });
      setEditando(index);
    }
  };

  const handleDeleteClick = (id: number) => {
    setSelectedId(id);
    setOpen(true);
  };

  const handleDeletar = async (id: number) => {
    await deletarProduto(id);
    const novos = produtos.filter((cat) => cat.id !== id);
    setProdutos(novos);
  };

  const produtosFiltrados = [...produtos]
    .filter(
      (p) =>
        p.nome.toLowerCase().includes(busca.toLowerCase()) ||
        p.categoria.toLowerCase().includes(busca.toLowerCase()) ||
        p.descricao.toLowerCase().includes(busca.toLowerCase())
    )
    .sort((a, b) => {
      const categoriaCompare = a.categoria.localeCompare(b.categoria);
      if (categoriaCompare === 0) return a.nome.localeCompare(b.nome);
      return categoriaCompare;
    });

  useEffect(() => {
    if (alertP !== null) {
      const timer = setTimeout(() => {
        setAlertP(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alertP]);

  return (
    <div className="min-h-screen bg-white bg-cover bg-fixed bg-center p-8">
      <Alerta id={alertP?.id} text={alertP?.text} />

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>
          Você tem certeza que deseja excluir essa categoria?
        </DialogTitle>
        <DialogActions>
          <Button
            onClick={() => {
              setOpen(false);
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (selectedId !== null) {
                handleDeletar(selectedId);
              }
              setOpen(false);
            }}
          >
            Aceitar
          </Button>
        </DialogActions>
      </Dialog>

      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-6xl mx-auto border border-red-200">
        <h1 className="text-5xl font-extrabold text-center mb-10 text-red-600 drop-shadow">
          🍔 <span className="text-yellow-500">+Lanches</span> Cardápio
        </h1>

        {/* Formulário */}
        <form
          onSubmit={handleSubmit}
          className="bg-gradient-to-b from-yellow-50 to-white border border-yellow-200 shadow-md rounded-2xl p-6 max-w-lg mx-auto mb-12"
        >
          <h2 className="text-2xl font-bold mb-6 text-red-600 text-center">
            {editando !== null ? "✏️ Editar Produto" : "➕ Cadastrar Produto"}
          </h2>

          <div className="flex flex-col mb-4">
            <label className="text-gray-700 font-medium mb-1">
              🍩 Nome do produto
            </label>
            <input
              type="text"
              name="nome"
              placeholder="Exemplo: X-Burguer"
              value={form.nome}
              onChange={handleChange}
              className="w-full p-3 border-2 border-yellow-200 rounded-lg focus:ring-2 focus:ring-red-400 outline-none"
            />
          </div>

          <div className="flex flex-col mb-4">
            <label className="text-gray-700 font-medium mb-1">💰 Preço</label>
            <input
              type="number"
              name="preco"
              placeholder="Exemplo: 18.90"
              value={form.preco ?? ""}
              onChange={handleChange}
              className="w-full p-3 border-2 border-yellow-200 rounded-lg focus:ring-2 focus:ring-red-400 outline-none"
            />
          </div>

          <div className="flex flex-col mb-4">
            <label className="text-gray-700 font-medium mb-1">
              🍟 Categoria
            </label>
            <select
              name="categoria"
              value={form.categoria}
              onChange={handleChange}
              className="w-full p-3 border-2 border-yellow-200 bg-white rounded-lg focus:ring-2 focus:ring-red-400 outline-none"
            >
              <option value="">Selecione a categoria</option>
              {categorias.map((cat, index) => (
                <option key={index} value={cat.nome}>
                  {cat.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col mb-6">
            <label className="text-gray-700 font-medium mb-1">
              📝 Descrição
            </label>
            <textarea
              name="descricao"
              placeholder="Exemplo: Hambúrguer artesanal com queijo e bacon"
              value={form.descricao}
              onChange={handleChange}
              className="w-full p-3 border-2 border-yellow-200 rounded-lg focus:ring-2 focus:ring-red-400 outline-none"
              rows={3}
            ></textarea>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2.5 rounded-lg transition-all duration-200 shadow-md"
            >
              {editando !== null ? "Salvar Alterações" : "Adicionar Produto"}
            </button>

            {editando !== null && (
              <button
                onClick={() => {
                  setEditando(null);
                  setForm({ nome: "", preco: 0, descricao: "", categoria: "" });
                }}
                type="button"
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold px-4 py-2.5 rounded-lg transition-all duration-200 shadow-md"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        {/* Lista */}
        <div className="max-w-5xl mx-auto bg-white/95 shadow-xl rounded-2xl overflow-hidden border border-yellow-200">
          {produtos.length === 0 ? (
            <p className="text-center py-10 text-gray-600 text-lg font-medium">
              Nenhum produto cadastrado ainda 😕
            </p>
          ) : (
            <div className="overflow-hidden max-h-screen flex flex-col">
              <div className="flex justify-end mx-2 my-2 flex-shrink-0">
                {" "}
                {/* <-- 1. Adicione flex-shrink-0 aqui */}
                <input
                  type="text"
                  placeholder="🔎 Buscar produto, categoria ou descrição..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-80 p-2 border-2 border-yellow-300 rounded-lg focus:ring-2 focus:ring-red-400 outline-none"
                />
              </div>

              <div className="flex-1 overflow-y-auto ">
                <table className="min-w-full text-sm text-left text-gray-700">
                  <thead className="bg-yellow-100 text-red-600 uppercase text-xs border-b-2 border-yellow-200 sticky top-0 z-10">
                    <tr>
                      <th className="py-4 px-6 font-semibold">Nome</th>
                      <th className="py-4 px-6 font-semibold">Categoria</th>
                      <th className="py-4 px-6 font-semibold">Preço</th>
                      <th className="py-4 px-6 font-semibold">Descrição</th>
                      <th className="py-4 px-6 font-semibold text-center">
                        Opções
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-yellow-100">
                    {produtosFiltrados.map((p, index) => {
                      const itemId = p.id ? p.id : index;
                      return (
                        <tr
                          key={itemId}
                          className="hover:bg-yellow-50 transition-all duration-150"
                        >
                          <td className="py-4 px-6 font-medium">{p.nome}</td>
                          <td className="py-4 px-6">{p.categoria}</td>
                          <td className="py-4  font-semibold text-green-700">
                            R$ {Number(p.preco).toFixed(2)}
                          </td>

                          <td className="py-4 px-6">
                            <div className="w-104 overflow-auto">
                              {p.descricao}
                            </div>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
