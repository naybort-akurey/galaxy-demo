import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { AdditiveBlending, Float32BufferAttribute } from 'three'

const gui = new dat.GUI({
    width: 400,
    closed: true
})

const textureLoader = new THREE.TextureLoader()
const shape = textureLoader.load('https://naybort-akurey.github.io/galaxy-demo/particleShape/1.png')

const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()
const parameters = {}

parameters.count = 50000
parameters.size = 0.026
parameters.radius = 4
parameters.branches = 5
parameters.spin = -1.302
parameters.randomness = 0.4
parameters.randomnessPower = 4
parameters.stars = 7000
parameters.starColor = '#1b3984'
parameters.insideColor = '#aa0d0d'
parameters.outsideColor = '#070159'

let bgStarsGeometry = null
let bgStarsMaterial = null
let bgStars = null

function generateBgStars(){

    if(bgStars!==null){
        bgStarsGeometry.dispose()
        bgStarsMaterial.dispose()
        scene.remove(bgStars)
    }

    bgStarsGeometry = new THREE.BufferGeometry()
    const bgStarsPositions = new Float32Array(parameters.stars * 100)

    bgStarsGeometry.setAttribute('position', new THREE.BufferAttribute(bgStarsPositions, 3))

    bgStarsMaterial = new THREE.PointsMaterial({
        color: 'white',
        size: parameters.size,
        depthWrite: false,
        sizeAttenuation: true,
        blending: AdditiveBlending,
        color: parameters.starColor,
        transparent: true,
        alphaMap: shape
    })

    bgStars = new THREE.Points(bgStarsGeometry, bgStarsMaterial)

    scene.add(bgStars)
}

generateBgStars()




let geometry = null
let material = null
let points = null


function generateGalaxy(){

    if(points !== null){
        geometry.dispose()
        material.dispose()
        scene.remove(points)
    }

    geometry = new THREE.BufferGeometry()

    const positions = new Float32Array(parameters.count *3)
    const colors = new Float32Array(parameters.count *3)

    const colorInside = new THREE.Color(parameters.insideColor)
    const colorOutside = new THREE.Color(parameters.outsideColor)

    for(let i=0; i<parameters.count; i++){

        const x =  Math.random() * parameters.radius
        const branchAngle = (i % parameters.branches) / parameters.branches * 2 * Math.PI
        const spinAngle = x * parameters.spin

        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random()<0.5 ? 1: -1) 
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random()<0.5 ? 1: -1) 
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random()<0.5 ? 1: -1)

        positions[i*3] = Math.sin(branchAngle + spinAngle) * x + randomX
        positions[i*3 + 1] = randomY
        positions[i*3 + 2] = Math.cos(branchAngle + spinAngle) * x + randomZ

        const mixedColor = colorInside.clone()
        mixedColor.lerp(colorOutside, x / parameters.radius)

        colors[i*3 + 0] = mixedColor.r
        colors[i*3 + 1] = mixedColor.g
        colors[i*3 + 2] = mixedColor.b
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    material = new THREE.PointsMaterial({
        color: 'white',
        size: parameters.size,
        depthWrite: false,
        sizeAttenuation: true,
        blending: AdditiveBlending,
        vertexColors: true,
        transparent: true,
        alphaMap: shape
    })

    points = new THREE.Points(geometry, material)
    scene.add(points)


}

generateGalaxy()

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{

    sizes.width = window.innerWidth
    sizes.height = window.innerHeight


    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()


    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})


const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)


const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    points.rotation.y = elapsedTime*0.3
    bgStars.rotation.y = - elapsedTime*0.05
    controls.update()
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}

tick()