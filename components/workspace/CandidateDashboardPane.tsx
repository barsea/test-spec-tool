"use client";

/**
 * Pane 2: 仕様書エディタ
 *
 * 選択中タスクの 4 階層アウトライン（大項目→中項目→試験項目→確認項目）を
 * 展開/折りたたみしながらインライン編集するエディタ。
 *
 * 責務:
 *   - ツリー構造の展開/折りたたみ（Collapsible）
 *   - 各階層のテキスト inline 編集（InlineTextField）
 *   - 各階層の追加・削除（+ / Trash2 ボタン）
 *   - 項目クリックで Pane 3（詳細・メモ）を開く
 */

import { useState } from "react";
import { ChevronRight, Plus, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  type Task,
  type Section,
  type MiddleItem,
  type TestCase,
  type CheckItem,
  type SelectedItem,
} from "@/lib/schema";
import { InlineTextField } from "@/components/primitives";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// ===== ユーティリティ =====

function genId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function makeSection(text = ""): Section {
  return { id: genId("s"), text, items: [], note: "", warning: "", memo: "" };
}
function makeMiddleItem(text = ""): MiddleItem {
  return { id: genId("m"), text, cases: [], note: "", warning: "", memo: "" };
}
function makeTestCase(text = ""): TestCase {
  return { id: genId("c"), text, checks: [], note: "", warning: "", memo: "" };
}
function makeCheckItem(text = ""): CheckItem {
  return { id: genId("ch"), text, note: "", warning: "", memo: "" };
}

// ===== "メモ" ボタン（ホバー時に表示） =====

function MemoButton({
  onClick,
  selected,
}: {
  onClick: () => void;
  selected: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded px-1.5 py-0.5 text-[11px] outline-none transition-colors",
        "focus-visible:ring-3 focus-visible:ring-ring/50",
        selected
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
      aria-label="詳細・メモを開く"
    >
      メモ
    </button>
  );
}

// ===== 折りたたみトリガー用ボタン =====

function CollapseToggle({ open }: { open: boolean }) {
  return (
    <CollapsibleTrigger
      render={
        <button
          type="button"
          className="flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      }
    >
      <ChevronRight
        aria-hidden
        className={cn("size-3.5 transition-transform", open && "rotate-90")}
      />
    </CollapsibleTrigger>
  );
}

// ===== 確認項目（第4階層 - 末端） =====

function CheckItemRow({
  item,
  sectionId,
  middleId,
  caseId,
  selectedItem,
  onSelect,
  onUpdate,
  onDelete,
}: {
  item: CheckItem;
  sectionId: string;
  middleId: string;
  caseId: string;
  selectedItem: SelectedItem;
  onSelect: (item: SelectedItem) => void;
  onUpdate: (text: string) => void;
  onDelete: () => void;
}) {
  const selected =
    selectedItem?.type === "check" &&
    selectedItem.sectionId === sectionId &&
    selectedItem.middleId === middleId &&
    selectedItem.caseId === caseId &&
    selectedItem.checkId === item.id;

  return (
    <li
      className={cn(
        "group/check flex items-center gap-1.5 rounded-md px-2 py-1.5 transition-colors",
        selected ? "bg-accent text-accent-foreground" : "hover:bg-muted/40",
      )}
    >
      <span
        className="size-1.5 shrink-0 rounded-full bg-border"
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <InlineTextField
          value={item.text}
          onSave={onUpdate}
          ariaLabel="確認項目"
          placeholder="確認項目を入力"
        />
      </div>
      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover/check:opacity-100 focus-within:opacity-100">
        <MemoButton
          selected={selected}
          onClick={() =>
            onSelect({
              type: "check",
              sectionId,
              middleId,
              caseId,
              checkId: item.id,
            })
          }
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={onDelete}
          className="text-muted-foreground hover:text-destructive"
          aria-label="確認項目を削除"
        >
          <Trash2 />
        </Button>
      </div>
    </li>
  );
}

// ===== 試験項目（第3階層） =====

function TestCaseNode({
  case_,
  sectionId,
  middleId,
  selectedItem,
  onSelect,
  onUpdateText,
  onDelete,
  onUpdateChecks,
}: {
  case_: TestCase;
  sectionId: string;
  middleId: string;
  selectedItem: SelectedItem;
  onSelect: (item: SelectedItem) => void;
  onUpdateText: (text: string) => void;
  onDelete: () => void;
  onUpdateChecks: (checks: CheckItem[]) => void;
}) {
  const [open, setOpen] = useState(true);
  const selected =
    selectedItem?.type === "case" &&
    selectedItem.sectionId === sectionId &&
    selectedItem.middleId === middleId &&
    selectedItem.caseId === case_.id;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div
        className={cn(
          "group/case flex items-center gap-1 rounded-md px-2 py-1.5 transition-colors",
          selected ? "bg-accent text-accent-foreground" : "hover:bg-muted/40",
        )}
      >
        <CollapseToggle open={open} />
        <div className="min-w-0 flex-1">
          <InlineTextField
            value={case_.text}
            onSave={onUpdateText}
            ariaLabel="試験項目"
            placeholder="試験項目を入力"
          />
        </div>
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover/case:opacity-100 focus-within:opacity-100">
          <MemoButton
            selected={selected}
            onClick={() =>
              onSelect({
                type: "case",
                sectionId,
                middleId,
                caseId: case_.id,
              })
            }
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={onDelete}
            className="text-muted-foreground hover:text-destructive"
            aria-label="試験項目を削除"
          >
            <Trash2 />
          </Button>
        </div>
      </div>

      <CollapsibleContent>
        <div className="ml-4 flex flex-col gap-0.5 border-l border-border/40 pb-1 pl-2 pt-0.5">
          <ul className="flex flex-col gap-0.5">
            {case_.checks.map((ch) => (
              <CheckItemRow
                key={ch.id}
                item={ch}
                sectionId={sectionId}
                middleId={middleId}
                caseId={case_.id}
                selectedItem={selectedItem}
                onSelect={onSelect}
                onUpdate={(text) =>
                  onUpdateChecks(
                    case_.checks.map((c) =>
                      c.id === ch.id ? { ...c, text } : c,
                    ),
                  )
                }
                onDelete={() =>
                  onUpdateChecks(case_.checks.filter((c) => c.id !== ch.id))
                }
              />
            ))}
          </ul>
          <AddLineButton
            label="確認項目を追加"
            onClick={() =>
              onUpdateChecks([...case_.checks, makeCheckItem()])
            }
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ===== 中項目（第2階層） =====

function MiddleItemNode({
  item,
  sectionId,
  selectedItem,
  onSelect,
  onUpdateText,
  onDelete,
  onUpdateCases,
}: {
  item: MiddleItem;
  sectionId: string;
  selectedItem: SelectedItem;
  onSelect: (item: SelectedItem) => void;
  onUpdateText: (text: string) => void;
  onDelete: () => void;
  onUpdateCases: (cases: TestCase[]) => void;
}) {
  const [open, setOpen] = useState(true);
  const selected =
    selectedItem?.type === "middle" &&
    selectedItem.sectionId === sectionId &&
    selectedItem.middleId === item.id;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div
        className={cn(
          "group/middle flex items-center gap-1 rounded-md px-2 py-1.5 transition-colors",
          selected ? "bg-accent text-accent-foreground" : "hover:bg-muted/40",
        )}
      >
        <CollapseToggle open={open} />
        <div className="min-w-0 flex-1 text-sm font-medium">
          <InlineTextField
            value={item.text}
            onSave={onUpdateText}
            ariaLabel="中項目"
            placeholder="中項目を入力"
          />
        </div>
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover/middle:opacity-100 focus-within:opacity-100">
          <MemoButton
            selected={selected}
            onClick={() =>
              onSelect({ type: "middle", sectionId, middleId: item.id })
            }
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={onDelete}
            className="text-muted-foreground hover:text-destructive"
            aria-label="中項目を削除"
          >
            <Trash2 />
          </Button>
        </div>
      </div>

      <CollapsibleContent>
        <div className="ml-4 flex flex-col gap-0.5 border-l border-border/40 pb-1 pl-2 pt-0.5">
          <div className="flex flex-col gap-0.5">
            {item.cases.map((case_) => (
              <TestCaseNode
                key={case_.id}
                case_={case_}
                sectionId={sectionId}
                middleId={item.id}
                selectedItem={selectedItem}
                onSelect={onSelect}
                onUpdateText={(text) =>
                  onUpdateCases(
                    item.cases.map((c) =>
                      c.id === case_.id ? { ...c, text } : c,
                    ),
                  )
                }
                onDelete={() =>
                  onUpdateCases(item.cases.filter((c) => c.id !== case_.id))
                }
                onUpdateChecks={(checks) =>
                  onUpdateCases(
                    item.cases.map((c) =>
                      c.id === case_.id ? { ...c, checks } : c,
                    ),
                  )
                }
              />
            ))}
          </div>
          <AddLineButton
            label="試験項目を追加"
            onClick={() => onUpdateCases([...item.cases, makeTestCase()])}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ===== 大項目（第1階層） =====

function SectionNode({
  section,
  selectedItem,
  onSelect,
  onUpdateText,
  onDelete,
  onUpdateItems,
}: {
  section: Section;
  selectedItem: SelectedItem;
  onSelect: (item: SelectedItem) => void;
  onUpdateText: (text: string) => void;
  onDelete: () => void;
  onUpdateItems: (items: MiddleItem[]) => void;
}) {
  const [open, setOpen] = useState(true);
  const selected =
    selectedItem?.type === "section" &&
    selectedItem.sectionId === section.id;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div
        className={cn(
          "group/section flex items-center gap-1 rounded-md px-2 py-2 transition-colors",
          selected ? "bg-accent text-accent-foreground" : "hover:bg-muted/40",
        )}
      >
        <CollapseToggle open={open} />
        <div className="min-w-0 flex-1 text-sm font-semibold">
          <InlineTextField
            value={section.text}
            onSave={onUpdateText}
            ariaLabel="大項目"
            placeholder="大項目を入力"
          />
        </div>
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover/section:opacity-100 focus-within:opacity-100">
          <MemoButton
            selected={selected}
            onClick={() =>
              onSelect({ type: "section", sectionId: section.id })
            }
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={onDelete}
            className="text-muted-foreground hover:text-destructive"
            aria-label="大項目を削除"
          >
            <Trash2 />
          </Button>
        </div>
      </div>

      <CollapsibleContent>
        <div className="ml-4 flex flex-col gap-0.5 border-l border-border/40 pb-1 pl-2 pt-0.5">
          <div className="flex flex-col gap-0.5">
            {section.items.map((item) => (
              <MiddleItemNode
                key={item.id}
                item={item}
                sectionId={section.id}
                selectedItem={selectedItem}
                onSelect={onSelect}
                onUpdateText={(text) =>
                  onUpdateItems(
                    section.items.map((m) =>
                      m.id === item.id ? { ...m, text } : m,
                    ),
                  )
                }
                onDelete={() =>
                  onUpdateItems(section.items.filter((m) => m.id !== item.id))
                }
                onUpdateCases={(cases) =>
                  onUpdateItems(
                    section.items.map((m) =>
                      m.id === item.id ? { ...m, cases } : m,
                    ),
                  )
                }
              />
            ))}
          </div>
          <AddLineButton
            label="中項目を追加"
            onClick={() =>
              onUpdateItems([...section.items, makeMiddleItem()])
            }
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ===== インライン追加ボタン =====

function AddLineButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Plus className="size-3" aria-hidden />
      {label}
    </button>
  );
}

// ===== Pane 2 メイン =====

type SpecEditorPaneProps = {
  task: Task;
  selectedItem: SelectedItem;
  onSelectItem: (item: SelectedItem) => void;
  onUpdateSections: (sections: Section[]) => void;
};

export function SpecEditorPane({
  task,
  selectedItem,
  onSelectItem,
  onUpdateSections,
}: SpecEditorPaneProps) {
  const addSection = () => {
    onUpdateSections([...task.sections, makeSection()]);
  };

  const updateSectionText = (sectionId: string, text: string) => {
    onUpdateSections(
      task.sections.map((s) => (s.id === sectionId ? { ...s, text } : s)),
    );
  };

  const deleteSection = (sectionId: string) => {
    onUpdateSections(task.sections.filter((s) => s.id !== sectionId));
    // 削除した大項目が選択中だった場合、選択を解除
    if (
      selectedItem &&
      "sectionId" in selectedItem &&
      selectedItem.sectionId === sectionId
    ) {
      onSelectItem(null);
    }
  };

  const updateSectionItems = (sectionId: string, items: MiddleItem[]) => {
    onUpdateSections(
      task.sections.map((s) => (s.id === sectionId ? { ...s, items } : s)),
    );
  };

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-canvas">
      <header className="flex h-12 shrink-0 items-center border-b border-border px-5">
        <h2 className="truncate text-sm font-semibold text-foreground">
          {task.name || "仕様書エディタ"}
        </h2>
      </header>

      <ScrollArea className="min-h-0 flex-1">
        <div className="px-5 py-4">
          {task.sections.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <p className="text-sm text-muted-foreground">
                大項目を追加してテスト仕様書を作成しましょう
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSection}
              >
                <Plus />
                大項目を追加
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {task.sections.map((section) => (
                <SectionNode
                  key={section.id}
                  section={section}
                  selectedItem={selectedItem}
                  onSelect={onSelectItem}
                  onUpdateText={(text) => updateSectionText(section.id, text)}
                  onDelete={() => deleteSection(section.id)}
                  onUpdateItems={(items) =>
                    updateSectionItems(section.id, items)
                  }
                />
              ))}
              <button
                type="button"
                onClick={addSection}
                className="mt-2 flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <Plus className="size-4" aria-hidden />
                大項目を追加
              </button>
            </div>
          )}
        </div>
      </ScrollArea>
    </section>
  );
}
