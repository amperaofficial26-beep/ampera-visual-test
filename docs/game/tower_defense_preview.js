import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { terrainHeight } from './terrain.js';

// Tower defense preview memakai model GLB Ultimate Fantasy RTS yang sudah di-upload user.
const FLOOR_MODELS=[
  {name:'CANNON', file:'assets/models/tower/Archery%20Towers.glb', color:0xff774e},
  {name:'TESLA', file:'assets/models/tower/Temple.glb', color:0x65cfff},
  {name:'FREEZE', file:'assets/models/tower/Watch%20Tower.glb', color:0x83f6ff},
  {name:'ROCKET', file:'assets/models/tower/Fortress.glb', color:0xffc85b},
  {name:'LASER', file:'assets/models/tower/Castle.glb', color:0xd68bff},
];
const loader=new GLTFLoader();

export async function addTowerDefensePreview(scene){
  const x=0,z=28,baseY=terrainHeight(x,z),tower=new THREE.Group();tower.name='tower_defense_preview';tower.position.set(x,baseY,z);scene.add(tower);
  const stone=new THREE.MeshStandardMaterial({color:0x526174,roughness:.72,metalness:.12});
  const foundation=new THREE.Mesh(new THREE.CylinderGeometry(3.1,3.65,.7,10),stone);foundation.position.y=.35;foundation.castShadow=foundation.receiveShadow=true;tower.add(foundation);
  let nextY=.74;
  // Load berurutan agar preview tidak membuat browser berat saat semua GLB diparse sekaligus.
  for(let index=0;index<FLOOR_MODELS.length;index++){
    const config=FLOOR_MODELS[index];
    try{
      const gltf=await loader.loadAsync(config.file);const floor=new THREE.Group();floor.name=`tower_floor_${config.name}`;tower.add(floor);
      const model=gltf.scene;model.traverse((node)=>{if(node.isMesh){node.castShadow=true;node.receiveShadow=true;}});floor.add(model);
      const height=fitModel(model,2.45,1.75);floor.position.y=nextY;addFloorMarker(floor,config,index,height);nextY+=height+1.15;
    }catch(error){console.warn(`Model lantai ${config.name} gagal dimuat`,error);addFallbackFloor(tower,nextY,config,index);nextY+=2.9;}
  }
  addPreviewSign(tower,nextY);
}
function fitModel(model,targetWidth,targetHeight){
  model.updateMatrixWorld(true);let box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3());
  const factor=Math.min(targetWidth/Math.max(size.x,size.z),targetHeight/Math.max(size.y,.01));model.scale.multiplyScalar(factor);
  model.updateMatrixWorld(true);box=new THREE.Box3().setFromObject(model);model.position.y-=box.min.y;return box.max.y-box.min.y;
}
function addFloorMarker(floor,config,index,height){
  const glow=new THREE.MeshBasicMaterial({color:config.color});
  const ring=new THREE.Mesh(new THREE.TorusGeometry(1.38,.055,7,20),glow);ring.rotation.x=Math.PI/2;ring.position.y=.1;floor.add(ring);
  const rune=new THREE.Mesh(new THREE.OctahedronGeometry(.18),glow);rune.position.set(0,height+.28,0);floor.add(rune);
  const light=new THREE.PointLight(config.color,.72,3.8);light.position.set(0,height+.25,0);floor.add(light);
  // Pilar kecil memisahkan visual antar lantai agar senjata/model mudah dilihat.
  const pillarMat=new THREE.MeshStandardMaterial({color:0x303947,roughness:.7});
  for(const a of[0,Math.PI/2,Math.PI,Math.PI*1.5]){const p=new THREE.Mesh(new THREE.CylinderGeometry(.08,.12,.75,6),pillarMat);p.position.set(Math.cos(a)*1.35,-.38,Math.sin(a)*1.35);floor.add(p);}
}
function addFallbackFloor(tower,y,config,index){const body=new THREE.Mesh(new THREE.CylinderGeometry(1.25,1.4,.8,8),new THREE.MeshStandardMaterial({color:0x586477,roughness:.75}));body.position.y=y+.4;body.castShadow=true;tower.add(body);const rune=new THREE.Mesh(new THREE.OctahedronGeometry(.22),new THREE.MeshBasicMaterial({color:config.color}));rune.position.y=y+.9;tower.add(rune);}
function addPreviewSign(tower,y){const board=new THREE.Mesh(new THREE.BoxGeometry(3.2,.72,.18),new THREE.MeshStandardMaterial({color:0x3b2d25,roughness:.82}));board.position.set(0,1.25,3.15);tower.add(board);const pole=new THREE.Mesh(new THREE.CylinderGeometry(.05,.06,1.8,6),new THREE.MeshStandardMaterial({color:0x4d3829,roughness:.84}));pole.position.set(0,.9,3.15);tower.add(pole);}
