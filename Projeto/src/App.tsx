import { Route, Routes, useLocation } from "react-router-dom";
import Default from "./pages/default/page";
import Categoria from "./pages/categoria/page";
import Produto from "./pages/produto/page";
import Login from "./pages/login/page";
import Register from "./pages/register/page";
import AdminClients from "./pages/usuarios/page";
import UserProfile from "./pages/perfil/page";
import AdminRoute, { AuthGuard } from "./authGuard";


export default function App() {

  const location = useLocation();

  return (
    <Routes location={location} key={location.pathname}>
       
        <Route path="*" element={<Default />} />
        <Route path="/produto" element={<Produto />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route element={<AuthGuard />}>
          <Route path="/perfil" element={<UserProfile />} />
        </Route>

       <Route element={<AdminRoute />}>
          <Route path="/categoria" element={<Categoria />} />
          <Route path="/usuarios" element={<AdminClients />} />
         
        </Route> 

      </Routes>
  )
  
}
