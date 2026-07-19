// ChromeStar — the liquid-chrome four-point sparkle, rendered with three.js.
// three is loaded lazily inside the effect (never a top-level import) so the
// landing's first paint stays light. The render loop runs inside useRafLoop,
// pauses while offscreen (useVisible), and disposes everything on unmount.
//
// Props:
//   className / style — passed to the host div (sizing comes from the parent)
//   spin = 1          — multiplier on the slow frontal sway (rotation.y)
//   scaleRef          — optional MutableRefObject<number>; when provided the
//                       mesh scale is multiplied by scaleRef.current each frame
//                       (Finale drives this with scroll-scrubbed enter progress)
import { useEffect, useRef } from 'react'
import { useRafLoop, usePointer, useVisible, reducedMotion, lerp } from './motion.js'

// —— tunables ————————————————————————————————————————————————————————
const SPARKLE_OUTER = 1 // tip radius on the XY plane (angles 0/90/180/270)
const SPARKLE_CTRL = 0.3 // control-point radius at the 45° offsets
const EXTRUDE = {
  depth: 0.34,
  bevelEnabled: true,
  bevelThickness: 0.06,
  bevelSize: 0.05,
  bevelSegments: 8,
  curveSegments: 64,
}
const CAMERA_FOV = 32
const CAMERA_Z = 5.0 // pulled back so the arm tips never crop at full scale
const MAX_DPR = 1.75
const SWAY_Y_SPEED = 0.22 // rad/s — frontal sway, scaled by the spin prop
const SWAY_Y_AMP = 0.55 // rad — oscillates around 0, never edge-on
const SWAY_SPEED = 0.4 // rad/s — sin() sway on rotation.x
const SWAY_AMP = 0.08 // rad
const POINTER_AMP = 0.2 // rad max pointer parallax
const POINTER_LERP = 0.06 // extra smoothing on top of usePointer
const STILL_ROT = [0.06, 0.4, 0] // reduced-motion static pose (frontal-ish)

export default function ChromeStar({ className = '', style, spin = 1, scaleRef = null }) {
  const hostRef = useRef(null)
  const apiRef = useRef(null) // { renderer, scene, camera, mesh } once three has loaded
  const visible = useVisible(hostRef)
  const pointer = usePointer(0.06)
  // Mutated every render so the async init + rAF loop always read fresh values.
  const live = useRef({ spin: 1, scaleRef: null, visible: true, reduced: false })
  live.current.spin = spin
  live.current.scaleRef = scaleRef
  live.current.visible = visible
  const motion = useRef({ px: 0, py: 0 })

  useEffect(() => {
    const host = hostRef.current
    if (!host) return undefined
    let disposed = false
    let teardown = null

    const init = async () => {
      const THREE = await import('three')
      const { RoomEnvironment } = await import(
        'three/examples/jsm/environments/RoomEnvironment.js'
      )
      if (disposed || !hostRef.current) return

      const reduced = reducedMotion()
      live.current.reduced = reduced

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      })
      renderer.setClearColor(0x000000, 0)
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.05
      const canvas = renderer.domElement
      canvas.style.display = 'block'
      canvas.style.width = '100%'
      canvas.style.height = '100%'
      host.appendChild(canvas)

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.1, 50)
      camera.position.set(0, 0, CAMERA_Z)

      // Chrome reflections: prefiltered room environment.
      const pmrem = new THREE.PMREMGenerator(renderer)
      const roomEnv = new RoomEnvironment()
      const envRT = pmrem.fromScene(roomEnv, 0.04)
      scene.environment = envRT.texture
      roomEnv.traverse(obj => {
        obj.geometry?.dispose?.()
        obj.dispose?.() // InstancedMesh instance attributes
        if (obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
          mats.forEach(m => m.dispose?.())
        }
      })

      // Four-point sparkle silhouette: tips on the axes, concave quadratic
      // curves through control points at 45° — matches Sparkle.jsx's path.
      const shape = new THREE.Shape()
      const R = SPARKLE_OUTER
      const c = SPARKLE_CTRL * Math.SQRT1_2
      shape.moveTo(0, R)
      shape.quadraticCurveTo(c, c, R, 0)
      shape.quadraticCurveTo(c, -c, 0, -R)
      shape.quadraticCurveTo(-c, -c, -R, 0)
      shape.quadraticCurveTo(-c, c, 0, R)
      const geometry = new THREE.ExtrudeGeometry(shape, EXTRUDE)
      geometry.center()
      const material = new THREE.MeshStandardMaterial({
        color: 0xf2f2f7,
        metalness: 1.0,
        roughness: 0.1,
        envMapIntensity: 1.5,
        flatShading: false,
      })
      const mesh = new THREE.Mesh(geometry, material)
      scene.add(mesh)

      // Liquid-metal lighting: emerald kick low-left, cool rim high-right,
      // plus a narrow white spot from the upper-left that carves the hard
      // specular streak along an arm (the f_067 edge highlight).
      const mintLight = new THREE.PointLight(0x2fbf7f, 30, 0, 2)
      mintLight.position.set(-2.4, -2.0, 2.2)
      scene.add(mintLight)
      const rimLight = new THREE.DirectionalLight(0xf5f7ff, 2.4)
      rimLight.position.set(3, 4, 2.5)
      scene.add(rimLight)
      const streak = new THREE.SpotLight(0xffffff, 150, 0, 0.28, 0.45, 2)
      streak.position.set(-4, 4.5, 3)
      streak.target.position.set(0, 0, 0)
      scene.add(streak)
      scene.add(streak.target)

      const applyScale = () => {
        const sr = live.current.scaleRef
        mesh.scale.setScalar(sr ? Math.max(0.001, sr.current) : 1)
      }

      const setSize = () => {
        const w = Math.max(1, host.clientWidth)
        const h = Math.max(1, host.clientHeight)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_DPR))
        renderer.setSize(w, h, false)
        camera.aspect = w / h
        camera.updateProjectionMatrix()
      }
      setSize()
      const ro = new ResizeObserver(() => {
        setSize()
        if (reduced) renderer.render(scene, camera) // keep the still frame crisp
      })
      ro.observe(host)

      if (reduced) {
        // Static single frame (with env) — no rAF spin.
        mesh.rotation.set(STILL_ROT[0], STILL_ROT[1], STILL_ROT[2])
        applyScale()
        renderer.render(scene, camera)
      }

      apiRef.current = { renderer, scene, camera, mesh, applyScale }

      teardown = () => {
        ro.disconnect()
        geometry.dispose()
        material.dispose()
        envRT.dispose()
        pmrem.dispose()
        renderer.dispose()
        renderer.forceContextLoss?.()
        if (canvas.parentNode === host) host.removeChild(canvas)
        apiRef.current = null
      }
    }

    init()
    return () => {
      disposed = true
      if (teardown) teardown()
    }
  }, [])

  useRafLoop((dt, now) => {
    const api = apiRef.current
    if (!api || live.current.reduced || !live.current.visible) return
    const m = motion.current
    const t = now / 1000
    m.px = lerp(m.px, pointer.current.x * POINTER_AMP, POINTER_LERP)
    m.py = lerp(m.py, pointer.current.y * POINTER_AMP, POINTER_LERP)
    // Frontal sway: rotation.y oscillates around 0 (never edge-on) — a slow
    // majestic rock reads better than a full spin behind the finale copy.
    api.mesh.rotation.y = Math.sin(t * SWAY_Y_SPEED * live.current.spin) * SWAY_Y_AMP + m.px
    api.mesh.rotation.x = Math.sin(t * SWAY_SPEED) * SWAY_AMP - m.py
    api.applyScale()
    api.renderer.render(api.scene, api.camera)
  })

  return (
    <div
      ref={hostRef}
      className={`pm2-chrome-star ${className}`.trim()}
      style={{ display: 'block', width: '100%', height: '100%', ...style }}
      aria-hidden="true"
    />
  )
}
