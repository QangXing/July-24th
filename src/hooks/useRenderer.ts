import { useEffect, useRef, useCallback } from 'react';
import { useRendererStore } from '@/store/rendererStore';
import type { Camera } from '@/store/rendererStore';
import { FILM_WIDTH, FILM_HEIGHT, TILE_SIZE } from '@/core/config';
import { createTileTexture } from '@/core/render/tileTexture';
import { createPointerHandlers, subscribeKeyboard } from '@/core/input';
import type { PointerState } from '@/core/input';
import { initScreenCanvas, startRenderLoop } from '@/core/loop';
import { createSampleSprites } from '@/core/sprite';
import { loadWorldSprites } from '@/core/worldLoader';

export function useRenderer(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const mode = useRendererStore((state) => state.mode);
  const joystick = useRendererStore((state) => state.joystick);

  const filmCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const filmCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const tilePatternRef = useRef<CanvasPattern | null>(null);
  const tileCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const spritesRef = useRef(createSampleSprites());
  const worldLoadedRef = useRef(false);

  const keysRef = useRef<Record<string, boolean>>({});
  const pointerRef = useRef<PointerState | null>(null);
  const joystickCenterRef = useRef({ x: 90, y: 0 });

  const cameraRef = useRef<Camera>(useRendererStore.getState().camera);
  const modeRef = useRef(mode);
  const joystickRef = useRef(joystick);

  // 保持 refs 与 store 同步
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    joystickRef.current = joystick;
  }, [joystick]);

  // 初始化离屏胶片与贴图
  useEffect(() => {
    const film = document.createElement('canvas');
    film.width = FILM_WIDTH;
    film.height = FILM_HEIGHT;
    const filmCtx = film.getContext('2d', { alpha: false });
    if (!filmCtx) return;
    filmCanvasRef.current = film;
    filmCtxRef.current = filmCtx;

    const tileCanvas = createTileTexture(TILE_SIZE);
    tileCanvasRef.current = tileCanvas;
    const pattern = filmCtx.createPattern(tileCanvas, 'repeat');
    if (pattern) tilePatternRef.current = pattern;

    // 加载世界存档精灵并合并到 spritesRef
    (async () => {
      if (worldLoadedRef.current) return;
      worldLoadedRef.current = true;
      try {
        const worldSprites = await loadWorldSprites('/world/world.txt');
        if (worldSprites.length > 0) {
          spritesRef.current = [...spritesRef.current, ...worldSprites];
        }
      } catch (err) {
        console.warn('[WorldLoader] 加载世界存档失败:', err);
      }
    })();
  }, []);

  // 屏幕 canvas 尺寸管理 + 动画循环
  useEffect(() => {
    const canvas = canvasRef.current;
    const filmCanvas = filmCanvasRef.current;
    const filmCtx = filmCtxRef.current;
    const tilePattern = tilePatternRef.current;
    if (!canvas || !filmCanvas || !filmCtx || !tilePattern) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const unsubscribeResize = initScreenCanvas(canvas, ctx);
    const unsubscribeKeyboard = subscribeKeyboard(keysRef);

    const cancelLoop = startRenderLoop(
      {
        canvas,
        ctx,
        filmCanvas,
        filmCtx,
        tilePattern,
        spritesRef,
        cameraRef,
        keysRef,
        joystickRef,
        pointerRef,
      },
      modeRef,
    );

    return () => {
      unsubscribeResize();
      unsubscribeKeyboard();
      cancelLoop();
    };
  }, [canvasRef]);

  // 更新摇杆中心（左下角）
  const updateJoystickCenter = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    joystickCenterRef.current = {
      x: 90,
      y: canvas.clientHeight - 90,
    };
  }, [canvasRef]);

  useEffect(() => {
    updateJoystickCenter();
  }, [updateJoystickCenter]);

  const pointerHandlers = createPointerHandlers({
    pointerRef,
    joystickCenterRef,
    setJoystick: useRendererStore.getState().setJoystick,
    getCanvas: () => canvasRef.current,
  });

  return pointerHandlers;
}
