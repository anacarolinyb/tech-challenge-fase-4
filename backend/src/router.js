/**
 * Roteador HTTP mínimo com suporte a parâmetros (/posts/:id) e cadeia de handlers
 * (middlewares). Cada handler recebe o contexto da requisição; middlewares que
 * precisam interromper o fluxo lançam um HttpError.
 */
class Router {
  constructor() {
    this.routes = [];
  }

  add(method, pattern, ...handlers) {
    const keys = [];
    const source = pattern.replace(/\/:(\w+)/g, (_, key) => {
      keys.push(key);
      return '/([^/]+)';
    });
    this.routes.push({ method, pattern, regex: new RegExp(`^${source}/?$`), keys, handlers });
    return this;
  }

  get(pattern, ...handlers) {
    return this.add('GET', pattern, ...handlers);
  }

  post(pattern, ...handlers) {
    return this.add('POST', pattern, ...handlers);
  }

  put(pattern, ...handlers) {
    return this.add('PUT', pattern, ...handlers);
  }

  delete(pattern, ...handlers) {
    return this.add('DELETE', pattern, ...handlers);
  }

  /**
   * Retorna a rota correspondente, `{ methodNotAllowed: true }` quando o caminho
   * existe com outro método, ou `null` quando nenhuma rota corresponde.
   */
  match(method, pathname) {
    let pathExists = false;

    for (const route of this.routes) {
      const result = route.regex.exec(pathname);
      if (!result) continue;
      pathExists = true;
      if (route.method !== method) continue;

      const params = {};
      route.keys.forEach((key, index) => {
        params[key] = decodeURIComponent(result[index + 1]);
      });
      return { route, params };
    }

    return pathExists ? { methodNotAllowed: true } : null;
  }

  list() {
    return this.routes.map(({ method, pattern }) => `${method} ${pattern}`);
  }
}

module.exports = { Router };
