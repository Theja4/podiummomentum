import React, { useCallback, useEffect, useRef, useState } from 'react'
import { serviceCatalog, getServicePath, SERVICES_PATH } from './servicesData.js'
import { heroClientLogos } from './heroClientLogos.js'
import ClientLogo from './ClientLogo.jsx'
import './landing-fx.css'

const A = '/assets/'
const CONTACT_PATH = '/contact-us'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ------------------------------------------------------------------ */
/* Shared motion primitives                                            */
/* ------------------------------------------------------------------ */

// One-shot blur/rise reveal for anything carrying [data-fxr].
function useFxReveals(rootRef) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const nodes = [...root.querySelectorAll('[data-fxr]')]
    if (prefersReducedMotion()) {
      nodes.forEach(n => n.classList.add('is-in'))
      return
    }
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in')
        io.unobserve(entry.target)
      }
    }), { threshold: 0.16, rootMargin: '0px 0px -6% 0px' })
    nodes.forEach(n => {
      // A browser refresh can restore the page below an unrevealed element.
      // Mark anything already above the viewport as complete so it remains
      // visible when the visitor scrolls back up.
      if (n.getBoundingClientRect().bottom < 0) n.classList.add('is-in')
      else io.observe(n)
    })
    return () => io.disconnect()
  }, [rootRef])
}

// rAF-throttled scroll + resize subscription.
function useRafScroll(handler) {
  useEffect(() => {
    let frame = 0
    const run = () => { frame = 0; handler() }
    const request = () => { if (!frame) frame = requestAnimationFrame(run) }
    request()
    window.addEventListener('scroll', request, { passive: true })
    window.addEventListener('resize', request, { passive: true })
    return () => {
      window.removeEventListener('scroll', request)
      window.removeEventListener('resize', request)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [handler])
}

const clamp01 = v => Math.max(0, Math.min(1, v))

// Headline that resolves word by word as it scrolls through the viewport,
// upcoming words waiting in a soft blur. `nodes` may mix strings and JSX
// chips; strings are split into scrubbed word spans.
function ScrubWords({ as: Tag = 'h2', className = '', nodes, from = 0.88, to = 0.34, ...rest }) {
  const ref = useRef(null)
  const handler = useRef(() => {})

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const words = [...el.querySelectorAll('.fxw')]
    const n = words.length || 1
    if (prefersReducedMotion()) {
      words.forEach(w => w.style.setProperty('--wp', 1))
      handler.current = () => {}
      return
    }
    handler.current = () => {
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      const start = vh * from
      const end = vh * to
      const p = clamp01((start - rect.top) / Math.max(1, start - end))
      for (let i = 0; i < n; i += 1) {
        const wp = clamp01((p - (i / n) * 0.8) / 0.2)
        words[i].style.setProperty('--wp', wp)
      }
    }
  }, [from, to])

  useRafScroll(() => handler.current())

  let key = 0
  const parts = []
  nodes.forEach(node => {
    if (typeof node !== 'string') {
      parts.push(<React.Fragment key={`c${key += 1}`}>{node}</React.Fragment>)
      return
    }
    node.split(' ').filter(Boolean).forEach(word => {
      parts.push(<span className="fxw" key={`w${key += 1}`}>{word}</span>)
    })
  })

  return <Tag className={`fx-scrub ${className}`} ref={ref} {...rest}>{parts}</Tag>
}

/* ------------------------------------------------------------------ */
/* three.js scenes (lazy loaded, paused offscreen, disposed on unmount) */
/* ------------------------------------------------------------------ */

function makeGlowTexture(THREE, inner, outer) {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  grad.addColorStop(0, inner)
  grad.addColorStop(0.35, outer)
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

// The additive filaments must blend against an in-scene background: over a
// transparent canvas their dark tails would composite as grey streaks on the
// page. Paint the section gradient into the scene itself.
function makeSceneBackground(THREE, style) {
  const size = 1024
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#020d08'
  ctx.fillRect(0, 0, size, size)
  const bloom = (x, y, radius, stops) => {
    const grad = ctx.createRadialGradient(x, y, 0, x, y, radius)
    stops.forEach(([at, color]) => grad.addColorStop(at, color))
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, size, size)
  }
  if (style === 'hero') {
    bloom(size * 0.84, size * 0.08, size * 0.9, [
      [0, 'rgba(6, 35, 26, 0.95)'],
      [1, 'rgba(2, 13, 8, 0)'],
    ])
    bloom(0, size, size * 1.5, [
      [0, '#12b76a'],
      [0.22, '#0a7a49'],
      [0.44, '#063b26'],
      [0.68, 'rgba(2, 13, 8, 0)'],
    ])
  } else {
    bloom(size * 0.5, size * 1.16, size * 1.2, [
      [0, '#12b76a'],
      [0.2, '#0a7a49'],
      [0.42, '#063b26'],
      [0.7, 'rgba(2, 13, 8, 0)'],
    ])
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

// Filament light burst: fine curved rays breathing around a bright core.
function buildBurst(THREE, holder, { density = 1, dim = false, parallax = true, bg = null }) {
  const reduced = prefersReducedMotion()
  const renderer = new THREE.WebGLRenderer({ alpha: !bg, antialias: true, powerPreference: 'low-power' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.domElement.classList.add('fx-canvas')
  holder.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const bgTexture = bg ? makeSceneBackground(THREE, bg) : null
  if (bgTexture) scene.background = bgTexture
  const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 60)
  camera.position.set(0, 0, 7.5)

  const group = new THREE.Group()
  scene.add(group)

  const rayCount = Math.round(240 * density)
  const segments = 22
  const positions = []
  const colors = []
  const white = new THREE.Color('#f4fff9')
  const emerald = new THREE.Color('#67e0a3')
  const deep = new THREE.Color('#127a4d')
  const dir = new THREE.Vector3()
  const perp = new THREE.Vector3()
  const point = new THREE.Vector3()
  const prev = new THREE.Vector3()
  const tmpColor = new THREE.Color()

  for (let i = 0; i < rayCount; i += 1) {
    dir.set(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 1.2,
    ).normalize()
    perp.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
      .cross(dir)
      .normalize()
    const length = 1.4 + Math.pow(Math.random(), 1.6) * 3.4
    const bend = (Math.random() - 0.5) * 1.7
    const fade = dim ? 0.5 : 0.85
    for (let s = 0; s <= segments; s += 1) {
      const t = s / segments
      point.copy(dir)
        .multiplyScalar(t * length)
        .addScaledVector(perp, Math.sin(t * Math.PI) * bend * t)
      if (s > 0) {
        positions.push(prev.x, prev.y, prev.z, point.x, point.y, point.z)
        const glow = Math.pow(1 - t, 2.2) * fade
        tmpColor.copy(white).lerp(t > 0.45 ? deep : emerald, t).multiplyScalar(glow)
        colors.push(tmpColor.r, tmpColor.g, tmpColor.b)
        tmpColor.copy(white).lerp(t > 0.45 ? deep : emerald, t).multiplyScalar(Math.pow(1 - (s / segments), 2.2) * fade)
        colors.push(tmpColor.r, tmpColor.g, tmpColor.b)
      }
      prev.copy(point)
    }
  }

  const rayGeometry = new THREE.BufferGeometry()
  rayGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  rayGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  const rayMaterial = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: dim ? 0.5 : 0.75,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  group.add(new THREE.LineSegments(rayGeometry, rayMaterial))

  const starCount = Math.round(340 * density)
  const starPositions = new Float32Array(starCount * 3)
  for (let i = 0; i < starCount; i += 1) {
    const radius = 4 + Math.random() * 11
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
    starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
    starPositions[i * 3 + 2] = radius * Math.cos(phi) - 4
  }
  const starGeometry = new THREE.BufferGeometry()
  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
  const starMaterial = new THREE.PointsMaterial({
    color: new THREE.Color('#9fe9c4'),
    size: 0.02,
    transparent: true,
    opacity: dim ? 0.28 : 0.45,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  })
  group.add(new THREE.Points(starGeometry, starMaterial))

  const coreTexture = makeGlowTexture(THREE, 'rgba(255,255,255,1)', 'rgba(158,240,198,0.55)')
  const core = new THREE.Sprite(new THREE.SpriteMaterial({
    map: coreTexture,
    transparent: true,
    opacity: dim ? 0.7 : 1,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }))
  core.scale.setScalar(1.5)
  group.add(core)

  const haloTexture = makeGlowTexture(THREE, 'rgba(103,224,163,0.5)', 'rgba(18,122,77,0.22)')
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: haloTexture,
    transparent: true,
    opacity: dim ? 0.4 : 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }))
  halo.scale.setScalar(5.2)
  group.add(halo)

  let width = 1
  let height = 1
  const resize = () => {
    width = holder.clientWidth || 1
    height = holder.clientHeight || 1
    renderer.setSize(width, height)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(holder)

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
  const onPointer = event => {
    pointer.tx = (event.clientX / window.innerWidth - 0.5) * 2
    pointer.ty = (event.clientY / window.innerHeight - 0.5) * 2
  }
  if (parallax && !reduced) window.addEventListener('pointermove', onPointer, { passive: true })

  let visible = true
  const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting }, { threshold: 0 })
  io.observe(holder)

  let frame = 0
  const start = performance.now()
  const render = () => {
    const t = (performance.now() - start) / 1000
    pointer.x += (pointer.tx - pointer.x) * 0.04
    pointer.y += (pointer.ty - pointer.y) * 0.04
    group.rotation.z = t * 0.05
    group.rotation.y = Math.sin(t * 0.11) * 0.24 + pointer.x * 0.22
    group.rotation.x = Math.cos(t * 0.09) * 0.14 - pointer.y * 0.16
    const breathe = 1 + Math.sin(t * 0.7) * 0.025
    group.scale.setScalar(breathe)
    core.material.opacity = (dim ? 0.7 : 1) * (0.86 + Math.sin(t * 1.3) * 0.14)
    renderer.render(scene, camera)
  }
  const loop = () => {
    frame = requestAnimationFrame(loop)
    if (visible) render()
  }
  if (reduced) render()
  else loop()

  return () => {
    if (frame) cancelAnimationFrame(frame)
    io.disconnect()
    ro.disconnect()
    if (parallax && !reduced) window.removeEventListener('pointermove', onPointer)
    rayGeometry.dispose()
    rayMaterial.dispose()
    starGeometry.dispose()
    starMaterial.dispose()
    core.material.map.dispose()
    core.material.dispose()
    halo.material.map.dispose()
    halo.material.dispose()
    bgTexture?.dispose()
    renderer.dispose()
    renderer.domElement.remove()
  }
}

// Chrome podium: three mirrored steps slowly turning under studio light.
function buildPodium(THREE, RoomEnvironment, RoundedBoxGeometry, holder) {
  const reduced = prefersReducedMotion()
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.domElement.classList.add('fx-canvas')
  holder.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.06).texture
  scene.environment = envTexture

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 40)
  camera.position.set(0, 0.55, 5.4)
  camera.lookAt(0, -0.1, 0)

  const group = new THREE.Group()
  scene.add(group)

  const chrome = new THREE.MeshStandardMaterial({
    color: 0xeef5f0,
    metalness: 1,
    roughness: 0.07,
    envMapIntensity: 1.35,
  })
  const steps = [
    { x: -1.16, h: 1.28, rank: 2 },
    { x: 0, h: 1.78, rank: 1 },
    { x: 1.16, h: 0.92, rank: 3 },
  ]
  const geometries = []
  steps.forEach(step => {
    const geometry = new RoundedBoxGeometry(1.06, step.h, 1.06, 5, 0.09)
    geometries.push(geometry)
    const mesh = new THREE.Mesh(geometry, chrome)
    mesh.position.set(step.x, step.h / 2 - 1.16, 0)
    group.add(mesh)
  })

  const brandLight = new THREE.PointLight(0x67e0a3, 26, 12)
  brandLight.position.set(-2.6, -1.4, 2.4)
  scene.add(brandLight)
  const rim = new THREE.DirectionalLight(0xdfffe9, 1.4)
  rim.position.set(3, 4, 2)
  scene.add(rim)

  let width = 1
  let height = 1
  const resize = () => {
    width = holder.clientWidth || 1
    height = holder.clientHeight || 1
    renderer.setSize(width, height)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(holder)

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
  const onPointer = event => {
    pointer.tx = (event.clientX / window.innerWidth - 0.5) * 2
    pointer.ty = (event.clientY / window.innerHeight - 0.5) * 2
  }
  if (!reduced) window.addEventListener('pointermove', onPointer, { passive: true })

  let visible = true
  const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting }, { threshold: 0 })
  io.observe(holder)

  let frame = 0
  const start = performance.now()
  const render = () => {
    const t = (performance.now() - start) / 1000
    pointer.x += (pointer.tx - pointer.x) * 0.045
    pointer.y += (pointer.ty - pointer.y) * 0.045
    group.rotation.y = Math.sin(t * 0.16) * 0.5 + pointer.x * 0.24 + 0.35
    group.rotation.x = 0.02 - pointer.y * 0.07
    group.position.y = Math.sin(t * 0.6) * 0.06
    renderer.render(scene, camera)
  }
  const loop = () => {
    frame = requestAnimationFrame(loop)
    if (visible) render()
  }
  if (reduced) render()
  else loop()

  return () => {
    if (frame) cancelAnimationFrame(frame)
    io.disconnect()
    ro.disconnect()
    if (!reduced) window.removeEventListener('pointermove', onPointer)
    geometries.forEach(geometry => geometry.dispose())
    chrome.dispose()
    envTexture.dispose()
    pmrem.dispose()
    renderer.dispose()
    renderer.domElement.remove()
  }
}

// Chrome rising arrow: the finale's centerpiece, pointed at the top spot.
function buildArrow(THREE, RoomEnvironment, holder) {
  const reduced = prefersReducedMotion()
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.domElement.classList.add('fx-canvas')
  holder.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.06).texture
  scene.environment = envTexture

  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 40)
  camera.position.set(0, 0, 6)

  const shape = new THREE.Shape()
  shape.moveTo(0, 1.42)
  shape.lineTo(1.02, 0.22)
  shape.lineTo(0.44, 0.22)
  shape.lineTo(0.44, -1.42)
  shape.lineTo(-0.44, -1.42)
  shape.lineTo(-0.44, 0.22)
  shape.lineTo(-1.02, 0.22)
  shape.closePath()

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.5,
    curveSegments: 10,
    bevelEnabled: true,
    bevelThickness: 0.14,
    bevelSize: 0.13,
    bevelSegments: 6,
  })
  geometry.center()

  const chrome = new THREE.MeshStandardMaterial({
    color: 0xeef5f0,
    metalness: 1,
    roughness: 0.08,
    envMapIntensity: 1.35,
  })
  const arrow = new THREE.Mesh(geometry, chrome)
  const group = new THREE.Group()
  group.add(arrow)
  scene.add(group)

  const brandLight = new THREE.PointLight(0x67e0a3, 30, 14)
  brandLight.position.set(-2.6, -1.8, 2.6)
  scene.add(brandLight)
  const rim = new THREE.DirectionalLight(0xdfffe9, 1.5)
  rim.position.set(3, 4, 2)
  scene.add(rim)

  let width = 1
  let height = 1
  const resize = () => {
    width = holder.clientWidth || 1
    height = holder.clientHeight || 1
    renderer.setSize(width, height)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(holder)

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
  const onPointer = event => {
    pointer.tx = (event.clientX / window.innerWidth - 0.5) * 2
    pointer.ty = (event.clientY / window.innerHeight - 0.5) * 2
  }
  if (!reduced) window.addEventListener('pointermove', onPointer, { passive: true })

  let visible = true
  const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting }, { threshold: 0 })
  io.observe(holder)

  let frame = 0
  const start = performance.now()
  const render = () => {
    const t = (performance.now() - start) / 1000
    pointer.x += (pointer.tx - pointer.x) * 0.045
    pointer.y += (pointer.ty - pointer.y) * 0.045
    // Tilted toward the upper right: momentum, not signage.
    group.rotation.z = -0.5
    group.rotation.y = Math.sin(t * 0.42) * 0.55 + pointer.x * 0.3
    group.rotation.x = Math.cos(t * 0.3) * 0.1 - pointer.y * 0.12
    group.position.y = Math.sin(t * 0.7) * 0.08
    renderer.render(scene, camera)
  }
  const loop = () => {
    frame = requestAnimationFrame(loop)
    if (visible) render()
  }
  if (reduced) render()
  else loop()

  return () => {
    if (frame) cancelAnimationFrame(frame)
    io.disconnect()
    ro.disconnect()
    if (!reduced) window.removeEventListener('pointermove', onPointer)
    geometry.dispose()
    chrome.dispose()
    envTexture.dispose()
    pmrem.dispose()
    renderer.dispose()
    renderer.domElement.remove()
  }
}

function BurstCanvas({ density = 1, dim = false, parallax = true, bg = null, className = '' }) {
  const holder = useRef(null)
  useEffect(() => {
    let disposed = false
    let cleanup = () => {}
    import('three').then(THREE => {
      if (disposed || !holder.current) return
      cleanup = buildBurst(THREE, holder.current, { density, dim, parallax, bg })
    })
    return () => {
      disposed = true
      cleanup()
    }
  }, [density, dim, parallax, bg])
  return <div className={`fx-canvas-holder ${className}`} ref={holder} aria-hidden="true" />
}

function ArrowCanvas({ className = '' }) {
  const holder = useRef(null)
  useEffect(() => {
    let disposed = false
    let cleanup = () => {}
    Promise.all([
      import('three'),
      import('three/examples/jsm/environments/RoomEnvironment.js'),
    ]).then(([THREE, env]) => {
      if (disposed || !holder.current) return
      cleanup = buildArrow(THREE, env.RoomEnvironment, holder.current)
    })
    return () => {
      disposed = true
      cleanup()
    }
  }, [])
  return <div className={`fx-canvas-holder ${className}`} ref={holder} aria-hidden="true" />
}

function PodiumCanvas({ className = '' }) {
  const holder = useRef(null)
  useEffect(() => {
    let disposed = false
    let cleanup = () => {}
    Promise.all([
      import('three'),
      import('three/examples/jsm/environments/RoomEnvironment.js'),
      import('three/examples/jsm/geometries/RoundedBoxGeometry.js'),
    ]).then(([THREE, env, box]) => {
      if (disposed || !holder.current) return
      cleanup = buildPodium(THREE, env.RoomEnvironment, box.RoundedBoxGeometry, holder.current)
    })
    return () => {
      disposed = true
      cleanup()
    }
  }, [])
  return <div className={`fx-canvas-holder ${className}`} ref={holder} aria-hidden="true" />
}

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

function FxPill({ children, href, navigate, tone = 'bright', className = '' }) {
  const onClick = event => {
    if (href.startsWith('/') || href.startsWith('#')) {
      event.preventDefault()
      navigate(href)
    }
  }
  return (
    <a className={`fx-pill fx-pill--${tone} ${className}`} href={href} onClick={onClick}>
      <span>{children}</span>
    </a>
  )
}

function FxHero({ navigate }) {
  const ref = useRef(null)

  const updateCornerRadius = useCallback(() => {
    const el = ref.current
    if (!el) return

    const scrolledPastHeroTop = Math.max(0, -el.getBoundingClientRect().top)
    const revealDistance = Math.max(240, window.innerHeight * 0.36)
    const progress = clamp01(scrolledPastHeroTop / revealDistance)
    const easedProgress = progress * progress * (3 - 2 * progress)

    el.style.setProperty('--fx-hero-corner-progress', easedProgress.toFixed(4))
  }, [])

  useRafScroll(updateCornerRadius)

  useEffect(() => {
    const el = ref.current
    const id = requestAnimationFrame(() => el?.classList.add('fx-in'))
    return () => cancelAnimationFrame(id)
  }, [])

  const stats = [
    ['4.9', 'Average client rating'],
    ['40+', 'Brands'],
    ['$10M', 'Raised by clients'],
  ]

  return (
    <section className="fx-hero" id="top" ref={ref}>
      <BurstCanvas className="fx-hero-canvas" bg="hero" />
      <div className="fx-hero-grade" aria-hidden="true" />
      <div className="fx-hero-frame">
        <h1 className="fx-hero-title">
          <span className="fx-hero-line fx-el" style={{ '--i': 0 }}>Turn ambition</span>
          <span className="fx-hero-line is-bright fx-el" style={{ '--i': 1 }}>into momentum</span>
        </h1>
        <div className="fx-hero-side fx-el" style={{ '--i': 2 }}>
          <p className="fx-hero-lead">Let’s 10× your brand’s digital presence.</p>
          <div className="fx-hero-cta">
            <FxPill href={CONTACT_PATH} navigate={navigate}>Book a strategy call</FxPill>
            <a
              className="fx-link"
              href="#work"
              onClick={event => { event.preventDefault(); navigate('#work') }}
            >
              See the work
            </a>
          </div>
        </div>
        <dl className="fx-hero-stats fx-el" style={{ '--i': 3 }}>
          {stats.map(([value, label]) => (
            <div className="fx-hero-stat" key={label}>
              <dt>{value}</dt>
              <dd>{label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

const marqueeLogos = [
  ...heroClientLogos,
  { src: `${A}brand-logos/fictional/northstar-ledger.png`, alt: 'Northstar Ledger' },
  { src: `${A}brand-logos/fictional/revora-ai.png`, alt: 'Revora AI' },
  { src: `${A}brand-logos/fictional/bricklane-capital.png`, alt: 'Bricklane Capital' },
]

// Two counter-scrolling rows of muted client logos, right under the hero card.
function FxMarquee() {
  const renderLogo = (logo, index) => logo.brand ? (
    <span className={`fx-mq-lockup fx-mq-lockup--${logo.brand}`} key={`${logo.src}-${index}`}>
      <img src={logo.src} alt="" loading="lazy" />
      <b>{logo.label}</b>
    </span>
  ) : (
    <ClientLogo src={logo.src} alt={logo.alt} className="fx-mq-logo" key={`${logo.src}-${index}`} />
  )
  const rowA = marqueeLogos
  const rowB = [...marqueeLogos].reverse()
  return (
    <section className="fx-mq" aria-label="Clients we have worked with">
      <div className="fx-mq-row fx-mq-row--l"><div>{[...rowA, ...rowA].map(renderLogo)}</div></div>
      <div className="fx-mq-row fx-mq-row--r"><div>{[...rowB, ...rowB].map(renderLogo)}</div></div>
    </section>
  )
}

// Counts a figure up to its real value once the card lands. The width is
// pinned to the final string while running so the suffix never shuffles.
function useCountUp(ref, to, { decimals = 0, duration = 1600 } = {}) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const final = to.toFixed(decimals)
    if (prefersReducedMotion()) {
      el.textContent = final
      return
    }
    let raf = 0
    let start = 0
    const ease = t => 1 - (1 - t) ** 4
    const step = now => {
      if (!start) start = now
      const p = clamp01((now - start) / duration)
      el.textContent = (to * ease(p)).toFixed(decimals)
      if (p < 1) raf = requestAnimationFrame(step)
      else el.style.minWidth = ''
    }
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      io.disconnect()
      el.textContent = final
      el.style.minWidth = `${el.getBoundingClientRect().width}px`
      el.textContent = (0).toFixed(decimals)
      raf = requestAnimationFrame(step)
    }, { threshold: 0.5 })
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [ref, to, decimals, duration])
}

// Pointer-tracked light on each card, exposed to CSS as --mx/--my.
function useProofSpotlight(rowRef) {
  useEffect(() => {
    const row = rowRef.current
    if (!row || prefersReducedMotion()) return
    const cards = [...row.querySelectorAll('.fx-proof-card')]
    const onMove = event => {
      const card = event.currentTarget
      const rect = card.getBoundingClientRect()
      card.style.setProperty('--mx', `${((event.clientX - rect.left) / rect.width) * 100}%`)
      card.style.setProperty('--my', `${((event.clientY - rect.top) / rect.height) * 100}%`)
    }
    const onLeave = event => event.currentTarget.style.setProperty('--mo', '0')
    const onEnter = event => event.currentTarget.style.setProperty('--mo', '1')
    cards.forEach(card => {
      card.addEventListener('pointermove', onMove)
      card.addEventListener('pointerenter', onEnter)
      card.addEventListener('pointerleave', onLeave)
    })
    return () => cards.forEach(card => {
      card.removeEventListener('pointermove', onMove)
      card.removeEventListener('pointerenter', onEnter)
      card.removeEventListener('pointerleave', onLeave)
    })
  }, [rowRef])
}

function FxManifesto() {
  const proofRef = useRef(null)
  const brandsNum = useRef(null)
  const statNum = useRef(null)
  useCountUp(brandsNum, 40)
  useCountUp(statNum, 3.3, { decimals: 1 })
  useProofSpotlight(proofRef)
  const chip = (
    <span className="fx-chip" aria-hidden="true">
      <img src={`${A}brand-mark.svg`} alt="" />
    </span>
  )
  return (
    <section className="fx-manifesto" id="about">
      <p className="fx-kicker" data-fxr>Who we are</p>
      <ScrubWords
        as="h2"
        className="fx-manifesto-title"
        nodes={[
          'Podium Momentum', chip,
          'is a brand and digital growth partner for ambitious companies. We expand their digital presence, increase conversions, and bring them more clients.',
        ]}
      />
      <div className="fx-proof" id="testimonials" ref={proofRef}>
        <article className="fx-proof-card fx-proof-card--brands" data-fxr style={{ '--rd': '0ms' }}>
          <span className="fx-proof-aurora" aria-hidden="true" />
          <span className="fx-proof-light" aria-hidden="true" />
          <div className="fx-proof-card-top">
            <span>Momentum in numbers</span>
            <span>01</span>
          </div>
          <div className="fx-proof-figure">
            <strong><span ref={brandsNum}>40</span><sup>+</sup></strong>
            <p>ambitious brands moved from overlooked to obvious</p>
          </div>
          <ul className="fx-proof-disciplines">
            <li style={{ '--ri': 0 }}>Strategy</li>
            <li style={{ '--ri': 1 }}>Brand</li>
            <li style={{ '--ri': 2 }}>Digital</li>
            <li style={{ '--ri': 3 }}>Growth</li>
          </ul>
        </article>
        <article className="fx-proof-card fx-proof-card--stat" data-fxr style={{ '--rd': '110ms' }}>
          <span className="fx-proof-aurora" aria-hidden="true" />
          <span className="fx-proof-light" aria-hidden="true" />
          <div className="fx-proof-card-top">
            <span>Average outcome</span>
            <span>02</span>
          </div>
          <div className="fx-proof-figure">
            <strong><span ref={statNum}>3.3</span><sup>×</sup></strong>
            <p>conversion lift</p>
          </div>
          <p className="fx-proof-note">measured after a Podium Momentum redesign</p>
        </article>
        <figure className="fx-proof-card fx-proof-card--quote" data-fxr style={{ '--rd': '220ms' }}>
          <span className="fx-proof-aurora" aria-hidden="true" />
          <span className="fx-proof-light" aria-hidden="true" />
          <div className="fx-proof-card-top">
            <span>Client perspective</span>
            <span>03</span>
          </div>
          <blockquote>
            <ScrubWords
              as="p"
              from={0.82}
              to={0.42}
              nodes={['“Podium Momentum turned a complex AI resume product into a story people understand in seconds. The new experience feels sharper, more credible, and gives users confidence to get started.”']}
            />
          </blockquote>
          <figcaption>
            <img src={`${A}eloqwnt/avatar-juan.avif`} alt="" width="44" height="44" loading="lazy" />
            <span><b>Elias Marchetti</b><em>Founder, Rezoomed</em></span>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}

function FxMomentum() {
  const ref = useRef(null)
  useRafScroll(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    const rect = el.getBoundingClientRect()
    const vh = window.innerHeight
    const p = clamp01((vh - rect.top) / (vh + rect.height))
    el.style.setProperty('--mp', p.toFixed(4))
  })
  return (
    <section className="fx-momentum" ref={ref}>
      <span className="fx-momentum-bloom" aria-hidden="true" />
      <PodiumCanvas className="fx-momentum-canvas" />
      <h2 className="fx-momentum-title" aria-label="From underestimated to the obvious choice">
        <ScrubWords
          as="span"
          className="fx-momentum-a"
          nodes={['From underestimated']}
          from={0.94}
          to={0.6}
          aria-hidden="true"
        />
        <ScrubWords
          as="span"
          className="fx-momentum-b"
          nodes={['to the obvious choice']}
          from={0.86}
          to={0.4}
          aria-hidden="true"
        />
      </h2>
    </section>
  )
}

const portfolio = [
  {
    name: 'JobPosted',
    sector: 'Career technology',
    image: `${A}jobposted-thumb.png`,
    href: '/industry/technology',
    result: '3.3× conversion increase',
  },
  {
    name: 'Rezoomed',
    sector: 'AI product',
    image: `${A}rezoomed-thumb.png`,
    href: '/industry/ai',
    result: '1M+ resumes optimized',
  },
  {
    name: 'LikeOn',
    sector: 'Creator economy',
    image: `${A}selected-work/likeon-thumbnail-v2.png`,
    href: '/industry/technology',
    result: '50% order value growth',
  },
  {
    name: 'Northstar Ledger',
    sector: 'Fintech',
    image: `${A}selected-work/northstar-ledger-thumbnail-v2.png`,
    href: '/industry/fintech',
    result: 'Institutional grade rebrand',
  },
  {
    name: 'OrbitNine',
    sector: 'Fintech',
    image: `${A}industry-projects/ft-planet9-4.avif`,
    href: '/industry/fintech',
    result: 'Product UX rebuilt end to end',
  },
]

function FxPortfolio({ navigate }) {
  const sectionRef = useRef(null)
  const bodyRef = useRef(null)
  const cardsRef = useRef([])
  const rollRef = useRef(null)
  const railLinkRef = useRef(null)
  const activeRef = useRef(0)

  // The reference site rides on inertial scrolling, so its cards glide and
  // settle rather than stepping with the wheel. Reproduce that feel locally:
  // scroll positions only set targets, and a persistent rAF loop eases the
  // rendered values toward them. Targets are measured from offsetTop (layout
  // space), so the eased scale/translate never feed back into themselves.
  useEffect(() => {
    const section = sectionRef.current
    const body = bodyRef.current
    if (!section || !body) return
    const reduced = prefersReducedMotion()
    const cards = portfolio.map(() => ({ d: 1, ds: 1, td: 1, tds: 1, lag: 0 }))

    const measure = () => {
      const vh = window.innerHeight
      const sectionRect = section.getBoundingClientRect()
      section.classList.toggle('is-live', sectionRect.top < vh * 0.35 && sectionRect.bottom > vh * 0.75)
      const near = sectionRect.top < vh * 1.6 && sectionRect.bottom > -vh * 0.6

      const bodyTop = body.getBoundingClientRect().top
      let best = 0
      let bestDistance = Infinity
      cardsRef.current.forEach((card, index) => {
        if (!card) return
        const state = cards[index]
        const center = bodyTop + card.offsetTop + card.offsetHeight / 2
        state.tds = (center - vh / 2) / vh
        state.td = Math.min(Math.abs(state.tds), 1)
        if (Math.abs(state.tds) < bestDistance) {
          bestDistance = Math.abs(state.tds)
          best = index
        }
      })
      if (best !== activeRef.current) {
        activeRef.current = best
        rollRef.current?.style.setProperty('--idx', best)
        if (railLinkRef.current) railLinkRef.current.href = portfolio[best].href
      }
      return near
    }

    const write = (state, card) => {
      card.style.setProperty('--d', state.d.toFixed(4))
      card.style.setProperty('--ds', state.ds.toFixed(4))
      card.style.setProperty('--lag', `${state.lag.toFixed(2)}px`)
    }

    if (reduced) {
      let frame = 0
      const staticUpdate = () => {
        frame = 0
        measure()
        cardsRef.current.forEach((card, index) => {
          if (!card) return
          const state = cards[index]
          state.d = state.td
          state.ds = state.tds
          state.lag = 0
          write(state, card)
        })
      }
      const request = () => { if (!frame) frame = requestAnimationFrame(staticUpdate) }
      request()
      window.addEventListener('scroll', request, { passive: true })
      window.addEventListener('resize', request, { passive: true })
      return () => {
        window.removeEventListener('scroll', request)
        window.removeEventListener('resize', request)
        if (frame) cancelAnimationFrame(frame)
      }
    }

    let raf = 0
    let last = performance.now()
    const tick = now => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (!measure()) return
      const ease = 1 - Math.exp(-dt * 7.5)
      const vh = window.innerHeight
      cardsRef.current.forEach((card, index) => {
        if (!card) return
        const state = cards[index]
        state.d += (state.td - state.d) * ease
        state.ds += (state.tds - state.ds) * ease
        state.lag = Math.max(-64, Math.min(64, (state.ds - state.tds) * vh * 0.55))
        write(state, card)
      })
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const openProject = (event, href) => {
    event.preventDefault()
    navigate(href)
  }

  return (
    <section className="fx-port" id="work" ref={sectionRef}>
      <header className="fx-port-head" data-fxr>
        <h2>Recent works</h2>
      </header>
      <div className="fx-port-body">
        <div className="fx-port-rails" aria-hidden="true">
          <div className="fx-rail fx-rail--count">
            <span className="fx-count">
              <span className="fx-count-window">
                <span className="fx-count-roll" ref={rollRef} style={{ '--idx': 0 }}>
                  {portfolio.map((project, index) => <i key={project.name}>{String(index + 1).padStart(2, '0')}</i>)}
                </span>
              </span>
              <em>/ {String(portfolio.length).padStart(2, '0')}</em>
            </span>
          </div>
          <div className="fx-rail fx-rail--cta">
            <a
              className="fx-pill fx-pill--ghost"
              href={portfolio[0].href}
              ref={railLinkRef}
              tabIndex={-1}
              onClick={event => openProject(event, railLinkRef.current?.getAttribute('href') || portfolio[0].href)}
            >
              <span>View project</span>
            </a>
          </div>
        </div>
        <div className="fx-port-cards">
          {portfolio.map((project, index) => (
            <a
              className="fx-port-card"
              href={project.href}
              onClick={event => openProject(event, project.href)}
              ref={node => { cardsRef.current[index] = node }}
              key={project.name}
              aria-label={`${project.name}, ${project.sector}. View project.`}
            >
              <img src={project.image} alt="" loading="lazy" />
              <span className="fx-port-shade" aria-hidden="true" />
              <span className="fx-port-meta" aria-hidden="true">
                <small>{project.sector}</small>
                <strong>{project.name}</strong>
                <em>{project.result}</em>
              </span>
              <span className="fx-pill fx-pill--ghost fx-port-card-cta" aria-hidden="true"><span>View project</span></span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

function FxServices({ navigate }) {
  const sectionRef = useRef(null)
  const cardsRef = useRef([])
  const activeRef = useRef(0)
  const [activeService, setActiveService] = useState(0)
  const serviceCount = serviceCatalog.length

  const updateDeck = useCallback(() => {
    const section = sectionRef.current
    if (!section) return

    const rect = section.getBoundingClientRect()
    const travel = Math.max(1, section.offsetHeight - window.innerHeight)
    const progress = prefersReducedMotion() ? 0 : clamp01(-rect.top / travel)
    const position = progress * Math.max(1, serviceCount - 1)
    const nextActive = Math.min(serviceCount - 1, Math.floor(position + 0.5))
    section.style.setProperty('--fx-service-ratio', (position + 1) / serviceCount)

    if (nextActive !== activeRef.current) {
      activeRef.current = nextActive
      setActiveService(nextActive)
    }

    cardsRef.current.forEach((card, index) => {
      if (!card) return
      const stackDepth = Math.min(Math.max(0, position - index), 5)
      const arrival = index === 0 ? 1 : clamp01(position - (index - 1))
      const hasLanded = arrival >= 1
      const translate = hasLanded
        ? `-${stackDepth * 15}px`
        : `${(1 - arrival) * 108}%`
      const scale = hasLanded ? 1 - stackDepth * 0.015 : 1
      const opacity = index === 0 || arrival > 0.015 ? 1 : 0

      card.style.transform = `translate3d(0, ${translate}, 0) scale(${scale})`
      card.style.opacity = opacity
      card.style.filter = 'none'
    })
  }, [serviceCount])

  useRafScroll(updateDeck)

  const scrollToService = index => {
    const section = sectionRef.current
    if (!section) return
    const sectionTop = window.scrollY + section.getBoundingClientRect().top
    const travel = Math.max(1, section.offsetHeight - window.innerHeight)
    const progress = index / Math.max(1, serviceCount - 1)
    window.scrollTo({
      top: sectionTop + progress * travel,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    })
  }

  return (
    <section
      className="fx-services"
      id="services"
      ref={sectionRef}
      style={{ height: `${100 + (serviceCount - 1) * 52}svh` }}
    >
      <div className="fx-services-sticky">
        <div className="fx-services-head">
          <div>
            <p className="fx-kicker" data-fxr>Our services</p>
            <ScrubWords
              as="h2"
              className="fx-services-title"
              nodes={['Everything your brand needs to move up a level.']}
            />
          </div>
          <div data-fxr>
            <FxPill href={SERVICES_PATH} navigate={navigate} tone="ink">All services</FxPill>
          </div>
        </div>
        <div className="fx-services-experience">
          <nav className="fx-services-index" aria-label="Choose a service card">
            <span className="fx-services-index-label">Our services</span>
            <ol>
              {serviceCatalog.map((service, index) => (
                <li key={service.slug}>
                  <button
                    type="button"
                    className={activeService === index ? 'is-active' : ''}
                    onClick={() => scrollToService(index)}
                    aria-current={activeService === index ? 'step' : undefined}
                  >
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <b>{service.title}</b>
                  </button>
                </li>
              ))}
            </ol>
            <span className="fx-services-index-count" aria-hidden="true">
              <b>{String(activeService + 1).padStart(2, '0')}</b>
              <i />
              <span>{String(serviceCount).padStart(2, '0')}</span>
            </span>
          </nav>

          <div className="fx-services-deck" aria-live="polite">
            {serviceCatalog.map((service, index) => (
              <a
                className={`fx-service-card ${activeService === index ? 'is-active' : ''}`}
                data-service={service.slug}
                href={getServicePath(service.slug)}
                onClick={event => { event.preventDefault(); navigate(getServicePath(service.slug)) }}
                ref={node => { cardsRef.current[index] = node }}
                style={{
                  zIndex: index + 1,
                  transform: index === 0 ? 'translate3d(0, 0, 0)' : 'translate3d(0, 108%, 0)',
                  opacity: index === 0 ? 1 : 0,
                }}
                aria-hidden={activeService !== index}
                tabIndex={activeService === index ? 0 : -1}
                key={service.slug}
              >
                <span className="fx-service-card-media">
                  <img
                    src={`${A}service-carousel-pastel/${service.slug}.jpg`}
                    alt=""
                    loading={index < 2 ? 'eager' : 'lazy'}
                    decoding="async"
                  />
                  <span className="fx-service-card-glow" aria-hidden="true" />
                </span>
                <span className="fx-service-card-body">
                  <span className="fx-service-card-copy">
                    <strong>{service.title}</strong>
                    <span>{service.cardLine}</span>
                  </span>
                  <span className="fx-service-card-link">
                    Explore service <i aria-hidden="true">↗</i>
                  </span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function FxFinale({ navigate }) {
  return (
    <section className="fx-finale">
      <ArrowCanvas className="fx-finale-canvas" />
      <div className="fx-finale-frame">
        <ScrubWords
          as="h2"
          className="fx-finale-title"
          nodes={['Ready to take the top spot on the podium?']}
          from={1}
          to={0.62}
        />
        <div data-fxr>
          <FxPill href={CONTACT_PATH} navigate={navigate} tone="glass">Book a strategy call</FxPill>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */

export default function LandingFx({ navigate }) {
  const rootRef = useRef(null)
  useFxReveals(rootRef)

  useEffect(() => {
    document.body.classList.add('fx-landing')
    return () => document.body.classList.remove('fx-landing')
  }, [])

  // The shared footer carries the site-wide [data-reveal] entrance and sits
  // outside this root, so reveal it from here.
  useEffect(() => {
    const nodes = [...document.querySelectorAll('footer[data-reveal]')]
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-inview')
        io.unobserve(entry.target)
      }
    }), { threshold: 0.05 })
    nodes.forEach(node => io.observe(node))
    return () => io.disconnect()
  }, [])

  return (
    <main className="fx-main" ref={rootRef}>
      <FxHero navigate={navigate} />
      <FxMarquee />
      <FxManifesto />
      <div className="fx-dark-run">
        <FxPortfolio navigate={navigate} />
        <FxMomentum />
      </div>
      <FxServices navigate={navigate} />
      <FxFinale navigate={navigate} />
    </main>
  )
}
