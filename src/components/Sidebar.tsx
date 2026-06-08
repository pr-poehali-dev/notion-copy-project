import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { Section } from "@/hooks/useWorkspace";

const EMOJI_OPTIONS = [
  "📝","💡","📌","📎","🗂️","📁","📋","📊","📈","📉",
  "✅","🎯","🔖","🗒️","💼","🧩","🔍","💬","🌟","🚀",
  "👥","🤝","📅","🕐","🔔","⚙️","🛠️","🎨","📷","🌐",
  "❤️","🧠","💰","🏆","🎪","🌿","🔐","📣","🧪","✨",
];

interface SidebarProps {
  activeSection: string;
  onSectionChange: (id: string) => void;
  sections: Section[];
  onOpenSettings: () => void;
  onAddSection: (title: string, icon: string, type: Section["type"]) => void;
  onDeleteSection: (id: string) => void;
  workspaceName: string;
}

const FIXED_NAV = [
  { id: "workspace",    label: "Рабочее пространство", icon: "LayoutDashboard" },
  { id: "calendar",     label: "Календарь",             icon: "Calendar"        },
  { id: "automations",  label: "Автоматизации",         icon: "Zap"             },
];

function CreateSectionForm({ onConfirm, onCancel }: {
  onConfirm: (t: string, i: string, type: Section["type"]) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("📁");
  const [type, setType] = useState<Section["type"]>("notes");
  const [showEmoji, setShowEmoji] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);

  return (
    <div className="mx-2 mb-1 p-3 rounded-lg border border-border bg-card animate-fade-in shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <button onClick={() => setShowEmoji(!showEmoji)} className="text-xl hover:scale-110 transition-transform">{icon}</button>
        <input ref={ref} value={title} onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onConfirm(title.trim() || "Новый раздел", icon, type);
            if (e.key === "Escape") onCancel();
          }}
          placeholder="Название раздела..."
          className="flex-1 text-xs px-2 py-1.5 border border-border rounded-md bg-transparent focus:outline-none focus:border-foreground/40 text-foreground" />
      </div>
      {showEmoji && (
        <div className="mb-2 p-2 rounded-lg border border-border bg-background grid grid-cols-8 gap-0.5 max-h-28 overflow-y-auto">
          {EMOJI_OPTIONS.map((e) => (
            <button key={e} onClick={() => { setIcon(e); setShowEmoji(false); }}
              className={`text-base rounded p-0.5 hover:bg-accent transition-colors ${icon === e ? "bg-accent" : ""}`}>{e}</button>
          ))}
        </div>
      )}
      <div className="mb-2">
        <select value={type} onChange={(e) => setType(e.target.value as Section["type"])}
          className="w-full text-xs px-2 py-1 border border-border rounded-md bg-background focus:outline-none text-foreground">
          <option value="notes">Заметки</option>
          <option value="databases">Базы данных</option>
        </select>
      </div>
      <div className="flex gap-1.5">
        <button onClick={() => onConfirm(title.trim() || "Новый раздел", icon, type)}
          className="flex-1 py-1 bg-foreground text-background text-xs font-medium rounded-md hover:opacity-90">Создать</button>
        <button onClick={onCancel}
          className="flex-1 py-1 border border-border text-xs rounded-md hover:bg-accent text-foreground">Отмена</button>
      </div>
    </div>
  );
}

export default function Sidebar({
  activeSection, onSectionChange, sections,
  onOpenSettings, onAddSection, onDeleteSection, workspaceName,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  return (
    <aside className={`flex flex-col h-full bg-[hsl(var(--sidebar-background))] border-r border-border transition-all duration-300 ${collapsed ? "w-12" : "w-56"}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-foreground rounded-sm flex items-center justify-center shrink-0">
              <span className="text-background text-[10px] font-bold">W</span>
            </div>
            <span className="text-sm font-semibold text-foreground truncate">{workspaceName}</span>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="notion-hover p-1 text-muted-foreground hover:text-foreground ml-auto">
          <Icon name={collapsed ? "PanelLeftOpen" : "PanelLeftClose"} size={15} />
        </button>
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="px-2 py-2">
          <button className="w-full flex items-center gap-2 px-2 py-1.5 text-muted-foreground hover:text-foreground notion-hover text-sm">
            <Icon name="Search" size={14} />
            <span>Поиск...</span>
            <span className="ml-auto font-mono-tag text-xs opacity-50">⌘K</span>
          </button>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-1 overflow-y-auto">
        {FIXED_NAV.map((item) => (
          <button key={item.id} onClick={() => onSectionChange(item.id)}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors duration-150 mb-0.5 ${
              activeSection === item.id
                ? "bg-accent text-foreground font-medium"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}>
            <Icon name={item.icon} size={15} />
            {!collapsed && <span className="flex-1 text-left truncate">{item.label}</span>}
          </button>
        ))}

        {/* Dynamic sections */}
        {!collapsed && sections.length > 0 && (
          <div className="mt-3 mb-1 px-2">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Разделы</span>
          </div>
        )}

        {sections.map((sec) => (
          <div key={sec.id} className="group relative">
            <button onClick={() => onSectionChange(sec.id)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors duration-150 mb-0.5 ${
                activeSection === sec.id
                  ? "bg-accent text-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}>
              <span className="text-base leading-none shrink-0">{sec.icon}</span>
              {!collapsed && <span className="flex-1 text-left truncate">{sec.title}</span>}
            </button>
            {!collapsed && sec.id !== "notes" && sec.id !== "databases" && (
              <button onClick={() => setConfirmDelete(sec.id)}
                className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 notion-hover p-1 text-muted-foreground hover:text-destructive">
                <Icon name="X" size={11} />
              </button>
            )}
          </div>
        ))}

        {/* Add section */}
        {!collapsed && (
          creating ? (
            <CreateSectionForm
              onConfirm={(t, i, type) => { onAddSection(t, i, type); setCreating(false); }}
              onCancel={() => setCreating(false)}
            />
          ) : (
            <button onClick={() => setCreating(true)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors mt-1">
              <Icon name="Plus" size={12} />
              <span>Новый раздел</span>
            </button>
          )
        )}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="px-2 py-3 border-t border-border">
          <button onClick={onOpenSettings}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-muted-foreground hover:text-foreground notion-hover text-sm">
            <Icon name="Settings" size={14} />
            <span>Настройки</span>
          </button>
        </div>
      )}

      {/* Confirm delete section */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50" onClick={() => setConfirmDelete(null)}>
          <div className="bg-card border border-border rounded-xl p-5 shadow-lg w-64" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-foreground mb-1">Удалить раздел?</h3>
            <p className="text-xs text-muted-foreground mb-4">Все данные раздела будут удалены.</p>
            <div className="flex gap-2">
              <button onClick={() => { onDeleteSection(confirmDelete); setConfirmDelete(null); }}
                className="flex-1 py-1.5 bg-destructive text-white text-xs font-medium rounded-md hover:opacity-90">Удалить</button>
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 py-1.5 border border-border text-xs rounded-md hover:bg-accent text-foreground">Отмена</button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
