import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';
import * as THREE from 'three';

const Network = () => {
  const pointsRef = useRef(); // For instanced mesh (dots)
  const solidLogoRef = useRef();
  const { mouse, viewport } = useThree();
  
  // Load SVG
  const svgData = useLoader(SVGLoader, '/logo.svg');

  const { targetPoints, initialRandomPoints, logoShapes, logoScale, logoCenter, pointCount } = useMemo(() => {
    const paths = svgData.paths;
    const allShapes = [];
    
    // Collect all shapes
    paths.forEach((path) => {
      const shapes = SVGLoader.createShapes(path);
      shapes.forEach(shape => {
         // Filter out background
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

    // Calculate total length
    const totalLength = allShapes.reduce((acc, shape) => acc + shape.getLength(), 0);
    const targetCount = 3500;
    const sampledPoints = [];

    // Distribute points along paths
    allShapes.forEach(shape => {
      const len = shape.getLength();
      const count = Math.floor((len / totalLength) * targetCount);
      if (count > 0) {
        const shapePoints = shape.getSpacedPoints(count);
        shapePoints.forEach(p => {
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

    const finalTargetPoints = new Float32Array(sampledPoints.length * 3);
    const startRandomPoints = new Float32Array(sampledPoints.length * 3);

    sampledPoints.forEach((p, i) => {
      // Target Position (The Logo)
      const tx = (p.x - center.x) * scale;
      const ty = (p.y - center.y) * scale;
      const tz = 0; // Flat 2D plane

      finalTargetPoints[i * 3] = tx;
      finalTargetPoints[i * 3 + 1] = ty;
      finalTargetPoints[i * 3 + 2] = tz;

      // Random Start Position (Noise)
      // Spread them out significantly
      startRandomPoints[i * 3] = (Math.random() - 0.5) * viewport.width * 1.5;
      startRandomPoints[i * 3 + 1] = (Math.random() - 0.5) * viewport.height * 1.5;
      startRandomPoints[i * 3 + 2] = (Math.random() - 0.5) * 10; // Depth noise
    });
    
    // Prepare Shape Geometry for solid logo
    const shapes = allShapes.map(shape => {
       const newShape = new THREE.Shape();
       newShape.copy(shape);
       return newShape;
    });

    return { 
        targetPoints: finalTargetPoints, 
        initialRandomPoints: startRandomPoints,
        logoShapes: shapes,
        logoScale: scale,
        logoCenter: center,
        pointCount: sampledPoints.length
    };
  }, [svgData, viewport.width, viewport.height]);

  const dummyObj = useMemo(() => new THREE.Object3D(), []);
  
  // Animation state
  // We'll use a simple ref to track "progress" 0 -> 1
  const animRef = useRef({ progress: 0 });
  
  useFrame((state) => {
    // Increase progress over time
    // Reach 1.0 in approx 2.5 seconds
    const speed = 0.005; // Reduced speed factor significantly
    if (animRef.current.progress < 1) {
        animRef.current.progress += (1 - animRef.current.progress) * 0.01 + 0.0005;
        if (animRef.current.progress > 1) animRef.current.progress = 1;
    }
    
    const progress = animRef.current.progress;
    // Easing: cubic out or smoothstep
    const t = progress * (2 - progress); // Ease out quad

    // Project mouse
    const mouseVec = new THREE.Vector3(mouse.x * viewport.width / 2, mouse.y * viewport.height / 2, 0);
    const interactionRadius = 2.0;

    for (let i = 0; i < pointCount; i++) {
        const ix = i * 3;
        const iy = i * 3 + 1;
        const iz = i * 3 + 2;

        const sx = initialRandomPoints[ix];
        const sy = initialRandomPoints[iy];
        const sz = initialRandomPoints[iz];

        const tx = targetPoints[ix];
        const ty = targetPoints[iy];
        const tz = targetPoints[iz];

        // Lerp current position
        let px = sx + (tx - sx) * t;
        let py = sy + (ty - sy) * t;
        let pz = sz + (tz - sz) * t;

        // Add mouse interaction only when formed (or forming)
        // Only if near mouse
        const dx = px - mouseVec.x;
        const dy = py - mouseVec.y;
        const distToMouse = Math.sqrt(dx*dx + dy*dy);
        
        if (distToMouse < interactionRadius) {
            const force = (1 - distToMouse / interactionRadius);
            // Push away slightly or attract? User wants "stable logo".
            // Let's make it minimal disturbance
            // px += dx * force * 0.1;
            // py += dy * force * 0.1;
            // Maybe just Z lift for effect
            pz += force * 0.5;
        }

        dummyObj.position.set(px, py, pz);
        // Scale down as they form the logo to make it sharper? 
        // Or keep size. 0.02 is decent.
        dummyObj.scale.set(0.02, 0.02, 0.02);
        dummyObj.updateMatrix();
        
        if (pointsRef.current) {
            pointsRef.current.setMatrixAt(i, dummyObj.matrix);
        }
    }
    
    if (pointsRef.current) {
        pointsRef.current.instanceMatrix.needsUpdate = true;
    }

    // Fade in solid logo at the very end
    if (solidLogoRef.current) {
        // Fade in when progress > 0.8
        const fadeStart = 0.8;
        if (progress > fadeStart) {
            const opacity = (progress - fadeStart) / (1 - fadeStart);
            solidLogoRef.current.material.opacity = opacity;
            solidLogoRef.current.visible = true;
        } else {
            solidLogoRef.current.visible = false;
        }
        
        // Fade out points as solid logo appears?
        // User asked for "data points... form the exact logo".
        // Usually this means points stay.
        // But "exact logo as shown in logo.svg" implies the solid shape.
        // If I keep points, it looks like a dot-matrix logo.
        // If I fade in solid, it looks like the vector.
        // I will keep points visible but maybe fade them slightly or just let them sit on top/underneath.
        // Let's match the "solid logo overlay" logic from before but make it work.
    }
  });

  return (
    <>
      <instancedMesh ref={pointsRef} args={[null, null, pointCount]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </instancedMesh>
      
      {/* Solid Logo overlay */}
      <group 
        position={[-logoCenter.x * logoScale, -logoCenter.y * logoScale, -0.1]} // Slight Z offset behind points
        scale={[logoScale, -logoScale, 1]} 
      >
           <mesh ref={solidLogoRef} visible={false}>
               <shapeGeometry args={[logoShapes]} />
               <meshBasicMaterial color="#ffffff" transparent opacity={0} side={THREE.DoubleSide} />
           </mesh>
      </group>
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
