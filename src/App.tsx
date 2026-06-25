import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Playground from './pages/playground/Page';
import { ConfirmationModal } from './components/ConfirmationModal';
import { ConfigModal } from './components/ConfigModal';
import { SaveProjectModal } from './components/SaveProjectModal';
import { LoadProjectModal } from './components/LoadProjectModal';
import { PageViewTracker } from './analytics/PageViewTracker';
import { AnalyticsConsentBanner } from './components/AnalyticsConsentBanner';
import { Header } from './components/Header';

function HomePage() {
  return (
    <div className="page-wrapper">
      <Header activeMenuItem="home" showBeavy={false} />

      <div className="page-content">

        <h1 className="text-3xl font-bold mb-4">Home 🏠</h1>
        <p className="text-lg">This is the homepage of CodeDam.</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <PageViewTracker />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/playground" element={<Playground />} />
      </Routes>

      <ConfirmationModal />
      <ConfigModal />
      <SaveProjectModal />
      <LoadProjectModal />
      <AnalyticsConsentBanner />
    </Router>
  );
}

export default App
