/** Erro HTTP com status e detalhes opcionais (ex.: erros de validação por campo). */
class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.details = details;
  }
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

function sendJson(res, status, payload) {
  if (res.headersSent) return;
  if (status === 204 || payload === undefined) {
    res.writeHead(status, CORS_HEADERS);
    res.end();
    return;
  }
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    ...CORS_HEADERS,
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

/** Lê o corpo da requisição como JSON, respeitando um limite de tamanho. */
function readJsonBody(req, limitBytes) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];

    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limitBytes) {
        reject(new HttpError(413, 'Corpo da requisição muito grande'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8').trim();
      if (!raw) return resolve({});
      try {
        const parsed = JSON.parse(raw);
        if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
          return reject(new HttpError(400, 'O corpo da requisição deve ser um objeto JSON'));
        }
        resolve(parsed);
      } catch {
        reject(new HttpError(400, 'JSON inválido no corpo da requisição'));
      }
    });

    req.on('error', reject);
  });
}

/** Lê page/limit da query string com valores padrão e limites seguros. */
function parsePagination(query, defaults = { page: 1, limit: 10 }) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || defaults.page);
  const limit = Math.min(50, Math.max(1, Number.parseInt(query.limit, 10) || defaults.limit));
  return { page, limit };
}

function paginate(items, page, limit) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  return {
    data: items.slice(start, start + limit),
    page,
    limit,
    total,
    totalPages,
  };
}

module.exports = { HttpError, CORS_HEADERS, sendJson, readJsonBody, parsePagination, paginate };
