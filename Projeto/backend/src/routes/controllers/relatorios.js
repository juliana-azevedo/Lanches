import pool from "../../../DB/database.js";

export async function getVendasPorPeriodo(req, res) {
  try {
    const { dataInicio, dataFim, categoria_id } = req.query;

    let query = `
      SELECT p.nome as produto, c.nome as categoria, SUM(ip.quantidade) as quantidade_vendida, SUM(ip.quantidade * ip.preco_unitario) as total_vendido
      FROM itens_pedido ip
      JOIN pedidos ped ON ip.pedido_id = ped.id
      JOIN produtos p ON ip.produto_id = p.id
      JOIN categorias c ON p.categoria_id = c.id
      WHERE ped.data BETWEEN $1 AND $2
    `;
    
    const params = [dataInicio, dataFim];

    if (categoria_id) {
      query += ` AND p.categoria_id = $3`;
      params.push(categoria_id);
    }

    query += ` GROUP BY p.id, p.nome, c.nome ORDER BY total_vendido ASC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao gerar relatório de vendas." });
  }
}

export async function getPedidosPorPagamento(req, res) {
  try {
    const { dataInicio, dataFim, status } = req.query;

    let query = `
      SELECT pagamento, COUNT(*) as quantidade, SUM(total) as total_valor
      FROM pedidos
      WHERE data BETWEEN $1 AND $2
    `;
    
    const params = [dataInicio, dataFim];

    if (status) {
      query += ` AND status = $3`;
      params.push(status);
    }

    query += ` GROUP BY pagamento ORDER BY total_valor ASC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao gerar relatório de pagamentos." });
  }
}

export async function getLucroPorProduto(req, res) {
  try {
    const { dataInicio, dataFim, produto_id } = req.query;

    let query = `
      SELECT p.nome as produto, SUM(ip.quantidade) as quantidade_vendida, 
             SUM((ip.preco_unitario - COALESCE(p.custo, 0)) * ip.quantidade) as lucro_total
      FROM itens_pedido ip
      JOIN pedidos ped ON ip.pedido_id = ped.id
      JOIN produtos p ON ip.produto_id = p.id
      WHERE ped.data BETWEEN $1 AND $2
    `;
    
    const params = [dataInicio, dataFim];

    if (produto_id) {
      query += ` AND p.id = $3`;
      params.push(produto_id);
    }

    query += ` GROUP BY p.id, p.nome ORDER BY lucro_total ASC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao gerar relatório de lucro." });
  }
}
