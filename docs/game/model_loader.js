import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Semua aset di bawah sudah berada di docs/assets/models/ pada repository GitHub.
const MODELS={
  houseA:'assets/models/Fantasy%20House.glb',
  houseB:'assets/models/Fantasy%20House-BH2XHWUNmF.glb',
  houseC:'assets/models/Fantasy%20House-dcPho4SUA3.glb',
  tower:'assets/models/Bell%20Tower.glb',
  barrel:'assets/models/Barrel.glb',
  crate:'assets/models/Crate.glb',
  cart:'assets/models/Cart.glb',
  bench:'assets/models/Bench.glb',
  market:'assets/models/Market%20Stand.glb',
  rocks:'assets/models/Rocks.glb',
  package:'assets/models/Package.glb',
};
const loader=new GLTFLoader(),cache=new Map();

async function sourceModel(key){
  if(!cache.has(key))cache.set(key,loader.loadAsync(MODELS[key]).then((gltf)=>{
    gltf.scene.traverse((node)=>{if(node.isMesh){node.castShadow=true;node.receiveShadow=true;if(node.material)node.material.needsUpdate=true;}});
    return gltf.scene;
  }));
  return cache.get(key);
}
function fitToHeight(model,targetHeight){
  model.updateMatrixWorld(true);let box=new THREE.Box3().setFromObject(model);const currentHeight=box.max.y-box.min.y;
  if(currentHeight>0)model.scale.multiplyScalar(targetHeight/currentHeight);
  model.updateMatrixWorld(true);box=new THREE.Box3().setFromObject(model);
  // Setiap model berdiri tepat di tanah, meskipun origin file GLB berbeda.
  model.position.y-=box.min.y;
}
async function place(scene,key,{position,rotationY=0,height=5,name}){
  try{
    const model=(await sourceModel(key)).clone(true);model.name=name;model.position.fromArray(position);model.rotation.y=rotationY;fitToHeight(model,height);scene.add(model);return model;
  }catch(error){console.warn(`Gagal memuat ${key}: ${MODELS[key]}`,error);return null;}
}
function hideProceduralBuildings(scene){
  scene.traverse((node)=>{if(node.name?.startsWith('fallback_house_')||node.name==='fallback_clock_tower')node.visible=false;});
}

export async function loadVillageModels(scene){
  // Layout dikurasi: dua baris rumah rapi, tinggi seragam, semuanya menghadap jalan.
  // Tidak ada lagi kombinasi ukuran acak atau model procedural yang bercampur dengan GLB.
  const left=[[-8.5,0,7.5,.05],[-8.5,0,3.4,-.04],[-8.5,0,-.7,.03],[-8.5,0,-4.8,-.05],[-8.5,0,-8.9,.04],[-8.5,0,-13.0,-.04]];
  const right=[[8.5,0,7.5,-.05],[8.5,0,3.4,.04],[8.5,0,-.7,-.03],[8.5,0,-4.8,.05],[8.5,0,-8.9,-.04],[8.5,0,-13.0,.04]];
  const types=['houseA','houseB','houseC','houseA','houseB','houseC'];
  const jobs=[];
  left.forEach((item,i)=>jobs.push(place(scene,types[i],{position:item.slice(0,3),rotationY:-Math.PI/2+item[3],height:5.6,name:`village_house_left_${i}`})));
  right.forEach((item,i)=>jobs.push(place(scene,types[(i+1)%types.length],{position:item.slice(0,3),rotationY:Math.PI/2+item[3],height:5.6,name:`village_house_right_${i}`})));
  jobs.push(place(scene,'tower',{position:[0,0,-22],rotationY:0,height:12.5,name:'village_bell_tower'}));

  // Props memakai scale berdasarkan tinggi dunia juga agar proporsinya konsisten.
  jobs.push(place(scene,'barrel',{position:[2.7,0,2.4],rotationY:.2,height:.82,name:'village_barrel_a'}));
  jobs.push(place(scene,'barrel',{position:[3.25,0,2.35],rotationY:-.35,height:.7,name:'village_barrel_b'}));
  jobs.push(place(scene,'crate',{position:[2.9,0,1.65],rotationY:.2,height:.7,name:'village_crate'}));
  jobs.push(place(scene,'package',{position:[2.2,0,1.85],rotationY:.4,height:.42,name:'village_bag'}));
  jobs.push(place(scene,'cart',{position:[3.3,0,4.2],rotationY:.1,height:1.05,name:'village_cart'}));
  jobs.push(place(scene,'bench',{position:[-3.1,0,3.2],rotationY:.08,height:.78,name:'village_bench'}));
  jobs.push(place(scene,'market',{position:[-3.6,0,-2.2],rotationY:.2,height:2.8,name:'village_market'}));
  jobs.push(place(scene,'rocks',{position:[-5.3,0,-6.5],rotationY:.3,height:.7,name:'village_rocks_a'}));
  jobs.push(place(scene,'rocks',{position:[5.4,0,-10.2],rotationY:-.4,height:.55,name:'village_rocks_b'}));

  const loaded=await Promise.all(jobs);
  if(loaded.some(Boolean))hideProceduralBuildings(scene);
}
