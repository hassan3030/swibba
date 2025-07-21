"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { motion } from "framer-motion"

export function ThreeDLogo() {
  const containerRef = useRef(null)
  const rendererRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const cubeRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Initialize scene
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Initialize camera
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    camera.position.z = 2
    cameraRef.current = camera

    // Initialize renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    })
    renderer.setSize(60, 60)
    renderer.setClearColor(0x000000, 0)
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Create cube with Google colors
    const geometry = new THREE.BoxGeometry(1, 1, 1)

    // Create materials with Google colors
    const materials = [
      new THREE.MeshBasicMaterial({ color: 0x4285f4 }), // Blue
      new THREE.MeshBasicMaterial({ color: 0xea4335 }), // Red
      new THREE.MeshBasicMaterial({ color: 0xfbbc05 }), // Yellow
      new THREE.MeshBasicMaterial({ color: 0x34a853 }), // Green
      new THREE.MeshBasicMaterial({ color: 0x673ab7 }), // Purple
      new THREE.MeshBasicMaterial({ color: 0x4285f4 }), // Blue
    ]

    const cube = new THREE.Mesh(geometry, materials)
    scene.add(cube)
    cubeRef.current = cube

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)

      if (cubeRef.current) {
        cubeRef.current.rotation.x += 0.01
        cubeRef.current.rotation.y += 0.01
      }

      renderer.render(scene, camera)
    }

    animate()

    // Cleanup
    return () => {
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement)
      }
    }
  }, [])

  return (
    <motion.div
      ref={containerRef}
      className="h-[60px] w-[60px]"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    />
  )
}
