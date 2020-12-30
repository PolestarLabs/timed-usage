import { Canvas, Image, CanvasRenderingContext2D } from "canvas"
import { CanvasTextWrapperOptions } from "canvas-text-wrapper"

interface Stroke {
  line: number;
  style: string;
}

interface PictoImage {
  item: Canvas;
  height: number;
  width: number;
}

export default interface Picto {
  new: (w?: number, h?: number) => Canvas;
  getCanvas: (...args: any[]) => Promise<Canvas | Image>;
  getFullCanvas: (...args: any[]) => Promise<Canvas | Image>;
  tag: (ctx: CanvasRenderingContext2D, text?: string | number, font?: string, color?: string, stroke?: Stroke) => PictoImage;
  tagMoji: (ctx: CanvasRenderingContext2D, text?: string | number, font?: string, color?: string, stroke?: Stroke) => PictoImage;
  block: (ctx: CanvasRenderingContext2D, text?: string | number, font?: string, color?: string, W?: number, H?: number, options?: CanvasTextWrapperOptions) => PictoImage;
  avgColor: (link: string | Buffer, blockSize?: number) => string;
  roundRect: (ctx: CanvasRenderingContext2D, x?: number, y?: number, width?: number, height?: number, radius?: number, fill?: string, stroke?: boolean | string, lineWidth?: number) => void;
  setAndDraw: (ct: CanvasRenderingContext2D, img: PictoImage, x: number, y: number, maxW?: number, align?: "left" | "center" | "right") => void;
  XChart: (size: number, pcent: number, color?: string, pic?: string | Buffer, lvthis?: string | number, term?: string, font?: string) => Promise<Canvas>;
  makeHex: (size: number, picture?: string | Buffer, color?: string) => Promise<Canvas>;
  makeRound: (size: number, pic?: string | Buffer) => Promise<Canvas>;
  circle: (size: number, pic?: string | Buffer) => Promise<Canvas>;
  popOutTxt: (ctx: CanvasRenderingContext2D, TXT?: string, X?: number, Y?: number, font?: string, color?: string, maxWidth?: number, stroke?: Stroke, shadow?: number) => { w: number; text?: string };
}