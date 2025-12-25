
import React, { useEffect, useRef, useState } from 'react';
import { MagicCircleRenderer } from './MagicCircleRenderer';
import { SpellInfo } from '../types';

interface CameraViewProps {
  currentSpell: SpellInfo;
}

const CameraView: React.FC<CameraViewProps> = ({ currentSpell }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef(new MagicCircleRenderer());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // @ts-ignore
    const hands = new window.Hands({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    hands.onResults((results: any) => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Mirror the video drawing
      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        
        // Landmark 9 is the middle finger MCP
        // Since we mirrored the image above for display, we must also mirror the X-coordinate for rendering graphics on top
        const palmCenter = {
          x: (1 - landmarks[9].x) * canvas.width,
          y: landmarks[9].y * canvas.height
        };

        // Calculate radius based on pinch (landmark 4 - thumb, landmark 8 - index)
        const dx = (landmarks[4].x - landmarks[8].x) * canvas.width;
        const dy = (landmarks[4].y - landmarks[8].y) * canvas.height;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        const radius = Math.max(60, dist * 1.5);

        // Render the magic circle with the enhanced renderer
        rendererRef.current.draw(ctx, palmCenter, radius, currentSpell.color);
      } else {
        // Still need to call draw with high radius/fade if we want a trail, 
        // but for now we just clear when no hand is present.
      }
    });

    // @ts-ignore
    const camera = new window.Camera(video, {
      onFrame: async () => {
        await hands.send({ image: video });
      },
      width: 1280,
      height: 720,
    });

    camera.start().then(() => setIsLoaded(true));

    return () => {
      camera.stop();
      hands.close();
    };
  }, [currentSpell]);

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center mystic-border">
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black/90">
          <div className="relative w-24 h-24 mb-6">
             <div className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
             <div className="absolute inset-4 border-2 border-orange-300 border-b-transparent rounded-full animate-spin-slow" style={{ animationDuration: '3s' }}></div>
          </div>
          <p className="text-orange-400 font-serif italic text-2xl animate-pulse tracking-widest">OPENING DIMENSIONAL PORTAL...</p>
        </div>
      )}
      <video ref={videoRef} className="hidden" playsInline muted />
      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        className="max-w-full max-h-full object-contain rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5"
      />
      
      {/* Spell Text Overlay (No longer mirrored because canvas CSS flip was removed) */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center pointer-events-none z-10">
        <h2 
          className="text-4xl font-serif font-bold glow-text tracking-[0.3em] uppercase mb-2 drop-shadow-lg" 
          style={{ color: currentSpell.color }}
        >
          {currentSpell.name}
        </h2>
        <div className="h-0.5 w-48 bg-gradient-to-r from-transparent via-current to-transparent mx-auto mb-2" style={{ color: currentSpell.color }}></div>
        <p className="text-xl italic opacity-90 font-light tracking-wide" style={{ color: currentSpell.color }}>
          {currentSpell.incantation}
        </p>
      </div>
    </div>
  );
};

export default CameraView;
