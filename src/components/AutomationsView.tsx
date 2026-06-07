import { useState } from "react";
import Icon from "@/components/ui/icon";

interface Rule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  active: boolean;
  runs: number;
  lastRun?: string;
}

const triggerOptions = [
  "Новая запись в базе данных",
  "Изменение статуса",
  "Наступление даты",
  "Создание заметки",
  "Каждый день в 9:00",
  "Каждую неделю в понедельник",
];

const actionOptions = [
  "Отправить уведомление",
  "Создать задачу",
  "Изменить статус записи",
  "Создать новую заметку",
  "Отправить email",
  "Архивировать запись",
];

const defaultRules: Rule[] = [
  {
    id: "1",
    name: "Уведомление о новом клиенте",
    trigger: "Новая запись в базе данных",
    action: "Отправить уведомление",
    active: true,
    runs: 24,
    lastRun: "2 часа назад",
  },
  {
    id: "2",
    name: "Еженедельный отчёт",
    trigger: "Каждую неделю в понедельник",
    action: "Создать новую заметку",
    active: true,
    runs: 8,
    lastRun: "вчера",
  },
  {
    id: "3",
    name: "Архивация завершённых задач",
    trigger: "Изменение статуса",
    action: "Архивировать запись",
    active: false,
    runs: 45,
    lastRun: "5 дней назад",
  },
];

interface CreateFormState {
  name: string;
  trigger: string;
  action: string;
}

export default function AutomationsView() {
  const [rules, setRules] = useState<Rule[]>(defaultRules);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CreateFormState>({ name: "", trigger: triggerOptions[0], action: actionOptions[0] });

  const toggleRule = (id: string) => {
    setRules(rules.map((r) => r.id === id ? { ...r, active: !r.active } : r));
  };

  const deleteRule = (id: string) => {
    setRules(rules.filter((r) => r.id !== id));
  };

  const createRule = () => {
    if (!form.name.trim()) return;
    const newRule: Rule = {
      id: Date.now().toString(),
      name: form.name,
      trigger: form.trigger,
      action: form.action,
      active: true,
      runs: 0,
    };
    setRules([...rules, newRule]);
    setForm({ name: "", trigger: triggerOptions[0], action: actionOptions[0] });
    setShowCreate(false);
  };

  const activeCount = rules.filter((r) => r.active).length;
  const totalRuns = rules.reduce((sum, r) => sum + r.runs, 0);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">Автоматизации</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Создавайте правила для автоматических действий
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-foreground text-background text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            <Icon name="Plus" size={15} />
            Создать правило
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "Активных правил", value: activeCount, icon: "Zap", color: "hsl(var(--notion-green))" },
            { label: "Всего правил", value: rules.length, icon: "List", color: "hsl(var(--notion-blue))" },
            { label: "Всего запусков", value: totalRuns, icon: "Activity", color: "hsl(var(--notion-purple))" },
          ].map((stat, i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-border bg-card animate-fade-in"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon name={stat.icon} size={14} style={{ color: stat.color }} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-2xl font-semibold text-foreground font-mono-tag">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Create form */}
        {showCreate && (
          <div className="mb-6 p-5 rounded-xl border border-foreground/20 bg-card animate-fade-in">
            <h3 className="text-sm font-semibold text-foreground mb-4">Новое правило</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Название</label>
                <input
                  autoFocus
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Например: Уведомление о новом лиде"
                  className="w-full text-sm px-3 py-2 border border-border rounded-md focus:outline-none focus:border-foreground/40 bg-transparent transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1 block">
                    <Icon name="GitBranch" size={11} />
                    Триггер (когда)
                  </label>
                  <select
                    value={form.trigger}
                    onChange={(e) => setForm({ ...form, trigger: e.target.value })}
                    className="w-full text-sm px-3 py-2 border border-border rounded-md focus:outline-none focus:border-foreground/40 bg-background transition-colors"
                  >
                    {triggerOptions.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1 block">
                    <Icon name="ArrowRight" size={11} />
                    Действие (что делать)
                  </label>
                  <select
                    value={form.action}
                    onChange={(e) => setForm({ ...form, action: e.target.value })}
                    className="w-full text-sm px-3 py-2 border border-border rounded-md focus:outline-none focus:border-foreground/40 bg-background transition-colors"
                  >
                    {actionOptions.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={createRule}
                  className="px-4 py-2 bg-foreground text-background text-sm font-medium rounded-md hover:opacity-90 transition-opacity"
                >
                  Создать
                </button>
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 border border-border text-sm rounded-md hover:bg-accent transition-colors"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rules list */}
        <div className="space-y-2">
          {rules.map((rule, i) => (
            <div
              key={rule.id}
              className={`group p-4 rounded-xl border border-border bg-card transition-all duration-200 animate-fade-in ${
                !rule.active ? "opacity-50" : ""
              }`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${rule.active ? "bg-green-400" : "bg-muted-foreground/30"}`}
                    />
                    <h3 className="text-sm font-medium text-foreground">{rule.name}</h3>
                  </div>

                  {/* Flow */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[hsl(var(--notion-blue)/0.1)] text-[11px] rounded-md text-muted-foreground">
                      <Icon name="GitBranch" size={10} />
                      {rule.trigger}
                    </span>
                    <Icon name="ArrowRight" size={12} className="text-muted-foreground/40 shrink-0" />
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[hsl(var(--notion-green)/0.1)] text-[11px] rounded-md text-muted-foreground">
                      <Icon name="Zap" size={10} />
                      {rule.action}
                    </span>
                  </div>

                  {rule.lastRun && (
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <Icon name="Clock" size={10} />
                      Последний запуск: {rule.lastRun} · {rule.runs} раз
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 ml-3 shrink-0">
                  <button
                    onClick={() => toggleRule(rule.id)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
                      rule.active ? "bg-foreground" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        rule.active ? "translate-x-4" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="opacity-0 group-hover:opacity-100 notion-hover p-1 text-muted-foreground hover:text-destructive transition-all"
                  >
                    <Icon name="Trash2" size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {rules.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mx-auto mb-3">
              <Icon name="Zap" size={22} className="text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Нет правил. Создайте первое!</p>
          </div>
        )}
      </div>
    </div>
  );
}
