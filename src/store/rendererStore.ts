import { create } from 'zustand';

export interface Camera {
  n: number;
  m: number;
  theta: number;
}

export interface JoystickState {
  active: boolean;
  dx: number;
  dy: number;
}

export type SpritePlane = 'xy' | 'xz' | 'yz';

export interface Sprite {
  id: string;
  plane: SpritePlane;
  x1: number;
  y1: number;
  z1: number;
  x2: number;
  y2: number;
  z2: number;
  texture: HTMLCanvasElement;
}

export type ViewMode = 'camera' | 'camera2' | 'debug';

interface RendererState {
  camera: Camera;
  mode: ViewMode;
  joystick: JoystickState;
  fps: number;
  setCamera: (camera: Partial<Camera>) => void;
  setMode: (mode: ViewMode) => void;
  setJoystick: (joystick: Partial<JoystickState>) => void;
  setFps: (fps: number) => void;
}

export const useRendererStore = create<RendererState>((set) => ({
  camera: { n: 0, m: 0, theta: 0 },
  mode: 'camera',
  joystick: { active: false, dx: 0, dy: 0 },
  fps: 0,
  setCamera: (camera) =>
    set((state) => ({ camera: { ...state.camera, ...camera } })),
  setMode: (mode) => set({ mode }),
  setJoystick: (joystick) =>
    set((state) => ({ joystick: { ...state.joystick, ...joystick } })),
  setFps: (fps) => set({ fps }),
}));
