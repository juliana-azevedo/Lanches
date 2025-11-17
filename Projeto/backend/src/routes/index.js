import { Router } from "express";
import { atualizarCategoria, criarCategoria, deletarCategoria, listarCategoria } from "./controllers/categoria.js";
import { atualizarProduto, criarProduto, deletarProduto, listarProduto } from "./controllers/produto.js";
import { atualizarPermissao, createUser, deletarUsuario, getAllUsers, getMe, login, updateMe } from "./controllers/user.js";
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

// router.post("/add", adicionarItemCarrinho);
// router.get("/list", listarCarrinho);
// router.put("/update", atualizarItemCarrinho);
// router.delete("/delete", removerItemCarrinho);

export default router;
