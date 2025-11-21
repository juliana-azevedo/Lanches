import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import listarEntradas from "../../service/get/listarEntradas";
import criarEntrada from "../../service/post/criarEntrada";
import atualizarEntrada from "../../service/put/atualizarEntrada";
import deletarEntrada from "../../service/delete/deletarEntrada";
import Alerta, { type alertProps } from "../../components/alerta";
import ConfirmDialog from "../../components/confirmDialog";

interface Entrada {
  id: number;
  quantidade: number;
  fornecedor: string;
  data_entrada: string;
  produto_nome: string;
  produto_estoque: number;
  estoque_produto_id: number;
}

export default function AdminDeposito() {
  const [entradas, setEntradas] = useState<Entrada[]>([]);
  const [alertP, setAlertP] = useState<alertProps | null>(null);
  const [busca, setBusca] = useState("");
  
  // Form states
  const [form, setForm] = useState({
    nome_produto: "",
    quantidade: "",
    fornecedor: "",
  });
  const [editando, setEditando] = useState<number | null>(null);

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    if (alertP !== null) {
      const timer = setTimeout(() => setAlertP(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alertP]);

  const carregarDados = async () => {
    const dadosEntradas = await listarEntradas();
    if (dadosEntradas) setEntradas(dadosEntradas);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.nome_produto || !form.quantidade || !form.fornecedor) {
      return setAlertP({ id: 1, text: "Preencha todos os campos!" });
    }

    const qtd = parseInt(form.quantidade);
    if (qtd <= 0) {
      return setAlertP({ id: 1, text: "Quantidade deve ser maior que zero." });
    }

    if (editando) {
      const res = await atualizarEntrada(editando, qtd, form.fornecedor);
      if (res.success) {
        setAlertP({ id: 0, text: "Entrada atualizada com sucesso!" });
        setEditando(null);
        setForm({ nome_produto: "", quantidade: "", fornecedor: "" });
        carregarDados();
      } else {
        setAlertP({ id: 1, text: "Erro ao atualizar entrada." });
      }
    } else {
      const res = await criarEntrada(form.nome_produto, qtd, form.fornecedor);
      if (res.success) {
        setAlertP({ id: 0, text: "Entrada registrada com sucesso!" });
        setForm({ nome_produto: "", quantidade: "", fornecedor: "" });
        carregarDados();
      } else {
        setAlertP({ id: 1, text: "Erro ao registrar entrada." });
      }
    }
  };

  const handleEditar = (entrada: Entrada) => {
    setEditando(entrada.id);
    setForm({
      nome_produto: entrada.produto_nome,
      quantidade: entrada.quantidade.toString(),
      fornecedor: entrada.fornecedor,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteClick = (id: number) => {
    setSelectedId(id);
    setOpenDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedId) {
      const res = await deletarEntrada(selectedId);
      if (res.success) {
        setAlertP({ id: 0, text: "Entrada excluída com sucesso!" });
        carregarDados();
      } else {
        setAlertP({ id: 1, text: "Erro ao excluir entrada." });
      }
    }
    setOpenDialog(false);
  };

  const entradasFiltradas = entradas.filter((e) =>
    e.produto_nome.toLowerCase().includes(busca.toLowerCase()) ||
    e.fornecedor.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="min-h-screen p-10 bg-gray-100">
      <Alerta id={alertP?.id} text={alertP?.text} />
      <ConfirmDialog
        open={openDialog}
        title="Tem certeza que deseja excluir esta entrada? O estoque será reduzido."
        onCancel={() => setOpenDialog(false)}
        onConfirm={handleConfirmDelete}
      />

      <h1 className="text-4xl font-extrabold text-center mb-10 text-gray-800">
        📦 Gestão de Depósito (Insumos)
      </h1>

      {/* Formulário */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-2xl p-6 max-w-4xl mx-auto mb-12 border border-gray-200"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-700 border-b pb-2">
          {editando ? "✏️ Editar Entrada" : "➕ Nova Entrada de Estoque"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block font-medium text-gray-600 mb-1">Produto / Insumo</label>
            <input
              type="text"
              name="nome_produto"
              placeholder="Ex: Pão, Ovo, Leite..."
              value={form.nome_produto}
              onChange={handleChange}
              disabled={!!editando} // Não permitir trocar nome na edição para simplificar
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none disabled:bg-gray-200"
            />
            {editando && <p className="text-xs text-gray-500 mt-1">Nome não pode ser alterado na edição.</p>}
          </div>

          <div>
            <label className="block font-medium text-gray-600 mb-1">Quantidade</label>
            <input
              type="number"
              name="quantidade"
              min="1"
              value={form.quantidade}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-600 mb-1">Fornecedor</label>
            <input
              type="text"
              name="fornecedor"
              value={form.fornecedor}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-lg transition shadow-md"
          >
            {editando ? "Salvar Alterações" : "Registrar Entrada"}
          </button>
          {editando && (
            <button
              type="button"
              onClick={() => {
                setEditando(null);
                setForm({ nome_produto: "", quantidade: "", fornecedor: "" });
              }}
              className="bg-gray-400 hover:bg-gray-500 text-white font-semibold px-4 py-2.5 rounded-lg transition shadow-md"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Lista */}
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg text-gray-700">Histórico de Entradas</h3>
          <input
            type="text"
            placeholder="🔎 Buscar produto ou fornecedor..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-80 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-bold">
              <tr>
                <th className="py-3 px-6">Produto / Insumo</th>
                <th className="py-3 px-6 text-center">Qtd. Entrada</th>
                <th className="py-3 px-6 text-center">Estoque Atual (Total)</th>
                <th className="py-3 px-6">Fornecedor</th>
                <th className="py-3 px-6">Data Entrada</th>
                <th className="py-3 px-6 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entradasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    Nenhuma entrada encontrada.
                  </td>
                </tr>
              ) : (
                entradasFiltradas.map((entrada) => (
                  <tr key={entrada.id} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-6 font-medium">{entrada.produto_nome}</td>
                    <td className="py-3 px-6 text-center font-bold text-green-600">
                      +{entrada.quantidade}
                    </td>
                    <td className="py-3 px-6 text-center font-bold text-blue-600">
                      {entrada.produto_estoque}
                    </td>
                    <td className="py-3 px-6">{entrada.fornecedor}</td>
                    <td className="py-3 px-6 text-gray-500">
                      {new Date(entrada.data_entrada).toLocaleString()}
                    </td>
                    <td className="py-3 px-6 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEditar(entrada)}
                          className="bg-yellow-400 hover:bg-yellow-500 text-white px-2 py-1 rounded shadow-sm"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteClick(entrada.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded shadow-sm"
                          title="Excluir"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
