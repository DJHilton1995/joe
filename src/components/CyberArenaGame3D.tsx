import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Volume2, VolumeX, Pause, Play, RotateCcw, Eye, Shield, Zap, Trophy, ChevronDown, ChevronUp } from 'lucide-react';

type GameState = 'title' | 'playing' | 'paused' | 'victory' | 'gameover';
type CameraMode = 'chase' | 'cockpit';

interface CyberArenaGame3DProps {
  onSendScoreToChat?: (score: number, wave: number) => void;
}

// Procedural Web Audio Retro Synth Engine
class RetroCyberSynth {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  private ensureContext(): AudioContext | null {
    if (this.muted) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playLaser() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.14);
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  playCollect() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.setValueAtTime(659.25, now + 0.06);
    osc.frequency.setValueAtTime(1046.5, now + 0.12);
    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.26);
  }

  playExplosion() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 0.28);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  playDamage() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.linearRampToValueAtTime(55, now + 0.22);
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.24);
  }

  playVictory() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      const now = ctx.currentTime + idx * 0.09;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    });
  }
}

export default function CyberArenaGame3D({ onSendScoreToChat }: CyberArenaGame3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<RetroCyberSynth>(new RetroCyberSynth());

  const [gameState, setGameState] = useState<GameState>('title');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [shields, setShields] = useState<number>(100);
  const [wave, setWave] = useState<number>(1);
  const [combo, setCombo] = useState<number>(1);
  const [coresCollected, setCoresCollected] = useState<number>(0);
  const [speedKmh, setSpeedKmh] = useState<number>(0);
  const [cameraMode, setCameraMode] = useState<CameraMode>('chase');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);
  const [webglFallback, setWebglFallback] = useState<boolean>(false);

  const gameStateRef = useRef<GameState>('title');
  const cameraModeRef = useRef<CameraMode>('chase');
  const resetTriggerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    cameraModeRef.current = cameraMode;
  }, [cameraMode]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      synthRef.current.muted = next;
      return next;
    });
  }, []);

  const startGame = useCallback(() => {
    if (resetTriggerRef.current) {
      resetTriggerRef.current();
    }
    setGameState('playing');
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch (err) {
      setWebglFallback(true);
      return;
    }

    const gl = renderer.getContext();
    const debugBasic = gl.getParameter(gl.RENDERER) || '';
    const dbgExt = gl.getExtension('WEBGL_debug_renderer_info');
    const debugUnmasked = dbgExt ? gl.getParameter(dbgExt.UNMASKED_RENDERER_WEBGL) || '' : '';
    const isSoftwareGl = /SwiftShader|llvmpipe|Software|Microsoft Basic Render/i.test(
      `${debugBasic} ${debugUnmasked}`
    );

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1.0 : Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setWebglFallback(true);
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost, false);

    // Scene & Fog
    const scene = new THREE.Scene();
    const horizonColor = new THREE.Color(0x070913);
    scene.background = horizonColor;
    scene.fog = new THREE.FogExp2(0x070913, 0.015);

    // Procedural Studio IBL via RoomEnvironment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // Camera
    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 220);
    camera.position.set(0, 8, 16);

    // Three-Point Studio Lighting
    const hemiLight = new THREE.HemisphereLight(0x6080ff, 0x1a0b2e, 0.65);
    hemiLight.position.set(0, 40, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff4e0, 2.2);
    keyLight.position.set(18, 32, 22);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(isSoftwareGl ? 512 : 1024, isSoftwareGl ? 512 : 1024);
    const frustum = 32;
    keyLight.shadow.camera.left = -frustum;
    keyLight.shadow.camera.right = frustum;
    keyLight.shadow.camera.top = frustum;
    keyLight.shadow.camera.bottom = -frustum;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 90;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xff007f, 1.25);
    rimLight.position.set(-20, 15, -25);
    scene.add(rimLight);

    // Procedural CanvasTextures (100% self-contained, zero external URLs)
    const createGridTexture = () => {
      const c = document.createElement('canvas');
      c.width = 256;
      c.height = 256;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#070a14';
      ctx.fillRect(0, 0, 256, 256);
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.28)';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, 256, 256);
      ctx.strokeStyle = 'rgba(255, 0, 127, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(128, 0);
      ctx.lineTo(128, 256);
      ctx.moveTo(0, 128);
      ctx.lineTo(256, 128);
      ctx.stroke();
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(36, 36);
      return tex;
    };

    const createContactShadowTexture = () => {
      const c = document.createElement('canvas');
      c.width = 128;
      c.height = 128;
      const ctx = c.getContext('2d')!;
      const grad = ctx.createRadialGradient(64, 64, 6, 64, 64, 60);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.75)');
      grad.addColorStop(0.6, 'rgba(0, 255, 255, 0.18)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
      return new THREE.CanvasTexture(c);
    };

    const gridTexture = createGridTexture();
    const contactShadowTexture = createContactShadowTexture();

    // Arena Ground Plane
    const groundGeo = new THREE.PlaneGeometry(140, 140);
    const groundMat = new THREE.MeshStandardMaterial({
      map: gridTexture,
      roughness: 0.35,
      metalness: 0.45,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // Arena Boundary Ring & Perimeter Cyber Pylons (Composite 3-part props)
    const ARENA_RADIUS = 38;
    const borderRingGeo = new THREE.RingGeometry(ARENA_RADIUS - 0.3, ARENA_RADIUS + 0.3, 64);
    const borderRingMat = new THREE.MeshBasicMaterial({
      color: 0xff007f,
      side: THREE.DoubleSide,
    });
    const borderRing = new THREE.Mesh(borderRingGeo, borderRingMat);
    borderRing.rotation.x = -Math.PI / 2;
    borderRing.position.y = 0.03;
    scene.add(borderRing);

    const pylonGroup = new THREE.Group();
    const pylonBaseGeo = new THREE.BoxGeometry(1.6, 0.6, 1.6);
    const pylonTowerGeo = new THREE.CylinderGeometry(0.35, 0.55, 6.5, 6);
    const pylonBeaconGeo = new THREE.OctahedronGeometry(0.55, 0);
    const pylonBaseMat = new THREE.MeshStandardMaterial({ color: 0x161f33, roughness: 0.5, metalness: 0.7 });
    const pylonTowerMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.25, metalness: 0.85 });
    const pylonBeaconMat = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 1.5,
      roughness: 0.2,
    });

    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const singlePylon = new THREE.Group();
      const base = new THREE.Mesh(pylonBaseGeo, pylonBaseMat);
      base.position.y = 0.3;
      const tower = new THREE.Mesh(pylonTowerGeo, pylonTowerMat);
      tower.position.y = 3.55;
      const beacon = new THREE.Mesh(pylonBeaconGeo, pylonBeaconMat);
      beacon.position.y = 7.4;
      singlePylon.add(base, tower, beacon);
      singlePylon.position.set(
        Math.cos(angle) * (ARENA_RADIUS + 2.5),
        0,
        Math.sin(angle) * (ARENA_RADIUS + 2.5)
      );
      pylonGroup.add(singlePylon);
    }
    scene.add(pylonGroup);

    // Composite 8-Part Hero Cyber-Interceptor Hover-Mech
    const createHeroVehicle = () => {
      const group = new THREE.Group();

      // 1. Grounded Contact Shadow
      const shadowMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(3.4, 3.8),
        new THREE.MeshBasicMaterial({
          map: contactShadowTexture,
          transparent: true,
          depthWrite: false,
        })
      );
      shadowMesh.rotation.x = -Math.PI / 2;
      shadowMesh.position.y = 0.02;
      group.add(shadowMesh);

      // 2. Main Angular Chassis Hull
      const hullMat = new THREE.MeshStandardMaterial({
        color: 0x0ea5e9,
        roughness: 0.28,
        metalness: 0.78,
      });
      const hullMesh = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.45, 2.8), hullMat);
      hullMesh.position.y = 0.75;
      hullMesh.castShadow = true;
      group.add(hullMesh);

      // 3. Nose Cone Wedge
      const noseGeo = new THREE.ConeGeometry(0.85, 1.3, 4);
      const noseMesh = new THREE.Mesh(noseGeo, hullMat);
      noseMesh.rotation.x = -Math.PI / 2;
      noseMesh.rotation.y = Math.PI / 4;
      noseMesh.position.set(0, 0.72, -1.9);
      noseMesh.castShadow = true;
      group.add(noseMesh);

      // 4. Tinted Metallic Glass Cockpit Canopy
      const canopyMat = new THREE.MeshStandardMaterial({
        color: 0x050814,
        roughness: 0.08,
        metalness: 0.95,
        emissive: 0x00ffff,
        emissiveIntensity: 0.25,
      });
      const canopyMesh = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.38, 1.35), canopyMat);
      canopyMesh.position.set(0, 1.1, -0.15);
      group.add(canopyMesh);

      // 5 & 6. Left & Right Swept Wing Pods
      const wingMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.35,
        metalness: 0.82,
      });
      const leftWing = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.18, 1.7), wingMat);
      leftWing.position.set(-1.15, 0.68, 0.2);
      leftWing.rotation.z = 0.15;
      group.add(leftWing);

      const rightWing = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.18, 1.7), wingMat);
      rightWing.position.set(1.15, 0.68, 0.2);
      rightWing.rotation.z = -0.15;
      group.add(rightWing);

      // 7. Dorsal Stabilizer Fin
      const finMat = new THREE.MeshStandardMaterial({
        color: 0xff007f,
        emissive: 0xff007f,
        emissiveIntensity: 0.6,
        roughness: 0.2,
      });
      const finMesh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.65, 1.0), finMat);
      finMesh.position.set(0, 1.25, 0.85);
      group.add(finMesh);

      // 8. Dual Rear Plasma Thrusters
      const thrusterMat = new THREE.MeshStandardMaterial({
        color: 0x00ffff,
        emissive: 0x00ffff,
        emissiveIntensity: 2.0,
        roughness: 0.1,
      });
      const thrusterGeo = new THREE.CylinderGeometry(0.22, 0.28, 0.35, 12);
      const leftThruster = new THREE.Mesh(thrusterGeo, thrusterMat);
      leftThruster.rotation.x = Math.PI / 2;
      leftThruster.position.set(-0.42, 0.72, 1.48);
      const rightThruster = new THREE.Mesh(thrusterGeo, thrusterMat);
      rightThruster.rotation.x = Math.PI / 2;
      rightThruster.position.set(0.42, 0.72, 1.48);
      group.add(leftThruster, rightThruster);

      return { group, leftThruster, rightThruster, hullMat };
    };

    const hero = createHeroVehicle();
    scene.add(hero.group);

    // Composite 6-Part Enemy Sentinel Factory
    interface EnemySentinel {
      group: THREE.Group;
      coreMesh: THREE.Mesh;
      ringMesh: THREE.Mesh;
      telegraphHalo: THREE.Mesh;
      hp: number;
      windupTimer: number;
      attackCooldown: number;
      velocity: THREE.Vector3;
    }

    const enemies: EnemySentinel[] = [];
    const enemyCoreGeo = new THREE.OctahedronGeometry(0.85, 0);
    const enemyRingGeo = new THREE.TorusGeometry(1.15, 0.09, 8, 24);
    const enemyProngGeo = new THREE.ConeGeometry(0.18, 0.8, 6);
    const enemyHaloGeo = new THREE.RingGeometry(1.2, 1.55, 24);

    const spawnEnemy = (waveNum: number) => {
      const group = new THREE.Group();
      const angle = Math.random() * Math.PI * 2;
      const dist = 22 + Math.random() * 12;
      group.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);

      // 1. Contact Shadow
      const shadow = new THREE.Mesh(
        new THREE.PlaneGeometry(2.6, 2.6),
        new THREE.MeshBasicMaterial({ map: contactShadowTexture, transparent: true, depthWrite: false })
      );
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = 0.02;
      group.add(shadow);

      // 2. Armored Octahedron Core
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0xe11d48,
        roughness: 0.25,
        metalness: 0.75,
        emissive: 0x881337,
        emissiveIntensity: 0.5,
      });
      const coreMesh = new THREE.Mesh(enemyCoreGeo, coreMat);
      coreMesh.position.y = 1.25;
      coreMesh.castShadow = true;
      group.add(coreMesh);

      // 3. Orbital Gyro Shield Ring
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.2,
        metalness: 0.9,
      });
      const ringMesh = new THREE.Mesh(enemyRingGeo, ringMat);
      ringMesh.position.y = 1.25;
      group.add(ringMesh);

      // 4 & 5. Twin Forward Weapon Prongs
      const prongMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.3, metalness: 0.8 });
      const leftProng = new THREE.Mesh(enemyProngGeo, prongMat);
      leftProng.rotation.x = Math.PI / 2;
      leftProng.position.set(-0.65, 1.1, 0.7);
      const rightProng = new THREE.Mesh(enemyProngGeo, prongMat);
      rightProng.rotation.x = Math.PI / 2;
      rightProng.position.set(0.65, 1.1, 0.7);
      group.add(leftProng, rightProng);

      // 6. Telegraph Charge Halo (Flashes bright orange/crimson 0.45s before lunge)
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0xffaa00,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.0,
      });
      const telegraphHalo = new THREE.Mesh(enemyHaloGeo, haloMat);
      telegraphHalo.rotation.x = -Math.PI / 2;
      telegraphHalo.position.y = 0.08;
      group.add(telegraphHalo);

      scene.add(group);
      enemies.push({
        group,
        coreMesh,
        ringMesh,
        telegraphHalo,
        hp: 1 + Math.floor(waveNum / 2),
        windupTimer: 0,
        attackCooldown: 1.5 + Math.random() * 2.0,
        velocity: new THREE.Vector3(),
      });
    };

    // Collectible Quantum Data Cores (Composite 4-part)
    interface QuantumCoreItem {
      group: THREE.Group;
      crystal: THREE.Mesh;
      ring: THREE.Mesh;
    }
    const coreItems: QuantumCoreItem[] = [];
    const crystalGeo = new THREE.OctahedronGeometry(0.55, 0);
    const crystalRingGeo = new THREE.TorusGeometry(0.8, 0.05, 8, 20);

    const spawnQuantumCore = () => {
      const group = new THREE.Group();
      const angle = Math.random() * Math.PI * 2;
      const dist = 6 + Math.random() * (ARENA_RADIUS - 10);
      group.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);

      const shadow = new THREE.Mesh(
        new THREE.PlaneGeometry(2.0, 2.0),
        new THREE.MeshBasicMaterial({ map: contactShadowTexture, transparent: true, depthWrite: false })
      );
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = 0.02;
      group.add(shadow);

      const crystal = new THREE.Mesh(
        crystalGeo,
        new THREE.MeshStandardMaterial({
          color: 0x00ffff,
          emissive: 0x00ffff,
          emissiveIntensity: 1.4,
          roughness: 0.1,
          metalness: 0.9,
        })
      );
      crystal.position.y = 1.1;
      group.add(crystal);

      const ring = new THREE.Mesh(
        crystalRingGeo,
        new THREE.MeshStandardMaterial({
          color: 0xb700ff,
          emissive: 0xb700ff,
          emissiveIntensity: 0.8,
          roughness: 0.2,
        })
      );
      ring.position.y = 1.1;
      group.add(ring);

      scene.add(group);
      coreItems.push({ group, crystal, ring });
    };

    // Laser Projectiles Pool
    interface LaserBolt {
      mesh: THREE.Mesh;
      velocity: THREE.Vector3;
      life: number;
    }
    const lasers: LaserBolt[] = [];
    const laserGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.4, 6);
    laserGeo.rotateX(Math.PI / 2);
    const laserMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });

    // 3D Particle Burst Pool
    interface Particle {
      mesh: THREE.Mesh;
      velocity: THREE.Vector3;
      life: number;
      maxLife: number;
    }
    const particles: Particle[] = [];
    const particleGeo = new THREE.BoxGeometry(0.22, 0.22, 0.22);

    const spawnBurst = (pos: THREE.Vector3, colorHex: number, count = 12) => {
      for (let i = 0; i < count; i++) {
        const mat = new THREE.MeshBasicMaterial({ color: colorHex });
        const mesh = new THREE.Mesh(particleGeo, mat);
        mesh.position.copy(pos);
        mesh.position.y = Math.max(0.4, pos.y);
        const speed = 4 + Math.random() * 9;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI * 0.6;
        const velocity = new THREE.Vector3(
          Math.cos(theta) * Math.sin(phi) * speed,
          Math.cos(phi) * speed + 2,
          Math.sin(theta) * Math.sin(phi) * speed
        );
        scene.add(mesh);
        particles.push({ mesh, velocity, life: 0.45, maxLife: 0.45 });
      }
    };

    // Input Tracking (Held vs Edge-Triggered justPressed)
    const heldKeys = new Set<string>();
    const justPressed = new Set<string>();

    const onKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        if (gameStateRef.current === 'playing') {
          e.preventDefault();
        }
      }
      if (!e.repeat && !heldKeys.has(e.code)) {
        justPressed.add(e.code);
      }
      heldKeys.add(e.code);

      if (e.code === 'Enter' || e.code === 'Space') {
        if (
          gameStateRef.current === 'title' ||
          gameStateRef.current === 'gameover' ||
          gameStateRef.current === 'victory'
        ) {
          e.preventDefault();
          startGame();
        }
      } else if (e.code === 'Escape' || e.code === 'KeyP') {
        if (gameStateRef.current === 'playing') {
          setGameState('paused');
        } else if (gameStateRef.current === 'paused') {
          setGameState('playing');
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      heldKeys.delete(e.code);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Simulation State Variables
    let heroYaw = 0;
    let heroSpeed = 0;
    let currentScore = 0;
    let currentShields = 100;
    let currentWave = 1;
    let currentCombo = 1;
    let currentCores = 0;
    let hitstopTimer = 0;
    let shakeTrauma = 0;
    let fireCooldown = 0;

    const resetSimulation = () => {
      hero.group.position.set(0, 0, 0);
      hero.group.rotation.set(0, 0, 0);
      heroYaw = 0;
      heroSpeed = 0;
      currentScore = 0;
      currentShields = 100;
      currentWave = 1;
      currentCombo = 1;
      currentCores = 0;
      hitstopTimer = 0;
      shakeTrauma = 0;

      setScore(0);
      setShields(100);
      setWave(1);
      setCombo(1);
      setCoresCollected(0);
      setSpeedKmh(0);

      enemies.forEach((en) => scene.remove(en.group));
      enemies.length = 0;
      coreItems.forEach((ci) => scene.remove(ci.group));
      coreItems.length = 0;
      lasers.forEach((l) => scene.remove(l.mesh));
      lasers.length = 0;

      for (let i = 0; i < 4; i++) spawnEnemy(1);
      for (let i = 0; i < 5; i++) spawnQuantumCore();
    };

    resetTriggerRef.current = resetSimulation;
    resetSimulation();

    // Frame Loop with Software GL Guard & Clamped Delta
    let lastTime = performance.now();
    let rafId = 0;
    let disposed = false;

    const afterDraw = isSoftwareGl
      ? (cb: FrameRequestCallback) => {
          gl.finish();
          return setTimeout(() => {
            if (!disposed) rafId = requestAnimationFrame(cb);
          }, 0) as unknown as number;
        }
      : (cb: FrameRequestCallback) => requestAnimationFrame(cb);

    const tick = (now: number) => {
      if (disposed) return;
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(rawDt, 0.05);
      const elapsed = now * 0.001;

      if (gameStateRef.current === 'title' || gameStateRef.current === 'paused') {
        // Orbit camera smoothly around the live 3D arena on Title / Pause
        const camAngle = elapsed * 0.28;
        camera.position.set(
          Math.sin(camAngle) * 18,
          9.5 + Math.sin(elapsed * 0.7) * 1.2,
          Math.cos(camAngle) * 18
        );
        camera.lookAt(0, 1.2, 0);
        hero.group.position.y = Math.sin(elapsed * 3) * 0.12;
      } else if (gameStateRef.current === 'playing') {
        if (hitstopTimer > 0) {
          hitstopTimer -= dt;
        } else {
          // 1. Hero Controls & Physics
          const turnRate = 2.8;
          let turnInput = 0;
          if (heldKeys.has('KeyA') || heldKeys.has('ArrowLeft')) turnInput += 1;
          if (heldKeys.has('KeyD') || heldKeys.has('ArrowRight')) turnInput -= 1;
          heroYaw += turnInput * turnRate * dt;

          const isBoosting = heldKeys.has('ShiftLeft') || heldKeys.has('ShiftRight');
          const maxSpeed = isBoosting ? 24 : 15;
          let throttle = 0;
          if (heldKeys.has('KeyW') || heldKeys.has('ArrowUp')) throttle += 1;
          if (heldKeys.has('KeyS') || heldKeys.has('ArrowDown')) throttle -= 0.65;

          if (throttle !== 0) {
            heroSpeed = THREE.MathUtils.lerp(heroSpeed, throttle * maxSpeed, dt * 5.0);
          } else {
            heroSpeed = THREE.MathUtils.lerp(heroSpeed, 0, dt * 4.0);
          }

          const forward = new THREE.Vector3(-Math.sin(heroYaw), 0, -Math.cos(heroYaw));
          hero.group.position.addScaledVector(forward, heroSpeed * dt);

          // Keep hero inside circular arena boundary
          const distFromCenter = Math.hypot(hero.group.position.x, hero.group.position.z);
          if (distFromCenter > ARENA_RADIUS - 1.5) {
            const normX = hero.group.position.x / distFromCenter;
            const normZ = hero.group.position.z / distFromCenter;
            hero.group.position.x = normX * (ARENA_RADIUS - 1.5);
            hero.group.position.z = normZ * (ARENA_RADIUS - 1.5);
            heroSpeed *= 0.6;
          }

          hero.group.rotation.y = heroYaw;
          hero.group.rotation.z = THREE.MathUtils.lerp(hero.group.rotation.z, turnInput * 0.28, dt * 8);
          hero.group.position.y = Math.sin(elapsed * 6) * 0.08;

          setSpeedKmh(Math.round(Math.abs(heroSpeed) * 12));

          // Dynamic FOV widening during boost
          const targetFov = isBoosting && Math.abs(heroSpeed) > 10 ? 76 : 65;
          if (Math.abs(camera.fov - targetFov) > 0.2) {
            camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, dt * 6);
            camera.updateProjectionMatrix();
          }

          // 2. Laser Firing (Space or Click)
          fireCooldown = Math.max(0, fireCooldown - dt);
          if ((justPressed.has('Space') || heldKeys.has('Space')) && fireCooldown <= 0) {
            fireCooldown = 0.18;
            synthRef.current.playLaser();
            const boltMesh = new THREE.Mesh(laserGeo, laserMat);
            boltMesh.position.copy(hero.group.position).add(new THREE.Vector3(0, 0.85, 0));
            boltMesh.position.addScaledVector(forward, 1.8);
            boltMesh.rotation.y = heroYaw;
            scene.add(boltMesh);
            lasers.push({
              mesh: boltMesh,
              velocity: forward.clone().multiplyScalar(44),
              life: 1.2,
            });
          }

          // 3. Update Lasers & Check Enemy Hits
          for (let i = lasers.length - 1; i >= 0; i--) {
            const bolt = lasers[i];
            bolt.life -= dt;
            bolt.mesh.position.addScaledVector(bolt.velocity, dt);
            let hit = false;

            for (let j = enemies.length - 1; j >= 0; j--) {
              const en = enemies[j];
              const d = bolt.mesh.position.distanceTo(en.group.position);
              if (d < 1.55) {
                hit = true;
                en.hp -= 1;
                spawnBurst(en.group.position.clone().add(new THREE.Vector3(0, 1.1, 0)), 0x00ffff, 6);
                if (en.hp <= 0) {
                  synthRef.current.playExplosion();
                  spawnBurst(en.group.position.clone().add(new THREE.Vector3(0, 1.2, 0)), 0xff007f, 16);
                  scene.remove(en.group);
                  enemies.splice(j, 1);
                  hitstopTimer = 0.045; // 45ms hitstop impact
                  shakeTrauma = Math.min(1.0, shakeTrauma + 0.35);
                  currentCombo = Math.min(8, currentCombo + 1);
                  currentScore += 150 * currentCombo;
                  setCombo(currentCombo);
                  setScore(currentScore);
                  setHighScore((prev) => Math.max(prev, currentScore));
                }
                break;
              }
            }

            if (hit || bolt.life <= 0) {
              scene.remove(bolt.mesh);
              lasers.splice(i, 1);
            }
          }

          // 4. Update Collectible Quantum Cores
          for (let i = coreItems.length - 1; i >= 0; i--) {
            const ci = coreItems[i];
            ci.crystal.rotation.y += dt * 2.4;
            ci.ring.rotation.x += dt * 1.8;
            ci.ring.rotation.y -= dt * 1.4;

            if (ci.group.position.distanceTo(hero.group.position) < 2.1) {
              synthRef.current.playCollect();
              spawnBurst(ci.group.position.clone().add(new THREE.Vector3(0, 1, 0)), 0x00ffff, 12);
              scene.remove(ci.group);
              coreItems.splice(i, 1);
              currentCores += 1;
              currentScore += 250 * currentCombo;
              currentShields = Math.min(100, currentShields + 10);
              setCoresCollected(currentCores);
              setScore(currentScore);
              setShields(currentShields);
              setHighScore((prev) => Math.max(prev, currentScore));
              spawnQuantumCore();
            }
          }

          // 5. Update Enemies with Visible Attack Telegraphing
          for (let i = enemies.length - 1; i >= 0; i--) {
            const en = enemies[i];
            en.coreMesh.rotation.y += dt * 2.0;
            en.ringMesh.rotation.x += dt * 2.5;

            const toHero = new THREE.Vector3().subVectors(hero.group.position, en.group.position);
            toHero.y = 0;
            const dist = toHero.length();
            if (dist > 0.001) toHero.normalize();

            en.group.rotation.y = Math.atan2(-toHero.x, -toHero.z);

            // Telegraph windup before lunge
            if (en.windupTimer > 0) {
              en.windupTimer -= dt;
              const mat = en.telegraphHalo.material as THREE.MeshBasicMaterial;
              mat.opacity = 0.85;
              const pulse = 1 + Math.sin(now * 0.04) * 0.25;
              en.telegraphHalo.scale.set(pulse, pulse, 1);
              if (en.windupTimer <= 0) {
                // Execute lunge dash toward hero
                en.velocity.copy(toHero).multiplyScalar(22);
                mat.opacity = 0;
              }
            } else {
              en.attackCooldown -= dt;
              if (dist < 14 && en.attackCooldown <= 0) {
                en.windupTimer = 0.45; // 450ms unmistakable visual telegraph
                en.attackCooldown = 3.2;
              }
              const chaseSpeed = 5.5 + currentWave * 0.8;
              en.velocity.lerp(toHero.multiplyScalar(chaseSpeed), dt * 3.0);
            }

            en.group.position.addScaledVector(en.velocity, dt);

            // Collision with Hero
            if (dist < 1.75) {
              synthRef.current.playDamage();
              spawnBurst(hero.group.position.clone().add(new THREE.Vector3(0, 1, 0)), 0xff3366, 14);
              shakeTrauma = Math.min(1.0, shakeTrauma + 0.65);
              currentShields = Math.max(0, currentShields - 25);
              currentCombo = 1;
              setShields(currentShields);
              setCombo(1);

              // Knock enemy back
              en.group.position.addScaledVector(toHero, -5.5);

              if (currentShields <= 0) {
                setGameState('gameover');
              }
            }
          }

          // Wave Progression & Victory Condition
          if (enemies.length === 0) {
            if (currentWave >= 3) {
              synthRef.current.playVictory();
              setGameState('victory');
            } else {
              currentWave += 1;
              setWave(currentWave);
              for (let w = 0; w < 3 + currentWave * 2; w++) {
                spawnEnemy(currentWave);
              }
            }
          }
        }

        // Camera Tracking (Chase vs Cockpit) + Decaying Trauma Shake
        shakeTrauma = Math.max(0, shakeTrauma - dt * 2.2);
        const shakeMag = shakeTrauma * shakeTrauma * 0.55;
        const shakeOffset = new THREE.Vector3(
          (Math.random() - 0.5) * shakeMag,
          (Math.random() - 0.5) * shakeMag,
          (Math.random() - 0.5) * shakeMag
        );

        const forwardVec = new THREE.Vector3(-Math.sin(heroYaw), 0, -Math.cos(heroYaw));
        if (cameraModeRef.current === 'cockpit') {
          const cockpitPos = hero.group.position
            .clone()
            .add(new THREE.Vector3(0, 1.45, 0))
            .addScaledVector(forwardVec, 0.4);
          camera.position.copy(cockpitPos).add(shakeOffset);
          const lookTarget = cockpitPos.clone().addScaledVector(forwardVec, 20);
          camera.lookAt(lookTarget);
        } else {
          const desiredCamPos = hero.group.position
            .clone()
            .addScaledVector(forwardVec, -8.5)
            .add(new THREE.Vector3(0, 4.4, 0));
          camera.position.lerp(desiredCamPos, 1 - Math.exp(-9 * dt));
          camera.position.add(shakeOffset);
          const lookTarget = hero.group.position
            .clone()
            .addScaledVector(forwardVec, 6.0)
            .add(new THREE.Vector3(0, 1.0, 0));
          camera.lookAt(lookTarget);
        }
      }

      // Update Particle Bursts
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= dt;
        if (p.life <= 0) {
          scene.remove(p.mesh);
          (p.mesh.material as THREE.Material).dispose();
          particles.splice(i, 1);
        } else {
          p.velocity.y -= 14 * dt;
          p.mesh.position.addScaledVector(p.velocity, dt);
          const s = p.life / p.maxLife;
          p.mesh.scale.setScalar(s);
        }
      }

      justPressed.clear();
      renderer.render(scene, camera);
      rafId = afterDraw(tick);
    };

    rafId = requestAnimationFrame(tick);

    // ResizeObserver for Responsive Container Scaling
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    window.addEventListener('resize', handleResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      clearTimeout(rafId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      gridTexture.dispose();
      contactShadowTexture.dispose();
      envTarget.dispose();
      renderer.dispose();
    };
  }, [startGame]);

  return (
    <div className="relative w-full h-full min-h-[560px] bg-[#070913] overflow-hidden select-none flex flex-col">
      {/* 3D WebGL Viewport Container */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* Graceful Fallback if WebGL Context is Unavailable */}
      {webglFallback && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#070913] p-6 text-center">
          <Shield className="w-12 h-12 text-[#00ffff] mb-3" />
          <h3 className="text-lg font-black font-mono text-white uppercase">
            3D WebGL Enclave Suspended
          </h3>
          <p className="text-xs font-mono text-slate-400 max-w-md mt-2">
            Hardware WebGL acceleration was interrupted. Click below to re-initialize the Neon Sentinel 3D arena.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-5 py-2.5 rounded-xl bg-[#00ffff] text-black font-mono font-black text-xs uppercase cursor-pointer"
          >
            Re-Initialize 3D Engine
          </button>
        </div>
      )}

      {/* STATE 1: TITLE SCREEN OVERLAY */}
      {gameState === 'title' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 pointer-events-auto bg-black/55">
          <div className="max-w-lg w-full bg-[#090d1a]/95 border-2 border-[#00ffff]/60 rounded-2xl p-8 text-center shadow-[0_0_50px_rgba(0,255,255,0.25)]">
            {/* Bespoke Inline SVG Emblem & Title Lockup */}
            <div className="flex justify-center mb-4">
              <svg width="84" height="84" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polygon
                  points="50,6 92,28 92,72 50,94 8,72 8,28"
                  stroke="#00ffff"
                  strokeWidth="3"
                  fill="#0b132b"
                />
                <polygon
                  points="50,18 80,35 80,65 50,82 20,65 20,35"
                  stroke="#ff007f"
                  strokeWidth="2"
                  fill="none"
                />
                <path d="M50 24 L68 64 L50 54 L32 64 Z" fill="#00ffff" />
                <circle cx="50" cy="48" r="5" fill="#ff007f" />
              </svg>
            </div>

            <div className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#ff007f] mb-1">
              JOEY PALMA 3D TACTICAL SIMULATOR
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#00ffff] via-white to-[#ff007f] uppercase">
              NEON SENTINEL 1985
            </h1>
            <p className="text-xs font-mono text-slate-300 mt-2 leading-relaxed">
              Pilot Joey&apos;s Cyber-Interceptor across the quantum grid. Collect glowing Data Cores, dodge telegraphed Sentinel lunges, and clear 3 waves!
            </p>

            <button
              onClick={startGame}
              className="mt-6 w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00ffff] via-[#38bdf8] to-[#ff007f] text-black font-mono font-black text-sm uppercase tracking-widest shadow-[0_0_25px_rgba(0,255,255,0.45)] hover:brightness-110 transition cursor-pointer"
            >
              Launch Cyber Interceptor (Enter / Space)
            </button>

            <div className="mt-5 pt-4 border-t border-slate-800 text-[11px] font-mono text-slate-400">
              <span className="text-[#00ffff] font-bold">WASD / Arrows</span> Move &middot;{' '}
              <span className="text-[#ff007f] font-bold">Space</span> Laser Pulse &middot;{' '}
              <span className="text-amber-400 font-bold">Shift</span> Turbo &middot;{' '}
              <span className="text-slate-200 font-bold">Esc</span> Pause
            </div>
          </div>
        </div>
      )}

      {/* STATE 2: PLAYING HUD (Corner Badges + Collapsible Bottom Dock, no backdrop-filter over WebGL) */}
      {gameState === 'playing' && (
        <>
          {/* Top-Left Shield & Wave Badge */}
          <div className="absolute top-4 left-4 z-10 pointer-events-none flex flex-col gap-2">
            <div className="bg-[#090d1a]/92 border border-[#00ffff]/40 rounded-xl px-4 py-2.5 shadow-lg">
              <div className="flex items-center justify-between gap-6 text-[10px] font-mono text-slate-400 uppercase">
                <span>Hull Integrity</span>
                <span className="text-[#00ffff] font-bold">{shields}%</span>
              </div>
              <div className="w-44 h-2 bg-slate-900 rounded-full overflow-hidden mt-1 border border-slate-800">
                <div
                  className={`h-full transition-all duration-200 ${
                    shields > 50 ? 'bg-[#00ffff]' : shields > 25 ? 'bg-amber-400' : 'bg-rose-500'
                  }`}
                  style={{ width: `${shields}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-2 text-[10px] font-mono">
                <span className="text-fuchsia-400 font-bold">WAVE {wave} / 3</span>
                <span className="text-emerald-400 font-bold">CORES: {coresCollected}</span>
              </div>
            </div>
          </div>

          {/* Top-Right Score, Combo & Speedometer */}
          <div className="absolute top-4 right-4 z-10 pointer-events-none flex flex-col items-end gap-2">
            <div className="bg-[#090d1a]/92 border border-[#ff007f]/40 rounded-xl px-4 py-2.5 text-right shadow-lg">
              <div className="text-[10px] font-mono text-slate-400 uppercase flex items-center justify-end gap-2">
                <span>Score</span>
                <span className="px-1.5 py-0.5 rounded bg-fuchsia-950 text-[#ff007f] font-black">
                  {combo}x COMBO
                </span>
              </div>
              <div className="text-2xl font-black font-mono text-white tracking-wider">
                {score.toLocaleString()}
              </div>
              <div className="text-[10px] font-mono text-[#00ffff] mt-0.5">
                SPEED: {speedKmh} KM/H
              </div>
            </div>
          </div>

          {/* Bottom-Center Collapsible Control Dock */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-auto">
            <div className="bg-[#090d1a]/95 border border-slate-700/80 rounded-xl px-3 py-2 flex items-center gap-2 shadow-xl">
              {!dockCollapsed && (
                <>
                  <button
                    onClick={() => setCameraMode((prev) => (prev === 'chase' ? 'cockpit' : 'chase'))}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-[#00ffff] text-[10px] font-mono text-[#00ffff] uppercase font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {cameraMode === 'chase' ? 'Chase Cam' : 'Cockpit Cam'}
                  </button>

                  <button
                    onClick={toggleMute}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-[#00ffff] text-[10px] font-mono text-slate-300 uppercase flex items-center gap-1.5 cursor-pointer"
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-[#00ffff]" />}
                    {isMuted ? 'Muted' : 'Synth Audio'}
                  </button>

                  <button
                    onClick={() => setGameState('paused')}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-amber-400 text-[10px] font-mono text-amber-300 uppercase flex items-center gap-1.5 cursor-pointer"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    Pause
                  </button>

                  <span className="hidden md:inline text-[10px] font-mono text-slate-400 pl-2 border-l border-slate-800">
                    WASD Move &middot; Space Fire &middot; Shift Boost
                  </span>
                </>
              )}

              <button
                onClick={() => setDockCollapsed(!dockCollapsed)}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white cursor-pointer"
                title={dockCollapsed ? 'Expand Controls' : 'Collapse Controls'}
              >
                {dockCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </>
      )}

      {/* STATE 3: PAUSE / VICTORY / GAME OVER MODAL */}
      {(gameState === 'paused' || gameState === 'victory' || gameState === 'gameover') && (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-6 bg-black/70 pointer-events-auto">
          <div className="max-w-md w-full bg-[#090d1a]/95 border-2 border-[#00ffff]/60 rounded-2xl p-6 text-center shadow-[0_0_40px_rgba(0,255,255,0.25)]">
            <div className="flex justify-center mb-3">
              {gameState === 'victory' ? (
                <Trophy className="w-12 h-12 text-amber-400" />
              ) : gameState === 'gameover' ? (
                <Zap className="w-12 h-12 text-rose-500" />
              ) : (
                <Pause className="w-12 h-12 text-[#00ffff]" />
              )}
            </div>

            <h2 className="text-2xl font-black font-mono text-white uppercase tracking-wider">
              {gameState === 'victory'
                ? 'SECTOR CLEARED // VICTORY!'
                : gameState === 'gameover'
                ? 'INTERCEPTOR OFFLINE'
                : 'SIMULATION PAUSED'}
            </h2>

            <div className="mt-4 grid grid-cols-3 gap-2 bg-black/50 border border-slate-800 rounded-xl p-3 font-mono">
              <div>
                <div className="text-[9px] text-slate-400 uppercase">Score</div>
                <div className="text-sm font-black text-[#00ffff]">{score.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[9px] text-slate-400 uppercase">Best</div>
                <div className="text-sm font-black text-amber-400">{highScore.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[9px] text-slate-400 uppercase">Cores</div>
                <div className="text-sm font-black text-emerald-400">{coresCollected}</div>
              </div>
            </div>

            <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
              {gameState === 'paused' ? (
                <button
                  onClick={() => setGameState('playing')}
                  className="flex-1 py-2.5 rounded-xl bg-[#00ffff] text-black font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-4 h-4" /> Resume (Esc)
                </button>
              ) : null}

              <button
                onClick={startGame}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#00ffff] to-[#ff007f] text-black font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> {gameState === 'paused' ? 'Restart' : 'Play Again (Enter)'}
              </button>

              {onSendScoreToChat && score > 0 && (
                <button
                  onClick={() => onSendScoreToChat(score, wave)}
                  className="flex-1 py-2.5 rounded-xl bg-fuchsia-950/70 border border-fuchsia-500/60 text-fuchsia-200 font-mono font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  Share to Chat
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
