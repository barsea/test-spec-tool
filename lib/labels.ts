/**
 * テスト仕様書管理ドメインの表示文言（labels）。
 *
 * 業種を変える受講生は、このファイルの値を業種に合わせて書き換える。
 * 後フェーズ予定:
 *   - Phase C: ステータス／階層ラベルをデータ駆動に
 */

import { type TaskStatus } from "@/lib/schema";

// ===== タスクステータスラベル =====
// Pane 2 のグループ見出しに出すステータス表示名（日本語）。

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  draft: "作成中",
  review: "レビュー待ち",
  done: "完成",
};

// Pane 2 末尾の「アーカイブ済み」グループの見出しラベル。
export const ARCHIVED_GROUP_LABEL = "アーカイブ済み";

// ===== アウトライン階層ラベル（Pane 3 / Pane 4 共通） =====

export const OUTLINE_LEVEL_LABELS = {
  section: "大項目",
  middle: "中項目",
  case: "試験項目",
  check: "確認項目",
} as const;

// ===== Pane 4（詳細・メモ）セクション見出し =====

export const DETAIL_MEMO_LABELS = {
  note: "補足説明",
  warning: "注意事項",
  memo: "備考",
} as const;
