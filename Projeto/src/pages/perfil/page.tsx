import React, { useEffect, useState } from "react";
import Alerta, { type alertProps } from "../../components/alerta";
import getUsuario from "../../service/get/listarInfoUsuario";
import atualizarUsuario from "../../service/put/putUsuario";
import { useUserContext } from "../../contexts/context";

interface UserProfileData {
  id: string;
  username: string;
  email: string;
  endereco?: string;
  telefone?: string;
}

export default function UserProfile() {
  const {user} = useUserContext()
  const [userInfo, setUserInfo] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [alertP, setAlertP] = useState<alertProps | null>(null);

  // campos editáveis
  const [endereco, setEndereco] = useState("");
  const [telefone, setTelefone] = useState("");

  useEffect(() => {
    carregarDados();
  }, [user]);

  async function carregarDados() {
    setLoading(true);
    try {
      if (user?.id) {
        console.log("entrei nessa porra imunda")
        const dados = await getUsuario(user.id); // retorna { id, username, email, endereco, telefone }
        setUserInfo(dados);
        setEndereco(dados.endereco || "");
        setTelefone(dados.telefone || "");
      }
    } catch (err) {
      setAlertP({ id: 1, text: "Erro ao carregar dados do usuário." });
    } finally {
      setLoading(false);
    }
  }

  async function salvar() {
    if (!userInfo) return;

    if (telefone.length < 8) {
      return setAlertP({ id: 2, text: "Telefone inválido." });
    }

    if (endereco.length < 8) {
      return setAlertP({ id: 2, text: "Endereço inválido." });
    }

    setSaving(true);

    try {
      const result = await atualizarUsuario({ endereco, telefone });

      if (!result.success) {
        return setAlertP({
          id: 1,
          text: "Erro ao atualizar informações.",
        });
      }

      setUserInfo((prev) => (prev ? { ...prev, endereco, telefone } : prev));

      setAlertP({
        id: 0,
        text: "Informações atualizadas com sucesso!",
      });
    } catch (err) {
      setAlertP({
        id: 1,
        text: "Erro inesperado ao salvar.",
      });
    } finally {
      setSaving(false);
    }
  }

  // esconder alerta após 5s
  useEffect(() => {
    if (alertP !== null) {
      const timer = setTimeout(() => setAlertP(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alertP]);

  if (loading || !userInfo) {
    return (
      <div className="p-6 text-center text-gray-600">
        Carregando informações...
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow mt-8">
      <Alerta id={alertP?.id} text={alertP?.text} />

      <h1 className="text-2xl font-semibold mb-6">Minhas Informações</h1>

      {/* Nome */}
      <div className="mb-4">
        <label className="block font-medium text-gray-600 mb-1">Nome</label>
        <input
          value={userInfo.username}
          disabled
          className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-gray-500"
        />
      </div>

      {/* Email */}
      <div className="mb-4">
        <label className="block font-medium text-gray-600 mb-1">Email</label>
        <input
          value={userInfo.email}
          disabled
          className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-gray-500"
        />
      </div>

      {/* Endereço */}
      <div className="mb-4">
        <label className="block font-medium text-gray-600 mb-1">Endereço</label>
        <input
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
          placeholder="Digite seu endereço"
          className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-300"
        />
      </div>

      {/* Telefone */}
      <div className="mb-6">
        <label className="block font-medium text-gray-600 mb-1">Telefone</label>
        <input
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          placeholder="Digite seu telefone"
          className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-300"
        />
      </div>

      {/* Botão salvar */}
      <button
        onClick={salvar}
        disabled={saving}
        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition
                   disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {saving ? "Salvando..." : "Salvar alterações"}
      </button>
    </div>
  );
}
