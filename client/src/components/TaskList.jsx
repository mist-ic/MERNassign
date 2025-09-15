import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';
import toast from 'react-hot-toast';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';
import { Plus, CheckCircle2, Circle } from 'lucide-react';

export default function TaskList({ selectedCategory, showDone, onDataChange, refreshKey }) {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const [tasksData, categoriesData] = await Promise.all([
        apiClient.getTasks(selectedCategory),
        apiClient.getCategories()
      ]);
      setTasks(tasksData);
      setCategories(categoriesData);
    } catch (error) {
      toast.error('Failed to fetch tasks');
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [selectedCategory, refreshKey]);

  const handleAddTask = async (taskData) => {
    try {
      const newTask = await apiClient.createTask(taskData);
      setTasks(prev => [newTask, ...prev]);
      setShowAddForm(false);
      toast.success('Task added successfully!');
      
      // Refresh categories to update counts
      const categoriesData = await apiClient.getCategories();
      setCategories(categoriesData);

      // Notify parent to refresh aggregated data (e.g., streaks)
      onDataChange?.();
    } catch (error) {
      toast.error(error.message || 'Failed to add task');
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      const updatedTask = await apiClient.updateTask(taskId, updates);
      setTasks(prev => prev.map(task => 
        task._id === taskId ? updatedTask : task
      ));
      
      // Refresh categories if category changed
      if (updates.category) {
        const categoriesData = await apiClient.getCategories();
        setCategories(categoriesData);
      }
      
      toast.success('Task updated successfully!');

      // Notify parent to refresh aggregated data (e.g., streaks)
      onDataChange?.();
    } catch (error) {
      toast.error(error.message || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await apiClient.deleteTask(taskId);
      setTasks(prev => prev.filter(task => task._id !== taskId));
      toast.success('Task deleted successfully!');
      
      // Refresh categories to update counts
      const categoriesData = await apiClient.getCategories();
      setCategories(categoriesData);

      // Notify parent to refresh aggregated data (e.g., streaks)
      onDataChange?.();
    } catch (error) {
      toast.error(error.message || 'Failed to delete task');
    }
  };

  const filteredTasks = tasks.filter(task => 
    showDone || !task.isDone
  );

  const completedCount = tasks.filter(task => task.isDone).length;
  const totalCount = tasks.length;

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-gray-200 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-gray-700">
                {completedCount} completed
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                {totalCount - completedCount} remaining
              </span>
            </div>
          </div>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <div className="card">
          <TaskForm
            onSubmit={handleAddTask}
            onCancel={() => setShowAddForm(false)}
            categories={categories}
          />
        </div>
      )}

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <Circle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {tasks.length === 0 ? 'No tasks yet' : 'No tasks match your filter'}
          </h3>
          <p className="text-gray-500 mb-4">
            {tasks.length === 0 
              ? 'Get started by adding your first task!'
              : 'Try adjusting your category filter or show completed tasks.'
            }
          </p>
          {tasks.length === 0 && (
            <button
              onClick={() => setShowAddForm(true)}
              className="btn btn-primary"
            >
              Add Your First Task
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map(task => (
            <TaskItem
              key={task._id}
              task={task}
              onUpdate={handleUpdateTask}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
      )}
    </div>
  );
}
