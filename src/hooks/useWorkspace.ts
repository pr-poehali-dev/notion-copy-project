import { useState, useEffect } from "react";

export interface Tag {
  id: string;
  label: string;
  color: string;
}

export interface Note {
  id: string;
  title: string;
  icon: string;
  content: string;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
  sectionId: string;
}

export interface DBColumn {
  id: string;
  name: string;
  type: "text" | "number" | "select" | "date" | "checkbox";
}

export interface DBRow {
  id: string;
  [key: string]: string | boolean | number;
}

export interface Database {
  id: string;
  title: string;
  icon: string;
  columns: DBColumn[];
  rows: DBRow[];
  createdAt: string;
  sectionId: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  color: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  active: boolean;
  runs: number;
  lastRun?: string;
}

export interface Section {
  id: string;
  title: string;
  icon: string;
  type: "notes" | "databases" | "custom";
}

export interface WorkspaceSettings {
  name: string;
  description: string;
}

const TAG_COLORS = [
  { bg: "hsl(213 94% 68% / 0.15)", text: "hsl(213 80% 45%)" },
  { bg: "hsl(142 69% 58% / 0.15)", text: "hsl(142 60% 35%)" },
  { bg: "hsl(25 95% 65% / 0.15)", text: "hsl(25 80% 40%)" },
  { bg: "hsl(263 70% 68% / 0.15)", text: "hsl(263 60% 45%)" },
  { bg: "hsl(0 72% 65% / 0.15)", text: "hsl(0 65% 45%)" },
];

const INITIAL_SECTIONS: Section[] = [
  { id: "notes", title: "Заметки", icon: "📝", type: "notes" },
  { id: "databases", title: "Базы данных", icon: "🗄️", type: "databases" },
];

const INITIAL_NOTES: Note[] = [
  {
    id: "n1", title: "Идеи для продукта", icon: "💡", sectionId: "notes",
    content: "# Идеи для продукта\n\nЗдесь можно хранить идеи для развития продукта.\n\n- Добавить онбординг\n- Улучшить аналитику\n- Интеграция с API",
    tags: [{ id: "t1", label: "продукт", color: "0" }, { id: "t2", label: "идеи", color: "1" }],
    createdAt: "2026-06-01", updatedAt: "2026-06-06",
  },
  {
    id: "n2", title: "Встреча с командой", icon: "👥", sectionId: "notes",
    content: "# Встреча с командой\n\nПовестка дня:\n\n1. Обсуждение спринта\n2. Демо фичей\n3. Ретроспектива",
    tags: [{ id: "t3", label: "команда", color: "2" }],
    createdAt: "2026-06-03", updatedAt: "2026-06-07",
  },
];

const INITIAL_DBS: Database[] = [
  {
    id: "db1", title: "CRM клиентов", icon: "👥", sectionId: "databases",
    createdAt: "2026-06-01",
    columns: [
      { id: "name", name: "Имя", type: "text" },
      { id: "company", name: "Компания", type: "text" },
      { id: "status", name: "Статус", type: "select" },
      { id: "revenue", name: "Выручка ₽", type: "number" },
      { id: "active", name: "Активный", type: "checkbox" },
    ],
    rows: [
      { id: "r1", name: "Алексей Петров", company: "Рога и Копыта", status: "В работе", revenue: 150000, active: true },
      { id: "r2", name: "Мария Сидорова", company: "Альфа Групп", status: "Готово", revenue: 320000, active: true },
    ],
  },
];

const INITIAL_EVENTS: CalendarEvent[] = [
  { id: "e1", title: "Встреча с командой", date: "2026-06-10", time: "10:00", color: "hsl(213 94% 68%)" },
  { id: "e2", title: "Дедлайн проекта", date: "2026-06-15", time: "18:00", color: "hsl(0 72% 65%)" },
  { id: "e3", title: "Демо клиенту", date: "2026-06-08", time: "14:30", color: "hsl(142 69% 58%)" },
];

const INITIAL_RULES: AutomationRule[] = [
  { id: "a1", name: "Уведомление о новом клиенте", trigger: "Новая запись в базе данных", action: "Отправить уведомление", active: true, runs: 24, lastRun: "2 часа назад" },
  { id: "a2", name: "Еженедельный отчёт", trigger: "Каждую неделю в понедельник", action: "Создать новую заметку", active: true, runs: 8, lastRun: "вчера" },
];

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getTagStyle(colorIndex: string) {
  const idx = parseInt(colorIndex) % TAG_COLORS.length;
  return TAG_COLORS[idx];
}

export function useWorkspace() {
  const [sections, setSections] = useState<Section[]>(() => load("ws_sections", INITIAL_SECTIONS));
  const [notes, setNotes] = useState<Note[]>(() => load("ws_notes", INITIAL_NOTES));
  const [databases, setDatabases] = useState<Database[]>(() => load("ws_databases", INITIAL_DBS));
  const [events, setEvents] = useState<CalendarEvent[]>(() => load("ws_events", INITIAL_EVENTS));
  const [rules, setRules] = useState<AutomationRule[]>(() => load("ws_rules", INITIAL_RULES));
  const [settings, setSettings] = useState<WorkspaceSettings>(() =>
    load("ws_settings", { name: "Моё пространство", description: "Личное рабочее пространство" })
  );

  useEffect(() => { save("ws_sections", sections); }, [sections]);
  useEffect(() => { save("ws_notes", notes); }, [notes]);
  useEffect(() => { save("ws_databases", databases); }, [databases]);
  useEffect(() => { save("ws_events", events); }, [events]);
  useEffect(() => { save("ws_rules", rules); }, [rules]);
  useEffect(() => { save("ws_settings", settings); }, [settings]);

  // --- Sections ---
  const addSection = (title: string, icon: string, type: Section["type"] = "custom") => {
    const s: Section = { id: Date.now().toString(), title, icon, type };
    setSections((prev) => [...prev, s]);
    return s;
  };
  const updateSection = (id: string, patch: Partial<Section>) =>
    setSections((prev) => prev.map((s) => s.id === id ? { ...s, ...patch } : s));
  const deleteSection = (id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
    setNotes((prev) => prev.filter((n) => n.sectionId !== id));
    setDatabases((prev) => prev.filter((d) => d.sectionId !== id));
  };

  // --- Notes ---
  const addNote = (sectionId: string, title: string, icon: string): Note => {
    const n: Note = {
      id: Date.now().toString(), title, icon, sectionId,
      content: `# ${title}\n\nНачните писать...`,
      tags: [], createdAt: new Date().toLocaleDateString("ru-RU"), updatedAt: new Date().toLocaleDateString("ru-RU"),
    };
    setNotes((prev) => [n, ...prev]);
    return n;
  };
  const updateNote = (id: string, patch: Partial<Note>) =>
    setNotes((prev) => prev.map((n) => n.id === id ? { ...n, ...patch, updatedAt: new Date().toLocaleDateString("ru-RU") } : n));
  const deleteNote = (id: string) => setNotes((prev) => prev.filter((n) => n.id !== id));

  // --- Databases ---
  const addDatabase = (sectionId: string, title: string, icon: string): Database => {
    const db: Database = {
      id: Date.now().toString(), title, icon, sectionId,
      createdAt: new Date().toLocaleDateString("ru-RU"),
      columns: [
        { id: "name", name: "Название", type: "text" },
        { id: "status", name: "Статус", type: "select" },
        { id: "note", name: "Заметка", type: "text" },
      ],
      rows: [],
    };
    setDatabases((prev) => [db, ...prev]);
    return db;
  };
  const updateDatabase = (id: string, patch: Partial<Database>) =>
    setDatabases((prev) => prev.map((d) => d.id === id ? { ...d, ...patch } : d));
  const deleteDatabase = (id: string) => setDatabases((prev) => prev.filter((d) => d.id !== id));

  // --- Events ---
  const addEvent = (ev: Omit<CalendarEvent, "id">) => {
    const e: CalendarEvent = { ...ev, id: Date.now().toString() };
    setEvents((prev) => [...prev, e]);
  };
  const deleteEvent = (id: string) => setEvents((prev) => prev.filter((e) => e.id !== id));

  // --- Rules ---
  const addRule = (r: Omit<AutomationRule, "id" | "runs">) => {
    const rule: AutomationRule = { ...r, id: Date.now().toString(), runs: 0 };
    setRules((prev) => [...prev, rule]);
  };
  const updateRule = (id: string, patch: Partial<AutomationRule>) =>
    setRules((prev) => prev.map((r) => r.id === id ? { ...r, ...patch } : r));
  const deleteRule = (id: string) => setRules((prev) => prev.filter((r) => r.id !== id));

  // --- Settings ---
  const updateSettings = (patch: Partial<WorkspaceSettings>) =>
    setSettings((prev) => ({ ...prev, ...patch }));

  return {
    sections, notes, databases, events, rules, settings,
    addSection, updateSection, deleteSection,
    addNote, updateNote, deleteNote,
    addDatabase, updateDatabase, deleteDatabase,
    addEvent, deleteEvent,
    addRule, updateRule, deleteRule,
    updateSettings,
    TAG_COLORS,
  };
}
