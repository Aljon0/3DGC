import { useCustomizerStore } from "@/store/useCustomizerStore";
import { Decal } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * DraggableDecal
 * Renders a single decal on the stone surface.
 * Uses a clipping plane to prevent the decal from showing on the back face.
 */
export default function DraggableDecal({ decal, stoneDims }) {
  const { gl, raycaster } = useThree();
  const { selectedDecalId, selectDecal, updateDecal } = useCustomizerStore();

  const isSelected = selectedDecalId === decal.id;
  const isDragging = useRef(false);
  const dragPlane = useRef(new THREE.Plane());

  // ── Clipping plane: only render pixels on the FRONT half of the stone ──
  // Plane normal points forward (+Z in local space).
  // Any fragment with z < 0 (back half) is clipped.
  // We use a small positive constant (0.001) so the clip is exactly
  // at the stone center — nothing on the back face is ever drawn.
  const clippingPlanes = useMemo(
    () => [new THREE.Plane(new THREE.Vector3(0, 0, 1), 0.001)],
    [],
  );

  // ── Build texture ──────────────────────────────────────────────────────
  const texture = useDecalTexture(decal);

  // ── Scale with flip ────────────────────────────────────────────────────
  const scale = useMemo(() => {
    const [sx, sy, sz] = decal.scale ?? [0.25, 0.25, 0.25];
    return [
      sx * (decal.flipped?.x ? -1 : 1),
      sy * (decal.flipped?.y ? -1 : 1),
      sz,
    ];
  }, [decal.scale, decal.flipped]);

  // ── Rotation euler ─────────────────────────────────────────────────────
  const euler = useMemo(() => {
    const [rx, ry, rz] = decal.rotation ?? [0, 0, 0];
    return new THREE.Euler(rx, ry, rz);
  }, [decal.rotation]);

  if (!texture) return null;

  // ── Click: select ──────────────────────────────────────────────────────
  const handleClick = (e) => {
    e.stopPropagation();
    if (decal.locked) return;
    selectDecal(decal.id);
  };

  // ── Drag: move on front face ───────────────────────────────────────────
  const handlePointerDown = (e) => {
    if (decal.locked || !isSelected) return;
    e.stopPropagation();
    isDragging.current = true;
    const normal = new THREE.Vector3(0, 0, 1);
    dragPlane.current.setFromNormalAndCoplanarPoint(normal, e.point);
    gl.domElement.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    e.stopPropagation();
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(dragPlane.current, intersection);
    const hw = (stoneDims?.[0] ?? 1) / 2 - 0.05;
    const hh = (stoneDims?.[1] ?? 1.6) / 2 - 0.05;
    updateDecal(decal.id, {
      position: [
        THREE.MathUtils.clamp(intersection.x, -hw, hw),
        THREE.MathUtils.clamp(intersection.y, -hh, hh),
        decal.position[2] ?? 0.01,
      ],
    });
  };

  const handlePointerUp = (e) => {
    isDragging.current = false;
    gl.domElement.releasePointerCapture(e.pointerId);
  };

  return (
    <Decal
      position={decal.position}
      rotation={euler}
      scale={scale}
      polygonOffset
      polygonOffsetFactor={-4}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <meshStandardMaterial
        map={texture}
        transparent
        alphaTest={0.01}
        depthTest={true}
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-4}
        // ── THE FIX: clip anything not on the front face ──────────────
        clippingPlanes={clippingPlanes}
        clipShadows={false}
        emissive={
          isSelected ? new THREE.Color("#d8901f") : new THREE.Color(0, 0, 0)
        }
        emissiveIntensity={isSelected ? 0.15 : 0}
      />
    </Decal>
  );
}

/**
 * useDecalTexture
 * Builds a THREE.Texture from decal type.
 */
function useDecalTexture(decal) {
  return useMemo(() => {
    if (decal.type === "text") {
      const size = 512;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");

      ctx.clearRect(0, 0, size, size);

      const fontSize = (decal.fontSize ?? 48) * (size / 256);
      const fontFace = decal.font ?? "TimesNewRomanCyr";
      ctx.font = `${fontSize}px "${fontFace}", serif`;
      ctx.fillStyle = decal.color ?? "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const words = (decal.text ?? "Text").split(" ");
      const lineH = fontSize * 1.3;
      let line = "";
      const lines = [];
      const maxW = size * 0.85;

      for (const word of words) {
        const test = line ? `${line} ${word}` : word;
        if (ctx.measureText(test).width > maxW && line) {
          lines.push(line);
          line = word;
        } else {
          line = test;
        }
      }
      lines.push(line);

      const totalH = lines.length * lineH;
      lines.forEach((l, i) => {
        ctx.fillText(
          l,
          size / 2,
          size / 2 - totalH / 2 + i * lineH + lineH / 2,
        );
      });

      const tex = new THREE.CanvasTexture(canvas);
      tex.needsUpdate = true;
      return tex;
    }

    if (decal.type === "image" || decal.type === "frame") {
      const url = decal.url ?? decal.imageUrl;
      if (!url) return null;
      const loader = new THREE.TextureLoader();
      const tex = loader.load(url, (t) => {
        t.needsUpdate = true;
      });
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    }

    return null;
  }, [
    decal.type,
    decal.text,
    decal.font,
    decal.fontSize,
    decal.color,
    decal.url,
    decal.imageUrl,
  ]);
}
