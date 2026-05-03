import { BrowserRouter, Routes, Route} from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import WhiteboardPage from './pages/WhiteboardPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/board/:roomId" element={<WhiteboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
