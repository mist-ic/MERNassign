import { useState } from 'react';
import { Check, Edit2, Trash2, MoreVertical, Clock } from 'lucide-react';
import TaskForm from './TaskForm';
import FocusTimer from './FocusTimer';

export default function TaskItem({ task, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleToggleDone = async () => {
    try {
      await onUpdate(task._id, { isDone: !task.isDone });
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleEdit = (updatedData) => {
    onUpdate(task._id, updatedData);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      onDelete(task._id);
    }
  };

  const handleFocusComplete = (completedTask) => {
    // Mark task as completed when focus session ends
    if (!completedTask.isDone) {
      onUpdate(completedTask._id, { isDone: true });
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <TaskForm
          initialData={task}
          onSubmit={handleEdit}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 transition-all ${
      task.isDone ? 'opacity-60' : ''
    }`}>
      <div className="flex items-start gap-3">
        <button
          onClick={handleToggleDone}
          className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            task.isDone
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 hover:border-green-400'
          }`}
        >
          {task.isDone && <Check className="w-3 h-3" />}
        </button>

        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-medium ${
            task.isDone ? 'line-through text-gray-500' : 'text-gray-900'
          }`}>
            {task.title}
          </h3>
          
          {task.description && (
            <p className={`mt-1 text-sm ${
              task.isDone ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {task.category}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(task.createdAt).toLocaleDateString()}
            </span>
            {!task.isDone && (
              <FocusTimer 
                task={task} 
                onComplete={handleFocusComplete}
              />
            )}
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <button
                onClick={() => {
                  setIsEditing(true);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => {
                  handleDelete();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
