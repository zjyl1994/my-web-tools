import assert from 'node:assert/strict';
import { test } from 'node:test';
import { format } from 'sql-formatter';
import { detectDialect, MAX_DETECTION_LENGTH } from '../src/pages/sqlfmt/dialect.ts';

const examples = [
  ['mysql', 'INSERT INTO users (id) VALUES (1) ON DUPLICATE KEY UPDATE id = 2'],
  ['postgresql', "SELECT name FROM users WHERE name ILIKE 'a%'"],
  ['postgresql', 'SELECT value::integer FROM items'],
  ['sqlite', 'PRAGMA table_info(users)'],
  ['transactsql', 'SELECT TOP (10) id FROM users'],
  ['plsql', 'SELECT id FROM users CONNECT BY PRIOR id = parent_id'],
  ['bigquery', "SELECT SAFE_CAST('1' AS INT64)"],
  ['spark', 'SELECT item FROM users LATERAL VIEW explode(items) t AS item'],
] as const;

for (const [language, sql] of examples) {
  test(`detect and format ${language}: ${sql}`, () => {
    const detected = detectDialect(sql);
    assert.equal(detected.language, language);
    assert.equal(detected.ambiguous, false);
    const result = format(sql, { language: detected.language });
    assert.ok(result.length > 0);
    assert.equal(detectDialect(result).language, language);
  });
}

test('common syntax and empty input fall back to standard SQL', () => {
  for (const sql of ['', 'SELECT * FROM users LIMIT 10', 'SELECT `name` FROM `users`']) {
    assert.deepEqual(detectDialect(sql), { language: 'sql', ambiguous: false });
  }
});

test('ignore dialect hints in comments, strings and quoted identifiers', () => {
  for (const sql of [
    "SELECT 'ILIKE', 'it''s AUTO_INCREMENT'",
    'SELECT "ILIKE", `AUTO_INCREMENT`, [VARCHAR2(10)] FROM users',
    'SELECT $$ILIKE$$, $body$AUTO_INCREMENT$body$',
    'SELECT 1 -- ILIKE\n/* AUTO_INCREMENT */',
    '# AUTO_INCREMENT\nSELECT 1',
  ]) {
    assert.deepEqual(detectDialect(sql), { language: 'sql', ambiguous: false });
  }
});

test('conflicting syntax requests a manual choice instead of guessing', () => {
  assert.deepEqual(detectDialect("SELECT TOP 10 * FROM users WHERE name ILIKE 'a%'"), {
    language: 'sql', ambiguous: true,
  });
});

test('unclosed literals and comments do not leak dialect hints', () => {
  for (const sql of [
    "SELECT 'ILIKE", 'SELECT "AUTO_INCREMENT', 'SELECT `AUTO_INCREMENT',
    'SELECT [ILIKE', 'SELECT $body$ ILIKE $other$ AUTO_INCREMENT',
    'SELECT 1 /* ILIKE', 'SELECT 1 /* outer /* inner */ AUTO_INCREMENT */',
    Array.from({ length: 2000 }, (_, i) => `$tag${i}$ ILIKE `).join(''),
  ]) {
    assert.deepEqual(detectDialect(sql), { language: 'sql', ambiguous: false });
  }
});

test('detection only examines the bounded prefix', () => {
  assert.equal(detectDialect(' '.repeat(MAX_DETECTION_LENGTH) + 'SELECT a::int').language, 'sql');
  assert.equal(detectDialect('SELECT a::int;' + ' '.repeat(MAX_DETECTION_LENGTH) + 'AUTO_INCREMENT').language, 'postgresql');
  assert.equal(detectDialect("SELECT '" + ' '.repeat(MAX_DETECTION_LENGTH) + "' ILIKE").language, 'sql');
});

test('literal scanning resumes after a matching delimiter', () => {
  assert.equal(detectDialect("SELECT $body$AUTO_INCREMENT$body$, a::int").language, 'postgresql');
  assert.equal(detectDialect("SELECT 'it\\'s AUTO_INCREMENT', a::int").language, 'postgresql');
});
