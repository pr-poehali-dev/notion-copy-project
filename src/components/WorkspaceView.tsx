import { useState } from "react";
import Icon from "@/components/ui/icon";
import { useWorkspace } from "@/hooks/useWorkspace";

interface Props {
  onNavigate: (sectionId: string) => void;
}

export default function WorkspaceView({ onNavigate }: Props) {
  const { notes, databases, events, rules, sections, settings, updateSettings } = useWorkspace();
  const [editingName, setEditingName] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [nameVal, setNameVal] = useState(settings.name);
  const [descVal, setDescVal] = useState(settings.description);

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Доброе утро" : now.getHours() < 18 ? "Добрый день" : "Добрый вечер";

  const todayStr = now.toISOString().slice(0, 10);
  const todayEvents = events.filter((e) => e.date === todayStr);
  const activeRules = rules.filter((r) => r.active).length;

  const recentNotes = [...notes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 4);
  const recentDbs = [...databases].slice(0, 3);

  const statCards = [
    { label: "Заметок",         value: notes.length,     icon: "FileText",  color: "hsl(213 94% 68%)" },
    { label: "Баз данных",      value: databases.length, icon: "Database",  color: "hsl(142 69% 58%)" },
    { label: "Событий сегодня", value: todayEvents.length, icon: "Calendar", color: "hsl(25 95% 65%)" },
    { label: "Автоматизаций",   value: activeRules,      icon: "Zap",       color: "hsl(263 70% 68%)" },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-8 py-12">

        {/* Greeting + editable workspace name */}
        <div className="mb-10 animate-fade-in">
          <p className="text-muted-foreground text-sm mb-1">{greeting}</p>

          {editingName ? (
            <input autoFocus value={nameVal} onChange={(e) => setNameVal(e.target.value)}
              onBlur={() => { updateSettings({ name: nameVal.trim() || settings.name }); setEditingName(false); }}
              onKeyDown={(e) => { if (e.key === "Enter") { updateSettings({ name: nameVal.trim() || settings.name }); setEditingName(false); } if (e.key === "Escape") { setNameVal(settings.name); setEditingName(false); } }}
              className="text-3xl font-semibold bg-transparent border-b-2 border-foreground/30 focus:outline-none focus:border-foreground/60 text-foreground w-full tracking-tight" />
          ) : (
            <h1 className="text-3xl font-semibold text-foreground tracking-tight cursor-pointer hover:opacity-70 transition-opacity inline-flex items-center gap-2 group"
              onClick={() => { setNameVal(settings.name); setEditingName(true); }}
              title="Нажмите чтобы переименовать">
              {settings.name}
              <Icon name="Pencil" size={14} className="opacity-0 group-hover:opacity-40 transition-opacity" />
            </h1>
          )}

          {editingDesc ? (
            <input autoFocus value={descVal} onChange={(e) => setDescVal(e.target.value)}
              onBlur={() => { updateSettings({ description: descVal }); setEditingDesc(false); }}
              onKeyDown={(e) => { if (e.key === "Enter") { updateSettings({ description: descVal }); setEditingDesc(false); } if (e.key === "Escape") setEditingDesc(false); }}
              className="text-sm bg-transparent border-b border-foreground/20 focus:outline-none text-muted-foreground w-full mt-1" />
          ) : (
            <p className="text-sm text-muted-foreground mt-1 cursor-pointer hover:opacity-70 transition-opacity inline-flex items-center gap-1.5 group"
              onClick={() => { setDescVal(settings.description); setEditingDesc(true); }}>
              {settings.description || "Добавить описание..."}
              <Icon name="Pencil" size={11} className="opacity-0 group-hover:opacity-40 transition-opacity" />
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {statCards.map((s, i) => (
            <div key={i} className="p-4 rounded-xl border border-border bg-card animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
              <Icon name={s.icon} size={16} style={{ color: s.color }} className="mb-2" />
              <p className="text-2xl font-semibold text-foreground font-mono-tag">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Sections quick access */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: "200ms" }}>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Разделы</h2>
          <div className="grid grid-cols-2 gap-2">
            {sections.map((sec) => (
              <button key={sec.id} onClick={() => onNavigate(sec.id)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card hover:border-foreground/20 transition-all duration-200 text-left group">
                <span className="text-xl">{sec.icon}</span>
                <div>
                  <p className="text-sm font-medium text-foreground">{sec.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {sec.type === "notes" && `${notes.filter((n) => n.sectionId === sec.id).length} заметок`}
                    {sec.type === "databases" && `${databases.filter((d) => d.sectionId === sec.id).length} баз`}
                    {sec.type === "custom" && "Раздел"}
                  </p>
                </div>
                <Icon name="ArrowRight" size={14} className="ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>

        {/* Recent notes */}
        {recentNotes.length > 0 && (
          <div className="mb-8 animate-fade-in" style={{ animationDelay: "260ms" }}>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Недавние заметки</h2>
            <div className="space-y-1">
              {recentNotes.map((note) => {
                const sec = sections.find((s) => s.id === note.sectionId);
                return (
                  <button key={note.id} onClick={() => onNavigate(note.sectionId)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors text-left group">
                    <span className="text-lg">{note.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{note.title}</p>
                      {sec && <p className="text-xs text-muted-foreground">{sec.icon} {sec.title}</p>}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{note.updatedAt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent databases */}
        {recentDbs.length > 0 && (
          <div className="animate-fade-in" style={{ animationDelay: "320ms" }}>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Базы данных</h2>
            <div className="space-y-1">
              {recentDbs.map((db) => (
                <button key={db.id} onClick={() => onNavigate(db.sectionId)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors text-left">
                  <span className="text-lg">{db.icon}</span>
                  <p className="text-sm font-medium text-foreground flex-1">{db.title}</p>
                  <span className="text-xs text-muted-foreground font-mono-tag">{db.rows.length} записей</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Today's events */}
        {todayEvents.length > 0 && (
          <div className="mt-8 animate-fade-in" style={{ animationDelay: "380ms" }}>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Сегодня</h2>
            <div className="space-y-1.5">
              {todayEvents.map((ev) => (
                <div key={ev.id} className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border"
                  style={{ borderLeftColor: ev.color, borderLeftWidth: 3 }}>
                  <p className="text-sm font-medium text-foreground flex-1">{ev.title}</p>
                  {ev.time && <span className="text-xs text-muted-foreground font-mono-tag">{ev.time}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
