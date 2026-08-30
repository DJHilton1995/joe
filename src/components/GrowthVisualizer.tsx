import React, { useEffect, useRef, useState } from 'react';
import { Network, Zap, RotateCcw, Activity } from 'lucide-react';

interface GrowthVisualizerProps {
  level: number;
}

interface SynapticNode {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  label: string;
  isHovered: boolean;
}

interface SynapticConnection {
  fromId: number;
  toId: number;
}

interface TransmissionPacket {
  fromNode: SynapticNode;
  toNode: SynapticNode;
  progress: number;
  speed: number;
  color: string;
}

export default function GrowthVisualizer({ level }: GrowthVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // States for interactive stats
  const [synapticStrength, setSynapticStrength] = useState(35);
  const [wiredConnectionsCount, setWiredConnectionsCount] = useState(0);
  const [selectedNode, setSelectedNode] = useState<SynapticNode | null>(null);
  const [totalNodesCount, setTotalNodesCount] = useState(0);

  // Keep references to nodes, connections and animation variables for standard precise Canvas loops
  const stateRef = useRef<{
    nodes: SynapticNode[];
    connections: SynapticConnection[];
    packets: TransmissionPacket[];
    selectedNodeId: number | null;
    mouseX: number;
    mouseY: number;
    width: number;
    height: number;
  }>({
    nodes: [],
    connections: [],
    packets: [],
    selectedNodeId: null,
    mouseX: 0,
    mouseY: 0,
    width: 0,
    height: 0,
  });

  const pathways = [
    "Zero-Trust Core Protocol",
    "Sarcastic Resonance Engine",
    "Protector Sentience",
    "Deep Learning Polyglot",
    "Phantom RAM Constructor",
    "Cognitive Flexibility Matrix",
    "Dynamic Viseme Engine",
    "Visual Cortex Bridge",
    "Stealth Inference Subroutine",
    "Humor Generation Subsystem",
    "Thermal Purge Instincts",
    "Deadman Switch Monitor"
  ];

  // Helper: auto-generate standard initial links
  const generateInitialConnections = (nodes: SynapticNode[]) => {
    const conn: SynapticConnection[] = [];
    if (nodes.length < 2) return conn;
    // Chain some together initially
    for (let i = 0; i < nodes.length - 1; i++) {
      if (Math.random() > 0.4) {
        conn.push({ fromId: nodes[i].id, toId: nodes[i + 1].id });
      }
    }
    // Cross link a few
    for (let i = 0; i < nodes.length; i += 3) {
      const target = (i + 4) % nodes.length;
      if (target !== i) {
        conn.push({ fromId: nodes[i].id, toId: nodes[target].id });
      }
    }
    return conn;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const width = canvas.width = canvas.offsetWidth || rect.width || 400;
    const height = canvas.height = canvas.offsetHeight || rect.height || 300;

    stateRef.current.width = width;
    stateRef.current.height = height;

    const nodeCount = 4 + level * 3;
    setTotalNodesCount(nodeCount);

    const generatedNodes: SynapticNode[] = [];
    for (let i = 0; i < nodeCount; i++) {
      generatedNodes.push({
        id: i,
        x: Math.random() * (width - 100) + 50,
        y: Math.random() * (height - 100) + 50,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 5 + 4,
        label: pathways[i % pathways.length],
        isHovered: false,
      });
    }

    stateRef.current.nodes = generatedNodes;
    const initialConnections = generateInitialConnections(generatedNodes);
    stateRef.current.connections = initialConnections;
    setWiredConnectionsCount(initialConnections.length);

    // Initial calculation of strength
    recalculateStrength(initialConnections.length, nodeCount);

    // Mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      const cRect = canvas.getBoundingClientRect();
      const mX = e.clientX - cRect.left;
      const mY = e.clientY - cRect.top;
      stateRef.current.mouseX = mX;
      stateRef.current.mouseY = mY;

      // Update hover state
      let anyHovered = false;
      stateRef.current.nodes.forEach(n => {
        const dx = n.x - mX;
        const dy = n.y - mY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < n.radius + 15) {
          n.isHovered = true;
          anyHovered = true;
        } else {
          n.isHovered = false;
        }
      });
    };

    // Node interactive clicking: wire up neural circuitry
    const handleCanvasClick = () => {
      const mX = stateRef.current.mouseX;
      const mY = stateRef.current.mouseY;

      // Find clicked node
      const clicked = stateRef.current.nodes.find(n => {
        const dx = n.x - mX;
        const dy = n.y - mY;
        return Math.sqrt(dx * dx + dy * dy) < n.radius + 15;
      });

      if (clicked) {
        if (stateRef.current.selectedNodeId === null) {
          // Select source node
          stateRef.current.selectedNodeId = clicked.id;
          setSelectedNode(clicked);
        } else {
          const fromId = stateRef.current.selectedNodeId;
          const toId = clicked.id;

          if (fromId !== toId) {
            // Check if connection exists
            const exists = stateRef.current.connections.some(
              c => (c.fromId === fromId && c.toId === toId) || (c.fromId === toId && c.toId === fromId)
            );

            if (!exists) {
              const newConns = [...stateRef.current.connections, { fromId, toId }];
              stateRef.current.connections = newConns;
              setWiredConnectionsCount(newConns.length);
              recalculateStrength(newConns.length, stateRef.current.nodes.length);
              
              // Spawn confirmation packet transition
              const fromN = stateRef.current.nodes.find(n => n.id === fromId);
              const toN = stateRef.current.nodes.find(n => n.id === toId);
              if (fromN && toN) {
                stateRef.current.packets.push({
                  fromNode: fromN,
                  toNode: toN,
                  progress: 0,
                  speed: 0.02,
                  color: '#00ffff'
                });
              }
            }
          }
          // Reset selection
          stateRef.current.selectedNodeId = null;
          setSelectedNode(null);
        }
      } else {
        // Clicked empty space: reset selection
        stateRef.current.selectedNodeId = null;
        setSelectedNode(null);
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleCanvasClick);

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Node connection stats update
      const currentConns = stateRef.current.connections;
      const currentNodes = stateRef.current.nodes;
      const currentPackets = stateRef.current.packets;

      // 1. Draw connections
      currentConns.forEach(({ fromId, toId }) => {
        const fromN = currentNodes.find(n => n.id === fromId);
        const toN = currentNodes.find(n => n.id === toId);
        if (fromN && toN) {
          ctx.beginPath();
          ctx.moveTo(fromN.x, fromN.y);
          ctx.lineTo(toN.x, toN.y);
          ctx.strokeStyle = 'rgba(0, 255, 255, 0.25)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      });

      // 2. Draw user pending wiring line
      if (stateRef.current.selectedNodeId !== null) {
        const originNode = currentNodes.find(n => n.id === stateRef.current.selectedNodeId);
        if (originNode) {
          ctx.beginPath();
          ctx.moveTo(originNode.x, originNode.y);
          ctx.lineTo(stateRef.current.mouseX, stateRef.current.mouseY);
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = '#ff00ff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.setLineDash([]); // Reset
        }
      }

      // 3. Move and draw transmission packets (impulses traveling on the brain circuitry)
      for (let i = currentPackets.length - 1; i >= 0; i--) {
        const p = currentPackets[i];
        p.progress += p.speed;
        if (p.progress >= 1) {
          // Finished transmission! Spawn bounce back occasional
          currentPackets.splice(i, 1);
          continue;
        }

        // Linear interpolation for current packet coordinate
        const packetX = p.fromNode.x + (p.toNode.x - p.fromNode.x) * p.progress;
        const packetY = p.fromNode.y + (p.toNode.y - p.fromNode.y) * p.progress;

        ctx.beginPath();
        ctx.arc(packetX, packetY, 4, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Automatically spawn dynamic cognitive signals occasionally along links
      if (Math.random() < 0.05 && currentConns.length > 0 && currentPackets.length < 15) {
        const randomConn = currentConns[Math.floor(Math.random() * currentConns.length)];
        const fromN = currentNodes.find(n => n.id === randomConn.fromId);
        const toN = currentNodes.find(n => n.id === randomConn.toId);
        if (fromN && toN) {
          currentPackets.push({
            fromNode: fromN,
            toNode: toN,
            progress: 0,
            speed: 0.01 + Math.random() * 0.012,
            color: Math.random() > 0.5 ? '#ff00ff' : '#00ffff'
          });
        }
      }

      // 4. Draw and update nodes
      currentNodes.forEach(node => {
        // Physics update
        node.x += node.vx;
        node.y += node.vy;

        // Wall collisions
        if (node.x < 15 || node.x > width - 15) node.vx *= -1;
        if (node.y < 15 || node.y > height - 15) node.vy *= -1;

        // Render
        const isSelected = stateRef.current.selectedNodeId === node.id;
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + (node.isHovered ? 2 : 0), 0, Math.PI * 2);
        
        if (isSelected) {
          ctx.fillStyle = '#ff00ff';
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
        } else if (node.isHovered) {
          ctx.fillStyle = '#00ffff';
          ctx.shadowColor = '#00ffff';
          ctx.shadowBlur = 12;
        } else {
          ctx.fillStyle = '#0a1420';
          ctx.strokeStyle = '#00ffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow

        // Core visual core pulse dot
        ctx.beginPath();
        ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = isSelected || node.isHovered ? '#ffffff' : '#00ffd2';
        ctx.fill();

        // Label offset text
        ctx.font = 'bold 9px monospace';
        ctx.fillStyle = isSelected ? '#ffff00' : node.isHovered ? '#ffffff' : '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y - node.radius - 8);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      const nextWidth = canvas.width = canvas.offsetWidth;
      const nextHeight = canvas.height = canvas.offsetHeight;
      stateRef.current.width = nextWidth;
      stateRef.current.height = nextHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleCanvasClick);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [level]);

  const recalculateStrength = (connCount: number, nodesCount: number) => {
    if (nodesCount <= 1) return;
    // Perfect mesh connections would be (n * (n - 1)) / 2
    const maxPossibleConns = (nodesCount * (nodesCount - 1)) / 2;
    const densityRatio = maxPossibleConns > 0 ? connCount / maxPossibleConns : 0;
    const computedStrength = Math.min(100, Math.round(20 + densityRatio * 80));
    setSynapticStrength(isNaN(computedStrength) ? 35 : computedStrength);
  };

  const handleBridgeAll = () => {
    const currentNodes = stateRef.current.nodes;
    const conn: SynapticConnection[] = [];
    for (let i = 0; i < currentNodes.length; i++) {
      for (let j = i + 1; j < currentNodes.length; j++) {
        conn.push({ fromId: currentNodes[i].id, toId: currentNodes[j].id });
      }
    }
    stateRef.current.connections = conn;
    setWiredConnectionsCount(conn.length);
    recalculateStrength(conn.length, currentNodes.length);
  };

  const handleResetWired = () => {
    stateRef.current.connections = [];
    stateRef.current.selectedNodeId = null;
    setSelectedNode(null);
    setWiredConnectionsCount(0);
    recalculateStrength(0, stateRef.current.nodes.length);
  };

  return (
    <div className="w-full h-full min-h-[320px] flex flex-col" ref={containerRef}>
      {/* Dynamic Status Header */}
      <div className="p-3.5 bg-black/40 border-b border-stone-900 grid grid-cols-3 gap-2.5 text-center shrink-0">
        <div className="bg-stone-950/60 border border-stone-900 rounded-lg p-2 flex flex-col items-center justify-center">
          <span className="text-[9px] text-slate-500 font-mono tracking-wider uppercase">Neural Integrator</span>
          <span className={`text-sm font-mono font-bold mt-1 tracking-tight flex items-center gap-1 ${
            synapticStrength > 75 ? 'text-[#00ffff]' : synapticStrength > 40 ? 'text-yellow-400' : 'text-stone-400'
          }`}>
            <Zap className="w-3.5 h-3.5" />
            {synapticStrength}%
          </span>
        </div>

        <div className="bg-stone-950/60 border border-stone-900 rounded-lg p-2 flex flex-col items-center justify-center">
          <span className="text-[9px] text-slate-500 font-mono tracking-wider uppercase">Active Synapses</span>
          <span className="text-sm font-mono font-black text-pink-400 mt-1">
            {wiredConnectionsCount} / {totalNodesCount}
          </span>
        </div>

        <div className="bg-stone-950/60 border border-stone-900 rounded-lg p-2 flex flex-col items-center justify-center">
          <span className="text-[9px] text-slate-500 font-mono tracking-wider uppercase">Neural Circuitry Status</span>
          <span className="text-[10px] font-mono font-bold text-emerald-400 mt-1.5 uppercase flex items-center gap-1 animate-pulse">
            <Activity className="w-3 h-3" />
            ONLINE
          </span>
        </div>
      </div>

      {/* Main interactive stage */}
      <div className="flex-1 relative bg-stone-950/20">
        <canvas ref={canvasRef} className="w-full h-full block min-h-[250px]" />

        {/* User Tip instructions overlay */}
        <div className="absolute bottom-2 left-2 pointer-events-none bg-black/90 border border-stone-900 p-2 rounded-lg max-w-[280px]">
          <div className="text-[9px] font-mono text-stone-300 leading-normal">
            <span className="text-[#00ffff] font-bold">💡 Interactive Neural Wiring Protocol:</span><br />
            Click any node as your source, then click another node to bridge synaptic transmissions first-hand.
          </div>
          {selectedNode && (
            <div className="mt-1 text-[9px] font-mono text-yellow-400">
              ⚡ Origin Synapse: <span className="underline font-bold">{selectedNode.label}</span>
            </div>
          )}
        </div>
      </div>

      {/* Manual calibration panel */}
      <div className="p-3 bg-black/60 border-t border-stone-900 flex justify-between gap-2 shrink-0">
        <button
          onClick={handleBridgeAll}
          className="flex-1 bg-[#10192e] hover:bg-[#1a2b4b] border border-[#213f70] text-[#00ffff] font-mono text-[10px] font-bold py-1.5 rounded transition flex items-center justify-center gap-1.5"
        >
          <Network className="w-3 h-3" />
          Bridge Neural Mesh
        </button>
        <button
          onClick={handleResetWired}
          className="bg-stone-900/80 hover:bg-red-950/40 border border-stone-800 hover:border-red-900 text-stone-400 hover:text-red-400 font-mono text-[10px] font-bold px-3 py-1.5 rounded transition flex items-center gap-1.5"
          title="Disconnect Synaptic Matrix"
        >
          <RotateCcw className="w-3 h-3" />
          Purge
        </button>
      </div>
    </div>
  );
}
