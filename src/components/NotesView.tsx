import { useState } from "react";
import Icon from "@/components/ui/icon";

interface Note {
  id: string;
  title: string;
  content: string;
  icon: string;
  updatedAt: string;
  tags: string[];
}

const defaultNotes: Note[] = [
  {
    id: "1",
    title: "Идеи для продукта",
    content: "# Идеи для продукта\n\nЗдесь можно хранить идеи для развития продукта.\n\n- Добавить онбординг\n- Улучшить аналитику\n- Интеграция с API",
    icon: "💡",
    updatedAt: "2 часа назад",
    tags: ["продукт", "идеи"],
  },
  {
    id: "2",
    title: "Встреча с командой",
    content: "# Встреча с командой\n\nПовестка дня:\n\n1. Обсуждение спринта\n2. Демо фичей\n3. Ретроспектива",
    icon: "👥",
    updatedAt: "вчера",
    tags: ["команда"],
  },
  {
    id: "3",
    title: "Личные цели",
    content: "# Личные цели на квартал\n\nПриоритеты:\n\n- Запустить новый проект\n- Прочитать 5 книг\n- Улучшить процессы",
    icon: "🎯",
    updatedAt: "3 дня назад",
    tags: ["личное"],
  },
];

function renderMarkdown(text: string) {
  return text
    .split("\n")
    .map((line, i) => {
      if (line.startsWith("# ")) return <h1 key={i} className="text-2xl font-semibold mb-3 mt-0">{line.slice(2)}</h1>;
      if (line.startsWith("## ")) return <h2 key={i} className="text-xl font-semibold mb-2 mt-4">{line.slice(3)}</h2>;
      if (line.startsWith("- ")) return <li key={i} className="ml-4 text-sm mb-1 list-disc list-inside">{line.slice(2)}</li>;
      if (line.match(/^\d+\./)) return <li key={i} className="ml-4 text-sm mb-1 list-decimal list-inside">{line.replace(/^\d+\.\s/, "")}</li>;
      if (line === "") return <div key={i} className="h-2" />;
      return <p key={i} className="text-sm mb-1">{line}</p>;
    });
}

export default function NotesView() {
  const [notes, setNotes] = useState<Note[]>(defaultNotes);
  const [activeNote, setActiveNote] = useState<Note>(defaultNotes[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");

  const startEdit = () => {
    setEditContent(activeNote.content);
    setIsEditing(true);
  };

  const saveEdit = () => {
    const updated = notes.map((n) =>
      n.id === activeNote.id
        ? { ...n, content: editContent, updatedAt: "только что" }
        : n
    );
    setNotes(updated);
    const found = updated.find((n) => n.id === activeNote.id);
    if (found) setActiveNote(found);
    setIsEditing(false);
  };

  const addNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "Новая заметка",
      content: "# Новая заметка\n\nНачните писать...",
      icon: "📝",
      updatedAt: "только что",
      tags: [],
    };
    setNotes([newNote, ...notes]);
    setActiveNote(newNote);
    setEditContent(newNote.content);
    setIsEditing(true);
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Notes list */}
      <div className="w-60 shrink-0 border-r border-border overflow-y-auto">
        <div className="p-3 border-b border-border flex items-center justify-between">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Заметки</h2>
          <button onClick={addNote} className="notion-hover p-1 text-muted-foreground hover:text-foreground">
            <Icon name="Plus" size={14} />
          </button>
        </div>
        <div className="p-2 space-y-0.5">
          {notes.map((note) => (
            <button
              key={note.id}
              onClick={() => { setActiveNote(note); setIsEditing(false); }}
              className={`w-full text-left px-2 py-2 rounded-md transition-colors duration-150 ${
                activeNote.id === note.id ? "bg-accent" : "hover:bg-accent"
              }`}
            >
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm">{note.icon}</span>
                <span className="text-sm font-medium text-foreground truncate">{note.title}</span>
              </div>
              <p className="text-xs text-muted-foreground pl-5">{note.updatedAt}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Note content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-10 py-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{activeNote.icon}</span>
              <div>
                <h1 className="text-2xl font-semibold text-foreground">{activeNote.title}</h1>
                <p className="text-xs text-muted-foreground mt-0.5">Изменено {activeNote.updatedAt}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {isEditing ? (
                <button
                  onClick={saveEdit}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground text-background text-xs font-medium rounded-md hover:opacity-90 transition-opacity"
                >
                  <Icon name="Check" size={13} />
                  Сохранить
                </button>
              ) : (
                <button
                  onClick={startEdit}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-xs font-medium rounded-md hover:bg-accent transition-colors"
                >
                  <Icon name="Pencil" size={13} />
                  Изменить
                </button>
              )}
            </div>
          </div>

          {/* Tags */}
          {activeNote.tags.length > 0 && (
            <div className="flex gap-1.5 mb-5">
              {activeNote.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 bg-accent rounded-md text-xs text-muted-foreground font-mono-tag">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Content */}
          {isEditing ? (
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full h-96 text-sm text-foreground bg-transparent border border-border rounded-lg p-4 resize-none focus:outline-none focus:border-foreground/40 transition-colors font-mono leading-relaxed"
              autoFocus
            />
          ) : (
            <div className="text-foreground leading-relaxed">
              {renderMarkdown(activeNote.content)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
