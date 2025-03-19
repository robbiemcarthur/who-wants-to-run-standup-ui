import React from 'react';

interface RockPaperScissorsButtonsProps {
    onSelect: (choice: string) => void;
}

const RockPaperScissorsButtons: React.FC<RockPaperScissorsButtonsProps> = ({ onSelect }) => {
    return (
        <div className="flex space-x-4">
            <button
                className="bg-blue-500 px-6 py-3 rounded hover:bg-blue-600"
                onClick={() => onSelect("rock")}
            >
                🪨 Rock
            </button>
            <button
                className="bg-red-500 px-6 py-3 rounded hover:bg-red-600"
                onClick={() => onSelect("paper")}
            >
                📄 Paper
            </button>
            <button
                className="bg-yellow-500 px-6 py-3 rounded hover:bg-yellow-600"
                onClick={() => onSelect("scissors")}
            >
                ✂️ Scissors
            </button>
        </div>
    );
}
export default RockPaperScissorsButtons;