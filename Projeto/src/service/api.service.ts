import axios, { type InternalAxiosRequestConfig } from "axios";
import { jwtDecode } from "jwt-decode";

export interface DecodedToken {
  id: string;
  username: string;
  email: string;
  endereco: string, 
  telefone: string,
  isAdmin: boolean;
  exp: number;
  iat: number;
}

export const decodeToken = (): DecodedToken | undefined => {
  const token = localStorage.getItem("token");

  if (!token) {
    return undefined;
  }

  const decodedToken: DecodedToken = jwtDecode(token);

  return decodedToken;
};

export const isTokenValid = (): boolean => {
  const decodedToken = decodeToken();

  if (!decodedToken) {
    return false;
  }

  const currentTime = Date.now() / 1000;

  return decodedToken.exp > currentTime;
};

export const api = axios.create({
  baseURL: "http://localhost:3000/api",
});


api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const publicRoutes = [
      "/user/login",
      "/user/createUser"
    ];

    if (config.url && publicRoutes.includes(config.url)) {
      return config;
    }

    if (isTokenValid()) {
      const token = localStorage.getItem("token");
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      localStorage.removeItem("token");

    if (window.location.pathname !== "/login" && window.location.pathname !== "register") {
      window.location.replace("/login");
    }

      return Promise.reject(new Error("Token expirado ou inválido."));
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);