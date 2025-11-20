import { Navigate, Outlet } from "react-router-dom";
import { isTokenValid } from "../service/api.service";
import { useUserContext } from "../contexts/context";
import Header from "../components/header";


export const AuthGuard = () => {
  console.log(isTokenValid())
  return isTokenValid() ? (
    <>
      <Header />
      <Outlet />
    </>
  ) : <Navigate to="/login" replace />;
};

export default function AdminRoute() {
  const { user, loading } = useUserContext();

  if (loading) {
    return <div className="w-full h-screen flex items-center justify-center font-bold text-3xl text-black">Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.isAdmin) {
    return <div className="w-full h-screen flex items-center justify-center  font-bold text-3xl text-black">PERMISSÃO NEGADA!</div>;
  }

  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}