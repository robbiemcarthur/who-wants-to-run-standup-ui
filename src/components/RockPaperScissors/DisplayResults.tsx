import React from 'react';
import {motion} from "framer-motion";
import {GameState} from "../../enum/GameState";
import {GameResult} from "../../model/GameResult";

interface DisplayResultsProps {
    result: GameResult;
    setResult: (result: GameResult | null) => void;
    setMove: (move: string | null) => void;
    setGameState: (state: GameState) => void;
}

const DisplayResults: React.FC<DisplayResultsProps> = ({result, setResult, setMove, setGameState}) => {
    return (
        <motion.div
            key="result"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            className="mt-6 text-center"
        >
            <p className="text-xl">{result.player1} chose {result.move1}</p>
            <p className="text-xl">{result.player2} chose {result.move2}</p>
            <motion.h2
                className="text-3xl font-bold mt-4"
                initial={{scale: 0}}
                animate={{scale: 1.2}}
            >
                {result.winner}
            </motion.h2>
            <button
                className="bg-gray-700 px-4 py-2 rounded mt-4 hover:bg-gray-600"
                onClick={() => {
                    setGameState(GameState.WAITING);
                    setResult(null);
                    setMove(null);
                }}
            >
                Play Again
            </button>
        </motion.div>
    )
};
export default DisplayResults;