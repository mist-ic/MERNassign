import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function CategoryFilter({ categories, selectedCategory, onCategoryChange, onShowDoneChange, showDone }) {
  const [lastUsedCategory, setLastUsedCategory] = useState('personal');

  useEffect(() => {
    const saved = localStorage.getItem('lastUsedCategory');
    if (saved) {
      setLastUsedCategory(saved);
    }
  }, []);

  const handleCategorySelect = (category) => {
    setLastUsedCategory(category);
    localStorage.setItem('lastUsedCategory', category);
    onCategoryChange(category);
  };

  const clearFilter = () => {
    onCategoryChange(null);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Filter by category:</span>
        
        <button
          onClick={clearFilter}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            !selectedCategory
              ? 'bg-primary-100 text-primary-800 border border-primary-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>

        {categories.map((cat) => (
          <button
            key={cat.category}
            onClick={() => handleCategorySelect(cat.category)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === cat.category
                ? 'bg-primary-100 text-primary-800 border border-primary-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.category} ({cat.count})
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={showDone}
            onChange={(e) => onShowDoneChange(e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          Show completed
        </label>
      </div>
    </div>
  );
}
