const crypto = require('node:crypto');
const { HttpError } = require('../utils/http');
const { validate } = require('../utils/validation');

const commentSchema = {
  content: { label: 'Comentário', required: true, min: 1, max: 500 },
};

function createCommentController({ db }) {
  const ensurePost = (postId) => {
    if (!db.findById('posts', postId)) throw new HttpError(404, 'Post não encontrado');
  };

  return {
    /** GET /posts/:id/comments — público, ordem cronológica. */
    async list(ctx) {
      ensurePost(ctx.params.id);
      const comments = db
        .all('comments')
        .filter((comment) => comment.postId === ctx.params.id)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      ctx.json(200, comments);
    },

    /** POST /posts/:id/comments — professores e alunos autenticados podem comentar. */
    async create(ctx) {
      ensurePost(ctx.params.id);
      const { content } = validate(commentSchema, ctx.body);
      const comment = db.insert('comments', {
        id: crypto.randomUUID(),
        postId: ctx.params.id,
        authorId: ctx.user.id,
        authorName: ctx.user.name,
        authorRole: ctx.user.role,
        content,
        createdAt: new Date().toISOString(),
      });
      ctx.json(201, comment);
    },

    /** DELETE /posts/:id/comments/:commentId — autor do comentário ou professor. */
    async remove(ctx) {
      const comment = db.findOne(
        'comments',
        (item) => item.id === ctx.params.commentId && item.postId === ctx.params.id,
      );
      if (!comment) throw new HttpError(404, 'Comentário não encontrado');

      const canDelete = comment.authorId === ctx.user.id || ctx.user.role === 'teacher';
      if (!canDelete) throw new HttpError(403, 'Você só pode excluir os seus próprios comentários');

      db.remove('comments', comment.id);
      ctx.json(204);
    },
  };
}

module.exports = { createCommentController };
