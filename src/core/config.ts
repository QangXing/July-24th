/**
 * 渲染器全局配置。
 * 修改此处即可调整胶片尺寸、贴图大小、移动速度等核心参数。
 */

/** 摄像机胶片宽度（像素） */
export const FILM_WIDTH = 900;
/** 摄像机胶片高度（像素） */
export const FILM_HEIGHT = 1500;

/** 单张大地图贴图尺寸（世界单位 = 像素） */
export const TILE_SIZE = 128;

/** 摄像机移动速度（世界单位/帧） */
export const MOVE_SPEED = 4;
/** 触摸/鼠标拖动旋转灵敏度（弧度/像素） */
export const ROTATE_SPEED = 0.004;

/** 虚拟摇杆底座半径（像素） */
export const JOYSTICK_RADIUS = 60;
/** 虚拟摇杆死区比例（0~1） */
export const JOYSTICK_DEADZONE = 0.12;

/** UI 状态同步间隔（毫秒） */
export const UI_UPDATE_INTERVAL = 100;
/** FPS 刷新间隔（毫秒） */
export const FPS_UPDATE_INTERVAL = 1000;

/** 像素比上限，避免高 DPR 设备渲染开销过大 */
export const MAX_DPR = 2;

/** 最小缩放倍率 */
export const MIN_ZOOM = 0.25;
/** 最大缩放倍率 */
export const MAX_ZOOM = 4;
/** 每次放大/缩小的倍率步长 */
export const ZOOM_STEP = 1.25;
