import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Semua URL menunjuk ke file lokal di repository agar GitHub Pages/Streamlit tidak bergantung pada CDN model pihak ketiga.
const MODELS = {
  // Quaternius Medieval Village Pack, uploaded to the GitHub repository.
  houseA: 'assets/models/Fantasy%20House.glb',
  // Satu variasi rumah dulu; clone diberi rotasi/scale berbeda agar desa tetap bervariasi.
  houseB: 'assets/models/Fantasy%20House.glb',
  tower: 'assets/models/Bell%20Tower.glb',
  // Poly Haven Barrel 03, CC0, 1K glTF + PBR textures (sudah di-download ke repository).
  barrel: 'assets/models/barrel/barrel_03_1k.gltf',
  crate: 'assets/models/crate.glb',
  cart: 'assets/models/cart.glb',
  bench: 'assets/models/bench.glb',
  tree: 'assets/models/tree.glb',
  lantern: 'assets/models/lantern.glb',
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

async function place(scene, key, { position, rotationY = 0, scale = 1, name }) {
  try {
    const source = await getModel(key);
    const model = source.clone(true);
    model.name = name || `asset_${key}`;
    model.position.fromArray(position);
    model.rotation.y = rotationY;
    model.scale.setScalar(scale);
    scene.add(model);
    // Bila model 3D berhasil dimuat, sembunyikan bangunan procedural yang posisinya sama.
    if (name && name.startsWith('model_')) {
      const fallback = scene.getObjectByName(name.replace('model_', 'fallback_'));
      if (fallback) fallback.visible = false;
    }
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
  const housesLeft = [
  [-6.4, 0, 5.3, .12, 1.15],
  [-6.2, 0, 1.2, -.08, 1.03],
  [-6.3, 0, -2.9, .08, 1.22],
  [-6.1, 0, -7.1, -.1, .95]
];
  const housesRight = [
  [6.4, 0, 5.1, -.1, 1.12],
  [6.2, 0, 1.1, .11, .96],
  [6.3, 0, -3.1, -.12, 1.18],
  [6.1, 0, -7, .08, .9]
];
  // Model Quaternius memakai satuan kecil; scale 3 membuat tinggi rumah proporsional terhadap player.
  housesLeft.forEach((h, i) => jobs.push(place(scene, i % 2 ? 'houseB' : 'houseA', { position:[h[0],h[1],h[2]], rotationY:Math.PI / 2 + h[3], scale:h[4] * 1.6, name:`model_house_left_${i}` })));
  housesRight.forEach((h, i) => jobs.push(place(scene, i % 2 ? 'houseA' : 'houseB', { position:[h[0],h[1],h[2]], rotationY:-Math.PI / 2 + h[3], scale:h[4] * 1.6, name:`model_house_right_${i}` })));
  jobs.push(place(scene, 'tower', { position:[0,0,-20], scale:1.0, name:'model_clock_tower' }));
  jobs.push(place(scene, 'barrel', { position:[2.4,0,2.5], scale:.55 }));
  jobs.push(place(scene, 'barrel', { position:[2.9,0,2.55], scale:.48, rotationY:.5 }));
  jobs.push(place(scene, 'crate', { position:[2.55,0,2.0], scale:.48 }));
  // Package.glb adalah prop tas/bag; diletakkan di dekat peti dan gerobak.
  jobs.push(place(scene, 'package', { position:[2.15,.05,2.15], scale:.55, rotationY:.35, name:'model_leather_bag' }));
  jobs.push(place(scene, 'cart', { position:[2.65,.05,3.2], scale:.8, rotationY:.2 }));
  jobs.push(place(scene, 'bench', { position:[-2.5,0,3.1], scale:.75, rotationY:.1 }));
  jobs.push(place(scene, 'tree', { position:[-10,0,-4], scale:1.2 }));
  jobs.push(place(scene, 'tree', { position:[10,0,-5], scale:1.25 }));
  jobs.push(place(scene, 'lantern', { position:[-3.2,0,1.8], scale:.8 }));
  jobs.push(place(scene, 'lantern', { position:[3.2,0,-4.2], scale:.8 }));
  await Promise.all(jobs);
}
