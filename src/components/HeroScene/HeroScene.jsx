import React, { useRef, useEffect, useMemo, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Environment, Float } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import styles from './HeroScene.module.css'

// Cheap capability checks (evaluated once on the client) so we can dial the scene
// back on phones / for visitors who prefer reduced motion.
const isLowPower =
  typeof window !== 'undefined' &&
  (window.matchMedia('(max-width: 768px)').matches ||
    window.matchMedia('(pointer: coarse)').matches ||
    (navigator.hardwareConcurrency || 8) <= 4)

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

function GlassModel({ mouse, soundOn, analyser }) {
  const groupRef = useRef()
  const { scene } = useGLTF('/assets/hero.glb')
  const clockRef = useRef(0)
  const ampRef = useRef(0)
  const dataArrayRef = useRef(null)

  useEffect(() => {
    if (analyser) {
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount)
    }
  }, [analyser])

  // Normalise the model: many exported meshes (this one is from trimesh) aren't
  // centred on the origin or sized to any particular unit, which can leave the
  // object off-screen, tiny, or huge. Recenter to the origin and scale so its
  // largest dimension spans a predictable size, regardless of the source GLB.
  const fit = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)
    const maxDim = Math.max(size.x, size.y, size.z) || 1
    const TARGET = 3.0 // world units the object should roughly span
    return { scale: TARGET / maxDim, center }
  }, [scene])

  // Apply an on-brand iridescent liquid-chrome material to every mesh.
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(0x223bdc),   // ultramarine base
          metalness: 1.0,                       // full chrome — reliably visible
          roughness: 0.12,
          transmission: 0.0,                    // opaque so it never washes out
          envMapIntensity: 2.6,
          clearcoat: 1,
          clearcoatRoughness: 0.06,
          iridescence: 1,
          iridescenceIOR: 1.9,
          iridescenceThicknessRange: [120, 760],
        })
        child.castShadow = true
        child.frustumCulled = false            // never cull the single hero object
      }
    })
  }, [scene])

  useFrame((state, delta) => {
    if (!groupRef.current) return
    clockRef.current += delta

    // Audio amplitude — bass-weighted so the sculpture pumps on the beat, with a
    // fast attack / slower release so each kick reads as a distinct expansion.
    if (soundOn && analyser && dataArrayRef.current) {
      const bins = dataArrayRef.current
      analyser.getByteFrequencyData(bins)
      const bassEnd = Math.max(1, Math.floor(bins.length / 3))
      let bass = 0
      for (let i = 0; i < bassEnd; i++) bass += bins[i]
      bass /= bassEnd * 255
      let overall = 0
      for (let i = 0; i < bins.length; i++) overall += bins[i]
      overall /= bins.length * 255
      const level = bass * 0.7 + overall * 0.3
      const k = level > ampRef.current ? 0.45 : 0.12 // snap up, ease down
      ampRef.current = THREE.MathUtils.lerp(ampRef.current, level, k)
    } else {
      ampRef.current = THREE.MathUtils.lerp(ampRef.current, 0, 0.06)
    }

    // Idle rotation (calmed right down when the visitor prefers reduced motion);
    // spins a touch faster on louder passages.
    const motion = prefersReducedMotion ? 0.25 : 1
    groupRef.current.rotation.y += delta * (0.18 + ampRef.current * 0.5) * motion
    groupRef.current.rotation.x = Math.sin(clockRef.current * 0.3) * 0.08 * motion

    // Cursor parallax
    const tx = mouse.current[0] * 0.12
    const ty = -mouse.current[1] * 0.08
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, tx * 0.3, 0.04)
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, tx, 0.04)
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, ty, 0.04)

    // Audio expand / contract — clearly visible pump (±~32%) driven by the beat.
    const targetScale = 1 + ampRef.current * 0.32
    groupRef.current.scale.setScalar(
      THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.22)
    )
  })

  return (
    // groupRef handles rotation / parallax / audio pulse; the inner groups
    // normalise the model's size and recenter it on the origin.
    <group ref={groupRef}>
      <group scale={fit.scale}>
        <group position={[-fit.center.x, -fit.center.y, -fit.center.z]}>
          <primitive object={scene} />
        </group>
      </group>
    </group>
  )
}

function SceneInner({ soundOn, analyser, dimmed }) {
  const mouse = useRef([0, 0])
  const { gl } = useThree()

  useEffect(() => {
    const onMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = (e.clientY / window.innerHeight) * 2 - 1
      mouse.current = [x, y]
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <>
      <ambientLight intensity={0.3} color="#1a2080" />
      <pointLight position={[3, 4, 3]} intensity={60} color="#5577ff" />
      <pointLight position={[-4, -2, 2]} intensity={40} color="#e84a5f" />
      <pointLight position={[0, 0, 5]} intensity={20} color="#ffffff" />

      <Environment preset="studio" />

      <Float
        speed={prefersReducedMotion ? 0 : 1.4}
        rotationIntensity={prefersReducedMotion ? 0 : 0.3}
        floatIntensity={prefersReducedMotion ? 0 : 0.6}
      >
        <Suspense fallback={null}>
          <GlassModel mouse={mouse} soundOn={soundOn} analyser={analyser} />
        </Suspense>
      </Float>

      {/* Bloom is the heaviest pass — skip it on low-power devices to protect FPS. */}
      {!isLowPower && (
        <EffectComposer>
          <Bloom
            intensity={0.8}
            luminanceThreshold={0.55}
            luminanceSmoothing={0.4}
            radius={0.7}
          />
        </EffectComposer>
      )}
    </>
  )
}

// Returns true only if a WebGL context can actually be created. Some browsers
// expose WebGL APIs but fail to make a context (hardware acceleration disabled,
// blocklisted GPU, headless, etc.) — without this check three.js would throw and,
// unguarded, blank the whole page.
function webglAvailable() {
  try {
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch (e) {
    return false
  }
}

// Lightweight, dependency-free stand-in shown when WebGL isn't available (or the
// 3D scene errors): a soft iridescent orb so the centre still feels alive.
export function HeroFallback({ dimmed }) {
  return (
    <div
      className={styles.canvas}
      style={{
        filter: dimmed ? 'brightness(0.35) blur(2px)' : 'none',
        transition: 'filter 0.5s ease',
      }}
    >
      <div className={styles.fallbackOrb} aria-hidden="true" />
    </div>
  )
}

export default function HeroScene({ soundOn, analyser, dimmed }) {
  // Decide once on mount whether to even attempt WebGL.
  const [glOk] = React.useState(() => webglAvailable())
  if (!glOk) return <HeroFallback dimmed={dimmed} />

  return (
    <div
      className={styles.canvas}
      style={{
        filter: dimmed ? 'brightness(0.35) blur(2px)' : 'none',
        transition: 'filter 0.5s ease',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        dpr={isLowPower ? [1, 1] : [1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <SceneInner soundOn={soundOn} analyser={analyser} dimmed={dimmed} />
      </Canvas>
    </div>
  )
}
