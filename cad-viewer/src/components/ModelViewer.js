import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

function Model({ modelUrl }) {
  const [model, setModel] = useState(null);
  const modelRef = useRef();
  
  useEffect(() => {
    if (!modelUrl) return;
    
    const fileExtension = modelUrl.split('.').pop().toLowerCase();
    
    if (fileExtension === 'obj') {
      const loader = new OBJLoader();
      loader.load(modelUrl, (object) => {
        // Center the object
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        object.position.sub(center);
        
        // Apply material to make it visible
        object.traverse((child) => {
          if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({
              color: 0x7777ff,
              metalness: 0.1,
              roughness: 0.5
            });
          }
        });
        
        setModel(object);
      });
    } else if (fileExtension === 'stl') {
      const loader = new STLLoader();
      loader.load(modelUrl, (geometry) => {
        // Center the geometry
        geometry.computeBoundingBox();
        const center = new THREE.Vector3();
        geometry.boundingBox.getCenter(center);
        geometry.translate(-center.x, -center.y, -center.z);
        
        const material = new THREE.MeshStandardMaterial({
          color: 0x7777ff,
          metalness: 0.1,
          roughness: 0.5
        });
        const mesh = new THREE.Mesh(geometry, material);
        setModel(mesh);
      });
    } else if (fileExtension === 'gltf' || fileExtension === 'glb') {
      const loader = new GLTFLoader();
      loader.load(modelUrl, (gltf) => {
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());
        gltf.scene.position.sub(center);
        setModel(gltf.scene);
      });
    }
    
    // Cleanup function
    return () => {
      if (model) {
        if (model.geometry) model.geometry.dispose();
        if (model.material) model.material.dispose();
      }
    };
  }, [modelUrl]);
  
  // This helps with positioning and scaling
  useEffect(() => {
    if (model && modelRef.current) {
      modelRef.current.add(model);
    }
    
    return () => {
      if (model && modelRef.current) {
        modelRef.current.remove(model);
      }
    };
  }, [model]);
  
  return <group ref={modelRef} />;
}

function CameraController() {
    const controlsRef = useRef();
    
    useFrame(() => {
      if (controlsRef.current) {
        controlsRef.current.update();
      }
    });
    
    return (
      <OrbitControls 
        ref={controlsRef}
        enablePan={true} 
        enableZoom={true} 
        enableRotate={true}
        minDistance={1}
        maxDistance={100}
        zoomSpeed={1.0}
      />
    );
  }

  function ModelViewer({ modelUrl }) {
    const controlsRef = useRef();
    const [modelBox, setModelBox] = useState(null);
    
    const handleModelLoaded = useCallback((boundingBox) => {
      setModelBox(boundingBox);
    }, []);
    
    const resetCamera = useCallback(() => {
      if (!controlsRef.current || !modelBox) return;
      
      // Calculate the size of the bounding box
      const size = new THREE.Vector3();
      modelBox.getSize(size);
      
      // Calculate the center of the bounding box
      const center = new THREE.Vector3();
      modelBox.getCenter(center);
      
      // Calculate the radius of the bounding sphere
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = 45; // matches your Canvas fov
      const cameraDistance = maxDim * 2; // Adjust multiplier as needed
      
      // Reset the camera position
      const camera = controlsRef.current.object;
      camera.position.set(0, 0, cameraDistance);
      camera.lookAt(0, 0, 0);
      
      // Update controls target and controller
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }, [modelBox]);
    
    return (
      <div className="model-viewer-container">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 10, 5]} intensity={1} />
          <directionalLight position={[-5, 10, -5]} intensity={0.5} />
          <Model modelUrl={modelUrl} onModelLoaded={handleModelLoaded} />
          <OrbitControls 
            ref={controlsRef}
            enablePan={true} 
            enableZoom={true} 
            enableRotate={true}
            minDistance={1}
            maxDistance={100}
            zoomSpeed={1.0}
          />
        </Canvas>
        <button 
          className="reset-view-btn"
          onClick={resetCamera}
        >
          Reset View
        </button>
      </div>
    );
  }
export default ModelViewer;
