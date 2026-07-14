import type { Camera } from '@/store/rendererStore';
import { FILM_WIDTH, FILM_HEIGHT } from './config';

/**
 * 将世界坐标 (x, y) 按斜二测公式变换到摄像机参考系 (u, v)。
 * 等价于：camera = rotate(-theta) * (world - cameraPos)
 */
export function worldToCamera(
  cam: Camera,
  x: number,
  y: number,
): [number, number] {
  const dx = x - cam.n;
  const dy = y - cam.m;
  const cos = Math.cos(cam.theta);
  const sin = Math.sin(cam.theta);
  const u = dx * cos + dy * sin;
  const v = -dx * sin + dy * cos;
  return [u, v];
}

/**
 * 摄像机参考系 (u, v) 反推世界坐标 (x, y)。
 * 等价于：world = cameraPos + rotate(theta) * camera
 */
export function cameraToWorld(
  cam: Camera,
  u: number,
  v: number,
): [number, number] {
  const cos = Math.cos(cam.theta);
  const sin = Math.sin(cam.theta);
  const x = cam.n + u * cos - v * sin;
  const y = cam.m + u * sin + v * cos;
  return [x, y];
}

/**
 * 计算摄像机胶片四个角对应的世界坐标包围盒。
 */
export function computeWorldBounds(cam: Camera): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} {
  const hw = FILM_WIDTH / 2;
  const hh = FILM_HEIGHT / 2;
  const corners: [number, number][] = [
    [-hw, -hh],
    [hw, -hh],
    [hw, hh],
    [-hw, hh],
  ];
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [u, v] of corners) {
    const [x, y] = cameraToWorld(cam, u, v);
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  return { minX, minY, maxX, maxY };
}

/**
 * 将摄像机局部速度 (du, dv) 转换为世界坐标系速度。
 * u 轴正方向对应世界 (cosθ, sinθ)；v 轴正方向对应世界 (-sinθ, cosθ)。
 */
export function cameraVelocityToWorld(
  cam: Camera,
  du: number,
  dv: number,
): [number, number] {
  const cos = Math.cos(cam.theta);
  const sin = Math.sin(cam.theta);
  const wx = du * cos - dv * sin;
  const wy = du * sin + dv * cos;
  return [wx, wy];
}
