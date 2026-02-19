
import React, { useEffect, useRef, useState } from 'react';
import * as skinview3d from 'skinview3d';
import { SkinSettings } from '../types';

interface SkinViewerProps {
  settings: SkinSettings;
}

const SkinViewer: React.FC<SkinViewerProps> = ({ settings }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewerRef = useRef<skinview3d.SkinViewer | null>(null);
  const [loading, setLoading] = useState(true);

  const resolveUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith('data:') || url.startsWith('blob:')) return url;
    if (url.includes('namemc.com') || url.includes('minecraft.net')) {
      return `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    }
    return url;
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    try {
      const viewer = new skinview3d.SkinViewer({
        canvas: canvasRef.current,
        width: canvasRef.current.parentElement?.clientWidth || 400,
        height: canvasRef.current.parentElement?.clientHeight || 500,
      });

      viewerRef.current = viewer;
      viewer.controls.enableRotate = true;
      viewer.controls.enableZoom = true;
      viewer.controls.enablePan = false;

      if (viewer.animations && typeof viewer.animations.add === 'function') {
        const walk = viewer.animations.add(skinview3d.WalkingAnimation);
        walk.speed = 0.6;
      }

      setLoading(false);

      return () => {
        viewer.dispose();
      };
    } catch (err) {
      console.error("Failed to initialize SkinViewer:", err);
    }
  }, []);

  useEffect(() => {
    const updateVisuals = async () => {
      if (!viewerRef.current) return;
      const viewer = viewerRef.current;

      try {
        const resolvedSkin = resolveUrl(settings.skinUrl);
        if (resolvedSkin) {
          await viewer.loadSkin(resolvedSkin, { model: settings.model as any });
        }

        const resolvedCape = resolveUrl(settings.capeUrl);
        if (resolvedCape) {
          await viewer.loadCape(resolvedCape, { 
            backEquipment: settings.elytraEnabled ? 'elytra' : 'cape' 
          });
        } else {
          viewer.loadCape(null);
        }

        if (viewer.animations) {
          viewer.animations.paused = !settings.animationEnabled;
        }
      } catch (err) {
        console.warn("Error updating textures in SkinViewer:", err);
      }
    };

    updateVisuals();
  }, [settings]);

  useEffect(() => {
    const handleResize = () => {
      if (viewerRef.current && canvasRef.current?.parentElement) {
        const parent = canvasRef.current.parentElement;
        viewerRef.current.setSize(parent.clientWidth, parent.clientHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-zinc-900/50 rounded-2xl overflow-hidden relative border border-zinc-800 shadow-2xl">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Initializing Engine...</p>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} className="cursor-grab active:cursor-grabbing" />
      <div className="absolute bottom-4 left-4 text-[10px] text-zinc-500 font-mono flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        RENDER: WEBGL2_CORE
      </div>
    </div>
  );
};

export default SkinViewer;
