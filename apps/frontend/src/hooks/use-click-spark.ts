import { useRef } from "react";

export const useClickSpark = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const triggerSpark = (e: React.MouseEvent, color = "#fff") => {
    if (!canvasRef.current) {
      const canvas = document.createElement("canvas");
      canvas.style.position = "fixed";
      canvas.style.top = "0";
      canvas.style.left = "0";
      canvas.style.width = "100vw";
      canvas.style.height = "100vh";
      canvas.style.pointerEvents = "none";
      canvas.style.zIndex = "9999";
      document.body.appendChild(canvas);
      canvasRef.current = canvas;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      window.addEventListener("resize", () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      });
    }

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const sparks = Array.from({ length: 10 }, (_, i) => ({
      angle: (2 * Math.PI * i) / 10,
      startTime: performance.now(),
      x,
      y,
    }));

    const duration = 300;

    const animate = () => {
      if (!canvasRef.current || !ctx) return;
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      const now = performance.now();

      for (let spark of sparks) {
        const elapsed = now - spark.startTime;
        if (elapsed > duration) continue;

        const t = elapsed / duration;
        const ease = t * (2 - t);
        const dist = ease * 20;
        const size = 2 * (1 - ease);
        const x1 = spark.x + dist * Math.cos(spark.angle);
        const y1 = spark.y + dist * Math.sin(spark.angle);
        const x2 = x1 + size * Math.cos(spark.angle);
        const y2 = y1 + size * Math.sin(spark.angle);

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      if (performance.now() - sparks[0].startTime < duration) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  return triggerSpark;
};
