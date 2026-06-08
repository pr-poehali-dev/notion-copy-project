import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Note, Tag, getTagStyle, useWorkspace } from "@/hooks/useWorkspace";

const TAG_COLOR_OPTIONS = ["0", "1", "2", "3", "4"];
const TAG_COLOR_LABELS = ["Синий", "Зелёный", "Оранжевый", "Фиолетовый", "Красный"];
const ICONS = ["📝","💡","📌","📎","🗂️","📁","📋","📊","🎯","✅","🔖","💬","🌟","🚀","👥","📅","🔔","⚙️","🧩","🔍"];

function renderMarkdown(text: string) {
  return text.split("\n").map((line, i) => {
    if (line.startsWith("# ")) return <h1 key={i} className="text-2xl font-semibold mb-3 mt-0 text-foreground">{line.slice(2)}</h1>;
    if (line.startsWith("## ")) return <h2 key={i} className="text-lg font-semibold mb-2 mt-4 text-foreground">{line.slice(3)}</h2>;
    if (line.startsWith("- ")) return <li key={i} className="ml-4 text-sm mb-1 list-disc list-inside text-foreground">{line.slice(2)}</li>;
    if (/^\d+\./.test(line)) return <li key={i} className="ml-4 text-sm mb-1 list-decimal list-inside text-foreground">{line.replace(/^\d+\.\s/, "")}</li>;
    if (line === "") return <div key={i} className="h-2" />;
    return <p key={i} className="text-sm mb-1 text-foreground">{line}</p>;
  });
}

interface Props {
  sectionId: string;
}

export default function NotesView({ sectionId }: Props) {
  const { notes, addNote, updateNote, deleteNote } = useWorkspace();
  const sectionNotes = notes.filter((n) => n.sectionId === sectionId);

  const [activeId, setActiveId] = useState<string | null>(sectionNotes[0]?.id ?? null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTagLabel, setNewTagLabel] = useState("");
  const [newTagColor, setNewTagColor] = useState("0");
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const activeNote = sectionNotes.find((n) => n.id === activeId) ?? null;

  const handleNew = () => {
    const n = addNote(sectionId, "Новая заметка", "📝");
    setActiveId(n.id);
    setEditTitle(n.title);
    setEditContent(n.content);
    setEditIcon(n.icon);
    setIsEditing(true);
  };

  const startEdit = (note: Note) => {
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditIcon(note.icon);
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (!activeNote) return;
    updateNote(activeNote.id, { title: editTitle, content: editContent, icon: editIcon });
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    const idx = sectionNotes.findIndex((n) => n.id === id);
    deleteNote(id);
    const remaining = sectionNotes.filter((n) => n.id !== id);
    setActiveId(remaining[Math.max(0, idx - 1)]?.id ?? null);
    setIsEditing(false);
    setConfirmDelete(null);
  };

  const addTag = () => {
    if (!activeNote || !newTagLabel.trim()) return;
    const tag: Tag = { id: Date.now().toString(), label: newTagLabel.trim(), color: newTagColor };
    updateNote(activeNote.id, { tags: [...activeNote.tags, tag] });
    setNewTagLabel("");
    setShowTagInput(false);
  };

  const removeTag = (tagId: string) => {
    if (!activeNote) return;
    updateNote(activeNote.id, { tags: activeNote.tags.filter((t) => t.id !== tagId) });
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* List */}
      <div className="w-60 shrink-0 border-r border-border overflow-y-auto flex flex-col">
        <div className="p-3 border-b border-border flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {sectionNotes.length} заметок
          </span>
          <button onClick={handleNew} className="notion-hover p-1 text-muted-foreground hover:text-foreground">
            <Icon name="Plus" size={14} />
          </button>
        </div>
        <div className="p-2 space-y-0.5 flex-1">
          {sectionNotes.length === 0 && (
            <p className="text-xs text-muted-foreground px-2 py-4 text-center">Нет заметок. Нажмите +</p>
          )}
          {sectionNotes.map((note) => (
            <div key={note.id} className="group relative">
              <button
                onClick={() => { setActiveId(note.id); setIsEditing(false); }}
                className={`w-full text-left px-2 py-2 rounded-md transition-colors duration-150 ${
                  activeId === note.id ? "bg-accent" : "hover:bg-accent"
                }`}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm">{note.icon}</span>
                  <span className="text-sm font-medium text-foreground truncate">{note.title}</span>
                </div>
                <p className="text-xs text-muted-foreground pl-5 truncate">{note.updatedAt}</p>
              </button>
              <button
                onClick={() => setConfirmDelete(note.id)}
                className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 notion-hover p-1 text-muted-foreground hover:text-destructive"
              >
                <Icon name="Trash2" size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {!activeNote ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
              <Icon name="FileText" size={22} className="text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Выберите заметку или создайте новую</p>
            <button onClick={handleNew} className="px-4 py-2 bg-foreground text-background text-sm font-medium rounded-lg hover:opacity-90 transition-opacity">
              Создать заметку
            </button>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto px-10 py-10">
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button
                  onClick={() => { if (isEditing) setShowIconPicker(!showIconPicker); }}
                  className="text-3xl hover:scale-110 transition-transform shrink-0"
                  title={isEditing ? "Сменить иконку" : ""}
                >
                  {isEditing ? editIcon : activeNote.icon}
                </button>
                {isEditing ? (
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="text-2xl font-semibold bg-transparent border-b border-foreground/20 focus:outline-none focus:border-foreground/50 w-full text-foreground"
                    placeholder="Название..."
                  />
                ) : (
                  <h1 className="text-2xl font-semibold text-foreground truncate">{activeNote.title}</h1>
                )}
              </div>
              <div className="flex items-center gap-1 ml-3 shrink-0">
                {isEditing ? (
                  <button onClick={saveEdit} className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground text-background text-xs font-medium rounded-md hover:opacity-90">
                    <Icon name="Check" size={13} /> Сохранить
                  </button>
                ) : (
                  <button onClick={() => startEdit(activeNote)} className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-xs font-medium rounded-md hover:bg-accent transition-colors text-foreground">
                    <Icon name="Pencil" size={13} /> Изменить
                  </button>
                )}
              </div>
            </div>

            {/* Icon picker */}
            {showIconPicker && isEditing && (
              <div className="mb-4 p-2 rounded-lg border border-border bg-card grid grid-cols-10 gap-1 animate-fade-in">
                {ICONS.map((ic) => (
                  <button key={ic} onClick={() => { setEditIcon(ic); setShowIconPicker(false); }}
                    className={`text-lg rounded p-1 hover:bg-accent transition-colors ${editIcon === ic ? "bg-accent" : ""}`}>
                    {ic}
                  </button>
                ))}
              </div>
            )}

            {/* Meta */}
            <p className="text-xs text-muted-foreground mb-4">Изменено {activeNote.updatedAt} · Создано {activeNote.createdAt}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-5 items-center">
              {activeNote.tags.map((tag) => {
                const style = getTagStyle(tag.color);
                return (
                  <span key={tag.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium"
                    style={{ background: style.bg, color: style.text }}>
                    #{tag.label}
                    <button onClick={() => removeTag(tag.id)} className="opacity-60 hover:opacity-100 ml-0.5">
                      <Icon name="X" size={10} />
                    </button>
                  </span>
                );
              })}
              {showTagInput ? (
                <div className="flex items-center gap-1 animate-fade-in">
                  <input
                    autoFocus value={newTagLabel} onChange={(e) => setNewTagLabel(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") addTag(); if (e.key === "Escape") setShowTagInput(false); }}
                    placeholder="Тег..." className="text-xs px-2 py-0.5 border border-border rounded-md w-24 focus:outline-none focus:border-foreground/40 bg-transparent text-foreground"
                  />
                  <select value={newTagColor} onChange={(e) => setNewTagColor(e.target.value)}
                    className="text-xs px-1 py-0.5 border border-border rounded-md bg-background focus:outline-none text-foreground">
                    {TAG_COLOR_OPTIONS.map((c, i) => <option key={c} value={c}>{TAG_COLOR_LABELS[i]}</option>)}
                  </select>
                  <button onClick={addTag} className="notion-hover p-0.5 text-muted-foreground hover:text-foreground"><Icon name="Check" size={12} /></button>
                  <button onClick={() => setShowTagInput(false)} className="notion-hover p-0.5 text-muted-foreground hover:text-foreground"><Icon name="X" size={12} /></button>
                </div>
              ) : (
                <button onClick={() => setShowTagInput(true)} className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs text-muted-foreground border border-dashed border-border hover:border-foreground/30 hover:text-foreground transition-colors">
                  <Icon name="Plus" size={10} /> Тег
                </button>
              )}
            </div>

            {/* Content */}
            {isEditing ? (
              <textarea
                value={editContent} onChange={(e) => setEditContent(e.target.value)}
                className="w-full min-h-96 text-sm text-foreground bg-transparent border border-border rounded-lg p-4 resize-none focus:outline-none focus:border-foreground/40 transition-colors font-mono leading-relaxed"
                placeholder="Начните писать... (поддерживается Markdown: # заголовок, - список)"
              />
            ) : (
              <div className="leading-relaxed">{renderMarkdown(activeNote.content)}</div>
            )}
          </div>
        )}
      </div>

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 animate-fade-in" onClick={() => setConfirmDelete(null)}>
          <div className="bg-card border border-border rounded-xl p-5 shadow-lg w-72" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-foreground mb-1">Удалить заметку?</h3>
            <p className="text-xs text-muted-foreground mb-4">Это действие нельзя отменить.</p>
            <div className="flex gap-2">
              <button onClick={() => handleDelete(confirmDelete)} className="flex-1 py-1.5 bg-destructive text-white text-xs font-medium rounded-md hover:opacity-90">Удалить</button>
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-1.5 border border-border text-xs rounded-md hover:bg-accent text-foreground">Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
