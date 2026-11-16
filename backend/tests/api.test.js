process.env.NODE_ENV = 'test';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { startServer } = require('../src/server');

let server;
let baseUrl;
let teacherToken;
let studentToken;

async function call(method, path, { token, body } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  return { status: response.status, body: text ? JSON.parse(text) : null };
}

async function login(email, password = '123456') {
  const { body } = await call('POST', '/auth/login', { body: { email, password } });
  return body.token;
}

before(async () => {
  server = await startServer({ port: 0, dbFile: ':memory:' });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
  teacherToken = await login('professor@escola.com');
  studentToken = await login('aluno@escola.com');
});

after(() => new Promise((resolve) => server.close(resolve)));

describe('Infra', () => {
  it('responde ao health check', async () => {
    const { status, body } = await call('GET', '/health');
    assert.equal(status, 200);
    assert.equal(body.status, 'ok');
  });

  it('devolve 404 para rota inexistente e 405 para método inválido', async () => {
    assert.equal((await call('GET', '/nao-existe')).status, 404);
    assert.equal((await call('PATCH', '/posts')).status, 405);
  });

  it('responde ao preflight CORS', async () => {
    const response = await fetch(`${baseUrl}/posts`, { method: 'OPTIONS' });
    assert.equal(response.status, 204);
    assert.equal(response.headers.get('access-control-allow-origin'), '*');
  });
});

describe('Autenticação', () => {
  it('faz login de professor e devolve token sem o hash da senha', async () => {
    const { status, body } = await call('POST', '/auth/login', {
      body: { email: 'PROFESSOR@escola.com ', password: '123456' },
    });
    assert.equal(status, 200);
    assert.ok(body.token);
    assert.equal(body.user.role, 'teacher');
    assert.equal(body.user.passwordHash, undefined);
  });

  it('recusa senha errada', async () => {
    const { status, body } = await call('POST', '/auth/login', {
      body: { email: 'professor@escola.com', password: 'errada' },
    });
    assert.equal(status, 401);
    assert.equal(body.message, 'E-mail ou senha inválidos');
  });

  it('valida campos obrigatórios do login', async () => {
    const { status, body } = await call('POST', '/auth/login', { body: { email: '' } });
    assert.equal(status, 400);
    assert.ok(body.errors.email);
    assert.ok(body.errors.password);
  });

  it('GET /auth/me devolve o usuário do token', async () => {
    const { status, body } = await call('GET', '/auth/me', { token: studentToken });
    assert.equal(status, 200);
    assert.equal(body.email, 'aluno@escola.com');
    assert.equal(body.role, 'student');
  });

  it('recusa token inválido', async () => {
    assert.equal((await call('GET', '/auth/me', { token: 'abc.def.ghi' })).status, 401);
    assert.equal((await call('GET', '/auth/me')).status, 401);
  });
});

describe('Posts', () => {
  let createdId;

  it('lista posts publicamente, paginado e do mais recente para o mais antigo', async () => {
    const { status, body } = await call('GET', '/posts?page=1&limit=3');
    assert.equal(status, 200);
    assert.equal(body.data.length, 3);
    assert.equal(body.page, 1);
    assert.ok(body.total >= 8);
    assert.ok(body.data[0].createdAt >= body.data[1].createdAt);
    assert.equal(typeof body.data[0].commentsCount, 'number');
  });

  it('busca por palavra-chave ignorando acentos', async () => {
    const { body } = await call('GET', '/posts?q=fracoes');
    assert.ok(body.data.length >= 1);
    assert.ok(body.data.every((post) => /fra[cç][oõ]es/i.test(`${post.title} ${post.content}`)));

    const search = await call('GET', '/posts/search?q=cerrado');
    assert.equal(search.body.data.length, 1);
  });

  it('aluno não pode criar post (403) e visitante recebe 401', async () => {
    const payload = { title: 'Post do aluno', content: 'Conteúdo qualquer do aluno', author: 'Aluno' };
    assert.equal((await call('POST', '/posts', { token: studentToken, body: payload })).status, 403);
    assert.equal((await call('POST', '/posts', { body: payload })).status, 401);
  });

  it('valida campos do post', async () => {
    const { status, body } = await call('POST', '/posts', {
      token: teacherToken,
      body: { title: 'Oi', content: 'curto' },
    });
    assert.equal(status, 400);
    assert.ok(body.errors.title);
    assert.ok(body.errors.content);
  });

  it('professor cria, edita e exclui um post', async () => {
    const created = await call('POST', '/posts', {
      token: teacherToken,
      body: { title: 'Novo post de teste', content: 'Conteúdo completo do post de teste.', author: 'Marina Souza' },
    });
    assert.equal(created.status, 201);
    createdId = created.body.id;

    const fetched = await call('GET', `/posts/${createdId}`);
    assert.equal(fetched.body.title, 'Novo post de teste');

    const updated = await call('PUT', `/posts/${createdId}`, {
      token: teacherToken,
      body: { title: 'Título editado' },
    });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.title, 'Título editado');
    assert.equal(updated.body.content, 'Conteúdo completo do post de teste.');

    assert.equal((await call('DELETE', `/posts/${createdId}`, { token: teacherToken })).status, 204);
    assert.equal((await call('GET', `/posts/${createdId}`)).status, 404);
  });

  it('GET /posts/admin exige professor', async () => {
    assert.equal((await call('GET', '/posts/admin', { token: studentToken })).status, 403);
    const { status, body } = await call('GET', '/posts/admin', { token: teacherToken });
    assert.equal(status, 200);
    assert.ok(Array.isArray(body.data));
  });
});

describe('Comentários', () => {
  it('aluno comenta, visitante lê, outro aluno não pode excluir, professor pode', async () => {
    const { body: list } = await call('GET', '/posts?limit=1');
    const postId = list.data[0].id;

    const created = await call('POST', `/posts/${postId}/comments`, {
      token: studentToken,
      body: { content: 'Ótimo post!' },
    });
    assert.equal(created.status, 201);
    assert.equal(created.body.authorName, 'Lucas Oliveira');

    const comments = await call('GET', `/posts/${postId}/comments`);
    assert.ok(comments.body.some((comment) => comment.id === created.body.id));

    const otherStudent = await login('gabriela.costa@escola.com');
    const forbidden = await call('DELETE', `/posts/${postId}/comments/${created.body.id}`, { token: otherStudent });
    assert.equal(forbidden.status, 403);

    const removed = await call('DELETE', `/posts/${postId}/comments/${created.body.id}`, { token: teacherToken });
    assert.equal(removed.status, 204);
  });

  it('visitante não pode comentar', async () => {
    const { body: list } = await call('GET', '/posts?limit=1');
    const { status } = await call('POST', `/posts/${list.data[0].id}/comments`, { body: { content: 'Oi' } });
    assert.equal(status, 401);
  });
});

for (const [resource, extraField, label] of [
  ['teachers', 'subject', 'professores'],
  ['students', 'registration', 'alunos'],
]) {
  describe(`CRUD de ${label}`, () => {
    it('lista paginada e restrita a professores', async () => {
      assert.equal((await call('GET', `/${resource}`, { token: studentToken })).status, 403);
      const { status, body } = await call('GET', `/${resource}?page=1&limit=5`, { token: teacherToken });
      assert.equal(status, 200);
      assert.equal(body.data.length, 5);
      assert.ok(body.totalPages >= 2);
      assert.ok(body.data.every((person) => person.passwordHash === undefined));
    });

    it('cria, edita, impede e-mail duplicado e exclui', async () => {
      const email = `novo.${resource}@escola.com`;
      const created = await call('POST', `/${resource}`, {
        token: teacherToken,
        body: { name: 'Pessoa Nova', email, password: 'segredo1', [extraField]: 'Valor' },
      });
      assert.equal(created.status, 201);
      assert.equal(created.body[extraField], 'Valor');

      const duplicated = await call('POST', `/${resource}`, {
        token: teacherToken,
        body: { name: 'Outra Pessoa', email, password: 'segredo1' },
      });
      assert.equal(duplicated.status, 409);

      const updated = await call('PUT', `/${resource}/${created.body.id}`, {
        token: teacherToken,
        body: { name: 'Pessoa Editada', password: '' },
      });
      assert.equal(updated.status, 200);
      assert.equal(updated.body.name, 'Pessoa Editada');

      // A senha original continua valendo (senha vazia = não alterar)
      assert.ok(await login(email, 'segredo1'));

      assert.equal((await call('DELETE', `/${resource}/${created.body.id}`, { token: teacherToken })).status, 204);
      assert.equal((await call('GET', `/${resource}/${created.body.id}`, { token: teacherToken })).status, 404);
    });

    it('valida dados obrigatórios', async () => {
      const { status, body } = await call('POST', `/${resource}`, {
        token: teacherToken,
        body: { name: 'Al', email: 'invalido', password: '123' },
      });
      assert.equal(status, 400);
      assert.ok(body.errors.name);
      assert.ok(body.errors.email);
      assert.ok(body.errors.password);
    });
  });
}

describe('Regras de professores', () => {
  it('professor não pode excluir a si mesmo', async () => {
    const { body: me } = await call('GET', '/auth/me', { token: teacherToken });
    const { status } = await call('DELETE', `/teachers/${me.id}`, { token: teacherToken });
    assert.equal(status, 400);
  });

  it('um aluno não é encontrado na rota de professores', async () => {
    const { body: me } = await call('GET', '/auth/me', { token: studentToken });
    const { status } = await call('GET', `/teachers/${me.id}`, { token: teacherToken });
    assert.equal(status, 404);
  });
});
