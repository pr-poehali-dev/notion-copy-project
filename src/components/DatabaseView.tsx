import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Database, DBColumn, DBRow, useWorkspace } from "@/hooks/useWorkspace";

const STATUS_OPTIONS = ["В работе", "Готово", "На паузе", "Идея", "Отменено"];
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  "В работе": { bg: "hsl(213 94% 68% / 0.15)", text: "hsl(213 80% 45%)" },
  "Готово":   { bg: "hsl(142 69% 58% / 0.15)", text: "hsl(142 60% 35%)" },
  "На паузе": { bg: "hsl(25 95% 65% / 0.15)",  text: "hsl(25 80% 40%)"  },
  "Идея":     { bg: "hsl(263 70% 68% / 0.15)", text: "hsl(263 60% 45%)" },
  "Отменено": { bg: "hsl(0 72% 65% / 0.15)",   text: "hsl(0 65% 45%)"   },
};

const COLUMN_TYPES: { value: DBColumn["type"]; label: string; icon: string }[] = [
  { value: "text",     label: "Текст",      icon: "Type"        },
  { value: "number",   label: "Число",      icon: "Hash"        },
  { value: "select",   label: "Выбор",      icon: "Tag"         },
  { value: "date",     label: "Дата",       icon: "Calendar"    },
  { value: "checkbox", label: "Флажок",     icon: "CheckSquare" },
];

interface Props { sectionId: string }

export default function DatabaseView({ sectionId }: Props) {
  const { databases, addDatabase, updateDatabase, deleteDatabase } = useWorkspace();
  const sectionDBs = databases.filter((d) => d.sectionId === sectionId);

  const [activeId, setActiveId] = useState<string | null>(sectionDBs[0]?.id ?? null);
  const [editingCell, setEditingCell] = useState<{ rowId: string; colId: string } | null>(null);
  const [showAddCol, setShowAddCol] = useState(false);
  const [newColName, setNewColName] = useState("");
  const [newColType, setNewColType] = useState<DBColumn["type"]>("text");
  const [confirmDeleteDb, setConfirmDeleteDb] = useState<string | null>(null);
  const [confirmDeleteRow, setConfirmDeleteRow] = useState<string | null>(null);
  const [editDbTitle, setEditDbTitle] = useState("");
  const [editingDbTitle, setEditingDbTitle] = useState(false);

  const activeDb = sectionDBs.find((d) => d.id === activeId) ?? null;

  const handleNewDb = () => {
    const db = addDatabase(sectionId, "Новая база", "📋");
    setActiveId(db.id);
  };

  const patchDb = (patch: Partial<Database>) => {
    if (!activeDb) return;
    updateDatabase(activeDb.id, patch);
  };

  const updateCell = (rowId: string, colId: string, value: string | boolean | number) => {
    if (!activeDb) return;
    const rows = activeDb.rows.map((r) => r.id === rowId ? { ...r, [colId]: value } : r);
    patchDb({ rows });
    setEditingCell(null);
  };

  const addRow = () => {
    if (!activeDb) return;
    const row: DBRow = { id: Date.now().toString() };
    activeDb.columns.forEach((col) => {
      row[col.id] = col.type === "checkbox" ? false : col.type === "number" ? 0 : "";
    });
    patchDb({ rows: [...activeDb.rows, row] });
  };

  const deleteRow = (rowId: string) => {
    if (!activeDb) return;
    patchDb({ rows: activeDb.rows.filter((r) => r.id !== rowId) });
    setConfirmDeleteRow(null);
  };

  const addColumn = () => {
    if (!activeDb || !newColName.trim()) return;
    const col: DBColumn = { id: Date.now().toString(), name: newColName.trim(), type: newColType };
    const rows = activeDb.rows.map((r) => ({ ...r, [col.id]: col.type === "checkbox" ? false : col.type === "number" ? 0 : "" }));
    patchDb({ columns: [...activeDb.columns, col], rows });
    setNewColName("");
    setShowAddCol(false);
  };

  const deleteColumn = (colId: string) => {
    if (!activeDb) return;
    patchDb({ columns: activeDb.columns.filter((c) => c.id !== colId) });
  };

  const saveDbTitle = () => {
    if (!editDbTitle.trim()) return;
    patchDb({ title: editDbTitle.trim() });
    setEditingDbTitle(false);
  };

  const colWidth = (col: DBColumn) =>
    col.type === "checkbox" ? 72 : col.type === "text" ? 180 : 130;

  const renderCell = (row: DBRow, col: DBColumn) => {
    const value = row[col.id];
    const isEditing = editingCell?.rowId === row.id && editingCell?.colId === col.id;

    if (col.type === "checkbox") {
      return (
        <input type="checkbox" checked={!!value}
          onChange={(e) => updateCell(row.id, col.id, e.target.checked)}
          className="w-4 h-4 rounded border-border accent-foreground cursor-pointer" />
      );
    }

    if (col.type === "select") {
      if (isEditing) {
        return (
          <select autoFocus defaultValue={value as string}
            onChange={(e) => updateCell(row.id, col.id, e.target.value)}
            onBlur={() => setEditingCell(null)}
            className="text-xs bg-card border border-border rounded px-1 py-0.5 focus:outline-none text-foreground">
            <option value="">—</option>
            {STATUS_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        );
      }
      const v = value as string;
      const style = STATUS_COLORS[v];
      return (
        <span onClick={() => setEditingCell({ rowId: row.id, colId: col.id })}
          className="px-2 py-0.5 rounded-md text-xs cursor-pointer font-medium"
          style={style ? { background: style.bg, color: style.text } : { color: "hsl(var(--muted-foreground))" }}>
          {v || "—"}
        </span>
      );
    }

    if (isEditing) {
      return (
        <input autoFocus defaultValue={value as string}
          onBlur={(e) => updateCell(row.id, col.id, col.type === "number" ? Number(e.target.value) || 0 : e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { const t = e.target as HTMLInputElement; updateCell(row.id, col.id, col.type === "number" ? Number(t.value) || 0 : t.value); } }}
          className="w-full text-sm bg-transparent border-b border-foreground/30 focus:outline-none py-0.5 text-foreground" />
      );
    }

    return (
      <span onClick={() => setEditingCell({ rowId: row.id, colId: col.id })}
        className="cursor-text text-sm text-foreground block truncate">
        {col.type === "number" && value !== undefined && value !== ""
          ? Number(value).toLocaleString("ru-RU")
          : (value as string) || <span className="text-muted-foreground/40">—</span>}
      </span>
    );
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* DB list */}
      <div className="w-52 shrink-0 border-r border-border overflow-y-auto flex flex-col">
        <div className="p-3 border-b border-border flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{sectionDBs.length} баз</span>
          <button onClick={handleNewDb} className="notion-hover p-1 text-muted-foreground hover:text-foreground">
            <Icon name="Plus" size={14} />
          </button>
        </div>
        <div className="p-2 space-y-0.5 flex-1">
          {sectionDBs.length === 0 && (
            <p className="text-xs text-muted-foreground px-2 py-4 text-center">Нет баз. Нажмите +</p>
          )}
          {sectionDBs.map((db) => (
            <div key={db.id} className="group relative">
              <button onClick={() => setActiveId(db.id)}
                className={`w-full text-left px-2 py-2 rounded-md transition-colors duration-150 flex items-center gap-2 ${activeId === db.id ? "bg-accent" : "hover:bg-accent"}`}>
                <span className="text-base">{db.icon}</span>
                <span className="text-sm font-medium text-foreground truncate">{db.title}</span>
              </button>
              <button onClick={() => setConfirmDeleteDb(db.id)}
                className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 notion-hover p-1 text-muted-foreground hover:text-destructive">
                <Icon name="Trash2" size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {!activeDb ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
              <Icon name="Database" size={22} className="text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Выберите базу или создайте новую</p>
            <button onClick={handleNewDb} className="px-4 py-2 bg-foreground text-background text-sm font-medium rounded-lg hover:opacity-90 transition-opacity">
              Создать базу данных
            </button>
          </div>
        ) : (
          <div className="min-w-max">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{activeDb.icon}</span>
                {editingDbTitle ? (
                  <input autoFocus value={editDbTitle}
                    onChange={(e) => setEditDbTitle(e.target.value)}
                    onBlur={saveDbTitle}
                    onKeyDown={(e) => { if (e.key === "Enter") saveDbTitle(); if (e.key === "Escape") setEditingDbTitle(false); }}
                    className="text-base font-semibold bg-transparent border-b border-foreground/30 focus:outline-none text-foreground" />
                ) : (
                  <h1 className="text-base font-semibold text-foreground cursor-pointer hover:opacity-70"
                    onClick={() => { setEditDbTitle(activeDb.title); setEditingDbTitle(true); }}
                    title="Нажмите чтобы переименовать">
                    {activeDb.title}
                  </h1>
                )}
                <span className="text-xs text-muted-foreground font-mono-tag">{activeDb.rows.length} записей</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowAddCol(!showAddCol)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors">
                  <Icon name="Columns" size={13} /> Колонка
                </button>
                <button onClick={addRow}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground text-background text-xs font-medium rounded-md hover:opacity-90 transition-opacity">
                  <Icon name="Plus" size={13} /> Добавить
                </button>
              </div>
            </div>

            {/* Add column form */}
            {showAddCol && (
              <div className="sticky top-12 z-10 border-b border-border bg-card px-6 py-2 flex items-center gap-2 animate-fade-in">
                <input autoFocus value={newColName} onChange={(e) => setNewColName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addColumn(); if (e.key === "Escape") setShowAddCol(false); }}
                  placeholder="Название колонки..." className="text-xs px-2 py-1 border border-border rounded-md bg-transparent focus:outline-none focus:border-foreground/40 text-foreground w-40" />
                <select value={newColType} onChange={(e) => setNewColType(e.target.value as DBColumn["type"])}
                  className="text-xs px-2 py-1 border border-border rounded-md bg-background focus:outline-none text-foreground">
                  {COLUMN_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <button onClick={addColumn} className="px-3 py-1 bg-foreground text-background text-xs font-medium rounded-md hover:opacity-90">Добавить</button>
                <button onClick={() => setShowAddCol(false)} className="px-2 py-1 border border-border text-xs rounded-md hover:bg-accent text-foreground">Отмена</button>
              </div>
            )}

            {/* Column headers */}
            <div className="flex border-b border-border bg-[hsl(var(--sidebar-background))]">
              <div className="w-8 shrink-0 border-r border-border" />
              {activeDb.columns.map((col) => (
                <div key={col.id} className="group flex items-center justify-between gap-1.5 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-r border-border"
                  style={{ minWidth: colWidth(col) }}>
                  <div className="flex items-center gap-1.5">
                    <Icon name={COLUMN_TYPES.find((t) => t.value === col.type)?.icon ?? "Type"} size={11} />
                    {col.name}
                  </div>
                  {col.id !== "name" && (
                    <button onClick={() => deleteColumn(col.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
                      <Icon name="X" size={11} />
                    </button>
                  )}
                </div>
              ))}
              <div className="w-8 shrink-0" />
            </div>

            {/* Rows */}
            {activeDb.rows.map((row, i) => (
              <div key={row.id} className="group flex border-b border-border hover:bg-accent/40 transition-colors duration-100 animate-fade-in"
                style={{ animationDelay: `${i * 25}ms` }}>
                <div className="w-8 shrink-0 border-r border-border flex items-center justify-center">
                  <span className="text-xs text-muted-foreground/40 group-hover:text-muted-foreground">{i + 1}</span>
                </div>
                {activeDb.columns.map((col) => (
                  <div key={col.id} className="flex items-center px-4 py-2.5 border-r border-border" style={{ minWidth: colWidth(col) }}>
                    {renderCell(row, col)}
                  </div>
                ))}
                <div className="w-8 shrink-0 flex items-center justify-center">
                  <button onClick={() => setConfirmDeleteRow(row.id)}
                    className="opacity-0 group-hover:opacity-100 notion-hover p-1 text-muted-foreground hover:text-destructive">
                    <Icon name="Trash2" size={12} />
                  </button>
                </div>
              </div>
            ))}

            <button onClick={addRow}
              className="flex items-center gap-2 px-4 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors w-full border-b border-border">
              <div className="w-8 -ml-4 shrink-0" />
              <Icon name="Plus" size={13} /> Новая запись
            </button>
          </div>
        )}
      </div>

      {/* Confirm delete DB */}
      {confirmDeleteDb && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50" onClick={() => setConfirmDeleteDb(null)}>
          <div className="bg-card border border-border rounded-xl p-5 shadow-lg w-72" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-foreground mb-1">Удалить базу данных?</h3>
            <p className="text-xs text-muted-foreground mb-4">Все записи будут удалены. Это нельзя отменить.</p>
            <div className="flex gap-2">
              <button onClick={() => { deleteDatabase(confirmDeleteDb); setActiveId(null); setConfirmDeleteDb(null); }}
                className="flex-1 py-1.5 bg-destructive text-white text-xs font-medium rounded-md hover:opacity-90">Удалить</button>
              <button onClick={() => setConfirmDeleteDb(null)}
                className="flex-1 py-1.5 border border-border text-xs rounded-md hover:bg-accent text-foreground">Отмена</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete row */}
      {confirmDeleteRow && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50" onClick={() => setConfirmDeleteRow(null)}>
          <div className="bg-card border border-border rounded-xl p-5 shadow-lg w-64" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-foreground mb-1">Удалить запись?</h3>
            <div className="flex gap-2 mt-4">
              <button onClick={() => deleteRow(confirmDeleteRow)}
                className="flex-1 py-1.5 bg-destructive text-white text-xs font-medium rounded-md hover:opacity-90">Удалить</button>
              <button onClick={() => setConfirmDeleteRow(null)}
                className="flex-1 py-1.5 border border-border text-xs rounded-md hover:bg-accent text-foreground">Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
