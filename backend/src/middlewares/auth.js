const { HttpError } = require('../utils/http');
const { verify } = require('../utils/jwt');

/** Exige um token JWT válido no header Authorization: Bearer <token>. */
function authenticate({ db, config }) {
  return async function authenticateMiddleware(ctx) {
    const header = ctx.req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new HttpError(401, 'Faça login para continuar');
    }

    let payload;
    try {
      payload = verify(token, config.jwtSecret);
    } catch {
      throw new HttpError(401, 'Sessão inválida ou expirada. Faça login novamente');
    }

    const user = db.findById('users', payload.sub);
    if (!user) {
      throw new HttpError(401, 'Usuário não encontrado. Faça login novamente');
    }

    ctx.user = user;
  };
}

/** Garante que o usuário autenticado possui um dos papéis informados. */
function requireRole(...roles) {
  return async function requireRoleMiddleware(ctx) {
    if (!ctx.user || !roles.includes(ctx.user.role)) {
      throw new HttpError(403, 'Você não tem permissão para realizar esta ação');
    }
  };
}

module.exports = { authenticate, requireRole };
