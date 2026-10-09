"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { WebGLRenderer } from "three";

import { ANIMAL_CATALOG, ANIMAL_IDS } from "@/lib/animals/catalog";

export function AnimalModelPreview({ species = "fox", className = "size-40" }: { species?: string; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);
  const safeSpecies = ANIMAL_IDS.includes(species) ? species : "fox";
  const label = ANIMAL_CATALOG.find((animal) => animal.id === safeSpecies)?.name ?? "Raposa";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: WebGLRenderer | undefined;
    let disposed = false;
    let resizeObserver: ResizeObserver | undefined;

    async function renderModel() {
      try {
        const [THREE, { GLTFLoader }] = await Promise.all([
          import("three"),
          import("three/examples/jsm/loaders/GLTFLoader.js"),
        ]);
        if (disposed || !canvas) return;

        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.15;

        const scene = new THREE.Scene();
        scene.add(new THREE.AmbientLight(0xffffff, 2.2));
        const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
        keyLight.position.set(3, 5, 6);
        scene.add(keyLight);
        const fillLight = new THREE.DirectionalLight(0xb9d0ff, 1.4);
        fillLight.position.set(-4, 2, -3);
        scene.add(fillLight);

        const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
        const loader = new GLTFLoader();
        const gltf = await loader.loadAsync(`/avatar/Models/GLB%20format/animal-${safeSpecies}.glb`);
        if (disposed) {
          renderer.dispose();
          return;
        }

        const model = gltf.scene;
        scene.add(model);
        const bounds = new THREE.Box3().setFromObject(model);
        const center = bounds.getCenter(new THREE.Vector3());
        const size = bounds.getSize(new THREE.Vector3());
        model.position.sub(center);
        const largestDimension = Math.max(size.x, size.y, size.z);
        camera.position.set(largestDimension * 1.5, largestDimension * 0.85, largestDimension * 2.8);
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();

        const draw = () => {
          if (!canvas || !renderer) return;
          const { width, height } = canvas.getBoundingClientRect();
          if (!width || !height) return;
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.render(scene, camera);
        };
        resizeObserver = new ResizeObserver(draw);
        resizeObserver.observe(canvas);
        draw();
      } catch {
        if (!disposed) setFailed(true);
      }
    }

    setFailed(false);
    void renderModel();

    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      renderer?.dispose();
    };
  }, [safeSpecies]);

  return (
    <div className={`relative ${className}`} role="img" aria-label={`Pet NEXO: ${label}`}>
      {failed ? (
        <Image src={`/avatar/Previews/animal-${safeSpecies}.png`} alt="" fill sizes="208px" className="object-contain" />
      ) : (
        <canvas ref={canvasRef} aria-hidden="true" className="size-full" />
      )}
    </div>
  );
}
