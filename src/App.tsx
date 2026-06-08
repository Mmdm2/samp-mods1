import { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoadingScreen from './components/LoadingScreen';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AIChat from './pages/AIChat';
import ScriptBuilder from './pages/ScriptBuilder';
import SkinPack from './pages/SkinPack';
import FistIconMaker from './pages/FistIconMaker';
import TXDEditor from './pages/TXDEditor';
import Timecycle from './pages/Timecycle';
import MapColorizer from './pages/MapColorizer';
import ModBuilder from './pages/ModBuilder';
import VoiceChat from './pages/VoiceChat';
import RoadTextures from './pages/RoadTextures';
import ImageEditor from './pages/ImageEditor';
import WeaponDat from './pages/WeaponDat';
import ServerBrowser from './pages/ServerBrowser';
import Tutorial from './pages/Tutorial';
import Explore from './pages/Explore';
import ModStore from './pages/ModStore';
import ModUpload from './pages/ModUpload';
import Leaderboard from './pages/Leaderboard';
import PackStore from './pages/PackStore';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-400 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full border-4 border-orange-500 border-t-transparent animate-spin mx-auto" />
          <p className="font-orbitron text-orange-500 text-sm tracking-widest animate-pulse">LOADING...</p>
          <p className="text-gray-600 text-xs font-rajdhani">@XchoR MMD</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/ai-chat" element={<AIChat />} />
        <Route path="/script-builder" element={<ScriptBuilder />} />
        <Route path="/skin-pack" element={<SkinPack />} />
        <Route path="/fist-icon" element={<FistIconMaker />} />
        <Route path="/txd-editor" element={<TXDEditor />} />
        <Route path="/timecycle" element={<Timecycle />} />
        <Route path="/map-colorizer" element={<MapColorizer />} />
        <Route path="/mod-builder" element={<ModBuilder />} />
        <Route path="/voice-chat" element={<VoiceChat />} />
        <Route path="/road-textures" element={<RoadTextures />} />
        <Route path="/image-editor" element={<ImageEditor />} />
        <Route path="/weapon-dat" element={<WeaponDat />} />
        <Route path="/server-browser" element={<ServerBrowser />} />
        <Route path="/tutorial" element={<Tutorial />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/mod-store" element={<ModStore />} />
        <Route path="/mod-upload" element={<ModUpload />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/pack-store" element={<PackStore />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  const [showLoading, setShowLoading] = useState(true);
  const handleLoadingDone = useCallback(() => setShowLoading(false), []);

  return (
    <BrowserRouter>
      <AuthProvider>
        {showLoading && <LoadingScreen onDone={handleLoadingDone} />}
        {!showLoading && <AppRoutes />}
      </AuthProvider>
    </BrowserRouter>
  );
}
