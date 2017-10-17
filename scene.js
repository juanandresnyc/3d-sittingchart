// https://github.com/mrdoob/three.js/blob/master/examples/webgl_loader_obj_mtl.html
// https://codepen.io/dxinteractive/pen/reNpOR

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

fetch('http://jovemprajovem.com/seats/seats.php' + window.location.search)
     .then(resp => resp.json())
     .then(resp => updateMarkers(resp.map(row => ({
       name: row.nm,
       color: row.color_value,
       position: [row.loc_x, row.loc_y, row.loc_z],
     }))));

function updateMarkers(data) {
  engine.initStudentMarkers(data, $container);
}

engine.animate();
