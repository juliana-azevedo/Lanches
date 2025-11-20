import { useEffect, useState } from "react";
import { useMainContext } from "../../contexts/context";
import Alerta, { type alertProps } from "../../components/alerta";

import { criarPedido } from "../../service/post/criarPedido";
import { useNavigate } from "react-router-dom";

export default function Carrinho() {
  const { carrinho, setCarrinho } = useMainContext();
  const [alertP, setAlertP] = useState<alertProps | null>();
  const navigate = useNavigate();

  useEffect(()=> {
    console.log(carrinho)
  },[])

  const removerItem = (id: number) => {
    setCarrinho(carrinho.filter((item) => item.id !== id));
  };

  const aumentar = (id: number) => {
    const novo = carrinho.map((item) =>
      item.id === id ? { ...item, quantidade: item.quantidade + 1 } : item
    );
    setCarrinho(novo);
  };

  const diminuir = (id: number) => {
    const item = carrinho.find((i) => i.id === id);
    if (!item) return;

    if (item.quantidade === 1) {
      removerItem(id);
      return;
    }

    const novo = carrinho.map((i) =>
      i.id === id ? { ...i, quantidade: item.quantidade - 1 } : i
    );

    setCarrinho(novo);
  };

  const total = carrinho
    .reduce((acc, item) => acc + item.preco * item.quantidade, 0)
    .toFixed(2);

    useEffect(() => {
        if (alertP !== null) {
            const timer = setTimeout(() => {
            setAlertP(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [alertP]);

    const finalizarPedido = async () => {
      try {
        await criarPedido(carrinho, parseFloat(total));
        setCarrinho([]);
        setAlertP({ id: 0, text: "Pedido finalizado com sucesso!" });
        setTimeout(() => navigate("/meus-pedidos"), 2000);
      } catch (error) {
        console.error(error);
        setAlertP({ id: 1, text: "Erro ao finalizar pedido." });
      }
    };

  return (
    <div className="min-h-screen p-10 bg-yellow-50">

    <Alerta id={alertP?.id} text={alertP?.text} />

      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-3xl p-8 border border-yellow-300">
        <h1 className="text-4xl font-extrabold text-red-600 mb-6 text-center">
          🛒 Carrinho de Compras
        </h1>

        {carrinho.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">
            Seu carrinho está vazio 😕
          </p>
        ) : (
          <div className="space-y-6">
            {carrinho.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between bg-yellow-100 p-4 rounded-2xl shadow-md"
              >
                <div>
                  <h2 className="text-xl font-semibold text-red-700">
                    {item.nome}
                  </h2>
                  <p className="text-gray-700">
                    Preço: <strong>R$ {item.preco}</strong>
                  </p>
                  <p className="text-gray-700">
                    Subtotal:{" "}
                    <strong>
                      R$ {(item.preco * item.quantidade)}
                    </strong>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Quantidade */}
                  <button
                    onClick={() => diminuir(item.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg"
                  >
                    -
                  </button>

                  <span className="font-bold text-lg">{item.quantidade}</span>

                  <button
                    onClick={() => aumentar(item.id)}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg"
                  >
                    +
                  </button>

                  {/* Remover */}
                  <button
                    onClick={() => removerItem(item.id)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg ml-4"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}

            {/* TOTAL */}
            <div className="text-right text-2xl font-bold text-red-700 mt-8">
              Total: R$ {total}
            </div>

            <button
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl text-lg shadow-lg mt-4"
              onClick={finalizarPedido}
            >
              Finalizar Pedido
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
