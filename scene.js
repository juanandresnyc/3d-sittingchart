// https://github.com/mrdoob/three.js/blob/master/examples/webgl_loader_obj_mtl.html
var container;

var camera, scene, renderer;

var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

// Initials because public
// TODO figure out a better way to come up with this numbers
var DATA = [
  {name: 'ja', color: "rgb(255, 0, 0)", position: [-50, 0, 140]},
  {name: 'in', color: "rgb(0, 255, 0)", position: [-50, 0, -150]},
  {name: 'lr', color: "rgb(0, 0, 255)", position: [50, 0, 150]},
  {name: 'rh', color: "rgb(255, 255, 0)", position: [50, 0, -150]}
]

init();
animate();

function init() {

  container = document.createElement( 'div' );
  document.body.appendChild( container );

  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
  camera.position.z = 600;
  camera.position.y = 50;

  // scene

  scene = new THREE.Scene();

  var ambient = new THREE.AmbientLight( 0x101030 );
  scene.add( ambient );

  var directionalLight = new THREE.DirectionalLight( 0xffeedd );
  directionalLight.position.set( 0, 10, 10 );
  scene.add( directionalLight );

  var manager = new THREE.LoadingManager();

  // model
  var loader = new THREE.OBJLoader( manager );
  loader.load( 'table.obj', function ( object ) {
    // Table is more less at center ... markers can be arranged easier this way
    for (var i = -1; i <= 1 ; i++) {
      var newObject = object.clone();
      newObject.position.z = 15 + i*120;
      scene.add( newObject );
    }

  });

  // Load student markers
  for (var i = 0; i < DATA.length; i++) {
    var data = DATA[i];
    var studentMarker = new StudentMarker(data.name, data.color);
    studentMarker.mesh.position.x = data.position[0];
    studentMarker.mesh.position.y = 20;
    studentMarker.mesh.position.z = data.position[2];
    scene.add(studentMarker.mesh)
    scene.add(studentMarker.textMesh)
  }

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );

  // event listeners
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentMouseMove( event ) {
  mouseX = ( event.clientX - windowHalfX ) / 2;
  mouseY = ( event.clientY - windowHalfY ) / 2;
}

//

function animate() {
  requestAnimationFrame( animate );
  render();
}

function render() {
  camera.position.x += ( mouseX - camera.position.x ) * .03;
  camera.lookAt( scene.position );
  renderer.render( scene, camera );
}

function StudentMarker(name, color) {
  this.name = name;
  var geometry = new THREE.BoxBufferGeometry( 25, 50, 25 );
	var material = new THREE.MeshLambertMaterial( { color: new THREE.Color( color ) } );
  material.opacity = 0
	this.mesh = new THREE.Mesh( geometry, material );

  var loader = new THREE.FontLoader();

  var textGeometry = new THREE.TextGeometry(name, {
    // font: font,
    size: 80,
    height: 5,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 10,
    bevelSize: 8,
    bevelSegments: 5
  });

  this.textMesh = new THREE.Mesh( textGeometry, materials );
}
