const crypto = require('node:crypto');

/**
 * Implementação mínima de JWT (HS256) usando apenas o módulo crypto do Node.
 * Suficiente para o escopo do projeto e sem dependências externas.
 */

function encode(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function decode(segment) {
  return JSON.parse(Buffer.from(segment, 'base64url').toString('utf8'));
}

function signature(data, secret) {
  return crypto.createHmac('sha256', secret).update(data).digest();
}

function sign(payload, secret, expiresInSeconds) {
  const now = Math.floor(Date.now() / 1000);
  const header = encode({ alg: 'HS256', typ: 'JWT' });
  const body = encode({ ...payload, iat: now, exp: now + expiresInSeconds });
  const data = `${header}.${body}`;
  return `${data}.${signature(data, secret).toString('base64url')}`;
}

function verify(token, secret) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) throw new Error('Token malformado');

  const [headerSegment, payloadSegment, signatureSegment] = parts;
  const expected = signature(`${headerSegment}.${payloadSegment}`, secret);
  const received = Buffer.from(signatureSegment, 'base64url');

  if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) {
    throw new Error('Assinatura inválida');
  }

  const header = decode(headerSegment);
  if (header.alg !== 'HS256') throw new Error('Algoritmo não suportado');

  const payload = decode(payloadSegment);
  if (typeof payload.exp === 'number' && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Token expirado');
  }
  return payload;
}

module.exports = { sign, verify };
