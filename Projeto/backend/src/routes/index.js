import { Router } from "express";
import { atualizarCategoria, criarCategoria, deletarCategoria, listarCategoria } from "./controllers/categoria.js";
import { atualizarProduto, criarProduto, deletarProduto, listarProduto } from "./controllers/produto.js";
import { atualizarPermissao, createUser, deletarUsuario, getAllUsers, getMe, login, updateMe } from "./controllers/user.js";
import { criarPedido, listarPedidos, atualizarStatusPedido, deletarPedido } from "./controllers/pedido.js";
import { criarEntrada, listarEntradas, atualizarEntrada, deletarEntrada } from "./controllers/deposito.js";
import { authMiddleware } from "./controllers/authMiddleware.js";


const router = Router();

router.get("/", (req, res) => {
  res.send("API funcionando!");
});

router.get("/categoria/listarCategoria", listarCategoria);
router.post("/categoria/criarCategoria", criarCategoria);
router.put("/categoria/atualizarCategoria", atualizarCategoria);
router.delete("/categoria/deletarCategoria", deletarCategoria);

router.get("/produto/listarProduto", listarProduto);
router.post("/produto/criarProduto", criarProduto);
router.put("/produto/atualizarProduto", atualizarProduto);
router.delete("/produto/deletarProduto", deletarProduto);

router.post("/user/login", login);
router.post("/user/createUser", createUser);
router.get("/user/listarUsuarios", getAllUsers);
router.post("/user/atualizarPermissao", atualizarPermissao);
router.delete("/user/delete/:id", deletarUsuario);
router.get("/user/:id", authMiddleware, getMe);
router.put("/user/me", authMiddleware, updateMe);

router.post("/pedido/criar", authMiddleware, criarPedido);
router.get("/pedido/listar", authMiddleware, listarPedidos);
router.put("/pedido/atualizarStatus", authMiddleware, atualizarStatusPedido);
router.delete("/pedido/deletar/:id", authMiddleware, deletarPedido);

router.post("/deposito/criar", authMiddleware, criarEntrada);
router.get("/deposito/listar", authMiddleware, listarEntradas);
router.put("/deposito/atualizar", authMiddleware, atualizarEntrada);
router.delete("/deposito/deletar/:id", authMiddleware, deletarEntrada);

export default router;
