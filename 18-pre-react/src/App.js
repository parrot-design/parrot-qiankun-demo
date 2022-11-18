import React from "react";
import Player from "./Player";
import { BrowserRouter, Route, Routes, Link } from "react-router-dom";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Player</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/users">Users</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<Player />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
