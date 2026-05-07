import { useEffect, useRef } from "react";

interface Star { x: number; y: number; r: number; o: number; v: number; tw: number; }

export const Starfield = ({ density = 180 }: { density?: number }) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let stars: Star[] = [];
    let w = 0, h = 0;

    const resize = () => {
      w = canvas.width = window.innerWidth * window.devicePixelRatio;
      h = canvas.height = window.innerHeight * window.devicePixelRatio;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      stars = Array.from({ length: density }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.6 + 0.3,
        o: Math.random(),
        v: 0.02 + Math.random() * 0.05,
        tw: Math.random() * Math.PI * 2,
      }));
    };
    resize();
    window.addEventListener("resize", resize);

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        s.tw += s.v;
        const o = (Math.sin(s.tw) + 1) / 2;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * window.devicePixelRatio, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(240, 30%, 96%, ${0.3 + o * 0.7})`;
        ctx.shadowBlur = 6;
        ctx.shadowColor = `hsla(265, 90%, 75%, ${o * 0.6})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [density]);

  return <canvas ref={ref} className="fixed inset-0 -z-10 pointer-events-none" aria-hidden />;
};
