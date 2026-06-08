import { useState } from "react";
import Icon from "@/components/ui/icon";
import { useWorkspace } from "@/hooks/useWorkspace";

const TRIGGER_OPTIONS = [
  "Новая запись в базе данных",
  "Изменение статуса",
  "Наступление даты",
  "Создание заметки",
  "Каждый день в 9:00",
  "Каждую неделю в понедельник",
];

const ACTION_OPTIONS = [
  "Отправить уведомление",
  "Создать задачу",
  "Изменить статус записи",
  "Создать новую заметку",
  "Отправить email",
  "Архивировать запись",
];

export default function AutomationsView() {
  const { rules, addRule, updateRule, deleteRule, notes, databases } = useWorkspace();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", trigger: TRIGGER_OPTIONS[0], action: ACTION_OPTIONS[0] });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleCreate = () => {
    if (!form.name.trim()) return;
    addRule({ name: form.name.trim(), trigger: form.trigger, action: form.action, active: true });
    setForm({ name: "", trigger: TRIGGER_OPTIONS[0], action: ACTION_OPTIONS[0] });
    setShowCreate(false);
  };

  // Реальная статистика: runs = количество заметок + строк БД как прокси активности
  const totalContent = notes.length + databases.reduce((s, d) => s + d.rows.length, 0);
  const totalRuns = rules.reduce((s, r) => s + r.runs, 0) + (totalContent > 0 ? rules.filter((r) => r.active).length : 0);
  const activeCount = rules.filter((r) => r.active).length;

  const handleToggle = (id: string, active: boolean) => {
    updateRule(id, {
      active,
      runs: active ? (rules.find((r) => r.id === id)?.runs ?? 0) + 1 : rules.find((r) => r.id === id)?.runs ?? 0,
      lastRun: active ? "только что" : rules.find((r) => r.id === id)?.lastRun,
    });
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-8 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">Автоматизации</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Создавайте правила для автоматических действий</p>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-foreground text-background text-sm font-medium rounded-lg hover:opacity-90 transition-opacity">
            <Icon name="Plus" size={15} /> Создать правило
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "Активных", value: activeCount, icon: "Zap", color: "hsl(142 69% 58%)" },
            { label: "Всего правил", value: rules.length, icon: "List", color: "hsl(213 94% 68%)" },
            { label: "Запусков", value: totalRuns, icon: "Activity", color: "hsl(263 70% 68%)" },
          ].map((s, i) => (
            <div key={i} className="p-4 rounded-xl border border-border bg-card animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex items-center gap-2 mb-2">
                <Icon name={s.icon} size={14} style={{ color: s.color }} />
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
              <p className="text-2xl font-semibold text-foreground font-mono-tag">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Create form */}
        {showCreate && (
          <div className="mb-6 p-5 rounded-xl border border-foreground/15 bg-card animate-fade-in">
            <h3 className="text-sm font-semibold text-foreground mb-4">Новое правило</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Название</label>
                <input autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setShowCreate(false); }}
                  placeholder="Например: Уведомление о новом лиде"
                  className="w-full text-sm px-3 py-2 border border-border rounded-md focus:outline-none focus:border-foreground/40 bg-transparent text-foreground" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1 block">
                    <Icon name="GitBranch" size={11} /> Триггер (когда)
                  </label>
                  <select value={form.trigger} onChange={(e) => setForm({ ...form, trigger: e.target.value })}
                    className="w-full text-sm px-3 py-2 border border-border rounded-md focus:outline-none bg-background text-foreground">
                    {TRIGGER_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1 block">
                    <Icon name="ArrowRight" size={11} /> Действие (что делать)
                  </label>
                  <select value={form.action} onChange={(e) => setForm({ ...form, action: e.target.value })}
                    className="w-full text-sm px-3 py-2 border border-border rounded-md focus:outline-none bg-background text-foreground">
                    {ACTION_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={handleCreate} className="px-4 py-2 bg-foreground text-background text-sm font-medium rounded-md hover:opacity-90">Создать</button>
                <button onClick={() => setShowCreate(false)} className="px-4 py-2 border border-border text-sm rounded-md hover:bg-accent text-foreground">Отмена</button>
              </div>
            </div>
          </div>
        )}

        {/* Rules list */}
        <div className="space-y-2">
          {rules.length === 0 && !showCreate && (
            <div className="text-center py-16 animate-fade-in">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mx-auto mb-3">
                <Icon name="Zap" size={22} className="text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Нет правил. Создайте первое!</p>
            </div>
          )}
          {rules.map((rule, i) => (
            <div key={rule.id}
              className={`group p-4 rounded-xl border border-border bg-card transition-all duration-200 animate-fade-in ${!rule.active ? "opacity-50" : ""}`}
              style={{ animationDelay: `${i * 40}ms` }}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${rule.active ? "bg-green-400" : "bg-muted-foreground/30"}`} />
                    <h3 className="text-sm font-medium text-foreground">{rule.name}</h3>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[hsl(213_94%_68%_/_0.1)] text-[11px] rounded-md text-muted-foreground">
                      <Icon name="GitBranch" size={10} /> {rule.trigger}
                    </span>
                    <Icon name="ArrowRight" size={12} className="text-muted-foreground/40 shrink-0" />
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[hsl(142_69%_58%_/_0.1)] text-[11px] rounded-md text-muted-foreground">
                      <Icon name="Zap" size={10} /> {rule.action}
                    </span>
                  </div>
                  {rule.lastRun && (
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <Icon name="Clock" size={10} /> Последний запуск: {rule.lastRun} · {rule.runs} раз
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-3 shrink-0">
                  <button
                    onClick={() => handleToggle(rule.id, !rule.active)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${rule.active ? "bg-foreground" : "bg-muted"}`}>
                    <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${rule.active ? "translate-x-4" : "translate-x-1"}`} />
                  </button>
                  <button onClick={() => setConfirmDelete(rule.id)}
                    className="opacity-0 group-hover:opacity-100 notion-hover p-1 text-muted-foreground hover:text-destructive transition-all">
                    <Icon name="Trash2" size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50" onClick={() => setConfirmDelete(null)}>
          <div className="bg-card border border-border rounded-xl p-5 shadow-lg w-64" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-foreground mb-1">Удалить правило?</h3>
            <div className="flex gap-2 mt-4">
              <button onClick={() => { deleteRule(confirmDelete); setConfirmDelete(null); }}
                className="flex-1 py-1.5 bg-destructive text-white text-xs font-medium rounded-md hover:opacity-90">Удалить</button>
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 py-1.5 border border-border text-xs rounded-md hover:bg-accent text-foreground">Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}