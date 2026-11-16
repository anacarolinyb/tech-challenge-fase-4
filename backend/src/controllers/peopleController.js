const crypto = require('node:crypto');
const { HttpError, parsePagination, paginate } = require('../utils/http');
const { validate, normalizeText, EMAIL_PATTERN } = require('../utils/validation');
const { hashPassword } = require('../utils/password');
const { toPublicUser } = require('./serializers');

/**
 * Configuração de cada tipo de pessoa. Professores e alunos compartilham o mesmo
 * controller (mesmas regras), mudando apenas mensagens e o campo extra.
 */
const ROLE_SETTINGS = {
  teacher: {
    notFound: 'Professor não encontrado',
    extraField: { subject: { label: 'Disciplina', feminine: true, max: 60 } },
  },
  student: {
    notFound: 'Aluno não encontrado',
    extraField: { registration: { label: 'Matrícula', feminine: true, max: 30 } },
  },
};

function buildSchema(role, { creating }) {
  return {
    name: { label: 'Nome', required: true, min: 3, max: 80 },
    email: { label: 'E-mail', required: true, lowercase: true, max: 120, pattern: EMAIL_PATTERN, patternMessage: 'Informe um e-mail válido' },
    password: creating
      ? { label: 'Senha', feminine: true, required: true, min: 6, max: 64, trim: false }
      : { label: 'Senha', feminine: true, min: 6, max: 64, trim: false, ignoreEmpty: true },
    ...ROLE_SETTINGS[role].extraField,
  };
}

function createPeopleController({ db }, role) {
  const settings = ROLE_SETTINGS[role];

  const findOr404 = (id) => {
    const user = db.findOne('users', (item) => item.id === id && item.role === role);
    if (!user) throw new HttpError(404, settings.notFound);
    return user;
  };

  const ensureUniqueEmail = (email, ignoreId) => {
    const existing = db.findOne('users', (item) => item.email === email && item.id !== ignoreId);
    if (existing) throw new HttpError(409, 'Já existe um usuário cadastrado com este e-mail', { email: 'E-mail já cadastrado' });
  };

  return {
    /** Lista paginada em ordem alfabética, com busca opcional por nome ou e-mail (?q=). */
    async list(ctx) {
      const { page, limit } = parsePagination(ctx.query);
      const term = normalizeText(ctx.query.q).trim();

      let people = db.all('users').filter((user) => user.role === role);
      if (term) {
        people = people.filter((user) => normalizeText(`${user.name} ${user.email}`).includes(term));
      }
      people.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

      const result = paginate(people, page, limit);
      ctx.json(200, { ...result, data: result.data.map(toPublicUser) });
    },

    async getById(ctx) {
      ctx.json(200, toPublicUser(findOr404(ctx.params.id)));
    },

    async create(ctx) {
      const { password, ...input } = validate(buildSchema(role, { creating: true }), ctx.body);
      ensureUniqueEmail(input.email);

      const now = new Date().toISOString();
      const user = db.insert('users', {
        id: crypto.randomUUID(),
        ...input,
        role,
        passwordHash: await hashPassword(password),
        createdAt: now,
        updatedAt: now,
      });
      ctx.json(201, toPublicUser(user));
    },

    async update(ctx) {
      findOr404(ctx.params.id);
      const { password, ...changes } = validate(buildSchema(role, { creating: false }), ctx.body, { partial: true });
      if (changes.email) ensureUniqueEmail(changes.email, ctx.params.id);
      if (password) changes.passwordHash = await hashPassword(password);

      const user = db.update('users', ctx.params.id, changes);

      // Mantém o nome exibido nos comentários atualizado
      if (changes.name) {
        db.all('comments')
          .filter((comment) => comment.authorId === user.id)
          .forEach((comment) => {
            comment.authorName = user.name;
          });
        db.save();
      }

      ctx.json(200, toPublicUser(user));
    },

    async remove(ctx) {
      findOr404(ctx.params.id);
      if (ctx.params.id === ctx.user.id) {
        throw new HttpError(400, 'Você não pode excluir o seu próprio usuário');
      }
      db.remove('users', ctx.params.id);
      ctx.json(204);
    },
  };
}

module.exports = { createPeopleController };
