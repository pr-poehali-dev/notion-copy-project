import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import WorkspaceView from "@/components/WorkspaceView";
import NotesView from "@/components/NotesView";
import DatabaseView from "@/components/DatabaseView";
import CalendarView from "@/components/CalendarView";
import AutomationsView from "@/components/AutomationsView";
import SettingsPanel from "@/components/SettingsPanel";
import Icon from "@/components/ui/icon";
import { useWorkspace } from "@/hooks/useWorkspace";

const FIXED_TITLES: Record<string, string> = {
  workspace:   "Рабочее пространство",
  calendar:    "Календарь",
  automations: "Автоматизации",
};

export default function Index() {
  const ws = useWorkspace();

  const [activeSection, setActiveSection] = useState("workspace");
  const [showSettings, setShowSettings] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    const dark = saved === "dark";
    document.documentElement.classList.toggle("dark", dark);
    return dark;
  });

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const activeTitle = () => {
    if (FIXED_TITLES[activeSection]) return FIXED_TITLES[activeSection];
    const sec = ws.sections.find((s) => s.id === activeSection);
    return sec ? `${sec.icon} ${sec.title}` : "";
  };

  const renderContent = () => {
    if (activeSection === "workspace") return <WorkspaceView onNavigate={setActiveSection} />;
    if (activeSection === "calendar")  return <CalendarView />;
    if (activeSection === "automations") return <AutomationsView />;

    const sec = ws.sections.find((s) => s.id === activeSection);
    if (!sec) return <WorkspaceView onNavigate={setActiveSection} />;

    if (sec.type === "notes")     return <NotesView sectionId={sec.id} />;
    if (sec.type === "databases") return <DatabaseView sectionId={sec.id} />;

    // custom — показываем заглушку с выбором типа контента
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <span className="text-4xl">{sec.icon}</span>
        <h2 className="text-xl font-semibold text-foreground">{sec.title}</h2>
        <p className="text-sm text-muted-foreground">Пользовательский раздел</p>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        sections={ws.sections}
        onOpenSettings={() => setShowSettings(true)}
        onAddSection={(title, icon, type) => {
          const sec = ws.addSection(title, icon, type);
          setActiveSection(sec.id);
        }}
        onDeleteSection={(id) => {
          ws.deleteSection(id);
          if (activeSection === id) setActiveSection("workspace");
        }}
        workspaceName={ws.settings.name}
      />

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top bar */}
        <header className="h-10 shrink-0 border-b border-border flex items-center px-4 gap-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>{ws.settings.name}</span>
            <Icon name="ChevronRight" size={12} />
            <span className="text-foreground font-medium">{activeTitle()}</span>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="notion-hover p-1.5 text-muted-foreground hover:text-foreground"
              title={isDark ? "Светлая тема" : "Тёмная тема"}
            >
              <Icon name={isDark ? "Sun" : "Moon"} size={14} />
            </button>
            <div className="w-px h-4 bg-border mx-1" />
            <button
              onClick={() => setShowSettings(true)}
              className="notion-hover p-1.5 text-muted-foreground hover:text-foreground"
              title="Настройки"
            >
              <Icon name="Settings" size={14} />
            </button>
          </div>
        </header>

        <main className="flex flex-1 overflow-hidden">
          {renderContent()}
        </main>
      </div>

      {showSettings && (
        <SettingsPanel
          onClose={() => setShowSettings(false)}
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />
      )}
    </div>
  );
}
