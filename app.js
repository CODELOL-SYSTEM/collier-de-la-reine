/* « Le collier » — cinématique 3D Three.js, UN SEUL FICHIER (aucun autre fichier à charger). Non skippable. */
import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
const $=i=>document.getElementById(i),PI=Math.PI,cl=THREE.MathUtils.clamp;
const k=(t,a,b)=>cl((t-a)/(b-a),0,1),sm=u=>u*u*(3-2*u),L=(a,b,u)=>a+(b-a)*u;

/* ================= RENDU + POST-TRAITEMENT CINÉMA ================= */
const PR=Math.min(devicePixelRatio,1.5),R=new THREE.WebGLRenderer({antialias:false,powerPreference:'high-performance'});
R.setPixelRatio(PR);R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.15;$('stage').appendChild(R.domElement);
const ENV=new THREE.PMREMGenerator(R).fromScene(new RoomEnvironment(),.03).texture,AN=Math.min(16,R.capabilities.getMaxAnisotropy());
const scene=new THREE.Scene();scene.background=new THREE.Color(0x070a14);scene.fog=new THREE.FogExp2(0x0a0d18,.032);scene.environment=ENV;
const cam=new THREE.PerspectiveCamera(42,1,.05,80);
const composer=new EffectComposer(R,new THREE.WebGLRenderTarget(innerWidth*PR,innerHeight*PR,{type:THREE.HalfFloatType,samples:2}));
composer.addPass(new RenderPass(scene,cam));composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),.25,.5,.95));
const grade=new ShaderPass({uniforms:{tDiffuse:{value:null},time:{value:0}},
 vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`uniform sampler2D tDiffuse;uniform float time;varying vec2 vUv;
 float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233))+time)*43758.5453);}
 void main(){vec2 c=vUv-.5;float d=dot(c,c);vec2 o=c*d*.016;
  vec3 col=vec3(texture2D(tDiffuse,vUv+o).r,texture2D(tDiffuse,vUv).g,texture2D(tDiffuse,vUv-o).b);
  vec3 bl=vec3(0.);for(int i=0;i<6;i++){float a=float(i)*1.0472;bl+=texture2D(tDiffuse,vUv+vec2(cos(a),sin(a))*d*.018).rgb;}bl/=6.;
  col=mix(col,bl,smoothstep(.05,.32,d)*.75);col+=max(bl-.8,0.)*vec3(.9,.35,.08)*.1;
  col*=1.-smoothstep(.06,.5,d)*.82;col+=(h(vUv*vec2(1920.,1080.))-.5)*.03;
  float l=dot(col,vec3(.299,.587,.114));col=mix(vec3(l),col,1.12);
  col=mix(col*vec3(.9,.98,1.1),col*vec3(1.1,1.,.86),smoothstep(.08,.85,l));
  gl_FragColor=vec4(col,1.);}`});
composer.addPass(grade);composer.addPass(new OutputPass());
const resize=()=>{R.setSize(innerWidth,innerHeight);composer.setPixelRatio(PR);composer.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()};
addEventListener('resize',resize);resize();

/* ================= AIDES ================= */
const M=(c,r=.8,m=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m,envMapIntensity:m?1.5:.5});
const MP=(c,r=.5,o={})=>new THREE.MeshPhysicalMaterial({color:c,roughness:r,...o});
const add=(p,g,m,x=0,y=0,z=0)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;p.add(o);return o};
const BX=(w,h,d)=>new THREE.BoxGeometry(w,h,d),CP=(r,l)=>new THREE.CapsuleGeometry(r,l,8,24),SP=(r,w=24,h=18)=>new THREE.SphereGeometry(r,w,h),CY=(a,b,h,s=28)=>new THREE.CylinderGeometry(a,b,h,s),TR=(r,t,a=PI*2)=>new THREE.TorusGeometry(r,t,10,32,a);
const rng=s=>()=>(s=s*16807%2147483647)/2147483647;
const ct=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h,rng(7));const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=AN;return t};
const tm=(t,rx,ry,o={})=>{const c=t.clone();c.needsUpdate=true;c.repeat.set(Math.max(1,rx),Math.max(1,ry));return new THREE.MeshStandardMaterial({map:c,bumpMap:c,bumpScale:2,roughness:.85,...o})};

/* ---------- textures procédurales HD ---------- */
const stoneT=ct(1024,1024,(g,W,H,r)=>{g.fillStyle='#14110d';g.fillRect(0,0,W,H);
 for(let y=0;y<4;y++)for(let x=-1;x<5;x++){const X=x*256+(y%2)*128+8,Y=y*256+8;g.fillStyle=`hsl(${24+r()*18},${4+r()*12}%,${26+r()*22}%)`;g.fillRect(X,Y,240,240);
  for(let i=0;i<3000;i++){g.fillStyle=`rgba(${r()<.5?'255,255,255':'0,0,0'},${r()*.15})`;g.fillRect(X+r()*240,Y+r()*240,1+r()*4,1+r()*4)}
  const e=g.createLinearGradient(0,Y,0,Y+240);e.addColorStop(0,'rgba(255,255,255,.13)');e.addColorStop(1,'rgba(0,0,0,.4)');g.fillStyle=e;g.fillRect(X,Y,240,240);
  if(r()<.3){for(let i=0;i<40;i++){g.fillStyle=`rgba(60,${80+r()*30|0},40,.2)`;g.beginPath();g.arc(X+r()*240,Y+160+r()*80,3+r()*8,0,7);g.fill()}}}
 for(let i=0;i<24;i++){let x=r()*W,y=r()*H;g.strokeStyle='rgba(10,8,6,.7)';g.lineWidth=1+r()*1.5;g.beginPath();g.moveTo(x,y);for(let j=0;j<7;j++){x+=(r()-.5)*40;y+=r()*24;g.lineTo(x,y)}g.stroke()}});
const woodT=ct(1024,512,(g,W,H,r)=>{const N=6,ph=H/N;
 for(let b=0;b<N;b++){g.fillStyle=`hsl(${22+r()*14},${38+r()*20}%,${20+r()*18}%)`;g.fillRect(0,b*ph,W,ph)}
 for(let i=0;i<900;i++){const y0=r()*H,a=1+r()*5,f=.006+r()*.02,p=r()*7,d=r()<.7,al=.05+r()*.22;g.strokeStyle=d?`rgba(28,13,4,${al})`:`rgba(200,150,90,${al*.6})`;g.lineWidth=.5+r()*1.8;g.beginPath();for(let x=0;x<=W;x+=10){const y=y0+Math.sin(x*f+p)*a;x?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()}
 for(let n=0;n<5;n++){const x=r()*W,y=r()*H;for(let q=22;q>3;q-=2){g.strokeStyle=`rgba(30,14,4,${.4-q*.012})`;g.lineWidth=1.4;g.beginPath();g.ellipse(x,y,q*1.9,q*.75,0,0,7);g.stroke()}}
 for(let b=1;b<N;b++){g.fillStyle='rgba(12,6,2,.85)';g.fillRect(0,b*ph-1.5,W,3)}});
const tileT=ct(1024,1024,(g,W,H,r)=>{const n=4,s=W/n;for(let y=0;y<n;y++)for(let x=0;x<n;x++){const d=(x+y)%2,v=r();g.fillStyle=d?`hsl(30,8%,${12+v*6}%)`:`hsl(38,22%,${72+v*10}%)`;g.fillRect(x*s,y*s,s,s);
 for(let i=0;i<5;i++){let vx=x*s+r()*s,vy=y*s+r()*s;g.strokeStyle=d?'rgba(200,190,170,.28)':'rgba(90,70,50,.32)';g.lineWidth=1+r()*2;g.beginPath();g.moveTo(vx,vy);for(let j=0;j<9;j++){vx+=(r()-.3)*50;vy+=(r()-.3)*50;g.lineTo(vx,vy)}g.stroke()}}
 g.strokeStyle='#0a0806';g.lineWidth=5;for(let i=0;i<=n;i++){g.beginPath();g.moveTo(i*s,0);g.lineTo(i*s,H);g.stroke();g.beginPath();g.moveTo(0,i*s);g.lineTo(W,i*s);g.stroke()}});
const rugT=ct(512,512,(g,W,H,r)=>{g.fillStyle='#6a1620';g.fillRect(0,0,W,H);g.strokeStyle='#d4a83a';g.lineWidth=6;g.strokeRect(14,14,W-28,H-28);g.lineWidth=3;g.strokeRect(34,34,W-68,H-68);g.fillStyle='#1b2a5c';g.fillRect(48,48,W-96,H-96);
 for(let y=0;y<8;y++)for(let x=0;x<8;x++){if((x+y)%2)continue;const cx=48+(x+.5)*(W-96)/8,cy=48+(y+.5)*(H-96)/8;g.fillStyle='#d4a83a';g.beginPath();g.moveTo(cx,cy-14);g.lineTo(cx+14,cy);g.lineTo(cx,cy+14);g.lineTo(cx-14,cy);g.fill()}
 g.fillStyle='#8a1a28';g.beginPath();g.arc(W/2,H/2,90,0,7);g.fill();for(let i=0;i<5;i++){g.strokeStyle='#e8c860';g.lineWidth=2;g.beginPath();g.arc(W/2,H/2,20+i*14,0,7);g.stroke()}
 for(let i=0;i<9000;i++){g.fillStyle=`rgba(${r()<.5?'255,255,255':'0,0,0'},${r()*.14})`;g.fillRect(r()*W,r()*H,2,2)}});
const damT=ct(256,256,(g)=>{g.fillStyle='#4f0d1a';g.fillRect(0,0,256,256);for(let y=0;y<4;y++)for(let x=0;x<4;x++){const cx=x*64+32+(y%2)*32,cy=y*64+32;g.fillStyle='#7a1628';g.beginPath();g.moveTo(cx,cy-28);g.quadraticCurveTo(cx+22,cy-4,cx,cy+28);g.quadraticCurveTo(cx-22,cy-4,cx,cy-28);g.fill();g.strokeStyle='#c9a04a';g.lineWidth=1.6;g.stroke();g.fillStyle='#c9a04a';g.beginPath();g.arc(cx,cy-2,4,0,7);g.fill()}});
const corkT=ct(256,256,(g,W,H,r)=>{g.fillStyle='#9a7650';g.fillRect(0,0,W,H);for(let i=0;i<5000;i++){const a=r();g.fillStyle=a<.5?'rgba(60,35,15,.35)':'rgba(200,150,90,.35)';g.beginPath();g.arc(r()*W,r()*H,1+r()*4,0,7);g.fill()}});
const stone=(w,h)=>tm(stoneT,w/3,h/3,{roughness:.92}),wood=(w,h)=>tm(woodT,w/2.5,h/2.5,{roughness:.5,bumpScale:1.2}),tile=(w,h)=>tm(tileT,w/3.5,h/3.5,{roughness:.2,bumpScale:.8,envMapIntensity:.8});
const mS=stone(3,3),mW=wood(2,2),gold=M(0xe0b030,.22,1),iron=M(0x2a2a30,.4,.7),copper=M(0xb87333,.28,1),velvet=c=>MP(c,.85,{sheen:1,sheenRoughness:.4,sheenColor:new THREE.Color(0xff6a6a)});
const rug=(p,x,z,w,d,y=.012)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),tm(rugT,1,1,{roughness:1,bumpScale:1}));m.rotation.x=-PI/2;m.position.set(x,y,z);m.receiveShadow=true;p.add(m)};

/* ---------- lueurs, poussière, flammes ---------- */
const glows=[],dusts=[],fireC=[],flames=[],FL=new THREE.Color(1.6,.9,.25),GL=new THREE.Color(1.1,.55,.18);
const gTex=ct(128,128,(g)=>{const r=g.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.2,'rgba(255,255,255,.4)');r.addColorStop(.5,'rgba(255,255,255,.1)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,128,128)});
const glow=(p,x,y,z,s,c)=>{const m=new THREE.Sprite(new THREE.SpriteMaterial({map:gTex,color:c,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true}));m.material.opacity=.45;m.position.set(x,y,z);m.scale.set(s,s,1);m.userData.s=s;p.add(m);glows.push(m)};
const dust=(p,cx,cy,cz,sx,sy,sz,n=220)=>{const g=new THREE.BufferGeometry(),a=new Float32Array(n*3);for(let i=0;i<n;i++){a[i*3]=cx+(Math.random()-.5)*sx;a[i*3+1]=cy+Math.random()*sy;a[i*3+2]=cz+(Math.random()-.5)*sz}
 g.setAttribute('position',new THREE.BufferAttribute(a,3));const m=new THREE.Points(g,new THREE.PointsMaterial({map:gTex,size:.035,color:0xffd9a0,transparent:true,opacity:.3,blending:THREE.AdditiveBlending,depthWrite:false}));p.add(m);dusts.push(m)};
const flameG=(()=>{const q=[];for(let i=0;i<=10;i++){const u=i/10;q.push(new THREE.Vector2(Math.sin(Math.pow(u,.7)*PI)*.5*(1-u*.35),u))}return new THREE.LatheGeometry(q,14)})();
function candle(p,x,y,z,i=6){add(p,CY(.025,.03,.18,20),MP(0xf2e6c8,.45,{sheen:1,sheenColor:new THREE.Color(0xffd9a0)}),x,y+.09,z);add(p,CY(.045,.05,.012,24),gold,x,y+.006,z);
 const f=new THREE.Mesh(flameG,new THREE.MeshBasicMaterial({color:FL,transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false})),g=new THREE.Group();g.scale.set(.026,.06,.026);g.position.set(x,y+.18,z);g.add(f);p.add(g);fireC.push(f);
 glow(p,x,y+.21,z,.55,GL);const l=new THREE.PointLight(0xffa850,i,9,2);l.userData.b=i;l.position.set(x,y+.25,z);p.add(l);flames.push(l)}

/* ---------- le collier : chaîne + diamants taillés ---------- */
const gemM=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.02,metalness:.3,emissive:0x8fc0ff,emissiveIntensity:.35,envMapIntensity:1.2,flatShading:true});
function necklace(lit=true){const g=new THREE.Group();
 for(let i=0;i<48;i++){const a=i/48*2*PI,l=add(g,new THREE.TorusGeometry(.011,.0028,6,12),gold,Math.cos(a)*.12,Math.sin(a)*.12,0);l.rotation.z=a+PI/2;if(i%2)l.rotation.y=PI/2;l.scale.x=1.4}
 for(let i=0;i<26;i++){const a=i/26*2*PI,big=i%5===0,x=Math.cos(a)*.12,y=Math.sin(a)*.12;add(g,new THREE.OctahedronGeometry(big?.026:.013,0),gemM,x,y,0).scale.y=1.3;if(big)glow(g,x,y,0,.06,new THREE.Color(.6,.9,1.6))}
 add(g,new THREE.OctahedronGeometry(.036,0),gemM,0,-.165,0).scale.set(.8,1.5,.8);add(g,TR(.03,.005),gold,0,-.13,0);glow(g,0,-.165,0,.12,new THREE.Color(.6,.9,1.8));
 if(lit){g.add(new THREE.PointLight(0xaad4ff,.8,2));glow(g,0,0,0,.5,new THREE.Color(.5,.8,1.4))}return g}

/* ================= PERSONNAGES (visage, cheveux, habits d'époque, squelette articulé) ================= */
function ppl(o){const root=new THREE.Group(),body=new THREE.Group();root.add(body);
 const skin=MP(o.skin||0xe8b894,.5,{sheen:1,sheenColor:new THREE.Color(0xff9070),sheenRoughness:.5}),top=M(o.coat||o.top,.75),bot=M(o.bot||o.top,.8),hair=MP(o.hair||0x3a2a1a,.5,{sheen:.6}),boot=M(0x15100c,.35),lace=M(0xf4f0e8,.8);
 add(body,CP(.16,.4),top,0,.38,0).scale.set(1.15,1,.82);add(body,SP(.15),bot,0,.04,0).scale.set(1.25,.9,.9);
 if(o.vest)add(body,BX(.2,.3,.02),M(o.vest,.8),0,.4,.13);
 if(o.dress){const pts=[];for(let i=0;i<=14;i++){const u=i/14;pts.push(new THREE.Vector2(L(.16,.62,Math.pow(u,.8)),L(.12,-.58,u)))}
  const g=new THREE.LatheGeometry(pts,64),pa=g.attributes.position;for(let i=0;i<pa.count;i++){const x=pa.getX(i),z=pa.getZ(i),y=pa.getY(i),f=1+Math.sin(Math.atan2(z,x)*14)*.03*(1-(y+.58)/.7);pa.setX(i,x*f);pa.setZ(i,z*f)}g.computeVertexNormals();
  const d=add(body,g,velvet(o.dress));d.material.side=2;add(body,TR(.64,.02),gold,0,-.575,0).rotation.x=PI/2;add(body,SP(.018),new THREE.MeshStandardMaterial({color:0xff2a50,emissive:0x60081a,roughness:.1}),0,.52,.13)}
 if(o.apron)add(body,BX(.34,.7,.02),M(0xe8e0cc,.9),0,-.12,.36).rotation.x=-.55;
 add(body,CY(.045,.052,.1,12),skin,0,.74,0);add(body,TR(.085,.022),lace,0,.72,0).rotation.x=PI/2;
 const head=new THREE.Group();head.position.y=.74;body.add(head);
 add(head,SP(.13,32,24),skin,0,.14,0).scale.set(1,1.1,1.02);add(head,SP(.095,20,14),skin,0,.085,.03).scale.set(.95,.8,.9);add(head,SP(.021,12,10),skin,0,.138,.134).scale.set(.85,1.2,1.3);
 [-1,1].forEach(q=>{add(head,SP(.03,12,10),skin,q*.128,.145,-.005).scale.set(.4,1,.75);add(head,SP(.027,10,8),M(0xe0867a,.7),q*.078,.118,.112).scale.set(1,.7,.3)});
 const wh=M(0xf4f0e8,.3),ir=MP(o.eye||0x3a2410,.2,{clearcoat:1});
 [-.045,.045].forEach(x=>{add(head,SP(.02,14,12),wh,x,.17,.113);add(head,SP(.013,12,10),ir,x,.17,.127);add(head,SP(.007,8,8),M(0x050505),x,.17,.136);add(head,SP(.003,6,6),new THREE.MeshBasicMaterial({color:0xfff}),x+.004,.174,.139)});
 const brows=[-.045,.045].map(x=>{const g=new THREE.Group();g.position.set(x,.205,.123);head.add(g);add(g,CP(.005,.04),M(o.brow||0x2a1a0e,.6)).rotation.z=PI/2;return g});
 const mouth=add(head,TR(.035,.007,PI),M(0x8a3030,.5),0,.11,.124);mouth.rotation.z=PI;
 if(!o.bald){const hc=add(head,new THREE.SphereGeometry(.142,28,20,0,PI*2,0,PI*.58),hair,0,.17,-.025);hc.rotation.x=-.18;hc.scale.set(1.02,1.04,1.06);for(let i=-2;i<=2;i++)add(head,SP(.03,8,6),hair,i*.045,.262,.092).scale.set(1,.7,.8)}
 if(o.long){[-1,1].forEach(q=>add(head,CP(.05,.2),hair,q*.1,.03,-.05));add(head,CP(.1,.25),hair,0,0,-.1)}
 if(o.bun)add(head,SP(.07,14,12),hair,0,.275,-.1);
 if(o.scarf){const sc=add(head,new THREE.SphereGeometry(.15,24,16,0,PI*2,0,PI*.48),M(o.scarf,.9),0,.19,-.03);sc.rotation.x=-.25}
 if(o.wig){const wm=M(0xf0eee8,1);add(head,SP(.17,22,16),wm,0,.23,-.07).scale.set(1,.9,1);[-1,1].forEach(q=>[0,1].forEach(j=>add(head,SP(.04,12,10),wm,q*.14,.11-j*.055,-.02).scale.set(1.2,.9,1.3)));add(head,CP(.04,.16),wm,0,.04,-.19)}
 if(o.hat){const hm=M(0x111111,.6);add(head,CY(.24,.24,.025,3),hm,0,.31,0).rotation.y=PI/3;add(head,CY(.11,.12,.08,20),hm,0,.345,0);add(head,new THREE.ConeGeometry(.018,.2,8),M(0xf0f0f0,.8),.1,.4,-.06).rotation.z=-.7}
 if(o.mustache)[-1,1].forEach(q=>add(head,CP(.011,.045),hair,q*.025,.127,.133).rotation.z=PI/2+q*.25);
 if(o.glasses)[-.045,.045].forEach(x=>add(head,TR(.027,.002),iron,x,.17,.148));
 const sh=[],el=[],hands=[],hip=[],kn=[];
 for(const sx of[-1,1]){const s=new THREE.Group();s.position.set(sx*.22,.68,0);body.add(s);add(s,CP(.045,.21),top,0,-.15,0);add(s,SP(.055,14,10),top);
  const e=new THREE.Group();e.position.y=-.3;s.add(e);add(e,CP(.04,.2),top,0,-.14,0);add(e,SP(.045,12,8),top);add(e,TR(.046,.014),lace,0,-.27,0).rotation.x=PI/2;
  const h=new THREE.Group();h.position.y=-.3;e.add(h);add(h,SP(.04,14,10),skin,0,-.035,0).scale.set(1,1.1,.6);for(let i=0;i<4;i++)add(h,CP(.0095,.032),skin,(i-1.5)*.02,-.09,0);
  sh.push(s);el.push(e);hands.push(h);
  const hp=new THREE.Group();hp.position.set(sx*.09,0,0);body.add(hp);add(hp,CP(.068,.3),bot,0,-.21,0);add(hp,SP(.072,12,10),bot);
  const kg=new THREE.Group();kg.position.y=-.42;hp.add(kg);add(kg,CP(.05,.28),bot,0,-.2,0);add(kg,SP(.056,10,8),bot);add(kg,SP(.05,14,10),boot,0,-.425,.05).scale.set(.95,.6,2);add(kg,BX(.05,.03,.02),gold,0,-.41,.115);hip.push(hp);kn.push(kg)}
 root.scale.setScalar(o.s);return{root,body,head,brows,mouth,sh,el,hands,hip,kn}}
let T=0;const setT=v=>{T=v};
const face=(p,e=0,sur=0,talk=0)=>{p.mouth.scale.y=cl(L(1,.12,e)+sur+talk*Math.abs(Math.sin(T*13))*.8,.12,1.8);p.brows[0].rotation.z=-e*.5;p.brows[1].rotation.z=e*.5};
function stand(p,w=0){const a=Math.sin(T*7)*w;p.body.rotation.x=0;p.head.rotation.x=0;p.hip[0].rotation.x=a*.5;p.hip[1].rotation.x=-a*.5;p.kn[0].rotation.x=Math.max(0,-a)*.7;p.kn[1].rotation.x=Math.max(0,a)*.7;p.sh[0].rotation.set(-a*.4,0,-.08);p.sh[1].rotation.set(a*.4,0,.08);p.el.forEach(e=>e.rotation.x=-.2)}
function crawl(p,pit,w){const a=Math.sin(T*5)*w;p.body.rotation.x=pit;p.head.rotation.x=-pit+.55;[0,1].forEach(i=>{const d=i?a:-a;p.sh[i].rotation.set(-pit+d*.5,0,i?.05:-.05);p.hip[i].rotation.set(-pit-d*.4,0,0);p.kn[i].rotation.x=PI/2+.1;p.el[i].rotation.x=-.1})}
function sit(p,lean=0){p.body.rotation.x=lean;p.hip.forEach(h=>h.rotation.x=-PI/2);p.kn.forEach(n=>n.rotation.x=PI/2);p.sh.forEach(s=>s.rotation.x=-.8);p.el.forEach(e=>e.rotation.x=-.6)}

/* ================= DÉCORS ================= */
const K=new THREE.Group(),JW=new THREE.Group(),LT=new THREE.Group(),TB=new THREE.Group(),BD=new THREE.Group(),TG=new THREE.Group();scene.add(K,JW,LT,TB,BD,TG);JW.visible=LT.visible=TB.visible=BD.visible=false;
const amb=(p,s,g,a,i)=>p.add(new THREE.HemisphereLight(s,g,i),new THREE.AmbientLight(a,i*.5));
const art=(p,x,y,z,w,h,i)=>{const g=new THREE.Group();g.position.set(x,y,z);p.add(g);add(g,BX(w+.16,h+.16,.05),gold);add(g,BX(w+.04,h+.04,.05),M(0x2a1608,.6),0,0,.01);
 const t=ct(160,200,(c,W,H)=>{const q=[['#6a4a3a','#1a1410','#7a1f3d'],['#3a4a6a','#10141a','#1b2a5c'],['#4a5a3a','#141a10','#8a6a2a']][i%3],gr=c.createLinearGradient(0,0,0,H);gr.addColorStop(0,q[0]);gr.addColorStop(1,q[1]);c.fillStyle=gr;c.fillRect(0,0,W,H);c.fillStyle=q[2];c.beginPath();c.ellipse(W/2,H*.92,62,70,0,0,7);c.fill();c.fillStyle='#d8b898';c.beginPath();c.ellipse(W/2,H*.4,24,30,0,0,7);c.fill();c.fillStyle=i%2?'#d8d0c8':'#241810';c.beginPath();c.ellipse(W/2,H*.34,27,24,0,PI,0);c.fill()});
 const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:t,roughness:.6}));m.position.z=.04;g.add(m)};

/* ----- CUISINE ----- */
add(K,BX(18,.2,12),stone(18,12),0,-.1,0);add(K,BX(18,4,.3),stone(18,4),0,2,-3.15);add(K,BX(.3,4,6.6),stone(6.6,4),-4,2,0);
add(K,BX(.3,1,6.6),stone(6.6,1),3,.5,0);add(K,BX(.3,1.8,6.6),stone(6.6,1.8),3,3.1,0);[-2,2].forEach(z=>add(K,BX(.3,1.2,2.6),stone(2.6,1.2),3,1.6,z));
add(K,BX(.6,.06,1.4),mW,3.1,.97,0);add(K,BX(.4,.1,1.6),mW,3,2.15,0);[-.7,.7].forEach(z=>add(K,BX(.4,1.2,.1),mW,3,1.6,z));
[-3.5,-1,1.5].forEach(x=>add(K,BX(.3,.3,12),mW,x,3.85,0));
add(K,BX(1.8,.08,.9),mW,-2.5,.92,1.5);[-3.3,-1.7].forEach(x=>[1.15,1.85].forEach(z=>add(K,BX(.08,.9,.08),mW,x,.45,z)));
candle(K,-2.1,.96,1.7);candle(K,-2.95,.96,1.7,4);
add(K,SP(.1,16,12),M(0xe8d8b0,.95),-2.5,1.0,1.28).scale.set(1.3,.5,1.1);add(K,CY(.025,.025,.3,10),mW,-2.2,1.0,1.1).rotation.z=PI/2;add(K,SP(.09,14,10),M(0xb8844a,.9),-3,1.0,1.35).scale.set(1.5,.7,1);
add(K,BX(1.6,.07,.3),mW,-2.5,.45,2.4);
add(K,BX(2,.06,.3),mW,-1,1.9,-2.95);[[-1.6,0x7a3a1a],[-1.25,0x3a5a3a],[-.9,0x6a5a2a],[-.55,0x5a2a2a]].forEach(([x,c])=>add(K,CY(.09,.09,.22,18),MP(c,.2,{clearcoat:.8}),x,2.04,-2.95));
[-2,-1.3,-.6].forEach((x,i)=>{add(K,CY(.18-i*.02,.16-i*.02,.06,28),copper,x,2.6,-2.92).rotation.x=PI/2;add(K,BX(.04,.3,.04),iron,x,2.4,-2.92)});
add(K,CY(.3,.3,.8,24),mW,-3.6,.4,.3);add(K,SP(.25,14,10),M(0xb8a070,1),-3.5,.28,-.4).scale.y=1.2;rug(K,-2.5,1.5,3.6,2.8);
add(K,BX(1.4,1.8,.05),new THREE.MeshBasicMaterial({color:new THREE.Color(.35,.55,1.3)}),1.5,2.3,-2.97).castShadow=false;
add(K,BX(1.5,.08,.1),mW,1.5,3.2,-2.95);add(K,BX(1.5,.08,.1),mW,1.5,1.4,-2.95);[-.7,.7].forEach(x=>add(K,BX(.08,1.9,.1),mW,1.5+x,2.3,-2.95));add(K,BX(.05,1.8,.08),mW,1.5,2.3,-2.94);
const shaft=ct(16,128,(g,w,h)=>{const q=g.createLinearGradient(0,0,0,h);q.addColorStop(0,'rgba(255,255,255,.9)');q.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=q;g.fillRect(0,0,w,h)});
[-.35,.35].forEach(dx=>{const g=new THREE.PlaneGeometry(.9,3.4);g.translate(0,-1.7,0);const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({map:shaft,color:new THREE.Color(.45,.65,1.3),transparent:true,opacity:.26,blending:THREE.AdditiveBlending,depthWrite:false,side:2}));m.position.set(1.5+dx,3,-2.85);m.rotation.x=-.55;K.add(m)});
{const n=700,a=new Float32Array(n*3);for(let i=0;i<n;i++){const th=Math.random()*PI*2,ph=Math.acos(Math.random()*.9+.1);a[i*3]=Math.sin(ph)*Math.cos(th)*60;a[i*3+1]=Math.cos(ph)*60;a[i*3+2]=Math.sin(ph)*Math.sin(th)*60}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(a,3));K.add(new THREE.Points(g,new THREE.PointsMaterial({size:2,sizeAttenuation:false,color:0xcfd8ff,fog:false})))}
add(K,BX(1.4,.15,.9),mS,-3.5,.075,-1);add(K,BX(.2,1.7,.9),mS,-3.9,.85,-1);[-1.45,-.55].forEach(z=>add(K,BX(1.4,1.7,.15),mS,-3.5,.85,z));add(K,BX(1.4,.2,.9),mS,-3.5,1.8,-1);add(K,BX(1.2,2,.8),mS,-3.6,3,-1);
add(K,BX(.6,.04,.5),new THREE.MeshBasicMaterial({color:new THREE.Color(2,.5,.1)}),-3.45,.17,-1).castShadow=false;
[[-.12,.3],[.1,-.2]].forEach(([dz,ry])=>{const l=add(K,CY(.07,.07,.6,10),M(0x2a1a10,.9),-3.45,.24,-1+dz);l.rotation.z=PI/2;l.rotation.y=ry});
for(let i=0;i<6;i++){const g=new THREE.ConeGeometry(.1,.5,10);g.translate(0,.25,0);const m=add(K,g,new THREE.MeshBasicMaterial({color:new THREE.Color(3,1.1+i*.1,.2),transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false}),-3.45+(Math.random()-.5)*.5,.2,-1+(Math.random()-.5)*.4);m.castShadow=false;fireC.push(m)}
glow(K,-3.4,.55,-1,2,new THREE.Color(1.6,.55,.12));const fire=new THREE.PointLight(0xff7a20,10,12,2);fire.userData.b=10;fire.position.set(-3.1,.7,-1);K.add(fire);flames.push(fire);
const moon=new THREE.DirectionalLight(0x9fb4e8,3.3);moon.position.set(9,7,4);moon.castShadow=true;moon.shadow.mapSize.set(2048,2048);moon.shadow.bias=-.0003;moon.shadow.normalBias=.02;Object.assign(moon.shadow.camera,{left:-10,right:10,top:10,bottom:-10,far:32});K.add(moon);
amb(K,0x7a8ab0,0x302418,0x909098,2.4);const kl=new THREE.PointLight(0xffe0b0,14,14,2);kl.position.set(-1,2.8,.5);K.add(kl);dust(K,0,.3,0,14,3.5,8);
const plank=x=>{const b=new THREE.Group();add(b,BX(2.4,.05,.35),wood(2.4,.35));b.screws=[-.5,.5].map(dx=>{const s=new THREE.Group();s.position.set(dx,.03,0);add(s,CY(.037,.037,.015,16),M(0x9a9a9a,.3,.9),0,.05,0);add(s,BX(.05,.018,.008),iron,0,.058,0);b.add(s);return s});[-.5,.5].forEach(dx=>add(K,BX(.08,.05,.3),mW,x+dx,.7,-2.82));K.add(b);return b};
const A=plank(-2.2),B=plank(.5);A.position.set(-2.2,.75,-2.8);B.position.set(.5,.75,-2.8);
/* ----- CABINET DE LA COURONNE ----- */
add(K,BX(2.8,.2,3),tile(2.8,3),6.6,.9,0);add(K,BX(2.8,2.6,.2),stone(2.8,2.6),6.6,2.2,-1.5);add(K,BX(.2,2.6,3),stone(3,2.6),8.1,2.2,0);
{const p=new THREE.Mesh(new THREE.PlaneGeometry(2.7,2.4),tm(damT,1.4,1.2,{roughness:.7,bumpScale:1}));p.position.set(6.6,2.25,-1.395);K.add(p);const q=p.clone();q.position.set(7.995,2.25,0);q.rotation.y=-PI/2;K.add(q)}
add(K,BX(2.75,.5,.05),wood(2.75,.5),6.6,1.27,-1.37);add(K,BX(2.75,.04,.07),gold,6.6,1.55,-1.36);add(K,BX(2.8,.1,.12),gold,6.6,3.45,-1.4);
add(K,new THREE.CircleGeometry(.12,20),new THREE.MeshBasicMaterial({color:0}),6.2,1.5,-1.388);add(K,TR(.13,.012),gold,6.2,1.5,-1.38);
add(K,BX(.8,1.4,.5),wood(.8,1.4),7.3,1.7,-1.1);[-.19,.19].forEach(x=>{add(K,BX(.34,1.2,.03),mW,7.3+x,1.7,-.84);add(K,SP(.02,8,6),gold,7.3+x*.3,1.7,-.81)});
art(K,5.75,2.7,-1.37,.7,.9,0);art(K,7.3,2.95,-1.37,.55,.5,2);
add(K,CY(.14,.17,.28,20),MP(0xe8e0d0,.2,{clearcoat:.8}),6.4,1.14,0);add(K,CY(.12,.13,.04,22),velvet(0x8a1020),6.4,1.28,0);
add(K,CY(.04,.06,.4,12),mW,7.5,1.2,.7);add(K,CY(.28,.28,.04,24),mW,7.5,1.42,.7);add(K,CY(.17,.18,.06,22),velvet(0x7a1020),7.5,1.47,.7);
{const c=new THREE.Group();c.position.set(7.5,1.5,.7);K.add(c);add(c,CY(.1,.1,.07,24),gold,0,.035,0);add(c,TR(.1,.008),gold,0,.07,0).rotation.x=PI/2;
 for(let i=0;i<8;i++){const a=i/8*PI*2,x=Math.cos(a)*.1,z=Math.sin(a)*.1;add(c,new THREE.ConeGeometry(.014,.07,8),gold,x,.105,z);add(c,SP(.01,8,6),new THREE.MeshStandardMaterial({color:i%2?0xff2040:0x2060ff,emissive:i%2?0x600010:0x102060,roughness:.1}),x,.145,z)}glow(c,0,.1,0,.5,new THREE.Color(1.2,.9,.4))}
{const c=new THREE.Group();c.position.set(6.6,3.05,0);K.add(c);add(c,TR(.45,.02),gold).rotation.x=PI/2;for(let i=0;i<5;i++){const a=i/5*PI*2;add(c,CY(.02,.025,.12,10),M(0xf2e6c8,.7),Math.cos(a)*.45,.06,Math.sin(a)*.45);glow(c,Math.cos(a)*.45,.16,Math.sin(a)*.45,.4,GL)}}
const cabL=new THREE.PointLight(0xffb070,6,8,2);cabL.position.set(6.3,2.2,.6);K.add(cabL);rug(K,6.6,.2,2.2,2,1.012);
const NK=necklace();NK.position.set(6.4,1.5,0);K.add(NK);
const child=ppl({s:.6,top:0xf0ead8,bot:0x5a4a3a,hair:0x4a3020});K.add(child.root);
const mother=ppl({s:.9,top:0xd8ccb4,dress:0x4a5a7a,apron:1,hair:0x2a1a10,bun:1,scarf:0xa84a4a});mother.root.position.set(-2.5,.8,.95);K.add(mother.root);
/* ----- TITRE ----- */
const TN=necklace(false);TN.scale.setScalar(8);TG.add(TN);TG.add(new THREE.AmbientLight(0x6070a0,1.2));
const tsp=new THREE.SpotLight(0xfff0d0,400,20,.5,.7);tsp.position.set(2,4,5);tsp.target=TN;TG.add(tsp);[[0x6aa0ff,-3,1,2],[0xffa860,3,-1,2]].forEach(([c,x,y,z])=>{const l=new THREE.PointLight(c,40,12,2);l.position.set(x,y,z);TG.add(l)});
glow(TG,0,0,-3,12,new THREE.Color(.12,.2,.5));dust(TG,0,-3,0,12,7,6,320);
/* ----- BIJOUTERIE ----- */
add(JW,BX(12,.2,8),wood(12,8),0,-.1,-1);add(JW,BX(12,4,.3),wood(12,4),0,2,-2.6);add(JW,BX(.3,4,8),wood(8,4),-6,2,-1);add(JW,BX(.3,4,8),wood(8,4),6,2,-1);[-3,0,3].forEach(x=>add(JW,BX(.3,.3,8),mW,x,3.9,-1));
for(let i=0;i<3;i++){add(JW,BX(5,.05,.3),mW,0,1.3+i*.7,-2.4);for(let j=0;j<8;j++)add(JW,BX(.25,.18,.2),velvet(j%2?0x6a1a1a:0x1a2a5a),-2.1+j*.6,1.42+i*.7,-2.4)}
add(JW,BX(3.2,.72,.8),wood(3.2,.72),0,.36,-.1);add(JW,BX(3.3,.06,.9),MP(0x2a1608,.35,{clearcoat:.6}),0,.75,-.1);add(JW,BX(3.34,.02,.94),gold,0,.725,-.1);
const glassM=new THREE.MeshPhysicalMaterial({color:0xcfe4ff,transparent:true,opacity:.12,roughness:.03,depthWrite:false});
[-1.05,0,1.05].forEach((x,i)=>{const n=necklace(false);n.scale.setScalar(1.2);n.position.set(x,.5,-.15);JW.add(n);add(JW,CY(.03,.05,.2,10),velvet(0x2a1a3a),x,.37,-.3)});
add(JW,CY(.04,.06,.2,12),gold,-1.1,.88,-.1);add(JW,BX(.4,.015,.02),gold,-1.1,.98,-.1);[-.18,.18].forEach(x=>add(JW,CY(.06,.05,.012,18),gold,-1.1+x,.88,-.1));
add(JW,BX(.4,.03,.28),M(0x2a1608,.6),-.7,.795,.12);add(JW,BX(.36,.02,.25),M(0xe8e0c8,.9),-.7,.815,.12);add(JW,BX(.9,.3,.4),glassM,1,.95,-.1).castShadow=false;add(JW,BX(.92,.03,.42),mW,1,.795,-.1);
rug(JW,0,1.2,5,3);add(JW,BX(1.2,1.8,.5),M(0x2a2e34,.35,.8),-3.5,.9,-2.1);add(JW,CY(.12,.12,.05,24),gold,-3.5,1,-1.8).rotation.x=PI/2;
add(JW,new THREE.CircleGeometry(.5,32),MP(0xcfd8e8,.02,{metalness:1,envMapIntensity:1.4}),-1.8,2.4,-2.43);add(JW,TR(.52,.04),gold,-1.8,2.4,-2.42);
add(JW,BX(1.4,2.2,.5),wood(1.4,2.2),3.6,1.1,-2.1);
[-1.6,1.6].forEach(x=>{add(JW,CY(.01,.01,1,6),iron,x,3.5,-.2);const l=add(JW,new THREE.ConeGeometry(.28,.3,24,1,true),M(0x2a5a3a,.5,.3),x,2.88,-.2);l.material.side=2;glow(JW,x,2.8,-.2,1.1,new THREE.Color(1.3,.9,.4))});
amb(JW,0x9a90a0,0x302418,0xa09080,2.2);const jl=new THREE.PointLight(0xffd29a,14,12,2);jl.position.set(0,2.5,.8);jl.castShadow=true;jl.shadow.mapSize.set(1024,1024);jl.shadow.bias=-.0008;JW.add(jl);
glow(JW,0,.95,.3,1.6,new THREE.Color(.8,.5,.2));dust(JW,0,.3,-.5,8,3,5);
const jw=ppl({s:.9,top:0x4a3a30,bot:0x2a2018,vest:0x6a1a1a,hair:0xcccccc,skin:0xe3b48e,mustache:1,glasses:1});jw.root.position.set(0,0,-.7);JW.add(jw.root);
const coins=[];for(let i=0;i<45;i++){const c=add(JW,CY(.04,.04,.008,16),gold,.25+(Math.random()-.5)*.35,.784+Math.floor(i/9)*.01,.05+(Math.random()-.5)*.25);c.visible=false;coins.push(c)}
/* ----- BUREAU AUX LETTRES ----- */
add(LT,BX(10,.2,8),wood(10,8),0,-.1,-1);add(LT,BX(10,4,.3),wood(10,4),0,2,-2.6);add(LT,BX(1.2,1.4,.05),new THREE.MeshBasicMaterial({color:new THREE.Color(.5,.8,1.5)}),-2.2,2,-2.42).castShadow=false;
[-.6,.6].forEach(x=>add(LT,BX(.08,1.5,.1),mW,-2.2+x,2,-2.4));add(LT,BX(1.2,.05,.08),mW,-2.2,2,-2.4);
add(LT,BX(2,.06,.9),wood(2,.9),0,.78,-.2);[-.9,.9].forEach(x=>[-.55,.15].forEach(z=>add(LT,BX(.07,.78,.07),mW,x,.39,z)));add(LT,BX(.9,.004,.55),MP(0x1a3a22,.5,{clearcoat:.3}),0,.812,-.2);
add(LT,BX(.5,.05,.5),mW,0,.45,-.75);add(LT,BX(.5,.6,.05),mW,0,.8,-1);rug(LT,0,-.3,3.4,2.6);
add(LT,BX(1.6,2.2,.4),wood(1.6,2.2),-4.1,1.1,-2.3);for(let r=0;r<4;r++)for(let b=0;b<9;b++)add(LT,BX(.12,.4,.28),M([0x6a1a1a,0x1a2a5a,0x2a4a2a,0x5a3a1a][(r+b)%4],.7),-4.7+b*.15,.35+r*.5,-2.2);
art(LT,0,2.35,-2.42,.8,1,2);add(LT,BX(.5,.3,.35),M(0x4a2c14,.7),-.75,.96,-.2);add(LT,SP(.2,16,10),gold,-.75,1.1,-.2).scale.y=.4;
candle(LT,.8,.81,-.5,6);amb(LT,0x8a90b0,0x302418,0x908090,2);const ll=new THREE.PointLight(0x7a98e0,8,9,2);ll.position.set(-2.2,2,-1.5);LT.add(ll);glow(LT,-.75,1.15,-.2,.9,new THREE.Color(1.5,1,.3));dust(LT,0,.3,-.5,6,3,4);
const envM=new THREE.MeshStandardMaterial({map:ct(128,86,(c,W,H)=>{c.fillStyle='#efe4c8';c.fillRect(0,0,W,H);c.strokeStyle='rgba(120,90,50,.4)';c.beginPath();c.moveTo(0,0);c.lineTo(W/2,H*.55);c.lineTo(W,0);c.stroke();c.fillStyle='#3a2a1a';c.font='italic 22px Georgia';c.textAlign='center';c.fillText('À Maman',W/2,H*.8)}),roughness:.9});
const envs=[];for(let i=0;i<16;i++){const e=add(LT,BX(.3,.012,.2),envM,.75,.812+i*.013,-.2);e.rotation.y=(Math.random()-.5)*.3;e.visible=false;envs.push(e)}
const sheet=add(LT,BX(.3,.003,.22),M(0xf4ecd8,.95),0,.817,-.2),seal=add(LT,CY(.03,.03,.01,18),MP(0xaa1010,.25,{clearcoat:1}),0,0,0),bill=add(LT,BX(.12,.004,.06),M(0xd9d0a8,.9),0,0,0),flyEnv=add(LT,BX(.3,.012,.2),envM,0,0,0);
const quill=new THREE.Group();child.hands[1].add(quill);add(quill,CY(.007,.003,.3,6),M(0xf0eee6,.7),0,-.15,0);add(quill,SP(.025,10,8),M(0xf6f4ee,.9),0,.07,0).scale.set(.35,3.2,.12);quill.visible=false;
/* ----- SALLE À MANGER ----- */
add(TB,BX(14,.2,10),tile(14,10),0,-.1,0);add(TB,BX(14,5,.3),stone(14,5),0,2.5,-2.6);add(TB,BX(3,2.4,.05),M(0x6a1620,1),0,2.2,-2.4);
add(TB,BX(2.4,.08,1.1),mW,0,.78,0);[-1,1].forEach(x=>[-.4,.4].forEach(z=>add(TB,BX(.08,.75,.08),mW,x,.37,z)));add(TB,BX(2.55,.015,1.25),M(0xf0ebe0,.95),0,.825,0);[-1,1].forEach(z=>add(TB,BX(2.55,.4,.015),M(0xf0ebe0,.95),0,.62,z*.62));
candle(TB,-.2,.835,0,7);candle(TB,.5,.835,.1,6);
[[-.55,-.2],[.55,-.2],[.1,.4]].forEach(([x,z])=>{add(TB,CY(.11,.09,.015,24),MP(0xf0ece0,.2,{clearcoat:.8}),x,.84,z);add(TB,TR(.1,.006),gold,x,.846,z).rotation.x=PI/2});
[[-.75,.1],[.75,.1],[.3,.45]].forEach(([x,z])=>add(TB,CY(.035,.02,.1,14),M(0xd4a83a,.2,1),x,.88,z));add(TB,CY(.04,.05,.28,14),MP(0x1a3a22,.08,{clearcoat:1}),-.9,.96,-.1);
rug(TB,0,0,5,3.6);[-4.5,4.5].forEach(x=>{add(TB,CY(.25,.28,4.5,28),stone(1.6,4.5),x,2.4,-2.2);add(TB,BX(.8,.3,.8),mS,x,.15,-2.2)});art(TB,-3,2.4,-2.38,1.1,1.5,0);art(TB,3,2.4,-2.38,1.1,1.5,1);
const CHD=new THREE.Group();CHD.position.set(0,3.6,0);TB.add(CHD);add(CHD,TR(.55,.025),iron).rotation.x=PI/2;add(CHD,CY(.012,.012,1.4,6),iron,0,.7,0);
for(let i=0;i<6;i++){const a=i/6*PI*2;add(CHD,CY(.02,.025,.14,10),M(0xf2e6c8,.7),Math.cos(a)*.55,.07,Math.sin(a)*.55);glow(CHD,Math.cos(a)*.55,.19,Math.sin(a)*.55,.4,GL)}
const cl2=new THREE.PointLight(0xffc880,8,9,2);cl2.userData.b=8;cl2.position.set(0,3.9,0);TB.add(cl2);flames.push(cl2);amb(TB,0x8090b0,0x302418,0x908898,2.4);
const fl=new THREE.PointLight(0xffd8b0,12,10,2);fl.position.set(0,1.7,1.6);TB.add(fl);const dl=new THREE.SpotLight(0xffd8b0,220,14,.9,.6);dl.position.set(0,3.5,2.5);dl.target.position.set(0,1,-.5);dl.castShadow=true;dl.shadow.mapSize.set(1024,1024);TB.add(dl,dl.target);dust(TB,0,.3,0,6,3,4);
const count=ppl({s:.9,top:0x1b2a5c,coat:0x1b2a5c,bot:0xd8d0c0,wig:1,skin:0xf0cfb4,vest:0xe8dfc8}),contessa=ppl({s:.9,top:0x7a1f3d,dress:0x7a1f3d,wig:1,skin:0xf2d4bc}),chev=ppl({s:.9,top:0x222222,bot:0x2a2a2e,hair:0x111111,hat:1,mustache:1});
count.root.position.set(-.55,.5,-.95);contessa.root.position.set(.55,.5,-.95);chev.root.position.set(.1,.5,.95);chev.root.rotation.y=PI;[count,contessa,chev].forEach(p=>{sit(p);TB.add(p.root)});
[-.55,.55].forEach(x=>add(TB,BX(.5,.05,.5),mW,x,.42,-.95));add(TB,BX(.5,.05,.5),mW,.1,.42,.95);
/* ----- TABLEAU D'ENQUÊTE ----- */
add(BD,BX(26,14,.3),tm(corkT,8,5,{roughness:1}),0,0,-.2);add(BD,BX(26.6,.4,.5),mW,0,7.1,-.2);add(BD,BX(26.6,.4,.5),mW,0,-7.1,-.2);
const bdL=new THREE.SpotLight(0xffe8c0,600,40,.6,.6);bdL.position.set(0,2,10);BD.add(bdL,bdL.target,new THREE.AmbientLight(0x998877,2.4));
const reveal=[];
function card(txt,x,y,w,h,rot,photo,t0){const g=new THREE.Group(),t=ct(256,Math.round(256*h/w),(c,W,H)=>{c.fillStyle='#efe6d0';c.fillRect(0,0,W,H);c.strokeStyle='rgba(60,40,20,.5)';c.lineWidth=3;c.strokeRect(6,6,W-12,H-12);
  if(photo){const gr=c.createLinearGradient(0,0,0,H*.62);gr.addColorStop(0,'#8a8680');gr.addColorStop(1,'#4a4640');c.fillStyle=gr;c.fillRect(20,16,W-40,H*.62);c.fillStyle='#2a2622';c.beginPath();c.arc(W/2,H*.3,30,0,7);c.fill();c.beginPath();c.ellipse(W/2,H*.56,56,34,0,PI,0);c.fill()}
  c.fillStyle='#1a1410';c.font=`bold ${W/(txt.length>8?9:6)}px Georgia`;c.textAlign='center';c.fillText(txt,W/2,H-18)});
 add(g,BX(w,h,.02),new THREE.MeshStandardMaterial({map:t,roughness:.9}));add(g,SP(.07,14,10),MP(0xaa1111,.2,{clearcoat:1}),0,h/2-.12,.05);g.position.set(x,y,0);g.rotation.z=rot;BD.add(g);reveal.push({o:g,t:t0});return new THREE.Vector3(x,y+h/2-.12,.12)}
const pR=card('RAOUL',0,0,2.4,3,.03,1,3.4),pC=card('COMTESSE BONNE',-5,2.2,2.2,2.6,-.06,1,4),pK=card('COMTE',5,2.2,2.2,2.6,.05,1,4.4),pH=card('HENRIETTE',-4.6,-3.2,2.2,2.6,.07,1,4.8),pL=card('COLLIER ?',4.6,-3,2.2,1.6,-.08,0,5.2),pF=card('CABINET',0,4.2,2,1.3,.02,0,5.6);
const Yv=new THREE.Vector3(0,1,0);
[[pR,pC],[pR,pK],[pR,pH],[pR,pL],[pR,pF],[pC,pK],[pH,pL]].forEach(([a,b],i)=>{const d=new THREE.Vector3().subVectors(b,a),m=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,d.length(),6),M(0xc01818,.5));m.position.copy(a).addScaledVector(d,.5);m.quaternion.setFromUnitVectors(Yv,d.normalize());m.position.z+=.02;BD.add(m);reveal.push({o:m,t:6+i*.25})});
const stamp=new THREE.Mesh(new THREE.PlaneGeometry(4,1.3),new THREE.MeshBasicMaterial({transparent:true,map:ct(512,160,(c,W,H)=>{c.strokeStyle=c.fillStyle='#c0141c';c.lineWidth=10;c.strokeRect(8,8,W-16,H-16);c.font='bold 100px Impact,sans-serif';c.textAlign='center';c.fillText('SUSPECT',W/2,H-38)})}));stamp.position.set(0,-.4,.2);stamp.rotation.z=-.22;stamp.visible=false;BD.add(stamp);

/* ================= AUDIO (tout est synthétisé) + VOIX ================= */
let AC,lp,out,NB,mg,musicTimer;const mtof=m=>440*Math.pow(2,(m-69)/12);
function aInit(){AC=new(window.AudioContext||window.webkitAudioContext)();lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=20000;
 const comp=AC.createDynamicsCompressor();comp.threshold.value=-22;comp.ratio.value=3;out=AC.createGain();out.connect(lp);lp.connect(comp);comp.connect(AC.destination);
 const cv=AC.createConvolver(),n=AC.sampleRate*3.4,b=AC.createBuffer(2,n,AC.sampleRate);for(let c=0;c<2;c++){const d=b.getChannelData(c);let v=0;for(let i=0;i<n;i++){const t=i/n;v+=((Math.random()*2-1)-v)*(.15+.85*(1-t));d[i]=v*Math.pow(1-t,2.4)}[.011,.019,.031,.047].forEach((s,j)=>d[Math.floor((s+c*.003)*AC.sampleRate)]+=(j%2?-1:1)*.6/(1+j*.4))}
 cv.buffer=b;const rs=AC.createGain();rs.gain.value=.5;out.connect(rs);rs.connect(cv);cv.connect(lp);
 NB=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate);const d=NB.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
 const w=AC.createBufferSource(),wf=AC.createBiquadFilter(),wg=AC.createGain(),lfo=AC.createOscillator(),lg=AC.createGain(),lf2=AC.createGain();w.buffer=NB;w.loop=true;wf.type='lowpass';wf.frequency.value=380;wg.gain.value=.07;w.connect(wf);wf.connect(wg);wg.connect(out);w.start(0,Math.random());lfo.frequency.value=.15;lg.gain.value=.04;lf2.gain.value=140;lfo.connect(lg);lg.connect(wg.gain);lfo.connect(lf2);lf2.connect(wf.frequency);lfo.start();
 const r1=AC.createBufferSource(),rf=AC.createBiquadFilter(),rg=AC.createGain();r1.buffer=NB;r1.loop=true;rf.type='lowpass';rf.frequency.value=150;rg.gain.value=.1;r1.connect(rf);rf.connect(rg);rg.connect(out);r1.start(0,Math.random());
 mg=AC.createGain();mg.gain.value=0;const mf=AC.createBiquadFilter();mf.type='lowpass';mf.frequency.value=3200;mg.connect(mf);mf.connect(out);const ms=AC.createGain();ms.gain.value=.6;mf.connect(ms);ms.connect(cv);
 const CH=[[45,57,60,64],[41,57,60,65],[48,55,60,64],[40,55,59,64]],MEL=[[[76,0],[79,1.5],[81,3]],[[77,0],[76,1.5],[72,3]],[[79,0],[76,1.5],[72,3]],[[71,0],[74,1.5],[76,3]]];
 const pluck=(f,t0,v)=>[[f,'triangle',1],[f*2,'sine',.4],[f*3,'sine',.15]].forEach(([fr,ty,a],i)=>{const o=AC.createOscillator(),g=AC.createGain();o.type=ty;o.frequency.value=fr;g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(v*a,t0+.008);g.gain.exponentialRampToValueAtTime(.0001,t0+2.4/(1+i*.6));o.connect(g);g.connect(mg);o.start(t0);o.stop(t0+2.5)});
 const bar=(t0,c,bi)=>{c.forEach((m,i)=>[-9,0,9].forEach(dt=>{const o=AC.createOscillator(),f=AC.createBiquadFilter(),g=AC.createGain(),vb=AC.createOscillator(),vg=AC.createGain();o.type='sawtooth';o.frequency.value=mtof(m);o.detune.value=dt;vb.frequency.value=4.5+i*.3;vg.gain.value=5;vb.connect(vg);vg.connect(o.detune);vb.start(t0);vb.stop(t0+5.4);f.type='lowpass';f.frequency.value=520+i*80;g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(.03,t0+1.8);g.gain.setValueAtTime(.03,t0+3);g.gain.linearRampToValueAtTime(0,t0+5.3);o.connect(f);f.connect(g);g.connect(mg);o.start(t0);o.stop(t0+5.4)}));
  const bo=AC.createOscillator(),bg=AC.createGain();bo.type='sine';bo.frequency.value=mtof(c[0]);bg.gain.setValueAtTime(0,t0);bg.gain.linearRampToValueAtTime(.14,t0+.08);bg.gain.exponentialRampToValueAtTime(.0001,t0+3.9);bo.connect(bg);bg.connect(mg);bo.start(t0);bo.stop(t0+4);
  [0,1,2,3,2,1,2,3].forEach((ix,j)=>pluck(mtof(c[ix]+12),t0+j*.5,.05));MEL[bi].forEach(([m,dt])=>pluck(mtof(m),t0+dt,.1))};
 let nb=AC.currentTime+.2,bi=0;musicTimer=setInterval(()=>{while(nb<AC.currentTime+1){bar(nb,CH[bi%4],bi%4);nb+=4;bi++}},250)}
function nz(dur,f0,f1,v,type='bandpass',q=2,dl=0,at=0){const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain(),n=AC.currentTime+dl;s.buffer=NB;s.loop=true;f.type=type;f.Q.value=q;f.frequency.setValueAtTime(f0,n);f.frequency.exponentialRampToValueAtTime(f1,n+dur);
 if(at){g.gain.setValueAtTime(.0001,n);g.gain.linearRampToValueAtTime(v,n+at)}else g.gain.setValueAtTime(v,n);g.gain.exponentialRampToValueAtTime(.0001,n+dur);s.connect(f);f.connect(g);g.connect(out);s.start(n,Math.random());s.stop(n+dur)}
function tn(fr,dur,v,type='sine',f2=fr,dl=0){const o=AC.createOscillator(),g=AC.createGain(),n=AC.currentTime+dl;o.type=type;o.frequency.setValueAtTime(fr,n);o.frequency.exponentialRampToValueAtTime(f2,n+dur);g.gain.setValueAtTime(v,n);g.gain.exponentialRampToValueAtTime(.0001,n+dur);o.connect(g);g.connect(out);o.start(n);o.stop(n+dur)}
const modal=(fr,dur,v,dl=0)=>fr.forEach((f,i)=>tn(f,dur/(1+i*.5),v/(1+i*.7),'sine',f*.995,dl)),ping=(f,v=.05,dl=0)=>modal([f,f*2.76,f*5.4,f*8.9],1.1,v,dl);
const SFX={screw:()=>{for(let i=0;i<14;i++){const d=.1+Math.pow(i/13,1.3)*1.1;tn(2600+Math.random()*300,.025,.09,'square',1400,d);tn(160,.05,.12,'triangle',100,d)}nz(1.1,1800,3200,.04,'bandpass',14,.1);tn(3300,.3,.07,'sine',3000,1.25)},
 wood:(v=1)=>{modal([170,290,480,760],.4,.5*v);nz(.04,2200,700,.35*v,'bandpass',1.2)},creak:()=>{tn(90+Math.random()*40,.6,.07,'sawtooth',60);nz(.6,300,520,.07,'bandpass',12,0,.1)},
 step:()=>{const p=.8+Math.random()*.5;nz(.12,500*p,110,.45,'lowpass',1);tn(95*p,.14,.4,'sine',48)},hand:()=>{nz(.09,600,180,.22,'lowpass',1);tn(150,.08,.12,'sine',90)},cloth:()=>nz(.7,500,2200,.16,'bandpass',.7,0,.25),
 gems:()=>[0,1,2,3,4,5].forEach(i=>ping(2500+Math.random()*3500,.035,i*.07)),paper:()=>{for(let i=0;i<5;i++)nz(.05+Math.random()*.06,4500+Math.random()*2500,3000,.1,'bandpass',.8,i*.05)},
 quill:()=>{for(let i=0;i<4;i++)nz(.05,5500+Math.random()*1500,3500,.05,'bandpass',3,i*.09)},seal:()=>{nz(.12,300,120,.2,'lowpass',1);tn(180,.1,.15,'sine',90)},thud:()=>{tn(80,.5,.7,'sine',35);nz(.25,400,100,.5,'lowpass',1)},
 laugh:()=>[0,1,2,3,4].forEach(i=>{tn(200-i*8,.16,.1,'sawtooth',150,i*.22);nz(.12,1200,800,.1,'bandpass',3,i*.22)}),coin:()=>{ping(3000+Math.random()*1200,.05);nz(.02,5000,3000,.05,'bandpass',2)},
 crackle:()=>nz(.02+Math.random()*.03,2000+Math.random()*4000,1000,.12+Math.random()*.1,'bandpass',1.5),cricket:()=>[0,.06,.12].forEach(d=>tn(4300,.035,.012,'sine',4300,d))};
/* voix : la meilleure voix française du navigateur (neurale en priorité) ; chaque personnage a sa hauteur et son débit */
const SUB=$('sub');let subT;const sub=(t,ms)=>{SUB.textContent=t;SUB.style.opacity=1;clearTimeout(subT);subT=setTimeout(()=>SUB.style.opacity=0,ms)};
const VO={jw:{p:.78,r:.84},ct:{p:.92,r:.88},ch:{p:1.12,r:1.08}};let FR=[];
const MALE=/henri|thomas|paul|jean|claude|antoine|nicolas|daniel|guillaume|louis|male|homme|mathieu|remy|rémy|maxime/i,FEM=/denise|eloise|éloise|amelie|amélie|marie|audrey|julie|hortense|virginie|female|femme|celine|céline|vivienne/i,QUAL=/natural|neural|online|premium|enhanced|siri|studio|wavenet|multilingual/i;
const refresh=()=>{const sc=v=>(MALE.test(v.name)?6:FEM.test(v.name)?-8:0)+(QUAL.test(v.name)?14:0)+(/google/i.test(v.name)?4:0)+(v.localService?0:3);FR=speechSynthesis.getVoices().filter(x=>x.lang&&x.lang.toLowerCase().startsWith('fr')).sort((a,b)=>sc(b)-sc(a))};
try{refresh();speechSynthesis.addEventListener('voiceschanged',refresh)}catch(e){}
function say(txt,who,ms=2500){sub(txt,ms);const v=VO[who];try{refresh();const u=new SpeechSynthesisUtterance(txt);u.lang='fr-FR';if(FR[0])u.voice=FR[0];u.pitch=v.p;u.rate=v.r;speechSynthesis.speak(u)}catch(e){}}

/* ================= CHORÉGRAPHIE ================= */
const V=new THREE.Vector3(),own=(g,o)=>{if(o.parent!==g)g.add(o)},yrEl=$('year'),fade=$('fade');
const T1=22,T2=34,T3=46,T4=60,END=68;
/* enfant dans la cuisine : [t,x,z,y,yaw,pitch,marche] */
const KEYS=[[0,-2.2,-2.3,.52,PI,0,0],[3,-2.2,-2.3,.52,PI,0,1],[6,2.4,0,.52,PI/2,0,0],[7.5,2.4,0,.52,PI/2,0,0],[8.3,3.2,0,1.29,PI/2,1.35,1],[13,5.8,0,1.29,PI/2,1.35,0],[14.5,5.8,0,1.29,PI/2,.45,0],[15.3,5.8,0,1.29,-PI/2,1.35,1],[19,3.2,0,1.29,-PI/2,1.35,0],[20,2.4,0,.52,-PI/2,0,1],[22,2.4,3.4,.52,0,0,0]];
function cs(t){let i=0;while(i<KEYS.length-2&&t>=KEYS[i+1][0])i++;const a=KEYS[i],b=KEYS[i+1],u=sm(k(t,a[0],b[0]));return{x:L(a[1],b[1],u),z:L(a[2],b[2],u),y:L(a[3],b[3],u),yaw:L(a[4],b[4],u),pit:L(a[5],b[5],u),w:a[6]}}
const hold=s=>[s.x+Math.sin(s.yaw)*.3,.5,s.z+Math.cos(s.yaw)*.3];
function kitchen(t){const s=cs(t),c=child;own(K,c.root);c.root.position.set(s.x,s.y,s.z);c.root.rotation.y=s.yaw;
 if(s.pit>.9)crawl(c,s.pit,s.w||(t>8.3&&t<13||t>15.3&&t<19?1:0));else if(s.pit>.2)crawl(c,s.pit,0);else stand(c,s.w);
 if(t>1&&t<3||t>4.2&&t<5.4){c.sh.forEach((q,i)=>q.rotation.set(-2,0,i?.35:-.35));c.el.forEach(e=>e.rotation.x=-.5);c.head.rotation.x=.5;c.hands.forEach((h,i)=>h.rotation.y=Math.sin(t*9+i*3)*.8)}else c.hands.forEach(h=>h.rotation.y=0);
 if(t>=3&&t<7.5){c.sh.forEach(q=>q.rotation.x=-1.1);c.el.forEach(e=>e.rotation.x=-.8)}
 if(t>=13&&t<14.6){c.sh[1].rotation.x=-2.1-s.pit;c.el[1].rotation.x=-.3}
 face(c);
 const sc=(P,t0)=>P.screws.forEach((v,i)=>{const p=k(t,t0+i*.9,t0+i*.9+.9);v.rotation.y=p*22;v.position.y=.03+p*.1});sc(A,.2);sc(B,1.6);
 const h=hold(s);
 if(t<3)A.position.set(-2.2,.75,-2.8);else if(t<6)A.position.set(...h);else{const u=sm(k(t,6,7.4));A.position.set(L(h[0],3.2,u),L(.5,.985,u),L(h[2],-.22,u))}
 if(t<3.2)B.position.set(.5,.75,-2.8);else if(t<6){B.position.set(h[0],h[1]+.08,h[2])}else{const u=sm(k(t,6,7.4));B.position.set(L(h[0],3.2,u),L(.58,.985,u),L(h[2],.22,u))}
 A.rotation.y=B.rotation.y=t<3?0:t<6?s.yaw-PI/2:L(s.yaw-PI/2,0,sm(k(t,6,7.4)));
 NK.rotation.y=t*.8;NK.visible=true;if(t>=13&&t<22){c.root.updateMatrixWorld(true);c.hands[1].getWorldPosition(V);NK.position.copy(V)}else NK.position.set(6.4,1.5,0);
 stand(mother,0);mother.body.rotation.x=.2;mother.head.rotation.x=.3;mother.sh.forEach((q,i)=>q.rotation.set(-1.1+Math.sin(t*3+i*PI)*.18,0,i?.15:-.15));mother.el.forEach(e=>e.rotation.x=-.9);face(mother)}
function jeweler(t){const u=t-T1;own(JW,child.root);own(JW,NK);const c=child,j=jw,go=sm(k(u,8.4,10));
 c.root.position.set(0,.52,L(.8,3,go));c.root.rotation.y=L(PI,0,sm(k(u,8.2,8.8)));c.root.scale.setScalar(.6);stand(c,go>0?1:0);if(go===0)c.sh.forEach(s=>s.rotation.x=-L(1.2,2.2,1-sm(k(u,0,1.5))));face(c);
 const ex=sm(k(u,2,3));stand(j,0);j.body.rotation.x=.18*ex;j.sh.forEach(s=>s.rotation.x=-ex);j.el.forEach(e=>e.rotation.x=-.9*ex-.2);j.head.rotation.x=.3*ex;face(j,0,u>3.2&&u<5?.5:0,(u>3.5&&u<4.5)||(u>6.3&&u<7.5)?1:0);
 NK.visible=u<8.4;if(u<1.8){c.root.updateMatrixWorld(true);c.hands[1].getWorldPosition(V);NK.position.copy(V).lerp(V.set(0,.84,.42),sm(k(u,1,1.8)));NK.rotation.set(0,u,0)}else if(u<7.4){NK.position.set(0,.84,.42);NK.rotation.set(-PI/2,0,u*.3)}else{NK.position.set(0,.84,.42).lerp(V.set(0,1.2,-.4),sm(k(u,7.4,8.3)));NK.rotation.set(0,0,0)}
 const m=u<7.8?k(u,6.3,7.3):1-k(u,7.8,9);coins.forEach((q,i)=>q.visible=i<45*m)}
function letters(t){const u=t-T2;own(LT,child.root);const c=child,idx=Math.min(15,Math.floor(u/.75)),p=u/.75-Math.floor(u/.75);
 c.root.scale.setScalar(L(.62,.92,Math.min(u/12,1)));c.root.position.set(0,.5,-.75);c.root.rotation.y=0;sit(c,.26);c.head.rotation.x=.35;face(c);quill.visible=true;quill.rotation.x=-.6;
 c.sh[1].rotation.set(-1.05-Math.sin(p*40)*.05,0,.15-p*.2);c.el[1].rotation.x=-.7+Math.sin(p*60)*.05;c.sh[0].rotation.set(-.9-.3*Math.sin(PI*p),0,-.1);
 sheet.visible=p<.5;seal.visible=p>.55;seal.position.set(.0,.83,-.2);bill.visible=p>.15&&p<.5;bill.position.set(L(-.75,0,k(p,.15,.5)),.84,-.2);
 flyEnv.visible=p>=.5;flyEnv.position.set(L(0,.75,sm(k(p,.55,1))),.82+Math.sin(PI*k(p,.55,1))*.1,-.2);envs.forEach((e,i)=>e.visible=i<idx);
 yrEl.textContent=1885+Math.min(7,Math.floor(u/1.7));yrEl.style.opacity=k(t,T2+.3,T2+1)*(1-k(t,T3-1.3,T3-.2))}
function table(q){stand(mother,0);const e=sm(k(q,46-T3+1,48-T3+1));face(count,e,0,(q>1&&q<2.6)||(q>4.4&&q<6.6)?1:0);face(contessa,0);face(chev,0,0,q>8&&q<8.9?1:0);chev.body.rotation.x=q>9&&q<11?Math.sin(q*22)*.05:0;count.head.rotation.x=e*.1}
function board(q){reveal.forEach(r=>{const u=sm(k(q,r.t,r.t+.4));r.o.visible=u>0;r.o.scale.setScalar(.4+.6*u)});const u=k(q,7,7.25);stamp.visible=u>0;stamp.scale.setScalar(L(3,1,u));bdL.position.x=Math.sin(q*.7)*.5}
/* caméras : [début, fin, pos A, pos B, cible A, cible B] */
const CK=[[0,1,[-1,1.8,2.6],[-1.2,1.6,1.8],[-1.8,.9,-2.5],[-1.8,.9,-2.5]],[1,4.2,[-1.3,1.15,-1.1],[-1.6,1.1,-1.5],[-2.2,.85,-2.6],[-2.2,.8,-2.6]],[4.2,8.2,[-.5,1.7,1.8],[2,1.5,2.8],[.5,.6,-1],[2.8,.8,0]],[8.2,10,[1.4,1.5,1.6],[2.4,1.35,1.3],[2.6,1.1,0],[3.6,1.2,0]],[10,13,[5,1.6,1.8],[4.6,1.5,1.5],[3.8,1.2,0],[5,1.2,0]],[13,15.3,[6.3,1.5,1.5],[6.2,1.45,1.2],[6.3,1.3,0],[6.3,1.3,0]],[15.3,20,[5.5,2.2,3.5],[3.5,1.7,3.3],[4.5,1.1,0],[3.2,1,0]],[20,22,[.3,1.5,3.8],[.9,1.4,3.9],[2,.5,.8],[2.3,.5,2.4]]];
const CJ=[[0,5,[-.9,1.35,2.2],[-.6,1.25,1.7],[0,1,.3],[0,1.05,.2]],[5,8,[.9,1.3,1.4],[.5,1.25,1.1],[0,1.15,-.2],[0,1.1,.1]],[8,12.2,[0,1.2,2.3],[0,1.1,1.7],[0,1,.4],[0,.95,.4]]];
const CL=[[0,7,[.9,1.55,2.7],[.4,1.45,2.2],[0,1,-.4],[0,1,-.4]],[7,12.2,[-.4,1.35,1.8],[0,1.25,1.5],[0,.95,-.4],[.2,.92,-.3]]];
const CT=[[0,8,[0,1.45,3.2],[-.2,1.3,2.3],[0,1,-.8],[-.2,1.1,-.8]],[8,14.2,[-.55,1.35,.6],[-.55,1.32,.1],[-.55,1.3,-.95],[-.55,1.28,-.95]]];
const CB=[[0,8.2,[0,0,12],[0,0,4.2],[0,0,0],[0,0,0]]];
function camAt(t,Ar){const s=Ar.find(a=>t>=a[0]&&t<a[1])||Ar[Ar.length-1],u=sm(k(t,s[0],s[1]));cam.position.set(...s[2].map((v,i)=>L(v,s[3][i],u)));cam.position.y+=Math.sin(t*1.3)*.008;cam.position.x+=Math.sin(t*.9)*.004;cam.lookAt(...s[4].map((v,i)=>L(v,s[5][i],u)));cam.rotateZ(Math.sin(t*.7)*.006)}
/* événements sonores / voix */
const E=[],ev=(t,f)=>E.push([t,f]);
[.2,1.6].forEach(t=>ev(t,SFX.screw));ev(3,SFX.wood);ev(6,()=>SFX.wood(.7));ev(7.4,SFX.wood);for(let t=3.2;t<6;t+=.38)ev(t,SFX.step);for(let t=20;t<22;t+=.38)ev(t,SFX.step);
ev(8.4,SFX.creak);for(let t=8.6;t<13;t+=.62){ev(t,SFX.hand);ev(t+.3,SFX.hand)}for(let t=15.4;t<19;t+=.45){ev(t,SFX.hand);ev(t+.22,SFX.hand)}ev(13.6,SFX.gems);ev(14.2,SFX.cloth);
ev(T1+3.4,()=>say('Mon Dieu…','jw',1800));ev(T1+6.3,()=>say('Tiens, mon petit.','jw',2000));for(let i=0;i<20;i++)ev(T1+6.4+i*.05,SFX.coin);for(let i=0;i<8;i++)ev(T1+8+i*.1,SFX.coin);
for(let i=0;i<16;i++){ev(T2+i*.75+.06,SFX.quill);ev(T2+i*.75+.15,SFX.coin);ev(T2+i*.75+.4,SFX.paper);ev(T2+i*.75+.5,SFX.seal)}
ev(T3+1,()=>say('Le chevalier Floriani…','ct'));ev(T3+4.4,()=>say('Ce petit avait tendu une main','ct'));ev(T3+8,()=>say('Deux mains !','ch',1500));ev(T3+8.9,SFX.laugh);
for(let t=T4+3.4;t<T4+6;t+=.4)ev(t,SFX.paper);ev(T4+7,SFX.thud);E.sort((a,b)=>a[0]-b[0]);

/* ================= BOUCLE ================= */
let clock=0,last=0,running=false;
function frame(t,dt){let f=0;setT(t);TG.visible=false;K.visible=t<T1;JW.visible=t>=T1&&t<T2;LT.visible=t>=T2&&t<T3;TB.visible=t>=T3&&t<T4;BD.visible=t>=T4;
 if(t<T1){kitchen(t);camAt(t,CK);f=Math.max(1-k(t,.2,1.8),k(t,T1-1.5,T1-.1))}
 else if(t<T2){setT(t-T1);jeweler(t);camAt(t-T1,CJ);f=Math.max(1-k(t,T1+.2,T1+1.7),k(t,T2-1.5,T2-.1))}
 else if(t<T3){setT(t-T2);letters(t);camAt(t-T2,CL);f=Math.max(1-k(t,T2+.2,T2+1.6),k(t,T3-1.5,T3-.1))}
 else if(t<T4){const q=t-T3;setT(q);table(q);camAt(q,CT);f=Math.max(1-k(q,0,2),k(q,12.5,14))}
 else{const q=t-T4;setT(q);board(q);camAt(q,CB);f=Math.max(1-k(q,0,2),k(q,6.5,8))}
 if(t<T2||t>=T3)yrEl.style.opacity=0;fade.style.opacity=f;
 flames.forEach((l,i)=>l.intensity=l.userData.b*(.85+Math.sin(t*13+i*2)*.08+Math.random()*.08));glows.forEach((s,i)=>{const g=.85+Math.sin(t*11+i*3)*.08+Math.random()*.08;s.scale.set(s.userData.s*g,s.userData.s*g,1)});
 fireC.forEach((m,i)=>m.scale.set(1+Math.sin(t*9+i)*.15,.75+Math.sin(t*13+i*2)*.3+Math.random()*.2,1));dusts.forEach((m,i)=>{m.position.y=Math.sin(t*.25+i)*.08;m.position.x=Math.cos(t*.2+i)*.08});
 grade.uniforms.time.value=t%7;if(t<T4&&Math.random()<dt*6)SFX.crackle();if(t<T1&&Math.random()<dt*2)SFX.cricket();
 lp.frequency.value=t>=T3&&t<T3+10?250*Math.pow(80,k(t,T3,T3+10)):20000; // oreilles bouchées → net
 mg.gain.setTargetAtTime(t<.5?0:.55+.45*k(t,T4-2,T4+4)*(t<END-2?1:1-k(t,END-2,END)),AC.currentTime,.3)}
function loop(now){if(!running)return;requestAnimationFrame(loop);const dt=Math.min((now-last)/1000,.1);last=now;clock+=dt;while(E.length&&E[0][0]<=clock)E.shift()[1]();frame(Math.min(clock,END),dt);composer.render();if(clock>=END)finish()}
function titleLoop(now){if(running)return;requestAnimationFrame(titleLoop);const t=now/1000;K.visible=JW.visible=LT.visible=TB.visible=BD.visible=false;TG.visible=true;
 TN.rotation.set(Math.sin(t*.4)*.25,t*.55,Math.sin(t*.3)*.1);TN.position.y=Math.sin(t*.8)*.1;cam.position.set(Math.sin(t*.15)*.6,.3+Math.sin(t*.2)*.15,3.6);cam.lookAt(0,-.6,0);
 glows.forEach((g,i)=>{const f=.85+Math.sin(t*3+i*3)*.15;g.scale.set(g.userData.s*f,g.userData.s*f,1)});grade.uniforms.time.value=t%7;composer.render()}
function finish(){running=false;clearInterval(musicTimer);speechSynthesis.cancel();setTimeout(()=>AC.close(),500);SUB.remove();yrEl.remove();fade.remove();$('bars').remove();$('site').style.display='flex';requestAnimationFrame(titleLoop)}
['keydown','keyup','contextmenu','wheel','touchmove','dragstart'].forEach(e=>addEventListener(e,x=>{if(running)x.preventDefault()},{passive:false}));
setTimeout(()=>{R.compile(scene,cam);$('load').style.display='none';fade.style.opacity=0;$('start').style.display='flex';requestAnimationFrame(titleLoop)},50);
$('go').onclick=()=>{aInit();try{const u=new SpeechSynthesisUtterance(' ');u.volume=0;speechSynthesis.speak(u)}catch(e){}$('start').remove();running=true;last=performance.now();requestAnimationFrame(loop)};
