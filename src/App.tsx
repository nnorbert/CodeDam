import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Playground from './pages/playground/Page';


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
        <Link to="/playground" className="hover:underline">Start building</Link>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/playground" element={<Playground />} />
      </Routes>
    </Router>
  );
}

export default App
