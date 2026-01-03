import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Playground from './pages/playground/Page';
import { ConfirmationModal } from './components/ConfirmationModal';
import { ConfigModal } from './components/ConfigModal';


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
      <div id="header-container" className="flex">
        <div className="header-part1"></div>
        <div className="header-part2">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/playground" className="hover:underline">Start building</Link>
        </div>
        <div className="header-part3"></div>
      </div>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/playground" element={<Playground />} />
      </Routes>

      <ConfirmationModal />
      <ConfigModal />
    </Router>
  );
}

export default App
