import React, { useEffect, useState, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import "./SpinTheWheel.css";

const SpinTheWheel: React.FC = () => {
    // WebSocket client and players/winner state
    const [client, setClient] = useState<Client | null>(null);
    const [players, setPlayers] = useState<string[]>([]);
    const playersRef = useRef<string[]>(players);
    const [winner, setWinner] = useState<string | null>(null);

    // For username input
    const [username, setUsername] = useState<string>("");

    // For controlling rotation of the wheel
    const [currentRotation, setCurrentRotation] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);

    // Keep our players ref updated so we always use the latest players array
    useEffect(() => {
        playersRef.current = players;
    }, [players]);

    useEffect(() => {
        const backendUrl = process.env.REACT_APP_BACKEND_URL || "";
        const stompClient = new Client({
            webSocketFactory: () => new SockJS(backendUrl + "/game"),
            onConnect: () => {
                console.log("Connected to WebSocket");

                // Subscribe to updates of the players list.
                stompClient.subscribe("/topic/players", (message) => {
                    const data = JSON.parse(message.body);
                    setPlayers(data);
                });

                // Subscribe to the winner result.
                stompClient.subscribe("/topic/wheel-results", (message) => {
                    const winningPlayer = message.body;
                    setWinner(winningPlayer);

                    // Use our latest players array.
                    const currentPlayers = playersRef.current;
                    const numPlayers = currentPlayers.length;
                    // Calculate the slice angle (if one player, sliceAngle=360)
                    const sliceAngle = numPlayers === 1 ? 360 : 360 / numPlayers;
                    // Determine the index of the winner; if not found, default to 0.
                    let winningIndex = currentPlayers.indexOf(winningPlayer);
                    if (winningIndex === -1) winningIndex = 0;
                    // The center of the winner's slice:
                    const targetAngle = winningIndex * sliceAngle + sliceAngle / 2;
                    // To bring that center to the top (0° where the arrow is),
                    // we need to rotate the wheel so that 360 - targetAngle is at 0.
                    // We'll add several full spins (for dramatic effect).
                    const fullSpins = 5;
                    const finalRotation = fullSpins * 360 + (360 - targetAngle);

                    // Start spinning: animate to the finalRotation over 3 seconds.
                    setIsSpinning(true);
                    setCurrentRotation(finalRotation);

                    // After spin animation (3 seconds) plus a 10-second pause, animate back to 0.
                    setTimeout(() => {
                        // Animate back to 0 over, say, 2 seconds.
                        setCurrentRotation(0);
                        setIsSpinning(false);
                    }, 13000); // 3 seconds for spin + 10 seconds pause = 13 seconds total
                });
            },
        });

        stompClient.activate();
        setClient(stompClient);

        return () => {
            stompClient.deactivate();
        };
    }, []);

    const joinGame = () => {
        if (client && username.trim() !== "") {
            client.publish({
                destination: "/app/join",
                body: username,
            });
            setUsername(""); // Clear input after joining
        }
    };

    const startWheel = () => {
        if (client && players.length > 0) {
            client.publish({
                destination: "/app/spin",
                body: "",
            });
        }
    };

    const clearPlayers = () => {
        if (client) {
            client.publish({
                destination: "/app/clear-players",
                body: "",
            });
        }
        // Also clear local state.
        setPlayers([]);
        setWinner(null);
        setIsSpinning(false);
        setCurrentRotation(0);
    };

    return (
        <div className="spin-the-wheel-container">
            <h2 className="subtitle">Wheel of Misfortune</h2>

            {/* Input and join button */}
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
            <p className="players-list">
                {players.join(", ") || "No players yet"}
            </p>

            {/* Wheel container */}
            <div className="wheel-container">
                <div className="arrow">▼</div>
                <motion.div
                    // Animate the wheel's rotation using currentRotation.
                    animate={{ rotate: currentRotation }}
                    // If a spin is happening, use a 3-second transition; when resetting, use 2 seconds.
                    transition={{ duration: isSpinning ? 3 : 2, ease: "easeOut" }}
                    className="wheel"
                >
                    <svg viewBox="0 0 200 200" className="wheel-svg">
                        {players.map((player, i) => {
                            const numPlayers = players.length;
                            const sliceAngle = numPlayers === 1 ? 360 : 360 / numPlayers;
                            const startAngle = sliceAngle * i;
                            const endAngle = startAngle + sliceAngle;
                            const startRad = (Math.PI / 180) * startAngle;
                            const endRad = (Math.PI / 180) * endAngle;
                            // Coordinates for the arc endpoints using a circle of radius 100.
                            const x1 = 100 + 100 * Math.cos(startRad);
                            const y1 = 100 + 100 * Math.sin(startRad);
                            const x2 = 100 + 100 * Math.cos(endRad);
                            const y2 = 100 + 100 * Math.sin(endRad);
                            const largeArcFlag = sliceAngle >= 180 ? 1 : 0;
                            // Calculate midpoint for the player's name (using radius 70)
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

            <button className="spin-button" onClick={startWheel} disabled={isSpinning}>
                Spin!
            </button>

            <Link to="/" onClick={clearPlayers}>
                <button className="bg-green-500 px-4 py-2 mt-4 rounded">
                    Back to main menu
                </button>
            </Link>
        </div>
    );
};

export default SpinTheWheel;
