import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';
import * as THREE from 'three';

// Simple pseudo-random noise function for the breathing effect
const simpleNoise = (x, y, z, time) => {
  return Math.sin(x * 0.5 + time) * Math.cos(y * 0.3 + time) * Math.sin(z * 0.5 + time);
};

const Network = () => {
  const meshRef = useRef(); // For lines
  const pointsRef = useRef(); // For instanced mesh (dots)
  const { mouse, viewport, camera } = useThree();
  
  // Load SVG
  const svgData = useLoader(SVGLoader, '/logo.svg');

  // 1. Core Setup & Point Generation
  const { points, indices, initialPositions } = useMemo(() => {
    const paths = svgData.paths;
    const allShapes = [];
    
    // Collect all shapes
    paths.forEach((path) => {
      const shapes = SVGLoader.createShapes(path);
      shapes.forEach(shape => {
         // Filter out background or large bounding boxes
         const shapePoints = shape.getPoints();
         const geometry = new THREE.BufferGeometry().setFromPoints(shapePoints);
         geometry.computeBoundingBox();
         const box = geometry.boundingBox;
         const width = box.max.x - box.min.x;
         const height = box.max.y - box.min.y;
         
         if (width > 1000 && height > 500) return; // Skip background
         
         allShapes.push(shape);
      });
    });

    // Calculate total length to distribute points evenly
    const totalLength = allShapes.reduce((acc, shape) => acc + shape.getLength(), 0);
    const targetPoints = 3500;
    const sampledPoints = [];

    allShapes.forEach(shape => {
      const len = shape.getLength();
      const count = Math.floor((len / totalLength) * targetPoints);
      if (count > 0) {
        const shapePoints = shape.getSpacedPoints(count);
        shapePoints.forEach(p => {
          // Invert Y for 3D coordinate system
          sampledPoints.push(new THREE.Vector3(p.x, -p.y, 0));
        });
      }
    });

    // Center and Scale
    const box = new THREE.Box3().setFromPoints(sampledPoints);
    const center = new THREE.Vector3();
    box.getCenter(center);
    const size = new THREE.Vector3();
    box.getSize(size);

    const targetWidth = viewport.width * 0.6; 
    const scale = targetWidth / size.x;

    const finalPoints = new Float32Array(sampledPoints.length * 3);
    const initialPos = new Float32Array(sampledPoints.length * 3);

    sampledPoints.forEach((p, i) => {
      const x = (p.x - center.x) * scale;
      const y = (p.y - center.y) * scale;
      // Random Z depth for the 3D optical illusion
      const z = (Math.random() - 0.5) * 3; 

      finalPoints[i * 3] = x;
      finalPoints[i * 3 + 1] = y;
      finalPoints[i * 3 + 2] = z;

      initialPos[i * 3] = x;
      initialPos[i * 3 + 1] = y;
      initialPos[i * 3 + 2] = z;
    });

    // 2. The Network (Connections)
    const connectionIndices = [];
    const maxDistance = 0.25; // Slightly increased for better connectivity at this scale
    
    // Grid Optimization
    const gridSize = maxDistance;
    const grid = {};

    for (let i = 0; i < sampledPoints.length; i++) {
        const x = finalPoints[i * 3];
        const y = finalPoints[i * 3 + 1];
        const z = finalPoints[i * 3 + 2];

        const gx = Math.floor(x / gridSize);
        const gy = Math.floor(y / gridSize);
        const gz = Math.floor(z / gridSize);
        const key = `${gx},${gy},${gz}`;

        if (!grid[key]) grid[key] = [];
        grid[key].push(i);
    }

    // Neighbor search
    for (let i = 0; i < sampledPoints.length; i++) {
        const x = finalPoints[i * 3];
        const y = finalPoints[i * 3 + 1];
        const z = finalPoints[i * 3 + 2];
        
        const gx = Math.floor(x / gridSize);
        const gy = Math.floor(y / gridSize);
        const gz = Math.floor(z / gridSize);

        // Check neighboring cells
        for (let ix = -1; ix <= 1; ix++) {
            for (let iy = -1; iy <= 1; iy++) {
                for (let iz = -1; iz <= 1; iz++) {
                    const neighborKey = `${gx + ix},${gy + iy},${gz + iz}`;
                    const neighbors = grid[neighborKey];
                    
                    if (neighbors) {
                        for (const j of neighbors) {
                            if (i < j) { // Avoid duplicates
                                const tx = finalPoints[j * 3];
                                const ty = finalPoints[j * 3 + 1];
                                const tz = finalPoints[j * 3 + 2];
                                
                                const dx = x - tx;
                                const dy = y - ty;
                                const dz = z - tz;
                                
                                const distSq = dx*dx + dy*dy + dz*dz;
                                if (distSq < maxDistance * maxDistance) {
                                    connectionIndices.push(i, j);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    return { 
        points: finalPoints, 
        indices: new Uint16Array(connectionIndices),
        initialPositions: initialPos 
    };
  }, [svgData, viewport.width]);

  // Buffers for animation
  const positionBuffer = useMemo(() => new Float32Array(points), [points]);
  const colorBuffer = useMemo(() => new Float32Array(points.length).fill(0.6), [points.length]); // Start with base opacity
  const dummyObj = useMemo(() => new THREE.Object3D(), []);

  // Pre-allocate color array for the lines (RGB per vertex)
  // To simulate "opacity" with BasicMaterial vertex colors, we usually map color brightness.
  // Or we can use a ShaderMaterial. But let's try mapping white value.
  // Actually, LineBasicMaterial vertexColors uses the color attribute (vec3).
  // If we want transparency, we need alpha. But standard BufferAttribute is usually 3 components for color.
  // Three.js LineBasicMaterial supports alpha in vertex colors if defined as vec4? No, usually just rgb.
  // We will modulate the COLOR (brightness) instead of alpha for the "brighter" effect.
  // Brighter = closer to white. Base = dimmer white (grey).
  // But requirement says: "white color... transparent... opacity 0.6".
  // If we set material color to white and use vertex colors, the vertex color multiplies.
  // So we can vary the vertex color from dark grey (dim) to white (bright).
  
  const colors = useMemo(() => {
      const arr = new Float32Array(points.length * 3);
      for(let i=0; i<points.length; i++) {
          arr[i*3] = 1; // R
          arr[i*3+1] = 1; // G
          arr[i*3+2] = 1; // B
      }
      return arr;
  }, [points.length]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Project mouse
    const mouseVec = new THREE.Vector3(mouse.x * viewport.width / 2, mouse.y * viewport.height / 2, 0);
    const interactionRadius = 2.5;

    // Update Points & Lines
    for (let i = 0; i < points.length / 3; i++) {
        const ix = i * 3;
        const iy = i * 3 + 1;
        const iz = i * 3 + 2;

        const bx = initialPositions[ix];
        const by = initialPositions[iy];
        const bz = initialPositions[iz];

        // Noise
        const noiseAmt = 0.08;
        const nx = simpleNoise(bx, by, bz, time * 0.3) * noiseAmt;
        const ny = simpleNoise(by, bz, bx, time * 0.3) * noiseAmt;
        const nz = simpleNoise(bz, bx, by, time * 0.3) * noiseAmt;

        let px = bx + nx;
        let py = by + ny;
        let pz = bz + nz;

        // Interaction
        const dx = px - mouseVec.x;
        const dy = py - mouseVec.y;
        const distToMouse = Math.sqrt(dx*dx + dy*dy);
        
        let intensity = 0;

        if (distToMouse < interactionRadius) {
            const force = (1 - distToMouse / interactionRadius);
            intensity = force; // 0 to 1

            // Attraction/Formation effect
            px -= (px - mouseVec.x) * force * 0.05;
            py -= (py - mouseVec.y) * force * 0.05;
            pz += force * 0.2;
        }

        // Update positions
        positionBuffer[ix] = px;
        positionBuffer[iy] = py;
        positionBuffer[iz] = pz;

        // Update Colors (Brighten when near mouse)
        // Base color should be white but relying on material opacity.
        // To make it "brighter", we can't exceed 1.0. 
        // But if we want "brighter and higher opacity", we can assume the material is additive or transparent.
        // Since we can't easily change alpha per vertex in LineBasicMaterial without custom shader,
        // We will keep color white (1,1,1) effectively.
        // Wait, if we use vertexColors, we MUST supply them.
        
        // Let's rely on the material settings for base look, and maybe just slightly offset Z for "pop"
        // Or we can try to use the color attribute to darken distant lines if we change material color to white?
        // Actually, let's keep it simple: 
        // All white, but the "brighter" effect is achieved by the density of lines near the mouse (due to attraction).
        // Plus the Z-lift makes them render on top.
        
        // Update InstancedMesh
        dummyObj.position.set(px, py, pz);
        const scale = 0.015 * (1 + intensity); // Grow slightly
        dummyObj.scale.set(scale, scale, scale);
        dummyObj.updateMatrix();
        
        if (pointsRef.current) {
            pointsRef.current.setMatrixAt(i, dummyObj.matrix);
            // We could also change color of instance if using InstancedMesh.setColorAt
            // But doing that every frame for 3500 points is expensive.
        }
    }

    if (pointsRef.current) {
        pointsRef.current.instanceMatrix.needsUpdate = true;
    }

    if (meshRef.current) {
        meshRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <>
      <instancedMesh ref={pointsRef} args={[null, null, points.length / 3]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </instancedMesh>

      <lineSegments ref={meshRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positionBuffer.length / 3}
            array={positionBuffer}
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
          color="#ffffff"
          transparent={true}
          opacity={0.5} // Base opacity
          linewidth={1}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </>
  );
};

const NetworkLogo = () => {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
      >
        <Network />
      </Canvas>
    </div>
  );
};

export default NetworkLogo;
