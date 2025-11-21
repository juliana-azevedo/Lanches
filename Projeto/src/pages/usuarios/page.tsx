import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import listarUsuarios from "../../service/get/listarUsuarios";
import atualizarUsuarioPermissao from "../../service/post/atualizarPermissao";
import ConfirmDialog from "../../components/confirmDialog";
import { deletarUsuario } from "../../service/delete/deletarUsuario";
import Alerta, { type alertProps } from "../../components/alerta";

export interface User {
  id: string;
  username: string;
  email: string;
  endereco?: string;
  telefone?: string;
  isadmin?: number;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function AdminClients() {
  const [clients, setClients] = useState<User[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [alertP, setAlertP] = useState<alertProps | null>(null);

  const [openAdminDialog, setOpenAdminDialog] = useState(false);
  const [selectedAdminUser, setSelectedAdminUser] = useState<User | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    setLoading(true);
    try {
      const res = (await listarUsuarios()) as User[] | null;

      const sorted = (res || [])
        .slice()
        .sort((a, b) =>
          a.username.localeCompare(b.username, "pt-BR", { sensitivity: "base" })
        );

      setClients(sorted);
    } catch (err: unknown) {
      const error = err as ApiError;
      setAlertP({
        id: 1,
        text: error?.response?.data?.message || "Erro ao carregar clientes.",
      });
    } finally {
      setLoading(false);
    }
  }

  function filteredClients() {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) =>
      `${c.username} ${c.email}`.toLowerCase().includes(q)
    );
  }

  function openToggleAdminDialog(client: User) {
    setSelectedAdminUser(client);
    setOpenAdminDialog(true);
  }

  async function toggleAdmin() {
    if (!selectedAdminUser) return;

    const client = selectedAdminUser;
    setSavingId(client.id);

    try {
      const updated = await atualizarUsuarioPermissao(
        client.id,
        client.isadmin === 1 ? 0 : 1
      );

      if (!updated.success) {
        setAlertP({
          id: 1,
          text: "Erro ao atualizar cargo. Tente novamente.",
        });
        return;
      }

      setClients((prev) =>
        prev
          .map((p) =>
            p.id === client.id ? { ...p, isadmin: updated.data } : p
          )
          .sort((a, b) =>
            a.username.localeCompare(b.username, "pt-BR", {
              sensitivity: "base",
            })
          )
      );

      setAlertP({
        id: 0,
        text: "Cargo atualizado com sucesso!",
      });
    } catch (err: unknown) {
      const error = err as ApiError;
      setAlertP({
        id: 1,
        text: error?.response?.data?.message || "Erro ao atualizar cargo.",
      });
    } finally {
      setSavingId(null);
      setOpenAdminDialog(false);
    }
  }

  async function handleDeletar(id: string) {
    const result = await deletarUsuario(id);

    if (result.success) {
      setClients((prev) => prev.filter((c) => c.id !== id));

      setAlertP({
        id: 0,
        text: "Usuário removido com sucesso!",
      });
    } else {
      setAlertP({
        id: 1,
        text: "Erro ao deletar o usuário.",
      });
    }
  }

  useEffect(() => {
    if (alertP !== null) {
      const timer = setTimeout(() => {
        setAlertP(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alertP]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Alerta id={alertP?.id} text={alertP?.text} />

      {/* Dialog excluir */}
      <ConfirmDialog
        open={open}
        title="Você tem certeza que deseja excluir esse usuário?"
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          if (selectedId) handleDeletar(selectedId);
          setOpen(false);
        }}
      />

      {/* Dialog alterar admin */}
      <ConfirmDialog
        open={openAdminDialog}
        title={
          selectedAdminUser?.isadmin === 1
            ? `Remover permissão de administrador de ${selectedAdminUser?.username}?`
            : `Conceder permissão de administrador a ${selectedAdminUser?.username}?`
        }
        onCancel={() => setOpenAdminDialog(false)}
        onConfirm={toggleAdmin}
      />

      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Gerenciar Clientes</h1>

          <div className="flex gap-2">
            <button
              onClick={() => navigate("/produto")}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Voltar
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
            <div className="flex items-center w-full sm:w-1/2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Pesquisar por nome ou email"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
              />
            </div>

            <div className="text-sm text-gray-500">
              {loading
                ? "Carregando clientes..."
                : `${clients.length} clientes`}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-auto text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b">
                  <th className="py-3 px-2">Usuário</th>
                  <th className="py-3 px-2">Email</th>
                  <th className="py-3 px-2">Endereço</th>
                  <th className="py-3 px-2">Telefone</th>
                  <th className="py-3 px-2">Cargo</th>
                  <th className="py-3 px-2">Ações</th>
                </tr>
              </thead>

              <tbody>
                {filteredClients().length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-500">
                      Nenhum cliente encontrado.
                    </td>
                  </tr>
                )}

                {filteredClients().map((client) => (
                  <tr
                    key={client.id}
                    className="border-b hover:bg-gray-50"
                    onDoubleClick={() => openToggleAdminDialog(client)}
                  >
                    <td className="py-3 px-2">{client.username}</td>
                    <td className="py-3 px-2">{client.email}</td>
                    <td className="py-3 px-2">{client.endereco || "—"}</td>
                    <td className="py-3 px-2">{client.telefone || "—"}</td>

                    <td className="py-3 px-2">
                      {client.isadmin === 1 ? (
                        <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Admin
                        </span>
                      ) : (
                        <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                          Cliente
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-2">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openToggleAdminDialog(client);
                          }}
                          disabled={savingId === client.id}
                          className="px-3 py-1 rounded-lg border hover:bg-gray-50"
                        >
                          {savingId === client.id
                            ? "Salvando..."
                            : client.isadmin === 1
                            ? "Remover Admin"
                            : "Tornar Admin"}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedId(client.id);
                            setOpen(true);
                          }}
                          className="px-3 py-1 rounded-lg border hover:bg-gray-50"
                        >
                          DELETAR
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
