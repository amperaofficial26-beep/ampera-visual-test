import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { terrainHeight } from './terrain.js';
import { addSecondFloor } from './house_upgrade.js';

// Semua aset di bawah sudah berada di docs/assets/models/ pada repository GitHub.
const MODELS={
  houseA:'assets/models/Fantasy%20House.glb',
  houseB:'assets/models/Fantasy%20House-BH2XHWUNmF.glb',
  houseC:'assets/models/Fantasy%20House-dcPho4SUA3.glb',
  inn:'assets/models/Fantasy%20Inn.glb',
  blacksmith:'assets/models/Blacksmith.glb',
  sawmill:'assets/models/Fantasy%20Sawmill.glb',
  stable:'assets/models/Fantasy%20Stable.glb',
  barracks:'assets/models/Fantasy%20Barracks.glb',
  mill:'assets/models/Mill.glb',
  tower:'assets/models/Bell%20Tower.glb',
  barrel:'assets/models/Barrel.glb',
  crate:'assets/models/Crate.glb',
  cart:'assets/models/Cart.glb',
  bench:'assets/models/Bench.glb',
  market:'assets/models/Market%20Stand.glb',
  market2:'assets/models/Market%20Stand-DGIM5HGISb.glb',
  well:'assets/models/Well.glb',
  fence:'assets/models/Fence.glb',
  hay:'assets/models/Hay.glb',
  bags:'assets/models/Bags.glb',
  bonfire:'assets/models/Bonfire.glb',
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
async function place(scene,key,{position,rotationY=0,height=5,name,upgrade=false}){
  try{
    const model=(await sourceModel(key)).clone(true);model.name=name;model.position.fromArray(position);model.rotation.y=rotationY;fitToHeight(model,height);model.position.y+=terrainHeight(position[0],position[2]);scene.add(model);
    if(upgrade) addSecondFloor(scene,model);
    return model;
  }catch(error){console.warn(`Gagal memuat ${key}: ${MODELS[key]}`,error);return null;}
}
function upgradeSquareFacade(scene,model,side){
  // Upgrade arsitektur untuk model house yang memiliki dinding datar: jendela, balok kayu dan balkon menghadap jalan.
  const box=new THREE.Box3().setFromObject(model),center=box.getCenter(new THREE.Vector3());
  const height=box.max.y-box.min.y,frontX=side==='left'?box.max.x+.035:box.min.x-.035;
  const wood=new THREE.MeshStandardMaterial({color:0x35251c,roughness:.82});
  const glass=new THREE.MeshStandardMaterial({color:0x82b9c8,roughness:.25,metalness:.08,emissive:0x102d41,emissiveIntensity:.18});
  const direction=side==='left'?1:-1;
  const detail=new THREE.Group();detail.name=`facade_upgrade_${model.name}`;
  // Frame vertikal/horizontal bergaya Tudor pada dinding datar.
  for(const z of[-1.0,0,1.0]){const beam=new THREE.Mesh(new THREE.BoxGeometry(.12,height*.68,.12),wood);beam.position.set(frontX,box.min.y+height*.53,center.z+z);detail.add(beam);}
  for(const y of[box.min.y+height*.35,box.min.y+height*.65]){const beam=new THREE.Mesh(new THREE.BoxGeometry(.12,.1,2.45),wood);beam.position.set(frontX,y,center.z);detail.add(beam);}
  // Dua jendela dan balkon kecil menghadap street.
  for(const z of[-.56,.56]){const frame=new THREE.Mesh(new THREE.BoxGeometry(.09,.68,.52),wood);frame.position.set(frontX,box.min.y+height*.61,center.z+z);detail.add(frame);const win=new THREE.Mesh(new THREE.PlaneGeometry(.39,.53),glass);win.position.set(frontX+direction*.052,box.min.y+height*.61,center.z+z);win.rotation.y=Math.PI/2;detail.add(win);}
  const balcony=new THREE.Mesh(new THREE.BoxGeometry(.58,.12,1.65),wood);balcony.position.set(frontX+direction*.28,box.min.y+height*.35,center.z);detail.add(balcony);
  scene.add(detail);
}
function hideProceduralBuildings(scene){
  scene.traverse((node)=>{if(node.name?.startsWith('fallback_house_')||node.name==='fallback_clock_tower')node.visible=false;});
}

export async function loadVillageModels(scene){
  // Enam rumah tiap sisi dengan jarak 6 unit: cukup jauh agar roof, balkon, dan shadow tidak saling menembus.
  const left=[[-12,0,10,.04],[-12,0,4,-.03],[-12,0,-2,.03],[-12,0,-8,-.04],[-12,0,-14,.03],[-12,0,-20,-.03]];
  const right=[[12,0,10,-.04],[12,0,4,.03],[12,0,-2,-.03],[12,0,-8,.04],[12,0,-14,-.03],[12,0,-20,.03]];
  const types=['houseA','houseB','houseC','houseA','houseB','houseC'];
  const jobs=[];
  // Tinggi 5.2 masih besar dibanding player, tetapi aman untuk layout desa yang padat.
  // Semua variasi houseA di sisi kiri (3 rumah) mendapat lantai kedua agar tampak sebagai bangunan besar satu gaya.
  // HouseA adalah bangunan kotak dua lantai; rumah variasi lain dibesarkan agar terlihat sebagai rumah utama desa.
  left.forEach((item,i)=>jobs.push(place(scene,types[i],{position:item.slice(0,3),rotationY:-Math.PI/2+item[3],height:types[i]==='houseA'?5.2:6.3,name:`village_house_left_${i}`,upgrade:types[i]==='houseA'})));
  right.forEach((item,i)=>{const key=types[(i+1)%types.length];jobs.push(place(scene,key,{position:item.slice(0,3),rotationY:Math.PI/2+item[3],height:key==='houseA'?5.2:6.3,name:`village_house_right_${i}`}));});

  // Distrik luar kota: bangunan lebih kecil, jaraknya longgar, mengisi pinggir map tanpa menutup jalan pusat.
  const outerZ=[13,7,1,-5,-11,-17,-23];
  outerZ.forEach((z,i)=>{
    const leftKey=types[(i+1)%types.length],rightKey=types[(i+2)%types.length];
    jobs.push(place(scene,leftKey,{position:[-30,0,z],rotationY:-Math.PI/2+.06,height:4.75,name:`outer_house_left_${i}`}));
    jobs.push(place(scene,rightKey,{position:[30,0,z],rotationY:Math.PI/2-.06,height:4.75,name:`outer_house_right_${i}`}));
  });
  // Bangunan belakang membentuk gerbang kota menuju jalur menara.
  const backRow=[[-18,-31,.08],[-9,-31,-.05],[9,-31,.05],[18,-31,-.08]];
  backRow.forEach(([x,z,rot],i)=>jobs.push(place(scene,types[i%types.length],{position:[x,0,z],rotationY:rot,height:4.9,name:`outer_house_back_${i}`})));

  // Landmark utama dan gedung tinggi kota.
  jobs.push(place(scene,'tower',{position:[0,0,-34],rotationY:0,height:12.5,name:'village_bell_tower'}));
  jobs.push(place(scene,'tower',{position:[-39,0,13],rotationY:.1,height:9.5,name:'city_watchtower_west'}));
  jobs.push(place(scene,'tower',{position:[39,0,13],rotationY:-.1,height:9.5,name:'city_watchtower_east'}));
  jobs.push(place(scene,'mill',{position:[25,0,-25],rotationY:.25,height:10.5,name:'city_mill'}));
  jobs.push(place(scene,'barracks',{position:[-25,0,-25],rotationY:-.2,height:8.5,name:'city_barracks'}));

  // Bangunan publik di pinggir street: membuat desa terasa ramai tanpa menutup jalur utama.
  jobs.push(place(scene,'inn',{position:[-21,0,2],rotationY:-Math.PI/2,height:6.8,name:'village_inn'}));
  jobs.push(place(scene,'blacksmith',{position:[21,0,-1],rotationY:Math.PI/2,height:6.1,name:'village_blacksmith'}));
  jobs.push(place(scene,'sawmill',{position:[-21,0,-13],rotationY:-Math.PI/2,height:5.6,name:'village_sawmill'}));
  jobs.push(place(scene,'stable',{position:[21,0,-14],rotationY:Math.PI/2,height:5.5,name:'village_stable'}));

  // Props ditempatkan di tepi jalan dan depan bangunan, bukan di tengah cobblestone.
  // Area sisi kiri depan: sumur kecil dan pasar.
  jobs.push(place(scene,'well',{position:[-5.6,0,1.8],rotationY:0,height:1.65,name:'village_well'}));
  jobs.push(place(scene,'market',{position:[-6.7,0,-1.0],rotationY:.2,height:3.65,name:'village_market_a'}));
  jobs.push(place(scene,'market2',{position:[-6.1,0,4.7],rotationY:-.15,height:3.45,name:'village_market_b'}));
  jobs.push(place(scene,'bench',{position:[-4.7,0,3.4],rotationY:.08,height:1.05,name:'village_bench_a'}));
  jobs.push(place(scene,'bench',{position:[4.9,0,-6.8],rotationY:Math.PI,height:1.0,name:'village_bench_b'}));

  // Area sisi kanan: gerobak dan barang dagangan, semua berada di bahu jalan.
  jobs.push(place(scene,'cart',{position:[6.2,0,4.5],rotationY:-.18,height:1.55,name:'village_cart'}));
  jobs.push(place(scene,'barrel',{position:[5.3,0,3.6],rotationY:.2,height:1.15,name:'village_barrel_a'}));
  jobs.push(place(scene,'barrel',{position:[5.9,0,3.45],rotationY:-.35,height:1.0,name:'village_barrel_b'}));
  jobs.push(place(scene,'barrel',{position:[6.4,0,3.8],rotationY:.1,height:.92,name:'village_barrel_c'}));
  jobs.push(place(scene,'crate',{position:[5.55,0,2.55],rotationY:.2,height:1.05,name:'village_crate_a'}));
  jobs.push(place(scene,'crate',{position:[6.5,0,2.6],rotationY:-.1,height:.9,name:'village_crate_b'}));
  jobs.push(place(scene,'package',{position:[5.0,0,2.35],rotationY:.4,height:.65,name:'village_bag'}));

  // Area kerja di dekat stable/sawmill.
  jobs.push(place(scene,'hay',{position:[17.5,0,-12.2],rotationY:.3,height:1.05,name:'village_hay_a'}));
  jobs.push(place(scene,'hay',{position:[18.7,0,-11.8],rotationY:-.2,height:.9,name:'village_hay_b'}));
  jobs.push(place(scene,'bags',{position:[-17.5,0,-11.7],rotationY:-.2,height:1.0,name:'village_bags'}));
  jobs.push(place(scene,'bonfire',{position:[-5.6,0,-4.2],rotationY:0,height:1.0,name:'village_bonfire'}));
  jobs.push(place(scene,'rocks',{position:[-7.3,0,-7.5],rotationY:.3,height:1.0,name:'village_rocks_a'}));
  jobs.push(place(scene,'rocks',{position:[7.2,0,-10.2],rotationY:-.4,height:.85,name:'village_rocks_b'}));
  for(let i=0;i<6;i++)jobs.push(place(scene,'fence',{position:[-8.3+i*1.1,0,7.9],rotationY:0,height:1.0,name:`village_fence_${i}`}));

  const loaded=await Promise.all(jobs);
  if(loaded.some(Boolean))hideProceduralBuildings(scene);
}
