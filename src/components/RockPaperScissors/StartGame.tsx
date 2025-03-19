import React from "react";
import {motion} from "framer-motion";

interface UsernameInputFormProps {
    username: string;
    onChange: (value: string) => void;
    onStart: () => void;
}

const StartGame: React.FC<UsernameInputFormProps> = ({username, onChange, onStart}) => {
    return (
        <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            className="flex flex-col items-center">
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
        </motion.div>
    );
};

export default StartGame;