import React, { useEffect, useState } from 'react';
import { PageHeader, Spinner } from '../components/Common/ui';
import { Clock, Gamepad2, Activity, Award } from 'lucide-react';

// -------------------- TYPES --------------------
interface GameActivity {
  game: 'zip' | 'sudoku' | 'quiz';
  score: number;
  duration: number; // seconds
  date: string;
}

// -------------------- SMALL UI CARDS --------------------
const StatCard = ({ title, value, icon: Icon }: any) => (
  <div className="bg-slate-800/50 p-5 rounded-xl ring-1 ring-slate-700">
    <div className="flex items-center gap-3 text-slate-400 text-sm">
      <Icon size={18} /> {title}
    </div>
    <div className="text-2xl font-bold text-slate-100 mt-2">{value}</div>
  </div>
);

// -------------------- MAIN PAGE --------------------
const Insights: React.FC = () => {
  const [activity, setActivity] = useState<GameActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('gameActivity') || '[]');
    setActivity(data);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner />
      </div>
    );
  }

  // -------------------- CALCULATIONS --------------------
  const totalPlays = activity.length;

  const totalTime = activity.reduce(
    (sum, item) => {
      const time = Number(item.duration);
      return sum + (isNaN(time) ? 0 : time);
    },
    0
  );

  const zipCount = activity.filter(a => a.game === 'zip').length;
  const sudokuCount = activity.filter(a => a.game === 'sudoku').length;
  // Check for 'quiz' or 'interview' as the type definition in gameTracker includes 'interview'
  const quizCount = activity.filter(a => a.game === 'quiz' || a.game === 'interview').length;

  let activityLevel: 'Low' | 'Medium' | 'High' = 'Low';
  if (totalTime > 300) activityLevel = 'Medium';
  if (totalTime > 900) activityLevel = 'High';

  // -------------------- UI --------------------
  return (
    <div className="space-y-8">
      <PageHeader
        title="Insights"
        subtitle="See how active you are while learning through games"
      />

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Games Played"
          value={totalPlays}
          icon={Gamepad2}
        />
        <StatCard
          title="Total Time Spent"
          value={`${totalTime} sec`}
          icon={Clock}
        />
        <StatCard
          title="Activity Level"
          value={activityLevel}
          icon={Activity}
        />
        <StatCard
          title="Zip / Sudoku / Quiz"
          value={`${zipCount} / ${sudokuCount} / ${quizCount}`}
          icon={Gamepad2}
        />
      </div>

      {/* BADGES SECTION */}
      <div className="bg-slate-800/50 p-6 rounded-xl ring-1 ring-slate-700">
        <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
          <Award className="text-yellow-400" /> Achievements
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Novice Gamer */}
          <div className={`p-4 rounded-lg border ${totalPlays > 0 ? 'bg-violet-900/20 border-violet-500/50' : 'bg-slate-800/50 border-slate-700 opacity-50'}`}>
            <div className="text-2xl mb-2">🎮</div>
            <h4 className="font-semibold text-sm text-slate-200">Novice Gamer</h4>
            <p className="text-xs text-slate-400">Play your first game</p>
          </div>

          {/* Speed Demon */}
          <div className={`p-4 rounded-lg border ${activity.some(a => a.game === 'speedmath') ? 'bg-violet-900/20 border-violet-500/50' : 'bg-slate-800/50 border-slate-700 opacity-50'}`}>
            <div className="text-2xl mb-2">⚡</div>
            <h4 className="font-semibold text-sm text-slate-200">Speed Demon</h4>
            <p className="text-xs text-slate-400">Play Speed Math</p>
          </div>

          {/* Puzzle Master */}
          <div className={`p-4 rounded-lg border ${activity.some(a => a.game === 'sudoku' && a.score > 0) ? 'bg-violet-900/20 border-violet-500/50' : 'bg-slate-800/50 border-slate-700 opacity-50'}`}>
            <div className="text-2xl mb-2">🧩</div>
            <h4 className="font-semibold text-sm text-slate-200">Puzzle Master</h4>
            <p className="text-xs text-slate-400">Solve a Sudoku</p>
          </div>

          {/* Dedicated Learner */}
          <div className={`p-4 rounded-lg border ${totalTime > 300 ? 'bg-violet-900/20 border-violet-500/50' : 'bg-slate-800/50 border-slate-700 opacity-50'}`}>
            <div className="text-2xl mb-2">🎓</div>
            <h4 className="font-semibold text-sm text-slate-200">Dedicated</h4>
            <p className="text-xs text-slate-400">Study for 5+ mins</p>
          </div>
        </div>
      </div>

      {/* ACTIVITY LIST */}
      <div className="bg-slate-800/50 p-6 rounded-xl ring-1 ring-slate-700">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">
          Recent Game Activity
        </h3>

        {activity.length === 0 ? (
          <p className="text-slate-400 italic">
            Play a game to start tracking your activity.
          </p>
        ) : (
          <ul className="space-y-3 text-sm">
            {activity
              .slice(-5)
              .reverse()
              .map((item, index) => (
                <li
                  key={index}
                  className="flex justify-between text-slate-300"
                >
                  <span>
                    {item.game.toUpperCase()} — Score {item.score}
                  </span>
                  <span>{item.duration} sec</span>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Insights;
