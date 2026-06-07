import { useState } from "react";
import Icon from "@/components/ui/icon";

type FieldType = "text" | "number" | "select" | "date" | "checkbox";

interface Column {
  id: string;
  name: string;
  type: FieldType;
}

interface Row {
  id: string;
  [key: string]: string | boolean | number;
}

interface Database {
  id: string;
  name: string;
  icon: string;
  columns: Column[];
  rows: Row[];
}

const statusOptions = ["В работе", "Готово", "На паузе", "Идея"];

const defaultDatabases: Database[] = [
  {
    id: "1",
    name: "CRM клиентов",
    icon: "👥",
    columns: [
      { id: "name", name: "Имя", type: "text" },
      { id: "company", name: "Компания", type: "text" },
      { id: "status", name: "Статус", type: "select" },
      { id: "revenue", name: "Выручка ₽", type: "number" },
      { id: "active", name: "Активный", type: "checkbox" },
    ],
    rows: [
      { id: "1", name: "Алексей Петров", company: "Рога и Копыта", status: "В работе", revenue: 150000, active: true },
      { id: "2", name: "Мария Сидорова", company: "Альфа Групп", status: "Готово", revenue: 320000, active: true },
      { id: "3", name: "Дмитрий Козлов", company: "Бета Сервис", status: "На паузе", revenue: 80000, active: false },
    ],
  },
  {
    id: "2",
    name: "Задачи команды",
    icon: "✅",
    columns: [
      { id: "task", name: "Задача", type: "text" },
      { id: "assignee", name: "Ответственный", type: "text" },
      { id: "status", name: "Статус", type: "select" },
      { id: "deadline", name: "Дедлайн", type: "date" },
    ],
    rows: [
      { id: "1", task: "Дизайн лендинга", assignee: "Анна", status: "В работе", deadline: "2024-02-15" },
      { id: "2", task: "API интеграция", assignee: "Сергей", status: "Идея", deadline: "2024-02-20" },
      { id: "3", task: "Тестирование", assignee: "Ольга", status: "Готово", deadline: "2024-02-10" },
    ],
  },
];

const statusColors: Record<string, string> = {
  "В работе": "hsl(var(--notion-blue) / 0.15)",
  "Готово": "hsl(var(--notion-green) / 0.15)",
  "На паузе": "hsl(var(--notion-orange) / 0.15)",
  "Идея": "hsl(var(--notion-purple) / 0.15)",
};

const statusTextColors: Record<string, string> = {
  "В работе": "hsl(var(--notion-blue))",
  "Готово": "hsl(var(--notion-green))",
  "На паузе": "hsl(var(--notion-orange))",
  "Идея": "hsl(var(--notion-purple))",
};

export default function DatabaseView() {
  const [databases, setDatabases] = useState<Database[]>(defaultDatabases);
  const [activeDb, setActiveDb] = useState<Database>(defaultDatabases[0]);
  const [editingCell, setEditingCell] = useState<{ rowId: string; colId: string } | null>(null);

  const updateCell = (rowId: string, colId: string, value: string | boolean) => {
    const updated = databases.map((db) => {
      if (db.id !== activeDb.id) return db;
      return {
        ...db,
        rows: db.rows.map((row) =>
          row.id === rowId ? { ...row, [colId]: value } : row
        ),
      };
    });
    setDatabases(updated);
    const found = updated.find((d) => d.id === activeDb.id);
    if (found) setActiveDb(found);
    setEditingCell(null);
  };

  const addRow = () => {
    const newRow: Row = { id: Date.now().toString() };
    activeDb.columns.forEach((col) => {
      newRow[col.id] = col.type === "checkbox" ? false : col.type === "number" ? 0 : "";
    });
    const updated = databases.map((db) =>
      db.id === activeDb.id ? { ...db, rows: [...db.rows, newRow] } : db
    );
    setDatabases(updated);
    const found = updated.find((d) => d.id === activeDb.id);
    if (found) setActiveDb(found);
  };

  const renderCell = (row: Row, col: Column) => {
    const value = row[col.id];
    const isEditing =
      editingCell?.rowId === row.id && editingCell?.colId === col.id;

    if (col.type === "checkbox") {
      return (
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => updateCell(row.id, col.id, e.target.checked)}
          className="w-4 h-4 rounded border-border accent-foreground cursor-pointer"
        />
      );
    }

    if (col.type === "select") {
      if (isEditing) {
        return (
          <select
            autoFocus
            defaultValue={value as string}
            onChange={(e) => updateCell(row.id, col.id, e.target.value)}
            onBlur={() => setEditingCell(null)}
            className="text-xs bg-card border border-border rounded px-1 py-0.5 focus:outline-none"
          >
            {statusOptions.map((o) => <option key={o}>{o}</option>)}
          </select>
        );
      }
      const v = value as string;
      return (
        <span
          onClick={() => setEditingCell({ rowId: row.id, colId: col.id })}
          className="px-2 py-0.5 rounded-md text-xs cursor-pointer font-medium"
          style={{
            background: statusColors[v] || "hsl(var(--accent))",
            color: statusTextColors[v] || "hsl(var(--muted-foreground))",
          }}
        >
          {v || "—"}
        </span>
      );
    }

    if (isEditing) {
      return (
        <input
          autoFocus
          defaultValue={value as string}
          onBlur={(e) => updateCell(row.id, col.id, e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && updateCell(row.id, col.id, (e.target as HTMLInputElement).value)}
          className="w-full text-xs bg-transparent border-b border-foreground/30 focus:outline-none py-0.5"
        />
      );
    }

    return (
      <span
        onClick={() => setEditingCell({ rowId: row.id, colId: col.id })}
        className="cursor-text text-sm text-foreground"
      >
        {col.type === "number" && value
          ? Number(value).toLocaleString("ru-RU")
          : (value as string) || <span className="text-muted-foreground/40">—</span>}
      </span>
    );
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* DB list */}
      <div className="w-52 shrink-0 border-r border-border overflow-y-auto">
        <div className="p-3 border-b border-border">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Базы данных</h2>
        </div>
        <div className="p-2 space-y-0.5">
          {databases.map((db) => (
            <button
              key={db.id}
              onClick={() => setActiveDb(db)}
              className={`w-full text-left px-2 py-2 rounded-md transition-colors duration-150 flex items-center gap-2 ${
                activeDb.id === db.id ? "bg-accent" : "hover:bg-accent"
              }`}
            >
              <span className="text-base">{db.icon}</span>
              <span className="text-sm font-medium text-foreground truncate">{db.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-max">
          {/* Table header */}
          <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{activeDb.icon}</span>
              <h1 className="text-base font-semibold text-foreground">{activeDb.name}</h1>
              <span className="text-xs text-muted-foreground font-mono-tag ml-1">{activeDb.rows.length} записей</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors">
                <Icon name="Filter" size={13} />
                Фильтр
              </button>
              <button
                onClick={addRow}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground text-background text-xs font-medium rounded-md hover:opacity-90 transition-opacity"
              >
                <Icon name="Plus" size={13} />
                Добавить
              </button>
            </div>
          </div>

          {/* Column headers */}
          <div className="flex border-b border-border bg-[hsl(var(--sidebar-background))]">
            <div className="w-8 shrink-0 border-r border-border" />
            {activeDb.columns.map((col) => (
              <div
                key={col.id}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-r border-border"
                style={{ minWidth: col.type === "text" ? 160 : col.type === "checkbox" ? 80 : 120 }}
              >
                <Icon
                  name={
                    col.type === "text" ? "Type" :
                    col.type === "number" ? "Hash" :
                    col.type === "select" ? "Tag" :
                    col.type === "date" ? "Calendar" :
                    "CheckSquare"
                  }
                  size={11}
                />
                {col.name}
              </div>
            ))}
          </div>

          {/* Rows */}
          {activeDb.rows.map((row, i) => (
            <div
              key={row.id}
              className="flex border-b border-border hover:bg-accent/40 transition-colors duration-100 group animate-fade-in"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className="w-8 shrink-0 border-r border-border flex items-center justify-center">
                <span className="text-xs text-muted-foreground/40 group-hover:text-muted-foreground">{i + 1}</span>
              </div>
              {activeDb.columns.map((col) => (
                <div
                  key={col.id}
                  className="flex items-center px-4 py-2.5 border-r border-border"
                  style={{ minWidth: col.type === "text" ? 160 : col.type === "checkbox" ? 80 : 120 }}
                >
                  {renderCell(row, col)}
                </div>
              ))}
            </div>
          ))}

          {/* Add row */}
          <button
            onClick={addRow}
            className="flex items-center gap-2 px-4 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors w-full text-left border-b border-border"
          >
            <div className="w-8 -ml-4 shrink-0" />
            <Icon name="Plus" size={13} />
            Новая запись
          </button>
        </div>
      </div>
    </div>
  );
}
