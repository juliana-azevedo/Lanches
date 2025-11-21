import { Route, Routes, useLocation } from "react-router-dom";
import Default from "./pages/default/page";
import Categoria from "./pages/categoria/page";
import Produto from "./pages/produto/page";
import Login from "./pages/login/page";
import Register from "./pages/register/page";
import AdminClients from "./pages/usuarios/page";
import UserProfile from "./pages/perfil/page";
import AdminRoute, { AuthGuard } from "./authGuard";
import Carrinho from "./pages/carrinho/page";
import MeusPedidos from "./pages/meusPedidos/page";
import AdminPedidos from "./pages/adminPedidos/page";
import AdminDeposito from "./pages/adminDeposito/page";
import AdminRelatorios from "./pages/adminRelatorios/page";
import PublicLayout from "./components/layout";

export default function App() {

  const location = useLocation();

  return (
    <Routes location={location} key={location.pathname}>
       
        <Route element={<PublicLayout />}>
          <Route path="*" element={<Default />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        
        <Route element={<AuthGuard />}>
          <Route path="/produto" element={<Produto />} />
          <Route path="/perfil" element={<UserProfile />} />
          <Route path="/carrinho" element={<Carrinho />} />
          <Route path="/meus-pedidos" element={<MeusPedidos />} />
        </Route>

       <Route element={<AdminRoute />}>
          <Route path="/categoria" element={<Categoria />} />
          <Route path="/usuarios" element={<AdminClients />} />
          <Route path="/admin/pedidos" element={<AdminPedidos />} />
          <Route path="/admin/deposito" element={<AdminDeposito />} />
          <Route path="/admin/relatorios" element={<AdminRelatorios />} />
        </Route> 

      </Routes>
  )
  
}
