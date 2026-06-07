import { useState } from "react";
import Icon from "@/components/ui/icon";

interface Event {
  id: string;
  title: string;
  date: string;
  color: string;
  time?: string;
}

const MONTHS = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];
const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const defaultEvents: Event[] = [
  { id: "1", title: "Встреча с командой", date: "2026-06-10", color: "hsl(var(--notion-blue))", time: "10:00" },
  { id: "2", title: "Дедлайн проекта", date: "2026-06-15", color: "hsl(var(--notion-red))", time: "18:00" },
  { id: "3", title: "Демо клиенту", date: "2026-06-08", color: "hsl(var(--notion-green))", time: "14:30" },
  { id: "4", title: "Ретроспектива", date: "2026-06-20", color: "hsl(var(--notion-orange))", time: "16:00" },
  { id: "5", title: "Планинг Q3", date: "2026-06-25", color: "hsl(var(--notion-purple))", time: "11:00" },
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

export default function CalendarView() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [events, setEvents] = useState<Event[]>(defaultEvents);
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const dateString = (day: number) =>
    `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const eventsForDay = (day: number) =>
    events.filter((e) => e.date === dateString(day));

  const selectedDateStr = selectedDay ? dateString(selectedDay) : null;
  const selectedEvents = selectedDay ? eventsForDay(selectedDay) : [];

  const addEvent = () => {
    if (!newEventTitle.trim() || !selectedDay) return;
    const colors = [
      "hsl(var(--notion-blue))",
      "hsl(var(--notion-green))",
      "hsl(var(--notion-orange))",
      "hsl(var(--notion-purple))",
    ];
    const newEvent: Event = {
      id: Date.now().toString(),
      title: newEventTitle,
      date: dateString(selectedDay),
      color: colors[Math.floor(Math.random() * colors.length)],
      time: "09:00",
    };
    setEvents([...events, newEvent]);
    setNewEventTitle("");
    setShowAddForm(false);
  };

  const isToday = (day: number) =>
    day === today.getDate() &&
    currentMonth === today.getMonth() &&
    currentYear === today.getFullYear();

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Calendar */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-foreground">
              {MONTHS[currentMonth]} {currentYear}
            </h1>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={prevMonth} className="notion-hover p-1.5 text-muted-foreground hover:text-foreground">
              <Icon name="ChevronLeft" size={16} />
            </button>
            <button
              onClick={() => { setCurrentMonth(today.getMonth()); setCurrentYear(today.getFullYear()); setSelectedDay(today.getDate()); }}
              className="px-2.5 py-1 text-xs font-medium border border-border rounded-md hover:bg-accent transition-colors"
            >
              Сегодня
            </button>
            <button onClick={nextMonth} className="notion-hover p-1.5 text-muted-foreground hover:text-foreground">
              <Icon name="ChevronRight" size={16} />
            </button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-px bg-border rounded-xl overflow-hidden border border-border">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-[hsl(var(--sidebar-background))] min-h-24 p-2" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayEvents = eventsForDay(day);
            const selected = selectedDay === day;
            const todayDay = isToday(day);
            return (
              <div
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`bg-card min-h-24 p-2 cursor-pointer transition-colors duration-150 ${
                  selected ? "ring-1 ring-inset ring-foreground/20 bg-accent/30" : "hover:bg-accent/20"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                      todayDay
                        ? "bg-foreground text-background text-xs"
                        : "text-foreground"
                    }`}
                  >
                    {day}
                  </span>
                </div>
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 2).map((ev) => (
                    <div
                      key={ev.id}
                      className="text-[11px] font-medium px-1.5 py-0.5 rounded truncate"
                      style={{ background: ev.color + "22", color: ev.color }}
                    >
                      {ev.time && <span className="opacity-70 mr-1">{ev.time}</span>}
                      {ev.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-[10px] text-muted-foreground px-1">
                      +{dayEvents.length - 2} ещё
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day panel */}
      <div className="w-64 shrink-0 border-l border-border overflow-y-auto">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">
            {selectedDay
              ? `${selectedDay} ${MONTHS[currentMonth]}`
              : "Выберите день"}
          </h2>
          {isToday(selectedDay || 0) && (
            <span className="text-xs text-muted-foreground">Сегодня</span>
          )}
        </div>

        <div className="p-3">
          {selectedEvents.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">Нет событий</p>
          ) : (
            <div className="space-y-2">
              {selectedEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="p-2.5 rounded-lg border border-border"
                  style={{ borderLeftColor: ev.color, borderLeftWidth: 3 }}
                >
                  <p className="text-sm font-medium text-foreground">{ev.title}</p>
                  {ev.time && (
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Icon name="Clock" size={11} />
                      {ev.time}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {selectedDay && !showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-3 w-full flex items-center gap-1.5 px-2.5 py-1.5 border border-dashed border-border rounded-lg text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              <Icon name="Plus" size={13} />
              Добавить событие
            </button>
          )}

          {showAddForm && (
            <div className="mt-3 space-y-2 animate-fade-in">
              <input
                autoFocus
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addEvent()}
                placeholder="Название события..."
                className="w-full text-sm px-2.5 py-1.5 border border-border rounded-md focus:outline-none focus:border-foreground/40 transition-colors bg-transparent"
              />
              <div className="flex gap-1.5">
                <button
                  onClick={addEvent}
                  className="flex-1 py-1.5 bg-foreground text-background text-xs font-medium rounded-md hover:opacity-90 transition-opacity"
                >
                  Добавить
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-1.5 border border-border text-xs rounded-md hover:bg-accent transition-colors"
                >
                  Отмена
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
