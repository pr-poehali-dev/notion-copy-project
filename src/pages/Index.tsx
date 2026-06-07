import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import WorkspaceView from "@/components/WorkspaceView";
import NotesView from "@/components/NotesView";
import DatabaseView from "@/components/DatabaseView";
import CalendarView from "@/components/CalendarView";
import AutomationsView from "@/components/AutomationsView";
import Icon from "@/components/ui/icon";

interface Page {
  id: string;
  title: string;
  icon: string;
  section: string;
}

const defaultPages: Page[] = [
  { id: "n1", title: "Идеи для продукта", icon: "💡", section: "notes" },
  { id: "n2", title: "Встреча с командой", icon: "👥", section: "notes" },
  { id: "n3", title: "Личные цели", icon: "🎯", section: "notes" },
  { id: "d1", title: "CRM клиентов", icon: "📊", section: "databases" },
  { id: "d2", title: "Задачи команды", icon: "✅", section: "databases" },
];

const sectionTitles: Record<string, string> = {
  workspace: "Рабочее пространство",
  notes: "Заметки",
  databases: "Базы данных",
  calendar: "Календарь",
  automations: "Автоматизации",
};

export default function Index() {
  const [activeSection, setActiveSection] = useState("workspace");
  const [pages, setPages] = useState<Page[]>(defaultPages);
  const [activePage, setActivePage] = useState<Page | null>(null);
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
  };

  const handleAddPage = (section: string) => {
    const icons: Record<string, string> = { notes: "📝", databases: "📋" };
    const newPage: Page = {
      id: Date.now().toString(),
      title: section === "notes" ? "Новая заметка" : "Новая база",
      icon: icons[section] || "📄",
      section,
    };
    setPages([...pages, newPage]);
    setActivePage(newPage);
    setActiveSection(section);
  };

  const renderContent = () => {
    switch (activeSection) {
      case "workspace":
        return <WorkspaceView onNavigate={(s) => { setActiveSection(s); setActivePage(null); }} />;
      case "notes":
        return <NotesView />;
      case "databases":
        return <DatabaseView />;
      case "calendar":
        return <CalendarView />;
      case "automations":
        return <AutomationsView />;
      default:
        return <WorkspaceView onNavigate={(s) => { setActiveSection(s); setActivePage(null); }} />;
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={(s) => { setActiveSection(s); setActivePage(null); }}
        pages={pages}
        onPageSelect={(p) => { setActivePage(p); setActiveSection(p.section); }}
        activePage={activePage}
        onAddPage={handleAddPage}
      />

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top bar */}
        <header className="h-10 shrink-0 border-b border-border flex items-center px-4 gap-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>Workspace</span>
            <Icon name="ChevronRight" size={12} />
            <span className="text-foreground font-medium">
              {activePage ? activePage.title : sectionTitles[activeSection]}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <button className="notion-hover p-1.5 text-muted-foreground hover:text-foreground">
              <Icon name="Share2" size={14} />
            </button>
            <button className="notion-hover p-1.5 text-muted-foreground hover:text-foreground">
              <Icon name="MoreHorizontal" size={14} />
            </button>
            <div className="w-px h-4 bg-border mx-1" />
            <button
              onClick={toggleTheme}
              className="notion-hover p-1.5 text-muted-foreground hover:text-foreground"
              title={isDark ? "Светлая тема" : "Тёмная тема"}
            >
              <Icon name={isDark ? "Sun" : "Moon"} size={14} />
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex flex-1 overflow-hidden">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}