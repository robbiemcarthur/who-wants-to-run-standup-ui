import React from 'react';
import {AnimatePresence, motion} from "framer-motion";
import RockPaperScissorsButtons from "./RockPaperScissorsButtons";

interface PlayRockPaperScissorsProps {
    sendMove: (move: string) => void;
    move: string | null;
    countdown: number | null;
}

const PlayRockPaperScissors: React.FC<PlayRockPaperScissorsProps> = ({sendMove, move, countdown }) => {
    return (
        <AnimatePresence>
            {move && (
                <motion.p
                    className="text-lg mt-4"
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                >
                    You chose: {move}
                </motion.p>
            )}

            {countdown === null ? (
                <motion.div
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    exit={{opacity: 0}}
                    className="flex space-x-4"
                >
                    <RockPaperScissorsButtons onSelect={sendMove}/>
                </motion.div>
            ) : (
                <motion.div
                    key="countdown"
                    initial={{scale: 0}}
                    animate={{scale: 1}}
                    exit={{opacity: 0}}
                    className="text-6xl font-bold mt-4"
                >
                    {countdown > 0 ? countdown : "Revealing!"}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
export default PlayRockPaperScissors;