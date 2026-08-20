import * as THREE from 'three';

// Versi Three.js dari brief medieval village. Pencahayaan/shadow/PBR ringan dibuat untuk browser.
export function buildWorld(scene) {
  scene.background=new THREE.Color(0x73b5df);scene.fog=new THREE.Fog(0x9bc9e2,30,68);
  scene.add(new THREE.HemisphereLight(0xdff2ff,0x31415a,1.65));
  const sun=new THREE.DirectionalLight(0xffe0ad,4.25);sun.position.set(-16,21,10);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-24;sun.shadow.camera.right=24;sun.shadow.camera.top=24;sun.shadow.camera.bottom=-24;sun.shadow.bias=-.00018;scene.add(sun);
  const skyFill=new THREE.DirectionalLight(0x82b7f5,.62);skyFill.position.set(14,8,-16);scene.add(skyFill);
  createGround(scene);createCobblestoneStreet(scene);createStreetBuildings(scene);createClockTower(scene);createProps(scene);createClouds(scene);
}
const material=(color,roughness=.78,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const stone=material(0x77756f,.9),darkStone=material(0x454a52,.86),plaster=material(0xe2d1af,.94),timber=material(0x30261f,.82),roof=material(0x9a4933,.78),moss=material(0x506a37,.95),wood=material(0x64432f,.86);
function add(scene,g,x,y,z,mat,cast=true){const m=new THREE.Mesh(g,mat);m.position.set(x,y,z);m.castShadow=cast;m.receiveShadow=true;scene.add(m);return m;}
function createGround(scene){const ground=add(scene,new THREE.PlaneGeometry(52,52),0,-.04,0,material(0x627b4e,.98),false);ground.rotation.x=-Math.PI/2;}
function createCobblestoneStreet(scene){
  // Batu jalan dihasilkan satu per satu agar ukuran, posisi, warna dan celahnya bervariasi.
  const cobbles=new THREE.Group();const variants=[material(0x77736d,.95),material(0x8b8378,.95),material(0x625f5c,.95),material(0x9a8d7b,.95)];
  for(let row=0;row<44;row++){const z=7-row*.57;for(let col=-4;col<=4;col++){if(Math.random()<.11)continue;const width=.36+Math.random()*.18,depth=.32+Math.random()*.15;const rock=new THREE.Mesh(new THREE.BoxGeometry(width,.07+Math.random()*.035,depth),variants[Math.floor(Math.random()*variants.length)]);rock.position.set(col*.5+(Math.random()-.5)*.08,.02,z+(Math.random()-.5)*.07);rock.rotation.y=(Math.random()-.5)*.15;rock.castShadow=rock.receiveShadow=true;cobbles.add(rock);if(Math.random()<.14){const grass=new THREE.Mesh(new THREE.PlaneGeometry(.1,.18),moss);grass.rotation.x=-Math.PI/2;grass.position.set(rock.position.x+.18,.075,rock.position.z+.2);cobbles.add(grass);}}
  }scene.add(cobbles);
}
function createStreetBuildings(scene){
  const left=[[-4.8,5.3,.12,1.15],[-4.65,1.2,-.08,1.03],[-4.5,-2.9,.08,1.22],[-4.35,-7.1,-.1,.95]];
  const right=[[4.8,5.1,-.1,1.12],[4.65,1.1,.11,.96],[4.55,-3.1,-.12,1.18],[4.3,-7.0,.08,.9]];
  left.forEach((d,i)=>tudorHouse(scene,d[0],d[1],Math.PI/2+d[2],d[3],i));
  right.forEach((d,i)=>tudorHouse(scene,d[0],d[1],-Math.PI/2+d[2],d[3],i+4));
}
function tudorHouse(scene,x,z,rot,s,index){
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;g.scale.setScalar(s);scene.add(g);
  const lower=new THREE.Mesh(new THREE.BoxGeometry(2.55,1.32,2.18),stone);lower.position.y=.66;lower.castShadow=lower.receiveShadow=true;g.add(lower);
  const upper=new THREE.Mesh(new THREE.BoxGeometry(2.72,1.32,2.33),plaster);upper.position.y=1.93;upper.castShadow=upper.receiveShadow=true;g.add(upper);
  // Rangka kayu gelap gaya Tudor pada fasad, termasuk balok horizontal dan diagonal.
  for(const y of[1.32,1.37,2.52]){const beam=new THREE.Mesh(new THREE.BoxGeometry(2.82,.11,.12),timber);beam.position.set(0,y,-1.21);g.add(beam);}
  for(const xx of[-1.14,0,1.14]){const beam=new THREE.Mesh(new THREE.BoxGeometry(.13,1.35,.13),timber);beam.position.set(xx,1.93,-1.22);g.add(beam);}
  for(const sign of[-1,1]){const brace=new THREE.Mesh(new THREE.BoxGeometry(.1,1.38,.1),timber);brace.position.set(sign*.55,1.93,-1.24);brace.rotation.z=sign*.7;g.add(brace);}
  const roofMesh=new THREE.Mesh(new THREE.ConeGeometry(2.13,1.25,4),roof);roofMesh.position.y=3.22;roofMesh.rotation.y=Math.PI/4;roofMesh.castShadow=true;g.add(roofMesh);
  // Genteng sederhana: garis terracotta bertingkat yang memberi tekstur visual.
  const tileMat=material(0xb65b3e,.82);for(let i=0;i<5;i++){const tile=new THREE.Mesh(new THREE.BoxGeometry(2.5-i*.22,.07,.12),tileMat);tile.position.set(0,2.7+i*.19,-1.2+i*.1);g.add(tile);}
  const door=new THREE.Mesh(new THREE.PlaneGeometry(.46,.75),new THREE.MeshBasicMaterial({color:0x2c211c}));door.position.set(0,.45,-1.105);g.add(door);
  for(const xx of[-.72,.72]){const window=new THREE.Mesh(new THREE.PlaneGeometry(.31,.34),new THREE.MeshBasicMaterial({color:0x8ac6d8}));window.position.set(xx,1.95,-1.18);g.add(window);}
  if(index%2===0)addFlowerBox(g,.72,1.68,-1.28);if(index%3===0)addHangingFlag(g,1.25,2.65,-1.3);
}
function addFlowerBox(group,x,y,z){const box=new THREE.Mesh(new THREE.BoxGeometry(.48,.17,.2),wood);box.position.set(x,y,z);group.add(box);for(let i=0;i<4;i++){const flower=new THREE.Mesh(new THREE.SphereGeometry(.055,6,5),new THREE.MeshBasicMaterial({color:i%2?0xff6d7b:0xffdc70}));flower.position.set(x-.14+i*.09,y+.16,z-.03);group.add(flower);}}
function addHangingFlag(group,x,y,z){const pole=new THREE.Mesh(new THREE.BoxGeometry(.05,.65,.05),timber);pole.position.set(x,y,z);group.add(pole);const flag=new THREE.Mesh(new THREE.PlaneGeometry(.34,.48),new THREE.MeshBasicMaterial({color:0xa92e35,side:THREE.DoubleSide}));flag.position.set(x+.17,y-.04,z-.02);group.add(flag);}
function createClockTower(scene){
  const g=new THREE.Group();g.position.set(0,0,-14);scene.add(g);
  const body=new THREE.Mesh(new THREE.BoxGeometry(3.05,8.4,3.05),darkStone);body.position.y=4.2;body.castShadow=body.receiveShadow=true;g.add(body);
  const ledge=new THREE.Mesh(new THREE.BoxGeometry(3.38,.28,3.38),stone);ledge.position.y=6.25;g.add(ledge);
  for(const z of[-1.54,1.54])for(const x of[-1.54,1.54]){const turret=new THREE.Mesh(new THREE.CylinderGeometry(.28,.34,1.0,7),stone);turret.position.set(x,6.8,z);g.add(turret);}
  const clock=new THREE.Mesh(new THREE.CircleGeometry(.64,20),new THREE.MeshBasicMaterial({color:0xf2e4bd}));clock.position.set(0,6.8,-1.535);g.add(clock);const hand=new THREE.Mesh(new THREE.BoxGeometry(.05,.42,.03),new THREE.MeshBasicMaterial({color:0x2f3845}));hand.position.set(0,6.9,-1.57);hand.rotation.z=-.55;g.add(hand);
  const spire=new THREE.Mesh(new THREE.ConeGeometry(1.92,3.1,4),roof);spire.position.y=10.0;spire.rotation.y=Math.PI/4;spire.castShadow=true;g.add(spire);
}
function createProps(scene){
  // Bangku kayu, gerobak, tong, pot tanaman dan lampu jalan di sekitar jalan sempit.
  for(const [x,z] of[[-2.5,3.1],[2.35,-1.6],[-2.6,-5.3]]){const seat=add(scene,new THREE.BoxGeometry(.9,.12,.3),x,.43,z,wood);const back=add(scene,new THREE.BoxGeometry(.9,.42,.08),x,.65,z+.12,wood);for(const dx of[-.34,.34])add(scene,new THREE.BoxGeometry(.07,.43,.07),x+dx,.2,z,wood);}
  const cart=new THREE.Group();cart.position.set(2.65,.28,3.2);const bed=new THREE.Mesh(new THREE.BoxGeometry(1.2,.28,.85),wood);cart.add(bed);for(const x of[-.48,.48]){const wheel=new THREE.Mesh(new THREE.TorusGeometry(.27,.07,6,12),timber);wheel.position.set(x,-.22,.42);wheel.rotation.x=Math.PI/2;cart.add(wheel);}scene.add(cart);
  for(const [x,z] of[[-3.1,1.8],[3.05,-4.2],[-3.1,-6.8]]){const pot=add(scene,new THREE.CylinderGeometry(.16,.22,.28,8),x,.14,z,material(0x9a5236,.88));const plant=add(scene,new THREE.SphereGeometry(.18,7,6),x,.37,z,material(0x456f39,.9));}
}
function createClouds(scene){const cloudMat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.76,depthWrite:false});for(const [x,y,z,s] of[[-10,12,-20,1.4],[5,14,-25,1.8],[14,10,-18,1.15]]){const g=new THREE.Group();for(let i=0;i<5;i++){const puff=new THREE.Mesh(new THREE.SphereGeometry(s*(.45+Math.random()*.25),12,8),cloudMat);puff.position.set(i*s*.35,Math.random()*.3,(Math.random()-.5)*.5);g.add(puff);}g.position.set(x,y,z);scene.add(g);}}
