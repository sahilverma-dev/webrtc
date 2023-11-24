import { Route, Routes } from "react-router-dom";

// pages
import Home from "./pages/Home";
import Room from "./pages/Room";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:roomId" element={<Room />} />
      </Routes>
    </div>
  );
};

export default App;
