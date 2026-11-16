const { HttpError } = require('./http');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Valida um objeto de entrada a partir de um schema simples.
 *
 * Cada campo do schema aceita:
 *   label, feminine, required, min, max, pattern, patternMessage,
 *   lowercase, trim (padrão true), ignoreEmpty (string vazia = "não alterar").
 *
 * Em modo `partial` (PUT), campos ausentes são ignorados.
 * Lança HttpError 400 com `details` por campo quando houver erros.
 */
function validate(schema, body, { partial = false } = {}) {
  const errors = {};
  const value = {};
  const source = body || {};

  for (const [field, rules] of Object.entries(schema)) {
    const raw = source[field];
    const required = `${rules.label} é obrigatóri${rules.feminine ? 'a' : 'o'}`;

    if (raw === undefined || raw === null) {
      if (rules.required && !partial) errors[field] = required;
      continue;
    }

    if (typeof raw !== 'string') {
      errors[field] = `${rules.label} inválid${rules.feminine ? 'a' : 'o'}`;
      continue;
    }

    const text = rules.trim === false ? raw : raw.trim();

    if (text === '') {
      if (rules.required) errors[field] = required;
      else if (!rules.ignoreEmpty) value[field] = '';
      continue;
    }

    if (rules.min && text.length < rules.min) {
      errors[field] = `${rules.label} deve ter pelo menos ${rules.min} caracteres`;
    } else if (rules.max && text.length > rules.max) {
      errors[field] = `${rules.label} deve ter no máximo ${rules.max} caracteres`;
    } else if (rules.pattern && !rules.pattern.test(text)) {
      errors[field] = rules.patternMessage || `${rules.label} inválid${rules.feminine ? 'a' : 'o'}`;
    } else {
      value[field] = rules.lowercase ? text.toLowerCase() : text;
    }
  }

  const messages = Object.values(errors);
  if (messages.length > 0) {
    throw new HttpError(400, messages[0], errors);
  }
  return value;
}

/** Normaliza texto para busca: minúsculas e sem acentos ("Matemática" -> "matematica"). */
function normalizeText(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

module.exports = { validate, normalizeText, EMAIL_PATTERN };
