import type { User } from "../../pages/usuarios/page";
import { api } from "../api.service";

export default async function listarUsuarios(): Promise<User[]> {
  try {
    const response = await api.get<User[]>("/user/listarUsuarios");

    console.log(JSON.stringify(response.data, null, 2))

    const returnResponse: User[] = response.data.map((itemApi) => {
      return {
        id: itemApi.id,
        username: itemApi.username,
        email: itemApi.email, 
        endereco: itemApi.endereco,
        telefone: itemApi.telefone,
        isadmin: itemApi.isadmin
      };
    });

    

    return returnResponse;  
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    throw error;
  }
}
