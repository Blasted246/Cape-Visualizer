
import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Settings2, 
  Zap, 
  RotateCcw, 
  Layers, 
  Wind,
  Info,
  Sparkles,
  Eye,
  RefreshCw
} from 'lucide-react';
import { SkinSettings, ModelType, CapeSuggestion } from '../types';

interface ControlPanelProps {
  settings: SkinSettings;
  setSettings: React.Dispatch<React.SetStateAction<SkinSettings>>;
  onSuggest: () => void;
  suggestion: CapeSuggestion | null;
  isSuggesting: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  settings, 
  setSettings, 
  onSuggest, 
  suggestion,
  isSuggesting 
}) => {
  const [isWatching, setIsWatching] = useState(false);
  const watchIntervalRef = useRef<number | null>(null);
  const lastModifiedRef = useRef<number>(0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'skin' | 'cape') => {
    const file = e.target.files?.[0];
    if (file) {
      stopWatching();
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        if (type === 'skin') {
          setSettings(prev => ({ ...prev, skinUrl: url }));
        } else {
          setSettings(prev => ({ ...prev, capeUrl: url }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const stopWatching = () => {
    if (watchIntervalRef.current) {
      window.clearInterval(watchIntervalRef.current);
      watchIntervalRef.current = null;
    }
    setIsWatching(false);
  };

  const startWatchingLocalFile = async () => {
    try {
      // @ts-ignore - File System Access API
      const [fileHandle] = await window.showOpenFilePicker({
        types: [{
          description: 'Minecraft Cape PNG',
          accept: { 'image/png': ['.png'] }
        }],
        multiple: false
      });

      if (!fileHandle) return;

      stopWatching();
      setIsWatching(true);

      const checkFile = async () => {
        const file = await fileHandle.getFile();
        if (file.lastModified !== lastModifiedRef.current) {
          lastModifiedRef.current = file.lastModified;
          const reader = new FileReader();
          reader.onload = (e) => {
            const url = e.target?.result as string;
            setSettings(prev => ({ ...prev, capeUrl: url }));
          };
          reader.readAsDataURL(file);
        }
      };

      // Initial check
      await checkFile();

      // Poll for changes every 500ms
      watchIntervalRef.current = window.setInterval(checkFile, 500);
    } catch (err) {
      console.warn('File selection cancelled or not supported:', err);
      setIsWatching(false);
    }
  };

  useEffect(() => {
    return () => stopWatching();
  }, []);

  const toggleElytra = () => {
    setSettings(prev => ({ ...prev, elytraEnabled: !prev.elytraEnabled }));
  };

  const toggleModel = () => {
    setSettings(prev => ({ 
      ...prev, 
      model: prev.model === ModelType.CLASSIC ? ModelType.SLIM : ModelType.CLASSIC 
    }));
  };

  const toggleAnimation = () => {
    setSettings(prev => ({ ...prev, animationEnabled: !prev.animationEnabled }));
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-md bg-zinc-950 p-6 rounded-3xl border border-zinc-800 shadow-xl overflow-y-auto max-h-[calc(100vh-4rem)]">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 bg-emerald-500/10 rounded-lg">
          <Settings2 className="w-5 h-5 text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold tracking-tight">Viewer Controls</h2>
      </div>

      {/* Model & View Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-colors">
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-zinc-400" />
            <div>
              <p className="text-sm font-medium">Player Model</p>
              <p className="text-xs text-zinc-500">{settings.model === ModelType.CLASSIC ? '4px Arms (Classic)' : '3px Arms (Slim)'}</p>
            </div>
          </div>
          <button 
            onClick={toggleModel}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-full text-xs font-semibold transition-all active:scale-95"
          >
            Switch
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-colors">
          <div className="flex items-center gap-3">
            <Wind className="w-5 h-5 text-zinc-400" />
            <div>
              <p className="text-sm font-medium">Elytra Mode</p>
              <p className="text-xs text-zinc-500">{settings.elytraEnabled ? 'Active' : 'Disabled'}</p>
            </div>
          </div>
          <button 
            onClick={toggleElytra}
            className={`w-12 h-6 rounded-full transition-all relative ${settings.elytraEnabled ? 'bg-emerald-500' : 'bg-zinc-700'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.elytraEnabled ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      </div>

      {/* Uploads Section */}
      <div className="space-y-4 pt-4 border-t border-zinc-800">
        <label className="block">
          <span className="text-sm font-semibold text-zinc-400 mb-2 block">Player Skin</span>
          <div className="relative group">
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => handleFileUpload(e, 'skin')}
              className="hidden" 
              id="skin-upload" 
            />
            <label 
              htmlFor="skin-upload"
              className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-zinc-800 rounded-2xl hover:border-emerald-500/50 hover:bg-emerald-500/5 cursor-pointer transition-all"
            >
              <Upload className="w-5 h-5 text-zinc-500 group-hover:text-emerald-400" />
              <span className="text-sm text-zinc-400 group-hover:text-emerald-300 font-medium">Upload PNG...</span>
            </label>
          </div>
        </label>

        <div>
          <span className="text-sm font-semibold text-zinc-400 mb-2 block">Cape Control</span>
          <div className="flex flex-col gap-2">
            <button 
              onClick={startWatchingLocalFile}
              className={`flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed rounded-2xl transition-all ${isWatching ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-zinc-800 hover:border-sky-500/50 hover:bg-sky-500/5 text-zinc-400'}`}
            >
              {isWatching ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Eye className="w-5 h-5" />}
              <span className="text-sm font-medium">{isWatching ? 'Watching for changes...' : 'Watch Local Cape File'}</span>
            </button>
            
            <div className="relative group">
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => handleFileUpload(e, 'cape')}
                className="hidden" 
                id="cape-upload" 
              />
              <label 
                htmlFor="cape-upload"
                className="flex items-center justify-center gap-2 w-full p-3 bg-zinc-900 rounded-xl hover:bg-zinc-800 cursor-pointer transition-all border border-zinc-800"
              >
                <Upload className="w-4 h-4 text-zinc-500" />
                <span className="text-xs text-zinc-400 font-medium">Static Upload</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* AI Suggestions Section */}
      <div className="pt-4 border-t border-zinc-800">
        <button 
          onClick={onSuggest}
          disabled={isSuggesting}
          className="flex items-center justify-center gap-2 w-full p-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {isSuggesting ? (
             <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <Sparkles className="w-5 h-5 transition-transform group-hover:rotate-12" />
          )}
          {isSuggesting ? 'Analyzing Skin...' : 'Get AI Cape Suggestion'}
        </button>

        {suggestion && (
          <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-emerald-300">{suggestion.name}</h3>
            </div>
            <p className="text-xs text-emerald-100/70 leading-relaxed mb-3">
              {suggestion.description}
            </p>
            <div className="flex gap-1.5 items-center">
              <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 mr-1">Palette:</span>
              {suggestion.colorPalette.map((color, i) => (
                <div 
                  key={i} 
                  className="w-4 h-4 rounded border border-white/10" 
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto flex items-center gap-2 text-[10px] text-zinc-500 uppercase tracking-widest font-bold opacity-50">
        <Info className="w-3 h-3" />
        Watching works with Chromium-based browsers
      </div>
    </div>
  );
};

export default ControlPanel;
