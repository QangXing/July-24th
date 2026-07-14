import { FILM_WIDTH, FILM_HEIGHT } from '../config';

let cached: HTMLCanvasElement | null = null;

/**
 * 获取缓存的暗角+扫描线叠加层。
 * 尺寸会随 FILM_WIDTH/FILM_HEIGHT 变化自动重建。
 */
export function getVignetteCanvas(): HTMLCanvasElement {
  if (cached && cached.width === FILM_WIDTH && cached.height === FILM_HEIGHT) {
    return cached;
  }

  const canvas = document.createElement('canvas');
  canvas.width = FILM_WIDTH;
  canvas.height = FILM_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const w = FILM_WIDTH;
  const h = FILM_HEIGHT;

  // 暗角
  const grad = ctx.createRadialGradient(
    w / 2,
    h / 2,
    Math.min(w, h) * 0.35,
    w / 2,
    h / 2,
    Math.min(w, h) * 0.75,
  );
  grad.addColorStop(0, 'rgba(15, 23, 42, 0)');
  grad.addColorStop(1, 'rgba(15, 23, 42, 0.45)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // 细微扫描线，间隔 6 像素以减少绘制量
  ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
  for (let y = 0; y < h; y += 6) {
    ctx.fillRect(0, y, w, 1);
  }

  cached = canvas;
  return cached;
}
