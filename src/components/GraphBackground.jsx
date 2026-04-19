import { useEffect, useRef } from "react";

function createNodes(width, height) {
  const area = width * height;
  const count = Math.max(14, Math.min(28, Math.round(area / 52000)));

  return Array.from({ length: count }, (_, index) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.12,
    vy: (Math.random() - 0.5) * 0.12,
    radius: 1.2 + Math.random() * 1.8,
    phase: Math.random() * Math.PI * 2,
    drift: 0.35 + Math.random() * 0.8,
    id: index,
  }));
}

export default function GraphBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return undefined;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return undefined;
    }

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrameId = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let nodes = [];

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      nodes = createNodes(width, height);
    }

    function renderFrame(time) {
      const tick = time * 0.001;
      const maxDistance = Math.min(220, Math.max(120, width * 0.16));

      context.clearRect(0, 0, width, height);

      for (const node of nodes) {
        node.x += node.vx + Math.sin(tick * 0.35 + node.phase) * 0.025 * node.drift;
        node.y += node.vy + Math.cos(tick * 0.28 + node.phase) * 0.025 * node.drift;

        if (node.x < -16) node.x = width + 16;
        if (node.x > width + 16) node.x = -16;
        if (node.y < -16) node.y = height + 16;
        if (node.y > height + 16) node.y = -16;
      }

      for (let index = 0; index < nodes.length; index += 1) {
        const first = nodes[index];

        for (let targetIndex = index + 1; targetIndex < nodes.length; targetIndex += 1) {
          const second = nodes[targetIndex];
          const dx = first.x - second.x;
          const dy = first.y - second.y;
          const distance = Math.hypot(dx, dy);

          if (distance > maxDistance) {
            continue;
          }

          const pulse =
            (Math.sin(tick * (0.8 + (first.drift + second.drift) * 0.18) + first.phase + second.phase) +
              1) /
            2;
          const distanceFade = 1 - distance / maxDistance;
          const alpha = distanceFade * distanceFade * (0.025 + pulse * 0.11);

          if (alpha < 0.012) {
            continue;
          }

          context.beginPath();
          context.moveTo(first.x, first.y);
          context.lineTo(second.x, second.y);
          context.strokeStyle = `rgba(143, 226, 210, ${alpha})`;
          context.lineWidth = 1;
          context.stroke();
        }
      }

      for (const node of nodes) {
        const pulse = (Math.sin(tick * 1.2 + node.phase) + 1) / 2;
        const alpha = 0.18 + pulse * 0.36;

        context.beginPath();
        context.arc(node.x, node.y, node.radius + pulse * 0.35, 0, Math.PI * 2);
        context.fillStyle = `rgba(188, 244, 234, ${alpha})`;
        context.fill();
      }
    }

    function drawFrame(time) {
      renderFrame(time);
      animationFrameId = window.requestAnimationFrame(drawFrame);
    }

    resize();

    if (motionQuery.matches) {
      renderFrame(0);
    } else {
      animationFrameId = window.requestAnimationFrame(drawFrame);
    }

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);

      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return <canvas ref={canvasRef} className="graph-background" aria-hidden="true" />;
}
