import { Route, Routes, useLocation } from "react-router-dom";
import Default from "./pages/default/page";
import Categoria from "./pages/categoria/page";
import Produto from "./pages/produto/page";
import Login from "./pages/login/page";
import Register from "./pages/register/page";


export default function App() {

  const location = useLocation();

  return (
    <Routes location={location} key={location.pathname}>
        <Route path="*" element={<Default />} />
       {/*  <Route path="/" element={<Home />} /> */}
         <Route path="/produto" element={<Produto />} />
         <Route path="/categoria" element={<Categoria />} />
         <Route path="/login" element={<Login />} />
         <Route path="/register" element={<Register />} />
      </Routes>
  )
  
}
