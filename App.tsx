
import React, { useState, useEffect } from 'react';
import SkinViewer from './components/SkinViewer';
import ControlPanel from './components/ControlPanel';
import { SkinSettings, ModelType, CapeSuggestion } from './types';
import { DEFAULT_SKIN, DEFAULT_CAPE } from './constants';
import { analyzeSkinAndSuggestCape } from './services/geminiService';
import { Package, Github, Twitter, Layers } from 'lucide-react';

const App: React.FC = () => {
  const [settings, setSettings] = useState<SkinSettings>({
    skinUrl: DEFAULT_SKIN,
    capeUrl: DEFAULT_CAPE,
    elytraEnabled: false,
    model: ModelType.CLASSIC,
    animationEnabled: true
  });

  const [suggestion, setSuggestion] = useState<CapeSuggestion | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const handleSuggest = async () => {
    setIsSuggesting(true);
    try {
      // Analyze current skin
      const result = await analyzeSkinAndSuggestCape(settings.skinUrl);
      setSuggestion(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/30">
      {/* Navbar */}
      <nav className="h-16 px-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">CapeVisualizer <span className="text-emerald-500">Pro</span></h1>
            <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">3D Real-time Render</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
          <a href="#" className="hover:text-emerald-400 transition-colors">Documentation</a>
          <a href="#" className="hover:text-emerald-400 transition-colors">Resources</a>
          <div className="h-4 w-px bg-zinc-800" />
          <div className="flex items-center gap-4">
            <Twitter className="w-4 h-4 hover:text-sky-400 cursor-pointer" />
            <Github className="w-4 h-4 hover:text-white cursor-pointer" />
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col lg:flex-row p-4 lg:p-8 gap-8 max-w-7xl mx-auto w-full">
        {/* Left Side: Viewer */}
        <div className="flex-1 min-h-[500px] flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Live Preview</span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSettings(prev => ({ ...prev, animationEnabled: !prev.animationEnabled }))}
                className="text-xs font-bold text-emerald-500 uppercase tracking-widest hover:underline"
              >
                {settings.animationEnabled ? 'Pause Engine' : 'Resume Engine'}
              </button>
            </div>
          </div>
          <SkinViewer settings={settings} />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
             <div className="p-4 bg-zinc-900/40 rounded-2xl border border-zinc-800">
               <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1">FPS</p>
               <p className="text-xl font-mono font-bold">60.0</p>
             </div>
             <div className="p-4 bg-zinc-900/40 rounded-2xl border border-zinc-800">
               <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Renderer</p>
               <p className="text-xl font-mono font-bold">GLSL</p>
             </div>
             <div className="p-4 bg-zinc-900/40 rounded-2xl border border-zinc-800">
               <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Model</p>
               <p className="text-xl font-mono font-bold uppercase">{settings.model}</p>
             </div>
             <div className="p-4 bg-zinc-900/40 rounded-2xl border border-zinc-800">
               <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Backgear</p>
               <p className="text-xl font-mono font-bold uppercase">{settings.elytraEnabled ? 'Elytra' : 'Cape'}</p>
             </div>
          </div>
        </div>

        {/* Right Side: Controls */}
        <aside className="lg:w-96 shrink-0">
          <ControlPanel 
            settings={settings} 
            setSettings={setSettings} 
            onSuggest={handleSuggest}
            suggestion={suggestion}
            isSuggesting={isSuggesting}
          />
        </aside>
      </main>

      <footer className="mt-auto border-t border-zinc-900 p-8 text-center text-zinc-600">
        <div className="flex items-center justify-center gap-4 mb-4">
          <Layers className="w-5 h-5" />
          <span className="text-sm font-medium">Built for the Minecraft Community</span>
        </div>
        <p className="text-xs">© 2024 CapeVisualizer Pro • Powered by WebGL & Gemini AI</p>
      </footer>
    </div>
  );
};

export default App;
