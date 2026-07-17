import { useEffect, useState } from 'react';
import { suggestionService } from '../../services';
import type { Suggestion } from '../../types';

export function Suggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Suggestion | null>(null);

  useEffect(() => {
    suggestionService.getAll().then(setSuggestions).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this suggestion?')) return;
    await suggestionService.deleteSuggestion(id);
    setSuggestions(prev => prev.filter(s => s.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-rounded animate-spin text-[#2a9d7f] text-[32px]">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-['Fraunces',serif] font-[600] text-[#171b1a]">Suggestions</h1>
        <p className="text-[13px] text-[#67706c] mt-1">Student feedback and suggestions</p>
      </div>

      <div className="space-y-2">
        {suggestions.map(sg => (
          <div key={sg.id} className="phys-card p-4 phys-card-hover">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[13px] font-[500] text-[#171b1a]">{sg.name}</span>
                  <span className="text-[11px] text-[#67706c]">{sg.matricNumber}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#f8f6ef] text-[#67706c]">{sg.category}</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-[500] ${
                    sg.status === 'pending' ? 'bg-[#fef7e6] text-[#d8c74d]' :
                    sg.status === 'reviewed' ? 'bg-[#e6f7f0] text-[#2a9d7f]' :
                    'bg-[#e8eaf6] text-[#5c6bc0]'
                  }`}>{sg.status}</span>
                </div>
                <p className="text-[13px] text-[#171b1a] line-clamp-2">{sg.message}</p>
                <p className="text-[11px] text-[#67706c] mt-1">{new Date(sg.createdAtMs).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => setSelected(sg)}
                  className="p-2.5 md:p-2 text-[#67706c] hover:text-[#2a9d7f] hover:bg-[#f8f6ef] rounded-full transition-colors"
                  title="View details"
                >
                  <span className="material-symbols-rounded text-[20px] md:text-[18px]">visibility</span>
                </button>
                <button onClick={() => handleDelete(sg.id)}
                  className="p-2.5 md:p-2 text-[#67706c] hover:text-[#d34a4a] hover:bg-[#fde8e8] rounded-full transition-colors"
                  title="Delete"
                >
                  <span className="material-symbols-rounded text-[20px] md:text-[18px]">delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
        {suggestions.length === 0 && (
          <p className="text-center py-12 text-[#67706c] text-[13px]">No suggestions yet.</p>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/20" />
          <div className="phys-card p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[11px] text-[#67706c] uppercase tracking-[0.5px]">Suggestion</p>
                <h3 className="text-[16px] font-[500] text-[#171b1a]">{selected.category}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="p-2.5 md:p-2 hover:bg-[#f8f6ef] rounded-full">
                <span className="material-symbols-rounded text-[20px] md:text-[24px]">close</span>
              </button>
            </div>
            <p className="text-[13px] text-[#67706c] mb-1">
              <strong className="text-[#171b1a]">{selected.name}</strong> · {selected.matricNumber}
            </p>
            <p className="text-[11px] text-[#67706c] mb-4">{new Date(selected.createdAtMs).toLocaleString()}</p>
            <hr className="border-[#e3ddd0] mb-4" />
            <p className="text-[13px] text-[#171b1a] whitespace-pre-wrap">{selected.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
