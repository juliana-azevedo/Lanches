import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import pool from "../../../DB/database.js";

class User {
  constructor({ id, username, email, passwordhash, googleid, authprovider, created_at, updated_at, type, telefone, endereco }) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.endereco = endereco;
    this.telefone = telefone;
    this.type = type;
    this.passwordHash = passwordhash;
    this.googleId = googleid; 
    this.authProvider = authprovider;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}

// ====================== LOGIN ======================
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new Error("Email e senha são obrigatórios.");
    }

    const { rows } = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
    if (rows.length === 0) throw new Error("Email ou senha inválidos.");

    const user = new User(rows[0]);

    const isPasswordEqual = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordEqual) throw new Error("Email ou senha inválidos.");

    const isAdmin = (user.type === 1);

    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      telefone: user.telefone,
      endereco: user.endereco,
      isAdmin: isAdmin,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "8h",
    });

    return res.status(200).json({ token });
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
}

// ====================== CRIAR USUÁRIO ======================
export async function createUser(req, res) {
  try {
    const { username, email, password, endereco, telefone } = req.body;

    if (!username || !email || !password || !endereco || !telefone) {
      throw new Error("Todos os campos são obrigatórios.");
    }

    // Verifica duplicações
    let existingUser = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      throw new Error("Este email já está em uso.");
    }

    const id = uuidv4();
    const passwordHash = bcrypt.hashSync(password, 10);

    console.log(id, username, email, passwordHash, 'local', endereco, telefone)

    await pool.query(
      `INSERT INTO usuarios (id, username, email, passwordhash, authprovider, endereco, telefone)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, username, email, passwordHash, 'local', endereco, telefone]
    );

    const payload = {
      id,
      username,
      email,
      authProvider: 'local',
      endereco,
      telefone,
      isAdmin: false,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "8h",
    });

    return res.status(201).json({ id, username, email, token, endereco, telefone });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

// ====================== GET ME ======================
export async function getMe(req, res) {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      "SELECT id, username, email, endereco, telefone FROM usuarios WHERE id = $1",
      [id]
    );

    if (rows.length === 0) throw new Error("Usuário não encontrado.");

    return res.status(200).json(rows[0]);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
}

export async function getAllUsers(req, res) {
  try {
    const { rows } = await pool.query(
      "SELECT id, username, email, endereco, telefone, type as isadmin FROM usuarios"
    );
    if (rows.length === 0) throw new Error("Usuário não encontrado.");

    return res.status(200).json(rows);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
}

export async function atualizarPermissao(req, res) {
  console.log("CHEGUEI AQ NA PAZ");

  try {
    const { id, isadmin } = req.body;

    console.log(id, isadmin)

    if (!id) return res.status(400).json({ message: "ID não enviado." });

    const query = `
      UPDATE usuarios
      SET type = $1
      WHERE id = $2
      RETURNING type
    `;

    const { rows } = await pool.query(query, [isadmin, id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    return res.status(200).json(rows[0].type);
  } catch (error) {
    console.error("Erro ao atualizar:", error);
    return res.status(500).json({ message: error.message });
  }
}




// ====================== UPDATE ME ======================
export async function updateMe(req, res) {
  try {
    const { username, email, endereco, telefone } = req.body;
    const userId = req.user.id;

    // Campos que não são nulos ou indefinidos
    const fields =  [];
    const values = [];
    let idx = 1;

    if (username != null) {
      fields.push(`username = $${idx++}`);
      values.push(username);
    }
    if (email != null) {
      fields.push(`email = $${idx++}`);
      values.push(email);
    }
    if (endereco != null) {
      fields.push(`endereco = $${idx++}`);
      values.push(endereco);
    }
    if (telefone != null) {
      fields.push(`telefone = $${idx++}`);
      values.push(telefone);
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: "Nenhum campo para atualizar." });
    }

    const query = `UPDATE usuarios SET ${fields.join(", ")} WHERE id = $${idx} RETURNING id, username, email, endereco, telefone`;
    console.log("teste 1")
    values.push(userId);

    const { rows } = await pool.query(query, values);

    return res.status(200).json(rows[0]);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}


// ====================== DELETE ME ======================
export async function deleteMe(req, res) {
  try {
    await pool.query("DELETE FROM usuarios WHERE id = $1", [req.userId]);
    return res.status(204).send();
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
}

export async function deletarUsuario(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "ID não enviado." });
    }

    const query = `
      DELETE FROM usuarios
      WHERE id = $1
      RETURNING id
    `;

    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    return res.status(200).json({
      success: true,
      message: "Usuário deletado com sucesso.",
      deletedId: rows[0].id,
    });
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    return res.status(500).json({ message: error.message });
  }
}

