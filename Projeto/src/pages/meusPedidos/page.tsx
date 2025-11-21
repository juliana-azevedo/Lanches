import { useEffect, useState } from "react";
import listarPedidos from "../../service/get/listarPedidos";
import { useNavigate } from "react-router-dom";

interface ItemPedido {
  nome: string;
  quantidade: number;
  preco: number;
}

interface Pedido {
  id: number;
  data: string;
  pagamento: string;
  total: string;
  status: string;
  cliente: string;
  itens: ItemPedido[];
}

export default function MeusPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPedidos = async () => {
      const data = await listarPedidos();
      if (data) setPedidos(data);
    };
    fetchPedidos();
  }, []);

  return (
    <div className="min-h-screen p-10 bg-yellow-50">
      <button
        onClick={() => navigate("/produto")}
        className="mb-6 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-md"
      >
        ⬅ Voltar para o Cardápio
      </button>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-red-600 mb-8 text-center">
          📦 Meus Pedidos
        </h1>

        {pedidos.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">
            Você ainda não fez nenhum pedido. 🍔
          </p>
        ) : (
          <div className="space-y-6">
            {pedidos.map((pedido) => (
              <div
                key={pedido.id}
                className="bg-white shadow-xl rounded-3xl p-6 border border-yellow-300"
              >
                <div className="flex justify-between items-center mb-4 border-b pb-2 border-gray-200">
                  <div>
                    <h2 className="text-xl font-bold text-red-700">
                      Pedido #{pedido.id}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {new Date(pedido.data).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-bold ${
                        pedido.status === "Entregue"
                          ? "bg-green-100 text-green-700"
                          : pedido.status === "Cancelado"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {pedido.status}
                    </span>
                    <p className="text-lg font-bold text-gray-800 mt-1">
                      Total: R$ {pedido.total}
                    </p>

                    <p className="text-lg font-bold text-gray-800 mt-1">
                      Forma de pagamento: {pedido.pagamento.toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="font-semibold text-gray-700 mb-2">Itens:</h3>
                  <ul className="space-y-2">
                    {pedido.itens &&
                      pedido.itens.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex justify-between text-gray-600"
                        >
                          <span>
                            {item.quantidade}x {item.nome}
                          </span>
                          <span>R$ {item.preco}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
