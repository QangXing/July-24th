/**
 * 大世界存档加载器。
 *
 * 存档文件格式（每行一个精灵）：
 *   (x1,y1,z1) (x2,y2,z2) image.png
 *
 * 坐标必须满足 xy / xz / yz 平面对齐（即有两个坐标分量相同）。
 * 贴图不拉伸：按最大边对齐，另一方向居中，剩余区域透明。
 */

import type { Sprite, SpritePlane } from '@/core/sprite';

interface WorldEntry {
  x1: number;
  y1: number;
  z1: number;
  x2: number;
  y2: number;
  z2: number;
  imageSrc: string;
}

function parseLine(line: string): WorldEntry | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return null;

  const m = trimmed.match(
    /\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)\s*\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)\s+(\S+)/,
  );
  if (!m) return null;

  return {
    x1: parseFloat(m[1]),
    y1: parseFloat(m[2]),
    z1: parseFloat(m[3]),
    x2: parseFloat(m[4]),
    y2: parseFloat(m[5]),
    z2: parseFloat(m[6]),
    imageSrc: m[7],
  };
}

function detectPlane(e: WorldEntry): SpritePlane | null {
  if (e.z1 === e.z2 && (e.x1 !== e.x2 || e.y1 !== e.y2)) return 'xy';
  if (e.y1 === e.y2 && (e.x1 !== e.x2 || e.z1 !== e.z2)) return 'xz';
  if (e.x1 === e.x2 && (e.y1 !== e.y2 || e.z1 !== e.z2)) return 'yz';
  return null;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`无法加载图片: ${src}`));
    img.src = src;
  });
}

/**
 * 将一张图片绘制到与坐标矩形等大的画布上。
 * 按最大边对齐（不拉伸），另一方向居中，剩余区域透明。
 */
function createAlignedTexture(
  img: HTMLImageElement,
  worldW: number,
  worldH: number,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(worldW));
  canvas.height = Math.max(1, Math.round(worldH));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('无法创建 2D 上下文');

  const imgAspect = img.width / img.height;
  const worldAspect = worldW / worldH;

  let drawW: number;
  let drawH: number;
  let offsetX = 0;
  let offsetY = 0;

  if (imgAspect > worldAspect) {
    // 图片更宽 → 宽度对齐
    drawW = worldW;
    drawH = worldW / imgAspect;
    offsetY = (worldH - drawH) / 2;
  } else {
    // 图片更高 → 高度对齐
    drawH = worldH;
    drawW = worldH * imgAspect;
    offsetX = (worldW - drawW) / 2;
  }

  ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
  return canvas;
}

async function entryToSprite(
  entry: WorldEntry,
  basePath: string,
): Promise<Sprite | null> {
  const plane = detectPlane(entry);
  if (!plane) return null;

  const img = await loadImage(`${basePath}${entry.imageSrc}`);

  let worldW: number;
  let worldH: number;
  if (plane === 'xy') {
    worldW = Math.abs(entry.x2 - entry.x1);
    worldH = Math.abs(entry.y2 - entry.y1);
  } else if (plane === 'xz') {
    worldW = Math.abs(entry.x2 - entry.x1);
    worldH = Math.abs(entry.z2 - entry.z1);
  } else {
    worldW = Math.abs(entry.y2 - entry.y1);
    worldH = Math.abs(entry.z2 - entry.z1);
  }

  const texture = createAlignedTexture(img, worldW, worldH);

  return {
    id: `${entry.imageSrc}-${entry.x1},${entry.y1},${entry.z1}`,
    plane,
    x1: entry.x1,
    y1: entry.y1,
    z1: entry.z1,
    x2: entry.x2,
    y2: entry.y2,
    z2: entry.z2,
    texture,
  };
}

/**
 * 加载世界存档文件，返回精灵列表。
 * @param worldFilePath 存档文件路径（相对于 public 目录），如 '/world/world.txt'
 */
export async function loadWorldSprites(
  worldFilePath: string,
): Promise<Sprite[]> {
  const basePath = worldFilePath.substring(0, worldFilePath.lastIndexOf('/') + 1);

  let text: string;
  try {
    const resp = await fetch(worldFilePath);
    if (!resp.ok) return [];
    text = await resp.text();
  } catch {
    return [];
  }

  const entries: WorldEntry[] = [];
  for (const line of text.split('\n')) {
    const entry = parseLine(line);
    if (entry) entries.push(entry);
  }

  const sprites: Sprite[] = [];
  for (const entry of entries) {
    try {
      const sprite = await entryToSprite(entry, basePath);
      if (sprite) sprites.push(sprite);
    } catch (err) {
      console.warn(`[WorldLoader] 跳过 ${entry.imageSrc}:`, err);
    }
  }

  return sprites;
}
