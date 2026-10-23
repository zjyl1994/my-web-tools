import type { SqlLanguage } from 'sql-formatter';

export const dialects = [
  ['mysql', 'MySQL'], ['postgresql', 'PostgreSQL'], ['sqlite', 'SQLite'],
  ['transactsql', 'SQL Server'], ['mariadb', 'MariaDB'], ['plsql', 'Oracle PL/SQL'],
  ['bigquery', 'BigQuery'], ['spark', 'Spark SQL'], ['sql', '标准 SQL'],
] as const satisfies ReadonlyArray<readonly [SqlLanguage, string]>;

export type DialectChoice = 'auto' | SqlLanguage;
export const MAX_DETECTION_LENGTH = 64 * 1024;

// Shared syntax (LIMIT, backticks, RETURNING, etc.) cannot identify a dialect.
// These are hints, not validation or an exhaustive SQL parser.
const hints: ReadonlyArray<readonly [SqlLanguage, RegExp]> = [
  ['mysql', /\bON\s+DUPLICATE\s+KEY\s+UPDATE\b|\bAUTO_INCREMENT\b/i],
  ['postgresql', /\bILIKE\b|::\s*[a-z_]|\bDISTINCT\s+ON\s*\(/i],
  ['sqlite', /(?:^|;)\s*PRAGMA\s+\w|\bAUTOINCREMENT\b/i],
  ['transactsql', /\bSELECT\s+(?:DISTINCT\s+)?TOP\s*(?:\(|\d)|\bTRY_CONVERT\s*\(/i],
  ['plsql', /\bCONNECT\s+BY\b|\bVARCHAR2\s*\(/i],
  ['bigquery', /\bSAFE_CAST\s*\(/i],
  ['spark', /\bLATERAL\s+VIEW\b/i],
];

function unquotedCode(sql: string): string {
  const parts: string[] = [];
  const dollarQuote = /\$(?:[a-zA-Z_]\w*)?\$/y;
  let start = 0;
  let i = 0;
  while (i < sql.length) {
    const from = i;
    const char = sql[i];
    if (sql.startsWith('--', i) || char === '#') {
      while (i < sql.length && sql[i] !== '\n' && sql[i] !== '\r') i++;
    } else if (sql.startsWith('/*', i)) {
      i += 2;
      let depth = 1;
      while (i < sql.length && depth) {
        if (sql.startsWith('/*', i)) { depth++; i += 2; }
        else if (sql.startsWith('*/', i)) { depth--; i += 2; }
        else i++;
      }
    } else if (char === "'" || char === '"' || char === '`' || char === '[') {
      const closing = char === '[' ? ']' : char;
      i++;
      while (i < sql.length) {
        if (char === "'" && sql[i] === '\\') { i += 2; continue; }
        if (sql[i++] === closing) {
          if (sql[i] === closing) i++;
          else break;
        }
      }
    } else if (char === '$') {
      dollarQuote.lastIndex = i;
      const delimiter = dollarQuote.exec(sql)?.[0];
      if (!delimiter) { i++; continue; }
      const end = sql.indexOf(delimiter, i + delimiter.length);
      // An unclosed literal consumes the rest, rather than retrying every tag.
      i = end < 0 ? sql.length : end + delimiter.length;
    } else {
      i++;
      continue;
    }
    parts.push(sql.slice(start, from), ' ');
    start = i;
  }
  parts.push(sql.slice(start));
  return parts.join('');
}

export function detectDialect(sql: string): { language: SqlLanguage; ambiguous: boolean } {
  // Detection is bounded; formatting still receives the complete SQL input.
  const code = unquotedCode(sql.slice(0, MAX_DETECTION_LENGTH));
  const matches = hints.filter(([, pattern]) => pattern.test(code));
  return {
    language: matches.length === 1 ? matches[0][0] : 'sql',
    ambiguous: matches.length > 1,
  };
}
