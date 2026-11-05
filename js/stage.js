// The constellation. One fixed WebGL stage behind the page; native scroll flies the camera through it.
// The orbs, their clips and the words all come from the <section data-*> blocks in index.html.
import * as THREE from './three.module.min.js';

const INK = new THREE.Color('#17121f');
const PAPER = new THREE.Color('#f3f1dc');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(pointer: coarse)').matches;

const canvas = document.getElementById('stage');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
} catch (e) {
  document.documentElement.classList.remove('gl'); // plain sections with stills
  throw e;
}
document.documentElement.classList.add('gl');
renderer.outputColorSpace = THREE.LinearSRGBColorSpace; // the shaders work in display space, like the capture
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 400);

const NOISE = /* glsl */`
vec3 m289(vec3 x){return x-floor(x*(1./289.))*289.;}vec4 m289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 perm(vec4 x){return m289(((x*34.)+1.)*x);}vec4 tis(vec4 r){return 1.79284291400159-.85373472095314*r;}
float snoise(vec3 v){const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;
vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=m289(i);
vec4 p=perm(perm(perm(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);
vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
vec4 norm=tis(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;
return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}`;

// The sheet: pale paper with a tunnel of hard-edged pigment bands that radiate from the focused orb
// and rush outward while you scroll. Stays pale, because ink type sits on it.
const bgU = {
  uTime: { value: 0 }, uPhase: { value: 0 }, uAspect: { value: 1 },
  uCenter: { value: new THREE.Vector2(0.5, 0.5) },
  uTint: { value: new THREE.Color('#d9eda0') }, uPaper: { value: PAPER },
};
const bg = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
  uniforms: bgU, depthTest: false, depthWrite: false,
  vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,1.,1.);}`,
  fragmentShader: `precision highp float;varying vec2 vUv;
  uniform float uTime,uPhase,uAspect;uniform vec2 uCenter;uniform vec3 uTint,uPaper;${NOISE}
  float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
  void main(){
    vec2 p=(vUv-uCenter)*vec2(uAspect,1.);
    float t=uTime;
    float n=snoise(vec3(p*1.15,t*.05))*.2;
    float r=length(p)+n;
    float a=atan(p.y,p.x);
    float k=log(max(r,.02)+.1)*5.2-uPhase+sin(a*2.+t*.08)*.16-t*.11;
    float band=smoothstep(-.035,.035,sin(k*6.283));
    float band2=smoothstep(-.03,.03,sin(k*6.283*.5+1.1));
    vec3 c=mix(uPaper,mix(uPaper,uTint,.42),band);
    c=mix(c,mix(c,uTint,.5),band*band2*.8);
    c+= (hash(gl_FragCoord.xy+fract(t)*91.)-.5)*.022;
    gl_FragColor=vec4(c,1.);
  }`,
}));
bg.frustumCulled = false; bg.renderOrder = -10; scene.add(bg);

// One orb: a soft sphere that shows its clip through a lens, with oil-film at the rim and an ink edge.
const orbVert = /* glsl */`
uniform float uTime,uWobble,uSeed;varying vec3 vN,vV,vS;
float dsp(vec3 d){float t=uTime;return (sin(d.x*2.7+t*.61+uSeed)+sin(d.y*3.3+t*.47+uSeed*2.)+sin(d.z*2.9-t*.53+uSeed*.7)+.5*sin((d.x+d.y)*5.1+t*.8))*.3*uWobble;}
void main(){
  vec3 d=normalize(position);
  vec3 t=normalize(cross(d,vec3(.3,1.,.2)));vec3 b=cross(d,t);float e=.06;
  vec3 p0=d*(1.+dsp(d));vec3 p1=normalize(d+t*e);p1*=(1.+dsp(p1));vec3 p2=normalize(d+b*e);p2*=(1.+dsp(p2));
  vec3 n=normalize(cross(p1-p0,p2-p0));if(dot(n,d)<0.)n=-n;
  vec4 mv=modelViewMatrix*vec4(p0,1.);
  vN=normalize(normalMatrix*n);vS=normalize(normalMatrix*d);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;
}`;
const orbFrag = /* glsl */`
precision highp float;varying vec3 vN,vV,vS;
uniform sampler2D uMap;uniform float uTime,uFocus,uHover,uHue,uAspect,uSeed;
vec3 pal(float t){return .5+.5*cos(6.283*(vec3(1.,1.,1.)*t+vec3(.0,.33,.67)));}
vec2 lens(vec2 q,float zoom){
  float r=length(q);float ang=(1.-uFocus*.8)*(.2*sin(uTime*.22+uSeed)+.1)*r*r*r;
  float c=cos(ang),s=sin(ang);q=mat2(c,-s,s,c)*q;
  q*=zoom*(.8+.2*r*r);
  return vec2(.5+q.x*(.54/max(uAspect,1.)),.5+q.y*.54);
}
void main(){
  vec3 N=normalize(vN),V=normalize(vV);
  float nv=clamp(dot(N,V),0.,1.);float fres=1.-nv;
  vec2 q=normalize(vS).xy;
  float ca=.006+fres*fres*.05;
  vec3 col=vec3(texture2D(uMap,lens(q,1.+ca)).r,texture2D(uMap,lens(q,1.)).g,texture2D(uMap,lens(q,1.-ca)).b);
  float sat=dot(col,vec3(.299,.587,.114));col=mix(vec3(sat),col,1.12);
  vec3 film=pal(fres*1.7+uHue+uTime*.035+q.x*.15);
  col=mix(col,film*1.08,smoothstep(.58,.95,fres)*.92);
  vec3 L=normalize(vec3(-.45,.62,.64));
  float sp=pow(max(dot(N,L),0.),90.);float crescent=smoothstep(.55,.6,dot(N,normalize(vec3(-.5,.7,.5))))*smoothstep(.72,.66,dot(N,normalize(vec3(-.5,.7,.5))))*.05;
  col+=vec3(1.)*(sp*.9+crescent);
  col+=film*uHover*.1;
  col=mix(col,vec3(.09,.07,.12),smoothstep(.915,.95,fres));
  gl_FragColor=vec4(col,1.);
}`;

// The pigment splat behind each orb.
const haloVert = `varying vec2 vUv;void main(){vUv=uv*2.-1.;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const haloFrag = /* glsl */`precision highp float;varying vec2 vUv;uniform float uTime,uSeed,uOpacity;uniform vec3 uA,uB;
void main(){
  float r=length(vUv);float a=atan(vUv.y,vUv.x);float t=uTime;
  float edge=.74+.075*sin(a*3.+uSeed+t*.17)+.05*sin(a*5.-uSeed*1.7+t*.23)+.02*sin(a*11.+uSeed*.6-t*.31);
  float aa=fwidth(r)*1.2;
  float inside=smoothstep(edge,edge-aa,r);
  float line=smoothstep(.014+aa,.014,abs(r-edge));
  float bands=step(.5,fract(r*8.5-t*.2+.3*sin(a*2.+uSeed)));
  vec3 c=mix(uA,uB,bands*.34+smoothstep(.5,.95,r/edge)*.5);
  c=mix(c,vec3(.09,.07,.12),line);
  float alpha=max(inside,line)*uOpacity;
  if(alpha<.01)discard;
  gl_FragColor=vec4(c,alpha);
}`;

const sections = [...document.querySelectorAll('[data-stop]')];
const orbSections = sections.filter((s) => s.dataset.clip !== undefined);
const scaleIdx = sections.findIndex((s) => s.dataset.scale !== undefined);
const texLoader = new THREE.TextureLoader();
const sphereGeo = new THREE.IcosahedronGeometry(1, coarse ? 16 : 26);
const world = new THREE.Group();
scene.add(world);

const blackTex = new THREE.DataTexture(new Uint8Array([20, 14, 30, 255]), 1, 1);
blackTex.needsUpdate = true;

const orbs = orbSections.map((sec, i) => {
  const d = sec.dataset;
  const u = {
    uMap: { value: blackTex }, uTime: { value: 0 }, uFocus: { value: 0 }, uHover: { value: 0 },
    uHue: { value: i * 0.17 }, uAspect: { value: 16 / 9 },
    uSeed: { value: i * 3.7 + 1.3 }, uWobble: { value: 0.04 },
  };
  const mesh = new THREE.Mesh(sphereGeo, new THREE.ShaderMaterial({ uniforms: u, vertexShader: orbVert, fragmentShader: orbFrag }));
  const hu = {
    uTime: u.uTime, uSeed: u.uSeed, uOpacity: { value: 1 },
    uA: { value: new THREE.Color(d.halo) }, uB: { value: new THREE.Color(d.halo2) },
  };
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({
    uniforms: hu, vertexShader: haloVert, fragmentShader: haloFrag, transparent: true, depthWrite: false,
  }));
  const group = new THREE.Group();
  group.add(halo, mesh);
  world.add(group);
  if (d.poster) texLoader.load(d.poster, (t) => { if (!orb.videoLive) { u.uMap.value = t; } t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; orb.poster = t; });
  const label = document.createElement('div');
  label.className = 'orb-label';
  label.textContent = d.name;
  document.getElementById('labels').appendChild(label);
  const orb = {
    sec, i, u, mesh, halo, hu, group, label, clip: d.clip, base: new THREE.Vector3(), side: +d.side || 1,
    tint: new THREE.Color(d.tint), video: null, tex: null, videoLive: false, focus: 0, hover: 0, scale: 1, poster: null, stopIndex: sections.indexOf(sec),
  };
  return orb;
});

function makeVideo(orb) {
  if (orb.video || !orb.clip) return;
  const v = document.createElement('video');
  v.src = orb.clip; v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'auto';
  v.setAttribute('playsinline', ''); v.setAttribute('muted', '');
  // three sizes its texture storage from these attributes, so they must match the file
  const [vidW, vidH] = (orb.sec.dataset.size || '960x540').split('x').map(Number);
  v.width = vidW; v.height = vidH; orb.u.uAspect.value = vidW / vidH;
  v.className = 'tex-video'; document.body.appendChild(v);
  orb.video = v;
  const t = new THREE.Texture(v);
  t.minFilter = THREE.LinearFilter; t.magFilter = THREE.LinearFilter; t.generateMipmaps = false;
  orb.tex = t;
  v.addEventListener('playing', () => { orb.videoLive = true; t.needsUpdate = true; orb.u.uMap.value = t; });
  if (v.requestVideoFrameCallback) {
    const onFrame = () => { orb.fresh = true; v.requestVideoFrameCallback(onFrame); };
    v.requestVideoFrameCallback(onFrame);
  } else orb.fresh = true;
}

// Floating spores and tiny mushrooms, drawn as flat ink-edged toys.
const toyVert = /* glsl */`uniform float uTime,uMask;uniform vec4 uZone;uniform vec4 uFace;varying vec3 vC,vN,vV;varying float vY;
void main(){
  vec4 ip=instanceMatrix[3];float h=fract(ip.x*7.13+ip.z*3.1);float sp=(h-.5)*1.2;
  float c=cos(uTime*sp),s=sin(uTime*sp);vec3 p=vec3(c*position.x+s*position.z,position.y,-s*position.x+c*position.z);
  vec3 n=vec3(c*normal.x+s*normal.z,normal.y,-s*normal.x+c*normal.z);
  mat3 im=mat3(instanceMatrix);
  vec4 cc=projectionMatrix*modelViewMatrix*vec4(instanceMatrix[3].xyz,1.);vec2 nd=cc.xy/max(cc.w,.01);
  vec2 zd=abs(nd-uZone.xy)-uZone.zw;float inside=1.-smoothstep(0.,.12,max(zd.x,zd.y));p*=1.-inside*uMask;
  float fd=length((nd-uFace.xy)*vec2(uFace.w,1.));p*=1.-(1.-smoothstep(uFace.z,uFace.z+.1,fd))*step(.001,uFace.z);
  vec4 mv=modelViewMatrix*instanceMatrix*vec4(p,1.);
  vC=instanceColor;vY=position.y;vN=normalize(normalMatrix*im*n);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;
}`;
const toyFrag = /* glsl */`precision highp float;varying vec3 vC,vN,vV;varying float vY;uniform float uStem;
void main(){
  vec3 N=normalize(vN);float nv=max(dot(N,normalize(vV)),0.);
  vec3 c=vC;if(uStem>.5&&vY<.02)c=vec3(.96,.93,.8);
  float l=step(.35,dot(N,normalize(vec3(-.4,.8,.5))));c*=.82+.18*l;
  c=mix(vec3(.09,.07,.12),c,smoothstep(.28,.36,nv));
  gl_FragColor=vec4(c,1.);
}`;
const toyTime = { value: 0 }; const toyMask = { value: 0 }; const toyZone = { value: new THREE.Vector4(0, 0, 1, 1) }; const toyFace = { value: new THREE.Vector4(0, 0, 0, 1) };
const toyMat = (stem) => new THREE.ShaderMaterial({ uniforms: { uTime: toyTime, uMask: toyMask, uZone: toyZone, uFace: toyFace, uStem: { value: stem } }, vertexShader: toyVert, fragmentShader: toyFrag });
const prof = [[0, -.55], [.13, -.55], [.1, -.05], [.12, .02], [.52, .0], [.56, .1], [.44, .36], [.2, .52], [0, .56]].map(([x, y]) => new THREE.Vector2(x, y));
const shroomGeo = new THREE.LatheGeometry(new THREE.SplineCurve(prof).getPoints(26), 18);
const POP = ['#b7e561', '#2fb7a3', '#ff5fb7', '#ffc53d', '#ff7a33', '#8f6bff'].map((c) => new THREE.Color(c));
const rnd = (() => { let s = 1337; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
const toyCounts = coarse ? [26, 90] : [46, 220];
const shrooms = new THREE.InstancedMesh(shroomGeo, toyMat(1), toyCounts[0]);
const spores = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 2), toyMat(0), toyCounts[1]);
shrooms.frustumCulled = spores.frustumCulled = false;
world.add(shrooms, spores);

// Mystery planets: the games nobody has seen yet. Not clickable, no names, just the size of the plan.
// Two for Early Access (seven in all), eight more for 1.0 (fifteen in all).
const qCanvas = document.createElement('canvas'); qCanvas.width = qCanvas.height = 256;
const qTex = new THREE.CanvasTexture(qCanvas);
const drawQ = () => {
  const c = qCanvas.getContext('2d'); c.clearRect(0, 0, 256, 256);
  c.font = '400 190px "Titan One", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#fff';
  c.fillText('?', 128, 138); qTex.needsUpdate = true;
};
drawQ();
if (document.fonts) document.fonts.load('400 190px "Titan One"', '?').then(drawQ);
const planetGeo = new THREE.IcosahedronGeometry(1, coarse ? 8 : 12);
const planetFrag = /* glsl */`precision highp float;varying vec3 vN,vV;uniform sampler2D uQ;uniform float uTime,uSeed,uTier;
void main(){
  vec3 N=normalize(vN);float nv=clamp(dot(N,normalize(vV)),0.,1.);
  float a=sin(uTime*.3+uSeed)*.14;float c=cos(a),s=sin(a);vec2 q=mat2(c,-s,s,c)*N.xy;
  float m=sin(q.y*7.+sin(q.x*3.5+uTime*.25+uSeed)*1.5+uSeed);
  vec3 c1=uTier<.5?vec3(.72,.9,.38):vec3(.97,.95,.85);
  vec3 c2=uTier<.5?vec3(.18,.72,.64):vec3(.84,.8,.95);
  vec3 col=mix(c1,c2,smoothstep(-.05,.05,m));
  float g=texture2D(uQ,q*.72+.5).a;
  col=mix(col,vec3(.09,.07,.12),g);
  col+=vec3(1.)*pow(max(dot(N,normalize(vec3(-.45,.62,.64))),0.),60.)*.7;
  col=mix(col,vec3(.09,.07,.12),smoothstep(.76,.82,1.-nv));
  gl_FragColor=vec4(col,1.);
}`;
const planetVert = `varying vec3 vN,vV;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normalize(position));vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`;
const ringMat = new THREE.MeshBasicMaterial({ color: 0x17121f, side: THREE.DoubleSide });
const planetSpots = {
  // tier, x and y as a fraction of depth seen from the pull-back camera, depth, size
  land: [[0, 0.015, 0.25, -6, 1.5], [0, -0.03, -0.265, -13, 1.55],
    [1, -0.49, 0.2, -5, 1.1], [1, -0.27, 0.285, -17, 1.35], [1, 0.22, 0.29, -9, 1.05], [1, 0.47, 0.235, -22, 1.5],
    [1, -0.46, -0.24, -19, 1.45], [1, -0.235, -0.3, -4, 1], [1, 0.25, -0.285, -24, 1.4], [1, 0.5, -0.2, -8, 1.15]],
  port: [[0, 0.01, 0.17, -5, 0.85], [0, 0, -0.19, -11, 0.85],
    [1, -0.125, 0.135, -8, 0.62], [1, 0.128, 0.155, -16, 0.8], [1, -0.135, 0.008, -20, 0.8], [1, 0.135, -0.03, -4, 0.58],
    [1, -0.122, -0.135, -12, 0.68], [1, 0.126, -0.12, -22, 0.85], [1, -0.065, -0.205, -18, 0.75], [1, 0.07, -0.2, -7, 0.6]],
};
const planets = planetSpots.land.map(([tier], i) => {
  const u = { uQ: { value: qTex }, uTime: { value: 0 }, uSeed: { value: i * 2.3 + 0.7 }, uTier: { value: tier } };
  const group = new THREE.Group();
  group.add(new THREE.Mesh(planetGeo, new THREE.ShaderMaterial({ uniforms: u, vertexShader: planetVert, fragmentShader: planetFrag })));
  if (i % 3 === 1) {
    const ring = new THREE.Mesh(new THREE.RingGeometry(1.42, 1.58, 56), ringMat);
    ring.rotation.set(1.2, 0.35 * (i % 2 ? 1 : -1), 0.4);
    group.add(ring);
  }
  world.add(group);
  return { group, u, tier, size: 1, base: new THREE.Vector3(), i };
});

let threads = new THREE.Group();
world.add(threads);
const threadMat = new THREE.ShaderMaterial({
  uniforms: { uTime: toyTime, uOpacity: { value: 1 } }, transparent: true, depthWrite: false,
  vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader: `precision highp float;varying vec2 vUv;uniform float uTime,uOpacity;
    void main(){float p=fract(vUv.x*5.-uTime*.22);float dash=smoothstep(.0,.015,p)*smoothstep(.09,.075,p);
    vec3 c=mix(vec3(.09,.07,.12),vec3(.72,.9,.38),dash);gl_FragColor=vec4(c,uOpacity);}`,
});

let layoutPortrait = null; let layoutKey = '';
let extent = 0;
const keysEye = []; const keysTarget = []; let curveEye; let curveTarget;
const shiftKeys = [];
const R = 1.7; const HERO_BACK_L = 16; const HERO_BACK_P = 22; const SCALE_BACK_L = 23; const SCALE_BACK_P = 34;

// The closing shot: find the nearest camera that holds every orb and planet, name tags included, in the
// space the words leave free, on whatever screen this is. Measured, so it cannot run off an edge.
function fitClose(portrait, center, vw, vh) {
  const card = document.querySelector('.end .card');
  let textRight = 0; let textTop = vh;
  card.querySelectorAll('img, a, .big').forEach((el) => {
    let box = el.getBoundingClientRect();
    if (el.classList.contains('big')) { const r = document.createRange(); r.selectNodeContents(el); box = r.getBoundingClientRect(); }
    // measured against its own section, so the answer does not depend on where the page is scrolled
    const secBox = card.parentElement.getBoundingClientRect();
    textRight = Math.max(textRight, box.right); textTop = Math.min(textTop, vh - (secBox.bottom - box.top));
  });
  const headerNdc = 1 - (64 / vh) * 2;
  const pad = 0.03;
  const region = portrait
    ? { x0: -1 + pad, x1: 1 - pad, y0: 1 - (textTop / vh) * 2 + 0.03, y1: headerNdc }
    : { x0: (textRight / vw) * 2 - 1 + 0.05, x1: 1 - pad, y0: -1 + 0.06, y1: headerNdc };
  const cam = new THREE.PerspectiveCamera(camera.fov, vw / vh, 0.1, 400);
  const dir = (portrait ? new THREE.Vector3(0.11, 0.09, 1) : new THREE.Vector3(-0.07, 0.07, 1)).normalize();
  const tanY = Math.tan(camera.fov * Math.PI / 360);
  const nodes = [
    ...orbs.map((o) => ({ p: o.base, r: R * (portrait ? 0.56 + o.i * 0.09 : 1 + o.i * 0.13), tag: true })),
    ...planets.map((m) => ({ p: m.base, r: m.size * 1.6, tag: false })),
  ];
  const v = new THREE.Vector3();
  const measureAt = (d) => {
    cam.position.copy(center).addScaledVector(dir, d); cam.lookAt(center); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
    const b = { x0: 9, x1: -9, y0: 9, y1: -9 };
    nodes.forEach((n) => {
      v.copy(n.p).project(cam);
      const dist = cam.position.distanceTo(n.p);
      const ry = n.r / (dist * tanY); const rx = ry / cam.aspect;
      const tagX = n.tag ? (90 / vw) * 2 : 0; const tagY = n.tag ? (30 / vh) * 2 : 0;
      b.x0 = Math.min(b.x0, v.x - Math.max(rx, tagX)); b.x1 = Math.max(b.x1, v.x + Math.max(rx, tagX));
      b.y0 = Math.min(b.y0, v.y - ry - tagY); b.y1 = Math.max(b.y1, v.y + ry);
    });
    return b;
  };
  let d = 18; let box = measureAt(d);
  while (d < 260 && (box.x1 - box.x0 > region.x1 - region.x0 || box.y1 - box.y0 > region.y1 - region.y0)) { d += 1.5; box = measureAt(d); }
  const eye = center.clone().addScaledVector(dir, d);
  const midX = (region.x0 + region.x1) / 2 - (box.x0 + box.x1) / 2;
  const midY = (region.y0 + region.y1) / 2 - (box.y0 + box.y1) / 2;
  return { eye, shift: new THREE.Vector2(midX / 2, midY / 2) };
}

function layout() {
  const vw = canvas.clientWidth; const vh = canvas.clientHeight;
  const portrait = vh > vw;
  const shapeKey = `${portrait}${Math.round((vw / vh) * 10)}`;
  if (layoutKey !== shapeKey) {
    layoutKey = shapeKey; layoutPortrait = portrait;
    const rx = portrait ? 2.25 * Math.min(1.25, (vw / vh) / 0.46) : 7.3 * Math.max(0.7, Math.min(1.3, (vw / vh) / 1.6));
    const ry = portrait ? 2.75 : 3.75;
    const step = 4;
    const n = orbs.length;
    const back = portrait ? HERO_BACK_P : HERO_BACK_L;
    const turn = portrait ? [32, 212, 148, 328, 90, 270] : [58, 238, 122, 302, 0, 180];
    orbs.forEach((o, i) => {
      const a = turn[i] * Math.PI / 180;
      const z = -i * step; const grow = (back - z) / back; // same spot on screen from the hero camera, whatever the depth
      o.base.set(Math.cos(a) * rx * grow, Math.sin(a) * ry * grow, z);
    });
    extent = (n - 1) * step;
    const sb = portrait ? SCALE_BACK_P : SCALE_BACK_L;
    const wideX = portrait ? 0.9 : Math.max(0.8, Math.min(1.35, (vw / vh) / 1.6));
    (portrait ? planetSpots.port : planetSpots.land).forEach(([, x, y, z, size], i) => {
      planets[i].base.set(x * wideX * (sb - z), y * (sb - z), z); planets[i].size = size;
    });
    // Mycelium threads between neighbours plus two long links, so it reads as a network and not a chain.
    threads.traverse((c) => c.geometry && c.geometry.dispose());
    world.remove(threads); threads = new THREE.Group(); world.add(threads);
    const links = orbs.slice(0, -1).map((o, i) => [i, i + 1]);
    links.push([0, 3], [1, 4], [2, 5]);
    // Each mystery planet hangs off the nearest thing already in the network.
    const nodes = [...orbs.map((o) => o.base), ...planets.filter((m) => m.tier === 0).map((m) => m.base)];
    const links3 = links.map(([a, b]) => [orbs[a].base, orbs[b].base]);
    planets.forEach((m) => {
      const near = nodes.filter((v) => v !== m.base).reduce((x, v) => (v.distanceTo(m.base) < x.distanceTo(m.base) ? v : x));
      links3.push([near, m.base]);
    });
    links3.forEach(([A, B], k) => {
      const M = A.clone().lerp(B, 0.5).add(new THREE.Vector3(Math.sin(k * 2.1) * 1.8, Math.cos(k * 1.3) * 1.8, Math.sin(k) * 1.4));
      const M2 = A.clone().lerp(B, 0.25).add(new THREE.Vector3(Math.cos(k * 3.1), Math.sin(k * 2.3), 0).multiplyScalar(0.9));
      const curve = new THREE.CatmullRomCurve3([A, M2, M, B]);
      threads.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 70, 0.016, 6, false), threadMat));
    });
    const m = new THREE.Matrix4(); const q = new THREE.Quaternion(); const e = new THREE.Euler(); const p = new THREE.Vector3(); const s = new THREE.Vector3();
    const span = extent + 24;
    const place = (mesh, count, lo, hi) => {
      for (let i = 0; i < count; i++) {
        p.set((rnd() - 0.5) * (portrait ? 15 : 30), (rnd() - 0.5) * (portrait ? 21 : 17), 9 - rnd() * span);
        const sc = lo + rnd() * (hi - lo);
        s.setScalar(sc); e.set(rnd() * 0.9 - 0.45, rnd() * 6.3, rnd() * 0.9 - 0.45); q.setFromEuler(e);
        m.compose(p, q, s); mesh.setMatrixAt(i, m);
        mesh.setColorAt(i, POP[Math.floor(rnd() * POP.length)]);
      }
      mesh.instanceMatrix.needsUpdate = true; mesh.instanceColor.needsUpdate = true;
    };
    place(shrooms, toyCounts[0], 0.26, 0.62);
    place(spores, toyCounts[1], 0.035, 0.12);
  }
  // Camera keys: wide on the whole thing, then one key per orb, then wide from the far side.
  keysEye.length = 0; keysTarget.length = 0; shiftKeys.length = 0;
  const fov = camera.fov * Math.PI / 360;
  const center = new THREE.Vector3(0, 0, -extent * 0.5);
  const heroBack = portrait ? HERO_BACK_P : HERO_BACK_L;
  keysEye.push(new THREE.Vector3(0, 0, heroBack)); keysTarget.push(new THREE.Vector3(0, 0, 0));
  shiftKeys.push(new THREE.Vector2(0, portrait ? 0.015 : 0));
  orbs.forEach((o) => {
    // Orb diameter on screen as a fraction of viewport height.
    const frac = portrait ? Math.min(0.46, (0.82 * vw) / vh) : Math.min(0.72, (0.46 * vw) / vh);
    const d = R / (Math.tan(fov) * frac);
    const dir = new THREE.Vector3(portrait ? 0.1 * o.side : -0.42 * o.side, 0.08, 1).normalize();
    keysEye.push(o.base.clone().add(dir.multiplyScalar(d)));
    keysTarget.push(o.base.clone());
    shiftKeys.push(portrait ? new THREE.Vector2(0, 0.235) : new THREE.Vector2(0.235 * o.side, 0));
  });
  if (scaleIdx > 0) { // straight down the axis, far enough back to see everything planned
    keysEye.push(new THREE.Vector3(0, 0, portrait ? SCALE_BACK_P : SCALE_BACK_L)); keysTarget.push(new THREE.Vector3(0, 0, 0));
    shiftKeys.push(portrait ? new THREE.Vector2(0, 0.2) : new THREE.Vector2(0, 0));
  }
  const close = fitClose(portrait, center, vw, vh);
  keysEye.push(close.eye);
  keysTarget.push(center.clone());
  shiftKeys.push(close.shift);
  curveEye = new THREE.CatmullRomCurve3(keysEye, false, 'catmullrom', 0.5);
  curveTarget = new THREE.CatmullRomCurve3(keysTarget, false, 'catmullrom', 0.5);
}

let centers = [];
function measure() {
  centers = sections.map((s) => { const r = s.getBoundingClientRect(); return r.top + scrollY + r.height / 2; });
}
function resize() {
  const w = canvas.clientWidth; const h = canvas.clientHeight;
  renderer.setPixelRatio(dpr);
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  bgU.uAspect.value = w / h;
  layout(); measure();
}
let dpr = Math.min(devicePixelRatio || 1, coarse ? 1.75 : 1.5);
addEventListener('resize', resize);

function targetP() {
  const mid = scrollY + innerHeight / 2;
  if (mid <= centers[0]) return 0;
  for (let i = 0; i < centers.length - 1; i++) {
    if (mid <= centers[i + 1]) return i + (mid - centers[i]) / (centers[i + 1] - centers[i]);
  }
  return centers.length - 1;
}

// Dwell at each stop, then fly.
const dwell = (p) => { const i = Math.floor(p); const f = p - i; const s = f * f * f * (f * (6 * f - 15) + 10); return i + s * 0.92 + f * 0.08; };

const pointer = new THREE.Vector2(0, 0); const pointerEase = new THREE.Vector2(0, 0);
addEventListener('pointermove', (e) => { pointer.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); });
const ray = new THREE.Raycaster();
const hitAt = (x, y) => {
  ray.setFromCamera(new THREE.Vector2(x, y), camera);
  // setViewOffset is honoured because the projection matrix carries it
  let best = null; let bd = 1e9;
  orbs.forEach((o) => {
    const sph = new THREE.Sphere(o.group.position, o.scale * R);
    const hit = ray.ray.intersectSphere(sph, new THREE.Vector3());
    if (hit) { const dist = hit.distanceTo(camera.position); if (dist < bd) { bd = dist; best = o; } }
  });
  return best;
};
let downAt = null;
addEventListener('pointerdown', (e) => { downAt = { x: e.clientX, y: e.clientY, t: performance.now() }; });
addEventListener('pointerup', (e) => {
  if (!downAt) return;
  const moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y); const long = performance.now() - downAt.t > 450;
  downAt = null;
  if (moved > 8 || long || e.target.closest('a,button,dialog')) return;
  const o = hitAt(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  if (!o) return;
  if (o.focus > 0.6) { if (o.clip) window.openClip(o.clip, o.sec.dataset.name); } else {
    o.sec.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }
});

const cards = sections.map((s) => s.querySelector('.card'));
const cue = document.querySelector('.cue');
let lowPower = false; let closeUp = 0; let p = 0; let phase = 0; let last = performance.now(); let frames = 0; let slow = 0; let tick = 0;
const tintA = new THREE.Color(); const eye = new THREE.Vector3(); const look = new THREE.Vector3(); const shift = new THREE.Vector2();
const tmpV = new THREE.Vector3(); const scr = new THREE.Vector3();
const heroTint = new THREE.Color('#d6eb9c');
const sectionTints = sections.map((s) => (s.dataset.tint ? new THREE.Color(s.dataset.tint) : heroTint));
const tintFor = (i) => sectionTints[Math.max(0, Math.min(i, sections.length - 1))];

function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min((now - last) / 1000, 0.05); last = now;
  const time = reduced ? 8 : now / 1000;
  tick++;
  // adaptive sharpness: drop resolution rather than framerate
  frames++; if (dt > 0.03) slow++;
  if (frames >= 90) { if (slow > 45 && dpr <= 1) lowPower = true; // weak machine: ring shows stills, the focused orb still plays
    if (slow > 45 && dpr > 1) { dpr = Math.max(1, dpr - 0.25); renderer.setPixelRatio(dpr); renderer.setSize(canvas.clientWidth, canvas.clientHeight, false); } frames = 0; slow = 0; }

  const goal = targetP();
  const k = 1 - Math.exp(-dt * (reduced ? 60 : 5.2));
  const prev = p; p += (goal - p) * k;
  phase += (p - prev) * 2.2;
  const lastI = sections.length - 1;
  const u = Math.min(dwell(Math.min(p, lastI - 1e-4)) / lastI, 1);
  curveEye.getPoint(u, eye); curveTarget.getPoint(u, look);
  const si = Math.min(Math.floor(p), lastI - 1); const sf = p - si; const sg = sf * sf * (3 - 2 * sf);
  shift.lerpVectors(shiftKeys[si], shiftKeys[si + 1], sg);
  pointerEase.lerp(pointer, 1 - Math.exp(-dt * 3));
  const par = coarse ? 0 : 1;
  const wideness = Math.min(1, Math.min(Math.abs(p), Math.abs(lastI - p)) );
  const pAmt = (1.1 - wideness * 0.82) * par;
  camera.position.copy(eye); camera.position.x += pointerEase.x * pAmt; camera.position.y += pointerEase.y * pAmt * 0.7;
  camera.up.set(Math.sin((goal - p) * 0.35), 1, 0).normalize();
  camera.lookAt(look);
  const w = canvas.clientWidth; const h = canvas.clientHeight;
  camera.setViewOffset(w, h, -shift.x * w, shift.y * h, w, h);
  camera.updateMatrixWorld(); camera.updateProjectionMatrix();

  tintA.copy(tintFor(Math.floor(p))).lerp(tintFor(Math.min(Math.floor(p) + 1, lastI)), sg);
  bgU.uTint.value.copy(tintA);
  bgU.uTime.value = time; bgU.uPhase.value = phase; toyTime.value = time;

  let hovered = null;
  if (!coarse) hovered = hitAt(pointer.x, pointer.y);
  canvas.style.cursor = hovered ? 'pointer' : '';
  const heroish = 1 - Math.min(1, Math.min(p, lastI - p, scaleIdx > 0 ? Math.abs(p - scaleIdx) : 1e9) * 1.8);
  orbs.forEach((o) => {
    const dist = Math.abs(p - o.stopIndex);
    const f = Math.max(0, 1 - dist / 0.62); const fs = f * f * (3 - 2 * f);
    o.focus = fs; o.u.uFocus.value = fs; o.u.uTime.value = time + o.i * 3;
    o.hover += ((hovered === o ? 1 : 0) - o.hover) * Math.min(1, dt * 9); o.u.uHover.value = o.hover;
    o.u.uWobble.value = 0.05 - fs * 0.03;
    const bob = reduced ? 0 : Math.sin(time * 0.5 + o.i * 1.9) * (0.18 - fs * 0.15);
    o.group.position.set(o.base.x, o.base.y + bob, o.base.z);
    const anyFocus = 1 - heroish;
    // hero: far orbs swell so the ring reads as one family; phones have less room. Close-up: the rest step back.
    const far = (layoutPortrait ? 0.56 + o.i * 0.09 : 1 + o.i * 0.13) * heroish + (1 - heroish);
    o.scale = (far - (1 - fs) * anyFocus * (layoutPortrait ? 0.84 : 0.6) + o.hover * (1 - fs) * 0.08) * R;
    // Close-up: any other orb that drifts behind the words shrinks away.
    scr.copy(o.base).project(camera);
    const zx = Math.abs(scr.x - toyZone.value.x) - toyZone.value.z; const zy = Math.abs(scr.y - toyZone.value.y) - toyZone.value.w;
    const zt = Math.min(1, Math.max(0, Math.max(zx, zy) / 0.4)); const inZone = 1 - zt * zt * (3 - 2 * zt);
    o.scale *= Math.max(0.001, 1 - inZone * closeUp * (1 - fs));
    o.mesh.scale.setScalar(o.scale);
    o.halo.scale.setScalar(o.scale * (3.1 + fs * 0.25));
    o.halo.quaternion.copy(camera.quaternion);
    o.halo.position.copy(tmpV.set(0, 0, -o.scale * 0.2).applyQuaternion(camera.quaternion));
    o.hu.uOpacity.value = 1;

    // Clip control: hero and close show motion on a desk machine; phones only decode the orb in focus.
    const nearNext = dist < 1.15;
    // The wide ring takes turns, half the clips at a time, so nothing has to fight for the decoder.
    const wanted = o.clip && (dist < 0.8 || (!coarse && !lowPower && heroish > 0.25 && (o.i + Math.floor(time / 3.5)) % 2 === 0));
    if (o.clip && nearNext) makeVideo(o);
    if (wanted && !reduced) { makeVideo(o); if (o.video.paused) o.video.play().catch(() => {}); } else if (o.video && !o.video.paused) o.video.pause();
    if (o.tex && o.videoLive && o.video.readyState >= 2 && !o.video.paused) {
      // Close-up gets every decoded frame; the wide ring shares uploads so the page keeps its rate.
      if (o.fresh && (fs > 0.05 || (tick + o.i) % 2 === 0)) {
        o.tex.needsUpdate = true;
        if (o.video.requestVideoFrameCallback) o.fresh = false;
      }
    }
    // name tags while you are looking at the whole constellation
    // the phone's closing shot is too small for name tags
    const la = layoutPortrait ? heroish * Math.min(1, Math.abs(p - lastI) * 1.6) : heroish;
    if (la > 0.01) {
      scr.copy(o.group.position); scr.y -= o.scale * 1.32; scr.project(camera);
      const lx = (scr.x * 0.5 + 0.5) * w; const ly = (-scr.y * 0.5 + 0.5) * h;
      o.label.style.transform = `translate(-50%,-50%) translate(${lx.toFixed(1)}px,${ly.toFixed(1)}px)`;
      o.label.style.opacity = la.toFixed(3);
      o.label.style.display = 'block';
    } else o.label.style.display = 'none';
  });
  threadMat.uniforms.uOpacity.value = 0.1 + 0.9 * Math.max(heroish, 1 - Math.max(...orbs.map((o) => o.focus)));
  const endish = Math.max(0, 1 - Math.abs(p - lastI) * 1.6);
  planets.forEach((m) => {
    m.u.uTime.value = time;
    m.group.position.set(m.base.x, m.base.y + (reduced ? 0 : Math.sin(time * 0.4 + m.i * 2.1) * 0.22), m.base.z);
    scr.copy(m.base).project(camera);
    const zx = Math.abs(scr.x - toyZone.value.x) - toyZone.value.z; const zy = Math.abs(scr.y - toyZone.value.y) - toyZone.value.w;
    const zt = Math.min(1, Math.max(0, Math.max(zx, zy) / 0.3)); const inZone = 1 - zt * zt * (3 - 2 * zt);
    const clearing = closeUp;
    // The phone's opening frame has no room: the planets arrive as the camera pulls back.
    const phoneHero = layoutPortrait ? Math.max(0, 1 - p * 1.8) : 0;
    m.group.scale.setScalar(Math.max(0.001, m.size * (1 - inZone * clearing) * (1 - phoneHero)));
    m.group.rotation.y = time * 0.15 + m.i;
  });
  // Words win: nothing floats through the text column.
  const focusOrb = orbs.reduce((a, b) => (b.focus > a.focus ? b : a));
  closeUp = focusOrb.focus;
  const scaleish = scaleIdx > 0 ? Math.max(0, 1 - Math.abs(p - scaleIdx) * 1.6) : 0;
  toyMask.value = Math.max(focusOrb.focus, endish, scaleish);
  if (layoutPortrait) toyZone.value.set(0, -0.55, 1.1, 0.5);
  else if (scaleish > focusOrb.focus) toyZone.value.set(0, 0, 0.3, 0.26);
  else if (endish > focusOrb.focus) toyZone.value.set(-0.62, 0, 0.4, 0.9);
  else toyZone.value.set(-focusOrb.side * 0.56, -0.05, 0.42, 0.8);
  // Nothing floats in front of the clip you came to see.
  scr.copy(focusOrb.group.position).project(camera);
  const faceR = focusOrb.scale / (camera.position.distanceTo(focusOrb.group.position) * Math.tan(camera.fov * Math.PI / 360)) * 1.08;
  toyFace.value.set(scr.x, scr.y, focusOrb.focus > 0.5 ? faceR : 0, camera.aspect);
  // The tunnel of bands radiates from the orb you are closest to.
  const fo = orbs.reduce((a, b) => (b.focus > a.focus ? b : a));
  scr.copy(fo.group.position).project(camera);
  const cx = scr.x * 0.5 + 0.5; const cy = scr.y * 0.5 + 0.5;
  const c = fo.focus;
  const hc = 0.5;
  bgU.uCenter.value.set(hc + (cx - hc) * c, hc + (cy - hc) * c);

  cards.forEach((card, i) => {
    if (!card) return;
    const dist = Math.abs(goal - i);
    const op = Math.max(0, Math.min(1, 1.5 - dist * 2.6));
    if (card._op !== op) { card.style.opacity = op; card._op = op; card.style.visibility = op < 0.01 ? 'hidden' : 'visible'; }
  });
  if (cue) cue.style.opacity = Math.max(0, 1 - goal * 5);
  renderer.render(scene, camera);
}

resize();
p = targetP();
requestAnimationFrame(frame);
document.fonts && document.fonts.ready.then(resize);
addEventListener('load', resize);
