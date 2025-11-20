import { useEffect, useState } from "react";
import listarPedidos from "../../service/get/listarPedidos";
import atualizarStatusPedido from "../../service/put/atualizarStatusPedido";
import deletarPedido from "../../service/delete/deletarPedido";
import { useNavigate } from "react-router-dom";
import Alerta, { type alertProps } from "../../components/alerta";

interface ItemPedido {
  nome: string;
  quantidade: number;
  preco: number;
}

interface Pedido {
  id: number;
  data: string;
  total: string;
  status: string;
  cliente: string;
  itens: ItemPedido[];
}

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [alertP, setAlertP] = useState<alertProps | null>();
  const navigate = useNavigate();

  const fetchPedidos = async () => {
    const data = await listarPedidos();
    if (data) setPedidos(data);
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  useEffect(() => {
    if (alertP !== null) {
      const timer = setTimeout(() => {
        setAlertP(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alertP]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await atualizarStatusPedido(id, newStatus);
      setAlertP({ id: 0, text: "Status atualizado com sucesso!" });
      fetchPedidos();
    } catch (error) {
      console.error(error);
      setAlertP({ id: 1, text: "Erro ao atualizar status." });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este pedido?")) return;
    try {
      await deletarPedido(id);
      setAlertP({ id: 0, text: "Pedido excluído com sucesso!" });
      fetchPedidos();
    } catch (error) {
      console.error(error);
      setAlertP({ id: 1, text: "Erro ao excluir pedido. Verifique se está Cancelado ou Entregue." });
    }
  };

  const statusOptions = ["Pendente", "Preparando", "Saiu para entrega", "Entregue", "Cancelado"];

  return (
    <div className="min-h-screen p-10 bg-gray-100">
      <Alerta id={alertP?.id} text={alertP?.text} />
      
      <div className="flex justify-between items-center mb-8 max-w-6xl mx-auto">
         <button
          onClick={() => navigate("/produto")}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg shadow-md"
        >
          ⬅ Voltar
        </button>
        <h1 className="text-4xl font-extrabold text-gray-800">
          📋 Gerenciar Pedidos
        </h1>
        <div className="w-24"></div> {/* Spacer */}
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {pedidos.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">
            Nenhum pedido encontrado.
          </p>
        ) : (
          pedidos.map((pedido) => (
            <div
              key={pedido.id}
              className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 flex flex-col md:flex-row gap-6"
            >
              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Pedido #{pedido.id} - {pedido.cliente}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {new Date(pedido.data).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">
                      R$ {pedido.total}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h3 className="font-semibold text-gray-700 mb-2 text-sm uppercase">Itens do Pedido:</h3>
                  <ul className="space-y-1 text-sm">
                    {pedido.itens && pedido.itens.map((item, idx) => (
                      <li key={idx} className="flex justify-between text-gray-600">
                        <span>
                          {item.quantidade}x {item.nome}
                        </span>
                        <span>R$ {item.preco}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex flex-col justify-between gap-4 md:w-64 border-l pl-0 md:pl-6 border-gray-100">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alterar Status
                  </label>
                  <select
                    value={pedido.status}
                    onChange={(e) => handleStatusChange(pedido.id, e.target.value)}
                    className={`w-full p-2 rounded-lg border-2 font-semibold outline-none ${
                        pedido.status === "Entregue" ? "border-green-200 bg-green-50 text-green-800" :
                        pedido.status === "Cancelado" ? "border-red-200 bg-red-50 text-red-800" :
                        "border-yellow-200 bg-yellow-50 text-yellow-800"
                    }`}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                {(pedido.status === "Cancelado" || pedido.status === "Entregue") && (
                  <button
                    onClick={() => handleDelete(pedido.id)}
                    className="w-full bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-2 rounded-lg transition-colors"
                  >
                    🗑️ Excluir Pedido
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
