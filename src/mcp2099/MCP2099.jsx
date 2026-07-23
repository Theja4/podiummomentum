/**
 * MCP-2099 — Retro-Futuristic Developer Platform Interface
 * A cinematic, Awwwards-level showcase page with WebGL shaders,
 * glassmorphic UI, and interactive 3D elements.
 */
import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { Sun, Moon, Shield, Cpu, Activity, Globe, Lock, Zap, Terminal, Layers } from 'lucide-react'
import './mcp2099.css'

/* ═══════════════════════════════════════════
   GLSL Shaders
   ═══════════════════════════════════════════ */

const globeVertexShader = `
  uniform float uTime;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying float vDisplacement;
  void main() {
    vPosition = position;
    vNormal = normal;
    float displacement = sin(position.x * 4.0 + uTime) * 0.04
                       + sin(position.y * 3.0 + uTime * 1.3) * 0.05
                       + sin(position.z * 5.0 + uTime * 0.7) * 0.03;
    vDisplacement = displacement;
    vec3 newPos = position + normal * displacement;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
  }
`

const globeFragmentShader = `
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying float vDisplacement;
  void main() {
    float scanline = sin(vPosition.y * 40.0 + uTime * 3.0) * 0.5 + 0.5;
    scanline = pow(scanline, 8.0) * 0.4;
    float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.5);
    vec3 color = mix(uColorA, uColorB, fresnel);
    color += scanline * uColorB;
    float alpha = 0.25 + fresnel * 0.6 + scanline * 0.3;
    gl_FragColor = vec4(color, alpha);
  }
`

const brainVertexShader = `
  uniform float uTime;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying float vNoise;

  // Simplex 3D noise
  vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
  float snoise(vec3 v){
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 1.0/7.0;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vPosition = position;
    vNormal = normal;
    float noise = snoise(position * 1.5 + uTime * 0.4) * 0.18;
    vNoise = noise;
    vec3 newPos = position + normal * noise;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
  }
`

const brainFragmentShader = `
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying float vNoise;
  void main() {
    float vein = sin(vPosition.x * 12.0 + vPosition.y * 8.0 + uTime * 2.0) * 0.5 + 0.5;
    vein = pow(vein, 4.0);
    float pulse = sin(uTime * 1.5) * 0.5 + 0.5;
    float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 3.0);
    vec3 color = mix(uColorA, uColorB, fresnel + vNoise);
    color += vein * uColorB * (0.5 + pulse * 0.5);
    float alpha = 0.6 + fresnel * 0.4 + vein * 0.2;
    gl_FragColor = vec4(color, alpha);
  }
`

/* ═══════════════════════════════════════════
   3D Components
   ═══════════════════════════════════════════ */

function DataGlobe({ dark }) {
  const meshRef = useRef()
  const materialRef = useRef()
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColorA: { value: new THREE.Color('#00f3ff') },
    uColorB: { value: new THREE.Color('#ff4d00') },
  }), [])

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
    }
  })

  return (
    <mesh ref={meshRef} scale={2.2}>
      <icosahedronGeometry args={[1, 32]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={globeVertexShader}
        fragmentShader={globeFragmentShader}
        uniforms={uniforms}
        transparent
        wireframe
        depthWrite={false}
      />
    </mesh>
  )
}

function Starfield() {
  const ref = useRef()
  const count = 2000
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20
    }
    return pos
  }, [])

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.02
      ref.current.rotation.x = state.clock.elapsedTime * 0.01
    }
  })

  return (
    <Points ref={ref} positions={positions} stride={3}>
      <PointMaterial size={0.015} color="#00f3ff" sizeAttenuation depthWrite={false} transparent opacity={0.6} />
    </Points>
  )
}

function NeuralCore({ dark }) {
  const meshRef = useRef()
  const materialRef = useRef()
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColorA: { value: new THREE.Color('#ff4d00') },
    uColorB: { value: new THREE.Color('#00f3ff') },
  }), [])

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.05
    }
  })

  return (
    <mesh ref={meshRef} scale={1.8}>
      <icosahedronGeometry args={[1, 24]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={brainVertexShader}
        fragmentShader={brainFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}

function NeuralParticles() {
  const ref = useRef()
  const count = 400
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 2.2 + Math.random() * 0.8
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)
    }
    return pos
  }, [])

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.08
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.2
    }
  })

  return (
    <Points ref={ref} positions={positions} stride={3}>
      <PointMaterial size={0.035} color="#ff4d00" sizeAttenuation depthWrite={false} transparent opacity={0.8} />
    </Points>
  )
}

function HeroScene({ dark }) {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 60 }} dpr={[1, 1.5]} style={{ background: 'transparent' }}>
      <ambientLight intensity={0.3} />
      <DataGlobe dark={dark} />
      <Starfield />
    </Canvas>
  )
}

function NeuralScene({ dark }) {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 55 }} dpr={[1, 1.5]} style={{ background: 'transparent' }}>
      <ambientLight intensity={0.2} />
      <pointLight position={[5, 5, 5]} intensity={0.5} color="#00f3ff" />
      <NeuralCore dark={dark} />
      <NeuralParticles />
    </Canvas>
  )
}

/* ═══════════════════════════════════════════
   Loader Component
   ═══════════════════════════════════════════ */

const LOADER_STEPS = [
  'INITIALIZING_KERNEL',
  'LOADING_ASSETS',
  'COMPILING_SHADERS',
  'ESTABLISHING_UPLINK',
  'DECRYPTING_PROTOCOLS',
  'SYSTEM_READY',
]

function CinematicLoader({ onComplete }) {
  const [step, setStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const [displayText, setDisplayText] = useState('')

  useEffect(() => {
    let current = 0
    const interval = setInterval(() => {
      current++
      if (current >= LOADER_STEPS.length) {
        clearInterval(interval)
        setProgress(100)
        setTimeout(() => {
          setDone(true)
          setTimeout(onComplete, 800)
        }, 400)
        return
      }
      setStep(current)
      setProgress(Math.round((current / (LOADER_STEPS.length - 1)) * 100))
    }, 380)
    return () => clearInterval(interval)
  }, [onComplete])

  // Scrambled text decode effect
  useEffect(() => {
    const target = LOADER_STEPS[step] || ''
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ_0123456789'
    let frame = 0
    const totalFrames = 12
    const anim = setInterval(() => {
      frame++
      if (frame >= totalFrames) {
        setDisplayText(target)
        clearInterval(anim)
        return
      }
      const revealed = Math.floor((frame / totalFrames) * target.length)
      let text = ''
      for (let i = 0; i < target.length; i++) {
        text += i < revealed ? target[i] : chars[Math.floor(Math.random() * chars.length)]
      }
      setDisplayText(text)
    }, 30)
    return () => clearInterval(anim)
  }, [step])

  return (
    <div className={`mcp-loader ${done ? 'is-done' : ''}`}>
      <div className="mcp-loader-ring">
        <LoaderRing />
      </div>
      <div className="mcp-loader-text">{displayText}</div>
      <div className="mcp-loader-progress">
        <div className="mcp-loader-progress-bar" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}

function LoaderRing() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const size = 160
    canvas.width = size * 2
    canvas.height = size * 2
    ctx.scale(2, 2)
    let angle = 0
    let animId
    const draw = () => {
      ctx.clearRect(0, 0, size, size)
      const cx = size / 2, cy = size / 2, r = 55
      // Outer ring
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.15)'
      ctx.lineWidth = 2
      ctx.stroke()
      // Spinning arc
      ctx.beginPath()
      ctx.arc(cx, cy, r, angle, angle + Math.PI * 1.2)
      ctx.strokeStyle = '#00f3ff'
      ctx.lineWidth = 2.5
      ctx.shadowColor = '#00f3ff'
      ctx.shadowBlur = 12
      ctx.stroke()
      ctx.shadowBlur = 0
      // Inner ring
      ctx.beginPath()
      ctx.arc(cx, cy, r - 14, angle + Math.PI, angle + Math.PI + Math.PI * 0.8)
      ctx.strokeStyle = '#ff4d00'
      ctx.lineWidth = 1.5
      ctx.shadowColor = '#ff4d00'
      ctx.shadowBlur = 8
      ctx.stroke()
      ctx.shadowBlur = 0
      // Data artifacts
      for (let i = 0; i < 6; i++) {
        const a = angle * 0.5 + (i * Math.PI * 2) / 6
        const x = cx + Math.cos(a) * (r + 8)
        const y = cy + Math.sin(a) * (r + 8)
        ctx.fillStyle = i % 2 === 0 ? 'rgba(0,243,255,0.6)' : 'rgba(255,77,0,0.5)'
        ctx.fillRect(x - 1.5, y - 1.5, 3, 3)
      }
      angle += 0.03
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animId)
  }, [])
  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
}

/* ═══════════════════════════════════════════
   Navigation
   ═══════════════════════════════════════════ */

const NAV_ITEMS = [
  { id: 'interface', label: 'Interface' },
  { id: 'neural', label: 'Neural Net' },
  { id: 'protocol', label: 'Protocol' },
  { id: 'logs', label: 'Logs' },
  { id: 'dashboard', label: 'Dashboard' },
]

function McpNav({ active, onNavigate, dark, onToggleTheme }) {
  return (
    <nav className="mcp-nav">
      <span className="mcp-nav-logo">MCP-2099</span>
      {NAV_ITEMS.map(item => (
        <button
          key={item.id}
          className={`mcp-nav-link ${active === item.id ? 'active' : ''}`}
          onClick={() => onNavigate(item.id)}
        >
          {item.label}
        </button>
      ))}
      <div className="mcp-nav-actions">
        <button className="mcp-theme-toggle" onClick={onToggleTheme} aria-label="Toggle theme">
          {dark ? <Sun size={14} /> : <Moon size={14} />}
        </button>
        <button className="mcp-cta-btn" onClick={() => onNavigate('dashboard')}>
          Initialize
        </button>
      </div>
    </nav>
  )
}

/* ═══════════════════════════════════════════
   Hero Section
   ═══════════════════════════════════════════ */

function HeroSection({ dark, onNavigate }) {
  const contentRef = useRef(null)
  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(contentRef.current.children, 
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.15, ease: 'power3.out', delay: 0.3 }
      )
    }
  }, [])
  return (
    <section className="mcp-hero" id="interface">
      <div className="mcp-hero-canvas">
        <HeroScene dark={dark} />
      </div>
      <div className="mcp-hero-content" ref={contentRef}>
        <p className="mcp-hero-eyebrow">// MCP-2099 Developer Platform</p>
        <h1 className="mcp-hero-title">Engineering, Supercharged</h1>
        <p className="mcp-hero-sub">
          A realistic retrofuturistic interface built with WebGL shaders,
          React Three Fiber, and cinematic motion design.
        </p>
        <div className="mcp-hero-actions">
          <button className="mcp-btn-primary" onClick={() => onNavigate('neural')}>
            Explore Neural Net
          </button>
          <button className="mcp-btn-ghost" onClick={() => onNavigate('dashboard')}>
            Launch Dashboard
          </button>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   Neural Net Section
   ═══════════════════════════════════════════ */

function NeuralSection({ dark }) {
  return (
    <section className="mcp-neural" id="neural">
      <div className="mcp-neural-canvas">
        <NeuralScene dark={dark} />
      </div>
      <div className="mcp-neural-overlay">
        <p className="mcp-neural-label">// Sentient Core v9.7</p>
        <h2 className="mcp-neural-title">The Neural Network</h2>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   Dashboard Section
   ═══════════════════════════════════════════ */

function generateNodeMap() {
  return Array.from({ length: 64 }, () => {
    const r = Math.random()
    return r > 0.85 ? 'active' : r > 0.78 ? 'warn' : ''
  })
}

function AreaChart() {
  const points = useMemo(() => {
    const pts = []
    for (let i = 0; i <= 20; i++) {
      pts.push(`${i * 5},${60 - Math.sin(i * 0.6) * 25 - Math.random() * 10}`)
    }
    return pts.join(' ')
  }, [])
  return (
    <div className="mcp-area-chart">
      <svg viewBox="0 0 100 70" preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00f3ff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#00f3ff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`0,70 ${points} 100,70`} fill="url(#areaGrad)" />
        <polyline points={points} fill="none" stroke="#00f3ff" strokeWidth="1.5" />
      </svg>
    </div>
  )
}

function DashboardSection() {
  const gridRef = useRef(null)
  const nodeMap = useMemo(generateNodeMap, [])

  useEffect(() => {
    if (gridRef.current) {
      gsap.fromTo(gridRef.current.children,
        { opacity: 0, y: 30, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.08, ease: 'power2.out' }
      )
    }
  }, [])

  return (
    <section className="mcp-section" id="dashboard">
      <h2 className="mcp-section-title">Mission Control</h2>
      <p className="mcp-section-sub">Live system telemetry and threat monitoring across the global node network.</p>
      <div className="mcp-dash-grid" ref={gridRef}>
        {/* CPU */}
        <div className="mcp-dash-card">
          <div className="mcp-dash-card-label"><Cpu size={12} style={{ marginRight: 6, verticalAlign: -1 }} />CPU Load</div>
          <div className="mcp-dash-card-value neon-blue">73%</div>
          <div className="mcp-metric-bar"><div className="mcp-metric-bar-fill blue" style={{ width: '73%' }} /></div>
          <div className="mcp-dash-card-sub">8 cores · 5.2 GHz boost</div>
        </div>
        {/* Memory */}
        <div className="mcp-dash-card">
          <div className="mcp-dash-card-label"><Activity size={12} style={{ marginRight: 6, verticalAlign: -1 }} />Memory</div>
          <div className="mcp-dash-card-value neon-orange">58%</div>
          <div className="mcp-metric-bar"><div className="mcp-metric-bar-fill orange" style={{ width: '58%' }} /></div>
          <div className="mcp-dash-card-sub">37.1 / 64 GB allocated</div>
        </div>
        {/* Threats */}
        <div className="mcp-dash-card">
          <div className="mcp-dash-card-label"><Shield size={12} style={{ marginRight: 6, verticalAlign: -1 }} />Threats Blocked</div>
          <div className="mcp-dash-card-value neon-orange">1,247</div>
          <div className="mcp-dash-card-sub">Last 24h · 0 breaches</div>
        </div>
        {/* Uptime */}
        <div className="mcp-dash-card">
          <div className="mcp-dash-card-label"><Zap size={12} style={{ marginRight: 6, verticalAlign: -1 }} />Uptime</div>
          <div className="mcp-dash-card-value neon-blue">99.97%</div>
          <div className="mcp-dash-card-sub">342 days continuous</div>
        </div>
        {/* Node Map */}
        <div className="mcp-dash-card span-2 row-2">
          <div className="mcp-dash-card-label"><Globe size={12} style={{ marginRight: 6, verticalAlign: -1 }} />Global Node Map</div>
          <div className="mcp-node-map">
            {nodeMap.map((state, i) => (
              <div key={i} className={`mcp-node-dot ${state}`} />
            ))}
          </div>
          <div className="mcp-dash-card-sub" style={{ marginTop: 12 }}>128 nodes · 6 continents · 12ms avg latency</div>
        </div>
        {/* Network Traffic */}
        <div className="mcp-dash-card span-2">
          <div className="mcp-dash-card-label"><Activity size={12} style={{ marginRight: 6, verticalAlign: -1 }} />Network Traffic</div>
          <AreaChart />
          <div className="mcp-dash-card-sub">2.4 TB/s throughput · peak 3.1 TB/s</div>
        </div>
        {/* Security Status */}
        <div className="mcp-dash-card span-2">
          <div className="mcp-dash-card-label"><Lock size={12} style={{ marginRight: 6, verticalAlign: -1 }} />Security Status</div>
          <div className="mcp-dash-card-value neon-blue" style={{ fontSize: 22 }}>ALL SYSTEMS NOMINAL</div>
          <div className="mcp-dash-card-sub">AES-512 encryption · Zero trust architecture · Resistant to quantum attacks</div>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   System Logs Section
   ═══════════════════════════════════════════ */

const LOG_TEMPLATES = [
  { tag: 'INFO', msg: 'Node cluster sync completed in 12ms' },
  { tag: 'INFO', msg: 'Shader pipeline recompiled successfully' },
  { tag: 'WARN', msg: 'Memory pressure detected on node-07' },
  { tag: 'SEC', msg: 'Intrusion attempt blocked from 192.168.x.x' },
  { tag: 'INFO', msg: 'Neural pathway optimization: +3.2% efficiency' },
  { tag: 'SEC', msg: 'Encryption keys rotated (cycle 4471)' },
  { tag: 'WARN', msg: 'Latency spike on EU-West relay (42ms)' },
  { tag: 'INFO', msg: 'Quantum entanglement link established' },
  { tag: 'INFO', msg: 'Data stream compressed: 847TB → 12TB' },
  { tag: 'SEC', msg: 'New exploit signature updated in threat DB' },
  { tag: 'WARN', msg: 'Thermal threshold approaching on GPU array' },
  { tag: 'INFO', msg: 'Holographic cache invalidated and rebuilt' },
  { tag: 'SEC', msg: 'Biometric auth verified for operator-9' },
  { tag: 'INFO', msg: 'Mesh network topology recalculated' },
  { tag: 'WARN', msg: 'Packet loss detected on fiber ring-3' },
]

function LogsSection() {
  const [logs, setLogs] = useState([])
  const bodyRef = useRef(null)
  const idRef = useRef(0)

  useEffect(() => {
    let disposed = false
    const addLog = () => {
      if (disposed) return
      const template = LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)]
      const now = new Date()
      const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
      idRef.current += 1
      const id = `${idRef.current}-${Date.now()}`
      setLogs(prev => [...prev.slice(-30), { ...template, time, id }])
    }
    // Initial burst
    const timers = []
    for (let i = 0; i < 8; i++) timers.push(setTimeout(addLog, i * 200))
    const interval = setInterval(addLog, 1800)
    return () => {
      disposed = true
      timers.forEach(clearTimeout)
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }
  }, [logs])

  return (
    <section className="mcp-section" id="logs">
      <h2 className="mcp-section-title">System Logs</h2>
      <p className="mcp-section-sub">Live event stream from the MCP-2099 kernel. The terminal feed scrolls automatically.</p>
      <div className="mcp-logs">
        <div className="mcp-logs-header">
          <span className="mcp-logs-dot r" />
          <span className="mcp-logs-dot y" />
          <span className="mcp-logs-dot g" />
          <span style={{ marginLeft: 8 }}>mcp2099://kernel/events</span>
        </div>
        <div className="mcp-logs-body" ref={bodyRef}>
          {logs.map(log => (
            <div className="mcp-log-line" key={log.id}>
              <span className="mcp-log-time">[{log.time}]</span>
              <span className={`mcp-log-tag ${log.tag.toLowerCase()}`}>{log.tag}</span>
              <span className="mcp-log-msg">{log.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   Protocol Section
   ═══════════════════════════════════════════ */

const PROTOCOL_CARDS = [
  {
    icon: Lock,
    title: 'Encryption Layer',
    desc: 'AES-512 encryption designed to resist quantum attacks, with rotating key cycles. Layered cryptographic protocols protect all data in transit and at rest.',
    spec: 'CIPHER: AES-512-GCM\nKEY_ROTATION: 3600s\nQUANTUM_SAFE: true\nHANDSHAKE: ECDH-P521',
  },
  {
    icon: Layers,
    title: 'Smart Contract Engine',
    desc: 'Deterministic execution environment for decentralized agreements, optimized for gas efficiency with formal verification and zero knowledge proof support.',
    spec: 'VM: WASM-2099\nGAS_LIMIT: 80M\nZK_PROOFS: enabled\nVERIFICATION: formal',
  },
  {
    icon: Globe,
    title: 'Mesh Network Protocol',
    desc: 'A resilient distributed mesh with global latency below 12ms. The topology recalculates automatically after node failure or network partition.',
    spec: 'TOPOLOGY: dynamic_mesh\nLATENCY: <12ms\nHEAL_TIME: <200ms\nREDUNDANCY: 3x',
  },
  {
    icon: Shield,
    title: 'Zero Trust Security',
    desc: 'Every request is authenticated and authorized regardless of origin, with biometric multifactor protection and continuous behavioral analysis.',
    spec: 'MODEL: zero_trust\nMFA: biometric+token\nANALYSIS: behavioral\nAUDIT: continuous',
  },
  {
    icon: Cpu,
    title: 'Neural Processing Unit',
    desc: 'Custom silicon for live inference at the edge, with 900 TOPS performance, dynamic power scaling, and thermal management.',
    spec: 'PERF: 900 TOPS\nPROCESS: 1.4nm\nTDP: 45-120W\nCOOLING: liquid_metal',
  },
  {
    icon: Terminal,
    title: 'Kernel Interface',
    desc: 'Direct hardware access through a sandboxed syscall layer, with live scheduling and deterministic latency guarantees.',
    spec: 'SYSCALLS: 2048\nSCHEDULER: real_time\nLATENCY: <1μs\nSANDBOX: seccomp-2099',
  },
]

function ProtocolSection() {
  const gridRef = useRef(null)
  useEffect(() => {
    if (gridRef.current) {
      gsap.fromTo(gridRef.current.children,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power2.out' }
      )
    }
  }, [])
  return (
    <section className="mcp-section" id="protocol">
      <h2 className="mcp-section-title">Protocol Specifications</h2>
      <p className="mcp-section-sub">Core system protocols governing encryption, networking, and compute infrastructure.</p>
      <div className="mcp-protocol-grid" ref={gridRef}>
        {PROTOCOL_CARDS.map(card => (
          <div className="mcp-protocol-card" key={card.title}>
            <div className="mcp-protocol-icon"><card.icon size={20} /></div>
            <h3>{card.title}</h3>
            <p>{card.desc}</p>
            <pre className="mcp-protocol-spec">{card.spec}</pre>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   Main Page Component
   ═══════════════════════════════════════════ */

export default function MCP2099({ navigate }) {
  const [loaded, setLoaded] = useState(false)
  const [dark, setDark] = useState(true)
  const [activeSection, setActiveSection] = useState('interface')

  const handleNavigate = useCallback((id) => {
    setActiveSection(id)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Track active section on scroll
  useEffect(() => {
    if (!loaded) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { threshold: 0.3 }
    )
    NAV_ITEMS.forEach(item => {
      const el = document.getElementById(item.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [loaded])

  return (
    <div className={`mcp2099 ${dark ? '' : 'light-mode'}`}>
      <CinematicLoader onComplete={() => setLoaded(true)} />
      <McpNav
        active={activeSection}
        onNavigate={handleNavigate}
        dark={dark}
        onToggleTheme={() => setDark(d => !d)}
      />
      <HeroSection dark={dark} onNavigate={handleNavigate} />
      <NeuralSection dark={dark} />
      <ProtocolSection />
      <LogsSection />
      <DashboardSection />
      <button className="mcp-back-link" onClick={() => navigate && navigate('/services/website-design')}>
        ← Back to Podium Momentum
      </button>
    </div>
  )
}
