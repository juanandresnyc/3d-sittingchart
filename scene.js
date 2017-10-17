// https://github.com/mrdoob/three.js/blob/master/examples/webgl_loader_obj_mtl.html
// https://codepen.io/dxinteractive/pen/reNpOR

var ZONES_COLORS = {
  'juanandres': 'rgb(255, 0, 0)',
  'katie': 'rgb(0, 255, 0)',
  'iain': 'rgb(0, 0, 255)',
  'rebecca': 'rgb(0, 255, 255)',
  'liz': 'rgb(255, 255, 0)',
}

// Initials because public
// TODO figure out a better way to come up with this numbers
var DATA = [
  // Left side
  {name: 'Nl', color: ZONES_COLORS['juanandres'],  position: [-50, 0, 140]},
  {name: 'Kn', color: ZONES_COLORS['juanandres'],     position: [-50, 0, 60]},
  {name: 'Hr', color: ZONES_COLORS['katie'],           position: [-50, 0, -10]},
  {name: 'Ls', color: ZONES_COLORS['katie'],            position: [-50, 0, -90]},
  {name: 'By', color: ZONES_COLORS['katie'],        position: [-50, 0, -150]},
  // right side
  {name: 'Tq', color: ZONES_COLORS['liz'],      position: [50, 0, 150]},
  {name: 'Ma', color: ZONES_COLORS['liz'],       position: [50, 0, 90]},
  {name: 'Sa', color: ZONES_COLORS['rebecca'],   position: [50, 0, 30]},
  {name: 'Lg', color: ZONES_COLORS['rebecca'], position: [50, 0, -30]},
  {name: 'Ad', color: ZONES_COLORS['rebecca'],   position: [50, 0, -90]},
  {name: 'Aa', color: ZONES_COLORS['iain'],       position: [50, 0, -150]},
  // upper side
  {name: 'Se', color: ZONES_COLORS['iain'],      position: [-20, 0, -200]},
  {name: 'Je', color: ZONES_COLORS['iain'],   position: [20, 0, -200]},
  // lower side
  {name: 'Ts', color: ZONES_COLORS['liz'],       position: [0, 0, 200]},
]

function get2DCoords(position, camera) {
  var vector = position.project(camera);
  vector.x = (vector.x + 1)/2 * window.innerWidth;
  vector.y = -(vector.y - 1)/2 * window.innerHeight;
  return vector;
}

function StudentMarker(name, color) {
  this.name = name;
  var geometry = new THREE.BoxBufferGeometry(25, 50, 25);
	var material = new THREE.MeshLambertMaterial({color: new THREE.Color(color)});
	this.mesh = new THREE.Mesh(geometry, material);

  this.textElement = document.createElement('div');
  this.textElement.className = 'nameLabel';
  this.textElement.addEventListener('click', () => {
    this.textElement.className = 'present';
  })
  this.textElement.innerHTML = name;

  this.textPosition = new THREE.Vector3(0,0,0);

  this.updateTextPosition = (camera) => {
      this.textPosition.copy(this.mesh.position);
      var coords2d = get2DCoords(this.textPosition, camera);
      this.textElement.style.left = coords2d.x + 'px';
      this.textElement.style.top = coords2d.y + 'px';
  }

  this.setPosition = (position, camera) =>  {
    this.mesh.position.x = position[0];
    this.mesh.position.y = 20;
    this.mesh.position.z = position[2];
    this.updateTextPosition(camera);
  }
}

function Engine() {
  this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000 );
  this.scene = new THREE.Scene();
  this.renderer = new THREE.WebGLRenderer();
  this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
  this.studentMarkers = [];

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

  this.initStudentMarkers = (dataStore, domElement) => {
    for (var i = 0; i < dataStore.length; i++) {
      var data = dataStore[i];
      var studentMarker = new StudentMarker(data.name, data.color);
      domElement.appendChild(studentMarker.textElement);
      studentMarker.setPosition(data.position, this.camera);
      this.scene.add(studentMarker.mesh);
      this.studentMarkers.push(studentMarker);
    }
  }

  this.update = () => {
    this.controls.update();
    this.studentMarkers.forEach(studentMarker => {
      studentMarker.updateTextPosition(this.camera)
    });
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

// TODO: This data should be loaded differently
engine.initStudentMarkers(DATA, $container);
engine.animate();
