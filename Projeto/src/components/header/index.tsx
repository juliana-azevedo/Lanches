import { Link, useNavigate } from "react-router-dom";
import { useUserContext, useMainContext } from "../../contexts/context";

export default function Header() {
  const { user, setUser } = useUserContext();
  const { carrinho } = useMainContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <header className="bg-red-600 text-white shadow-md py-4 px-8 flex justify-between items-center">
      <div 
        className="text-2xl font-extrabold flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform" 
        onClick={() => navigate("/produto")}
      >
        🍔 +Lanches
      </div>

      <nav className="hidden md:flex gap-6 font-semibold items-center">
        <Link to="/produto" className="hover:text-yellow-300 transition">Cardápio</Link>
        
        {user ? (
          user.isAdmin ? (
            <>
              <Link to="/categoria" className="hover:text-yellow-300 transition">Categorias</Link>
              <Link to="/usuarios" className="hover:text-yellow-300 transition">Usuários</Link>
              <Link to="/admin/pedidos" className="hover:text-yellow-300 transition">Pedidos</Link>
              <Link to="/admin/deposito" className="hover:text-yellow-300 transition">Depósito</Link>
            </>
          ) : (
            <>
              <Link to="/meus-pedidos" className="hover:text-yellow-300 transition">Meus Pedidos</Link>
              <Link to="/carrinho" className="hover:text-yellow-300 transition flex items-center gap-1">
                Carrinho
                {carrinho.length > 0 && (
                  <span className="bg-yellow-400 text-red-700 text-xs rounded-full px-2 py-0.5">
                    {carrinho.reduce((acc, item) => acc + item.quantidade, 0)}
                  </span>
                )}
              </Link>
              <Link to="/perfil" className="hover:text-yellow-300 transition">Perfil</Link>
            </>
          )
        ) : (
          <>
             {/* Links for public/guest if needed, currently just Login button on right */}
          </>
        )}
      </nav>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            <span className="font-medium hidden sm:block">Olá, {user.username}</span>
            <button 
              onClick={handleLogout}
              className="bg-yellow-400 hover:bg-yellow-500 text-red-700 px-4 py-2 rounded-full font-bold transition shadow-sm"
            >
              Sair
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <Link 
              to="/login"
              className="text-white hover:text-yellow-300 font-semibold transition"
            >
              Entrar
            </Link>
            <Link 
              to="/register"
              className="bg-yellow-400 hover:bg-yellow-500 text-red-700 px-4 py-2 rounded-full font-bold transition shadow-sm"
            >
              Criar Conta
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
