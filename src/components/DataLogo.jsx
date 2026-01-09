import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';
import * as THREE from 'three';

const LogoParticles = () => {
  const pointsRef = useRef();
  const { mouse, viewport } = useThree();
  const [stabilized, setStabilized] = useState(false);
  
  // Load SVG
  const svgData = useLoader(SVGLoader, '/logo.svg');
  
  const { positions, randomPositions, colors } = useMemo(() => {
    const paths = svgData.paths;
    const allShapes = [];
    
    // Extract shapes from paths
    paths.forEach((path) => {
      // Filter out background shapes by checking if they are the background rectangle
      // The background usually covers the whole viewbox (1054x572)
      // We can also check userData or fill, but bounds is safer.
      const shapes = SVGLoader.createShapes(path);
      
      shapes.forEach((shape) => {
        // Compute shape bounds
        const points = shape.getPoints();
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        geometry.computeBoundingBox();
        const box = geometry.boundingBox;
        const width = box.max.x - box.min.x;
        const height = box.max.y - box.min.y;

        // Ignore if it's the background rectangle (approx 1054x572)
        if (width > 1000 && height > 500) {
            return;
        }
        
        allShapes.push(shape);
      });
    });

    // Sample points
    const targetPoints = [];
    const numPoints = 8000; // Increased density
    
    // Calculate total length to distribute points evenly
    let totalLength = 0;
    const shapeLengths = allShapes.map(shape => {
      const length = shape.getLength();
      totalLength += length;
      return length;
    });

    allShapes.forEach((shape, i) => {
      const count = Math.max(1, Math.floor((shapeLengths[i] / totalLength) * numPoints));
      const points = shape.getSpacedPoints(count);
      points.forEach(p => {
         // Invert Y because SVG coordinates are top-down, 3D is bottom-up
        targetPoints.push(new THREE.Vector3(p.x, -p.y, 0));
      });
    });

    // Adjust to exactly numPoints
    while (targetPoints.length < numPoints) {
       const index = Math.floor(Math.random() * targetPoints.length);
       targetPoints.push(targetPoints[index].clone());
    }
    if (targetPoints.length > numPoints) {
      targetPoints.length = numPoints;
    }

    // Center and Scale the points
    const box = new THREE.Box3().setFromPoints(targetPoints);
    const center = new THREE.Vector3();
    box.getCenter(center);
    const size = new THREE.Vector3();
    box.getSize(size);

    // Scale to 60% of viewport width
    const targetWidth = viewport.width * 0.6;
    const scale = targetWidth / size.x;
    
    const finalPositions = new Float32Array(numPoints * 3);
    const randomPos = new Float32Array(numPoints * 3);
    
    targetPoints.forEach((p, i) => {
      // Centered and Scaled position
      const x = (p.x - center.x) * scale;
      const y = (p.y - center.y) * scale;
      const z = 0;
      
      finalPositions[i * 3] = x;
      finalPositions[i * 3 + 1] = y;
      finalPositions[i * 3 + 2] = z;
      
      // Random position for initial state (sphere)
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 5 + Math.random() * 5; // Spread out
      
      randomPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      randomPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      randomPos[i * 3 + 2] = r * Math.cos(phi);
    });

    return { positions: finalPositions, randomPositions: randomPos };
  }, [svgData, viewport.width]);

  // Current positions buffer
  const currentPositions = useMemo(() => new Float32Array(randomPositions), [randomPositions]);
  const stabilizationRef = useRef(new Float32Array(8000).fill(0)); // 0 = moving, 1 = stabilized

  useFrame((state) => {
    if (!pointsRef.current) return;

    const time = state.clock.getElapsedTime();
    // Transition duration 3s
    const progress = Math.min(time / 3, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // Cubic ease out

    const positionsAttribute = pointsRef.current.geometry.attributes.position;
    const stabilizedFlags = stabilizationRef.current;
    let stabilizedCount = 0;
    const totalPoints = 8000;

    for (let i = 0; i < totalPoints; i++) {
      const ix = i * 3;
      const iy = i * 3 + 1;
      const iz = i * 3 + 2;

      // Target
      const tx = positions[ix];
      const ty = positions[iy];
      const tz = positions[iz];

      // If already stabilized, apply shimmer if fully stabilized
      if (stabilizedFlags[i] === 1) {
        stabilizedCount++;
        if (stabilized) {
             // Subtle shimmer/glow effect
             const shimmerSpeed = 2;
             const shimmerAmount = 0.002;
             const offset = Math.sin(time * shimmerSpeed + i * 0.1) * shimmerAmount;
             currentPositions[ix] = tx + offset;
             currentPositions[iy] = ty + offset;
             currentPositions[iz] = tz + offset;
        } else {
             currentPositions[ix] = tx;
             currentPositions[iy] = ty;
             currentPositions[iz] = tz;
        }
        continue;
      }

      // Current logic
      const sx = randomPositions[ix];
      const sy = randomPositions[iy];
      const sz = randomPositions[iz];
      
      let cx = currentPositions[ix];
      let cy = currentPositions[iy];
      let cz = currentPositions[iz];

      // Move towards target
      // We calculate step based on progress to ensure it eventually gets there
      // Or just lerp from start to target based on eased progress
      let nx = sx + (tx - sx) * eased;
      let ny = sy + (ty - sy) * eased;
      let nz = sz + (tz - sz) * eased;

      // Check distance to target
      const distSq = (nx - tx) ** 2 + (ny - ty) ** 2 + (nz - tz) ** 2;
      
      if (distSq < 0.000001) { // dist < 0.001
          nx = tx;
          ny = ty;
          nz = tz;
          stabilizedFlags[i] = 1;
          stabilizedCount++;
      }

      currentPositions[ix] = nx;
      currentPositions[iy] = ny;
      currentPositions[iz] = nz;
    }

    positionsAttribute.needsUpdate = true;
    
    // Check if 95% stabilized
    if (!stabilized && stabilizedCount / totalPoints > 0.95) {
        setStabilized(true);
    }
    
    // Mouse Parallax (always active but subtle)
    if (pointsRef.current) {
        pointsRef.current.rotation.x = THREE.MathUtils.lerp(pointsRef.current.rotation.x, mouse.y * 0.1, 0.1);
        pointsRef.current.rotation.y = THREE.MathUtils.lerp(pointsRef.current.rotation.y, mouse.x * 0.1, 0.1);
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={currentPositions.length / 3}
          array={currentPositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#ffffff"
        sizeAttenuation={true}
        transparent={true}
        opacity={0.9}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const DataLogo = () => {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
      >
        <LogoParticles />
      </Canvas>
    </div>
  );
};

export default DataLogo;
