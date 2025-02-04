import React, { useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { motion } from "framer-motion";
import "./SpinTheWheel.css";
import { Link } from "react-router-dom";

const SpinTheWheel: React.FC = () => {
    const [client, setClient] = useState<Client | null>(null);
    const [players, setPlayers] = useState<string[]>([]);
    const [winner, setWinner] = useState<string | null>(null);
    const [spinning, setSpinning] = useState(false);
    const [username, setUsername] = useState<string>("");

    // Cleanup function to reset game state
    const resetGame = () => {
        setPlayers([]);
        setWinner(null);
        setSpinning(false);
    };

    useEffect(() => {
        const stompClient = new Client({
            webSocketFactory: () => new SockJS("http://localhost:8080/game"),
            onConnect: () => {
                console.log("Connected to WebSocket");

                stompClient.subscribe("/topic/players", (message) => {
                    setPlayers(JSON.parse(message.body));
                });

                stompClient.subscribe("/topic/wheel-results", (message) => {
                    setSpinning(true);
                    setTimeout(() => {
                        setWinner(message.body);
                        setSpinning(false);
                        // Optionally reset the game automatically after a delay:
                        // resetGame();
                    }, 3000);
                });
            },
        });

        stompClient.activate();
        setClient(stompClient);

        return () => {
            if (stompClient) {
                stompClient.deactivate();
            }
        };
    }, []);

    const joinGame = () => {
        if (client && username.trim() !== "") {
            client.publish({
                destination: "/app/join",
                body: username,
            });
            setUsername(""); // Clear the input after joining
        }
    };

    const startWheel = () => {
        if (client && players.length > 0) {
            client.publish({
                destination: "/app/spin",
                body: "", // No body needed—backend uses active players
            });
        }
    };

    return (
        <div className="spin-the-wheel-container">
            <h2 className="subtitle">Spin The Wheel</h2>

            {/* Input & Join */}
            <div className="input-container">
                <input
                    className="username-input"
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <button onClick={joinGame} className="join-button">
                    Join Game
                </button>
            </div>

            <p className="players-label">Players:</p>
            <p className="players-list">{players.join(", ") || "No players yet"}</p>

            {/* Wheel Container */}
            <div className="wheel-container">
                <div className="arrow">▼</div>
                <motion.div
                    animate={{ rotate: spinning ? 3600 : 0 }}
                    transition={{ duration: 3, ease: "easeOut" }}
                    className="wheel"
                >
                    <svg viewBox="0 0 200 200" className="wheel-svg">
                        {players.map((player, i) => {
                            const numPlayers = players.length;
                            const sliceAngle = 360 / numPlayers; // degrees per slice
                            const startAngle = sliceAngle * i;
                            const endAngle = startAngle + sliceAngle;
                            const startRad = (Math.PI / 180) * startAngle;
                            const endRad = (Math.PI / 180) * endAngle;
                            // Coordinates for the arc endpoints (using a radius of 100)
                            const x1 = 100 + 100 * Math.cos(startRad);
                            const y1 = 100 + 100 * Math.sin(startRad);
                            const x2 = 100 + 100 * Math.cos(endRad);
                            const y2 = 100 + 100 * Math.sin(endRad);
                            // For an arc, if the slice angle is >= 180°, use largeArcFlag = 1, else 0.
                            const largeArcFlag = sliceAngle >= 180 ? 1 : 0;

                            // Calculate the midpoint angle for positioning the text (70% of radius)
                            const midAngle = (startAngle + endAngle) / 2;
                            const midRad = (Math.PI / 180) * midAngle;
                            const textX = 100 + 70 * Math.cos(midRad);
                            const textY = 100 + 70 * Math.sin(midRad);

                            return (
                                <g key={`${player}-${i}`}>
                                    <path
                                        d={`M100 100 L${x1} ${y1} A100 100 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                                        fill={`hsl(${i * (360 / numPlayers)}, 70%, 50%)`}
                                        stroke="white"
                                        strokeWidth="1"
                                    />
                                    <text
                                        x={textX}
                                        y={textY}
                                        fill="white"
                                        fontSize="10"
                                        textAnchor="middle"
                                        alignmentBaseline="middle"
                                    >
                                        {player}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>
                </motion.div>
            </div>

            {winner && <p className="winner-label">Winner: {winner}</p>}

            <button className="spin-button" onClick={startWheel}>
                Spin!
            </button>

            {/* When clicking "Back to main menu", call resetGame to clear players */}
            <Link to="/" onClick={resetGame}>
                <button className="bg-green-500 px-4 py-2 mt-4 rounded">
                    Back to main menu
                </button>
            </Link>
        </div>
    );
};

export default SpinTheWheel;
