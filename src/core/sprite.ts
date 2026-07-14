/**
 * 伪 3D 精灵/贴图系统。
 *
 * 每个 Sprite 由两个对角世界坐标确定一个矩形，并平行于三个坐标平面之一：
 * - 'xy'：地面/水平面（z 为高度）
 * - 'xz'：东西向竖直墙面（y 固定）
 * - 'yz'：南北向竖直墙面（x 固定）
 *
 * z 表示世界“高度”坐标，投影时会随 θ 一起旋转，最终表现为屏幕上的上下偏移。
 */

export type SpritePlane = 'xy' | 'xz' | 'yz';

export interface Sprite {
  id: string;
  plane: SpritePlane;
  /** 对角顶点 1 */
  x1: number;
  y1: number;
  z1: number;
  /** 对角顶点 2 */
  x2: number;
  y2: number;
  z2: number;
  /** 贴图 */
  texture: HTMLCanvasElement;
}

/**
 * 根据平面类型和两对角点，计算矩形的 4 个世界坐标顶点（按顺时针/逆时针顺序）。
 */
export function getSpriteCorners(sprite: Sprite): [number, number, number][] {
  const { plane, x1, y1, z1, x2, y2, z2 } = sprite;

  if (plane === 'xy') {
    return [
      [x1, y1, z1],
      [x2, y1, z1],
      [x2, y2, z1],
      [x1, y2, z1],
    ];
  }

  if (plane === 'xz') {
    return [
      [x1, y1, z1],
      [x2, y1, z1],
      [x2, y1, z2],
      [x1, y1, z2],
    ];
  }

  // yz
  return [
    [x1, y1, z1],
    [x1, y2, z1],
    [x1, y2, z2],
    [x1, y1, z2],
  ];
}

/**
 * 创建一个带简单图案的可复用贴图画布。
 */
export function createSpriteTexture(
  width: number,
  height: number,
  color: string,
  pattern: 'brick' | 'panel' | 'grass' = 'panel',
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.floor(width));
  canvas.height = Math.max(1, Math.floor(height));
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('无法创建 2D 上下文');
  }

  // 底色
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (pattern === 'brick') {
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 2;
    const bh = Math.floor(canvas.height / 4);
    for (let y = 0; y < canvas.height; y += bh) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    const bw = Math.floor(canvas.width / 3);
    for (let x = 0; x < canvas.width; x += bw) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
  } else if (pattern === 'grass') {
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const w = 2 + Math.random() * 4;
      const h = 4 + Math.random() * 10;
      ctx.fillRect(x, y, w, h);
    }
  } else {
    // panel：内嵌边框 + 中心高光
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(4, 4, canvas.width - 8, canvas.height - 8);
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(8, 8, canvas.width - 16, canvas.height - 16);
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
  }

  return canvas;
}

/**
 * 创建一组示例精灵，方便直接观察三种平面效果。
 */
export function createSampleSprites(): Sprite[] {
  const sprites: Sprite[] = [];

  // 地面平台：xy 平面，z=0
  sprites.push({
    id: 'platform-1',
    plane: 'xy',
    x1: -64,
    y1: -64,
    z1: 4,
    x2: 64,
    y2: 64,
    z2: 4,
    texture: createSpriteTexture(128, 128, '#475569', 'panel'),
  });

  // 东西墙：xz 平面，位于 y=64
  sprites.push({
    id: 'wall-xz',
    plane: 'xz',
    x1: -64,
    y1: 64,
    z1: 0,
    x2: 64,
    y2: 64,
    z2: 128,
    texture: createSpriteTexture(128, 128, '#92400e', 'brick'),
  });

  // 南北墙：yz 平面，位于 x=-64
  sprites.push({
    id: 'wall-yz',
    plane: 'yz',
    x1: -64,
    y1: -64,
    z1: 0,
    x2: -64,
    y2: 64,
    z2: 128,
    texture: createSpriteTexture(128, 128, '#1d4ed8', 'brick'),
  });

  // 悬浮小方块：xy 平面，z=96
  sprites.push({
    id: 'floating-xy',
    plane: 'xy',
    x1: 96,
    y1: -48,
    z1: 96,
    x2: 160,
    y2: 16,
    z2: 96,
    texture: createSpriteTexture(64, 64, '#15803d', 'grass'),
  });

  return sprites;
}
