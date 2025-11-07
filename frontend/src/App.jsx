import { Routes, Route } from "react-router-dom";
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <div className="App">
      <main>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </main>
    </div>
  );
}
export default App;