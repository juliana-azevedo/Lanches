import pool from "../../../DB/database.js";


export async function criarCategoria(req, res) {
  try {
    const { nome, descricao } = req.body; // pega os dados do body

    const query = `
      INSERT INTO categorias (nome, descricao)
      VALUES ($1, $2)
      RETURNING id;
    `;
    const values = [nome, descricao];

    const result = await pool.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(200).json(false); // nome já existe
    }
    res.status(500).json({ erro: "Erro ao criar categoria" });
  }
}

export async function listarCategoria(req, res) {
  try {
    const result = await pool.query("SELECT * FROM categorias");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao buscar categorias" });
  }
}

export async function atualizarCategoria(req, res) {
  try {
    const {nome, id} = req.body
    const query = `UPDATE categorias SET nome = $1 WHERE id = $2`
    const values = [nome, id]

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      res.status(200).json("Categoria não encontrada!")
    } else {
       res.status(200).json("Categoria alterada com sucesso!")
    }
  } catch(error) {
    if (err.code === "23505") {
      return res.status(200).json(false); // nome já existe
    }
    res.status(500).json({ erro: "Erro ao editar nome" });
  }
}

export async function deletarCategoria(req, res) {
  try{
    const {id} = req.body
    const query = `DELETE FROM categorias WHERE id = $1`
    const values = [id]

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      res.status(200).json("Categoria não encontrada!")
    } else {
       res.status(200).json("Categoria excluida com sucesso!")
    }
  } catch(error) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao deletar categoria" });
  }
}
