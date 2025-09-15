import { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';

export default function QuickAdd({ onAddTask, lastCategory = 'personal' }) {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  // Focus input on Ctrl/Cmd+K (avoid single-letter collisions)
  useEffect(() => {
    const handleKeyPress = (e) => {
      const isTypingTarget = ['INPUT', 'TEXTAREA'].includes(e.target?.tagName) || e.target?.isContentEditable;
      if (isTypingTarget) return;

      const isCmdOrCtrlK = (e.key.toLowerCase() === 'k') && (e.ctrlKey || e.metaKey);
      if (isCmdOrCtrlK && !isFocused) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isFocused]);

  const parseQuickAdd = (text) => {
    const hashtagMatch = text.match(/^(.+?)\s+#(\w+)$/);
    if (hashtagMatch) {
      return {
        title: hashtagMatch[1].trim(),
        category: hashtagMatch[2].toLowerCase()
      };
    }
    return {
      title: text.trim(),
      category: lastCategory
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    
    if (!trimmedInput) return;

    const { title, category } = parseQuickAdd(trimmedInput);
    
    onAddTask({
      title,
      category,
      description: ''
    });

    setInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Add a task... (e.g., Buy milk #personal)"
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <Plus className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>
      
      {isFocused && (
        <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-white border border-gray-200 rounded-lg shadow-lg text-xs text-gray-600">
          <div>Press <kbd className="px-1 py-0.5 bg-gray-100 rounded">Ctrl/Cmd + K</kbd> to focus • Use #category to set category</div>
        </div>
      )}
    </form>
  );
}
