import * as THREE from 'three';

// Jalan naik perlahan menuju hill/menara pada ujung desa.
export function roadHeight(z){return THREE.MathUtils.clamp((-z-3)*.16,0,3.6);}
export function terrainHeight(x,z){
  const roadInfluence=Math.exp(-(x*x)/13);
  const rolling=Math.sin(x*.34)*.34+Math.cos(z*.27)*.25+Math.sin((x+z)*.55)*.12;
  const smallDetail=Math.sin(x*1.3+z*.8)*.05;
  // Bukit tambahan di bawah Bell Tower: puncaknya berada dekat Z -22.
  const towerHill=2.8*Math.exp(-((x*x)/55+((z+34)*(z+34))/34));
  // Di tengah jalan tanah mengikuti elevasi jalan; pinggir desa tetap memiliki bukit kecil organik.
  return roadHeight(z)*roadInfluence+towerHill+(rolling+smallDetail)*(1-roadInfluence*.88);
}
