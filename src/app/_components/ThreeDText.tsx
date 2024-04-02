"use client";
import { useRef, Suspense } from "react";
import {
  Text3D,
  OrbitControls,
  Center,
  Stars,
  Float,
  Sparkles,
  useMatcapTexture,
} from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { Physics } from "@react-three/cannon";

function Hero() {
  const [matcapTexture] = useMatcapTexture("161B1F_C7E0EC_90A5B3_7B8C9B");
  //const ref = useRef();

  const { width: w, height: h } = useThree((state) => state.viewport);

  return (
    <>
      <Center scale={[0.9, 1, 1]}>
        <Text3D
          position={[3, 0, -5]}
          scale={[-1, 1, 1]}
          // ref={ref}
          size={w / 20}
          //maxWidth={[-w / 5, -h * 2, 3]}
          font={"/gt.json"}
          curveSegments={24}
          //brevelSegments={1}
          bevelEnabled
          bevelSize={0.05}
          bevelThickness={0.03}
          height={0.25}
          lineHeight={0.9}
          letterSpacing={0.3}
        >
          {`Taiwan LLM\nChatbot\nArena`}
          <meshMatcapMaterial color="white" matcap={matcapTexture} />
        </Text3D>
      </Center>
    </>
  );
}

export default function ThreeDText() {
  return (
    <div className="scene h-[90vh]">
      <Canvas camera={{ position: [-3, 0, -10], fov: 60 }}>
        <OrbitControls
          enableZoom={false}
          autoRotate={true}
          autoRotateSpeed={-5}
          enablePan={false}
          // azimuth={[-Math.PI / 4, Math.PI / 4]}
          zoomSpeed={0.15}
          dampingFactor={0.05}
        />

        <Suspense fallback={"Loading"}>
          {/* <Stars
            radius={100}
            depth={100}
            count={4000}
            factor={4}
            saturation={0}
            fade
            speed={0.2}
          />
          <Sparkles
            count={300}
            size={3}
            speed={0.02}
            opacity={1}
            scale={10}
            color="#fff3b0"
          /> */}
          <Hero />
        </Suspense>
        <ambientLight intensity={0.6} color={"#dee2ff"} />
      </Canvas>
    </div>
  );
}
