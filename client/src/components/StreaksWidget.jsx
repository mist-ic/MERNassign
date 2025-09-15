import { useState, useEffect } from 'react';
import { Flame, Calendar, Target } from 'lucide-react';

export default function StreaksWidget({ tasks }) {
  const [streaks, setStreaks] = useState({});
  const [todayCompletions, setTodayCompletions] = useState(0);
  const totalTasksCount = tasks?.length || 0;

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
            style={{ width: `${Math.min(totalTasksCount ? (todayCompletions / totalTasksCount) * 100 : 0, 100)}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {totalTasksCount === 0
            ? "No tasks yet"
            : `${todayCompletions} of ${totalTasksCount} task${totalTasksCount === 1 ? '' : 's'} completed today`}
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

      {/* Weekly Heatmap */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">This Week</span>
        </div>
        <div className="grid grid-cols-7 gap-2 items-end">
          {(() => {
            const startOfWeek = new Date();
            const day = startOfWeek.getDay();
            const diffToMonday = (day + 6) % 7; // Monday=0 ... Sunday=6
            startOfWeek.setHours(0, 0, 0, 0);
            startOfWeek.setDate(startOfWeek.getDate() - diffToMonday);

            const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            const boxes = [];
            for (let i = 0; i < 7; i++) {
              const date = new Date(startOfWeek);
              date.setDate(startOfWeek.getDate() + i);
              const dayTasks = tasks.filter(task => {
                if (!task.isDone) return false;
                const taskDate = new Date(task.updatedAt || task.createdAt);
                taskDate.setHours(0, 0, 0, 0);
                return taskDate.getTime() === date.getTime();
              });
              const intensity = Math.min(dayTasks.length, 4);
              const isToday = new Date().toDateString() === date.toDateString();
              boxes.push(
                <div key={i} className="flex flex-col items-center gap-1 overflow-hidden">
                  <div className="text-[10px] text-gray-500 leading-none">{dayLabels[i]}</div>
                  <div
                    className={`w-8 h-8 rounded text-[10px] flex items-center justify-center border ${
                      intensity === 0 ? 'bg-gray-100 border-gray-200' :
                      intensity === 1 ? 'bg-green-200 border-green-300' :
                      intensity === 2 ? 'bg-green-300 border-green-400' :
                      intensity === 3 ? 'bg-green-400 border-green-500' : 'bg-green-500 border-green-600'
                    } ${isToday ? 'ring-2 ring-primary-500 ring-offset-2' : ''}`}
                    title={`${date.toLocaleDateString()}: ${dayTasks.length} task(s) completed`}
                  >
                    {date.getDate()}
                  </div>
                </div>
              );
            }
            return boxes;
          })()}
        </div>
        <p className="text-xs text-gray-500 mt-2">Mon-Sun; ring indicates today</p>
      </div>
    </div>
  );
}
