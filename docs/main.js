import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { buildWorld } from './game/world.js';
import { Player } from './game/player.js';
import { ForestMonster } from './game/monster.js';
import { loadVillageModels } from './game/model_loader.js';

const canvas=document.querySelector('#game');
const scene=new THREE.Scene();
// Kamera awal lebih tinggi/jauh agar desa terlihat, bukan hanya atap rumah.
const camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,.1,100);camera.position.set(7,6.5,11);
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;renderer.outputColorSpace=THREE.SRGBColorSpace;
buildWorld(scene);
// Model GLB lokal akan mengganti fallback procedural secara otomatis bila sudah di-upload.
loadVillageModels(scene);
const player=new Player(scene),monster=new ForestMonster(scene);const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.08;controls.minDistance=4.5;controls.maxDistance=16;controls.maxPolarAngle=Math.PI*.46;controls.target.copy(player.group.position).add(new THREE.Vector3(0,1,0));
const keys={};addEventListener('keydown',e=>{keys[e.code]=true;});addEventListener('keyup',e=>{keys[e.code]=false;});addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
const clock=new THREE.Clock();
const orbitOffset=new THREE.Vector3();
const defaultCameraOffset=new THREE.Vector3(7,6.5,11);
function resetCamera(){
  const target=player.group.position.clone().add(new THREE.Vector3(0,1,0));
  controls.target.copy(target);camera.position.copy(target).add(defaultCameraOffset);controls.update();
}
addEventListener('keydown',(event)=>{if(event.code==='KeyR')resetCamera();});
function loop(){
  const dt=Math.min(clock.getDelta(),.05);player.update(dt,keys,camera);monster.update(dt,player);
  const nextTarget=player.group.position.clone().add(new THREE.Vector3(0,1,0));
  orbitOffset.copy(camera.position).sub(controls.target);
  // Jika kamera terseret terlalu dekat/aneh, pulihkan offset kamera yang stabil.
  if(orbitOffset.length()<3||orbitOffset.y<1.5)orbitOffset.copy(defaultCameraOffset);
  camera.position.lerp(nextTarget.clone().add(orbitOffset),.14);controls.target.lerp(nextTarget,.14);
  const distance=player.group.position.distanceTo(monster.group.position);
  document.querySelector('#monster-status').textContent=distance<5?'⚠ Monster hutan memperhatikanmu':'👾 Monster hutan terlihat di kejauhan';
  document.querySelector('#place').textContent=player.group.position.z<-5?'Tepi sungai':'Desa Medieval Ampera';
  controls.update();renderer.render(scene,camera);requestAnimationFrame(loop);
}
resetCamera();loop();
