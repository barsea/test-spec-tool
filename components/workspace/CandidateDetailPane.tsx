"use client";

/**
 * Pane 3: 詳細・メモ欄
 *
 * 選択中のアウトライン項目（大項目・中項目・試験項目・確認項目）の
 * 補足説明・注意事項・備考を表示・編集する。
 *
 * - pane4Open=false のとき: 幅 w-12 でアイコンのみ表示（Pane4Toggle）
 * - pane4Open=true  のとき: w-[320px] で内容を表示
 */

import { cn } from "@/lib/utils";
import {
  type Task,
  type Section,
  type MiddleItem,
  type TestCase,
  type CheckItem,
  type SelectedItem,
} from "@/lib/schema";
import { DETAIL_MEMO_LABELS } from "@/lib/labels";
import { InlineTextareaField } from "@/components/primitives";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Pane4Toggle } from "@/components/workspace/Pane4Toggle";
import { Pane4Section } from "@/components/workspace/Pane4Section";

// ===== 選択項目の解決 =====

type ResolvedItem = {
  label: string;
  note: string;
  warning: string;
  memo: string;
};

function resolveSelectedItem(
  sections: Section[],
  selected: SelectedItem,
): ResolvedItem | null {
  if (!selected) return null;

  const section = sections.find((s) => s.id === selected.sectionId);
  if (!section) return null;

  if (selected.type === "section") {
    return {
      label: section.text || "（未記入）",
      note: section.note,
      warning: section.warning,
      memo: section.memo,
    };
  }

  const middle = section.items.find((m) => m.id === selected.middleId);
  if (!middle) return null;

  if (selected.type === "middle") {
    return {
      label: middle.text || "（未記入）",
      note: middle.note,
      warning: middle.warning,
      memo: middle.memo,
    };
  }

  const case_ = middle.cases.find((c) => c.id === selected.caseId);
  if (!case_) return null;

  if (selected.type === "case") {
    return {
      label: case_.text || "（未記入）",
      note: case_.note,
      warning: case_.warning,
      memo: case_.memo,
    };
  }

  const check = case_.checks.find((ch) => ch.id === selected.checkId);
  if (!check) return null;

  return {
    label: check.text || "（未記入）",
    note: check.note,
    warning: check.warning,
    memo: check.memo,
  };
}

// ===== 選択項目のフィールド更新（イミュータブル） =====

type MemoField = "note" | "warning" | "memo";

function updateItemField(
  sections: Section[],
  selected: SelectedItem,
  field: MemoField,
  value: string,
): Section[] {
  if (!selected) return sections;

  return sections.map((s) => {
    if (s.id !== selected.sectionId) return s;

    if (selected.type === "section") {
      return { ...s, [field]: value };
    }

    return {
      ...s,
      items: s.items.map((m) => {
        if (m.id !== selected.middleId) return m;

        if (selected.type === "middle") {
          return { ...m, [field]: value };
        }

        return {
          ...m,
          cases: m.cases.map((c) => {
            if (c.id !== selected.caseId) return c;

            if (selected.type === "case") {
              return { ...c, [field]: value };
            }

            return {
              ...c,
              checks: c.checks.map((ch) => {
                if (ch.id !== selected.checkId) return ch;
                return { ...ch, [field]: value };
              }),
            };
          }),
        };
      }),
    };
  });
}

// ===== Pane 3 本体 =====

type DetailMemoPaneProps = {
  task: Task;
  selectedItem: SelectedItem;
  pane4Open: boolean;
  onTogglePane4: () => void;
  onUpdateSections: (sections: Section[]) => void;
};

export function DetailMemoPane({
  task,
  selectedItem,
  pane4Open,
  onTogglePane4,
  onUpdateSections,
}: DetailMemoPaneProps) {
  const resolved = resolveSelectedItem(task.sections, selectedItem);

  const handleUpdate = (field: MemoField, value: string) => {
    const next = updateItemField(task.sections, selectedItem, field, value);
    onUpdateSections(next);
  };

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col border-l border-border bg-background transition-all",
        pane4Open ? "w-[320px]" : "w-12",
      )}
    >
      {/* ヘッダー */}
      <div
        className={cn(
          "flex h-12 shrink-0 items-center border-b border-border",
          pane4Open ? "justify-between px-4" : "justify-center",
        )}
      >
        {pane4Open && (
          <h2 className="truncate text-sm font-semibold text-foreground">
            詳細・メモ
          </h2>
        )}
        <Pane4Toggle open={pane4Open} onToggle={onTogglePane4} />
      </div>

      {/* コンテンツ（展開時のみ） */}
      {pane4Open && (
        <ScrollArea className="min-h-0 flex-1">
          {!resolved || !selectedItem ? (
            <div className="flex flex-col items-center gap-2 px-5 py-16 text-center">
              <p className="text-sm text-muted-foreground">
                アウトラインの項目を選択すると
                <br />
                詳細・メモが表示されます
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {/* 選択中項目の見出し */}
              <div className="px-5 py-4">
                <p className="text-xs text-muted-foreground">
                  選択中
                </p>
                <p className="mt-1 truncate text-sm font-medium text-foreground">
                  {resolved.label}
                </p>
              </div>
              <Separator />

              {/* 補足説明 */}
              <Pane4Section title={DETAIL_MEMO_LABELS.note}>
                <InlineTextareaField
                  value={resolved.note}
                  onSave={(v) => handleUpdate("note", v)}
                  ariaLabel={DETAIL_MEMO_LABELS.note}
                  placeholder="補足説明を入力（Cmd+Enter で保存）"
                />
              </Pane4Section>
              <Separator />

              {/* 注意事項 */}
              <Pane4Section title={DETAIL_MEMO_LABELS.warning}>
                <InlineTextareaField
                  value={resolved.warning}
                  onSave={(v) => handleUpdate("warning", v)}
                  ariaLabel={DETAIL_MEMO_LABELS.warning}
                  placeholder="注意事項を入力（Cmd+Enter で保存）"
                />
              </Pane4Section>
              <Separator />

              {/* 備考 */}
              <Pane4Section title={DETAIL_MEMO_LABELS.memo}>
                <InlineTextareaField
                  value={resolved.memo}
                  onSave={(v) => handleUpdate("memo", v)}
                  ariaLabel={DETAIL_MEMO_LABELS.memo}
                  placeholder="備考を入力（Cmd+Enter で保存）"
                />
              </Pane4Section>
            </div>
          )}
        </ScrollArea>
      )}
    </aside>
  );
}
