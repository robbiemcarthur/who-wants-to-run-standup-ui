import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import RockPaperScissors from "./components/Game/RockPaperScissors";
import SpinTheWheel from "./components/Game/SpinTheWheel";

const App: React.FC = () => {
    return (
        <Router>
            <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
                <h1 className="text-4xl font-bold mb-6">Who Wants to Run Stand-Up?</h1>
                <Routes>
                    <Route path="/rps" element={<RockPaperScissors />} />
                    <Route path="/wheel" element={<SpinTheWheel />} />
                    <Route path="/" element={<Home />} />
                </Routes>
            </div>
        </Router>
    );
};

const Home: React.FC = () => {
    return (
        <div className="flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-4">Select a Game</h2>
            <div className="flex space-x-4">
                <Link to="/rps">
                    <button className="bg-blue-500 px-6 py-3 rounded hover:bg-blue-600">Rock Paper Scissors</button>
                </Link>
                <Link to="/wheel">
                    <button className="bg-green-500 px-6 py-3 rounded hover:bg-green-600">Spin The Wheel</button>
                </Link>
            </div>
        </div>
    );
};

export default App;
