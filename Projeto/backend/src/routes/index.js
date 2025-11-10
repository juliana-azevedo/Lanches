import { Router } from "express";
import { atualizarCategoria, criarCategoria, deletarCategoria, listarCategoria } from "./controllers/categoria.js";
import { atualizarProduto, criarProduto, deletarProduto, listarProduto } from "./controllers/produto.js";
import { createUser, login } from "./controllers/user.js";


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


export default router;
