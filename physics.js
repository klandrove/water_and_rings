//variable declaration section
let physicsWorld, scene, camera, renderer, rigidBodies = [], tmpTrans = null
let torusObjects = []; // Array to store references to all torus meshes


//physicsWorld: Manages the physics simulation in Ammo.js.
// scene: The 3D scene managed by Three.js.
// camera: Defines the perspective view of the 3D scene.
// renderer: Renders the scene using WebGL.
// rigidBodies: An array of objects that have physics enabled.
// tmpTrans: Temporary Ammo.js transformation object.


let ballObject = null, 
moveDirection = { left: 0, right: 0, forward: 0, back: 0 }
const STATE = { DISABLE_DEACTIVATION : 4 }

//Ammojs Initialization
Ammo().then(start)

function start (){

    tmpTrans = new Ammo.btTransform();
    setupPhysicsWorld();
    setupGraphics();
    setupEventHandlers();
    renderFrame();

}

function setupPhysicsWorld(){

    let collisionConfiguration = new Ammo.btDefaultCollisionConfiguration(),
        dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration),
        overlappingPairCache = new Ammo.btDbvtBroadphase(),
        solver = new Ammo.btSequentialImpulseConstraintSolver();

    physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
    physicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));

}


function setupGraphics(){

    //create clock for timing
    clock = new THREE.Clock();

    //create the scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xbfd1e5 );

    //create camera
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.2, 5000 );
    camera.position.set( 0, 25, 100 );
    camera.lookAt(new THREE.Vector3(0, 5, 0));

    //Add hemisphere light
    let hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.1 );
    hemiLight.color.setHSL( 0.6, 0.6, 0.6 );
    hemiLight.groundColor.setHSL( 0.1, 1, 0.4 );
    hemiLight.position.set( 0, 50, 0 );
    scene.add( hemiLight );

    //Add directional light
    let dirLight = new THREE.DirectionalLight( 0xffffff , 1);
    dirLight.color.setHSL( 0.1, 1, 0.95 );
    dirLight.position.set( -1, 1.75, 1 );
    dirLight.position.multiplyScalar( 100 );
    scene.add( dirLight );

    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(0, 10, 0);
    scene.add(light);

    dirLight.castShadow = true;

    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;

    let d = 50;

    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;

    dirLight.shadow.camera.far = 13500;

    //Setup the renderer
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setClearColor( 0xbfd1e5 );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    renderer.gammaInput = true;
    renderer.gammaOutput = true;

    renderer.shadowMap.enabled = true;

    //createAngledStreamVisualization();
    //createSecondStreamVisualization();
    createBottomBlock();
    createTopBlock();
    createHollowBoxConnection();
    createRing();
    createProngs();
    createSlides();
    createButtons();
}


function renderFrame(){

    let deltaTime = clock.getDelta();

    updatePhysics( deltaTime );


    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(cylinders);


    if (moveDirection.left === 1) {
        applyForceToStream(-10, 0); // Adjust force and direction as needed
    }

    if (moveDirection.right === 1) {
        applyForceToStream(10, 0); // Adjust force and direction as needed
    }

    renderer.render( scene, camera );

    requestAnimationFrame( renderFrame );

}

function setupEventHandlers(){

    window.addEventListener( 'keydown', handleKeyDown, false);
    window.addEventListener( 'keyup', handleKeyUp, false);
    window.addEventListener('click', onMouseClick, false);
    window.addEventListener('touchstart', onTouchStart, false);
    window.addEventListener('resize', onWindowResize);

}

window.addEventListener('resize', onWindowResize);

function onWindowResize() {
    // Update camera aspect ratio and projection matrix
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // Resize the renderer to match new dimensions
    renderer.setSize(window.innerWidth, window.innerHeight);
}


function onMouseClick(event) {
    // Convert screen coordinates to normalized device coordinates (-1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Perform raycasting
    raycaster.setFromCamera(mouse, camera);

    // Check for intersections
    const intersects = raycaster.intersectObjects(cylinders);

    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        handleCylinderClick(clickedObject);
    }
}

function onTouchStart(event) {

    event.preventDefault();
    // Get the first touch point
    const touch = event.touches[0];

    // Convert touch coordinates to normalized device coordinates (-1 to +1)
    mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;

    // Perform raycasting
    raycaster.setFromCamera(mouse, camera);

    // Check for intersections
    const intersects = raycaster.intersectObjects(cylinders);

    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        handleCylinderClick(clickedObject);
    }
}


function handleCylinderClick(cylinder) {
    if (cylinder === cylinders[0]) {
        streamSettings.forceStrength = 60;
        cylinders[0].scale.set(1, 0.5, 1);
        setTimeout(() => {
            streamSettings.forceStrength = 0;
            cylinders[0].scale.set(1, 1, 1);
        }, 200);
    } else if (cylinder === cylinders[1]) {
        streamSettingsR.forceStrength = 60;
        cylinders[1].scale.set(1, 0.5, 1);
        setTimeout(() => {
            streamSettingsR.forceStrength = 0;
            cylinders[1].scale.set(1, 1, 1);
        }, 200);
    }
}


function handleKeyDown(event){

    let keyCode = event.keyCode;

    switch(keyCode){

        case 37: 
            streamSettings.forceStrength = 60;
            cylinders[0].scale.set(1, 0.5, 1);
            break;

        case 39: 
            streamSettingsR.forceStrength = 60;
            cylinders[1].scale.set(1, 0.5, 1);
            break;

    }
}


function handleKeyUp(event){
    let keyCode = event.keyCode;

    switch(keyCode){
        case 37: 
            streamSettings.forceStrength = 0;
            cylinders[0].scale.set(1, 1, 1);
            break;

        case 39: 
            streamSettingsR.forceStrength = 0;
            cylinders[1].scale.set(1, 1, 1);
            break;
    }

}

function createBottomBlock(){
    
    let pos = {x: 0, y: -30, z: 0};
    let scale = {x: 70, y: 20, z: 10};
    let quat = {x: 0, y: 0, z: 0, w: 1};
    let mass = 0;

    //threeJS Section
    let blockPlane = new THREE.Mesh(new THREE.BoxBufferGeometry(), new THREE.MeshPhongMaterial({color: 0x4eff45}));

    blockPlane.position.set(pos.x, pos.y, pos.z);
    blockPlane.scale.set(scale.x, scale.y, scale.z);

    blockPlane.castShadow = true;
    blockPlane.receiveShadow = true;

    scene.add(blockPlane);


    //Ammojs Section
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    let motionState = new Ammo.btDefaultMotionState( transform );

    let shape = new Ammo.btBoxShape( new Ammo.btVector3( scale.x * 0.5, scale.y * 0.5, scale.z * 0.5 ) );
    shape.setMargin( 0.1 );

    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    shape.calculateLocalInertia( mass, localInertia );

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, shape, localInertia );
    let body = new Ammo.btRigidBody( rbInfo );

    body.setFriction(4);
    body.setRollingFriction(10);

    physicsWorld.addRigidBody( body );
}

function createTopBlock(){
    
    let pos = {x: 0, y: 50, z: 0};
    let scale = {x: 70, y: 4, z: 10};
    let quat = {x: 0, y: 0, z: 0, w: 1};
    let mass = 0;

    //threeJS Section
    let blockPlane = new THREE.Mesh(new THREE.BoxBufferGeometry(), new THREE.MeshPhongMaterial({color: 0x4eff45}));

    blockPlane.position.set(pos.x, pos.y, pos.z);
    blockPlane.scale.set(scale.x, scale.y, scale.z);

    blockPlane.castShadow = true;
    blockPlane.receiveShadow = true;

    scene.add(blockPlane);


    //Ammojs Section
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    let motionState = new Ammo.btDefaultMotionState( transform );

    let shape = new Ammo.btBoxShape( new Ammo.btVector3( scale.x * 0.5, scale.y * 0.5, scale.z * 0.5 ) );
    shape.setMargin( 0.05 );

    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    shape.calculateLocalInertia( mass, localInertia );

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, shape, localInertia );
    let body = new Ammo.btRigidBody( rbInfo );

    body.setFriction(4);
    body.setRollingFriction(10);

    physicsWorld.addRigidBody( body );
}

function createHollowBoxConnection() {
    const pos1 = { x: 0, y: -30, z: 0 }; // Bottom block position
    const scale1 = { x: 70, y: 30, z: 10 }; // Bottom block scale
    const scale2 = { x: 70, y: 3, z: 10 }; // Top block scale

    // Calculate dimensions of the hollow box
    const width = Math.max(scale1.x, scale2.x);
    const depth = Math.max(scale1.z, scale2.z);
    const height = 68.5;

    const hollowBoxMaterial = new THREE.MeshPhongMaterial({
        color: 0x21c8ff,
        transparent: true,
        opacity: 0.1,
    });

    // Create the four walls of the hollow box
    const wallThickness = 1;

    function createWall(position, size) {
        // Three.js Mesh
        const wall = new THREE.Mesh(
            new THREE.BoxBufferGeometry(size.x, size.y, size.z),
            hollowBoxMaterial
        );
        wall.position.set(position.x, position.y, position.z);
        scene.add(wall);

        // Ammo.js Rigid Body
        const shape = new Ammo.btBoxShape(
            new Ammo.btVector3(size.x / 2, size.y / 2, size.z / 2)
        );
        const transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));

        const motionState = new Ammo.btDefaultMotionState(transform);
        const mass = 0; // Static wall
        const localInertia = new Ammo.btVector3(0, 0, 0);

        const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
        const body = new Ammo.btRigidBody(rbInfo);
        physicsWorld.addRigidBody(body);
    }

    let y_pos = 29;
    // Front wall
    createWall(
        { x: pos1.x, y: y_pos / 2, z: pos1.z + depth / 2 },
        { x: width, y: height, z: wallThickness }
    );

    // Back wall
    createWall(
        { x: pos1.x, y: y_pos / 2, z: pos1.z - depth / 2 },
        { x: width, y: height, z: wallThickness }
    );

    // Left wall
    createWall(
        { x: pos1.x - width / 2, y: y_pos / 2, z: pos1.z },
        { x: wallThickness, y: height, z: depth }
    );

    // Right wall
    createWall(
        { x: pos1.x + width / 2, y: y_pos / 2, z: pos1.z },
        { x: wallThickness, y: height, z: depth }
    );
}


function createRing() {
    const radius = 2; // Radius of the ring
    const tubeRadius = 0.6; // Radius of the tube (thickness of the ring)
    const radialSegments = 16; // Number of radial segments (Three.js rendering)
    const tubularSegments = 32; // Number of tubular segments (Three.js rendering)
    const mass = 1; // Mass of the physics object

    // Colors for the torus objects
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff0000, 0x00ff00, 0x0000ff, 0xffff00];

    colors.forEach((color, index) => {
        let pos = { x: index * 3 -15 , y: 40, z: 0 };

        // Three.js Section
        let torus = new THREE.Mesh(
            new THREE.TorusGeometry(radius, tubeRadius, radialSegments, tubularSegments),
            new THREE.MeshPhongMaterial({ color: color })
        );

        torus.position.set(pos.x, pos.y, pos.z);
        torus.castShadow = true;
        torus.receiveShadow = true;

        torus.rotation.x = Math.PI / 2;

        scene.add(torus);

        // Ammo.js Section for Compound Shape
        let transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));

        let rot = new Ammo.btQuaternion();
        rot.setEulerZYX(torus.rotation.z, torus.rotation.y, torus.rotation.x);
        transform.setRotation(rot);

        let compoundShape = new Ammo.btCompoundShape();

        // Approximate torus with spheres arranged in a circle
        const numSegments = 10; // Number of segments to approximate the ring
        const angleStep = (2 * Math.PI) / numSegments;
        const noCollisionRadius = 0.5; // No-collision column radius

        for (let i = 0; i < numSegments; i++) {
            const angle = i * angleStep;

            // Position for each sphere in the ring
            const spherePos = new Ammo.btVector3(
                radius * Math.cos(angle),
                0,
                radius * Math.sin(angle)
            );

            // Check if the sphere falls outside the no-collision column
            const distanceFromCenter = Math.sqrt(spherePos.x() * spherePos.x() + spherePos.z() * spherePos.z());
            if (distanceFromCenter <= noCollisionRadius) {
                // Skip adding shapes inside the no-collision column
                continue;
            }

            // Create the sphere collision shape
            const sphereShape = new Ammo.btSphereShape(tubeRadius);

            // Transform for the sphere in the compound shape
            const sphereTransform = new Ammo.btTransform();
            sphereTransform.setIdentity();
            sphereTransform.setOrigin(spherePos);

            // Add the sphere to the compound shape
            compoundShape.addChildShape(sphereTransform, sphereShape);
        }

        // Create motion state and rigid body
        let motionState = new Ammo.btDefaultMotionState(transform);
        let localInertia = new Ammo.btVector3(0, 0, 0);
        compoundShape.calculateLocalInertia(mass, localInertia);

        let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, compoundShape, localInertia);
        let body = new Ammo.btRigidBody(rbInfo);

        // Optional: add friction, rolling friction, etc.
        body.setFriction(0.5);
        body.setRollingFriction(0.3);

        physicsWorld.addRigidBody(body);

        // Link physics to Three.js
        torus.userData.physicsBody = body;
        rigidBodies.push(torus);
        torusObjects.push(torus);

    });
}



function createProngs() {
    const prongMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });

    // Helper function to create a prong
    function createProng(position) {
        // Three.js Section: Create the tapered column
        const topRadius = 0.5;
        const bottomRadius = 2;
        const height = 20;
        const radialSegments = 16;
        const columnGeometry = new THREE.CylinderGeometry(topRadius, bottomRadius, height, radialSegments);
        const column = new THREE.Mesh(columnGeometry, prongMaterial);
        column.position.set(position.x, position.y + height / 2, position.z);
        scene.add(column);

        // Ammo.js Section: Physics body for the tapered column
        const columnShape = new Ammo.btConeShape(bottomRadius, height);
        const columnTransform = new Ammo.btTransform();
        columnTransform.setIdentity();
        columnTransform.setOrigin(new Ammo.btVector3(position.x, position.y + height / 2, position.z));
        const columnMotionState = new Ammo.btDefaultMotionState(columnTransform);
        const columnMass = 0; // Static
        const columnLocalInertia = new Ammo.btVector3(0, 0, 0);
        const columnRbInfo = new Ammo.btRigidBodyConstructionInfo(columnMass, columnMotionState, columnShape, columnLocalInertia);
        const columnBody = new Ammo.btRigidBody(columnRbInfo);
        physicsWorld.addRigidBody(columnBody);
    }

    // Position the prongs in the middle of the hollow box
    const prongOffset = 15; // Adjust this to place the prongs evenly spaced
    createProng({ x: -prongOffset, y: 8, z: 0 });
    createProng({ x: prongOffset, y: -3, z: 0 });

}



function updatePhysics( deltaTime ){

    // Step world
    physicsWorld.stepSimulation( deltaTime, 10 );

    // Update rigid bodies
    for ( let i = 0; i < rigidBodies.length; i++ ) {
        let objThree = rigidBodies[ i ];
        let objAmmo = objThree.userData.physicsBody;
        let ms = objAmmo.getMotionState();
        if ( ms ) {

            ms.getWorldTransform( tmpTrans );
            let p = tmpTrans.getOrigin();
            let q = tmpTrans.getRotation();
            objThree.position.set( p.x(), p.y(), p.z() );
            objThree.quaternion.set( q.x(), q.y(), q.z(), q.w() );

            if (isWithinStream(objThree, streamSettings)) {
                applyStreamForce(objThree, streamSettings);
            }

            if (isWithinStream(objThree, streamSettingsR)) {
                applyStreamForce(objThree, streamSettingsR);
            }

        }
    }

}

const streamSettings  = {
    origin: { x: -28.5, y: -20, z: 0 },
    radius: 6, // Radius of the circular column
    height: 50, // Height of the stream
    forceStrength: 0, // Upward force magnitude
    direction: { x: 0.1, y: 1, z: 0 },
};

const streamSettingsR  = {
    origin: { x: 28.5, y: -20, z: 0 },
    radius: 6, // Radius of the circular column
    height: 50, // Height of the stream
    forceStrength: 0, // Upward force magnitude
    direction: { x: -0.1, y: 1, z: 0 },
};

function normalizeVector(vector) {
    const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
    return {
        x: vector.x / magnitude,
        y: vector.y / magnitude,
        z: vector.z / magnitude,
    };
}

streamSettings.direction = normalizeVector(streamSettings.direction);

streamSettingsR.direction = normalizeVector(streamSettingsR.direction);


function isWithinStream(object, stream) {
    const position = object.position;
    const dx = position.x - stream.origin.x;
    const dz = position.z - stream.origin.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    return (
        distance <= stream.radius &&
        position.y >= stream.origin.y &&
        position.y <= stream.origin.y + stream.height
    );
}

function applyStreamForce(object, stream) {
    const position = object.position;
    const verticalPosition = position.y - stream.origin.y;
    const normalizedHeight = verticalPosition / stream.height; // 0 at bottom, 1 at top

    const adjustedForceStrength = stream.forceStrength * (1 - normalizedHeight); // Decrease force at top

    const direction = new Ammo.btVector3(
        stream.direction.x * adjustedForceStrength,
        stream.direction.y * adjustedForceStrength,
        stream.direction.z * adjustedForceStrength
    );
    const physicsBody = object.userData.physicsBody;
    physicsBody.applyCentralForce(direction);
}


function createAngledStreamVisualization() {
    const geometry = new THREE.CylinderGeometry(
        streamSettings.radius,
        streamSettings.radius,
        streamSettings.height,
        32
    );
    const material = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.3,
    });
    const cylinder = new THREE.Mesh(geometry, material);

    // Set the cylinder's position
    cylinder.position.set(
        streamSettings.origin.x,
        streamSettings.origin.y + streamSettings.height / 2,
        streamSettings.origin.z
    );

    // Rotate the cylinder to match the stream's direction
    const dir = new THREE.Vector3(
        streamSettings.direction.x,
        streamSettings.direction.y,
        streamSettings.direction.z
    );
    const axis = new THREE.Vector3(0, 1, 0); // Default cylinder direction (upward)
    const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, dir.normalize());
    cylinder.quaternion.copy(quaternion);

    scene.add(cylinder);
}

function createSecondStreamVisualization() {
    const geometry = new THREE.CylinderGeometry(
        streamSettingsR.radius,
        streamSettingsR.radius,
        streamSettingsR.height,
        32
    );
    const material = new THREE.MeshBasicMaterial({
        color: 0xff00ff, // Different color for distinction
        transparent: true,
        opacity: 0.3,
    });
    const cylinder = new THREE.Mesh(geometry, material);

    // Set the cylinder's position
    cylinder.position.set(
        streamSettingsR.origin.x,
        streamSettingsR.origin.y + streamSettingsR.height / 2,
        streamSettingsR.origin.z
    );

    // Rotate the cylinder to match the second stream's direction
    const dir = new THREE.Vector3(
        streamSettingsR.direction.x,
        streamSettingsR.direction.y,
        streamSettingsR.direction.z
    );
    const axis = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, dir.normalize());
    cylinder.quaternion.copy(quaternion);

    scene.add(cylinder);
}


function createSlides() {
    const slideMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });

    // Helper function to create a slide
    function createSlide(position, angle) {
        // Three.js Section: Create the slide
        const slideWidth = 26;
        const slideHeight = 2;
        const slideLength = 10;
        const slideGeometry = new THREE.BoxGeometry(slideWidth, slideHeight, slideLength);
        const slide = new THREE.Mesh(slideGeometry, slideMaterial);

        slide.position.set(position.x, position.y, position.z);
        slide.rotation.z = angle; // Rotate slide around the Z-axis
        scene.add(slide);

        // Ammo.js Section: Physics body for the slide
        const slideShape = new Ammo.btBoxShape(new Ammo.btVector3(slideWidth / 2, slideHeight / 2, slideLength / 2));
        slideShape.setMargin(0.05);
        const slideTransform = new Ammo.btTransform();
        slideTransform.setIdentity();
        slideTransform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));
        const quat = new Ammo.btQuaternion();
        quat.setEulerZYX(angle, 0, 0); // Apply Z-axis rotation
        slideTransform.setRotation(quat);

        const slideMotionState = new Ammo.btDefaultMotionState(slideTransform);
        const slideMass = 0; // Static
        const slideLocalInertia = new Ammo.btVector3(0, 0, 0);
        const slideRbInfo = new Ammo.btRigidBodyConstructionInfo(slideMass, slideMotionState, slideShape, slideLocalInertia);
        const slideBody = new Ammo.btRigidBody(slideRbInfo);
        physicsWorld.addRigidBody(slideBody);
    }

    // Position the slides symmetrically at the bottom
    const slideOffset = 11; // Adjust to place the slides symmetrically
    const slideHeight = -8; // Adjust for placement at the bottom
    const slideAngle = Math.PI / 6; // 30 degrees incline

    // Left slide
    createSlide({ x: -slideOffset, y: slideHeight, z: 0 }, slideAngle);

    // Right slide
    createSlide({ x: slideOffset, y: slideHeight, z: 0 }, -slideAngle);
}

let cylinders = [];

function createButtons(){
    const geometry = new THREE.CylinderGeometry(5, 5, 4, 32);
    const material = new THREE.MeshPhongMaterial({
        color: 0xffff00,
    });
    const cylinder = new THREE.Mesh(geometry, material);

    cylinder.position.set(-20, -30, 5,);

    const dir = new THREE.Vector3(0, 0, 1);
    const axis = new THREE.Vector3(0, 1, 0); 
    const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, dir.normalize());
    cylinder.quaternion.copy(quaternion);

    scene.add(cylinder);
    cylinders.push(cylinder);

    const cylinder2 = new THREE.Mesh(geometry, material);

    cylinder2.position.set(20, -30, 5,);
    cylinder2.quaternion.copy(quaternion);

    scene.add(cylinder2);
    cylinders.push(cylinder2);
}


let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
