import { cn } from "@/lib/utils";
import { useCustomizerStore } from "@/store/useCustomizerStore";
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { Component, Suspense, useEffect, useRef } from "react";
import StoneModel from "./StoneModel";

// ── Canvas Error Boundary ──────────────────────────────────────────────────
/**
 * Catches R3F canvas errors (texture load failures, WebGL context loss, etc.)
 * and renders a friendly fallback instead of a blank screen.
 */
class CanvasErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[ThreeCanvas] Canvas error caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="w-full h-full flex flex-col items-center justify-center
                        bg-brand-950 rounded-xl gap-4 p-8"
        >
          <div
            className="size-16 rounded-2xl bg-red-500/10 border border-red-500/20
                          flex items-center justify-center"
          >
            <span className="text-2xl">⚠️</span>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-brand-200 font-sans">
              3D Canvas Error
            </p>
            <p className="text-xs text-brand-500 font-sans mt-1 max-w-xs">
              {this.state.error?.message?.includes("texture") ||
              this.state.error?.message?.includes("undefined")
                ? "Texture files are missing from /public/textures/. The canvas will work without them."
                : "An error occurred in the 3D viewer."}
            </p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 rounded-lg bg-brand-800 border border-brand-700
                       text-sm text-brand-200 font-sans hover:border-brand-500
                       transition-colors duration-150"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Resize handler ─────────────────────────────────────────────────────────
function CanvasResizer({ containerRef }) {
  const { gl, camera } = useThree();

  useEffect(() => {
    if (!containerRef?.current) return;
    const ro = new ResizeObserver((entries) => {
      // Guard: element may have unmounted between observe and callback
      if (!containerRef.current) return;
      const entry = entries[0];
      if (!entry) return;
      const { clientWidth: w, clientHeight: h } = containerRef.current;
      if (!w || !h) return;
      gl.setSize(w, h);
      if (camera.isPerspectiveCamera) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [gl, camera, containerRef]);

  return null;
}

// ── Orbit lock handler ─────────────────────────────────────────────────────
function OrbitManager({ controlsRef }) {
  const isRotationLocked = useCustomizerStore((s) => s.canvas.isRotationLocked);

  useEffect(() => {
    if (!controlsRef.current) return;
    controlsRef.current.enabled = !isRotationLocked;
  }, [isRotationLocked, controlsRef]);

  return null;
}

// ── Scene content (wrapped in Suspense) ───────────────────────────────────
function SceneContent({ controlsRef }) {
  return (
    <>
      {/* Orbit Controls */}
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom
        minDistance={1.5}
        maxDistance={8}
        minPolarAngle={Math.PI * 0.1}
        maxPolarAngle={Math.PI * 0.85}
        dampingFactor={0.08}
        enableDamping
      />
      <OrbitManager controlsRef={controlsRef} />

      {/* Lighting */}
      <ambientLight intensity={1.8} />
      <directionalLight
        position={[4, 8, 4]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />
      <directionalLight
        position={[-3, 2, -2]}
        intensity={0.3}
        color="#b0c4de"
      />
      <pointLight position={[0, 3, -4]} intensity={0.5} color="#d8901f" />

      {/* Environment — use a safe preset */}
      <Environment preset="warehouse" />

      {/* Stone model — safe even without texture files */}
      <Suspense fallback={null}>
        <StoneModel />
        <ContactShadows
          position={[0, -1.4, 0]}
          opacity={0.4}
          scale={6}
          blur={2.5}
          far={4}
          color="#000000"
        />
      </Suspense>

      {/* Background */}
      <color attach="background" args={["#d4d4d4"]} />
    </>
  );
}

/**
 * ThreeCanvas
 * Main R3F canvas. Wrapped in an ErrorBoundary so texture/WebGL
 * errors never crash the whole page.
 */
export default function ThreeCanvas({ className, onCreated }) {
  const containerRef = useRef(null);
  const controlsRef = useRef(null);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full bg-brand-950 rounded-xl overflow-hidden",
        className,
      )}
    >
      <CanvasErrorBoundary>
        <Canvas
          shadows
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 3.5], fov: 45, near: 0.1, far: 100 }}
          gl={{
            preserveDrawingBuffer: true,
            antialias: true,
            alpha: false,
            powerPreference: "default",
            localClippingEnabled: true, // ← REQUIRED for clippingPlanes on materials
          }}
          legacy={false}
          onCreated={(state) => {
            onCreated?.(state);
          }}
        >
          <CanvasResizer containerRef={containerRef} />
          <SceneContent controlsRef={controlsRef} />
        </Canvas>
      </CanvasErrorBoundary>

      {/* Watermark */}
      <div
        className="absolute bottom-3 right-3 text-xs text-brand-700
                      font-display pointer-events-none select-none"
      >
        Double Seven
      </div>
    </div>
  );
}
