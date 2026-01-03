// src/components/MoodCheckin.tsx
import React, { useState } from 'react';
// Import your service to record the mood
import { recordMood } from '../../services/personalizationService';
import { type Mood as MoodType } from '../../types';

// Define the mood type
// Define the mood type
const moods: { emoji: string; name: string }[] = [
  { emoji: '😊', name: 'Happy' },
  { emoji: '😌', name: 'Calm' },
  { emoji: '🤯', name: 'Overwhelmed' },
  { emoji: '😥', name: 'Sad' },
  { emoji: '😡', name: 'Angry' },
];

interface MoodCheckinProps {
  // This prop will let the Dashboard know a mood was selected
  onMoodSelect: (mood: string) => void;
}

const MoodCheckin: React.FC<MoodCheckinProps> = ({ onMoodSelect }) => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const handleMoodClick = (mood: string) => {
    setSelectedMood(mood);

    // Find emoji
    const selectedMoodObj = moods.find(m => m.name === mood);
    const emoji = selectedMoodObj ? selectedMoodObj.emoji : '😐';

    // 1. Call the service function as requested
    // Pass the object matching Omit<Mood, 'timestamp'> -> { label, emoji }
    recordMood({ label: mood, emoji });

    // 2. Call the prop function to notify the parent (Dashboard)
    onMoodSelect(mood);
  };

  return (
    <div className="bg-slate-800/50 p-4 rounded-xl ring-1 ring-slate-700">
      <h3 className="text-lg font-semibold text-white mb-3 text-center">
        How are you feeling?
      </h3>
      <div className="flex justify-around items-center">
        {moods.map(({ emoji, name }) => (
          <button
            key={name}
            onClick={() => handleMoodClick(name)}
            className={`text-4xl p-2 rounded-full transition-all ${selectedMood === name
              ? 'bg-sky-700 scale-110'
              : 'hover:bg-slate-700'
              }`}
            aria-label={`Select mood: ${name}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MoodCheckin;
