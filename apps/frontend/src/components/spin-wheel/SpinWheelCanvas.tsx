"use client";

import { useRef, useEffect } from "react";
import { SPIN_WHEEL_SEGMENTS } from "./spinWheel.config";
import { useSpinWheelStore } from "./spinWheel.store";

const DOT_COUNT = 24;

function drawWheel(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const size = canvas.width;
  const center = size / 2;
  const outerRadius = center - 6;
  const innerRadius = outerRadius - 14;
  const segCount = SPIN_WHEEL_SEGMENTS.length;
  const segAngle = (2 * Math.PI) / segCount;

  ctx.clearRect(0, 0, size, size);

  ctx.beginPath();
  ctx.arc(center, center, outerRadius + 4, 0, 2 * Math.PI);
  ctx.fillStyle = "#2c2c2c";
  ctx.fill();

  for (let d = 0; d < DOT_COUNT; d++) {
    const angle = (d / DOT_COUNT) * 2 * Math.PI - Math.PI / 2;
    const dotX = center + (outerRadius + 2) * Math.cos(angle);
    const dotY = center + (outerRadius + 2) * Math.sin(angle);
    ctx.beginPath();
    ctx.arc(dotX, dotY, 4, 0, 2 * Math.PI);
    ctx.fillStyle = d % 2 === 0 ? "#FFD700" : "#ffffff";
    ctx.fill();
  }

  SPIN_WHEEL_SEGMENTS.forEach((seg, i) => {
    const startAngle = i * segAngle - Math.PI / 2;
    const endAngle = startAngle + segAngle;

    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, innerRadius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = seg.color;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(startAngle + segAngle / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = seg.textColor;

    const lines = seg.label.split("\n");
    if (lines.length > 1) {
      ctx.font = `bold ${size * 0.038}px sans-serif`;
      ctx.fillText(lines[0], innerRadius - 12, -6);
      ctx.fillText(lines[1], innerRadius - 12, 10);
    } else {
      ctx.font = `bold ${size * 0.044}px sans-serif`;
      ctx.fillText(seg.label, innerRadius - 12, 5);
    }
    ctx.restore();
  });

  ctx.beginPath();
  ctx.arc(center, center, 28, 0, 2 * Math.PI);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.strokeStyle = "#e0e0e0";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.font = "22px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("🎁", center, center);
}

export function SpinWheelCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { rotation, phase } = useSpinWheelStore();

  useEffect(() => {
    if (canvasRef.current) drawWheel(canvasRef.current);
  }, []);

  return (
    <div
      style={{
        transform: `rotate(${rotation}deg)`,
        transition: phase === "spinning"
          ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)"
          : "none",
        borderRadius: "50%",
      }}
    >
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        className="block rounded-full"
      />
    </div>
  );
}
