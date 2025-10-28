import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

const gui = new dat.GUI()
const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()

// ground
const loader = new THREE.TextureLoader()
const sandCol = loader.load('/textures/beach/sand_Color.png')
const sandAO = loader.load('/textures/beach/sand_AmbientOcclusion.png')
const sandNorm = loader.load('/textures/beach/sand_NormalGL.png')
const sandRough = loader.load('/textures/beach/sand_Roughness.png')
const sandDisp = loader.load('/textures/beach/sand_Displacement.png')

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50, 50, 50),
    new THREE.MeshStandardMaterial({
        map: sandCol,
        aoMap: sandAO,
        aoMapIntensity: 1,
        normalMap: sandNorm,
        roughnessMap: sandRough,
        displacementMap: sandDisp,
        displacementScale: 0.02
    })
)
ground.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(ground.geometry.attributes.uv.array, 2))
ground.rotation.x = -Math.PI * 0.5
ground.receiveShadow = true
scene.add(ground)

// lighthouse
const lighthouse = new THREE.Group()
scene.add(lighthouse)

const tower = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 1, 6, 32),
    new THREE.MeshStandardMaterial({ color: '#fff', roughness: 0.6 })
)
tower.position.y = 3
lighthouse.add(tower)

const roof = new THREE.Mesh(
    new THREE.ConeGeometry(1.2, 1.5, 32),
    new THREE.MeshStandardMaterial({ color: '#f00', roughness: 0.6 })
)
roof.position.y = 6.75
lighthouse.add(roof)

// windows
for (let i = 0; i < 4; i++) {
    const winGeo = new THREE.BoxGeometry(0.3, 0.5, 0.1)
    const winMat = new THREE.MeshStandardMaterial({ color: '#222', roughness: 0.7 })
    const win = new THREE.Mesh(winGeo, winMat)
    win.position.set(0, -2 + i * 1.3, 1.05)
    tower.add(win)
}

// tower bands
for (let i = 0; i < 3; i++) {
    const ringGeo = new THREE.TorusGeometry(1.05, 0.02, 8, 32)
    const ringMat = new THREE.MeshStandardMaterial({ color: '#aaa', roughness: 0.5 })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.rotation.x = Math.PI / 2
    ring.position.y = -1 + i * 2
    tower.add(ring)
}

// spotlight
const light = new THREE.SpotLight('#ffffaa', 3, 30, THREE.MathUtils.degToRad(15), 0.2)
light.position.set(0, 7, 0)
light.castShadow = true
light.shadow.mapSize.width = 1024
light.shadow.mapSize.height = 1024
light.shadow.camera.near = 0.5
light.shadow.camera.far = 50
scene.add(light)
scene.add(light.target)

// beam
const beamGeo = new THREE.ConeGeometry(Math.tan(THREE.MathUtils.degToRad(15)) * 20, 20, 32, 1, true)
beamGeo.translate(0, -10, 0)
beamGeo.rotateX(-Math.PI / 2)
const beamMat = new THREE.MeshBasicMaterial({ color: '#ffffaa', transparent: true, opacity: 0.05, side: THREE.DoubleSide, depthWrite: false })
const beam = new THREE.Mesh(beamGeo, beamMat)
const beamPivot = new THREE.Object3D()
beamPivot.position.copy(light.position)
scene.add(beamPivot)
beamPivot.add(beam)

// ambient & fog
scene.add(new THREE.AmbientLight('#fff', 0.2))
scene.fog = new THREE.Fog('#262837', 1, 40)

// rocks
const rockMat = new THREE.MeshStandardMaterial({ color: '#888', roughness: 0.9, metalness: 0.1 })
function makeRock(size = 1){
    const geo = new THREE.DodecahedronGeometry(size,0)
    const m = new THREE.Mesh(geo,rockMat)
    m.castShadow = true
    m.receiveShadow = true
    return m
}
for(let i=0;i<20;i++){
    const r = makeRock(Math.random()*0.5+0.2)
    r.position.set((Math.random()-0.5)*20,0.2,(Math.random()-0.5)*20)
    r.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI)
    scene.add(r)
}

// logs
const logGeo = new THREE.CylinderGeometry(0.1,0.2,2,8)
const logMat = new THREE.MeshStandardMaterial({ color:'#654321', roughness:0.8 })
for(let i=0;i<5;i++){
    const l = new THREE.Mesh(logGeo,logMat)
    l.position.set((Math.random()-0.5)*15,0.1,(Math.random()-0.5)*15)
    l.rotation.set(0,Math.random()*Math.PI,Math.random()*Math.PI)
    l.castShadow = true
    l.receiveShadow = true
    scene.add(l)
}

// boulders
function makeBoulder(size=2){
    const geo = new THREE.DodecahedronGeometry(size,0)
    const mat = new THREE.MeshStandardMaterial({color:'#555', roughness:0.95, metalness:0.05})
    const m = new THREE.Mesh(geo,mat)
    m.castShadow = true
    m.receiveShadow = true
    return m
}
for(let i=0;i<2;i++){
    const b = makeBoulder(Math.random()*1.5+1)
    b.position.set(Math.random()*10+10,0.3,Math.random()*-10-10)
    b.rotation.set(Math.random()*Math.PI,Math.random()*Math.PI,Math.random()*Math.PI)
    scene.add(b)
}

// palms
function makePalm(){
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.25,4,6), new THREE.MeshStandardMaterial({ color:'#8b5a2b', roughness:0.9 }))
    trunk.castShadow = true
    trunk.position.y = 1.5
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(1,2,5), new THREE.MeshStandardMaterial({ color:'#228b22', roughness:0.8 }))
    leaf.position.y = 3
    trunk.add(leaf)
    return trunk
}
for(let i=0;i<5;i++){
    const p = makePalm()
    p.position.set((Math.random()-0.5)*25,0,(Math.random()-0.5)*25)
    p.rotation.y = Math.random()*Math.PI
    scene.add(p)
}

// shells
const shellGeo = new THREE.SphereGeometry(0.1,6,6)
const shellMat = new THREE.MeshStandardMaterial({ color:'#fff', roughness:0.7 })
for(let i=0;i<10;i++){
    const s = new THREE.Mesh(shellGeo,shellMat)
    s.position.set((Math.random()-0.5)*30,0.05,(Math.random()-0.5)*30)
    s.rotation.set(Math.random()*Math.PI,Math.random()*Math.PI,Math.random()*Math.PI)
    scene.add(s)
}

// bushes
const bushMat = new THREE.MeshStandardMaterial({ color:'#006400', roughness:0.9 })
function makeBush(){
    const geo = new THREE.IcosahedronGeometry(Math.random()*0.5+0.3,0)
    const m = new THREE.Mesh(geo,bushMat)
    m.castShadow = true
    m.receiveShadow = true
    return m
}
for(let i=0;i<8;i++){
    const b = makeBush()
    b.position.set((Math.random()-0.5)*25,0.15,(Math.random()-0.5)*25)
    scene.add(b)
}

// camera & controls
const sizes = { width: window.innerWidth, height: window.innerHeight }
const cam = new THREE.PerspectiveCamera(75,sizes.width/sizes.height,0.1,100)
cam.position.set(12,8,12)
scene.add(cam)

const controls = new OrbitControls(cam,canvas)
controls.enableDamping = true

// renderer
const renderer = new THREE.WebGLRenderer({ canvas })
renderer.setSize(sizes.width,sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
renderer.setClearColor('#262837')
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

// animate
const clock = new THREE.Clock()
function tick(){
    const t = clock.getElapsedTime()
    controls.update()
    const angle = t*0.5
    light.target.position.set(Math.sin(angle)*10,0,Math.cos(angle)*10)
    light.target.updateMatrixWorld()
    beamPivot.rotation.y = angle
    beam.lookAt(light.target.position)
    renderer.render(scene,cam)
    requestAnimationFrame(tick)
}
tick()

// resize
window.addEventListener('resize',()=>{
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    cam.aspect = sizes.width/sizes.height
    cam.updateProjectionMatrix()
    renderer.setSize(sizes.width,sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
})
