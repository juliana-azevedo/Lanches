export async function adicionarItemCarrinho(req, res) {
  try {
    const { usuario_id, produto_id, quantidade } = req.body;

    // 1. Validar se o usuário existe
    const userCheck = await pool.query(
      "SELECT id FROM usuarios WHERE id = $1",
      [usuario_id]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    // 2. Buscar produto
    const prodResult = await pool.query(
      "SELECT preco FROM produtos WHERE id = $1",
      [produto_id]
    );

    if (prodResult.rows.length === 0) {
      return res.status(404).json({ erro: "Produto não encontrado" });
    }

    const precoUnitario = prodResult.rows[0].preco;
    const precoTotal = precoUnitario * quantidade;

    // 3. Verificar se item já existe no carrinho desse usuário
    const existing = await pool.query(
      `SELECT id, quantidade 
       FROM carrinho_itens 
       WHERE usuario_id = $1 AND produto_id = $2`,
      [usuario_id, produto_id]
    );

    if (existing.rows.length > 0) {
      const novoTotal = existing.rows[0].quantidade + quantidade;
      const novoPrecoTotal = novoTotal * precoUnitario;

      await pool.query(
        `UPDATE carrinho_itens
         SET quantidade = $1, preco_total = $2
         WHERE id = $3`,
        [novoTotal, novoPrecoTotal, existing.rows[0].id]
      );

      return res.json({ msg: "Quantidade atualizada no carrinho" });
    }

    // 4. Adicionar novo item
    const result = await pool.query(
      `INSERT INTO carrinho_itens (usuario_id, produto_id, quantidade, preco_unitario, preco_total)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [usuario_id, produto_id, quantidade, precoUnitario, precoTotal]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao adicionar item ao carrinho" });
  }
}

export async function listarCarrinho(req, res) {
  try {
    const { usuario_id } = req.params;

    const result = await pool.query(
      `SELECT ci.id, ci.quantidade, ci.preco_unitario, ci.preco_total,
              p.nome, p.descricao, p.preco
       FROM carrinho_itens ci
       JOIN produtos p ON p.id = ci.produto_id
       WHERE ci.usuario_id = $1`,
      [usuario_id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao listar carrinho" });
  }
}
export async function atualizarItemCarrinho(req, res) {
  try {
    const { id, usuario_id, quantidade } = req.body;

    // Segurança: o item tem que ser do usuário
    const check = await pool.query(
      "SELECT preco_unitario FROM carrinho_itens WHERE id = $1 AND usuario_id = $2",
      [id, usuario_id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json("Item não encontrado");
    }

    const precoUnitario = check.rows[0].preco_unitario;
    const precoTotal = precoUnitario * quantidade;

    await pool.query(
      `UPDATE carrinho_itens 
       SET quantidade = $1, preco_total = $2
       WHERE id = $3`,
      [quantidade, precoTotal, id]
    );

    res.json("Item atualizado!");

  } catch (err) {
    res.status(500).json({ erro: "Erro ao atualizar item" });
  }
}

export async function removerItemCarrinho(req, res) {
  try {
    const { id, usuario_id } = req.body;

    const result = await pool.query(
      "DELETE FROM carrinho_itens WHERE id = $1 AND usuario_id = $2",
      [id, usuario_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json("Item não encontrado");
    }

    res.json("Item removido!");

  } catch (err) {
    res.status(500).json({ erro: "Erro ao remover item" });
  }
}
