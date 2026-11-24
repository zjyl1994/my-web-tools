import assert from 'node:assert/strict';
import { test } from 'node:test';
import { multiline_trim_json, smart_process, trim_json } from '../src/pages/json/utils.ts';

test('extracts nested JSON with brackets and escaped quotes inside strings', () => {
  const payload = String.raw`{"items":[{"text":"} ] { [ \" \\"}]}`;
  assert.equal(trim_json('INFO ' + payload + ' (done)'), payload);
  assert.deepEqual(JSON.parse(smart_process('INFO ' + payload)), JSON.parse(payload));
});

test('smart processing preserves apostrophes in valid JSON and supports single-quoted input', () => {
  const input = '{"text":"it\'s John\'s }"}';
  assert.deepEqual(JSON.parse(smart_process('INFO ' + input)), JSON.parse(input));

  const singleQuoted = "{'text': '} ]'}";
  assert.equal(trim_json('INFO ' + singleQuoted), singleQuoted);
  assert.deepEqual(JSON.parse(smart_process('INFO ' + singleQuoted)), { text: '} ]' });
});

test('extracts each log line and leaves incomplete input untouched', () => {
  const incomplete = 'INFO {"text":"}';
  assert.equal(trim_json(incomplete), incomplete);
  assert.equal(multiline_trim_json('INFO {"text":"}"}\nINFO ["]"]'), '{"text":"}"}\n["]"]');
});
