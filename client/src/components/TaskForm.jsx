import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';

export default function TaskForm({ initialData, onSubmit, onCancel, categories = [] }) {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: initialData || {
      title: '',
      description: '',
      category: ''
    }
  });

  const [isNewCategory, setIsNewCategory] = useState(false);
  const categoryValue = watch('category');

  useEffect(() => {
    if (initialData) {
      setValue('title', initialData.title);
      setValue('description', initialData.description || '');
      setValue('category', initialData.category);
    }
  }, [initialData, setValue]);

  const handleFormSubmit = (data) => {
    onSubmit({
      title: data.title.trim(),
      description: data.description?.trim() || '',
      category: data.category.toLowerCase().trim()
    });
  };

  const existingCategories = categories.map(cat => cat.category);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          {initialData ? 'Edit Task' : 'Add New Task'}
        </h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title *
          </label>
          <input
            {...register('title', { 
              required: 'Title is required',
              minLength: { value: 1, message: 'Title cannot be empty' },
              maxLength: { value: 120, message: 'Title cannot exceed 120 characters' }
            })}
            type="text"
            className="input mt-1"
            placeholder="Enter task title"
            autoFocus
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            {...register('description', {
              maxLength: { value: 500, message: 'Description cannot exceed 500 characters' }
            })}
            rows={3}
            className="input mt-1"
            placeholder="Enter task description (optional)"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category *
          </label>
          <div className="mt-1 space-y-2">
            <div className="flex gap-2">
              <select
                {...register('category', { 
                  required: 'Category is required',
                  validate: (value) => {
                    if (isNewCategory) return true;
                    return value ? true : 'Category is required';
                  }
                })}
                className="input flex-1"
                disabled={isNewCategory}
              >
                <option value="">Select category</option>
                {existingCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  setIsNewCategory(!isNewCategory);
                  setValue('category', '');
                }}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {isNewCategory ? 'Select' : 'New'}
              </button>
            </div>
            
            {isNewCategory && (
              <input
                {...register('category', { 
                  required: 'Category is required',
                  maxLength: { value: 24, message: 'Category cannot exceed 24 characters' },
                  pattern: {
                    value: /^[a-z0-9\s-]+$/,
                    message: 'Category can only contain lowercase letters, numbers, spaces, and hyphens'
                  }
                })}
                type="text"
                className="input"
                placeholder="Enter new category"
                onChange={(e) => setValue('category', e.target.value.toLowerCase())}
              />
            )}
          </div>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="btn btn-primary"
          >
            {initialData ? 'Update Task' : 'Add Task'}
          </button>
        </div>
      </form>
    </div>
  );
}
