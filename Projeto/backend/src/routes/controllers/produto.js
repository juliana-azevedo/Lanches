import pool from "../../../DB/database.js";


export async function criarProduto(req, res) {
  try {
    const { nome, preco, categoria_id, descricao } = req.body; // pega os dados do body

    const query = `
      INSERT INTO produtos (nome, preco, categoria_id, descricao)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `;
    const values = [nome, preco, categoria_id, descricao];

    const result = await pool.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(200).json(false); // nome já existe
    }
    res.status(500).json({ erro: "Erro ao criar produtos" });
  }
}

export async function listarProduto(req, res) {
  try {
    const result = await pool.query("SELECT p.id, p.nome as nomeProduto, p.preco, p.descricao, c.nome as nomeCategoria, c.id as idCategoria FROM produtos p join categorias c on p.categoria_id = c.id");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao buscar produtos" });
  }
}

export async function atualizarProduto(req, res) {
  try {
    const {nome, preco, categoria_id, descricao, id} = req.body
    const query = `UPDATE produtos SET nome = $1, preco = $2, categoria_id = $3, descricao = $4 WHERE id = $5`
    const values = [nome, preco, categoria_id, descricao, id]

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      res.status(200).json("Produto não encontrada!")
    } else {
       res.status(200).json("Produto alterada com sucesso!")
    }
  } catch(error) {
    if (err.code === "23505") {
      return res.status(200).json(false); // nome já existe
    }
    res.status(500).json({ erro: "Erro ao editar nome" });
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
    console.error(err);
    res.status(500).json({ erro: "Erro ao deletar produtos" });
  }
}
