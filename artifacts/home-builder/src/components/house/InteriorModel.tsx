import * as THREE from "three";
import type { HouseAnswers } from "@/types";

const SIZE_PARAMS: Record<string,{ w:number; d:number; floorH:number }> = {
  tiny:    { w:9,   d:7,   floorH:3.0 },
  compact: { w:11,  d:8,   floorH:3.1 },
  medium:  { w:13,  d:9.5, floorH:3.2 },
  large:   { w:16,  d:11,  floorH:3.3 },
  villa:   { w:20,  d:14,  floorH:3.4 },
};

const STYLE: Record<string,{ wall:string; floor:string; ceiling:string; accent:string; rug:string; art1:string; art2:string }> = {
  minimal:       { wall:"#f5f4f0", floor:"#c8b890", ceiling:"#ffffff", accent:"#e8e0d0", rug:"#b8a888", art1:"#c8d8e8", art2:"#9a9898" },
  modern:        { wall:"#f0eff0", floor:"#8a7868", ceiling:"#fafafa", accent:"#d0d8e0", rug:"#7a8090", art1:"#88a0b8", art2:"#d0c8a8" },
  hitech:        { wall:"#2a3040", floor:"#202428", ceiling:"#1a1e28", accent:"#303848", rug:"#1a2030", art1:"#3060a8", art2:"#182030" },
  scandinavian:  { wall:"#f8f6f0", floor:"#d4b880", ceiling:"#ffffff", accent:"#e8e0c8", rug:"#c8a878", art1:"#b0c8d8", art2:"#d8c8a8" },
  classic:       { wall:"#f5efe4", floor:"#b09070", ceiling:"#f8f4ec", accent:"#e0d0b8", rug:"#b09870", art1:"#c0a858", art2:"#8a7040" },
  chalet:        { wall:"#c8a870", floor:"#7a5830", ceiling:"#b89060", accent:"#d0a868", rug:"#8a6030", art1:"#c89040", art2:"#6a4820" },
  japanese:      { wall:"#f0ece0", floor:"#9a7848", ceiling:"#f5f0e4", accent:"#ddd0b0", rug:"#c8b880", art1:"#688858", art2:"#e8e0c8" },
  mediterranean: { wall:"#f8f0e0", floor:"#b09070", ceiling:"#faf5ec", accent:"#e8d8c0", rug:"#c89060", art1:"#e8a850", art2:"#2070b8" },
  loft:          { wall:"#908888", floor:"#484440", ceiling:"#7a7470", accent:"#706868", rug:"#2a2828", art1:"#c04020", art2:"#404040" },
  eco:           { wall:"#dce8c8", floor:"#9ab070", ceiling:"#e8f0d8", accent:"#c8d8a8", rug:"#8aa060", art1:"#508040", art2:"#b8d898" },
};

// ── Furniture components ──────────────────────────────────

function Sofa({ x=0,y=0,z=0,w=2.4,d=0.9,color="#6a7080" }:{x?:number;y?:number;z?:number;w?:number;d?:number;color?:string}) {
  return (
    <group position={[x,y,z]}>
      <mesh castShadow receiveShadow position={[0,.22,0]}><boxGeometry args={[w,.42,d]} /><meshStandardMaterial color={color} roughness={.72} /></mesh>
      <mesh castShadow position={[0,.56,-d/2+.12]}><boxGeometry args={[w,.52,.2]} /><meshStandardMaterial color={color} roughness={.68} /></mesh>
      {[-w/2+.15,w/2-.15].map((lx,i)=>(
        <mesh key={i} castShadow position={[lx,.42,-d/2+.12]}><boxGeometry args={[.18,.38,.18]} /><meshStandardMaterial color={color} roughness={.68} /></mesh>
      ))}
      {/* Cushions */}
      {[-w/2+w/4,w/2-w/4].map((cx,i)=>(
        <mesh key={i} castShadow position={[cx,.46,-d/2+.25]}><boxGeometry args={[w*.42,.25,.38]} /><meshStandardMaterial color={color} roughness={.55} /></mesh>
      ))}
    </group>
  );
}

function Bed({ x=0,y=0,z=0,w=1.8,d=2.1,color="#e0d4c0",pillowColor="#f0e8e0" }:{x?:number;y?:number;z?:number;w?:number;d?:number;color?:string;pillowColor?:string}) {
  return (
    <group position={[x,y,z]}>
      <mesh castShadow receiveShadow position={[0,.14,0]}><boxGeometry args={[w,.28,d]} /><meshStandardMaterial color={color} roughness={.82} /></mesh>
      <mesh castShadow position={[0,.36,-d/2+.38]}><boxGeometry args={[w-.1,.22,d-.55]} /><meshStandardMaterial color="#e8e0d0" roughness={.7} /></mesh>
      <mesh castShadow position={[0,.5,-d/2+.25]}><boxGeometry args={[w,.55,.24]} /><meshStandardMaterial color={color} roughness={.7} /></mesh>
      {[-w/2+.35,w/2-.35].map((lx,i)=>(
        <mesh key={i} castShadow position={[lx,.62,-d/2+.45]}><boxGeometry args={[.55,.2,.45]} /><meshStandardMaterial color={pillowColor} roughness={.6} /></mesh>
      ))}
      {/* Bedside tables */}
      {[-w/2-.3,w/2+.3].map((lx,i)=>(
        <group key={i} position={[lx,0,-d/2+.55]}>
          <mesh castShadow receiveShadow position={[0,.3,0]}><boxGeometry args={[.45,.6,.38]} /><meshStandardMaterial color="#8a6a40" roughness={.7} /></mesh>
          <mesh castShadow position={[0,.62,0]}><boxGeometry args={[.48,.04,.41]} /><meshStandardMaterial color="#9a7a50" roughness={.55} metalness={.08} /></mesh>
          {/* Lamp on table */}
          <mesh castShadow position={[0,.82,0]}><cylinderGeometry args={[.1,.06,.12,6]} /><meshStandardMaterial color="#d0c8a8" roughness={.7} /></mesh>
          <mesh castShadow position={[0,.96,0]}><coneGeometry args={[.16,.22,6]} /><meshStandardMaterial color="#e8d8b0" emissive="#fff8c0" emissiveIntensity={.4} roughness={.7} /></mesh>
          <pointLight position={[0,1.05,0]} intensity={.8} color="#fff4c0" distance={3.5} />
        </group>
      ))}
    </group>
  );
}

function Table({ x=0,y=0,z=0,w=1.2,d=0.7,h=0.75,color="#9a8060" }:{x?:number;y?:number;z?:number;w?:number;d?:number;h?:number;color?:string}) {
  return (
    <group position={[x,y,z]}>
      <mesh castShadow receiveShadow position={[0,h-.03,0]}><boxGeometry args={[w,.05,d]} /><meshStandardMaterial color={color} roughness={.55} metalness={.08} /></mesh>
      {[[-w/2+.07,0,-d/2+.07],[w/2-.07,0,-d/2+.07],[-w/2+.07,0,d/2-.07],[w/2-.07,0,d/2-.07]].map(([lx,,lz],i)=>(
        <mesh key={i} castShadow position={[lx,h/2-.03,lz]}><boxGeometry args={[.05,h,.05]} /><meshStandardMaterial color={color} roughness={.65} /></mesh>
      ))}
    </group>
  );
}

function KitchenCounter({ x=0,y=0,z=0,w=3.5,color="#d0ccc4" }:{x?:number;y?:number;z?:number;w?:number;color?:string}) {
  return (
    <group position={[x,y,z]}>
      <mesh castShadow receiveShadow position={[0,.46,0]}><boxGeometry args={[w,.9,.65]} /><meshStandardMaterial color={color} roughness={.5} metalness={.1} /></mesh>
      <mesh castShadow position={[0,.94,.04]}><boxGeometry args={[w,.04,.62]} /><meshStandardMaterial color="#e0ddd8" roughness={.22} metalness={.35} /></mesh>
      <mesh castShadow position={[0,.68,.345]}><boxGeometry args={[w,.55,.04]} /><meshStandardMaterial color={color} roughness={.5} /></mesh>
      <mesh castShadow position={[0,1.45,.32]}><boxGeometry args={[w,.75,.35]} /><meshStandardMaterial color={color} roughness={.5} /></mesh>
      {/* Handle row on cabinets */}
      {Array.from({length:Math.floor(w/.9)},(_,i)=>(
        <mesh key={i} castShadow position={[-w/2+.45+i*.9,.68,.37]}><boxGeometry args={[.28,.02,.04]} /><meshStandardMaterial color="#909090" roughness={.2} metalness={.75} /></mesh>
      ))}
    </group>
  );
}

function KitchenIsland({ x=0,y=0,z=0,w=1.5,color="#d0ccc4" }:{x?:number;y?:number;z?:number;w?:number;color?:string}) {
  return (
    <group position={[x,y,z]}>
      <mesh castShadow receiveShadow position={[0,.46,0]}><boxGeometry args={[w,.9,.85]} /><meshStandardMaterial color={color} roughness={.5} metalness={.1} /></mesh>
      <mesh castShadow position={[0,.95,0]}><boxGeometry args={[w+.06,.05,.9]} /><meshStandardMaterial color="#e0e0d8" roughness={.2} metalness={.35} /></mesh>
      {/* Bar stools */}
      {[-w/2+.2, w/2-.2].map((lx,i)=>(
        <group key={i} position={[lx,0,.7]}>
          <mesh castShadow position={[0,.55,0]}><cylinderGeometry args={[.14,.14,1.08,6]} /><meshStandardMaterial color="#3a3a38" roughness={.35} metalness={.6} /></mesh>
          <mesh castShadow position={[0,1.15,0]}><cylinderGeometry args={[.2,.2,.05,8]} /><meshStandardMaterial color="#c0a870" roughness={.7} /></mesh>
        </group>
      ))}
    </group>
  );
}

function TVWallUnit({ x=0,y=0,z=0,w=2.5,fh=3.0 }:{x?:number;y?:number;z?:number;w?:number;fh?:number}) {
  return (
    <group position={[x,y,z]}>
      {/* TV panel */}
      <mesh castShadow position={[0,fh*.48,.02]}><boxGeometry args={[w*.88,fh*.36,.06]} /><meshStandardMaterial color="#080808" roughness={.08} metalness={.55} /></mesh>
      {/* Screen glow */}
      <mesh position={[0,fh*.48,.06]}><boxGeometry args={[w*.84,fh*.32,.01]} /><meshStandardMaterial color="#080808" emissive="#1020a0" emissiveIntensity={.22} roughness={.1} /></mesh>
      {/* TV stand/credenza */}
      <mesh castShadow receiveShadow position={[0,fh*.12,-.04]}><boxGeometry args={[w,.22,.52]} /><meshStandardMaterial color="#2a2a28" roughness={.6} metalness={.18} /></mesh>
    </group>
  );
}

function Bathtub({ x=0,y=0,z=0 }:{x?:number;y?:number;z?:number}) {
  return (
    <group position={[x,y,z]}>
      <mesh castShadow receiveShadow position={[0,.22,0]}><boxGeometry args={[.78,.42,1.6]} /><meshStandardMaterial color="#f0ece8" roughness={.28} metalness={.04} /></mesh>
      <mesh position={[0,.25,0]}><boxGeometry args={[.58,.28,1.38]} /><meshStandardMaterial color="#c8e4f0" roughness={.04} transparent opacity={.55} envMapIntensity={2} /></mesh>
      {/* Faucet */}
      <mesh castShadow position={[0,.46,.72]}><boxGeometry args={[.06,.15,.06]} /><meshStandardMaterial color="#d0d0d0" roughness={.12} metalness={.9} /></mesh>
    </group>
  );
}

function Toilet({ x=0,y=0,z=0 }:{x?:number;y?:number;z?:number}) {
  return (
    <group position={[x,y,z]}>
      <mesh castShadow position={[0,.2,0]}><cylinderGeometry args={[.2,.22,.4,8]} /><meshStandardMaterial color="#f0ece8" roughness={.3} /></mesh>
      <mesh castShadow position={[0,.03,-.28]}><boxGeometry args={[.38,.14,.28]} /><meshStandardMaterial color="#f0ece8" roughness={.3} /></mesh>
    </group>
  );
}

function Desk({ x=0,y=0,z=0,w=1.6,color="#b08060" }:{x?:number;y?:number;z?:number;w?:number;color?:string}) {
  return (
    <group position={[x,y,z]}>
      <mesh castShadow receiveShadow position={[0,.74,0]}><boxGeometry args={[w,.05,.7]} /><meshStandardMaterial color={color} roughness={.55} metalness={.06} /></mesh>
      {[-w/2+.05,w/2-.05].map((lx,i)=>(
        <mesh key={i} castShadow position={[lx,.37,0]}><boxGeometry args={[.05,.74,.65]} /><meshStandardMaterial color={color} roughness={.65} /></mesh>
      ))}
      {/* Monitor */}
      <mesh castShadow position={[0,.95,.04]}><boxGeometry args={[.52,.32,.04]} /><meshStandardMaterial color="#1a1a18" roughness={.18} metalness={.45} /></mesh>
      <mesh castShadow position={[0,.79,.04]}><boxGeometry args={[.04,.18,.06]} /><meshStandardMaterial color="#2a2a28" roughness={.3} metalness={.5} /></mesh>
    </group>
  );
}

function Bookshelf({ x=0,y=0,z=0,w=0.9,h=2.0,d=0.3,color="#a08060" }:{x?:number;y?:number;z?:number;w?:number;h?:number;d?:number;color?:string}) {
  return (
    <group position={[x,y,z]}>
      <mesh castShadow receiveShadow position={[0,h/2,0]}><boxGeometry args={[w,h,d]} /><meshStandardMaterial color={color} roughness={.7} metalness={.05} /></mesh>
      {[.4,.8,1.2,1.6].map((hy,i)=>(
        <mesh key={i} castShadow position={[0,hy,d/2-.01]}><boxGeometry args={[w-.05,.04,.02]} /><meshStandardMaterial color={color} roughness={.7} /></mesh>
      ))}
      {/* Books */}
      {[.6,1.0,1.45,1.8].map((hy,i)=>(
        <mesh key={i} castShadow position={[-w/2+.12+i*.12,hy,d/2+.02]}><boxGeometry args={[.1,.22,.06]} /><meshStandardMaterial color={["#c04030","#3060a0","#408030","#9050a0"][i]} roughness={.8} /></mesh>
      ))}
    </group>
  );
}

// ── Decorative components ─────────────────────────────────

function Rug({ x=0,y=0,z=0,w=2.8,d=2.2,color="#8a7060" }:{x?:number;y?:number;z?:number;w?:number;d?:number;color?:string}) {
  return (
    <group position={[x,y+.012,z]}>
      <mesh receiveShadow><boxGeometry args={[w,.025,d]} /><meshStandardMaterial color={color} roughness={.97} /></mesh>
      {/* Border */}
      <mesh receiveShadow position={[0,.013,0]}><boxGeometry args={[w,.025,d-.22]} /><meshStandardMaterial color={color} roughness={.97} transparent opacity={.55} /></mesh>
    </group>
  );
}

function WallArt({ x,y,z,w=0.95,h=0.72,rot=[0,0,0],c1="#c8d8e8",c2="#8a9898" }:{x:number;y:number;z:number;w?:number;h?:number;rot?:[number,number,number];c1?:string;c2?:string}) {
  return (
    <group position={[x,y,z]} rotation={rot}>
      <mesh castShadow><boxGeometry args={[w+.1,h+.1,.045]} /><meshStandardMaterial color="#3a2a18" roughness={.6} metalness={.14} /></mesh>
      <mesh position={[0,0,.025]}><planeGeometry args={[w,h]} /><meshStandardMaterial color={c1} roughness={.9} /></mesh>
      <mesh position={[-w*.18,h*.08,.028]}><planeGeometry args={[w*.42,h*.55]} /><meshStandardMaterial color={c2} roughness={.9} /></mesh>
      <mesh position={[w*.2,-h*.12,.028]}><planeGeometry args={[w*.28,h*.3]} /><meshStandardMaterial color={c1} roughness={.9} /></mesh>
    </group>
  );
}

function IndoorPlant({ x,y=0,z,s=1 }:{x:number;y?:number;z:number;s?:number}) {
  return (
    <group position={[x,y,z]} scale={[s,s,s]}>
      <mesh castShadow receiveShadow position={[0,.2,0]}><cylinderGeometry args={[.22,.16,.38,8]} /><meshStandardMaterial color="#b89070" roughness={.65} metalness={.05} /></mesh>
      <mesh castShadow position={[0,.7,0]}><sphereGeometry args={[.36,7,6]} /><meshStandardMaterial color="#3a7820" roughness={.9} /></mesh>
      <mesh castShadow position={[.2,.86,.1]}><sphereGeometry args={[.27,6,5]} /><meshStandardMaterial color="#428a28" roughness={.9} /></mesh>
      <mesh castShadow position={[-.18,.82,-.08]}><sphereGeometry args={[.24,6,5]} /><meshStandardMaterial color="#347020" roughness={.9} /></mesh>
    </group>
  );
}

function PendantLight({ x=0,cy,z=0 }:{x?:number;cy:number;z?:number}) {
  return (
    <group>
      <mesh position={[x,cy-.14,z]}><cylinderGeometry args={[.012,.012,.28,4]} /><meshStandardMaterial color="#2a2a28" roughness={.45} metalness={.68} /></mesh>
      <mesh castShadow position={[x,cy-.4,z]}><cylinderGeometry args={[.22,.14,.22,8]} /><meshStandardMaterial color="#1a1a18" roughness={.38} metalness={.52} /></mesh>
      <mesh position={[x,cy-.36,z]}><sphereGeometry args={[.07,6,5]} /><meshStandardMaterial color="#fff8d0" emissive="#fff8b0" emissiveIntensity={3.5} roughness={.15} /></mesh>
      <pointLight position={[x,cy-.42,z]} intensity={2.8} color="#fff4c8" distance={9} />
    </group>
  );
}

function LightFixture({ x=0,cy,z=0 }:{x?:number;cy:number;z?:number}) {
  return (
    <group position={[x,cy,z]}>
      <mesh><cylinderGeometry args={[.32,.24,.12,8]} /><meshStandardMaterial color="#e8e0d0" roughness={.38} metalness={.3} emissive="#fff8d0" emissiveIntensity={.55} /></mesh>
      <mesh position={[0,-.06,0]}><cylinderGeometry args={[0,.18,.08,8]} /><meshStandardMaterial color="#fffff0" emissive="#fff8c0" emissiveIntensity={2.2} roughness={.1} /></mesh>
    </group>
  );
}

function Staircase({ x=0,y=0,z=0,steps=12,w=1.1,floorH=3.2 }:{x?:number;y?:number;z?:number;steps?:number;w?:number;floorH?:number}) {
  const sh=floorH/steps, sd=(floorH*.7)/steps;
  return (
    <group position={[x,y,z]}>
      {Array.from({length:steps},(_,i)=>(
        <mesh key={i} castShadow receiveShadow position={[0,i*sh+sh/2,-i*sd]}>
          <boxGeometry args={[w,sh,sd+.04]} /><meshStandardMaterial color="#c8b898" roughness={.7} metalness={.05} />
        </mesh>
      ))}
      {/* Railing */}
      <mesh castShadow position={[w/2-.04,floorH/2,-(steps*sd)/2]}>
        <boxGeometry args={[.05,floorH,steps*sd]} /><meshStandardMaterial color="#8a7860" roughness={.55} metalness={.12} />
      </mesh>
      {Array.from({length:Math.floor(steps/2)},(_,i)=>(
        <mesh key={i} castShadow position={[w/2-.04,i*sh*2+sh/2+.45,-i*sd*2]}>
          <boxGeometry args={[.04,.9,.04]} /><meshStandardMaterial color="#9a8870" roughness={.55} metalness={.12} />
        </mesh>
      ))}
    </group>
  );
}

function InteriorWall({ x1,z1,x2,z2,h,t=0.14,color="#f0eee8" }:{x1:number;z1:number;x2:number;z2:number;h:number;t?:number;color?:string}) {
  const cx=(x1+x2)/2, cz=(z1+z2)/2, len=Math.sqrt((x2-x1)**2+(z2-z1)**2), ang=Math.atan2(z2-z1,x2-x1);
  return (
    <mesh position={[cx,h/2,cz]} rotation={[0,-ang,0]} castShadow receiveShadow>
      <boxGeometry args={[len,h,t]} /><meshStandardMaterial color={color} roughness={.82} metalness={0} side={THREE.DoubleSide} />
    </mesh>
  );
}

function WindowPane({ x=0,y=0,z=0,w=1.1,h=1.1 }:{x?:number;y?:number;z?:number;w?:number;h?:number}) {
  return (
    <mesh position={[x,y,z]}>
      <planeGeometry args={[w,h]} />
      <meshStandardMaterial color="#a8d0e8" transparent opacity={.32} roughness={0} metalness={.1} side={THREE.DoubleSide} envMapIntensity={1.5} />
    </mesh>
  );
}

// ── Floor group ───────────────────────────────────────────
function FloorShell({ baseW,baseD,floorH,ci,fi,rooms,hw,hd,wallT,isHitech }:{
  baseW:number;baseD:number;floorH:number;ci:typeof STYLE["modern"];fi:number;rooms:string[];
  hw:number;hd:number;wallT:number;isHitech:boolean;
}) {
  const softwareLabel = [
    { name:"living", label:"Гостиная" },{ name:"kitchen", label:"Кухня" },{ name:"master", label:"Мастер-спальня" },
    { name:"bedroom", label:"Спальня" },{ name:"bathroom", label:"Ванная" },
  ];
  return (
    <group>
      {/* Floor */}
      <mesh receiveShadow position={[0,.015,0]} rotation={[-Math.PI/2,0,0]}>
        <planeGeometry args={[baseW-wallT*2,baseD-wallT*2]} />
        <meshStandardMaterial color={ci.floor} roughness={.72} metalness={.06} envMapIntensity={.4} />
      </mesh>
      {/* Skirting board */}
      {[[0,baseD/2,baseW,1],[0,-baseD/2,baseW,1],[-baseW/2,0,1,baseD],[baseW/2,0,1,baseD]].map(([px,pz,gw,gd],i)=>(
        <mesh key={i} castShadow position={[px,.065,pz]}><boxGeometry args={[gw,.13,gd*.018+.08]} /><meshStandardMaterial color="#d8d4ce" roughness={.78} /></mesh>
      ))}
      {/* Ceiling */}
      <mesh position={[0,floorH-.04,0]}><boxGeometry args={[baseW,.1,baseD]} /><meshStandardMaterial color={ci.ceiling} roughness={.9} /></mesh>
      {/* Walls */}
      {[[0,floorH/2,hd-wallT/2,baseW,floorH,wallT],[0,floorH/2,-hd+wallT/2,baseW,floorH,wallT],[-hw+wallT/2,floorH/2,0,wallT,floorH,baseD],[hw-wallT/2,floorH/2,0,wallT,floorH,baseD]].map(([px,py,pz,gw,gh,gd],i)=>(
        <mesh key={i} castShadow receiveShadow position={[px,py,pz]}><boxGeometry args={[gw,gh,gd]} /><meshStandardMaterial color={ci.wall} roughness={.85} side={THREE.DoubleSide} /></mesh>
      ))}
      {/* Window panes */}
      {[-baseW*.28,baseW*.28].filter(cx=>Math.abs(cx)>1.2).map((cx,i)=>(
        <WindowPane key={i} x={cx} y={floorH*.48} z={hd-wallT} w={1.05} h={1.08} />
      ))}
      <WindowPane x={0} y={floorH*.48} z={-hd+wallT} w={1.05} h={1.08} />
      {[-1,1].map(s=>(
        <WindowPane key={s} x={s*(hw-wallT)} y={floorH*.48} z={-baseD*.15} w={1.05} h={1.08} />
      ))}
    </group>
  );
}

// ── Main ─────────────────────────────────────────────────
export default function InteriorModel({ answers }: { answers: HouseAnswers }) {
  const sp = SIZE_PARAMS[answers.size] ?? SIZE_PARAMS.medium;
  const { w: baseW, d: baseD, floorH } = sp;
  const floors = Math.min(parseInt(answers.floors,10)||2, 3);
  const rooms = answers.rooms.length > 0 ? answers.rooms : ["living","kitchen","bedroom","bathroom"];
  const style = answers.style ?? "modern";
  const ci = STYLE[style] ?? STYLE.modern;
  const isHitech = style==="hitech"||style==="loft";
  const wallT=.2, hw=baseW/2, hd=baseD/2;

  return (
    <group>
      {/* ── Ground floor ──────────────────────────────── */}
      <FloorShell {...{baseW,baseD,floorH,ci,fi:0,rooms,hw,hd,wallT,isHitech}} />

      {/* Pendant lights */}
      <PendantLight x={0} cy={floorH-.04} z={0} />
      {baseW>11 && <PendantLight x={-baseW*.26} cy={floorH-.04} z={-baseD*.2} />}
      {baseW>11 && <PendantLight x={baseW*.26} cy={floorH-.04} z={baseD*.18} />}

      {/* Living room */}
      {rooms.includes("living") && (
        <group>
          <Rug x={0} z={-hd*.05} w={Math.min(3.2,baseW*.55)} d={Math.min(2.4,baseD*.35)} color={ci.rug} />
          <Sofa x={0} y={0} z={-hd*.28} w={Math.min(2.8,baseW*.5)} color={isHitech?"#303848":"#6a7080"} />
          <TVWallUnit x={0} y={0} z={hd*.88} w={Math.min(2.4,baseW*.42)} fh={floorH} />
          <Table x={0} y={0} z={-hd*.08} w={1.05} d={.55} h={.45} color="#8a7860" />
          <IndoorPlant x={-hw*.72} z={hd*.7} s={1.0} />
          <IndoorPlant x={hw*.72} z={-hd*.7} s={.85} />
          <WallArt x={-baseW*.25} y={floorH*.52} z={hd-.12} rot={[0,0,0]} c1={ci.art1} c2={ci.art2} />
          <WallArt x={baseW*.22} y={floorH*.52} z={hd-.12} rot={[0,0,0]} c1={ci.art2} c2={ci.art1} w={.72} h={.55} />
        </group>
      )}

      {/* Kitchen */}
      {rooms.includes("kitchen") && (
        <group>
          <KitchenCounter x={-hw+.65} y={0} z={-hd*.52} w={Math.min(3.5,baseW*.35)} color={ci.accent} />
          <KitchenIsland x={-hw*.42} y={0} z={-hd*.3} w={Math.min(1.55,baseW*.2)} color={ci.accent} />
          <PendantLight x={-hw*.42} cy={floorH-.04} z={-hd*.3} />
        </group>
      )}

      {/* Dining */}
      {rooms.includes("dining") && (
        <group>
          <Table x={hw*.35} y={0} z={-hd*.42} w={1.6} d={1.0} h={.78} color="#9a8060" />
          <Rug x={hw*.35} z={-hd*.42} w={2.5} d={1.6} color={ci.rug} />
        </group>
      )}

      {/* Office */}
      {rooms.includes("office") && (
        <group>
          <Desk x={hw*.65} y={0} z={hd*.35} w={1.5} color="#b08060" />
          <Bookshelf x={hw*.82} y={0} z={hd*.04} w={.85} h={1.9} color="#a08060" />
          <IndoorPlant x={hw*.42} z={hd*.58} s={.8} />
        </group>
      )}

      {/* Bathroom */}
      {rooms.includes("bathroom") && (
        <group>
          <Bathtub x={hw*.58} y={0} z={-hd*.6} />
          <Toilet x={hw*.72} y={0} z={-hd*.34} />
          <mesh castShadow receiveShadow position={[hw*.55,.55,-hd*.15]}><boxGeometry args={[.62,1.0,.22]} /><meshStandardMaterial color="#e0ddd8" roughness={.28} metalness={.15} /></mesh>
        </group>
      )}

      {/* Wardrobe */}
      {rooms.includes("wardrobe") && (
        <mesh castShadow receiveShadow position={[-hw+.28,.95,hd*.5]}><boxGeometry args={[.55,1.9,1.8]} /><meshStandardMaterial color="#b89870" roughness={.7} metalness={.05} /></mesh>
      )}

      {/* Interior walls */}
      {(rooms.includes("kitchen")||rooms.includes("dining")) && (
        <InteriorWall x1={-baseW*.12} z1={-hd*.12} x2={-hw*.98} z2={-hd*.12} h={floorH} color={ci.wall} />
      )}
      {rooms.includes("bathroom") && (
        <InteriorWall x1={hw*.38} z1={-hd*.12} x2={hw*.38} z2={-hd*.98} h={floorH} color={ci.wall} />
      )}

      {/* ── Floor 2 ──────────────────────────────────── */}
      {floors>=2 && (
        <group position={[0,floorH,0]}>
          <FloorShell {...{baseW,baseD,floorH,ci,fi:1,rooms,hw,hd,wallT,isHitech}} />
          <LightFixture cy={floorH-.04} />
          {baseW>11 && <LightFixture x={-baseW*.28} cy={floorH-.04} z={-baseD*.2} />}

          {rooms.includes("master") && (
            <group>
              <Rug x={0} z={-hd*.28} w={Math.min(2.8,baseW*.48)} d={Math.min(2.6,baseD*.38)} color={ci.rug} />
              <Bed x={0} y={0} z={-hd*.28} w={Math.min(1.9,baseW*.38)} d={Math.min(2.1,baseD*.5)} color="#d8c8b0" pillowColor="#f0e8e0" />
              <WallArt x={0} y={floorH*.52} z={-hd+.1} rot={[0,Math.PI,0]} c1={ci.art1} c2={ci.art2} w={1.05} />
              <IndoorPlant x={hw*.5} z={hd*.65} s={1.0} />
              <IndoorPlant x={-hw*.5} z={hd*.65} s={.9} />
            </group>
          )}

          {rooms.includes("bedroom") && (
            <group>
              <Rug x={rooms.includes("master")?hw*.5:0} z={hd*.28} w={1.9} d={2.2} color={ci.rug} />
              <Bed x={rooms.includes("master")?hw*.5:0} y={0} z={hd*.28} w={Math.min(1.6,baseW*.35)} d={Math.min(2.0,baseD*.45)} color="#d0c4a8" />
            </group>
          )}

          {rooms.includes("kids") && (
            <group>
              <Bed x={-hw*.5} y={0} z={hd*.3} w={1.3} d={1.8} color="#c8e0f0" pillowColor="#e0ecf8" />
              <Rug x={-hw*.5} z={hd*.3} w={1.6} d={2.0} color="#a8c8e0" />
            </group>
          )}

          {rooms.includes("guest") && !rooms.includes("bedroom") && (
            <Bed x={0} y={0} z={hd*.35} w={1.5} d={1.9} color="#d8cfc0" />
          )}

          {rooms.includes("gym") && (
            <>
              <mesh castShadow receiveShadow position={[-hw*.55,.22,-hd*.5]}><boxGeometry args={[.72,.42,1.7]} /><meshStandardMaterial color="#3a4050" roughness={.55} metalness={.3} /></mesh>
              <mesh castShadow receiveShadow position={[-hw*.2,.22,-hd*.5]}><boxGeometry args={[.72,.42,1.7]} /><meshStandardMaterial color="#3a4050" roughness={.55} metalness={.3} /></mesh>
            </>
          )}

          {rooms.includes("cinema") && (
            <group>
              <Rug x={0} z={hd*.12} w={Math.min(3.6,baseW*.6)} d={2.2} color={isHitech?"#1a1a20":"#4a3828"} />
              <Sofa x={0} y={0} z={hd*.12} w={Math.min(3.2,baseW*.6)} color={isHitech?"#303848":"#4a3828"} />
              <mesh position={[0,floorH*.4,-hd*.85]}><boxGeometry args={[baseW*.55,floorH*.35,.07]} /><meshStandardMaterial color="#0a0a10" roughness={.1} metalness={.4} emissive="#080820" emissiveIntensity={.3} /></mesh>
              <LightFixture cy={floorH-.04} />
            </group>
          )}

          {rooms.includes("bedroom") && rooms.includes("master") && (
            <InteriorWall x1={hw*.1} z1={-hd+wallT} x2={hw*.1} z2={hd-wallT} h={floorH} color={ci.wall} />
          )}
        </group>
      )}

      {/* ── Floor 3 ──────────────────────────────────── */}
      {floors>=3 && (
        <group position={[0,floorH*2,0]}>
          <FloorShell {...{baseW,baseD,floorH,ci,fi:2,rooms,hw,hd,wallT,isHitech}} />
          <LightFixture cy={floorH-.04} />
          {rooms.includes("playroom") && (
            <group>
              <Table x={0} y={0} z={0} w={1.2} d={.9} h={.65} color="#d4a060" />
              <Rug x={0} z={0} w={2.5} d={2.0} color="#a888d0" />
            </group>
          )}
          {rooms.includes("gym") && (
            <mesh castShadow receiveShadow position={[0,.22,0]}><boxGeometry args={[.72,.42,1.7]} /><meshStandardMaterial color="#3a4050" roughness={.55} metalness={.3} /></mesh>
          )}
        </group>
      )}

      {/* ── Stairs ──────────────────────────────────── */}
      {floors>=2 && (
        <Staircase x={hw*.62} y={0} z={hd*.52} steps={12} w={1.1} floorH={floorH} />
      )}
    </group>
  );
}
