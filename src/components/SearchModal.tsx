import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import { useWorkspace, getTagStyle } from "@/hooks/useWorkspace";

interface Props {
  onClose: () => void;
  onNavigate: (sectionId: string) => void;
}

export default function SearchModal({ onClose, onNavigate }: Props) {
  const { notes, databases, sections } = useWorkspace();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const q = query.toLowerCase().trim();

  const noteResults = q
    ? notes.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some((t) => t.label.toLowerCase().includes(q))
      )
    : notes.slice(0, 5);

  const dbResults = q
    ? databases.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.rows.some((r) =>
            Object.values(r).some((v) =>
              String(v).toLowerCase().includes(q)
            )
          )
      )
    : databases.slice(0, 3);

  type ResultItem =
    | { kind: "note"; id: string; icon: string; title: string; subtitle: string; sectionId: string; tags: { id: string; label: string; color: string }[] }
    | { kind: "db";   id: string; icon: string; title: string; subtitle: string; sectionId: string };

  const results: ResultItem[] = [
    ...noteResults.map((n) => {
      const sec = sections.find((s) => s.id === n.sectionId);
      const excerpt = n.content.replace(/^#+\s/gm, "").split("\n").find((l) => l.trim() && !l.startsWith("#")) ?? "";
      return {
        kind: "note" as const,
        id: n.id,
        icon: n.icon,
        title: n.title,
        subtitle: sec ? `${sec.icon} ${sec.title}` : "Заметки",
        sectionId: n.sectionId,
        tags: n.tags,
        excerpt: excerpt.slice(0, 80),
      };
    }),
    ...dbResults.map((d) => {
      const sec = sections.find((s) => s.id === d.sectionId);
      return {
        kind: "db" as const,
        id: d.id,
        icon: d.icon,
        title: d.title,
        subtitle: sec ? `${sec.icon} ${sec.title}` : "Базы данных",
        sectionId: d.sectionId,
        rows: d.rows.length,
      };
    }),
  ];

  const handleSelect = (item: ResultItem) => {
    onNavigate(item.sectionId);
    onClose();
  };

  // keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setSelected((s) => Math.min(s + 1, results.length - 1)); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)); }
      if (e.key === "Enter" && results[selected]) handleSelect(results[selected]);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [results, selected]);

  useEffect(() => { setSelected(0); }, [query]);

  return (
    <div className="fixed inset-0 bg-black/25 flex items-start justify-center z-50 pt-[15vh] animate-fade-in"
      onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}>

        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Icon name="Search" size={16} className="text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по заметкам, базам данных..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground transition-colors">
              <Icon name="X" size={14} />
            </button>
          )}
          <kbd className="text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground font-mono-tag">Esc</kbd>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {results.length === 0 && (
            <div className="py-12 text-center">
              <Icon name="SearchX" size={24} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Ничего не найдено</p>
            </div>
          )}

          {/* Notes section */}
          {noteResults.length > 0 && (
            <div>
              <div className="px-4 pt-3 pb-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Заметки</span>
              </div>
              {noteResults.map((note, i) => {
                const idx = i;
                const isSelected = selected === idx;
                const excerpt = (note.content.replace(/^#+\s/gm, "").split("\n").find((l) => l.trim()) ?? "").slice(0, 80);
                return (
                  <button key={note.id} onClick={() => handleSelect(results[idx])}
                    onMouseEnter={() => setSelected(idx)}
                    className={`w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors ${isSelected ? "bg-accent" : "hover:bg-accent/50"}`}>
                    <span className="text-lg mt-0.5 shrink-0">{note.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{highlight(note.title, q)}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-muted-foreground truncate flex-1">{excerpt || results[idx].subtitle}</p>
                      </div>
                      {note.tags.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {note.tags.map((tag) => {
                            const style = getTagStyle(tag.color);
                            return (
                              <span key={tag.id} className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                                style={{ background: style.bg, color: style.text }}>#{tag.label}</span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0 mt-0.5">{results[idx].subtitle}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Databases section */}
          {dbResults.length > 0 && (
            <div>
              <div className="px-4 pt-3 pb-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Базы данных</span>
              </div>
              {dbResults.map((db, i) => {
                const idx = noteResults.length + i;
                const isSelected = selected === idx;
                return (
                  <button key={db.id} onClick={() => handleSelect(results[idx])}
                    onMouseEnter={() => setSelected(idx)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${isSelected ? "bg-accent" : "hover:bg-accent/50"}`}>
                    <span className="text-lg shrink-0">{db.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{highlight(db.title, q)}</p>
                      <p className="text-xs text-muted-foreground">{db.rows.length} записей</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{results[idx].subtitle}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer hint */}
        {results.length > 0 && (
          <div className="px-4 py-2 border-t border-border flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><kbd className="px-1 border border-border rounded font-mono-tag">↑↓</kbd> навигация</span>
            <span className="flex items-center gap-1"><kbd className="px-1 border border-border rounded font-mono-tag">Enter</kbd> открыть</span>
            <span className="flex items-center gap-1"><kbd className="px-1 border border-border rounded font-mono-tag">Esc</kbd> закрыть</span>
          </div>
        )}
      </div>
    </div>
  );
}

function highlight(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 dark:bg-yellow-800/50 text-foreground rounded-sm px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}
