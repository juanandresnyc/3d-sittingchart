// https://github.com/mrdoob/three.js/blob/master/examples/webgl_loader_obj_mtl.html
// https://codepen.io/dxinteractive/pen/reNpOR

// Initials because public
// TODO figure out a better way to come up with this numbers
var DATA = [
  {name: 'ja', color: "rgb(255, 0, 0)", position: [-50, 0, 140]},
  {name: 'in', color: "rgb(0, 255, 0)", position: [-50, 0, -150]},
  {name: 'lr', color: "rgb(0, 0, 255)", position: [50, 0, 150]},
  {name: 'rh', color: "rgb(255, 255, 0)", position: [50, 0, -150]}
]

function get2DCoords(position, camera) {
  var vector = position.project(camera);
  vector.x = (vector.x + 1)/2 * window.innerWidth;
  vector.y = -(vector.y - 1)/2 * window.innerHeight;
  return vector;
}

// this.studentMarkers = [];
// for (var i = 0; i < DATA.length; i++) {
//   var data = DATA[i];
//   var studentMarker = new StudentMarker(data.name, data.color);
//   container.appendChild(studentMarker.textElement);
//   studentMarker.setPosition(data.position, this.camera);
//   scene.add(studentMarker.mesh);
//   studentMarkers.push(studentMarker);
// }

// function StudentMarker(name, color) {
//   this.name = name;
//   var geometry = new THREE.BoxBufferGeometry( 25, 50, 25 );
// 	var material = new THREE.MeshLambertMaterial( { color: new THREE.Color( color ) } );
// 	this.mesh = new THREE.Mesh( geometry, material );
//
//   this.textElement = document.createElement('div');
//   this.textElement.className = 'nameLabel';
//   this.textElement.innerHTML = name;
//
//   this.textPosition = new THREE.Vector3(0,0,0);
//
//   this.updateTextPosition = (camera) => {
//       this.textPosition.copy(this.mesh.position);
//       var coords2d = get2DCoords(this.textPosition, camera);
//       this.textElement.style.left = coords2d.x + 'px';
//       this.textElement.style.top = coords2d.y + 'px';
//   }
//
//   this.setPosition = (position, camera) =>  {
//     this.mesh.position.x = position[0];
//     this.mesh.position.y = 20;
//     this.mesh.position.z = position[2];
//     this.updateTextPosition(camera);
//   }
// }

function Engine() {
  this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000 );
  this.scene = new THREE.Scene();
  this.renderer = new THREE.WebGLRenderer();
  this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);

  this._setLights = () => {
    // var ambient = new THREE.AmbientLight( 0x101030 );
    // this.scene.add(ambient);

    var directionalLight = new THREE.DirectionalLight( 0xffffff );
    directionalLight.position.set( 0, 10, 10 );
    this.scene.add(directionalLight);
  }

  this._loadAsyncModels = () => {
    var loader = new THREE.OBJLoader();
    loader.load( 'table.obj', object => {
      // Table is more less at center ... markers can be arranged easier this way
      for (var i = -1; i <= 1 ; i++) {
        var newObject = object.clone();
        newObject.position.z = 15 + i*120;
        this.scene.add( newObject );
      }
    });
  }

  this._setControls = () => {
    this.controls.enableDamping = true;
    this.controls.dampingFactor =  0.25;
    this.controls.enableZoom = true;
    this.controls.enablePan = false;
    this.controls.enableKeys = false;
  }

  this.init = () => {
    this.renderer.setClearColor(0xF9F9F9);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.camera.position.z = 500;

    this._setLights();
    this._loadAsyncModels();

    this._setControls();
    return this;
  }

  this.resize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  this.update = () => {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  this.animate = () => {
    requestAnimationFrame(this.animate);
    this.update();
  }

  this.init();
}

const engine = new Engine();
const $container = document.createElement('div');
$container.appendChild(engine.renderer.domElement);
document.body.appendChild($container);
window.addEventListener('resize', engine.resize, false);

engine.animate();
