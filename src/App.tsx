import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Playground from './pages/playground/Page';
import { ConfirmationModal } from './components/ConfirmationModal';
import { ConfigModal } from './components/ConfigModal';
import { SaveProjectModal } from './components/SaveProjectModal';
import { LoadProjectModal } from './components/LoadProjectModal';
import { PageViewTracker } from './analytics/PageViewTracker';
import { AnalyticsConsentBanner } from './components/AnalyticsConsentBanner';
import LandingPage from './LandingPage';

function App() {
  return (
    <Router>
      <PageViewTracker />

      <Routes>
        <Route path="/" element={<LandingPage />} />
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
