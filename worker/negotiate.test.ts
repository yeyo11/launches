import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chooseLanguage, prefersMarkdown } from './negotiate.ts';

test('the lang cookie wins over the browser', () => {
  assert.equal(chooseLanguage('theme=x; lang=es', 'en-US,en;q=0.9'), 'es');
  assert.equal(chooseLanguage('lang=en', 'es-ES'), 'en');
  assert.equal(chooseLanguage('lang=fr', 'es-ES'), 'es');
});

test('Accept-Language by q-value; any es* is Spanish', () => {
  assert.equal(chooseLanguage(null, 'es-ES,es;q=0.9,en;q=0.8'), 'es');
  assert.equal(chooseLanguage(null, 'es-MX'), 'es');
  assert.equal(chooseLanguage(null, 'en-US,en;q=0.9,es;q=0.8'), 'en');
  assert.equal(chooseLanguage(null, 'en;q=0.5, es;q=0.8'), 'es');
  assert.equal(chooseLanguage(null, 'fr-FR,fr;q=0.9,es;q=0.5'), 'es');
  assert.equal(chooseLanguage(null, 'de-DE,fr;q=0.9'), 'en');
  assert.equal(chooseLanguage(null, 'es;q=0, en'), 'en');
});

test('no Accept-Language (a crawler) gets English', () => {
  assert.equal(chooseLanguage(null, null), 'en');
  assert.equal(chooseLanguage('', ''), 'en');
});

test('Markdown only when asked for outright and not below HTML', () => {
  assert.equal(prefersMarkdown('text/markdown'), true);
  assert.equal(prefersMarkdown('text/markdown, text/html;q=0.9'), true);
  assert.equal(prefersMarkdown('text/markdown;q=0.9, */*;q=0.8'), true);
  assert.equal(prefersMarkdown('text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'), false);
  assert.equal(prefersMarkdown('text/html, text/markdown;q=0.5'), false);
  assert.equal(prefersMarkdown('*/*'), false);
  assert.equal(prefersMarkdown(null), false);
});
