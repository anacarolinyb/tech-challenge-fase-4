const { Router } = require('./router');
const { authenticate, requireRole } = require('./middlewares/auth');
const { createAuthController } = require('./controllers/authController');
const { createPostController } = require('./controllers/postController');
const { createPeopleController } = require('./controllers/peopleController');
const { createCommentController } = require('./controllers/commentController');

function buildRoutes(deps) {
  const router = new Router();
  const auth = authenticate(deps);
  const teacherOnly = [auth, requireRole('teacher')];

  const authController = createAuthController(deps);
  const posts = createPostController(deps);
  const comments = createCommentController(deps);
  const teachers = createPeopleController(deps, 'teacher');
  const students = createPeopleController(deps, 'student');

  router.get('/', (ctx) =>
    ctx.json(200, { name: 'Blog Escolar API', status: 'ok', endpoints: router.list() }),
  );
  router.get('/health', (ctx) => ctx.json(200, { status: 'ok', uptime: Math.round(process.uptime()) }));

  // Autenticação
  router.post('/auth/login', authController.login);
  router.get('/auth/me', auth, authController.me);

  // Posts — leitura pública; escrita apenas para professores.
  // As rotas fixas (/search, /admin) vêm antes de /posts/:id.
  router.get('/posts', posts.list);
  router.get('/posts/search', posts.search);
  router.get('/posts/admin', ...teacherOnly, posts.admin);
  router.get('/posts/:id', posts.getById);
  router.post('/posts', ...teacherOnly, posts.create);
  router.put('/posts/:id', ...teacherOnly, posts.update);
  router.delete('/posts/:id', ...teacherOnly, posts.remove);

  // Comentários — leitura pública; qualquer usuário autenticado comenta
  router.get('/posts/:id/comments', comments.list);
  router.post('/posts/:id/comments', auth, comments.create);
  router.delete('/posts/:id/comments/:commentId', auth, comments.remove);

  // Professores — área administrativa (somente professores)
  router.get('/teachers', ...teacherOnly, teachers.list);
  router.get('/teachers/:id', ...teacherOnly, teachers.getById);
  router.post('/teachers', ...teacherOnly, teachers.create);
  router.put('/teachers/:id', ...teacherOnly, teachers.update);
  router.delete('/teachers/:id', ...teacherOnly, teachers.remove);

  // Alunos — área administrativa (somente professores)
  router.get('/students', ...teacherOnly, students.list);
  router.get('/students/:id', ...teacherOnly, students.getById);
  router.post('/students', ...teacherOnly, students.create);
  router.put('/students/:id', ...teacherOnly, students.update);
  router.delete('/students/:id', ...teacherOnly, students.remove);

  return router;
}

module.exports = { buildRoutes };
