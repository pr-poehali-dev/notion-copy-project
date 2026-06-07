import Icon from "@/components/ui/icon";

interface WorkspaceViewProps {
  onNavigate: (section: string) => void;
}

const cards = [
  {
    id: "notes",
    title: "Заметки",
    icon: "FileText",
    description: "Создавайте и организуйте заметки",
    count: 3,
    color: "hsl(var(--notion-blue) / 0.12)",
    iconColor: "hsl(var(--notion-blue))",
  },
  {
    id: "databases",
    title: "Базы данных",
    icon: "Database",
    description: "Структурированные таблицы данных",
    count: 2,
    color: "hsl(var(--notion-green) / 0.12)",
    iconColor: "hsl(var(--notion-green))",
  },
  {
    id: "calendar",
    title: "Календарь",
    icon: "Calendar",
    description: "Планируйте события и задачи",
    count: 5,
    color: "hsl(var(--notion-orange) / 0.12)",
    iconColor: "hsl(var(--notion-orange))",
  },
  {
    id: "automations",
    title: "Автоматизации",
    icon: "Zap",
    description: "Правила и автодействия",
    count: 1,
    color: "hsl(var(--notion-purple) / 0.12)",
    iconColor: "hsl(var(--notion-purple))",
  },
];

const recentItems = [
  { title: "Идеи для продукта", icon: "💡", time: "2 часа назад", section: "notes" },
  { title: "CRM клиентов", icon: "👥", time: "вчера", section: "databases" },
  { title: "Встреча с командой", icon: "📅", time: "3 дня назад", section: "calendar" },
];

export default function WorkspaceView({ onNavigate }: WorkspaceViewProps) {
  const now = new Date();
  const greeting =
    now.getHours() < 12 ? "Доброе утро" : now.getHours() < 18 ? "Добрый день" : "Добрый вечер";

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-8 py-12">
        {/* Greeting */}
        <div className="mb-10 animate-fade-in">
          <p className="text-muted-foreground text-sm mb-1">{greeting}</p>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">
            Рабочее пространство
          </h1>
        </div>

        {/* Quick access cards */}
        <div className="grid grid-cols-2 gap-3 mb-10">
          {cards.map((card, i) => (
            <button
              key={card.id}
              onClick={() => onNavigate(card.id)}
              className="group text-left p-5 rounded-xl border border-border bg-card hover:border-foreground/20 transition-all duration-200 animate-fade-in"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                style={{ background: card.color }}
              >
                <Icon name={card.icon} size={18} style={{ color: card.iconColor }} />
              </div>
              <p className="font-medium text-foreground text-sm mb-0.5">{card.title}</p>
              <p className="text-xs text-muted-foreground">{card.description}</p>
              <p
                className="text-xs mt-2 font-mono-tag"
                style={{ color: card.iconColor }}
              >
                {card.count} элем.
              </p>
            </button>
          ))}
        </div>

        {/* Recent */}
        <div className="animate-fade-in" style={{ animationDelay: "240ms" }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Недавние
            </h2>
          </div>
          <div className="space-y-1">
            {recentItems.map((item, i) => (
              <button
                key={i}
                onClick={() => onNavigate(item.section)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors duration-150 text-left"
              >
                <span className="text-lg">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{item.time}</span>
                <Icon name="ArrowRight" size={13} className="text-muted-foreground opacity-0 group-hover:opacity-100" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
