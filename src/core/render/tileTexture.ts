export function createTileTexture(size = 64): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('无法创建 2D 上下文');
  }

  const cx = size / 2;
  const cy = size / 2;

  // 基础灰底
  ctx.fillStyle = '#6b7280';
  ctx.fillRect(0, 0, size, size);

  // 内嵌式边框，营造工业地砖厚度
  ctx.fillStyle = '#4b5563';
  ctx.fillRect(2, 2, size - 4, size - 4);
  ctx.fillStyle = '#6b7280';
  ctx.fillRect(4, 4, size - 8, size - 8);

  // 中央六边形
  ctx.fillStyle = '#9ca3af';
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 2;
  drawHexagon(ctx, cx, cy, size * 0.26);
  ctx.fill();
  ctx.stroke();

  // 六边形内部高光
  ctx.fillStyle = '#d1d5db';
  drawHexagon(ctx, cx, cy, size * 0.12);
  ctx.fill();

  // 四角螺丝/铆钉细节
  const cornerInset = size * 0.18;
  const rivetRadius = size * 0.055;
  const corners = [
    [cornerInset, cornerInset],
    [size - cornerInset, cornerInset],
    [cornerInset, size - cornerInset],
    [size - cornerInset, size - cornerInset],
  ] as const;
  for (const [rx, ry] of corners) {
    const grad = ctx.createRadialGradient(
      rx - rivetRadius * 0.3,
      ry - rivetRadius * 0.3,
      rivetRadius * 0.2,
      rx,
      ry,
      rivetRadius,
    );
    grad.addColorStop(0, '#d1d5db');
    grad.addColorStop(1, '#374151');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(rx, ry, rivetRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  // 细外框
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, size, size);

  return canvas;
}

function drawHexagon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
): void {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}
