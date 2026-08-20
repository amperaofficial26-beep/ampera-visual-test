import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Semua URL menunjuk ke file lokal di repository agar GitHub Pages/Streamlit tidak bergantung pada CDN model pihak ketiga.
const MODELS = {
  // Quaternius Medieval Village Pack, di-upload ke GitHub repository.
  houseA: 'assets/models/Fantasy%20House.glb',
  houseB: 'assets/models/Fantasy%20House-BH2XHWUNmF.glb',
  houseC: 'assets/models/Fantasy%20House-dcPho4SUA3.glb',
  inn: 'assets/models/Fantasy%20Inn.glb',
  blacksmith: 'assets/models/Blacksmith.glb',
  tower: 'assets/models/Bell%20Tower.glb',
  barrel: 'assets/models/Barrel.glb',
  crate: 'assets/models/Crate.glb',
  cart: 'assets/models/Cart.glb',
  bench: 'assets/models/Bench.glb',
  rocks: 'assets/models/Rocks.glb',
  market: 'assets/models/Market%20Stand.glb',
  // Model yang sudah di-upload ke GitHub: mesh bernama Package_2, material Bag/Leather.
  package: 'assets/models/Package.glb',
};
const loader = new GLTFLoader();
const cache = new Map();

async function getModel(key) {
  if (!cache.has(key)) {
    cache.set(key, loader.loadAsync(MODELS[key]).then((gltf) => {
      const root = gltf.scene;
      root.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
          // Material dari file glTF dipertahankan sebagai PBR material asli.
          if (node.material) node.material.needsUpdate = true;
        }
      });
      return root;
    }));
  }
  return cache.get(key);
}

async function place(scene, key, { position, rotationY = 0, scale = 1, name, fallbackName = null }) {
  try {
    const source = await getModel(key);
    const model = source.clone(true);
    model.name = name || `asset_${key}`;
    model.position.fromArray(position);
    model.rotation.y = rotationY;
    model.scale.setScalar(scale);
    scene.add(model);
    // Bila model 3D berhasil dimuat, sembunyikan bangunan procedural yang posisinya sama.
    const fallback = scene.getObjectByName(fallbackName || (name && name.startsWith('model_') ? name.replace('model_', 'fallback_') : ''));
    if (fallback) fallback.visible = false;
    return model;
  } catch (error) {
    // Fallback primitive tetap tampil apabila user belum meng-upload aset GLB tertentu.
    console.warn(`Model '${key}' belum tersedia di ${MODELS[key]}`, error);
    return null;
  }
}

// Posisi mengikuti layout street yang sudah ada; angka scale mungkin perlu disesuaikan sekali setelah model di-download.
export async function loadVillageModels(scene) {
  const jobs = [];
  // Desa lebih padat: rumah dibesarkan dan dipindahkan lebih jauh dari jalan utama.
  // Front rumah dirotasi MENGHADAP jalan: kiri → +X, kanan → -X.
  const housesLeft = [[-8.7,0,7,.08,1.55],[-8.3,0,3.4,-.07,1.7],[-8.8,0,-.4,.05,1.62],[-8.4,0,-4.3,-.08,1.78],[-8.7,0,-8.1,.06,1.58],[-8.3,0,-11.8,-.06,1.7]];
  const housesRight = [[8.7,0,6.8,-.08,1.62],[8.4,0,3.0,.05,1.72],[8.8,0,-.7,-.05,1.58],[8.35,0,-4.5,.08,1.76],[8.7,0,-8.2,-.07,1.64],[8.3,0,-11.9,.06,1.7]];
  const leftTypes=['houseA','houseB','inn','blacksmith','houseC','houseA'];
  const rightTypes=['houseC','houseA','houseB','inn','blacksmith','houseB'];
  housesLeft.forEach((h, i) => jobs.push(place(scene, leftTypes[i], { position:[h[0],h[1],h[2]], rotationY:-Math.PI / 2 + h[3], scale:h[4], name:`model_house_left_${i}`, fallbackName:i<4?`fallback_house_left_${i}`:null })));
  housesRight.forEach((h, i) => jobs.push(place(scene, rightTypes[i], { position:[h[0],h[1],h[2]], rotationY:Math.PI / 2 + h[3], scale:h[4], name:`model_house_right_${i}`, fallbackName:i<4?`fallback_house_right_${i}`:null })));
  // Parameter fallbackName memastikan hanya Bell Tower GLB yang terlihat, bukan dua tower sekaligus.
  jobs.push(place(scene, 'tower', { position:[0,0,-23], scale:1.15, name:'model_clock_tower', fallbackName:'fallback_clock_tower' }));
  // Props GLB menggantikan dekorasi utama dekat jalan.
  jobs.push(place(scene, 'barrel', { position:[2.4,0,2.5], scale:.62 }));
  jobs.push(place(scene, 'barrel', { position:[2.9,0,2.55], scale:.55, rotationY:.5 }));
  jobs.push(place(scene, 'crate', { position:[2.55,0,2.0], scale:.56 }));
  jobs.push(place(scene, 'package', { position:[2.15,.05,2.15], scale:.55, rotationY:.35, name:'model_leather_bag' }));
  jobs.push(place(scene, 'cart', { position:[2.65,.05,3.2], scale:.85, rotationY:.2 }));
  jobs.push(place(scene, 'bench', { position:[-2.5,0,3.1], scale:.85, rotationY:.1 }));
  jobs.push(place(scene, 'market', { position:[-3.2,0,-2.0], scale:1.0, rotationY:.25 }));
  jobs.push(place(scene, 'rocks', { position:[-4.2,0,-4.7], scale:.85 }));
  jobs.push(place(scene, 'rocks', { position:[4.4,0,-6.4], scale:.65, rotationY:.5 }));
  await Promise.all(jobs);
}
