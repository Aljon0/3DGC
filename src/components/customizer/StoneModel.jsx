import { useCustomizerStore } from "@/store/useCustomizerStore";
import { RoundedBox }         from "@react-three/drei";
import { useThree }           from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE             from "three";
import DraggableDecal         from "./DraggableDecal";

// ── Fallback colors per stone type ────────────────────────────────────────
const STONE_TYPE_COLORS = {
  gravestone:   '#5a5a5a',
  urn:          '#6a6a6a',
  'table-sign': '#787878',
  base:         '#4a4a4a',
};

const STONE_CONFIGS = {
  gravestone: {
    type: 'box', dims: [1.0, 1.6, 0.15],
    radius: 0.08, segments: 4, position: [0, 0, 0],
  },
  urn: {
    type: 'cylinder', position: [0, 0, 0], fixed: true,
  },
  'table-sign': {
    type: 'box', dims: [1.8, 0.5, 0.08],
    radius: 0.04, segments: 4, position: [0, 0, 0],
  },
  base: {
    type: 'box', dims: [1.4, 0.3, 0.6],
    radius: 0.03, segments: 4, position: [0, -0.6, 0],
  },
};

// ── Resolve texture URL ───────────────────────────────────────────────────
function resolveTextureUrl(texture) {
  if (!texture) return null;
  if (texture.startsWith('http://') || texture.startsWith('https://')) {
    return texture;
  }
  return null;
}

// ── Resolve fallback color ────────────────────────────────────────────────
function resolveFallbackColor(stoneType) {
  return STONE_TYPE_COLORS[stoneType] ?? '#6b6b6b';
}

// ── useTextureLoader hook ─────────────────────────────────────────────────
// Loads a texture URL asynchronously and returns the Three.js Texture object.
// Using useState+useEffect instead of useMemo so the component re-renders
// when the texture finishes loading (useMemo doesn't trigger re-renders).
//
// ── useTextureLoader hook ─────────────────────────────────────────────────
function useTextureLoader(textureUrl, onLoaded) {
  const [texture, setTexture] = useState(null);
  const textureRef = useRef(null);
  const onLoadedRef = useRef(onLoaded);

  // Keep onLoaded ref fresh without re-triggering the effect
  useEffect(() => { onLoadedRef.current = onLoaded; });

  useEffect(() => {
    if (!textureUrl) {
      // Async to avoid "setState synchronously in effect" warning
      const id = setTimeout(() => {
        if (textureRef.current) {
          textureRef.current.dispose();
          textureRef.current = null;
        }
        setTexture(null);
      }, 0);
      return () => clearTimeout(id);
    }

    let active = true;
    const loader = new THREE.TextureLoader();

    loader.load(
      textureUrl,
      (t) => {
        if (!active) return;

        t.wrapS       = THREE.RepeatWrapping;
        t.wrapT       = THREE.RepeatWrapping;
        t.colorSpace  = THREE.SRGBColorSpace;
        t.needsUpdate = true;

        // Call the repeat/onLoaded callback before setting state
        onLoadedRef.current?.(t);

        // Dispose old texture
        if (textureRef.current) {
          textureRef.current.dispose();
        }
        textureRef.current = t;
        setTexture(t);
      },
      undefined,
      (err) => {
        if (!active) return;
        console.warn('[StoneModel] Texture load failed:', textureUrl, err);
        setTexture(null);
      }
    );

    return () => {
      // Just cancel — do NOT clear texture here, that was the original bug
      active = false;
    };
  }, [textureUrl]);

  // Dispose on unmount only
  useEffect(() => {
    return () => {
      if (textureRef.current) {
        textureRef.current.dispose();
        textureRef.current = null;
      }
    };
  }, []);

  return texture;
}

// ── Box stone material ────────────────────────────────────────────────────
function TexturedStoneMaterial({ textureUrl, fallbackColor, dims }) {
  const dimsRef = useRef(dims);
  useEffect(() => { dimsRef.current = dims; }, [dims]);

  const materialRef = useRef();

  const texture = useTextureLoader(textureUrl, (t) => {
    t.repeat.set(dimsRef.current[0] * 1.5, dimsRef.current[1] * 1.5);
  });

  // Force material to acknowledge the new texture map
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.map = texture ?? null;
      materialRef.current.color.set(texture ? '#ffffff' : fallbackColor);
      materialRef.current.needsUpdate = true;
    }
  }, [texture, fallbackColor]);

  return (
    <meshStandardMaterial
      ref={materialRef}
      map={texture ?? null}
      color={texture ? '#ffffff' : fallbackColor}
      roughness={0.75}
      metalness={0.05}
      envMapIntensity={0.5}
    />
  );
}

// ── Decal texture builder ─────────────────────────────────────────────────
function buildDecalTexture(decal) {
  if (decal.type === 'text') {
    const size   = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx    = canvas.getContext('2d');
    ctx.clearRect(0, 0, size, size);

    const fontSize = (decal.fontSize ?? 48) * (size / 256);
    ctx.font          = `${fontSize}px "${decal.font ?? 'Cinzel'}", serif`;
    ctx.fillStyle     = decal.color ?? '#ffffff';
    ctx.textAlign     = 'center';
    ctx.textBaseline  = 'middle';

    const words = (decal.text ?? 'Text').split(' ');
    const lineH = fontSize * 1.3;
    let line = '';
    const lines = [];
    const maxW  = size * 0.85;

    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxW && line) {
        lines.push(line); line = word;
      } else { line = test; }
    }
    lines.push(line);

    const totalH = lines.length * lineH;
    lines.forEach((l, i) => {
      ctx.fillText(l, size / 2, size / 2 - totalH / 2 + i * lineH + lineH / 2);
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }

  if (decal.type === 'image' || decal.type === 'frame') {
    const url = decal.url ?? decal.imageUrl;
    if (!url) return null;
    const loader = new THREE.TextureLoader();
    const tex    = loader.load(url, (t) => { t.needsUpdate = true; });
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  return null;
}

// ── UrnLabel ──────────────────────────────────────────────────────────────
function UrnLabel({ decal }) {
  const { gl, raycaster }                       = useThree();
  const { selectedDecalId, selectDecal, updateDecal } = useCustomizerStore();

  const isSelected = selectedDecalId === decal.id;
  const isDragging = useRef(false);
  const dragPlane  = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), -0.41));
  const texture    = useMemo(() => buildDecalTexture(decal), [decal]);

  const curvedGeo = useMemo(() => {
    const [sx, sy]  = decal.scale ?? [0.35, 0.18];
    const R         = 0.401;
    const arcAngle  = sx / R;
    const segments  = 32;
    const geo       = new THREE.BufferGeometry();
    const verts = [], uvs = [], indices = [];
    const halfAngle = arcAngle / 2;
    const hh = sy / 2;

    for (let i = 0; i <= segments; i++) {
      const t     = i / segments;
      const angle = -halfAngle + t * arcAngle;
      verts.push(R * Math.sin(angle), hh, R * Math.cos(angle));
      uvs.push(t, 1);
      verts.push(R * Math.sin(angle), -hh, R * Math.cos(angle));
      uvs.push(t, 0);
    }
    for (let i = 0; i < segments; i++) {
      const a = i * 2;
      indices.push(a, a+1, a+2, a+1, a+3, a+2);
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geo.setAttribute('uv',       new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, [decal.scale]);

  const position = useMemo(() => {
    const [px, py] = decal.position ?? [0, 0, 0];
    return new THREE.Vector3(px, py, 0);
  }, [decal.position]);

  const rotation = useMemo(() => {
    const [rx, ry, rz] = decal.rotation ?? [0, 0, 0];
    return new THREE.Euler(rx, ry, rz);
  }, [decal.rotation]);

  if (!texture) return null;

  return (
    <mesh
      geometry={curvedGeo}
      position={position}
      rotation={new THREE.Euler(rotation.x, position.x * (Math.PI / 0.6), rotation.z)}
      renderOrder={1}
      onClick={e => { e.stopPropagation(); if (!decal.locked) selectDecal(decal.id); }}
      onPointerDown={e => {
        if (decal.locked || !isSelected) return;
        e.stopPropagation();
        isDragging.current = true;
        gl.domElement.setPointerCapture(e.pointerId);
      }}
      onPointerMove={e => {
        if (!isDragging.current) return;
        e.stopPropagation();
        const hit = new THREE.Vector3();
        raycaster.ray.intersectPlane(dragPlane.current, hit);
        updateDecal(decal.id, {
          position: [
            THREE.MathUtils.clamp(hit.x * 0.5, -0.6, 0.6),
            THREE.MathUtils.clamp(hit.y, -0.55, 0.55),
            0,
          ],
        });
      }}
      onPointerUp={e => {
        isDragging.current = false;
        gl.domElement.releasePointerCapture(e.pointerId);
      }}
    >
      <meshStandardMaterial
        map={texture}
        transparent alphaTest={0.01} depthWrite={false}
        side={THREE.DoubleSide}
        emissive={isSelected ? new THREE.Color('#d8901f') : new THREE.Color(0,0,0)}
        emissiveIntensity={isSelected ? 0.3 : 0}
      />
    </mesh>
  );
}

// ── UrnMesh ───────────────────────────────────────────────────────────────
function UrnMesh({ meshRef, textureUrl, fallbackColor, decals }) {
  const bodyGeo = useMemo(() => new THREE.CylinderGeometry(0.4, 0.4, 1.2, 64, 1, false), []);
  const topGeo  = useMemo(() => new THREE.CylinderGeometry(0.4, 0.4, 0.02, 64), []);
  const botGeo  = useMemo(() => new THREE.CylinderGeometry(0.42, 0.42, 0.04, 64), []);

  const bodyMatRef = useRef();
  const topMatRef  = useRef();
  const botMatRef  = useRef();

  const texture = useTextureLoader(textureUrl, (t) => { t.repeat.set(2, 1); });

  // Force all three material instances to update when texture changes
  useEffect(() => {
    [bodyMatRef, topMatRef, botMatRef].forEach(ref => {
      if (!ref.current) return;
      ref.current.map   = texture ?? null;
      ref.current.color.set(texture ? '#ffffff' : fallbackColor);
      ref.current.needsUpdate = true;
    });
  }, [texture, fallbackColor]);

  const matProps = {
    map:             texture ?? null,
    color:           texture ? '#ffffff' : fallbackColor,
    roughness:       0.75,
    metalness:       0.05,
    envMapIntensity: 0.5,
  };

  return (
    <group ref={meshRef}>
      <mesh geometry={bodyGeo} position={[0, 0, 0]}     castShadow receiveShadow>
        <meshStandardMaterial ref={bodyMatRef} {...matProps} />
      </mesh>
      <mesh geometry={topGeo}  position={[0, 0.61, 0]}  castShadow>
        <meshStandardMaterial ref={topMatRef}  {...matProps} />
      </mesh>
      <mesh geometry={botGeo}  position={[0, -0.62, 0]} castShadow>
        <meshStandardMaterial ref={botMatRef}  {...matProps} />
      </mesh>
      {decals.map(decal => <UrnLabel key={decal.id} decal={decal} />)}
    </group>
  );
}

// ── Main StoneModel ───────────────────────────────────────────────────────
export default function StoneModel() {
  const meshRef = useRef();

  const {
    canvas: { stoneType, texture, dimensions, decals },
  } = useCustomizerStore();

  const config        = STONE_CONFIGS[stoneType] ?? STONE_CONFIGS.gravestone;
  const textureUrl    = resolveTextureUrl(texture);
  const fallbackColor = resolveFallbackColor(stoneType);

  const scaledDims = useMemo(() => {
    if (config.type === 'cylinder') return null;
    // Base dimensions the stone geometry was designed around
    const wBase  = 60;
    const hBase  = 90;
    const wScale = (dimensions?.width  ?? wBase) / wBase;
    const hScale = (dimensions?.height ?? hBase) / hBase;
    return [
      config.dims[0] * wScale,
      config.dims[1] * hScale,
      config.dims[2],
    ];
  }, [dimensions, config]);

  if (config.type === 'cylinder') {
    return (
      <group position={config.position}>
        <UrnMesh
          meshRef={meshRef}
          textureUrl={textureUrl}
          fallbackColor={fallbackColor}
          decals={decals}
        />
      </group>
    );
  }

  return (
    <group position={config.position}>
      <RoundedBox
        ref={meshRef}
        args={scaledDims}
        radius={config.radius}
        smoothness={config.segments}
        receiveShadow castShadow
      >
        <TexturedStoneMaterial
          textureUrl={textureUrl}
          fallbackColor={fallbackColor}
          dims={scaledDims}
        />
        {decals.map(decal => (
          <DraggableDecal
            key={decal.id}
            decal={decal}
            stoneRef={meshRef}
            stoneDims={scaledDims}
          />
        ))}
      </RoundedBox>
    </group>
  );
}