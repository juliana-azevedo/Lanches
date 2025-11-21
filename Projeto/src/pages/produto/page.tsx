import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import listarCategoria from "../../service/get/listarCategoria";
import { useMainContext, useUserContext } from "../../contexts/context";
import deletarProduto from "../../service/delete/deletarProduto";
import atualizarProduto from "../../service/put/putProduto";
import criarProduto from "../../service/post/criarProduto";
import listarProduto from "../../service/get/listarProduto";
import type { Produto } from "../../contexts/mainContext";
import Alerta, { type alertProps } from "../../components/alerta";
import ConfirmDialog from "../../components/confirmDialog";

interface FormState {
  nome: string;
  preco: string;
  porcentagemLucro: string;
  descricao: string;
  categoria: string;
}

export default function Produto() {
  const {
    categorias,
    setCategorias,
    produtos,
    setProdutos,
    carrinho,
    setCarrinho,
  } = useMainContext();
  const { user } = useUserContext();
  const [form, setForm] = useState<FormState>({
    nome: "",
    preco: "",
    porcentagemLucro: "",
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
      }
    };
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
    reqCategorias();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.nome || !form.preco || !form.categoria || !form.descricao) {
      setAlertP({ id: 1, text: "⚠️ Erro: Preencha todos os campos!" });
      return;
    }

    const preco = parseFloat(form.preco);
    const lucroPercent = form.porcentagemLucro ? parseFloat(form.porcentagemLucro) : 0;

    if (lucroPercent < 0 || lucroPercent >= 100) {
        setAlertP({ id: 1, text: "⚠️ Erro: A porcentagem de lucro deve ser entre 0 e 99.99!" });
        return;
    }

    // Custo = Preço - (Preço * (Margem / 100))
    const custo = preco - (preco * (lucroPercent / 100));

    const verifyNames = produtos.find(
      (cat) =>
        cat.nome.toLowerCase() === form.nome.toLowerCase() &&
        cat.id !== editando
    );

    if (verifyNames) {
      setAlertP({
        id: 1,
        text: "⚠️ Erro: Já existe um produto com esse nome!",
      });
      return;
    }

    const categoriaId = categorias.find((c) => c.nome === form.categoria)?.id;
    if (!categoriaId) return;

    if (editando !== null) {
      const result = await atualizarProduto(
        form.nome,
        preco,
        categoriaId,
        form.descricao,
        editando,
        custo
      );

      if (result.success) {
        setAlertP({ id: 0, text: "Produto atualizado com sucesso!" });
        setEditando(null);
        setForm({
          nome: "",
          preco: "",
          porcentagemLucro: "",
          descricao: "",
          categoria: "",
        });
        const data = await listarProduto();
        if (data && data.success && data.data) setProdutos(data.data);
      } else {
        setAlertP({ id: 1, text: "Erro ao atualizar produto." });
      }
    } else {
      const result = await criarProduto(
        form.nome,
        preco,
        categoriaId,
        form.descricao,
        custo
      );

      if (result.success) {
        setAlertP({ id: 0, text: "Produto criado com sucesso!" });
        setForm({
          nome: "",
          preco: "",
          porcentagemLucro: "",
          descricao: "",
          categoria: "",
        });
        const data = await listarProduto();
        if (data && data.success && data.data) setProdutos(data.data);
      } else {
        setAlertP({ id: 1, text: "Erro ao criar produto." });
      }
    }
  };

  const handleEditar = (prod: Produto) => {
    let lucroPercent = "";
    if (prod.preco && prod.custo) {
        // Margem = ((Preço - Custo) / Preço) * 100
        const margem = ((prod.preco - prod.custo) / prod.preco) * 100;
        lucroPercent = margem.toFixed(2);
    }

    setForm({
      nome: prod.nome,
      preco: prod.preco ? prod.preco.toString() : "",
      porcentagemLucro: lucroPercent,
      descricao: prod.descricao,
      categoria: prod.categoria,
    });
    setEditando(prod.id || null);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
        (p.categoria &&
          p.categoria.toLowerCase().includes(busca.toLowerCase())) ||
        (p.descricao && p.descricao.toLowerCase().includes(busca.toLowerCase()))
    )
    .sort((a, b) => {
      const catA = a.categoria || "";
      const catB = b.categoria || "";
      const categoriaCompare = catA.localeCompare(catB);
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

  const adicionarAoCarrinho = (p: Produto) => {
    const existente = carrinho.find((item) => item.id === p.id);

    if (existente) {
      existente.quantidade++;
      setCarrinho([...carrinho]);
    } else {
      setCarrinho([
        ...carrinho,
        {
          id: p.id!,
          nome: p.nome,
          preco: p.preco ?? 0,
          quantidade: 1,
        },
      ]);
    }

    setAlertP({ id: 0, text: "✔️ Produto adicionado ao carrinho!" });
  };

  return (
    <div className="min-h-screen bg-white bg-cover bg-fixed bg-center p-8">
      <Alerta id={alertP?.id} text={alertP?.text} />

      <ConfirmDialog
        open={open}
        title="Você tem certeza que deseja excluir esse produto?"
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          if (selectedId) handleDeletar(selectedId);
          setOpen(false);
        }}
      />

      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-6xl mx-auto border border-red-200">
        <h1 className="text-5xl font-extrabold text-center mb-10 text-red-600 drop-shadow">
          🍔 <span className="text-yellow-500">+Lanches</span> Cardápio
        </h1>

        {/* Formulário */}
        {user?.isAdmin && (
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
                step="0.01"
                placeholder="Exemplo: 18.90"
                value={form.preco}
                onChange={handleChange}
                className="w-full p-3 border-2 border-yellow-200 rounded-lg focus:ring-2 focus:ring-red-400 outline-none"
              />
            </div>

            <div className="flex flex-col mb-4">
              <label className="text-gray-700 font-medium mb-1">
                📈 Margem de Lucro (%)
              </label>
              <input
                type="number"
                name="porcentagemLucro"
                step="0.01"
                placeholder="Exemplo: 20"
                value={form.porcentagemLucro}
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
                    setForm({
                      nome: "",
                      preco: "",
                      porcentagemLucro: "",
                      descricao: "",
                      categoria: "",
                    });
                  }}
                  type="button"
                  className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold px-4 py-2.5 rounded-lg transition-all duration-200 shadow-md"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        )}

        {/* Lista */}
        <div className="max-w-5xl mx-auto bg-white/95 shadow-xl rounded-2xl overflow-hidden border border-yellow-200">
          {produtos.length === 0 ? (
            <p className="text-center py-10 text-gray-600 text-lg font-medium">
              Nenhum produto cadastrado ainda 😕
            </p>
          ) : (
            <div className="overflow-hidden max-h-screen flex flex-col">
              <div className="flex justify-end mx-2 my-2 flex-shrink-0">
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
                              {user?.isAdmin ? (
                                <>
                                  <button
                                    onClick={() => handleEditar(p)}
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
                                </>
                              ) : (
                                <button
                                  onClick={() => adicionarAoCarrinho(p)}
                                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition-all shadow-sm"
                                >
                                  🛒 Carrinho
                                </button>
                              )}
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
