import React, { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';
import * as THREE from 'three';

const LogoLines = () => {
  const meshRef = useRef();
  const { mouse, viewport } = useThree();
  
  // Load SVG
  const svgData = useLoader(SVGLoader, '/logo.svg');
  
  const { positions, randomPositions, indices } = useMemo(() => {
    const paths = svgData.paths;
    const allPoints = [];
    
    // Extract shapes and points from paths
    paths.forEach((path) => {
      const shapes = SVGLoader.createShapes(path);
      
      shapes.forEach((shape) => {
        // Compute shape bounds to ignore background
        const shapePoints = shape.getPoints();
        const geometry = new THREE.BufferGeometry().setFromPoints(shapePoints);
        geometry.computeBoundingBox();
        const box = geometry.boundingBox;
        const width = box.max.x - box.min.x;
        const height = box.max.y - box.min.y;

        // Ignore background rectangle
        if (width > 1000 && height > 500) {
            return;
        }
        
        // Sample points along the shape for smoother lines
        // Adaptive sampling based on length for consistent density
        const spacing = 2; // Adjust for density
        const count = Math.ceil(shape.getLength() / spacing);
        const sampledPoints = shape.getSpacedPoints(count);
        
        // Add points for this shape as a continuous sequence
        allPoints.push(sampledPoints);
      });
    });

    // Flatten points and create indices for line segments
    const flatPoints = [];
    const lineIndices = [];
    let currentIndex = 0;

    allPoints.forEach(shapePoints => {
        for (let i = 0; i < shapePoints.length; i++) {
            // Invert Y because SVG coordinates are top-down, 3D is bottom-up
            flatPoints.push(new THREE.Vector3(shapePoints[i].x, -shapePoints[i].y, 0));
            
            // Connect to next point in shape to form a segment
            if (i < shapePoints.length - 1) {
                lineIndices.push(currentIndex + i, currentIndex + i + 1);
            }
        }
        currentIndex += shapePoints.length;
    });

    // Center and Scale the points
    const box = new THREE.Box3().setFromPoints(flatPoints);
    const center = new THREE.Vector3();
    box.getCenter(center);
    const size = new THREE.Vector3();
    box.getSize(size);

    // Scale to 60% of viewport width
    const targetWidth = viewport.width * 0.6;
    const scale = targetWidth / size.x;
    
    const numPoints = flatPoints.length;
    const finalPositions = new Float32Array(numPoints * 3);
    const randomPos = new Float32Array(numPoints * 3);
    
    flatPoints.forEach((p, i) => {
      // Centered and Scaled position (X, Y)
      const x = (p.x - center.x) * scale;
      const y = (p.y - center.y) * scale;
      
      // Random Z depth for optical illusion (-1.5 to 1.5)
      const z = (Math.random() - 0.5) * 3;
      
      finalPositions[i * 3] = x;
      finalPositions[i * 3 + 1] = y;
      finalPositions[i * 3 + 2] = z;
      
      // Random position for initial state (sphere)
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 10 + Math.random() * 10; // Start further out
      
      randomPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      randomPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      randomPos[i * 3 + 2] = r * Math.cos(phi);
    });

    return { 
        positions: finalPositions, 
        randomPositions: randomPos, 
        indices: new Uint16Array(lineIndices) 
    };
  }, [svgData, viewport.width]);

  // Current positions buffer
  const currentPositions = useMemo(() => new Float32Array(randomPositions), [randomPositions]);
  
  useFrame((state) => {
    if (!meshRef.current) return;

    // Transition duration 3s
    const time = state.clock.getElapsedTime();
    const progress = Math.min(time / 3, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // Cubic ease out

    const positionsAttribute = meshRef.current.geometry.attributes.position;
    const totalPoints = currentPositions.length / 3;

    for (let i = 0; i < totalPoints; i++) {
      const ix = i * 3;
      const iy = i * 3 + 1;
      const iz = i * 3 + 2;

      // Target
      const tx = positions[ix];
      const ty = positions[iy];
      const tz = positions[iz];

      // Start
      const sx = randomPositions[ix];
      const sy = randomPositions[iy];
      const sz = randomPositions[iz];
      
      // Lerp
      let nx = sx + (tx - sx) * eased;
      let ny = sy + (ty - sy) * eased;
      let nz = sz + (tz - sz) * eased;
      
      // Lock to target when complete to maintain illusion
      if (progress >= 1) {
          nx = tx;
          ny = ty;
          nz = tz;
      }

      currentPositions[ix] = nx;
      currentPositions[iy] = ny;
      currentPositions[iz] = nz;
    }

    positionsAttribute.needsUpdate = true;
    
    // Enhanced Mouse Parallax for Depth Perception
    if (meshRef.current) {
        const targetRotX = mouse.y * 0.8; // Wide angle to see depth
        const targetRotY = mouse.x * 0.8;
        
        meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetRotX, 0.05);
        meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotY, 0.05);
    }
  });

  return (
    <lineSegments ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={currentPositions.length / 3}
          array={currentPositions}
          itemSize={3}
        />
        <bufferAttribute
            attach="index"
            count={indices.length}
            array={indices}
            itemSize={1}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color="#22d3ee"
        transparent={true}
        opacity={0.6}
        linewidth={1}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
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
        <LogoLines />
      </Canvas>
    </div>
  );
};

export default DataLogo;
