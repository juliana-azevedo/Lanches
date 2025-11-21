import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import getVendasPorPeriodo from "../../service/get/getVendasPorPeriodo";
import getPedidosPorPagamento from "../../service/get/getPedidosPorPagamento";
import getLucroPorProduto from "../../service/get/getLucroPorProduto";
import listarCategoria from "../../service/get/listarCategoria";
import listarProduto from "../../service/get/listarProduto";
import Alerta, { type alertProps } from "../../components/alerta";
import type { Categoria, Produto } from "../../contexts/mainContext";

interface VendasData {
  produto: string;
  categoria: string;
  quantidade_vendida: number;
  total_vendido: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface PagamentosData {
  pagamento: string;
  quantidade: number;
  total_valor: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface LucroData {
  produto: string;
  quantidade_vendida: number;
  lucro_total: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export default function AdminRelatorios() {
  const [tab, setTab] = useState(0);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [alertP, setAlertP] = useState<alertProps | null>(null);

  // Dados dos gráficos
  const [vendasData, setVendasData] = useState<VendasData[]>([]);
  const [pagamentosData, setPagamentosData] = useState<PagamentosData[]>([]);
  const [lucroData, setLucroData] = useState<LucroData[]>([]);

  // Filtros extras
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaId, setCategoriaId] = useState("");
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [produtoId, setProdutoId] = useState("");

  useEffect(() => {
    const carregarFiltros = async () => {
      const cats = await listarCategoria();
      if (cats) setCategorias(cats);
      const prods = await listarProduto();
      if (prods && prods.success && prods.data) setProdutos(prods.data);
    };
    carregarFiltros();
  }, []);

  const gerarRelatorio = async () => {
    if (!dataInicio || !dataFim) {
      setAlertP({ id: 1, text: "Selecione o período (Data Inicial e Final)!" });
      return;
    }

    if (tab === 0) {
      const data = await getVendasPorPeriodo(
        dataInicio,
        dataFim,
        categoriaId ? parseInt(categoriaId) : undefined
      );
      setVendasData(data);
    } else if (tab === 1) {
      const data = await getPedidosPorPagamento(
        dataInicio,
        dataFim
      );
      setPagamentosData(data);
    } else if (tab === 2) {
      const data = await getLucroPorProduto(
        dataInicio,
        dataFim,
        produtoId ? parseInt(produtoId) : undefined
      );
      setLucroData(data);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderCustomBarLabel = (props: any) => {
    const { x, y, width, index } = props;
    const total = vendasData[index]?.total_vendido;
    return (
      <text x={x + width / 2} y={y} dy={-10} fill="#666" textAnchor="middle">
        {`R$ ${total}`}
      </text>
    );
  };

  return (
    <div className="min-h-screen p-10 bg-gray-100">
      <Alerta id={alertP?.id} text={alertP?.text} />
      <h1 className="text-4xl font-extrabold text-center mb-10 text-gray-800">
        📊 Relatórios Gerenciais
      </h1>

      <div className="bg-white shadow-md rounded-2xl p-6 max-w-6xl mx-auto mb-8">
        {/* Tabs */}
        <div className="flex border-b mb-6">
          <button
            className={`flex-1 py-2 font-bold ${
              tab === 0
                ? "border-b-4 border-blue-500 text-blue-600"
                : "text-gray-500"
            }`}
            onClick={() => setTab(0)}
          >
            🍔 Lanches Mais Vendidos
          </button>
          <button
            className={`flex-1 py-2 font-bold ${
              tab === 1
                ? "border-b-4 border-green-500 text-green-600"
                : "text-gray-500"
            }`}
            onClick={() => setTab(1)}
          >
            💳 Vendas por Pagamento
          </button>
          <button
            className={`flex-1 py-2 font-bold ${
              tab === 2
                ? "border-b-4 border-purple-500 text-purple-600"
                : "text-gray-500"
            }`}
            onClick={() => setTab(2)}
          >
            💰 Lucro por Produto
          </button>
        </div>

        {/* Filtros Comuns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 items-end">
          <div>
            <label className="block font-medium text-gray-600 mb-1">
              Data Inicial
            </label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block font-medium text-gray-600 mb-1">
              Data Final
            </label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Filtros Específicos */}
          {tab === 0 && (
            <div>
              <label className="block font-medium text-gray-600 mb-1">
                Categoria
              </label>
              <select
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Todas</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Filtro de Situação removido para tab === 1 */}

          {tab === 2 && (
            <div>
              <label className="block font-medium text-gray-600 mb-1">
                Produto
              </label>
              <select
                value={produtoId}
                onChange={(e) => setProdutoId(e.target.value)}
                className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Todos</option>
                {produtos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={gerarRelatorio}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition shadow-md h-10"
          >
            Gerar Relatório
          </button>
        </div>

        {/* Gráficos */}
        <div className="h-96 w-full">
          {tab === 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vendasData} margin={{ top: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="produto" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="quantidade_vendida"
                  name="Qtd. Vendida"
                  fill="#8884d8"
                >
                  <LabelList content={renderCustomBarLabel} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          {tab === 1 && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pagamentosData} margin={{ top: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="pagamento" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="quantidade"
                  name="Quantidade"
                  fill="#82ca9d"
                />
              </BarChart>
            </ResponsiveContainer>
          )}

          {tab === 2 && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lucroData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="produto" />
                <YAxis />
                <Tooltip formatter={(value: number) => `R$ ${value}`} />
                <Legend />
                <Bar
                  dataKey="lucro_total"
                  name="Lucro Total (R$)"
                  fill="#ffc658"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
