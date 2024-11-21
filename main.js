const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, 320 / 240, 0.1, 1000);
const renderer = new THREE.WebGL1Renderer();
renderer.setSize(400, 600, false);
(document.getElementById('threejs-container') || document.body).appendChild(renderer.domElement);

scene.background = new THREE.Color(0xcfe2f3);

const baseGeometry = new THREE.BoxGeometry( 5, 1, 1 ); 
const baseMaterial = new THREE.MeshStandardMaterial( {color: 0x4eff45} ); 
const baseCube = new THREE.Mesh( baseGeometry, baseMaterial ); 
scene.add( baseCube );
baseCube.position.y = -1.3;
baseCube.position.z = 2;

const topGeometry = new THREE.BoxGeometry( 5, 0.8, 0.3 ); 
const topMaterial = new THREE.MeshStandardMaterial( {color: 0x4eff45} ); 
const topCube = new THREE.Mesh( topGeometry, topMaterial ); 
scene.add( topCube );
topCube.position.y = 1.8;
topCube.position.z = 2;

// Using THREE.TorusGeometry for geometry
const radius = 0.2,
      tubeRadius = 0.05,
      radialSegments = 20,
      tubeSegments = 20;

// Create a function to generate donuts with different colors
function createDonut(color, position) {
  const material = new THREE.MeshLambertMaterial({ color: color });
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(radius, tubeRadius, radialSegments, tubeSegments),
    material
  );
  ring.position.set(position.x, position.y, position.z);
  scene.add(ring);
}

// Add a light source
const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(0, 10, 10);
scene.add(light);

// Create multiple donuts of different colors and positions
createDonut(0xff6347, { x: 0, y: 1, z: 2 });
createDonut(0x00ff00, { x: 2, y: 1, z: 2 }); 
createDonut(0x0000ff, { x: -2, y: 1, z: 2 }); 
createDonut(0xffff00, { x: 1, y: 1, z: 2 });

// Camera Position
camera.position.set(0, 0, 6);
camera.lookAt(0, 0, 0);


// Animation function
function animate() {
  requestAnimationFrame(animate);

  // Continuous rotation for each donut using a for loop
  for (let i = 0; i < scene.children.length; i++) {
    const child = scene.children[i];
    if (child.isMesh && child.geometry instanceof THREE.TorusGeometry) {
      let randomX = Math.random() < 0.5 ? -1 : 1;
      child.rotation.x += 0.01 * randomX;
      child.rotation.z += 0.02; 
    }
  }

  renderer.render(scene, camera);
}

scene.children.forEach(child => {
  if (child instanceof THREE.Mesh) {
    child.rotation.x = Math.PI /2;
  }
});

animate();