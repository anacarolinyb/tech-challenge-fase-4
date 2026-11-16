const { buildRoutes } = require('./routes');
const { HttpError, CORS_HEADERS, sendJson, readJsonBody } = require('./utils/http');

/** Cria o handler HTTP da aplicação (sem abrir porta), facilitando os testes. */
function createApp({ db, config, logger = console }) {
  const router = buildRoutes({ db, config });
  const quiet = process.env.NODE_ENV === 'test';

  return async function handleRequest(req, res) {
    const startedAt = Date.now();
    const url = new URL(req.url, 'http://localhost');

    if (!quiet) {
      res.on('finish', () => {
        logger.log(`${req.method} ${url.pathname} -> ${res.statusCode} (${Date.now() - startedAt}ms)`);
      });
    }

    if (req.method === 'OPTIONS') {
      res.writeHead(204, CORS_HEADERS);
      res.end();
      return;
    }

    try {
      const match = router.match(req.method, url.pathname);
      if (!match) throw new HttpError(404, 'Rota não encontrada');
      if (match.methodNotAllowed) throw new HttpError(405, 'Método não permitido para esta rota');

      const ctx = {
        req,
        res,
        params: match.params,
        query: Object.fromEntries(url.searchParams),
        body: {},
        user: null,
        json: (status, payload) => sendJson(res, status, payload),
      };

      if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        ctx.body = await readJsonBody(req, config.bodyLimitBytes);
      }

      for (const handler of match.route.handlers) {
        await handler(ctx);
        if (res.writableEnded) break;
      }
    } catch (error) {
      const status = error instanceof HttpError ? error.status : 500;
      if (status === 500) logger.error(error);
      sendJson(res, status, {
        message: status === 500 ? 'Erro interno do servidor' : error.message,
        ...(error.details ? { errors: error.details } : {}),
      });
    }
  };
}

module.exports = { createApp };
