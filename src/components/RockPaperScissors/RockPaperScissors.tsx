import React, {useEffect, useState} from "react";
import {motion} from "framer-motion";
import {Link} from "react-router-dom";
import {GameState} from "../../enum/GameState";
import {GameResult} from "../../model/GameResult";
import useStompClient from "../../hooks/useStompClient";
import StartGame from "./StartGame";
import PlayRockPaperScissors from "./PlayRockPaperScissors";
import DisplayResults from "./DisplayResults";
import Config from "../../Config";

const RockPaperScissors: React.FC = () => {
    const [username, setUsername] = useState<string>("");
    const [move, setMove] = useState<string | null>(null);
    const [result, setResult] = useState<GameResult | null>(null);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [gameState, setGameState] = useState<GameState.WAITING | GameState.PLAYING | GameState.RESULT>(GameState.WAITING);

    const backendUrl = Config.backendUrl;
    const client = useStompClient(`${backendUrl}/game`);

    useEffect(() => {
        if (client) {
            client.onConnect = () => {
                console.log("Connected to WebSocket");
                client.subscribe("/topic/game-results", (message) => {
                    setCountdown(3);
                    setGameState(GameState.PLAYING);

                    let counter = 3;
                    const interval = setInterval(() => {
                        counter -= 1;
                        setCountdown(counter);
                        if (counter === 0) {
                            clearInterval(interval);
                            setResult(JSON.parse(message.body));
                            setGameState(GameState.RESULT);
                        }
                    }, 1000);
                });
            };
        }
    }, [client]);


    const sendMove = (choice: string) => {
        if (client && client.connected && username) {
            setMove(choice);
            setGameState(GameState.PLAYING);
            client.publish({
                destination: "/app/play",
                body: JSON.stringify({player: username, choice})
            });
        } else {
            console.error("STOMP client is not connected yet!");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
            <motion.h1
                className="text-4xl font-bold mb-4"
                initial={{y: -20, opacity: 0}}
                animate={{y: 0, opacity: 1}}
            >
                Rock Paper Scissors
            </motion.h1>

            {gameState === GameState.WAITING && (
                <StartGame
                    username={username}
                    onChange={setUsername}
                    onStart={() => username && setGameState(GameState.PLAYING)}
                />
            )}

            {gameState === GameState.PLAYING && (
                <PlayRockPaperScissors
                    sendMove={sendMove}
                    move={move}
                    countdown={countdown}
                />
            )}

            {gameState === GameState.RESULT && result && (
                <DisplayResults
                    result={result}
                    setResult={setResult}
                    setMove={setMove}
                    setCountdown={setCountdown}
                    setGameState={setGameState}/>
            )}
            <Link to="/">
                <button className="bg-green-500 px-4 py-2 mt-4 rounded">
                    Back to main menu
                </button>
            </Link>
        </div>
    );
};

export default RockPaperScissors;
