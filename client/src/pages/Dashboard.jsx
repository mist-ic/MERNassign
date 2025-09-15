import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api';
import toast from 'react-hot-toast';
import QuickAdd from '../components/QuickAdd';
import CategoryFilter from '../components/CategoryFilter';
import TaskList from '../components/TaskList';
import StreaksWidget from '../components/StreaksWidget';
import { LogOut, User } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showDone, setShowDone] = useState(false);
  const [categories, setCategories] = useState([]);
  const [lastUsedCategory, setLastUsedCategory] = useState('personal');
  const [allTasks, setAllTasks] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('lastUsedCategory');
    if (saved) {
      setLastUsedCategory(saved);
    }
  }, []);

  const fetchCategories = async () => {
    try {
      const categoriesData = await apiClient.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchAllTasks = async () => {
    try {
      const tasksData = await apiClient.getTasks();
      setAllTasks(tasksData);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchAllTasks();
  }, []);

  const handleQuickAdd = async (taskData) => {
    try {
      await apiClient.createTask(taskData);
      setLastUsedCategory(taskData.category);
      localStorage.setItem('lastUsedCategory', taskData.category);
      toast.success('Task added successfully!');
      fetchCategories(); // Refresh categories to update counts
      fetchAllTasks(); // Refresh all tasks for streaks
    } catch (error) {
      toast.error(error.message || 'Failed to add task');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Taskify</h1>
              <p className="text-sm text-gray-600">
                Welcome back, {user?.name}!
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                {user?.email}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Quick Add */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Add</h2>
              <QuickAdd 
                onAddTask={handleQuickAdd}
                lastCategory={lastUsedCategory}
              />
            </div>

            {/* Filters */}
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              onShowDoneChange={setShowDone}
              showDone={showDone}
            />

            {/* Task List */}
            <TaskList
              selectedCategory={selectedCategory}
              showDone={showDone}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <StreaksWidget tasks={allTasks} />
          </div>
        </div>
      </main>
    </div>
  );
}
