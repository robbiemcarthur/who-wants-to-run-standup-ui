import React, { useState, useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { motion, AnimatePresence } from "framer-motion";
import {Link} from "react-router-dom";

interface GameResult {
    player1: string;
    move1: string;
    player2: string;
    move2: string;
    winner: string;
}

const RockPaperScissors: React.FC = () => {
    const [client, setClient] = useState<Client | null>(null);
    const [username, setUsername] = useState<string>("");
    const [move, setMove] = useState<string | null>(null);
    const [result, setResult] = useState<GameResult | null>(null);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [gameState, setGameState] = useState<"waiting" | "playing" | "result">("waiting");

    useEffect(() => {
        const stompClient = new Client({
            webSocketFactory: () => new SockJS('/game'),
            onConnect: () => {
                console.log("Connected to WebSocket");
                stompClient.subscribe("/topic/game-results", (message) => {
                    setCountdown(3);
                    setGameState("playing");

                    let counter = 3;
                    const interval = setInterval(() => {
                        counter -= 1;
                        setCountdown(counter);
                        if (counter === 0) {
                            clearInterval(interval);
                            setResult(JSON.parse(message.body));
                            setGameState("result");
                        }
                    }, 1000);
                });
            }
        });

        stompClient.activate();
        setClient(stompClient);

        return () => {
            if (stompClient) {
                stompClient.deactivate(); // Now properly cleaned up
            }
        };
    }, []);


    const sendMove = (choice: string) => {
        if (client && client.connected && username) {
            setMove(choice);
            setGameState("playing");
            client.publish({
                destination: "/app/play",
                body: JSON.stringify({ player: username, choice })
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

            {gameState === "waiting" && (
                <motion.div
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    className="flex flex-col items-center"
                >
                    <input
                        type="text"
                        placeholder="Enter Name"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="mb-4 p-2 text-black rounded"
                    />
                    <button
                        className="bg-green-500 px-4 py-2 rounded hover:bg-green-600"
                        onClick={() => username && setGameState("playing")}
                    >
                        Start Game
                    </button>
                </motion.div>
            )}

            {gameState === "playing" && (
                <AnimatePresence>
                    {/* Show player's choice */}
                    {move && (
                        <motion.p
                            className="text-lg mt-4"
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                        >
                            You chose: {move}
                        </motion.p>
                    )}

                    {/* Show countdown if waiting for the opponent */}
                    {countdown === null ? (
                        <motion.div
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            exit={{opacity: 0}}
                            className="flex space-x-4"
                        >
                            <button
                                className="bg-blue-500 px-6 py-3 rounded hover:bg-blue-600"
                                onClick={() => sendMove("rock")}
                            >
                                🪨 Rock
                            </button>
                            <button
                                className="bg-red-500 px-6 py-3 rounded hover:bg-red-600"
                                onClick={() => sendMove("paper")}
                            >
                                📄 Paper
                            </button>
                            <button
                                className="bg-yellow-500 px-6 py-3 rounded hover:bg-yellow-600"
                                onClick={() => sendMove("scissors")}
                            >
                                ✂️ Scissors
                            </button>
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
            )}

            {gameState === "result" && result && (
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
                            setGameState("waiting");
                            setResult(null);
                            setMove(null);
                        }}
                    >
                        Play Again
                    </button>
                </motion.div>
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
