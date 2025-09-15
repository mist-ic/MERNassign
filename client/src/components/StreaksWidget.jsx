import { useState, useEffect } from 'react';
import { Flame, Calendar, Target } from 'lucide-react';

export default function StreaksWidget({ tasks }) {
  const [streaks, setStreaks] = useState({});
  const [todayCompletions, setTodayCompletions] = useState(0);

  useEffect(() => {
    calculateStreaks();
  }, [tasks]);

  const calculateStreaks = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const completedTasks = tasks.filter(task => task.isDone);
    const todayTasks = completedTasks.filter(task => {
      const taskDate = new Date(task.updatedAt || task.createdAt);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === today.getTime();
    });

    setTodayCompletions(todayTasks.length);

    // Calculate streaks by category
    const categoryStreaks = {};
    const categories = [...new Set(tasks.map(task => task.category))];

    categories.forEach(category => {
      const categoryTasks = completedTasks.filter(task => task.category === category);
      const streak = calculateCategoryStreak(categoryTasks);
      categoryStreaks[category] = streak;
    });

    setStreaks(categoryStreaks);
  };

  const calculateCategoryStreak = (categoryTasks) => {
    if (categoryTasks.length === 0) return 0;

    // Sort by completion date (most recent first)
    const sortedTasks = categoryTasks
      .map(task => ({
        ...task,
        completionDate: new Date(task.updatedAt || task.createdAt)
      }))
      .sort((a, b) => b.completionDate - a.completionDate);

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if there's a completion today
    const todayCompletion = sortedTasks.find(task => {
      const taskDate = new Date(task.completionDate);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === today.getTime();
    });

    if (!todayCompletion) return 0;

    streak = 1;
    let currentDate = new Date(todayCompletion.completionDate);
    currentDate.setDate(currentDate.getDate() - 1);

    // Count consecutive days backwards
    for (let i = 1; i < sortedTasks.length; i++) {
      const taskDate = new Date(sortedTasks[i].completionDate);
      taskDate.setHours(0, 0, 0, 0);
      
      if (taskDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  const getStreakColor = (streak) => {
    if (streak >= 7) return 'text-red-600';
    if (streak >= 3) return 'text-orange-600';
    if (streak >= 1) return 'text-yellow-600';
    return 'text-gray-400';
  };

  const getStreakMessage = (category, streak) => {
    if (streak === 0) return `No recent activity in ${category}`;
    if (streak === 1) return `Completed a task in ${category} today!`;
    if (streak < 7) return `${streak} day streak in ${category}!`;
    return `🔥 ${streak} day streak in ${category}! Amazing!`;
  };

  const activeStreaks = Object.entries(streaks).filter(([_, streak]) => streak > 0);
  const maxStreak = Math.max(...Object.values(streaks), 0);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-5 h-5 text-orange-500" />
        <h3 className="text-lg font-semibold text-gray-900">Streaks & Progress</h3>
      </div>

      {/* Today's Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Today's Completions</span>
          <span className="text-2xl font-bold text-primary-600">{todayCompletions}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(todayCompletions * 20, 100)}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {todayCompletions === 0 
            ? "Complete a task to start your streak!" 
            : `${todayCompletions} task${todayCompletions === 1 ? '' : 's'} completed today`
          }
        </p>
      </div>

      {/* Category Streaks */}
      {activeStreaks.length > 0 ? (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Category Streaks</h4>
          {activeStreaks
            .sort(([,a], [,b]) => b - a)
            .map(([category, streak]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-lg ${getStreakColor(streak)}`}>
                    {streak >= 7 ? '🔥' : streak >= 3 ? '⚡' : '⭐'}
                  </span>
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {category}
                  </span>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${getStreakColor(streak)}`}>
                    {streak} day{streak !== 1 ? 's' : ''}
                  </div>
                  <div className="text-xs text-gray-500">
                    {getStreakMessage(category, streak)}
                  </div>
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <Target className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">
            Complete tasks to build your streaks!
          </p>
        </div>
      )}

      {/* Weekly Heatmap Placeholder */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">This Week</span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            const dayTasks = tasks.filter(task => {
              if (!task.isDone) return false;
              const taskDate = new Date(task.updatedAt || task.createdAt);
              return taskDate.toDateString() === date.toDateString();
            });
            const intensity = Math.min(dayTasks.length, 4);
            return (
              <div
                key={i}
                className={`w-8 h-8 rounded text-xs flex items-center justify-center ${
                  intensity === 0 ? 'bg-gray-100' :
                  intensity === 1 ? 'bg-green-200' :
                  intensity === 2 ? 'bg-green-300' :
                  intensity === 3 ? 'bg-green-400' : 'bg-green-500'
                }`}
                title={`${date.toLocaleDateString()}: ${dayTasks.length} tasks completed`}
              >
                {date.getDate()}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Complete more tasks to fill the heatmap!
        </p>
      </div>
    </div>
  );
}
