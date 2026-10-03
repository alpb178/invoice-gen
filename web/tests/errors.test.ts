import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ApiError, messageForStatus, translateError, translateMessage } from '../src/lib/errors';

describe('translateMessage', () => {
  it('maps Strapi English messages to the UI locale', () => {
    assert.equal(translateMessage('Invalid identifier or password', 400, 'es'), 'Email o contraseña incorrectos.');
    assert.equal(translateMessage('Invalid identifier or password', 400, 'en'), 'Incorrect email or password.');
    assert.equal(translateMessage('Invalid identifier or password', 400, 'pt'), 'E-mail ou senha incorretos.');
  });

  it('localizes validation patterns, field names included', () => {
    assert.equal(
      translateMessage('password must be at least 6 characters', 400, 'es'),
      'La contraseña debe tener al menos 6 caracteres.',
    );
    assert.equal(
      translateMessage('password must be at least 6 characters', 400, 'en'),
      'The password must be at least 6 characters long.',
    );
    assert.equal(
      translateMessage('password must be at least 6 characters', 400, 'pt'),
      'A senha deve ter pelo menos 6 caracteres.',
    );
    assert.equal(translateMessage('iban is a required field', 400, 'pt'), 'Preencha o campo “iban”.');
  });

  it('passes the backend Spanish messages through in every locale', () => {
    const msg = 'Solo el dueño del equipo puede crear facturas';
    assert.equal(translateMessage(msg, 403, 'es'), msg);
    assert.equal(translateMessage(msg, 403, 'en'), msg);
    assert.equal(translateMessage(msg, 403, 'pt'), msg);
  });

  it('hides unknown English and falls back to the status message', () => {
    assert.equal(translateMessage('Cannot read properties of undefined', 500, 'en'), messageForStatus(500, 'en'));
    assert.equal(messageForStatus(403, 'en'), "You don't have permission to do this.");
    assert.equal(messageForStatus(403, 'es'), 'No tienes permisos para hacer esto.');
    assert.equal(messageForStatus(403, 'pt'), 'Você não tem permissão para fazer isso.');
  });

  it('defaults to Spanish outside the browser', () => {
    assert.equal(messageForStatus(404), 'No encontramos lo que buscabas.');
  });
});

describe('translateError', () => {
  it('returns an ApiError message untouched: it was translated when thrown', () => {
    assert.equal(translateError(new ApiError('Your session has expired. Please sign in again.', 401)), 'Your session has expired. Please sign in again.');
  });
});
