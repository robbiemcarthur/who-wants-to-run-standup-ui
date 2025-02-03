import React, {useEffect, useState} from "react";
import {Client} from "@stomp/stompjs";
import SockJS from "sockjs-client";
import {motion} from "framer-motion";
import "./SpinTheWheel.css";
import {Link} from "react-router-dom"; // Custom styles for the wheel

const SpinTheWheel: React.FC = () => {
    const [client, setClient] = useState<Client | null>(null);
    const [players, setPlayers] = useState<string[]>([]);
    const [winner, setWinner] = useState<string | null>(null);
    const [spinning, setSpinning] = useState(false);
    const [username, setUsername] = useState<string>("");

    useEffect(() => {
        const stompClient = new Client({
            webSocketFactory: () => new SockJS("http://localhost:8080/game"),
            onConnect: () => {
                console.log("Connected to WebSocket");

                // Subscribe to player updates
                stompClient.subscribe("/topic/players", (message) => {
                    setPlayers(JSON.parse(message.body));
                });

                // Subscribe to wheel results
                stompClient.subscribe("/topic/wheel-results", (message) => {
                    setSpinning(true);
                    setTimeout(() => {
                        setWinner(message.body);
                        setSpinning(false);
                    }, 3000);
                });
            }
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
                body: username
            });
        }
    };

    const startWheel = () => {
        if (client && players.length > 0) {
            client.publish({
                destination: "/app/spin",
                body: "" // Empty because backend tracks players
            });
        }
    };

    // Calculate rotation angle per player
    const segmentAngle = 360 / Math.max(players.length, 1);

    return (
        <div className="flex flex-col items-center">
            <h1 className="text-3xl font-bold">Spin The Wheel</h1>

            {/* Input Box for Joining */}
            <div className="flex items-center mt-4">
                <input
                    className="mb-4 p-2 border rounded text-black"
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <button onClick={joinGame} className="bg-blue-500 px-4 py-2 rounded text-white ml-2">
                    Join Game
                </button>
            </div>

            <p className="mt-4">Players: {players.join(", ")}</p>

            {/* Wheel Container */}
            <div className="wheel-container">
                <div className="arrow">▼</div>
                <motion.div
                    animate={{rotate: spinning ? 3600 : 0}}
                    transition={{duration: 3, ease: "easeOut"}}
                    className="wheel"
                >
                    {players.map((player, index) => (
                        <div
                            key={player}
                            className="wheel-segment"
                            style={{
                                transform: `rotate(${index * segmentAngle}deg)`,
                                backgroundColor: `hsl(${index * (360 / players.length)}, 70%, 50%)`
                            }}
                        >
                            <span className="player-name">{player}</span>
                        </div>
                    ))}
                </motion.div>
            </div>

            {winner && <p className="text-xl mt-4">Winner: {winner}</p>}
            <button className="bg-green-500 px-4 py-2 mt-4 rounded" onClick={startWheel}>
                Spin!
            </button>
            <Link to="/">
                <button className="bg-green-500 px-4 py-2 mt-4 rounded">
                    Back to main menu
                </button>
            </Link>
        </div>
    );
};

export default SpinTheWheel;
