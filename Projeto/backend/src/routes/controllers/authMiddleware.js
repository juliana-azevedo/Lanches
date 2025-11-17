import jwt from "jsonwebtoken";

export function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    console.log("token problematico")
    return res.status(401).json({ message: "Token não encontrado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // agora o usuário está disponível nas rotas
    next(); // continua para a rota
  } catch (error) {
    return res.status(401).json({ message: "Token inválido" });
  }
}
