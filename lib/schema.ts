/**
 * テスト仕様書管理ドメインの Zod スキーマと派生型。
 * UI コンポーネントはここから型をインポートする。
 */

import { z } from "zod";

// ===== 確認項目（第4階層 - 末端） =====

export const checkItemSchema = z.object({
  id: z.string(),
  text: z.string(),
  note: z.string().default(""),
  warning: z.string().default(""),
  memo: z.string().default(""),
});
export type CheckItem = z.infer<typeof checkItemSchema>;

// ===== 試験項目（第3階層） =====

export const testCaseSchema = z.object({
  id: z.string(),
  text: z.string(),
  checks: z.array(checkItemSchema).default([]),
  note: z.string().default(""),
  warning: z.string().default(""),
  memo: z.string().default(""),
});
export type TestCase = z.infer<typeof testCaseSchema>;

// ===== 中項目（第2階層） =====

export const middleItemSchema = z.object({
  id: z.string(),
  text: z.string(),
  cases: z.array(testCaseSchema).default([]),
  note: z.string().default(""),
  warning: z.string().default(""),
  memo: z.string().default(""),
});
export type MiddleItem = z.infer<typeof middleItemSchema>;

// ===== 大項目（第1階層） =====

export const sectionSchema = z.object({
  id: z.string(),
  text: z.string(),
  items: z.array(middleItemSchema).default([]),
  note: z.string().default(""),
  warning: z.string().default(""),
  memo: z.string().default(""),
});
export type Section = z.infer<typeof sectionSchema>;

// ===== タスクステータス =====

export const taskStatusSchema = z.enum(["draft", "review", "done"]);
export type TaskStatus = z.infer<typeof taskStatusSchema>;
/** Pane 2 グループの表示順 */
export const TASK_STATUS_ORDER = taskStatusSchema.options;

// ===== タスク（最上位データ） =====

export const taskSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
  status: taskStatusSchema,
  sections: z.array(sectionSchema).default([]),
  archived: z.boolean().default(false),
});
export type Task = z.infer<typeof taskSchema>;

// ===== JSON 全体用スキーマ =====

export const tasksSchema = z.array(taskSchema);
export const workspaceSchema = z.object({
  name: z.string(),
  icon: z.string(),
});

// ===== Pane 4 の表示状態（SelectedItem） =====
// アウトラインのどの項目を選択しているかを表す型。
// sectionId から始まるパスで階層位置を一意に特定する。

export type SelectedItem =
  | { type: "section"; sectionId: string }
  | { type: "middle"; sectionId: string; middleId: string }
  | { type: "case"; sectionId: string; middleId: string; caseId: string }
  | {
      type: "check";
      sectionId: string;
      middleId: string;
      caseId: string;
      checkId: string;
    }
  | null;
