import pool from "../../../DB/database.js";

export async function criarEntrada(req, res) {
  const client = await pool.connect();
  try {
    // Agora recebe 'nome_produto' em vez de 'produto_id'
    const { nome_produto, quantidade, fornecedor } = req.body;

    if (quantidade <= 0) {
      return res.status(400).json({ erro: "Quantidade deve ser maior que zero." });
    }

    if (!nome_produto || !fornecedor) {
      return res.status(400).json({ erro: "Nome do produto e fornecedor são obrigatórios." });
    }

    await client.query('BEGIN');

    // 1. Verificar se o produto já existe no estoque_produtos
    let estoqueId;
    const checkProduto = await client.query(
      "SELECT id FROM estoque_produtos WHERE LOWER(nome) = LOWER($1)",
      [nome_produto]
    );

    if (checkProduto.rowCount > 0) {
      estoqueId = checkProduto.rows[0].id;
    } else {
      // Criar novo produto no estoque
      const newProduto = await client.query(
        "INSERT INTO estoque_produtos (nome, quantidade) VALUES ($1, 0) RETURNING id",
        [nome_produto]
      );
      estoqueId = newProduto.rows[0].id;
    }

    // 2. Inserir entrada no depósito
    const insertQuery = `
      INSERT INTO deposito (estoque_produto_id, quantidade, fornecedor)
      VALUES ($1, $2, $3)
      RETURNING id;
    `;
    const result = await client.query(insertQuery, [estoqueId, quantidade, fornecedor]);
    const entradaId = result.rows[0].id;

    // 3. Atualizar estoque total do produto
    const updateQuery = `
      UPDATE estoque_produtos
      SET quantidade = quantidade + $1
      WHERE id = $2;
    `;
    await client.query(updateQuery, [quantidade, estoqueId]);

    await client.query('COMMIT');

    res.status(201).json({ message: "Entrada registrada com sucesso!", id: entradaId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ erro: "Erro ao registrar entrada." });
  } finally {
    client.release();
  }
}

export async function listarEntradas(req, res) {
  try {
    // Join com estoque_produtos para pegar o nome e o estoque total
    const query = `
      SELECT d.id, d.quantidade, d.fornecedor, d.data_entrada,
             ep.nome as produto_nome, ep.quantidade as produto_estoque, ep.id as estoque_produto_id
      FROM deposito d
      JOIN estoque_produtos ep ON d.estoque_produto_id = ep.id
      ORDER BY ep.nome ASC, d.data_entrada DESC;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao listar entradas." });
  }
}

export async function atualizarEntrada(req, res) {
  const client = await pool.connect();
  try {
    const { id, quantidade, fornecedor } = req.body;

    if (quantidade <= 0) {
      return res.status(400).json({ erro: "Quantidade deve ser maior que zero." });
    }

    await client.query('BEGIN');

    // Buscar entrada antiga
    const oldEntryResult = await client.query("SELECT quantidade, estoque_produto_id FROM deposito WHERE id = $1", [id]);
    if (oldEntryResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ erro: "Entrada não encontrada." });
    }
    const oldEntry = oldEntryResult.rows[0];
    const diff = quantidade - oldEntry.quantidade;

    // Atualizar entrada
    const updateEntryQuery = `
      UPDATE deposito
      SET quantidade = $1, fornecedor = $2
      WHERE id = $3;
    `;
    await client.query(updateEntryQuery, [quantidade, fornecedor, id]);

    // Atualizar estoque do produto se houve mudança na quantidade
    if (diff !== 0) {
      const updateStockQuery = `
        UPDATE estoque_produtos
        SET quantidade = quantidade + $1
        WHERE id = $2;
      `;
      await client.query(updateStockQuery, [diff, oldEntry.estoque_produto_id]);
    }

    await client.query('COMMIT');

    res.json({ message: "Entrada atualizada com sucesso!" });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ erro: "Erro ao atualizar entrada." });
  } finally {
    client.release();
  }
}

export async function deletarEntrada(req, res) {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    await client.query('BEGIN');

    // Buscar entrada
    const oldEntryResult = await client.query("SELECT quantidade, estoque_produto_id FROM deposito WHERE id = $1", [id]);
    if (oldEntryResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ erro: "Entrada não encontrada." });
    }
    const oldEntry = oldEntryResult.rows[0];

    // Remover entrada
    await client.query("DELETE FROM deposito WHERE id = $1", [id]);

    // Atualizar estoque (subtrair)
    const updateStockQuery = `
      UPDATE estoque_produtos
      SET quantidade = quantidade - $1
      WHERE id = $2;
    `;
    await client.query(updateStockQuery, [oldEntry.quantidade, oldEntry.estoque_produto_id]);

    await client.query('COMMIT');

    res.json({ message: "Entrada excluída com sucesso!" });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ erro: "Erro ao excluir entrada." });
  } finally {
    client.release();
  }
}
