import { useRendererStore } from '@/store/rendererStore';
import { Camera, Crosshair, Video, ZoomIn, ZoomOut } from 'lucide-react';
import { MAX_ZOOM, MIN_ZOOM, ZOOM_STEP } from '@/core/config';

export function Controls() {
  const camera = useRendererStore((state) => state.camera);
  const mode = useRendererStore((state) => state.mode);
  const fps = useRendererStore((state) => state.fps);
  const joystick = useRendererStore((state) => state.joystick);
  const setMode = useRendererStore((state) => state.setMode);
  const setCamera = useRendererStore((state) => state.setCamera);

  const thetaWrapped = camera.theta % (2 * Math.PI);
  const thetaDeg = ((thetaWrapped * 180) / Math.PI).toFixed(1);
  const n = camera.n.toFixed(1);
  const m = camera.m.toFixed(1);

  return (
    <>
      {/* 左上角信息面板 */}
      <div className="glass-panel absolute left-4 top-4 rounded-xl p-4">
        <div className="mb-2 text-xs font-bold uppercase tracking-wider text-amber-400">
          摄像机状态
        </div>
        <div className="info-row">
          <span>n</span>
          <span className="value">{n}</span>
        </div>
        <div className="info-row">
          <span>m</span>
          <span className="value">{m}</span>
        </div>
        <div className="info-row">
          <span>θ</span>
          <span className="value">{thetaDeg}°</span>
        </div>
        <div className="info-row">
          <span>FPS</span>
          <span className="value">{fps}</span>
        </div>
        <div className="info-row">
          <span>zoom</span>
          <span className="value">{camera.zoom.toFixed(2)}x</span>
        </div>
        <div className="mt-2 text-[10px] text-slate-500">
          {mode === 'camera' ? '摄像机1视角' : mode === 'camera2' ? '摄像机2视角' : '调试视角'}
        </div>
      </div>

      {/* 右上角视角切换按钮 */}
      <button
        type="button"
        onClick={() => setMode(mode === 'camera' ? 'camera2' : mode === 'camera2' ? 'debug' : 'camera')}
        className={`control-btn absolute right-4 top-4 ${
          mode === 'debug' ? 'control-btn-accent' : ''
        }`}
        aria-label={mode === 'camera' ? '切换到摄像机2视角' : mode === 'camera2' ? '切换到调试视角' : '切换到摄像机1视角'}
      >
        {mode === 'camera' ? (
          <>
            <Video className="mr-2 h-5 w-5" />
            摄像机2
          </>
        ) : mode === 'camera2' ? (
          <>
            <Crosshair className="mr-2 h-5 w-5" />
            调试
          </>
        ) : (
          <>
            <Camera className="mr-2 h-5 w-5" />
            摄像机1
          </>
        )}
      </button>

      {/* 右上角缩放按钮 */}
      <div className="absolute right-4 top-20 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setCamera({ zoom: Math.min(MAX_ZOOM, camera.zoom * ZOOM_STEP) })}
          className="control-btn"
          aria-label="放大"
        >
          <ZoomIn className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => setCamera({ zoom: Math.max(MIN_ZOOM, camera.zoom / ZOOM_STEP) })}
          className="control-btn"
          aria-label="缩小"
        >
          <ZoomOut className="h-5 w-5" />
        </button>
      </div>

      {/* 左下角虚拟摇杆 */}
      <div className="pointer-events-none absolute bottom-6 left-6">
        <div className="joystick-base">
          <div
            className="joystick-handle"
            style={{
              transform: `translate(calc(-50% + ${joystick.dx * 34}px), calc(-50% + ${
                joystick.dy * 34
              }px))`,
              opacity: joystick.active ? 1 : 0.65,
            }}
          />
        </div>
      </div>

      {/* 底部中央操作提示 */}
      <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2">
        <div className="hint-pill hidden sm:flex">
          中央区域左右滑动旋转视角 · WASD / 摇杆移动
        </div>
        <div className="hint-pill flex sm:hidden">
          左下角摇杆移动 · 中央滑动旋转
        </div>
      </div>
    </>
  );
}
