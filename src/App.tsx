import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import TestPage from './pages/test//TestPage';


function HomePage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Home 🏠</h1>
      <p className="text-lg">This is the homepage of CodeDam.</p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <nav className="bg-gray-800 p-4 text-white flex gap-4">
        <Link to="/" className="hover:underline">Home</Link>
        <Link to="/about" className="hover:underline">About</Link>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<TestPage />} />
      </Routes>
    </Router>
  );
}

export default App
