const crypto = require('node:crypto');
const { HttpError, parsePagination, paginate } = require('../utils/http');
const { validate, normalizeText } = require('../utils/validation');

const postSchema = {
  title: { label: 'Título', required: true, min: 3, max: 120 },
  content: { label: 'Conteúdo', required: true, min: 10, max: 10_000 },
  author: { label: 'Autor', required: true, min: 3, max: 80 },
};

function createPostController({ db }) {
  const withCommentCount = (post) => ({
    ...post,
    commentsCount: db.all('comments').filter((comment) => comment.postId === post.id).length,
  });

  const findPostOr404 = (id) => {
    const post = db.findById('posts', id);
    if (!post) throw new HttpError(404, 'Post não encontrado');
    return post;
  };

  /** Lista paginada, mais recentes primeiro, com busca opcional por palavra-chave (?q=). */
  function listPosts(ctx) {
    const { page, limit } = parsePagination(ctx.query);
    const term = normalizeText(ctx.query.q).trim();

    let posts = [...db.all('posts')];
    if (term) {
      const words = term.split(/\s+/);
      posts = posts.filter((post) => {
        const haystack = normalizeText(`${post.title} ${post.content} ${post.author}`);
        return words.every((word) => haystack.includes(word));
      });
    }

    posts.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const result = paginate(posts, page, limit);
    ctx.json(200, { ...result, data: result.data.map(withCommentCount) });
  }

  return {
    list: listPosts,
    search: listPosts,
    admin: listPosts,

    async getById(ctx) {
      ctx.json(200, withCommentCount(findPostOr404(ctx.params.id)));
    },

    async create(ctx) {
      const input = validate(postSchema, { author: ctx.user.name, ...ctx.body });
      const now = new Date().toISOString();
      const post = db.insert('posts', {
        id: crypto.randomUUID(),
        ...input,
        authorId: ctx.user.id,
        createdAt: now,
        updatedAt: now,
      });
      ctx.json(201, withCommentCount(post));
    },

    async update(ctx) {
      findPostOr404(ctx.params.id);
      const changes = validate(postSchema, ctx.body, { partial: true });
      const post = db.update('posts', ctx.params.id, changes);
      ctx.json(200, withCommentCount(post));
    },

    async remove(ctx) {
      findPostOr404(ctx.params.id);
      db.remove('posts', ctx.params.id);
      db.removeWhere('comments', (comment) => comment.postId === ctx.params.id);
      ctx.json(204);
    },
  };
}

module.exports = { createPostController };
