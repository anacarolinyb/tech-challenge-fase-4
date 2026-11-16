const { HttpError } = require('../utils/http');
const { verifyPassword } = require('../utils/password');
const { sign } = require('../utils/jwt');
const { validate, EMAIL_PATTERN } = require('../utils/validation');
const { toPublicUser } = require('./serializers');

const loginSchema = {
  email: { label: 'E-mail', required: true, lowercase: true, pattern: EMAIL_PATTERN, patternMessage: 'Informe um e-mail válido' },
  password: { label: 'Senha', feminine: true, required: true, trim: false },
};

function createAuthController({ db, config }) {
  return {
    /** POST /auth/login — autentica professores e alunos e devolve um JWT. */
    async login(ctx) {
      const { email, password } = validate(loginSchema, ctx.body);
      const user = db.findOne('users', (item) => item.email === email);

      if (!user || !(await verifyPassword(password, user.passwordHash))) {
        throw new HttpError(401, 'E-mail ou senha inválidos');
      }

      const token = sign({ sub: user.id, role: user.role, name: user.name }, config.jwtSecret, config.jwtExpiresIn);
      ctx.json(200, { token, expiresIn: config.jwtExpiresIn, user: toPublicUser(user) });
    },

    /** GET /auth/me — devolve o usuário do token (usado para restaurar a sessão no app). */
    async me(ctx) {
      ctx.json(200, toPublicUser(ctx.user));
    },
  };
}

module.exports = { createAuthController };
