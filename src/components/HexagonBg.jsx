import { useEffect, useRef } from 'react';

export default function HexagonBg() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId;
    let isRunning = true;

    // Detect mobile or low-power devices
    const isMobile = window.innerWidth < 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    // Scale canvas
    let width = (canvas.width = Math.min(window.innerWidth * 1.05, 1920));
    let height = (canvas.height = Math.min(window.innerHeight * 1.05, 1200));

    // Off-screen canvas for cached static honeycomb grid
    const baseCanvas = document.createElement('canvas');
    baseCanvas.width = width;
    baseCanvas.height = height;
    const baseCtx = baseCanvas.getContext('2d', { alpha: false });

    // Hexagon grid parameters (larger on mobile for fewer draw calls)
    const r = isMobile ? 32 : 26;
    const sx = r * Math.sqrt(3);
    const sy = r * 1.5;

    let verticesMap = {};
    let vertexKeys = [];
    let websiteNodes = [];
    let packets = [];

    // Helper to draw a 3D-looking beveled hexagon tile
    const draw3DHex = (cContext, x, y, radius) => {
      const grad = cContext.createLinearGradient(x - radius, y - radius, x + radius, y + radius);
      grad.addColorStop(0, '#141820');
      grad.addColorStop(1, '#06070a');
      cContext.fillStyle = grad;

      cContext.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i + Math.PI / 6;
        cContext.lineTo(x + radius * Math.cos(angle), y + radius * Math.sin(angle));
      }
      cContext.closePath();
      cContext.fill();

      // Outer bevel highlights
      cContext.strokeStyle = 'rgba(255, 255, 255, 0.07)';
      cContext.lineWidth = 0.8;
      cContext.beginPath();
      for (let i = 2; i <= 4; i++) {
        const angleStart = (Math.PI / 3) * i + Math.PI / 6;
        const angleEnd = (Math.PI / 3) * ((i + 1) % 6) + Math.PI / 6;
        cContext.moveTo(x + radius * Math.cos(angleStart), y + radius * Math.sin(angleStart));
        cContext.lineTo(x + radius * Math.cos(angleEnd), y + radius * Math.sin(angleEnd));
      }
      cContext.stroke();
    };

    // Pre-render static base grid once
    const renderBaseGrid = () => {
      baseCtx.fillStyle = '#0a0d14';
      baseCtx.fillRect(0, 0, width, height);

      verticesMap = {};
      const cols = Math.ceil(width / sx) + 2;
      const rows = Math.ceil(height / sy) + 2;

      for (let row = -1; row < rows; row++) {
        const y = row * sy;
        const xOffset = (row % 2 !== 0) ? sx / 2 : 0;

        for (let col = -1; col < cols; col++) {
          const x = col * sx + xOffset;
          draw3DHex(baseCtx, x, y, r * 0.93);

          if (!isMobile) {
            for (let i = 0; i < 6; i++) {
              const angle = (Math.PI / 3) * i + Math.PI / 6;
              const vx = Math.round(x + r * Math.cos(angle));
              const vy = Math.round(y + r * Math.sin(angle));
              const key = `${vx},${vy}`;
              if (!verticesMap[key]) {
                verticesMap[key] = { x: vx, y: vy, neighbors: new Set() };
              }
            }
          }
        }
      }

      if (!isMobile) {
        vertexKeys = Object.keys(verticesMap);
        for (let i = 0; i < vertexKeys.length; i++) {
          const v1 = verticesMap[vertexKeys[i]];
          for (let j = i + 1; j < vertexKeys.length; j++) {
            const v2 = verticesMap[vertexKeys[j]];
            const dist = Math.hypot(v1.x - v2.x, v1.y - v2.y);
            if (dist > r * 0.85 && dist < r * 1.15) {
              v1.neighbors.add(vertexKeys[j]);
              v2.neighbors.add(vertexKeys[i]);
            }
          }
        }
      }
    };

    renderBaseGrid();

    // If mobile, render base once and don't burn CPU with continuous loop
    if (isMobile) {
      ctx.drawImage(baseCanvas, 0, 0);
      return;
    }

    // Initialize desktop interactive nodes
    const initializeNodes = () => {
      websiteNodes = [];
      const numCores = Math.min(4, Math.floor(width / 350));
      for (let i = 0; i < numCores; i++) {
        const randKey = vertexKeys[Math.floor(Math.random() * vertexKeys.length)];
        const v = verticesMap[randKey];
        if (v) {
          websiteNodes.push({
            key: randKey,
            x: v.x,
            y: v.y,
            isCore: true,
            pulsePhase: Math.random() * Math.PI * 2,
            activityTimer: Math.random() * 80 + 40,
          });
        }
      }
    };

    initializeNodes();

    // BFS Shortest Path algorithm on the hexagon grid
    const findPath = (startKey, targetKey) => {
      if (startKey === targetKey) return [startKey];
      const queue = [[startKey]];
      const visited = new Set([startKey]);

      let iterations = 0;
      while (queue.length > 0 && iterations < 200) {
        iterations++;
        const path = queue.shift();
        const currKey = path[path.length - 1];

        if (currKey === targetKey) return path;

        const neighbors = verticesMap[currKey]?.neighbors || [];
        for (const nKey of neighbors) {
          if (!visited.has(nKey)) {
            visited.add(nKey);
            queue.push([...path, nKey]);
          }
        }
      }
      return null;
    };

    const spawnDataPacket = (sourceKey, destKey) => {
      if (packets.length >= 5) return;
      const path = findPath(sourceKey, destKey);
      if (!path || path.length < 2) return;

      packets.push({
        path,
        currentSegmentIndex: 0,
        segmentProgress: 0,
        speed: 0.08,
        color: '#00f99b'
      });
    };

    let lastFrameTime = performance.now();

    // Render loop (Optimized: NO expensive canvas shadowBlur, throttled when tab hidden)
    const render = (time) => {
      if (!isRunning) return;

      // Skip rendering if document is hidden to conserve battery & CPU
      if (document.hidden) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      // Throttle to ~40-60 FPS for battery and thread smoothness
      const delta = time - lastFrameTime;
      if (delta < 20) { // ~50 FPS max
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      lastFrameTime = time;

      // Draw base honeycomb
      ctx.drawImage(baseCanvas, 0, 0);

      // Pulse nodes and spawn occasional packets
      websiteNodes.forEach(node => {
        node.pulsePhase += 0.04;
        node.activityTimer--;

        if (node.activityTimer <= 0) {
          node.activityTimer = Math.random() * 120 + 80;
          if (websiteNodes.length > 1) {
            const otherNodes = websiteNodes.filter(n => n.key !== node.key);
            const target = otherNodes[Math.floor(Math.random() * otherNodes.length)];
            spawnDataPacket(node.key, target.key);
          }
        }

        // Draw node with lightweight double-stroke glow
        ctx.fillStyle = '#00f99b';
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(0, 249, 155, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 6 + Math.sin(node.pulsePhase) * 2, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Update and draw packets
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        p.segmentProgress += p.speed;

        if (p.segmentProgress >= 1.0) {
          p.segmentProgress = 0;
          p.currentSegmentIndex++;

          if (p.currentSegmentIndex >= p.path.length - 1) {
            packets.splice(i, 1);
            continue;
          }
        }

        const vCurrent = verticesMap[p.path[p.currentSegmentIndex]];
        const vNext = verticesMap[p.path[p.currentSegmentIndex + 1]];

        if (vCurrent && vNext) {
          const headX = vCurrent.x + (vNext.x - vCurrent.x) * p.segmentProgress;
          const headY = vCurrent.y + (vNext.y - vCurrent.y) * p.segmentProgress;

          ctx.fillStyle = '#00f99b';
          ctx.globalAlpha = 0.9;
          ctx.beginPath();
          ctx.arc(headX, headY, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    const handleResize = () => {
      width = canvas.width = Math.min(window.innerWidth * 1.05, 1920);
      height = canvas.height = Math.min(window.innerHeight * 1.05, 1200);
      baseCanvas.width = width;
      baseCanvas.height = height;
      renderBaseGrid();
      if (isMobile) {
        ctx.drawImage(baseCanvas, 0, 0);
      } else {
        initializeNodes();
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      isRunning = false;
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="print:hidden pointer-events-none"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
      }}
    />
  );
}
