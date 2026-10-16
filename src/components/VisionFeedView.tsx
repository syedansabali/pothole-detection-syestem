import React, { useState, useEffect, useRef } from 'react';
import demoRoadVideo from '../assets/images/road_video.mp4';
import { alertBuzzer } from '../utils/Alert';

interface VisionFeedViewProps {
  onTriggerAlarm?: () => void;
  onHazardDetected?: (hazard: {
    type: string;
    severity: 'critical' | 'high' | 'medium';
    confidence: number;
    depth: number;
    evidenceImage?: string;
  }) => void;
}

export const VisionFeedView: React.FC<VisionFeedViewProps> = ({
  onTriggerAlarm,
  onHazardDetected,
}) => {
  const [engineActive, setEngineActive] = useState<boolean>(true);
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [fps, setFps] = useState<number>(29.8);
  const [latency, setLatency] = useState<number>(41);
  const [currentDistance, setCurrentDistance] = useState<number>(14.2);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hasTriggeredThisPass = useRef<boolean>(false);

  // Capture video frame to Base64 image
  const captureCurrentFrame = (): string => {
    if (!videoRef.current || !canvasRef.current) return '';
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 360;

    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.85);
  };

  // Video playback and detection loop
  useEffect(() => {
    let animFrame: number;

    const processLoop = () => {
      if (videoRef.current && engineActive) {
        const video = videoRef.current;
        const dur = video.duration || 10;
        const cur = video.currentTime % dur;

        // Monocular IPM distance simulation over video loop cycle
        const progress = (cur % 5) / 5; // resets every 5 seconds
        const distance = Number((18.0 - progress * 15.5).toFixed(1)); // 18m down to ~2.5m
        setCurrentDistance(distance);

        // Critical Proximity Warning Zone (<= 6m)
        if (distance <= 6.0) {
          setShowWarning(true);

          // 1. Play audible buzzer chime
          if (!isMuted) {
            alertBuzzer.playCollisionWarning();
          }

          // 2. Trigger parent alarm callback if present
          onTriggerAlarm?.();

          // 3. Auto-log hazard snapshot once per detection approach
          if (!hasTriggeredThisPass.current && distance <= 5.5) {
            hasTriggeredThisPass.current = true;
            const snapshot = captureCurrentFrame();

            onHazardDetected?.({
              type: 'POTHOLE_CRITICAL',
              severity: 'critical',
              confidence: 94,
              depth: 14.5,
              evidenceImage: snapshot,
            });
          }
        } else {
          setShowWarning(false);
          if (distance > 12.0) {
            hasTriggeredThisPass.current = false;
          }
        }
      }

      animFrame = requestAnimationFrame(processLoop);
    };

    animFrame = requestAnimationFrame(processLoop);
    return () => cancelAnimationFrame(animFrame);
  }, [engineActive, isMuted, onHazardDetected, onTriggerAlarm]);

  // Telemetry jitter simulator for realistic AI perception
  useEffect(() => {
    const timer = setInterval(() => {
      setFps(Number((29.2 + Math.random() * 1.4).toFixed(1)));
      setLatency(Math.floor(38 + Math.random() * 8));
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-4 select-none">
      {/* Hidden processing canvas for frame grabbing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Telemetry Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#16181c] border border-[#414754] p-3 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                engineActive ? 'bg-[#4ae183] animate-pulse' : 'bg-[#ffb4ab]'
              }`}
            />
            <span className="font-mono text-xs font-bold tracking-wider text-[#adc7ff]">
              YOLO_V8n_ROAD_VISION
            </span>
          </div>
          <span className="text-[11px] font-mono text-[#8b90a0] border-l border-[#414754] pl-3">
            FPS: <strong className="text-white">{fps}</strong> | LATENCY:{' '}
            <strong className="text-white">{latency}ms</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Mute/Unmute Toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`px-3 py-1 text-xs font-mono rounded border flex items-center gap-1.5 transition-all cursor-pointer ${
              isMuted
                ? 'bg-[#22252a] text-[#ffb4ab] border-[#ffb4ab]/40'
                : 'bg-[#1e2023] text-[#4ae183] border-[#4ae183]/40'
            }`}
            title="Toggle Audible Warning"
          >
            <span className="material-symbols-outlined text-sm">
              {isMuted ? 'volume_off' : 'volume_up'}
            </span>
            {isMuted ? 'MUTED' : 'BUZZER: ON'}
          </button>

          {/* Engine Active Toggle */}
          <button
            onClick={() => setEngineActive(!engineActive)}
            className="px-3 py-1 bg-[#1e2023] hover:bg-[#282a2d] border border-[#414754] text-[#e2e2e6] text-xs font-mono rounded cursor-pointer transition-colors"
          >
            {engineActive ? 'PAUSE INFERENCE' : 'RESUME'}
          </button>
        </div>
      </div>

      {/* Main Video Viewport */}
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-[#414754] shadow-2xl flex items-center justify-center">
        <video
          ref={videoRef}
          src={demoRoadVideo}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />

        {/* HUD Targeting Overlay */}
        <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start font-mono text-[11px] text-[#adc7ff] bg-black/40 p-2 rounded backdrop-blur-sm border border-white/10 max-w-xs">
            <div>
              <div>OPTICAL SENSOR: CAM_01_FRONT</div>
              <div>FOV: 110° WIDE ANGLE</div>
              <div>RANGE MODEL: MONOCULAR IPM</div>
            </div>
            <div className="text-right">
              <div>EST DIST: {currentDistance}m</div>
              <div className="text-amber-400">DEPTH: 14.5cm</div>
            </div>
          </div>

          {/* Dynamic Collision Warning Banner */}
          {showWarning && (
            <div className="self-center bg-red-600/90 text-white px-6 py-2 rounded-full border-2 border-red-300 font-bold font-mono tracking-widest text-sm sm:text-base flex items-center gap-2 animate-bounce shadow-2xl backdrop-blur-md">
              <span className="material-symbols-outlined text-xl">warning</span>
              COLLISION HAZARD: {currentDistance}M
            </div>
          )}

          {/* Simulated AI Detection Bounding Box */}
          {showWarning && (
            <div
              className="absolute border-2 border-red-500 rounded bg-red-500/20 flex items-start justify-between p-1 transition-all duration-100"
              style={{
                width: '180px',
                height: '90px',
                bottom: '22%',
                left: '42%',
              }}
            >
              <span className="bg-red-600 text-white font-mono text-[9px] px-1 font-bold rounded">
                POTHOLE (94%)
              </span>
              <span className="font-mono text-[9px] text-white font-bold bg-black/60 px-1 rounded">
                {currentDistance}m
              </span>
            </div>
          )}

          <div className="flex justify-between items-end font-mono text-[10px] text-[#8b90a0]">
            <div>N-120 MIRPURKHAS HIGHWAY SEGMENT</div>
            <div>RECORDING LIVE TELEMETRY</div>
          </div>
        </div>
      </div>
    </div>
  );
};