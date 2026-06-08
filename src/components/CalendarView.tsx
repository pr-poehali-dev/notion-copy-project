import { useState } from "react";
import Icon from "@/components/ui/icon";
import { useWorkspace } from "@/hooks/useWorkspace";

const MONTHS = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
const WEEKDAYS = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
const EVENT_COLORS = [
  "hsl(213 94% 68%)","hsl(142 69% 58%)","hsl(25 95% 65%)",
  "hsl(263 70% 68%)","hsl(0 72% 65%)",
];

function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDay(y: number, m: number) { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; }

export default function CalendarView() {
  const { events, addEvent, deleteEvent } = useWorkspace();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("09:00");
  const [newColor, setNewColor] = useState(EVENT_COLORS[0]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDay(year, month);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const dateStr = (day: number) => `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const eventsForDay = (day: number) => events.filter((e) => e.date === dateStr(day));
  const selectedEvents = selectedDay ? eventsForDay(selectedDay) : [];

  const isToday = (day: number) => day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const handleAdd = () => {
    if (!newTitle.trim() || !selectedDay) return;
    addEvent({ title: newTitle.trim(), date: dateStr(selectedDay), time: newTime, color: newColor });
    setNewTitle("");
    setNewTime("09:00");
    setShowForm(false);
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Calendar grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-foreground">{MONTHS[month]} {year}</h1>
          <div className="flex items-center gap-1">
            <button onClick={prevMonth} className="notion-hover p-1.5 text-muted-foreground hover:text-foreground">
              <Icon name="ChevronLeft" size={16} />
            </button>
            <button onClick={() => { setMonth(today.getMonth()); setYear(today.getFullYear()); setSelectedDay(today.getDate()); }}
              className="px-2.5 py-1 text-xs font-medium border border-border rounded-md hover:bg-accent transition-colors text-foreground">
              Сегодня
            </button>
            <button onClick={nextMonth} className="notion-hover p-1.5 text-muted-foreground hover:text-foreground">
              <Icon name="ChevronRight" size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px bg-border rounded-xl overflow-hidden border border-border">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`e${i}`} className="bg-[hsl(var(--sidebar-background))] min-h-24 p-2" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayEvents = eventsForDay(day);
            const selected = selectedDay === day;
            return (
              <div key={day} onClick={() => setSelectedDay(day)}
                className={`bg-card min-h-24 p-2 cursor-pointer transition-colors duration-150 ${selected ? "ring-1 ring-inset ring-foreground/20 bg-accent/30" : "hover:bg-accent/20"}`}>
                <span className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1 ${isToday(day) ? "bg-foreground text-background text-xs" : "text-foreground"}`}>
                  {day}
                </span>
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 2).map((ev) => (
                    <div key={ev.id} className="text-[11px] font-medium px-1.5 py-0.5 rounded truncate"
                      style={{ background: ev.color + "22", color: ev.color }}>
                      {ev.time && <span className="opacity-70 mr-1">{ev.time}</span>}
                      {ev.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && <div className="text-[10px] text-muted-foreground px-1">+{dayEvents.length - 2} ещё</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day panel */}
      <div className="w-64 shrink-0 border-l border-border overflow-y-auto flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">
            {selectedDay ? `${selectedDay} ${MONTHS[month]}` : "Выберите день"}
          </h2>
          {selectedDay && isToday(selectedDay) && <span className="text-xs text-muted-foreground">Сегодня</span>}
        </div>

        <div className="p-3 flex-1">
          {selectedEvents.length === 0 && !showForm && (
            <p className="text-xs text-muted-foreground py-2">Нет событий</p>
          )}
          <div className="space-y-2 mb-3">
            {selectedEvents.map((ev) => (
              <div key={ev.id} className="group p-2.5 rounded-lg border border-border relative" style={{ borderLeftColor: ev.color, borderLeftWidth: 3 }}>
                <p className="text-sm font-medium text-foreground pr-5">{ev.title}</p>
                {ev.time && <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><Icon name="Clock" size={11} />{ev.time}</p>}
                <button onClick={() => setConfirmDelete(ev.id)}
                  className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
                  <Icon name="X" size={13} />
                </button>
              </div>
            ))}
          </div>

          {showForm ? (
            <div className="space-y-2 animate-fade-in">
              <input autoFocus value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") setShowForm(false); }}
                placeholder="Название события..."
                className="w-full text-sm px-2.5 py-1.5 border border-border rounded-md focus:outline-none focus:border-foreground/40 bg-transparent text-foreground" />
              <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)}
                className="w-full text-sm px-2.5 py-1.5 border border-border rounded-md focus:outline-none bg-transparent text-foreground" />
              <div className="flex gap-1">
                {EVENT_COLORS.map((c) => (
                  <button key={c} onClick={() => setNewColor(c)}
                    className={`w-5 h-5 rounded-full border-2 transition-transform ${newColor === c ? "scale-125 border-foreground/30" : "border-transparent"}`}
                    style={{ background: c }} />
                ))}
              </div>
              <div className="flex gap-1.5">
                <button onClick={handleAdd} className="flex-1 py-1.5 bg-foreground text-background text-xs font-medium rounded-md hover:opacity-90">Добавить</button>
                <button onClick={() => setShowForm(false)} className="flex-1 py-1.5 border border-border text-xs rounded-md hover:bg-accent text-foreground">Отмена</button>
              </div>
            </div>
          ) : (
            selectedDay && (
              <button onClick={() => setShowForm(true)}
                className="w-full flex items-center gap-1.5 px-2.5 py-1.5 border border-dashed border-border rounded-lg text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">
                <Icon name="Plus" size={13} /> Добавить событие
              </button>
            )
          )}
        </div>
      </div>

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50" onClick={() => setConfirmDelete(null)}>
          <div className="bg-card border border-border rounded-xl p-5 shadow-lg w-64" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-foreground mb-1">Удалить событие?</h3>
            <div className="flex gap-2 mt-4">
              <button onClick={() => { deleteEvent(confirmDelete); setConfirmDelete(null); }}
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
