// 'Beyond' — pinned particle-sphere interlude (three.js points + shaders),
// choreographed after the reference film (f_041 transition):
//
//   1. THE BLOOM (entry, raw scroll): while the sticky stage rises over the
//      carousel, a black four-point sparkle — viewport-anchored (fixed), so
//      it stays centred on the violet card instead of riding up with the
//      incoming panel — grows from the card's orb size to well past the
//      viewport diagonal, wiping the page to black. The compact particle
//      ring and the small white centre sparkle fade/scale in inside the
//      star as it opens. Once the stage pins, fixed and absolute coincide
//      exactly and the bloom rejoins the stage flow.
//   2. THE POPS (pinned, smoothed scrub): once black, "Beyond" (top left),
//      the paragraphs (bottom left) and "all / limits" (bottom right, line
//      by line) pop in with a scale/blur settle while the ring blows out
//      into the dispersed galaxy field.
//   3. THE HOLD: the scattered field idles (spin + wobble + pointer tilt)
//      until the canvas dims for the WorkRail handoff.
//
// All motion runs inside one rAF loop writing to refs — no per-frame React
// state. three.js is imported lazily on mount.
import { useEffect, useLayoutEffect, useRef } from 'react'
import Sparkle from './Sparkle.jsx'
import { BEYOND } from './data.js'
import {
  clamp01,
  easeInOutCubic,
  easeOutCubic,
  getScroll,
  lerp,
  range,
  reducedMotion,
  usePointer,
  useProgress,
  useRafLoop,
  useVisible,
} from './motion.js'
import './beyond.css'

// —— tunables ————————————————————————————————————————————————————————
const COUNT_DESKTOP = 22000 // particle budget on desktop
const COUNT_MOBILE = 9000 // small screens / high-DPR phones
const MOBILE_QUERY = '(max-width: 700px)'
const RING_RADIUS = 2.2 // major radius of the torus
const TUBE_RADIUS = 0.62 // tube radius — fat galaxy ring around a dark core
const DUST_FRACTION = 0.28 // share of points scattered as loose stardust
const POINT_SIZE = 14 // base gl_PointSize factor
const MAX_DPR = 1.75
const CAM_FOV = 45
const CAM_Z_START = 8.2 // ring framed tight so it fits inside the bloom star
const CAM_Z_END = 7.2 // gentle push-in while the shell disperses
const CAM_Z_RANGE = [0.05, 0.5]
const SPREAD_MAX = 1.0 // full dispersal
const SPREAD_RANGE = [0.05, 0.42] // dispersal scrubs across this sticky window
const ROT_SPEED = 0.05 // continuous spin, rad/s
const ROT_SCROLL = 0.9 // extra rotation.y across the section, rad
const BASE_TILT_X = 0.62 // ring tipped toward the viewer — ellipse with a hole
const TILT_X = 0.18 // extra rotation.x tipped in during the dispersal
const TILT_RANGE = [0.1, 0.6]
const POINTER_ROT = 0.12 // pointer parallax on the group, rad

// —— the bloom (driven by raw entry progress: section top rising through
//    the viewport — overlaps the tail of the carousel) ————————————————
const WIPE_START_PX = 190 // ~the violet card's black orb, so it reads as the orb expanding
const WIPE_EXP = 1.5 // accelerating growth: a slow window, then a sudden engulf
const WIPE_FADE = [0, 0.06] // star materialises out of the orb
const STAR_ON = 0.04 // white centre sparkle pops in early in the bloom
const RING_POP = [0.35, 1] // galaxy scales up from the centre inside the star
const RING_POP_FROM = 0.55
const CANVAS_IN = [0.55, 0.85] // points fade in once the star is wide enough
const GLOW_IN = [0.8, 1] // ambient violet only once the star nearly covers
const WAIST = 0.2333 // sparkle waist radius as a fraction of element size

// —— the pops (driven by smoothed sticky progress once pinned) ————————
const WORD_A_RANGE = [0.02, 0.11] // "Beyond" pops first
const COPY_RANGE = [0.06, 0.16] // paragraphs follow
const WORD_B_START = 0.09 // "all" / "limits" — line i: START + i*STEP, span WORD_B_SPAN
const WORD_B_SPAN = 0.09
const WORD_B_STEP = 0.045
const POP_SCALE = 1.16 // pop = settle from slightly larger + unblur
const POP_BLUR = 10 // px
const COPY_RISE = 42 // px
const CANVAS_OUT = [0.93, 1] // canvas dims out across the final stretch
const WORD_A_DRIFT = -12 // vh of upward parallax across the section
const WORD_B_DRIFT = -20

// —— shaders —————————————————————————————————————————————————————————
const VERT = /* glsl */ `
uniform float uTime;
uniform float uSpread;
uniform float uSize;
uniform float uPixelRatio;
attribute float aRand;
attribute float aPhase;
varying float vRand;
varying float vBoost;

// hash a vec3 seed into a pseudo-random unit vector
vec3 hashDir(vec3 p) {
  p = fract(p * vec3(0.1031, 0.1030, 0.0973));
  p += dot(p, p.yxz + 33.33);
  vec3 v = fract((p.xxy + p.yxx) * p.zyx) - 0.5;
  return normalize(v + vec3(1e-5));
}

void main() {
  vRand = aRand;
  vec3 dir = hashDir(position);
  // shell position blown outward along its own normal (low per-point
  // randomness so the dispersal reads as an expanding shell, not noise)
  vec3 pos = position * (1.0 + uSpread * (0.6 + aRand * 1.1)) + dir * uSpread * 0.55;
  // small curl-ish wobble, per-point speed and phase
  float wob = sin(uTime * (0.5 + aRand * 0.9) + aPhase);
  pos += vec3(dir.y, dir.z, dir.x) * wob * 0.055;
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  float dist = max(0.001, -mv.z);
  gl_PointSize = uSize * uPixelRatio * (1.0 + aRand) / dist;
  vBoost = clamp(1.0 - (dist - 3.0) / 5.5, 0.0, 1.0);
}
`

const FRAG = /* glsl */ `
varying float vRand;
varying float vBoost;

void main() {
  float d = length(gl_PointCoord - vec2(0.5));
  float alpha = smoothstep(0.5, 0.12, d);
  if (alpha <= 0.01) discard;
  vec3 deep = vec3(0.486, 0.227, 0.929); // #7c3aed
  vec3 glow = vec3(0.659, 0.333, 0.969); // #a855f7
  vec3 pale = vec3(0.941, 0.671, 0.988); // #f0abfc
  vec3 col = mix(deep, glow, smoothstep(0.08, 0.6, vRand));
  col = mix(col, pale, smoothstep(0.6, 0.95, vRand));
  col *= 1.35 + vBoost * 0.9; // hot near the camera; additive stacking clips to white
  gl_FragColor = vec4(col, alpha);
}
`

export default function Beyond({ navigate } = {}) {
  // No internal links in this section; `navigate` is accepted for API
  // consistency with the other landing sections (and may be undefined).
  void navigate

  const rootRef = useRef(null)
  const stageRef = useRef(null)
  const bloomRef = useRef(null)
  const wipeRef = useRef(null)
  const glowRef = useRef(null)
  const canvasRef = useRef(null)
  const wordARef = useRef(null)
  const wordBRef = useRef(null)
  const copyRef = useRef(null)
  const starRef = useRef(null)
  const threeRef = useRef(null)
  // non-DOM flags toggled across progress thresholds
  const fxRef = useRef({ starOn: false, bloomPinned: null, bloomShown: null })
  const reducedRef = useRef(null)
  const isReduced = () => {
    if (reducedRef.current === null) reducedRef.current = reducedMotion()
    return reducedRef.current
  }

  const prog = useProgress(rootRef, { mode: 'sticky', smooth: 0.09 })
  const ptr = usePointer(0.075)
  const visible = useVisible(rootRef)
  const visibleRef = useRef(true)
  useEffect(() => {
    visibleRef.current = visible
  }, [visible])

  // Initial states for the scripted path (skipped for reduced motion, where
  // CSS defaults already show the final static layout).
  useLayoutEffect(() => {
    if (isReduced()) return
    const copy = copyRef.current
    if (copy) {
      copy.style.opacity = '0'
      copy.style.transform = `translate3d(0, ${COPY_RISE}px, 0)`
    }
    const wa = wordARef.current
    if (wa) wa.style.opacity = '0'
    const wb = wordBRef.current
    if (wb) [...wb.children].forEach(line => {
      line.style.opacity = '0'
    })
    const star = starRef.current
    if (star) {
      star.style.opacity = '0'
      star.style.transform = 'translate(-50%, -50%) scale(0)'
    }
    const canvas = canvasRef.current
    if (canvas) canvas.style.opacity = '0'
    const glow = glowRef.current
    if (glow) glow.style.opacity = '0'
    const wipe = wipeRef.current
    if (wipe) wipe.style.opacity = '0'
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // —— three.js scene (lazy import, disposed on unmount) ————————————————
  useEffect(() => {
    let alive = true
    let cleanup = null
    const canvas = canvasRef.current
    const stage = stageRef.current
    if (!canvas || !stage) return undefined

    ;(async () => {
      let THREE
      try {
        THREE = await import('three')
      } catch {
        return // no WebGL module — CSS glow + overlay still render
      }
      if (!alive) return

      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      const small =
        window.matchMedia(MOBILE_QUERY).matches || (window.devicePixelRatio || 1) > 2
      const count = small ? COUNT_MOBILE : COUNT_DESKTOP

      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        powerPreference: 'high-performance',
      })
      renderer.setPixelRatio(dpr)
      renderer.setClearColor(0x000000, 0) // transparent — page black shows through

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(CAM_FOV, 1, 0.1, 40)
      camera.position.z = CAM_Z_START
      const group = new THREE.Group()
      scene.add(group)

      // Galaxy ring: ~72% of points on a fat torus (major radius RING_RADIUS,
      // jittered tube) so a dark core stays open around the centre sparkle —
      // the rest a loose flattened shell of stardust for texture
      const positions = new Float32Array(count * 3)
      const rands = new Float32Array(count)
      const phases = new Float32Array(count)
      const golden = Math.PI * (3 - Math.sqrt(5))
      for (let i = 0; i < count; i++) {
        if (Math.random() < DUST_FRACTION) {
          const y = 1 - (i / (count - 1)) * 2
          const rr = Math.sqrt(Math.max(0, 1 - y * y))
          const theta = golden * i
          const rad = RING_RADIUS * (0.55 + Math.random() * 0.75)
          positions[i * 3] = Math.cos(theta) * rr * rad
          positions[i * 3 + 1] = y * rad * 0.6
          positions[i * 3 + 2] = Math.sin(theta) * rr * rad
        } else {
          const theta = golden * i
          const phi = Math.random() * Math.PI * 2
          const tube = TUBE_RADIUS * (0.75 + Math.random() * 0.5)
          const rad = RING_RADIUS + Math.cos(phi) * tube
          positions[i * 3] = Math.cos(theta) * rad
          positions[i * 3 + 1] = Math.sin(phi) * tube
          positions[i * 3 + 2] = Math.sin(theta) * rad
        }
        rands[i] = Math.random()
        phases[i] = Math.random() * Math.PI * 2
      }
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geometry.setAttribute('aRand', new THREE.BufferAttribute(rands, 1))
      geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))

      const uniforms = {
        uTime: { value: 0 },
        uSpread: { value: 0 },
        uSize: { value: POINT_SIZE },
        uPixelRatio: { value: dpr },
      }
      const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
      const points = new THREE.Points(geometry, material)
      points.frustumCulled = false // particles disperse past the base bounds
      group.add(points)

      const t = {
        renderer,
        scene,
        camera,
        group,
        uniforms,
        time: 0,
        rotY: Math.random() * Math.PI * 2,
      }
      threeRef.current = t

      const resize = () => {
        const w = stage.clientWidth || 1
        const h = stage.clientHeight || 1
        renderer.setSize(w, h, false)
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        if (reducedRef.current) renderer.render(scene, camera)
      }
      const ro = new ResizeObserver(resize)
      ro.observe(stage)
      resize()

      if (isReduced()) {
        // single static frame — no rAF rendering, no scroll scrub
        uniforms.uSpread.value = 0.25
        uniforms.uTime.value = 1.7
        camera.position.z = (CAM_Z_START + CAM_Z_END) / 2
        group.rotation.set(BASE_TILT_X, 0.7, 0)
        renderer.render(scene, camera)
      }

      cleanup = () => {
        ro.disconnect()
        if (threeRef.current === t) threeRef.current = null
        geometry.dispose()
        material.dispose()
        renderer.dispose()
        if (renderer.forceContextLoss) renderer.forceContextLoss()
      }
    })()

    return () => {
      alive = false
      if (cleanup) cleanup()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // —— the one loop: DOM overlay + WebGL, all imperative ————————————————
  useRafLoop(dt => {
    if (isReduced()) return
    if (!visibleRef.current) return
    const p = prog.current
    const fx = fxRef.current
    const { vh } = getScroll()

    // Entry progress: 0 when the section top touches the viewport bottom,
    // 1 when the stage pins at the top. Raw (unsmoothed) so the wipe tracks
    // the wheel exactly; overlaps the carousel's scroll-away tail.
    const stage = stageRef.current
    const stageTop = stage ? stage.getBoundingClientRect().top : vh
    const enterP = clamp01((vh - stageTop) / vh)

    // The bloom is viewport-anchored (fixed) while the stage rises over the
    // carousel, so the star expands out of the centred card rather than
    // riding up with the incoming panel (which would also clip it to the
    // section box). Once the stage pins at the top, fixed and absolute
    // coincide pixel-for-pixel and the bloom rejoins the stage flow, so the
    // black ground scrolls away naturally at the exit.
    const bloom = bloomRef.current
    if (bloom) {
      const pinned = stageTop <= 0.5
      if (fx.bloomPinned !== pinned) {
        fx.bloomPinned = pinned
        bloom.style.position = pinned ? 'absolute' : 'fixed'
      }
      const showing = enterP > 0
      if (fx.bloomShown !== showing) {
        fx.bloomShown = showing
        bloom.style.visibility = showing ? 'visible' : 'hidden'
      }
    }

    // Black sparkle: orb-sized → past the viewport diagonal. The pow() curve
    // opens the window slowly, then the concave waist suddenly swallows the
    // last of the page — the signature beat of the reference transition.
    const wipe = wipeRef.current
    if (wipe) {
      const size = wipe.clientWidth || 1
      const cover = (Math.hypot(window.innerWidth || 1, vh) * 0.54) / (WAIST * size)
      const s = lerp(Math.max(0.05, WIPE_START_PX / size), cover, Math.pow(enterP, WIPE_EXP))
      wipe.style.transform = `translate(-50%, -50%) scale(${s.toFixed(4)})`
      wipe.style.opacity = String(range(enterP, WIPE_FADE[0], WIPE_FADE[1]))
    }

    // ambient violet — only once the star nearly covers, so it never tints
    // the carousel peeking around the star's concave edges
    const glow = glowRef.current
    if (glow) glow.style.opacity = String(range(enterP, GLOW_IN[0], GLOW_IN[1]))

    // particle canvas: fades in once the star is wide enough to hold the
    // ring, then dims out across the final stretch for the WorkRail handoff
    const canvas = canvasRef.current
    if (canvas) {
      const fadeIn = range(enterP, CANVAS_IN[0], CANVAS_IN[1])
      const fadeOut = 1 - range(p, CANVAS_OUT[0], CANVAS_OUT[1]) * 0.75
      canvas.style.opacity = String(Math.min(fadeIn, fadeOut))
    }

    // white centre sparkle: carries over from the card — pops in early in
    // the bloom (CSS animation owns it from there, then the pulse)
    const star = starRef.current
    if (star) {
      const on = enterP > STAR_ON
      if (on !== fx.starOn) {
        fx.starOn = on
        star.classList.toggle('pm2-beyond-star--on', on)
        if (on) {
          star.style.opacity = ''
          star.style.transform = ''
        } else {
          star.style.opacity = '0'
          star.style.transform = 'translate(-50%, -50%) scale(0)'
        }
      }
    }

    // —— the pops: staggered scale/blur settles once the page is black ————

    // "Beyond" (top left) pops first + keeps its slow upward drift
    const wa = wordARef.current
    if (wa) {
      const e = easeOutCubic(range(p, WORD_A_RANGE[0], WORD_A_RANGE[1]))
      const drift = (WORD_A_DRIFT / 100) * vh * p
      wa.style.opacity = String(e)
      wa.style.transform = `translate3d(0, ${drift.toFixed(1)}px, 0) scale(${lerp(POP_SCALE, 1, e).toFixed(4)})`
      wa.style.filter = e >= 1 ? '' : `blur(${((1 - e) * POP_BLUR).toFixed(1)}px)`
    }

    // paragraphs (bottom left) fade + rise in across their window
    const copy = copyRef.current
    if (copy) {
      const e = easeOutCubic(range(p, COPY_RANGE[0], COPY_RANGE[1]))
      copy.style.opacity = String(e)
      copy.style.transform = `translate3d(0, ${((1 - e) * COPY_RISE).toFixed(1)}px, 0)`
    }

    // "all / limits" (bottom right) — container drifts, lines pop in sequence
    const wb = wordBRef.current
    if (wb) {
      wb.style.transform = `translate3d(0, ${((WORD_B_DRIFT / 100) * vh * p).toFixed(1)}px, 0)`
      const lines = wb.children
      for (let i = 0; i < lines.length; i += 1) {
        const a = WORD_B_START + i * WORD_B_STEP
        const e = easeOutCubic(range(p, a, a + WORD_B_SPAN))
        const line = lines[i]
        line.style.opacity = String(e)
        line.style.transform = `scale(${lerp(POP_SCALE, 1, e).toFixed(4)})`
        line.style.filter = e >= 1 ? '' : `blur(${((1 - e) * POP_BLUR).toFixed(1)}px)`
      }
    }

    // three.js scene
    const t = threeRef.current
    if (t) {
      t.time += dt / 1000
      t.rotY += (dt / 1000) * ROT_SPEED
      t.uniforms.uTime.value = t.time
      // the ring stays crisp through the bloom, then blows out into the
      // scattered galaxy while the type pops land
      t.uniforms.uSpread.value =
        easeInOutCubic(range(p, SPREAD_RANGE[0], SPREAD_RANGE[1])) * SPREAD_MAX
      t.camera.position.z = lerp(
        CAM_Z_START,
        CAM_Z_END,
        easeInOutCubic(range(p, CAM_Z_RANGE[0], CAM_Z_RANGE[1])),
      )
      // the galaxy pops in from the centre of the opening star
      t.group.scale.setScalar(
        lerp(RING_POP_FROM, 1, easeOutCubic(range(enterP, RING_POP[0], RING_POP[1]))),
      )
      t.group.rotation.y = t.rotY + p * ROT_SCROLL + ptr.current.x * POINTER_ROT
      t.group.rotation.x =
        BASE_TILT_X +
        lerp(0, TILT_X, range(p, TILT_RANGE[0], TILT_RANGE[1])) +
        ptr.current.y * POINTER_ROT
      t.renderer.render(t.scene, t.camera)
    }
  })

  return (
    <section ref={rootRef} className="pm2-beyond pm2-on-dark" id="about">
      <div ref={stageRef} className="pm2-beyond-stage">
        {/* the bloom: everything that must stay viewport-centred while the
            stage rises over the carousel — the black wipe star, the ambient
            glow, the particle ring and the centre sparkle */}
        <div ref={bloomRef} className="pm2-beyond-bloom" aria-hidden="true">
          <div ref={wipeRef} className="pm2-beyond-wipe">
            <Sparkle size={160} color="#07030e" className="pm2-beyond-wipe-svg" />
          </div>
          <div ref={glowRef} className="pm2-beyond-glow" />
          <canvas ref={canvasRef} className="pm2-beyond-canvas" />
          <div ref={starRef} className="pm2-beyond-star">
            <Sparkle size={40} color="#ffffff" className="pm2-beyond-star-svg" />
          </div>
        </div>

        <div className="pm2-beyond-overlay">
          <h2 className="pm2-beyond-heading">
            <span ref={wordARef} className="pm2-beyond-word pm2-beyond-word--a">
              {BEYOND.wordA}
            </span>
            <span ref={wordBRef} className="pm2-beyond-word pm2-beyond-word--b">
              {BEYOND.wordB.split(' ').map(w => (
                <span key={w} className="pm2-beyond-word-line">
                  {w}
                </span>
              ))}
            </span>
          </h2>

          <div ref={copyRef} className="pm2-beyond-copy">
            <p>{BEYOND.para1}</p>
            <p>{BEYOND.para2}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
