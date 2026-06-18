import { useEffect, useRef } from 'react';

export default function HexagonBg() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;

    // Scale canvas to cover the 110% size of the panning container
    let width = (canvas.width = window.innerWidth * 1.1);
    let height = (canvas.height = window.innerHeight * 1.1);

    // Create off-screen canvas to cache the base honeycomb grid (solid tiles + base crevices + static pattern)
    const baseCanvas = document.createElement('canvas');
    const baseCtx = baseCanvas.getContext('2d');

    // Hexagon grid parameters
    const r = 24; // hexagon radius
    const sx = r * Math.sqrt(3); // horizontal center spacing (~41.57px)
    const sy = r * 1.5; // vertical center spacing (36px)

    // Adjacency graph map for edge traversing
    let verticesMap = {};
    let vertexKeys = [];
    let websiteNodes = [];
    let packets = [];
    let fadingConnections = [];
    let ripples = [];

    // Helper to draw a hexagon path
    const drawHexPath = (cContext, x, y, radius) => {
      cContext.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i + Math.PI / 6; // flat-topped orientation
        cContext.lineTo(x + radius * Math.cos(angle), y + radius * Math.sin(angle));
      }
      cContext.closePath();
    };

    // Helper to draw a 3D-looking beveled hexagon tile
    const draw3DHex = (cContext, x, y, radius) => {
      // 1. Draw tile body with a linear lighting gradient (light from top-left)
      const grad = cContext.createLinearGradient(x - radius, y - radius, x + radius, y + radius);
      grad.addColorStop(0, '#141820'); // lightened top-left
      grad.addColorStop(1, '#06070a'); // darkened bottom-right
      cContext.fillStyle = grad;

      cContext.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i + Math.PI / 6;
        cContext.lineTo(x + radius * Math.cos(angle), y + radius * Math.sin(angle));
      }
      cContext.closePath();
      cContext.fill();

      // 2. Draw outer bevel highlights and shadows along the edges
      for (let i = 0; i < 6; i++) {
        const angleStart = (Math.PI / 3) * i + Math.PI / 6;
        const angleEnd = (Math.PI / 3) * ((i + 1) % 6) + Math.PI / 6;
        const xStart = x + radius * Math.cos(angleStart);
        const yStart = y + radius * Math.sin(angleStart);
        const xEnd = x + radius * Math.cos(angleEnd);
        const yEnd = y + radius * Math.sin(angleEnd);

        cContext.beginPath();
        cContext.moveTo(xStart, yStart);
        cContext.lineTo(xEnd, yEnd);

        // Sides 2, 3, 4 face top/left (highlights)
        // Sides 0, 1, 5 face bottom/right (shadows)
        if (i === 2 || i === 3 || i === 4) {
          cContext.strokeStyle = 'rgba(255, 255, 255, 0.08)'; // clean beveled highlight
          cContext.lineWidth = 0.8;
        } else {
          cContext.strokeStyle = 'rgba(0, 0, 0, 0.5)'; // deep beveled shadow
          cContext.lineWidth = 1.0;
        }
        cContext.stroke();
      }
    };

    // BFS Shortest Path algorithm on the hexagon grid
    const findPath = (startKey, targetKey) => {
      if (startKey === targetKey) return [startKey];
      const queue = [[startKey]];
      const visited = new Set([startKey]);

      while (queue.length > 0) {
        const path = queue.shift();
        const currKey = path[path.length - 1];

        if (currKey === targetKey) {
          return path;
        }

        const neighbors = verticesMap[currKey]?.neighbors || [];
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push([...path, neighbor]);
          }
        }
      }
      return null;
    };

    const spawnPacket = () => {
      if (packets.length >= 4) return; // cap at 4 active traversals
      if (websiteNodes.length < 2) return;
      const startNode = websiteNodes[Math.floor(Math.random() * websiteNodes.length)];
      if (!startNode.connections || startNode.connections.length === 0) return;

      const targetKey = startNode.connections[Math.floor(Math.random() * startNode.connections.length)];
      const targetNode = websiteNodes.find(n => n.key === targetKey);
      if (!targetNode) return;

      const path = findPath(startNode.key, targetNode.key);
      if (!path || path.length < 2) return;

      packets.push({
        path,
        currentSegmentIndex: 0,
        segmentProgress: 0,
        speed: 0.02 + Math.random() * 0.015, // smooth bold traversal
        color: startNode.isCore || targetNode.isCore ? '#00e5ff' : '#0055ff', // clean neon cyan/blue
      });
    };

    const buildWebsiteNodes = () => {
      websiteNodes = [];
      const shuffledKeys = [...vertexKeys].sort(() => Math.random() - 0.5);

      for (const key of shuffledKeys) {
        // target fewer, clean website nodes (around 12-15) to make a simple pattern
        const maxNodes = 15;
        if (websiteNodes.length >= maxNodes) break;

        const v = verticesMap[key];
        // Avoid borders so the nodes aren't clipped
        if (v.x < 60 || v.x > width - 60 || v.y < 60 || v.y > height - 60) continue;

        // Keep nodes wider apart (min distance 140px) to keep the diagram neat and readable
        const tooClose = websiteNodes.some(node => {
          const dx = node.x - v.x;
          const dy = node.y - v.y;
          return Math.sqrt(dx * dx + dy * dy) < 140;
        });

        if (!tooClose) {
          const isCore = Math.random() < 0.25; // 25% Core Hubs
          websiteNodes.push({
            key,
            x: v.x,
            y: v.y,
            isCore,
            pulsePhase: Math.random() * Math.PI * 2,
            connections: [], // keys of other website nodes this node connects to
          });
        }
      }

      // Build static links: Connect each node to its 2 nearest neighbors
      for (let i = 0; i < websiteNodes.length; i++) {
        const node = websiteNodes[i];
        
        // Find distances to all other nodes
        const distances = websiteNodes
          .map((n, idx) => ({ idx, key: n.key, dist: Math.hypot(n.x - node.x, n.y - node.y) }))
          .filter(item => item.key !== node.key)
          .sort((a, b) => a.dist - b.dist);

        // Take the 2 nearest
        const nearest = distances.slice(0, 2);
        nearest.forEach(item => {
          const targetNode = websiteNodes[item.idx];
          if (!node.connections.includes(targetNode.key)) {
            node.connections.push(targetNode.key);
          }
          if (!targetNode.connections.includes(node.key)) {
            targetNode.connections.push(node.key);
          }
        });
      }
    };

    const initializeParticles = () => {
      packets = [];
      fadingConnections = [];
      ripples = [];

      // Spawn initial active packets (cap at 4 active paths)
      const initialPacketsCount = Math.min(4, websiteNodes.length);
      for (let i = 0; i < initialPacketsCount; i++) {
        const startNode = websiteNodes[i % websiteNodes.length];
        if (!startNode.connections || startNode.connections.length === 0) continue;

        const targetKey = startNode.connections[Math.floor(Math.random() * startNode.connections.length)];
        const targetNode = websiteNodes.find(n => n.key === targetKey);
        if (!targetNode) continue;

        const path = findPath(startNode.key, targetNode.key);
        if (!path || path.length < 2) continue;

        // Randomize initial segment index and progress so they don't look synchronized
        const currentSegmentIndex = Math.floor(Math.random() * (path.length - 1));
        const segmentProgress = Math.random();

        packets.push({
          path,
          currentSegmentIndex,
          segmentProgress,
          speed: 0.02 + Math.random() * 0.015,
          color: startNode.isCore || targetNode.isCore ? '#00e5ff' : '#0055ff',
        });
      }
    };

    // Pre-render the base dark grid and build the vertex graph
    const rebuildCache = () => {
      baseCanvas.width = width;
      baseCanvas.height = height;

      // Clear baseCanvas so it is transparent
      baseCtx.clearRect(0, 0, width, height);

      // Rebuild adjacency graph
      verticesMap = {};

      const addVertex = (vx, vy) => {
        const key = `${vx.toFixed(1)},${vy.toFixed(1)}`;
        if (!verticesMap[key]) {
          verticesMap[key] = { x: vx, y: vy, neighbors: new Set() };
        }
        return key;
      };

      const addEdge = (k1, k2) => {
        verticesMap[k1].neighbors.add(k2);
        verticesMap[k2].neighbors.add(k1);
      };

      const rows = Math.ceil(height / sy) + 2;
      const cols = Math.ceil(width / sx) + 2;

      // Step A1: Draw the dim base dark crevices (subtle cool ambient mesh in gaps)
      baseCtx.lineWidth = 1.0;
      baseCtx.strokeStyle = '#080d14'; // very subtle dark blue-grey outline
      for (let row = -1; row < rows; row++) {
        for (let col = -1; col < cols; col++) {
          const x = col * sx + (row % 2 === 0 ? 0 : sx / 2);
          const y = row * sy;

          drawHexPath(baseCtx, x, y, r);
          baseCtx.stroke();
        }
      }

      // Rebuild graph nodes map
      for (let row = -1; row < rows; row++) {
        for (let col = -1; col < cols; col++) {
          const x = col * sx + (row % 2 === 0 ? 0 : sx / 2);
          const y = row * sy;

          // Build graph nodes
          const hexKeys = [];
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i + Math.PI / 6;
            const vx = x + r * Math.cos(angle);
            const vy = y + r * Math.sin(angle);
            hexKeys.push(addVertex(vx, vy));
          }

          // Connect adjacent vertices around this hexagon
          for (let i = 0; i < 6; i++) {
            addEdge(hexKeys[i], hexKeys[(i + 1) % 6]);
          }
        }
      }

      // Convert Set of neighbors to Array of keys for easy routing selection
      vertexKeys = Object.keys(verticesMap);
      vertexKeys.forEach(key => {
        verticesMap[key].neighbors = Array.from(verticesMap[key].neighbors);
      });

      // Build node graph connections
      buildWebsiteNodes();

      // Step A2: Pre-render the static website network map in the crevices (thin dim blue lines)
      baseCtx.lineWidth = 1.0;
      baseCtx.strokeStyle = 'rgba(0, 85, 255, 0.15)'; // dim glowing blue for static pattern crevices
      const drawnConnections = new Set();
      websiteNodes.forEach(node => {
        node.connections.forEach(connKey => {
          const pairKey = [node.key, connKey].sort().join('-');
          if (drawnConnections.has(pairKey)) return;
          drawnConnections.add(pairKey);

          const path = findPath(node.key, connKey);
          if (path && path.length >= 2) {
            baseCtx.beginPath();
            path.forEach((key, idx) => {
              const v = verticesMap[key];
              if (v) {
                if (idx === 0) baseCtx.moveTo(v.x, v.y);
                else baseCtx.lineTo(v.x, v.y);
              }
            });
            baseCtx.stroke();
          }
        });
      });

      // Step B: Draw 3D beveled hexagons with a gap to mask the crevices
      for (let row = -1; row < rows; row++) {
        for (let col = -1; col < cols; col++) {
          const x = col * sx + (row % 2 === 0 ? 0 : sx / 2);
          const y = row * sy;

          draw3DHex(baseCtx, x, y, r - 1.5); // gap of 1.5px (radius r - 1.5)
        }
      }

      initializeParticles();
    };

    rebuildCache();

    const handleResize = () => {
      width = canvas.width = window.innerWidth * 1.1;
      height = canvas.height = window.innerHeight * 1.1;
      rebuildCache();
    };
    window.addEventListener('resize', handleResize);

    const render = () => {
      // 1. Clear and fill the main canvas with a deep dark background
      ctx.fillStyle = '#040507'; // deep premium black space
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Website Nodes in the crevices (with clean neon glow)
      websiteNodes.forEach(node => {
        node.pulsePhase += 0.02;
        ctx.save();
        if (node.isCore) {
          // Core Hub pulsing aura ring
          const auraRadius = 5.0 + Math.sin(node.pulsePhase) * 1.5;
          const auraOpacity = 0.15 + Math.sin(node.pulsePhase) * 0.06;
          ctx.strokeStyle = '#0055ff';
          ctx.globalAlpha = auraOpacity;
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ctx.arc(node.x, node.y, auraRadius, 0, Math.PI * 2);
          ctx.stroke();

          // Core Hub center dot (clean neon cyan)
          ctx.fillStyle = '#00e5ff';
          ctx.globalAlpha = 0.9;
          ctx.shadowColor = '#0055ff';
          ctx.shadowBlur = 4;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 3.0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Page Node glowing blue dot
          ctx.fillStyle = '#0044cc';
          ctx.globalAlpha = 0.65;
          ctx.shadowColor = '#0044cc';
          ctx.shadowBlur = 3;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 2.0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // 3. Update and draw fading completed connection lines (bold & thick)
      for (let i = fadingConnections.length - 1; i >= 0; i--) {
        const conn = fadingConnections[i];
        conn.opacity -= 0.015; // fade speed

        if (conn.opacity <= 0) {
          fadingConnections.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.strokeStyle = conn.color;
        ctx.globalAlpha = conn.opacity * 0.7; // subtle fading opacity
        ctx.lineWidth = 2.0; // thick and bold line
        ctx.shadowColor = conn.color;
        ctx.shadowBlur = 6; // bolder glow shadow

        ctx.beginPath();
        conn.path.forEach((key, idx) => {
          const v = verticesMap[key];
          if (v) {
            if (idx === 0) ctx.moveTo(v.x, v.y);
            else ctx.lineTo(v.x, v.y);
          }
        });
        ctx.stroke();
        ctx.restore();
      }

      // 4. Update and draw active ripples on nodes
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rpl = ripples[i];
        rpl.radius += 0.35;
        rpl.opacity -= 0.025;

        if (rpl.opacity <= 0) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.strokeStyle = rpl.color;
        ctx.globalAlpha = rpl.opacity * 0.8;
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.arc(rpl.x, rpl.y, rpl.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 5. Update and draw traveling packets along the grid edges (underneath)
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        p.segmentProgress += p.speed;

        // If segment completed, move to next
        if (p.segmentProgress >= 1.0) {
          p.segmentProgress = 0;
          p.currentSegmentIndex++;

          // Path completely traversed!
          if (p.currentSegmentIndex >= p.path.length - 1) {
            const destKey = p.path[p.path.length - 1];
            const destV = verticesMap[destKey];
            if (destV) {
              // Trigger a node ripple
              ripples.push({
                x: destV.x,
                y: destV.y,
                radius: 2,
                maxRadius: 14,
                opacity: 0.8,
                color: p.color,
              });

              // Add to fading completed paths
              fadingConnections.push({
                path: p.path,
                opacity: 0.7,
                color: p.color,
              });
            }

            // Remove current packet and spawn a new one
            packets.splice(i, 1);
            spawnPacket();
            continue;
          }
        }

        const startV = verticesMap[p.path[p.currentSegmentIndex]];
        const endV = verticesMap[p.path[p.currentSegmentIndex + 1]];
        if (!startV || !endV) continue;

        // Interpolate current packet head coordinate
        const headX = startV.x + (endV.x - startV.x) * p.segmentProgress;
        const headY = startV.y + (endV.y - startV.y) * p.segmentProgress;

        // Draw trail drawn so far for this traversal (thick and bold)
        ctx.save();
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2.2; // thick and bold
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8; // bold neon glow shadow

        ctx.beginPath();
        for (let idx = 0; idx <= p.currentSegmentIndex; idx++) {
          const v = verticesMap[p.path[idx]];
          if (v) {
            if (idx === 0) ctx.moveTo(v.x, v.y);
            else ctx.lineTo(v.x, v.y);
          }
        }
        ctx.lineTo(headX, headY);
        ctx.stroke();

        // Draw packet glowing core (white-cyan hot center with bold blur)
        ctx.fillStyle = '#e6ffff';
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(headX, headY, 3.0, 0, Math.PI * 2); // bold glowing head core
        ctx.fill();
        ctx.restore();
      }

      // 6. Draw the pre-rendered base grid and beveled 3D hexagons ON TOP to mask the glowing elements
      ctx.drawImage(baseCanvas, 0, 0);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: '-5%',
        left: '-5%',
        width: '110%',
        height: '110%',
        pointerEvents: 'none',
        zIndex: -1,
        willChange: 'transform',
        animation: 'panBackground 40s ease-in-out infinite alternate',
      }}
    />
  );
}
