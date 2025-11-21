import pool from "../../../DB/database.js";

export async function criarProduto(req, res) {
  const client = await pool.connect();
  try {
    const { nome, preco, custo, categoria_id, descricao } = req.body;
    
    const result = await client.query(
      "INSERT INTO produtos (nome, preco, custo, categoria_id, descricao) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [nome, preco, custo || 0, categoria_id, descricao]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ message: "Produto já existe" });
    }
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
}

export async function listarProduto(req, res) {
  try {
    const result = await pool.query("SELECT p.id, p.nome as nomeProduto, p.preco, p.custo, p.descricao, c.nome as nomeCategoria, c.id as idCategoria FROM produtos p join categorias c on p.categoria_id = c.id");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao buscar produtos" });
  }
}

export async function atualizarProduto(req, res) {
  const client = await pool.connect();
  try {
    const { id, nome, preco, custo, categoria_id, descricao } = req.body;

    const result = await client.query(
      "UPDATE produtos SET nome = $1, preco = $2, custo = $3, categoria_id = $4, descricao = $5 WHERE id = $6 RETURNING *",
      [nome, preco, custo || 0, categoria_id, descricao, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
}

export async function deletarProduto(req, res) {
  try{
    const {id} = req.body
    const query = `DELETE FROM produtos WHERE id = $1`
    const values = [id]

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      res.status(200).json("Produto não encontrada!")
    } else {
       res.status(200).json("Produto excluida com sucesso!")
    }
  } catch(error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao deletar produtos" });
  }
}
