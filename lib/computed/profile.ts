/**
 * 日付ユーティリティ（InlineDateField が使用）
 * テスト仕様書ドメインでは日付フィールドを使わないが、
 * primitives/InlineDateField.tsx がこのモジュールに依存しているため
 * スタブを残している。
 */

/** Date オブジェクトを ISO 8601 (YYYY-MM-DD) に変換 */
export function formatISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** ISO 8601 (YYYY-MM-DD) 文字列を Date オブジェクトに変換。空文字は undefined */
export function parseISODate(iso: string): Date | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? undefined : d;
}
