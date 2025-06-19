import "./App.css";
import GamePage from "./pages/GamePage.jsx";
import { BrowserRouter, Routes, Route } from "react-router";
import HomePage from "./pages/HomePage/HomePage.jsx";
import RoomsPage from "./pages/RoomsPage/RoomsPage.jsx";
import { io } from "socket.io-client";

function App() {
  const socket = io("http://localhost:3000");

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/">
            <Route index element={<HomePage />} />
            <Route path="/rooms" element={<RoomsPage socket={socket} />} />
            <Route path="/game/:id" element={<GamePage socket={socket} />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}
export default App;
