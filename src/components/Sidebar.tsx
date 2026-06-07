import { useState } from "react";
import Icon from "@/components/ui/icon";

interface Page {
  id: string;
  title: string;
  icon: string;
  section: string;
}

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  pages: Page[];
  onPageSelect: (page: Page) => void;
  activePage: Page | null;
  onAddPage: (section: string) => void;
}

const navItems = [
  { id: "workspace", label: "Рабочее пространство", icon: "LayoutDashboard" },
  { id: "notes", label: "Заметки", icon: "FileText" },
  { id: "databases", label: "Базы данных", icon: "Database" },
  { id: "calendar", label: "Календарь", icon: "Calendar" },
  { id: "automations", label: "Автоматизации", icon: "Zap" },
];

export default function Sidebar({
  activeSection,
  onSectionChange,
  pages,
  onPageSelect,
  activePage,
  onAddPage,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(["notes"]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const sectionPages = (section: string) => pages.filter((p) => p.section === section);

  return (
    <aside
      className={`flex flex-col h-full bg-[hsl(var(--sidebar-background))] border-r border-border transition-all duration-300 ${
        collapsed ? "w-12" : "w-56"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-foreground rounded-sm flex items-center justify-center">
              <span className="text-background text-[10px] font-bold">W</span>
            </div>
            <span className="text-sm font-semibold text-foreground">Workspace</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="notion-hover p-1 text-muted-foreground hover:text-foreground ml-auto"
        >
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
        {navItems.map((item) => (
          <div key={item.id}>
            <button
              onClick={() => {
                onSectionChange(item.id);
                if (item.id === "notes" || item.id === "databases") {
                  toggleSection(item.id);
                }
              }}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors duration-150 mb-0.5 ${
                activeSection === item.id
                  ? "bg-accent text-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Icon name={item.icon} size={15} />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {(item.id === "notes" || item.id === "databases") && (
                    <Icon
                      name={expandedSections.includes(item.id) ? "ChevronDown" : "ChevronRight"}
                      size={12}
                      className="opacity-50"
                    />
                  )}
                </>
              )}
            </button>

            {/* Sub-pages */}
            {!collapsed &&
              expandedSections.includes(item.id) &&
              sectionPages(item.id).map((page) => (
                <button
                  key={page.id}
                  onClick={() => onPageSelect(page)}
                  className={`w-full flex items-center gap-2 pl-6 pr-2 py-1 rounded-md text-sm transition-colors duration-150 mb-0.5 animate-fade-in ${
                    activePage?.id === page.id
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <span className="text-base leading-none">{page.icon}</span>
                  <span className="truncate">{page.title}</span>
                </button>
              ))}

            {/* Add page button */}
            {!collapsed &&
              expandedSections.includes(item.id) &&
              (item.id === "notes" || item.id === "databases") && (
                <button
                  onClick={() => onAddPage(item.id)}
                  className="w-full flex items-center gap-2 pl-6 pr-2 py-1 rounded-md text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors duration-150 mb-0.5"
                >
                  <Icon name="Plus" size={12} />
                  <span>Добавить</span>
                </button>
              )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="px-2 py-3 border-t border-border">
          <button className="w-full flex items-center gap-2 px-2 py-1.5 text-muted-foreground hover:text-foreground notion-hover text-sm">
            <Icon name="Settings" size={14} />
            <span>Настройки</span>
          </button>
        </div>
      )}
    </aside>
  );
}
