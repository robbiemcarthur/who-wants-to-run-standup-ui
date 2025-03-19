import React from "react";

interface UsernameInputFormProps {
    username: string;
    onChange: (value: string) => void;
    onStart: () => void;
}

const UsernameInputForm: React.FC<UsernameInputFormProps> = ({ username, onChange, onStart }) => {
    return (
        <div className="flex flex-col items-center">
            <input
                type="text"
                placeholder="Enter Name"
                value={username}
                onChange={(e) => onChange(e.target.value)}
                className="mb-4 p-2 text-black rounded"
            />
            <button
                className="bg-green-500 px-4 py-2 rounded hover:bg-green-600"
                onClick={onStart}
                disabled={!username.trim()} // Prevent empty submissions
            >
                Start Game
            </button>
        </div>
    );
};

export default UsernameInputForm;