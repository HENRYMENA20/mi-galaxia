import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// --- Lógica del Botón de Entrada ---
document.getElementById('btn-entrar').addEventListener('click', () => {
  const m = document.getElementById('modal');
  m.classList.add('oculto');
  setTimeout(() => m.style.display = 'none', 1000);
  document.getElementById('top-text').style.display = 'block';
  
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  if (isMobile) document.getElementById('hint').style.display = 'block';
  
  const a = document.getElementById('musica');
  a.currentTime = 16;
  a.play().catch(() => {});
});

// --- Configuración de la Escena 3D ---
const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('galaxy'),
  antialias: !isMobile,
  alpha: true,
  powerPreference: 'high-performance'
});
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.5 : 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.90;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 200000);
camera.position.set(0, isMobile ? 180 : 200, isMobile ? 1100 : 700);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.minDistance = 60;
controls.maxDistance = Infinity;
controls.enablePan = false;
controls.minPolarAngle = Math.PI * 0.2;
controls.maxPolarAngle = Math.PI * 0.8;

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight));
bloom.threshold = 0.85; bloom.strength = 0.42; bloom.radius = 0.30;
composer.addPass(bloom);

const col = new THREE.Color();

// --- Fondo de Estrellas ---
(function() {
  const n = isMobile ? 1200 : 2500;
  const pos = new Float32Array(n * 3), color = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const i3 = i * 3;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 12000 + Math.random() * 60000;
    pos[i3] = r * Math.sin(phi) * Math.cos(theta);
    pos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i3 + 2] = r * Math.cos(phi);
    if (Math.random() < 0.55) col.setHSL(0.08, 0.05, 0.90 + Math.random() * 0.10);
    else col.setHSL(0.0, 0.0, 0.95);
    color[i3] = col.r; color[i3 + 1] = col.g; color[i3 + 2] = col.b;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(color, 3));
  scene.add(new THREE.Points(g, new THREE.PointsMaterial({
    size: isMobile ? 1.8 : 2.4, vertexColors: true, blending: THREE.AdditiveBlending,
    transparent: true, opacity: 0.65, depthWrite: false
  })));
})();

// --- Galaxia Espiral ---
let galaxyMesh, armsMesh;
(function() {
  const n = isMobile ? 35000 : 65000;
  const pos = new Float32Array(n * 3), color = new Float32Array(n * 3);
  const ARMS = 5, SPIN = 4.5, SPREAD = 0.38, H = 55;
  for (let i = 0; i < n; i++) {
    const i3 = i * 3;
    const arm = i % ARMS;
    const t = Math.pow(Math.random(), 0.55);
    const rad = 60 + t * 980;
    const baseAng = (arm / ARMS) * Math.PI * 2;
    const spinAng = t * SPIN;
    const scatter = (Math.random() - .5) * SPREAD * (1 + t * 1.5);
    pos[i3] = Math.cos(baseAng + spinAng + scatter) * rad;
    pos[i3 + 1] = (Math.random() - .5) * H * Math.exp(-rad / 500);
    pos[i3 + 2] = Math.sin(baseAng + spinAng + scatter) * rad;
    const nt = rad / 1050;
    if (nt < 0.1) col.setHSL(0.05, 0.15, 0.96);
    else if (nt < 0.3) col.setHSL(0.93 + Math.random() * 0.04, 0.80, 0.78 + Math.random() * 0.12);
    else if (nt < 0.6) col.setHSL(0.95 + Math.random() * 0.04, 0.85, 0.62 + Math.random() * 0.15);
    else col.setHSL(0.88 + Math.random() * 0.06, 0.90, 0.48 + Math.random() * 0.18);
    color[i3] = col.r; color[i3 + 1] = col.g; color[i3 + 2] = col.b;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(color, 3));
  galaxyMesh = new THREE.Points(g, new THREE.PointsMaterial({
    size: isMobile ? 1.6 : 2.1, vertexColors: true, blending: THREE.AdditiveBlending,
    transparent: true, depthWrite: false, opacity: 0.92
  }));
  scene.add(galaxyMesh);
})();

// --- Brazos de la Galaxia ---
(function() {
  const n = isMobile ? 6000 : 11000;
  const pos = new Float32Array(n * 3), color = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const i3 = i * 3, t = i / n, arm = i % 5, base = (arm / 5) * Math.PI * 2;
    const r = 70 + t * 960, ang = base + t * Math.PI * 4.2;
    pos[i3] = Math.cos(ang) * r; pos[i3 + 1] = (Math.random() - .5) * 10; pos[i3 + 2] = Math.sin(ang) * r;
    col.setHSL(0.94 + Math.random() * 0.04, 0.25, 0.92 + Math.random() * 0.08);
    color[i3] = col.r; color[i3 + 1] = col.g; color[i3 + 2] = col.b;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(color, 3));
  armsMesh = new THREE.Points(g, new THREE.PointsMaterial({
    size: isMobile ? 2.5 : 3.2, vertexColors: true, blending: THREE.AdditiveBlending,
    transparent: true, depthWrite: false
  }));
  scene.add(armsMesh);
})();

// --- Centro (Agujero Negro) ---
scene.add(new THREE.Mesh(new THREE.SphereGeometry(42, 64, 64), new THREE.MeshBasicMaterial({ color: 0x000000 })));

const haloMat = new THREE.ShaderMaterial({
  uniforms: { uTime: { value: 0 } },
  vertexShader: `varying vec3 vN;void main(){vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader: `uniform float uTime;varying vec3 vN;
    void main(){
      float rim=1.-max(dot(vN,vec3(0,0,1)),0.);
      rim=pow(rim,3.0);float p=0.78+0.18*sin(uTime*1.8);
      vec3 c=mix(vec3(.28,.0,.12),vec3(.95,.28,.62),rim)*rim*p;
      gl_FragColor=vec4(c,rim*0.48);
    }`,
  transparent: true, side: THREE.FrontSide, depthWrite: false, blending: THREE.AdditiveBlending
});
scene.add(new THREE.Mesh(new THREE.SphereGeometry(53, 64, 64), haloMat));

// --- Discos de Acreción ---
function mkDisk(inner, outer, c1, c2, c3, op, rx) {
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 }, uIn: { value: inner }, uOut: { value: outer },
      uC1: { value: new THREE.Color(c1) }, uC2: { value: new THREE.Color(c2) }, uC3: { value: new THREE.Color(c3) }
    },
    vertexShader: `varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform float uTime,uIn,uOut;uniform vec3 uC1,uC2,uC3;varying vec3 vP;
      float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        float r=length(vP.xy);float t=clamp((r-uIn)/(uOut-uIn),0.,1.);
        vec3 c=t<.4?mix(uC1,uC2,t/.4):mix(uC2,uC3,(t-.4)/.6);
        float ang=atan(vP.y,vP.x);float sw=h(vec2(r*.1,ang+uTime*.25))*.22;
        float glow=(1.-t)*(1.-t)*1.1+sw*.25;
        float a=(1.-t)*(1.-t*t)*${op.toFixed(2)}+sw*.08;
        gl_FragColor=vec4(c*glow,clamp(a,0.,1.));
      }`,
    side: THREE.DoubleSide, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
  });
  const m = new THREE.Mesh(new THREE.RingGeometry(inner, outer, 256, 8), mat);
  m.rotation.x = rx; scene.add(m); return mat;
}
const dM1 = mkDisk(48, 165, '#FFFFFF', '#FFB8D8', '#880044', 0.60, Math.PI / 2);
const dM2 = mkDisk(56, 132, '#FFD6E8', '#E8508A', '#3D001A', 0.32, Math.PI / 2 + 0.13);
const dM3 = mkDisk(165, 295, '#FF8CB8', '#AA0050', '#000000', 0.16, Math.PI / 2);

// --- Jets de Energía ---
function mkJet(dir) {
  const mat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: `varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform float uTime;varying vec2 vU;
      void main(){
        float f=pow(1.-vU.y,2.)*(1.-vU.x*2.);float p=.6+.28*sin(uTime*3.8+vU.y*9.);
        vec3 c=mix(vec3(1.,.72,.88),vec3(.72,.0,.38),vU.y);
        gl_FragColor=vec4(c*p,f*0.32);
      }`,
    transparent: true, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false
  });
  const m = new THREE.Mesh(new THREE.ConeGeometry(8, 225, 32, 1, true), mat);
  m.position.y = dir * 112; m.rotation.x = dir > 0 ? 0 : Math.PI; scene.add(m); return mat;
}
const jM1 = mkJet(1), jM2 = mkJet(-1);

// --- Partículas del Disco ---
const pN = 300;
const pGeo = new THREE.BufferGeometry(), pBuf = new Float32Array(pN * 3), pA = [], pR = [];
for (let i = 0; i < pN; i++) {
  const a = Math.random() * Math.PI * 2, r = 52 + Math.random() * 210;
  pA.push(a); pR.push(r);
  pBuf[i * 3] = Math.cos(a) * r; pBuf[i * 3 + 1] = (Math.random() - .5) * 7; pBuf[i * 3 + 2] = Math.sin(a) * r;
}
pGeo.setAttribute('position', new THREE.BufferAttribute(pBuf, 3));
const diskPts = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xFFB0D0, size: 2.0, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }));
scene.add(diskPts);

// --- Corazón de Estrellas ---
function hXY(t) { return { x: 16 * Math.pow(Math.sin(t), 3), y: 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t) }; }
const hN = isMobile ? 5000 : 8000, hP = new Float32Array(hN * 3), hC = new Float32Array(hN * 3);
for (let i = 0; i < hN; i++) {
  const i3 = i * 3, t = Math.random() * Math.PI * 2, s = 0.45 + Math.random() * 0.55, p = hXY(t);
  hP[i3] = p.x * s * 3.8; hP[i3 + 1] = p.y * s * 3.8; hP[i3 + 2] = (Math.random() - .5) * 12;
  const d = Math.sqrt(p.x * p.x + p.y * p.y) / 22;
  const hue = 0.94 - d * 0.04;
  const lig = d < 0.25 ? 0.90 - d * 0.55 : 0.62 - d * 0.05;
  col.setHSL(hue, 0.95, Math.max(lig, 0.40));
  hC[i3] = col.r; hC[i3 + 1] = col.g; hC[i3 + 2] = col.b;
}
const hGeo = new THREE.BufferGeometry();
hGeo.setAttribute('position', new THREE.BufferAttribute(hP, 3));
hGeo.setAttribute('color', new THREE.BufferAttribute(hC, 3));
const heart = new THREE.Points(hGeo, new THREE.PointsMaterial({ size: isMobile ? 2.1 : 2.6, vertexColors: true, blending: THREE.NormalBlending, transparent: true, depthWrite: false, opacity: 0.97 }));
heart.position.y = isMobile ? 100 : 135; scene.add(heart);

// --- Frases Flotantes ---
const phrases = ["Te amo", "Eres mi todo", "Siempre tú", "Mi vida", "Mi amor", "Contigo", "Mi cielo", "Mi reina", "Por siempre", "Eres mi paz", "Mi corazón", "Eres luz", "Mi ángel", "Te necesito", "Eres especial", "Solo tú", "Mi felicidad", "Eres perfecta", "Mi sueño", "Gracias por existir", "Locamente enamorado", "Tú y yo", "Mi mundo", "Eternamente tuyo", "Mi hogar","Eres mi sol", "Mi luna", "Mi estrella", "Te adoro", "Eres mi inspiración", "Mi razón de ser", "Contigo hasta el fin", "Eres mi alegría", "Mi tesoro", "Siempre juntos", "Eres mi destino", "Mi amor eterno", "Tú eres mi universo","Como el centro de esta galaxia, tu amor es la fuerza de gravedad que mantiene mi vida en equilibrio. Te amo más allá de lo que las palabras pueden expresar."];
const sC = [{ fill: '#FF69B4', sh: '#C2185B' }, { fill: '#FF1493', sh: '#880E4F' }, { fill: '#FFB6C1', sh: '#E91E8C' }, { fill: '#FFFFFF', sh: '#E91E8C' }];

function mkSpr(txt, cd) {
  const cv = document.createElement('canvas'); cv.width = 1100; cv.height = 240;
  const cx = cv.getContext('2d');
  cx.font = "bold 105px 'Quicksand', sans-serif";
  cx.strokeStyle = 'rgba(0,0,0,0.55)'; cx.lineWidth = 8; cx.lineJoin = 'round';
  cx.strokeText(txt, 550, 122);
  cx.shadowColor = cd.sh; cx.shadowBlur = 28;
  cx.fillStyle = cd.fill; cx.textAlign = 'center'; cx.textBaseline = 'middle';
  cx.fillText(txt, 550, 122);
  return new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false }));
}
const tGrp = new THREE.Group(); scene.add(tGrp); const sMs = [];
const sprW = isMobile ? 170 : 145, sprH = isMobile ? 39 : 33;
for (let i = 0; i < 80; i++) {
  const cd = sC[i % sC.length], sp = mkSpr(phrases[i % phrases.length], cd);
  const arm = i % 5, t2 = i / 80, r = 160 + t2 * 820, ang = (arm / 5) * Math.PI * 2 + t2 * Math.PI * 4.2;
  sp.position.set(Math.cos(ang) * r, (Math.random() - .5) * (isMobile ? 55 : 110), Math.sin(ang) * r);
  sp.scale.set(sprW, sprH, 1); sp.material.opacity = 0; tGrp.add(sp); sMs.push(sp.material);
}

// --- Emojis Flotantes ---
const emojis = ['💖', '💕', '🌸', '🌷', '🌺', '💗', '✨', '💫', '🌹', '💎'];
const eGrp = new THREE.Group(); scene.add(eGrp);
function mkEmoji(e) {
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 256;
  const cx = cv.getContext('2d');
  cx.font = "195px 'Segoe UI Emoji', sans-serif";
  cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(e, 128, 150);
  return new THREE.Mesh(new THREE.PlaneGeometry(52, 52), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, alphaTest: .04, depthWrite: false }));
}
for (let i = 0; i < 24; i++) {
  const m = mkEmoji(emojis[i % emojis.length]);
  const a = i / 24 * Math.PI * 2, r = 195 + Math.random() * 620;
  m.position.set(Math.cos(a) * r, (Math.random() - .5) * 115, Math.sin(a) * r); eGrp.add(m);
}
// --- Fotos Flotantes (.jpeg desde /img) ---
const fotoArchivos = ['imagen1.jpeg', 'imagen2.jpeg', 'imagen3.jpeg', 'imagen4.jpeg', 'imagen5.jpeg', 'imagen6.jpeg', 'imagen7.jpeg', 'imagen8.jpeg','imagen9.jpeg', 'imagen10.jpeg','imagen11.jpeg']; // Cambia por tus nombres reales
const fGrp = new THREE.Group(); 
scene.add(fGrp);

const textureLoader = new THREE.TextureLoader();

fotoArchivos.forEach((nombre, i) => {
  textureLoader.load(`img/${nombre}`, (texture) => {
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.colorSpace = THREE.SRGBColorSpace; // Asegura colores vibrantes y correctos
    // --------------------------
    // Material con la foto
    const material = new THREE.SpriteMaterial({ 
      map: texture, 
      transparent: true, 
      opacity: 0, // Empezará invisible para el fade-in
      depthTest: true,
      depthWrite: false 
    });

    const sprite = new THREE.Sprite(material);
    
    // Posicionamiento aleatorio en círculo
    const angulo = (i / fotoArchivos.length) * Math.PI * 2;
    const radio = 400 + Math.random() * 300; // Distancia del centro
    sprite.position.set(
      Math.cos(angulo) * radio,
      (Math.random() - 0.5) * 200, // Altura aleatoria
      Math.sin(angulo) * radio
    );

    // Tamaño de las fotos (ajusta según prefieras)
    const ancho = 80; 
    const alto = 80;
    sprite.scale.set(ancho, alto, 1);

    fGrp.add(sprite);
  });
});

// --- Iluminación y Resize ---
scene.add(new THREE.AmbientLight(0xFFE8F8, 0.28));
const pl = new THREE.PointLight(0xFF70B0, 2.8, 430); scene.add(pl);

window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight); composer.setSize(innerWidth, innerHeight);
});

// --- Bucle de Animación ---
const clock = new THREE.Clock();
function loop() {
  requestAnimationFrame(loop);
  const t = clock.getElapsedTime();
  galaxyMesh.rotation.y = t * 0.022;
  armsMesh.rotation.y = t * 0.022;
  tGrp.rotation.y = t * 0.016;
  eGrp.rotation.y = t * 0.010;
  fGrp.rotation.y = t * 0.012; // Rotación suave para las fotos
  eGrp.children.forEach(m => m.lookAt(camera.position));
  heart.rotation.y += 0.0035;
  heart.position.y = (isMobile ? 100 : 135) + Math.sin(t * 1.7) * 7;
  fGrp.children.forEach((sprite, i) => {
    // Aparecer suavemente al inicio
    sprite.material.opacity = THREE.MathUtils.lerp(sprite.material.opacity, 0.9, 0.02);
    
    // Movimiento sutil de arriba abajo individual
    sprite.position.y += Math.sin(t + i) * 0.1;
    });
  const pa = diskPts.geometry.attributes.position.array;
  for (let i = 0; i < pN; i++) {
    const sp = 0.28 + pR[i] * .00085, ang = pA[i] + t * sp;
    pa[i * 3] = Math.cos(ang) * pR[i]; pa[i * 3 + 2] = Math.sin(ang) * pR[i];
  }
  diskPts.geometry.attributes.position.needsUpdate = true;
  
  haloMat.uniforms.uTime.value = t;
  [dM1, dM2, dM3, jM1, jM2].forEach(m => m.uniforms.uTime.value = t);
  sMs.forEach((m, i) => m.opacity = THREE.MathUtils.lerp(m.opacity, 0.88 + Math.sin(t * 1.4 + i) * 0.10, .022));
  
  pl.intensity = 2.5 + Math.sin(t * 2.8) * .55;
  controls.update();
  composer.render();
}
loop();
