import { useState } from "react";
import Icon from "@/components/ui/icon";
import { useWorkspace } from "@/hooks/useWorkspace";

interface Props {
  onClose: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

const WORKSPACE_ICONS = ["🚀","💼","🏠","🌿","⚡","🎯","🔬","🎨","📚","🌐","🏆","💡"];

export default function SettingsPanel({ onClose, isDark, onToggleTheme }: Props) {
  const { settings, updateSettings, sections, addSection, updateSection, deleteSection, notes, databases } = useWorkspace();
  const [tab, setTab] = useState<"general" | "sections" | "data">("general");
  const [nameVal, setNameVal] = useState(settings.name);
  const [descVal, setDescVal] = useState(settings.description);
  const [wsIcon, setWsIcon] = useState("🚀");
  const [showIconPicker, setShowIconPicker] = useState(false);

  // New section form
  const [showNewSection, setShowNewSection] = useState(false);
  const [newSecTitle, setNewSecTitle] = useState("");
  const [newSecIcon, setNewSecIcon] = useState("📁");
  const [newSecType, setNewSecType] = useState<"notes" | "databases" | "custom">("notes");

  const SECTION_ICONS = ["📝","🗄️","📁","📊","🎯","💡","📅","🔖","👥","⚙️","🌟","🔍","📌","💼","🚀"];

  const handleSaveGeneral = () => {
    updateSettings({ name: nameVal.trim() || settings.name, description: descVal });
  };

  const handleAddSection = () => {
    if (!newSecTitle.trim()) return;
    addSection(newSecTitle.trim(), newSecIcon, newSecType);
    setNewSecTitle("");
    setNewSecIcon("📁");
    setShowNewSection(false);
  };

  const totalNotes = notes.length;
  const totalDbs = databases.length;
  const totalRows = databases.reduce((s, d) => s + d.rows.length, 0);

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-[560px] max-h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">Настройки</h2>
          <button onClick={onClose} className="notion-hover p-1 text-muted-foreground hover:text-foreground">
            <Icon name="X" size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-3 border-b border-border">
          {([
            { id: "general", label: "Основные", icon: "Settings" },
            { id: "sections", label: "Разделы", icon: "LayoutDashboard" },
            { id: "data", label: "Данные", icon: "BarChart2" },
          ] as const).map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-md border-b-2 transition-colors ${
                tab === t.id ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}>
              <Icon name={t.icon} size={13} /> {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {tab === "general" && (
            <>
              {/* Workspace name */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Название пространства</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowIconPicker(!showIconPicker)} className="text-2xl hover:scale-110 transition-transform">{wsIcon}</button>
                  <input value={nameVal} onChange={(e) => setNameVal(e.target.value)}
                    className="flex-1 text-sm px-3 py-2 border border-border rounded-md focus:outline-none focus:border-foreground/40 bg-transparent text-foreground" />
                </div>
                {showIconPicker && (
                  <div className="mt-2 p-2 rounded-lg border border-border bg-background grid grid-cols-12 gap-1 animate-fade-in">
                    {WORKSPACE_ICONS.map((ic) => (
                      <button key={ic} onClick={() => { setWsIcon(ic); setShowIconPicker(false); }}
                        className={`text-xl rounded p-1 hover:bg-accent transition-colors ${wsIcon === ic ? "bg-accent" : ""}`}>{ic}</button>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Описание</label>
                <textarea value={descVal} onChange={(e) => setDescVal(e.target.value)} rows={2}
                  className="w-full text-sm px-3 py-2 border border-border rounded-md focus:outline-none focus:border-foreground/40 bg-transparent resize-none text-foreground" />
              </div>

              <button onClick={handleSaveGeneral}
                className="px-4 py-2 bg-foreground text-background text-sm font-medium rounded-md hover:opacity-90 transition-opacity">
                Сохранить
              </button>

              {/* Theme */}
              <div className="pt-4 border-t border-border">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-3">Оформление</label>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon name={isDark ? "Moon" : "Sun"} size={15} className="text-muted-foreground" />
                    <span className="text-sm text-foreground">{isDark ? "Тёмная тема" : "Светлая тема"}</span>
                  </div>
                  <button onClick={onToggleTheme}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${isDark ? "bg-foreground" : "bg-muted"}`}>
                    <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${isDark ? "translate-x-4" : "translate-x-1"}`} />
                  </button>
                </div>
              </div>
            </>
          )}

          {tab === "sections" && (
            <>
              <div className="space-y-2">
                {sections.map((sec) => (
                  <div key={sec.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-background group">
                    <span className="text-lg">{sec.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{sec.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {sec.type === "notes" ? "Заметки" : sec.type === "databases" ? "Базы данных" : "Пользовательский"}
                      </p>
                    </div>
                    {sec.id !== "notes" && sec.id !== "databases" && (
                      <button onClick={() => deleteSection(sec.id)}
                        className="opacity-0 group-hover:opacity-100 notion-hover p-1 text-muted-foreground hover:text-destructive transition-all">
                        <Icon name="Trash2" size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {showNewSection ? (
                <div className="p-4 rounded-lg border border-border bg-background space-y-3 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <button onClick={() => {}} className="text-2xl">{newSecIcon}</button>
                    <input autoFocus value={newSecTitle} onChange={(e) => setNewSecTitle(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleAddSection(); if (e.key === "Escape") setShowNewSection(false); }}
                      placeholder="Название раздела..."
                      className="flex-1 text-sm px-3 py-1.5 border border-border rounded-md focus:outline-none bg-transparent text-foreground" />
                  </div>
                  <div className="grid grid-cols-15 gap-1">
                    {SECTION_ICONS.map((ic) => (
                      <button key={ic} onClick={() => setNewSecIcon(ic)}
                        className={`text-lg rounded p-0.5 hover:bg-accent transition-colors ${newSecIcon === ic ? "bg-accent" : ""}`}>{ic}</button>
                    ))}
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Тип раздела</label>
                    <select value={newSecType} onChange={(e) => setNewSecType(e.target.value as typeof newSecType)}
                      className="w-full text-sm px-3 py-1.5 border border-border rounded-md focus:outline-none bg-background text-foreground">
                      <option value="notes">Заметки</option>
                      <option value="databases">Базы данных</option>
                      <option value="custom">Пользовательский</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleAddSection} className="flex-1 py-1.5 bg-foreground text-background text-xs font-medium rounded-md hover:opacity-90">Создать</button>
                    <button onClick={() => setShowNewSection(false)} className="flex-1 py-1.5 border border-border text-xs rounded-md hover:bg-accent text-foreground">Отмена</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowNewSection(true)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 border border-dashed border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">
                  <Icon name="Plus" size={14} /> Добавить раздел
                </button>
              )}
            </>
          )}

          {tab === "data" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Заметок", value: totalNotes, icon: "FileText" },
                  { label: "Баз данных", value: totalDbs, icon: "Database" },
                  { label: "Записей в БД", value: totalRows, icon: "Rows" },
                ].map((s) => (
                  <div key={s.label} className="p-4 rounded-xl border border-border bg-background text-center">
                    <Icon name={s.icon} size={18} className="text-muted-foreground mx-auto mb-2" />
                    <p className="text-2xl font-semibold text-foreground font-mono-tag">{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl border border-border bg-background">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Хранилище</p>
                <p className="text-sm text-foreground">Все данные сохраняются в браузере (localStorage)</p>
                <p className="text-xs text-muted-foreground mt-1">Данные не покидают ваш браузер</p>
              </div>

              <div className="pt-2 border-t border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Опасная зона</p>
                <button
                  onClick={() => {
                    if (confirm("Сбросить все данные? Это нельзя отменить.")) {
                      ["ws_sections","ws_notes","ws_databases","ws_events","ws_rules","ws_settings"].forEach((k) => localStorage.removeItem(k));
                      window.location.reload();
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 border border-destructive/40 text-destructive text-sm rounded-md hover:bg-destructive/5 transition-colors">
                  <Icon name="Trash2" size={14} /> Сбросить все данные
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
