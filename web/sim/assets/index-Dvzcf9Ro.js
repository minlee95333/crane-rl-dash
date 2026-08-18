var yh=i=>{throw TypeError(i)};var gp=(i,t,e)=>t.has(i)||yh("Cannot "+e);var Le=(i,t,e)=>t.has(i)?yh("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(i):t.set(i,e);var z=(i,t,e)=>(gp(i,t,"access private method"),e);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const o of s)if(o.type==="childList")for(const a of o.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function e(s){const o={};return s.integrity&&(o.integrity=s.integrity),s.referrerPolicy&&(o.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?o.credentials="include":s.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function n(s){if(s.ep)return;s.ep=!0;const o=e(s);fetch(s.href,o)}})();/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Bc="170",Us={ROTATE:0,DOLLY:1,PAN:2},Ls={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},_p=0,Mh=1,vp=2,gu=1,_u=2,si=3,Ci=0,Ke=1,Re=2,Ei=0,Fs=1,bh=2,Sh=3,wh=4,xp=5,Yi=100,yp=101,Mp=102,bp=103,Sp=104,wp=200,Ep=201,Tp=202,Ap=203,Ml=204,bl=205,Rp=206,Cp=207,Pp=208,Lp=209,Ip=210,Dp=211,Up=212,Fp=213,Np=214,Sl=0,wl=1,El=2,Gs=3,Tl=4,Al=5,Rl=6,Cl=7,vu=0,Op=1,kp=2,Ti=0,zp=1,Bp=2,Hp=3,xu=4,Gp=5,Vp=6,Wp=7,yu=300,Vs=301,Ws=302,Pl=303,Ll=304,lr=306,Do=1e3,Zi=1001,Il=1002,un=1003,$p=1004,Wo=1005,Wn=1006,Cr=1007,Ki=1008,ui=1009,Mu=1010,bu=1011,Uo=1012,Hc=1013,es=1014,$n=1015,zo=1016,Gc=1017,Vc=1018,$s=1020,Su=35902,wu=1021,Eu=1022,Un=1023,Tu=1024,Au=1025,Ns=1026,Xs=1027,Wc=1028,$c=1029,Ru=1030,Xc=1031,qc=1033,Ua=33776,Fa=33777,Na=33778,Oa=33779,Dl=35840,Ul=35841,Fl=35842,Nl=35843,Ol=36196,kl=37492,zl=37496,Bl=37808,Hl=37809,Gl=37810,Vl=37811,Wl=37812,$l=37813,Xl=37814,ql=37815,Yl=37816,jl=37817,Zl=37818,Kl=37819,Jl=37820,Ql=37821,ka=36492,tc=36494,ec=36495,Cu=36283,nc=36284,ic=36285,sc=36286,Xp=3200,qp=3201,Pu=0,Yp=1,wi="",dn="srgb",to="srgb-linear",cr="linear",ae="srgb",us=7680,Eh=519,jp=512,Zp=513,Kp=514,Lu=515,Jp=516,Qp=517,tm=518,em=519,Th=35044,Ah="300 es",ri=2e3,ja=2001;class ls{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){if(this._listeners===void 0)return!1;const n=this._listeners;return n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){if(this._listeners===void 0)return;const s=this._listeners[t];if(s!==void 0){const o=s.indexOf(e);o!==-1&&s.splice(o,1)}}dispatchEvent(t){if(this._listeners===void 0)return;const n=this._listeners[t.type];if(n!==void 0){t.target=this;const s=n.slice(0);for(let o=0,a=s.length;o<a;o++)s[o].call(this,t);t.target=null}}}const Be=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Ro=Math.PI/180,oc=180/Math.PI;function Bo(){const i=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Be[i&255]+Be[i>>8&255]+Be[i>>16&255]+Be[i>>24&255]+"-"+Be[t&255]+Be[t>>8&255]+"-"+Be[t>>16&15|64]+Be[t>>24&255]+"-"+Be[e&63|128]+Be[e>>8&255]+"-"+Be[e>>16&255]+Be[e>>24&255]+Be[n&255]+Be[n>>8&255]+Be[n>>16&255]+Be[n>>24&255]).toLowerCase()}function je(i,t,e){return Math.max(t,Math.min(e,i))}function nm(i,t){return(i%t+t)%t}function Pr(i,t,e){return(1-e)*i+e*t}function oo(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function Qe(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}const im={DEG2RAD:Ro};class Et{constructor(t=0,e=0){Et.prototype.isVector2=!0,this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){const e=this.x,n=this.y,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6],this.y=s[1]*e+s[4]*n+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(je(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){const n=Math.cos(e),s=Math.sin(e),o=this.x-t.x,a=this.y-t.y;return this.x=o*n-a*s+t.x,this.y=o*s+a*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Ft{constructor(t,e,n,s,o,a,r,l,c){Ft.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,s,o,a,r,l,c)}set(t,e,n,s,o,a,r,l,c){const h=this.elements;return h[0]=t,h[1]=s,h[2]=r,h[3]=e,h[4]=o,h[5]=l,h[6]=n,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){const e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,s=e.elements,o=this.elements,a=n[0],r=n[3],l=n[6],c=n[1],h=n[4],d=n[7],u=n[2],p=n[5],m=n[8],_=s[0],g=s[3],f=s[6],x=s[1],y=s[4],v=s[7],w=s[2],E=s[5],S=s[8];return o[0]=a*_+r*x+l*w,o[3]=a*g+r*y+l*E,o[6]=a*f+r*v+l*S,o[1]=c*_+h*x+d*w,o[4]=c*g+h*y+d*E,o[7]=c*f+h*v+d*S,o[2]=u*_+p*x+m*w,o[5]=u*g+p*y+m*E,o[8]=u*f+p*v+m*S,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[1],s=t[2],o=t[3],a=t[4],r=t[5],l=t[6],c=t[7],h=t[8];return e*a*h-e*r*c-n*o*h+n*r*l+s*o*c-s*a*l}invert(){const t=this.elements,e=t[0],n=t[1],s=t[2],o=t[3],a=t[4],r=t[5],l=t[6],c=t[7],h=t[8],d=h*a-r*c,u=r*l-h*o,p=c*o-a*l,m=e*d+n*u+s*p;if(m===0)return this.set(0,0,0,0,0,0,0,0,0);const _=1/m;return t[0]=d*_,t[1]=(s*c-h*n)*_,t[2]=(r*n-s*a)*_,t[3]=u*_,t[4]=(h*e-s*l)*_,t[5]=(s*o-r*e)*_,t[6]=p*_,t[7]=(n*l-c*e)*_,t[8]=(a*e-n*o)*_,this}transpose(){let t;const e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){const e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,s,o,a,r){const l=Math.cos(o),c=Math.sin(o);return this.set(n*l,n*c,-n*(l*a+c*r)+a+t,-s*c,s*l,-s*(-c*a+l*r)+r+e,0,0,1),this}scale(t,e){return this.premultiply(Lr.makeScale(t,e)),this}rotate(t){return this.premultiply(Lr.makeRotation(-t)),this}translate(t,e){return this.premultiply(Lr.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){const e=this.elements,n=t.elements;for(let s=0;s<9;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}}const Lr=new Ft;function Iu(i){for(let t=i.length-1;t>=0;--t)if(i[t]>=65535)return!0;return!1}function Za(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function sm(){const i=Za("canvas");return i.style.display="block",i}const Rh={};function yo(i){i in Rh||(Rh[i]=!0,console.warn(i))}function om(i,t,e){return new Promise(function(n,s){function o(){switch(i.clientWaitSync(t,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(o,e);break;default:n()}}setTimeout(o,e)})}function am(i){const t=i.elements;t[2]=.5*t[2]+.5*t[3],t[6]=.5*t[6]+.5*t[7],t[10]=.5*t[10]+.5*t[11],t[14]=.5*t[14]+.5*t[15]}function rm(i){const t=i.elements;t[11]===-1?(t[10]=-t[10]-1,t[14]=-t[14]):(t[10]=-t[10],t[14]=-t[14]+1)}const Yt={enabled:!0,workingColorSpace:to,spaces:{},convert:function(i,t,e){return this.enabled===!1||t===e||!t||!e||(this.spaces[t].transfer===ae&&(i.r=hi(i.r),i.g=hi(i.g),i.b=hi(i.b)),this.spaces[t].primaries!==this.spaces[e].primaries&&(i.applyMatrix3(this.spaces[t].toXYZ),i.applyMatrix3(this.spaces[e].fromXYZ)),this.spaces[e].transfer===ae&&(i.r=Os(i.r),i.g=Os(i.g),i.b=Os(i.b))),i},fromWorkingColorSpace:function(i,t){return this.convert(i,this.workingColorSpace,t)},toWorkingColorSpace:function(i,t){return this.convert(i,t,this.workingColorSpace)},getPrimaries:function(i){return this.spaces[i].primaries},getTransfer:function(i){return i===wi?cr:this.spaces[i].transfer},getLuminanceCoefficients:function(i,t=this.workingColorSpace){return i.fromArray(this.spaces[t].luminanceCoefficients)},define:function(i){Object.assign(this.spaces,i)},_getMatrix:function(i,t,e){return i.copy(this.spaces[t].toXYZ).multiply(this.spaces[e].fromXYZ)},_getDrawingBufferColorSpace:function(i){return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(i=this.workingColorSpace){return this.spaces[i].workingColorSpaceConfig.unpackColorSpace}};function hi(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Os(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}const Ch=[.64,.33,.3,.6,.15,.06],Ph=[.2126,.7152,.0722],Lh=[.3127,.329],Ih=new Ft().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Dh=new Ft().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);Yt.define({[to]:{primaries:Ch,whitePoint:Lh,transfer:cr,toXYZ:Ih,fromXYZ:Dh,luminanceCoefficients:Ph,workingColorSpaceConfig:{unpackColorSpace:dn},outputColorSpaceConfig:{drawingBufferColorSpace:dn}},[dn]:{primaries:Ch,whitePoint:Lh,transfer:ae,toXYZ:Ih,fromXYZ:Dh,luminanceCoefficients:Ph,outputColorSpaceConfig:{drawingBufferColorSpace:dn}}});let fs;class lm{static getDataURL(t){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let e;if(t instanceof HTMLCanvasElement)e=t;else{fs===void 0&&(fs=Za("canvas")),fs.width=t.width,fs.height=t.height;const n=fs.getContext("2d");t instanceof ImageData?n.putImageData(t,0,0):n.drawImage(t,0,0,t.width,t.height),e=fs}return e.width>2048||e.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",t),e.toDataURL("image/jpeg",.6)):e.toDataURL("image/png")}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){const e=Za("canvas");e.width=t.width,e.height=t.height;const n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);const s=n.getImageData(0,0,t.width,t.height),o=s.data;for(let a=0;a<o.length;a++)o[a]=hi(o[a]/255)*255;return n.putImageData(s,0,0),e}else if(t.data){const e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(hi(e[n]/255)*255):e[n]=hi(e[n]);return{data:e,width:t.width,height:t.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}}let cm=0;class Du{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:cm++}),this.uuid=Bo(),this.data=t,this.dataReady=!0,this.version=0}set needsUpdate(t){t===!0&&this.version++}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];const n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let o;if(Array.isArray(s)){o=[];for(let a=0,r=s.length;a<r;a++)s[a].isDataTexture?o.push(Ir(s[a].image)):o.push(Ir(s[a]))}else o=Ir(s);n.url=o}return e||(t.images[this.uuid]=n),n}}function Ir(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?lm.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let hm=0;class We extends ls{constructor(t=We.DEFAULT_IMAGE,e=We.DEFAULT_MAPPING,n=Zi,s=Zi,o=Wn,a=Ki,r=Un,l=ui,c=We.DEFAULT_ANISOTROPY,h=wi){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:hm++}),this.uuid=Bo(),this.name="",this.source=new Du(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=o,this.minFilter=a,this.anisotropy=c,this.format=r,this.internalFormat=null,this.type=l,this.offset=new Et(0,0),this.repeat=new Et(1,1),this.center=new Et(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ft,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(t=null){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];const n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==yu)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case Do:t.x=t.x-Math.floor(t.x);break;case Zi:t.x=t.x<0?0:1;break;case Il:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case Do:t.y=t.y-Math.floor(t.y);break;case Zi:t.y=t.y<0?0:1;break;case Il:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}}We.DEFAULT_IMAGE=null;We.DEFAULT_MAPPING=yu;We.DEFAULT_ANISOTROPY=1;class be{constructor(t=0,e=0,n=0,s=1){be.prototype.isVector4=!0,this.x=t,this.y=e,this.z=n,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,s){return this.x=t,this.y=e,this.z=n,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){const e=this.x,n=this.y,s=this.z,o=this.w,a=t.elements;return this.x=a[0]*e+a[4]*n+a[8]*s+a[12]*o,this.y=a[1]*e+a[5]*n+a[9]*s+a[13]*o,this.z=a[2]*e+a[6]*n+a[10]*s+a[14]*o,this.w=a[3]*e+a[7]*n+a[11]*s+a[15]*o,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);const e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,s,o;const l=t.elements,c=l[0],h=l[4],d=l[8],u=l[1],p=l[5],m=l[9],_=l[2],g=l[6],f=l[10];if(Math.abs(h-u)<.01&&Math.abs(d-_)<.01&&Math.abs(m-g)<.01){if(Math.abs(h+u)<.1&&Math.abs(d+_)<.1&&Math.abs(m+g)<.1&&Math.abs(c+p+f-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;const y=(c+1)/2,v=(p+1)/2,w=(f+1)/2,E=(h+u)/4,S=(d+_)/4,R=(m+g)/4;return y>v&&y>w?y<.01?(n=0,s=.707106781,o=.707106781):(n=Math.sqrt(y),s=E/n,o=S/n):v>w?v<.01?(n=.707106781,s=0,o=.707106781):(s=Math.sqrt(v),n=E/s,o=R/s):w<.01?(n=.707106781,s=.707106781,o=0):(o=Math.sqrt(w),n=S/o,s=R/o),this.set(n,s,o,e),this}let x=Math.sqrt((g-m)*(g-m)+(d-_)*(d-_)+(u-h)*(u-h));return Math.abs(x)<.001&&(x=1),this.x=(g-m)/x,this.y=(d-_)/x,this.z=(u-h)/x,this.w=Math.acos((c+p+f-1)/2),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this.w=Math.max(t.w,Math.min(e.w,this.w)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this.w=Math.max(t,Math.min(e,this.w)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class dm extends ls{constructor(t=1,e=1,n={}){super(),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=1,this.scissor=new be(0,0,t,e),this.scissorTest=!1,this.viewport=new be(0,0,t,e);const s={width:t,height:e,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Wn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);const o=new We(s,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);o.flipY=!1,o.generateMipmaps=n.generateMipmaps,o.internalFormat=n.internalFormat,this.textures=[];const a=n.count;for(let r=0;r<a;r++)this.textures[r]=o.clone(),this.textures[r].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let s=0,o=this.textures.length;s<o;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=n;this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let n=0,s=t.textures.length;n<s;n++)this.textures[n]=t.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;const e=Object.assign({},t.texture.image);return this.texture.source=new Du(e),this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class ns extends dm{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}}class Uu extends We{constructor(t=null,e=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=un,this.minFilter=un,this.wrapR=Zi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}}class um extends We{constructor(t=null,e=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=un,this.minFilter=un,this.wrapR=Zi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Pi{constructor(t=0,e=0,n=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=s}static slerpFlat(t,e,n,s,o,a,r){let l=n[s+0],c=n[s+1],h=n[s+2],d=n[s+3];const u=o[a+0],p=o[a+1],m=o[a+2],_=o[a+3];if(r===0){t[e+0]=l,t[e+1]=c,t[e+2]=h,t[e+3]=d;return}if(r===1){t[e+0]=u,t[e+1]=p,t[e+2]=m,t[e+3]=_;return}if(d!==_||l!==u||c!==p||h!==m){let g=1-r;const f=l*u+c*p+h*m+d*_,x=f>=0?1:-1,y=1-f*f;if(y>Number.EPSILON){const w=Math.sqrt(y),E=Math.atan2(w,f*x);g=Math.sin(g*E)/w,r=Math.sin(r*E)/w}const v=r*x;if(l=l*g+u*v,c=c*g+p*v,h=h*g+m*v,d=d*g+_*v,g===1-r){const w=1/Math.sqrt(l*l+c*c+h*h+d*d);l*=w,c*=w,h*=w,d*=w}}t[e]=l,t[e+1]=c,t[e+2]=h,t[e+3]=d}static multiplyQuaternionsFlat(t,e,n,s,o,a){const r=n[s],l=n[s+1],c=n[s+2],h=n[s+3],d=o[a],u=o[a+1],p=o[a+2],m=o[a+3];return t[e]=r*m+h*d+l*p-c*u,t[e+1]=l*m+h*u+c*d-r*p,t[e+2]=c*m+h*p+r*u-l*d,t[e+3]=h*m-r*d-l*u-c*p,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,s){return this._x=t,this._y=e,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){const n=t._x,s=t._y,o=t._z,a=t._order,r=Math.cos,l=Math.sin,c=r(n/2),h=r(s/2),d=r(o/2),u=l(n/2),p=l(s/2),m=l(o/2);switch(a){case"XYZ":this._x=u*h*d+c*p*m,this._y=c*p*d-u*h*m,this._z=c*h*m+u*p*d,this._w=c*h*d-u*p*m;break;case"YXZ":this._x=u*h*d+c*p*m,this._y=c*p*d-u*h*m,this._z=c*h*m-u*p*d,this._w=c*h*d+u*p*m;break;case"ZXY":this._x=u*h*d-c*p*m,this._y=c*p*d+u*h*m,this._z=c*h*m+u*p*d,this._w=c*h*d-u*p*m;break;case"ZYX":this._x=u*h*d-c*p*m,this._y=c*p*d+u*h*m,this._z=c*h*m-u*p*d,this._w=c*h*d+u*p*m;break;case"YZX":this._x=u*h*d+c*p*m,this._y=c*p*d+u*h*m,this._z=c*h*m-u*p*d,this._w=c*h*d-u*p*m;break;case"XZY":this._x=u*h*d-c*p*m,this._y=c*p*d-u*h*m,this._z=c*h*m+u*p*d,this._w=c*h*d+u*p*m;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){const n=e/2,s=Math.sin(n);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){const e=t.elements,n=e[0],s=e[4],o=e[8],a=e[1],r=e[5],l=e[9],c=e[2],h=e[6],d=e[10],u=n+r+d;if(u>0){const p=.5/Math.sqrt(u+1);this._w=.25/p,this._x=(h-l)*p,this._y=(o-c)*p,this._z=(a-s)*p}else if(n>r&&n>d){const p=2*Math.sqrt(1+n-r-d);this._w=(h-l)/p,this._x=.25*p,this._y=(s+a)/p,this._z=(o+c)/p}else if(r>d){const p=2*Math.sqrt(1+r-n-d);this._w=(o-c)/p,this._x=(s+a)/p,this._y=.25*p,this._z=(l+h)/p}else{const p=2*Math.sqrt(1+d-n-r);this._w=(a-s)/p,this._x=(o+c)/p,this._y=(l+h)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<Number.EPSILON?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(je(this.dot(t),-1,1)))}rotateTowards(t,e){const n=this.angleTo(t);if(n===0)return this;const s=Math.min(1,e/n);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){const n=t._x,s=t._y,o=t._z,a=t._w,r=e._x,l=e._y,c=e._z,h=e._w;return this._x=n*h+a*r+s*c-o*l,this._y=s*h+a*l+o*r-n*c,this._z=o*h+a*c+n*l-s*r,this._w=a*h-n*r-s*l-o*c,this._onChangeCallback(),this}slerp(t,e){if(e===0)return this;if(e===1)return this.copy(t);const n=this._x,s=this._y,o=this._z,a=this._w;let r=a*t._w+n*t._x+s*t._y+o*t._z;if(r<0?(this._w=-t._w,this._x=-t._x,this._y=-t._y,this._z=-t._z,r=-r):this.copy(t),r>=1)return this._w=a,this._x=n,this._y=s,this._z=o,this;const l=1-r*r;if(l<=Number.EPSILON){const p=1-e;return this._w=p*a+e*this._w,this._x=p*n+e*this._x,this._y=p*s+e*this._y,this._z=p*o+e*this._z,this.normalize(),this}const c=Math.sqrt(l),h=Math.atan2(c,r),d=Math.sin((1-e)*h)/c,u=Math.sin(e*h)/c;return this._w=a*d+this._w*u,this._x=n*d+this._x*u,this._y=s*d+this._y*u,this._z=o*d+this._z*u,this._onChangeCallback(),this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){const t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),o=Math.sqrt(n);return this.set(s*Math.sin(t),s*Math.cos(t),o*Math.sin(e),o*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class L{constructor(t=0,e=0,n=0){L.prototype.isVector3=!0,this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(Uh.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(Uh.setFromAxisAngle(t,e))}applyMatrix3(t){const e=this.x,n=this.y,s=this.z,o=t.elements;return this.x=o[0]*e+o[3]*n+o[6]*s,this.y=o[1]*e+o[4]*n+o[7]*s,this.z=o[2]*e+o[5]*n+o[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){const e=this.x,n=this.y,s=this.z,o=t.elements,a=1/(o[3]*e+o[7]*n+o[11]*s+o[15]);return this.x=(o[0]*e+o[4]*n+o[8]*s+o[12])*a,this.y=(o[1]*e+o[5]*n+o[9]*s+o[13])*a,this.z=(o[2]*e+o[6]*n+o[10]*s+o[14])*a,this}applyQuaternion(t){const e=this.x,n=this.y,s=this.z,o=t.x,a=t.y,r=t.z,l=t.w,c=2*(a*s-r*n),h=2*(r*e-o*s),d=2*(o*n-a*e);return this.x=e+l*c+a*d-r*h,this.y=n+l*h+r*c-o*d,this.z=s+l*d+o*h-a*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){const e=this.x,n=this.y,s=this.z,o=t.elements;return this.x=o[0]*e+o[4]*n+o[8]*s,this.y=o[1]*e+o[5]*n+o[9]*s,this.z=o[2]*e+o[6]*n+o[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){const n=t.x,s=t.y,o=t.z,a=e.x,r=e.y,l=e.z;return this.x=s*l-o*r,this.y=o*a-n*l,this.z=n*r-s*a,this}projectOnVector(t){const e=t.lengthSq();if(e===0)return this.set(0,0,0);const n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return Dr.copy(this).projectOnVector(t),this.sub(Dr)}reflect(t){return this.sub(Dr.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(je(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y,s=this.z-t.z;return e*e+n*n+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){const s=Math.sin(e)*t;return this.x=s*Math.sin(n),this.y=Math.cos(e)*t,this.z=s*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){const e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Dr=new L,Uh=new Pi;class Di{constructor(t=new L(1/0,1/0,1/0),e=new L(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(Cn.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(Cn.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){const n=Cn.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);const n=t.geometry;if(n!==void 0){const o=n.getAttribute("position");if(e===!0&&o!==void 0&&t.isInstancedMesh!==!0)for(let a=0,r=o.count;a<r;a++)t.isMesh===!0?t.getVertexPosition(a,Cn):Cn.fromBufferAttribute(o,a),Cn.applyMatrix4(t.matrixWorld),this.expandByPoint(Cn);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),$o.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),$o.copy(n.boundingBox)),$o.applyMatrix4(t.matrixWorld),this.union($o)}const s=t.children;for(let o=0,a=s.length;o<a;o++)this.expandByObject(s[o],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,Cn),Cn.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(ao),Xo.subVectors(this.max,ao),ps.subVectors(t.a,ao),ms.subVectors(t.b,ao),gs.subVectors(t.c,ao),gi.subVectors(ms,ps),_i.subVectors(gs,ms),Fi.subVectors(ps,gs);let e=[0,-gi.z,gi.y,0,-_i.z,_i.y,0,-Fi.z,Fi.y,gi.z,0,-gi.x,_i.z,0,-_i.x,Fi.z,0,-Fi.x,-gi.y,gi.x,0,-_i.y,_i.x,0,-Fi.y,Fi.x,0];return!Ur(e,ps,ms,gs,Xo)||(e=[1,0,0,0,1,0,0,0,1],!Ur(e,ps,ms,gs,Xo))?!1:(qo.crossVectors(gi,_i),e=[qo.x,qo.y,qo.z],Ur(e,ps,ms,gs,Xo))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,Cn).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(Cn).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(Kn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),Kn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),Kn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),Kn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),Kn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),Kn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),Kn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),Kn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(Kn),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}}const Kn=[new L,new L,new L,new L,new L,new L,new L,new L],Cn=new L,$o=new Di,ps=new L,ms=new L,gs=new L,gi=new L,_i=new L,Fi=new L,ao=new L,Xo=new L,qo=new L,Ni=new L;function Ur(i,t,e,n,s){for(let o=0,a=i.length-3;o<=a;o+=3){Ni.fromArray(i,o);const r=s.x*Math.abs(Ni.x)+s.y*Math.abs(Ni.y)+s.z*Math.abs(Ni.z),l=t.dot(Ni),c=e.dot(Ni),h=n.dot(Ni);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>r)return!1}return!0}const fm=new Di,ro=new L,Fr=new L;class cs{constructor(t=new L,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){const n=this.center;e!==void 0?n.copy(e):fm.setFromPoints(t).getCenter(n);let s=0;for(let o=0,a=t.length;o<a;o++)s=Math.max(s,n.distanceToSquared(t[o]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){const e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){const n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;ro.subVectors(t,this.center);const e=ro.lengthSq();if(e>this.radius*this.radius){const n=Math.sqrt(e),s=(n-this.radius)*.5;this.center.addScaledVector(ro,s/n),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Fr.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(ro.copy(t.center).add(Fr)),this.expandByPoint(ro.copy(t.center).sub(Fr))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}}const Jn=new L,Nr=new L,Yo=new L,vi=new L,Or=new L,jo=new L,kr=new L;class Ho{constructor(t=new L,e=new L(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Jn)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);const n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){const e=Jn.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(Jn.copy(this.origin).addScaledVector(this.direction,e),Jn.distanceToSquared(t))}distanceSqToSegment(t,e,n,s){Nr.copy(t).add(e).multiplyScalar(.5),Yo.copy(e).sub(t).normalize(),vi.copy(this.origin).sub(Nr);const o=t.distanceTo(e)*.5,a=-this.direction.dot(Yo),r=vi.dot(this.direction),l=-vi.dot(Yo),c=vi.lengthSq(),h=Math.abs(1-a*a);let d,u,p,m;if(h>0)if(d=a*l-r,u=a*r-l,m=o*h,d>=0)if(u>=-m)if(u<=m){const _=1/h;d*=_,u*=_,p=d*(d+a*u+2*r)+u*(a*d+u+2*l)+c}else u=o,d=Math.max(0,-(a*u+r)),p=-d*d+u*(u+2*l)+c;else u=-o,d=Math.max(0,-(a*u+r)),p=-d*d+u*(u+2*l)+c;else u<=-m?(d=Math.max(0,-(-a*o+r)),u=d>0?-o:Math.min(Math.max(-o,-l),o),p=-d*d+u*(u+2*l)+c):u<=m?(d=0,u=Math.min(Math.max(-o,-l),o),p=u*(u+2*l)+c):(d=Math.max(0,-(a*o+r)),u=d>0?o:Math.min(Math.max(-o,-l),o),p=-d*d+u*(u+2*l)+c);else u=a>0?-o:o,d=Math.max(0,-(a*u+r)),p=-d*d+u*(u+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,d),s&&s.copy(Nr).addScaledVector(Yo,u),p}intersectSphere(t,e){Jn.subVectors(t.center,this.origin);const n=Jn.dot(this.direction),s=Jn.dot(Jn)-n*n,o=t.radius*t.radius;if(s>o)return null;const a=Math.sqrt(o-s),r=n-a,l=n+a;return l<0?null:r<0?this.at(l,e):this.at(r,e)}intersectsSphere(t){return this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){const e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){const n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){const e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,s,o,a,r,l;const c=1/this.direction.x,h=1/this.direction.y,d=1/this.direction.z,u=this.origin;return c>=0?(n=(t.min.x-u.x)*c,s=(t.max.x-u.x)*c):(n=(t.max.x-u.x)*c,s=(t.min.x-u.x)*c),h>=0?(o=(t.min.y-u.y)*h,a=(t.max.y-u.y)*h):(o=(t.max.y-u.y)*h,a=(t.min.y-u.y)*h),n>a||o>s||((o>n||isNaN(n))&&(n=o),(a<s||isNaN(s))&&(s=a),d>=0?(r=(t.min.z-u.z)*d,l=(t.max.z-u.z)*d):(r=(t.max.z-u.z)*d,l=(t.min.z-u.z)*d),n>l||r>s)||((r>n||n!==n)&&(n=r),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,e)}intersectsBox(t){return this.intersectBox(t,Jn)!==null}intersectTriangle(t,e,n,s,o){Or.subVectors(e,t),jo.subVectors(n,t),kr.crossVectors(Or,jo);let a=this.direction.dot(kr),r;if(a>0){if(s)return null;r=1}else if(a<0)r=-1,a=-a;else return null;vi.subVectors(this.origin,t);const l=r*this.direction.dot(jo.crossVectors(vi,jo));if(l<0)return null;const c=r*this.direction.dot(Or.cross(vi));if(c<0||l+c>a)return null;const h=-r*vi.dot(kr);return h<0?null:this.at(h/a,o)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Qt{constructor(t,e,n,s,o,a,r,l,c,h,d,u,p,m,_,g){Qt.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,s,o,a,r,l,c,h,d,u,p,m,_,g)}set(t,e,n,s,o,a,r,l,c,h,d,u,p,m,_,g){const f=this.elements;return f[0]=t,f[4]=e,f[8]=n,f[12]=s,f[1]=o,f[5]=a,f[9]=r,f[13]=l,f[2]=c,f[6]=h,f[10]=d,f[14]=u,f[3]=p,f[7]=m,f[11]=_,f[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Qt().fromArray(this.elements)}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){const e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){const e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){const e=this.elements,n=t.elements,s=1/_s.setFromMatrixColumn(t,0).length(),o=1/_s.setFromMatrixColumn(t,1).length(),a=1/_s.setFromMatrixColumn(t,2).length();return e[0]=n[0]*s,e[1]=n[1]*s,e[2]=n[2]*s,e[3]=0,e[4]=n[4]*o,e[5]=n[5]*o,e[6]=n[6]*o,e[7]=0,e[8]=n[8]*a,e[9]=n[9]*a,e[10]=n[10]*a,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){const e=this.elements,n=t.x,s=t.y,o=t.z,a=Math.cos(n),r=Math.sin(n),l=Math.cos(s),c=Math.sin(s),h=Math.cos(o),d=Math.sin(o);if(t.order==="XYZ"){const u=a*h,p=a*d,m=r*h,_=r*d;e[0]=l*h,e[4]=-l*d,e[8]=c,e[1]=p+m*c,e[5]=u-_*c,e[9]=-r*l,e[2]=_-u*c,e[6]=m+p*c,e[10]=a*l}else if(t.order==="YXZ"){const u=l*h,p=l*d,m=c*h,_=c*d;e[0]=u+_*r,e[4]=m*r-p,e[8]=a*c,e[1]=a*d,e[5]=a*h,e[9]=-r,e[2]=p*r-m,e[6]=_+u*r,e[10]=a*l}else if(t.order==="ZXY"){const u=l*h,p=l*d,m=c*h,_=c*d;e[0]=u-_*r,e[4]=-a*d,e[8]=m+p*r,e[1]=p+m*r,e[5]=a*h,e[9]=_-u*r,e[2]=-a*c,e[6]=r,e[10]=a*l}else if(t.order==="ZYX"){const u=a*h,p=a*d,m=r*h,_=r*d;e[0]=l*h,e[4]=m*c-p,e[8]=u*c+_,e[1]=l*d,e[5]=_*c+u,e[9]=p*c-m,e[2]=-c,e[6]=r*l,e[10]=a*l}else if(t.order==="YZX"){const u=a*l,p=a*c,m=r*l,_=r*c;e[0]=l*h,e[4]=_-u*d,e[8]=m*d+p,e[1]=d,e[5]=a*h,e[9]=-r*h,e[2]=-c*h,e[6]=p*d+m,e[10]=u-_*d}else if(t.order==="XZY"){const u=a*l,p=a*c,m=r*l,_=r*c;e[0]=l*h,e[4]=-d,e[8]=c*h,e[1]=u*d+_,e[5]=a*h,e[9]=p*d-m,e[2]=m*d-p,e[6]=r*h,e[10]=_*d+u}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(pm,t,mm)}lookAt(t,e,n){const s=this.elements;return an.subVectors(t,e),an.lengthSq()===0&&(an.z=1),an.normalize(),xi.crossVectors(n,an),xi.lengthSq()===0&&(Math.abs(n.z)===1?an.x+=1e-4:an.z+=1e-4,an.normalize(),xi.crossVectors(n,an)),xi.normalize(),Zo.crossVectors(an,xi),s[0]=xi.x,s[4]=Zo.x,s[8]=an.x,s[1]=xi.y,s[5]=Zo.y,s[9]=an.y,s[2]=xi.z,s[6]=Zo.z,s[10]=an.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,s=e.elements,o=this.elements,a=n[0],r=n[4],l=n[8],c=n[12],h=n[1],d=n[5],u=n[9],p=n[13],m=n[2],_=n[6],g=n[10],f=n[14],x=n[3],y=n[7],v=n[11],w=n[15],E=s[0],S=s[4],R=s[8],b=s[12],M=s[1],C=s[5],U=s[9],O=s[13],B=s[2],X=s[6],W=s[10],Y=s[14],V=s[3],it=s[7],Q=s[11],ft=s[15];return o[0]=a*E+r*M+l*B+c*V,o[4]=a*S+r*C+l*X+c*it,o[8]=a*R+r*U+l*W+c*Q,o[12]=a*b+r*O+l*Y+c*ft,o[1]=h*E+d*M+u*B+p*V,o[5]=h*S+d*C+u*X+p*it,o[9]=h*R+d*U+u*W+p*Q,o[13]=h*b+d*O+u*Y+p*ft,o[2]=m*E+_*M+g*B+f*V,o[6]=m*S+_*C+g*X+f*it,o[10]=m*R+_*U+g*W+f*Q,o[14]=m*b+_*O+g*Y+f*ft,o[3]=x*E+y*M+v*B+w*V,o[7]=x*S+y*C+v*X+w*it,o[11]=x*R+y*U+v*W+w*Q,o[15]=x*b+y*O+v*Y+w*ft,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[4],s=t[8],o=t[12],a=t[1],r=t[5],l=t[9],c=t[13],h=t[2],d=t[6],u=t[10],p=t[14],m=t[3],_=t[7],g=t[11],f=t[15];return m*(+o*l*d-s*c*d-o*r*u+n*c*u+s*r*p-n*l*p)+_*(+e*l*p-e*c*u+o*a*u-s*a*p+s*c*h-o*l*h)+g*(+e*c*d-e*r*p-o*a*d+n*a*p+o*r*h-n*c*h)+f*(-s*r*h-e*l*d+e*r*u+s*a*d-n*a*u+n*l*h)}transpose(){const t=this.elements;let e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){const s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=n),this}invert(){const t=this.elements,e=t[0],n=t[1],s=t[2],o=t[3],a=t[4],r=t[5],l=t[6],c=t[7],h=t[8],d=t[9],u=t[10],p=t[11],m=t[12],_=t[13],g=t[14],f=t[15],x=d*g*c-_*u*c+_*l*p-r*g*p-d*l*f+r*u*f,y=m*u*c-h*g*c-m*l*p+a*g*p+h*l*f-a*u*f,v=h*_*c-m*d*c+m*r*p-a*_*p-h*r*f+a*d*f,w=m*d*l-h*_*l-m*r*u+a*_*u+h*r*g-a*d*g,E=e*x+n*y+s*v+o*w;if(E===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const S=1/E;return t[0]=x*S,t[1]=(_*u*o-d*g*o-_*s*p+n*g*p+d*s*f-n*u*f)*S,t[2]=(r*g*o-_*l*o+_*s*c-n*g*c-r*s*f+n*l*f)*S,t[3]=(d*l*o-r*u*o-d*s*c+n*u*c+r*s*p-n*l*p)*S,t[4]=y*S,t[5]=(h*g*o-m*u*o+m*s*p-e*g*p-h*s*f+e*u*f)*S,t[6]=(m*l*o-a*g*o-m*s*c+e*g*c+a*s*f-e*l*f)*S,t[7]=(a*u*o-h*l*o+h*s*c-e*u*c-a*s*p+e*l*p)*S,t[8]=v*S,t[9]=(m*d*o-h*_*o-m*n*p+e*_*p+h*n*f-e*d*f)*S,t[10]=(a*_*o-m*r*o+m*n*c-e*_*c-a*n*f+e*r*f)*S,t[11]=(h*r*o-a*d*o-h*n*c+e*d*c+a*n*p-e*r*p)*S,t[12]=w*S,t[13]=(h*_*s-m*d*s+m*n*u-e*_*u-h*n*g+e*d*g)*S,t[14]=(m*r*s-a*_*s-m*n*l+e*_*l+a*n*g-e*r*g)*S,t[15]=(a*d*s-h*r*s+h*n*l-e*d*l-a*n*u+e*r*u)*S,this}scale(t){const e=this.elements,n=t.x,s=t.y,o=t.z;return e[0]*=n,e[4]*=s,e[8]*=o,e[1]*=n,e[5]*=s,e[9]*=o,e[2]*=n,e[6]*=s,e[10]*=o,e[3]*=n,e[7]*=s,e[11]*=o,this}getMaxScaleOnAxis(){const t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,s))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){const e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){const n=Math.cos(e),s=Math.sin(e),o=1-n,a=t.x,r=t.y,l=t.z,c=o*a,h=o*r;return this.set(c*a+n,c*r-s*l,c*l+s*r,0,c*r+s*l,h*r+n,h*l-s*a,0,c*l-s*r,h*l+s*a,o*l*l+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,s,o,a){return this.set(1,n,o,0,t,1,a,0,e,s,1,0,0,0,0,1),this}compose(t,e,n){const s=this.elements,o=e._x,a=e._y,r=e._z,l=e._w,c=o+o,h=a+a,d=r+r,u=o*c,p=o*h,m=o*d,_=a*h,g=a*d,f=r*d,x=l*c,y=l*h,v=l*d,w=n.x,E=n.y,S=n.z;return s[0]=(1-(_+f))*w,s[1]=(p+v)*w,s[2]=(m-y)*w,s[3]=0,s[4]=(p-v)*E,s[5]=(1-(u+f))*E,s[6]=(g+x)*E,s[7]=0,s[8]=(m+y)*S,s[9]=(g-x)*S,s[10]=(1-(u+_))*S,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,n){const s=this.elements;let o=_s.set(s[0],s[1],s[2]).length();const a=_s.set(s[4],s[5],s[6]).length(),r=_s.set(s[8],s[9],s[10]).length();this.determinant()<0&&(o=-o),t.x=s[12],t.y=s[13],t.z=s[14],Pn.copy(this);const c=1/o,h=1/a,d=1/r;return Pn.elements[0]*=c,Pn.elements[1]*=c,Pn.elements[2]*=c,Pn.elements[4]*=h,Pn.elements[5]*=h,Pn.elements[6]*=h,Pn.elements[8]*=d,Pn.elements[9]*=d,Pn.elements[10]*=d,e.setFromRotationMatrix(Pn),n.x=o,n.y=a,n.z=r,this}makePerspective(t,e,n,s,o,a,r=ri){const l=this.elements,c=2*o/(e-t),h=2*o/(n-s),d=(e+t)/(e-t),u=(n+s)/(n-s);let p,m;if(r===ri)p=-(a+o)/(a-o),m=-2*a*o/(a-o);else if(r===ja)p=-a/(a-o),m=-a*o/(a-o);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+r);return l[0]=c,l[4]=0,l[8]=d,l[12]=0,l[1]=0,l[5]=h,l[9]=u,l[13]=0,l[2]=0,l[6]=0,l[10]=p,l[14]=m,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(t,e,n,s,o,a,r=ri){const l=this.elements,c=1/(e-t),h=1/(n-s),d=1/(a-o),u=(e+t)*c,p=(n+s)*h;let m,_;if(r===ri)m=(a+o)*d,_=-2*d;else if(r===ja)m=o*d,_=-1*d;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+r);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-u,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-p,l[2]=0,l[6]=0,l[10]=_,l[14]=-m,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(t){const e=this.elements,n=t.elements;for(let s=0;s<16;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}}const _s=new L,Pn=new Qt,pm=new L(0,0,0),mm=new L(1,1,1),xi=new L,Zo=new L,an=new L,Fh=new Qt,Nh=new Pi;class Xn{constructor(t=0,e=0,n=0,s=Xn.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,s=this._order){return this._x=t,this._y=e,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){const s=t.elements,o=s[0],a=s[4],r=s[8],l=s[1],c=s[5],h=s[9],d=s[2],u=s[6],p=s[10];switch(e){case"XYZ":this._y=Math.asin(je(r,-1,1)),Math.abs(r)<.9999999?(this._x=Math.atan2(-h,p),this._z=Math.atan2(-a,o)):(this._x=Math.atan2(u,c),this._z=0);break;case"YXZ":this._x=Math.asin(-je(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(r,p),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-d,o),this._z=0);break;case"ZXY":this._x=Math.asin(je(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-d,p),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,o));break;case"ZYX":this._y=Math.asin(-je(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(u,p),this._z=Math.atan2(l,o)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(je(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-d,o)):(this._x=0,this._y=Math.atan2(r,p));break;case"XZY":this._z=Math.asin(-je(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(u,c),this._y=Math.atan2(r,o)):(this._x=Math.atan2(-h,p),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return Fh.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Fh,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Nh.setFromEuler(this),this.setFromQuaternion(Nh,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Xn.DEFAULT_ORDER="XYZ";class Yc{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}}let gm=0;const Oh=new L,vs=new Pi,Qn=new Qt,Ko=new L,lo=new L,_m=new L,vm=new Pi,kh=new L(1,0,0),zh=new L(0,1,0),Bh=new L(0,0,1),Hh={type:"added"},xm={type:"removed"},xs={type:"childadded",child:null},zr={type:"childremoved",child:null};class Se extends ls{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:gm++}),this.uuid=Bo(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Se.DEFAULT_UP.clone();const t=new L,e=new Xn,n=new Pi,s=new L(1,1,1);function o(){n.setFromEuler(e,!1)}function a(){e.setFromQuaternion(n,void 0,!1)}e._onChange(o),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Qt},normalMatrix:{value:new Ft}}),this.matrix=new Qt,this.matrixWorld=new Qt,this.matrixAutoUpdate=Se.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Se.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Yc,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return vs.setFromAxisAngle(t,e),this.quaternion.multiply(vs),this}rotateOnWorldAxis(t,e){return vs.setFromAxisAngle(t,e),this.quaternion.premultiply(vs),this}rotateX(t){return this.rotateOnAxis(kh,t)}rotateY(t){return this.rotateOnAxis(zh,t)}rotateZ(t){return this.rotateOnAxis(Bh,t)}translateOnAxis(t,e){return Oh.copy(t).applyQuaternion(this.quaternion),this.position.add(Oh.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(kh,t)}translateY(t){return this.translateOnAxis(zh,t)}translateZ(t){return this.translateOnAxis(Bh,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Qn.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?Ko.copy(t):Ko.set(t,e,n);const s=this.parent;this.updateWorldMatrix(!0,!1),lo.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Qn.lookAt(lo,Ko,this.up):Qn.lookAt(Ko,lo,this.up),this.quaternion.setFromRotationMatrix(Qn),s&&(Qn.extractRotation(s.matrixWorld),vs.setFromRotationMatrix(Qn),this.quaternion.premultiply(vs.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Hh),xs.child=t,this.dispatchEvent(xs),xs.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(xm),zr.child=t,this.dispatchEvent(zr),zr.child=null),this}removeFromParent(){const t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Qn.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Qn.multiply(t.parent.matrixWorld)),t.applyMatrix4(Qn),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Hh),xs.child=t,this.dispatchEvent(xs),xs.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,s=this.children.length;n<s;n++){const a=this.children[n].getObjectByProperty(t,e);if(a!==void 0)return a}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);const s=this.children;for(let o=0,a=s.length;o<a;o++)s[o].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(lo,t,_m),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(lo,vm,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);const e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverseVisible(t)}traverseAncestors(t){const e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e){const n=this.parent;if(t===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),e===!0){const s=this.children;for(let o=0,a=s.length;o<a;o++)s[o].updateWorldMatrix(!1,!0)}}toJSON(t){const e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.visibility=this._visibility,s.active=this._active,s.bounds=this._bounds.map(r=>({boxInitialized:r.boxInitialized,boxMin:r.box.min.toArray(),boxMax:r.box.max.toArray(),sphereInitialized:r.sphereInitialized,sphereRadius:r.sphere.radius,sphereCenter:r.sphere.center.toArray()})),s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.geometryCount=this._geometryCount,s.matricesTexture=this._matricesTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere={center:s.boundingSphere.center.toArray(),radius:s.boundingSphere.radius}),this.boundingBox!==null&&(s.boundingBox={min:s.boundingBox.min.toArray(),max:s.boundingBox.max.toArray()}));function o(r,l){return r[l.uuid]===void 0&&(r[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=o(t.geometries,this.geometry);const r=this.geometry.parameters;if(r!==void 0&&r.shapes!==void 0){const l=r.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){const d=l[c];o(t.shapes,d)}else o(t.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(o(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const r=[];for(let l=0,c=this.material.length;l<c;l++)r.push(o(t.materials,this.material[l]));s.material=r}else s.material=o(t.materials,this.material);if(this.children.length>0){s.children=[];for(let r=0;r<this.children.length;r++)s.children.push(this.children[r].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let r=0;r<this.animations.length;r++){const l=this.animations[r];s.animations.push(o(t.animations,l))}}if(e){const r=a(t.geometries),l=a(t.materials),c=a(t.textures),h=a(t.images),d=a(t.shapes),u=a(t.skeletons),p=a(t.animations),m=a(t.nodes);r.length>0&&(n.geometries=r),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),d.length>0&&(n.shapes=d),u.length>0&&(n.skeletons=u),p.length>0&&(n.animations=p),m.length>0&&(n.nodes=m)}return n.object=s,n;function a(r){const l=[];for(const c in r){const h=r[c];delete h.metadata,l.push(h)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){const s=t.children[n];this.add(s.clone())}return this}}Se.DEFAULT_UP=new L(0,1,0);Se.DEFAULT_MATRIX_AUTO_UPDATE=!0;Se.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const Ln=new L,ti=new L,Br=new L,ei=new L,ys=new L,Ms=new L,Gh=new L,Hr=new L,Gr=new L,Vr=new L,Wr=new be,$r=new be,Xr=new be;class Sn{constructor(t=new L,e=new L,n=new L){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,s){s.subVectors(n,e),Ln.subVectors(t,e),s.cross(Ln);const o=s.lengthSq();return o>0?s.multiplyScalar(1/Math.sqrt(o)):s.set(0,0,0)}static getBarycoord(t,e,n,s,o){Ln.subVectors(s,e),ti.subVectors(n,e),Br.subVectors(t,e);const a=Ln.dot(Ln),r=Ln.dot(ti),l=Ln.dot(Br),c=ti.dot(ti),h=ti.dot(Br),d=a*c-r*r;if(d===0)return o.set(0,0,0),null;const u=1/d,p=(c*l-r*h)*u,m=(a*h-r*l)*u;return o.set(1-p-m,m,p)}static containsPoint(t,e,n,s){return this.getBarycoord(t,e,n,s,ei)===null?!1:ei.x>=0&&ei.y>=0&&ei.x+ei.y<=1}static getInterpolation(t,e,n,s,o,a,r,l){return this.getBarycoord(t,e,n,s,ei)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(o,ei.x),l.addScaledVector(a,ei.y),l.addScaledVector(r,ei.z),l)}static getInterpolatedAttribute(t,e,n,s,o,a){return Wr.setScalar(0),$r.setScalar(0),Xr.setScalar(0),Wr.fromBufferAttribute(t,e),$r.fromBufferAttribute(t,n),Xr.fromBufferAttribute(t,s),a.setScalar(0),a.addScaledVector(Wr,o.x),a.addScaledVector($r,o.y),a.addScaledVector(Xr,o.z),a}static isFrontFacing(t,e,n,s){return Ln.subVectors(n,e),ti.subVectors(t,e),Ln.cross(ti).dot(s)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,s){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,n,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return Ln.subVectors(this.c,this.b),ti.subVectors(this.a,this.b),Ln.cross(ti).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return Sn.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return Sn.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,s,o){return Sn.getInterpolation(t,this.a,this.b,this.c,e,n,s,o)}containsPoint(t){return Sn.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return Sn.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){const n=this.a,s=this.b,o=this.c;let a,r;ys.subVectors(s,n),Ms.subVectors(o,n),Hr.subVectors(t,n);const l=ys.dot(Hr),c=Ms.dot(Hr);if(l<=0&&c<=0)return e.copy(n);Gr.subVectors(t,s);const h=ys.dot(Gr),d=Ms.dot(Gr);if(h>=0&&d<=h)return e.copy(s);const u=l*d-h*c;if(u<=0&&l>=0&&h<=0)return a=l/(l-h),e.copy(n).addScaledVector(ys,a);Vr.subVectors(t,o);const p=ys.dot(Vr),m=Ms.dot(Vr);if(m>=0&&p<=m)return e.copy(o);const _=p*c-l*m;if(_<=0&&c>=0&&m<=0)return r=c/(c-m),e.copy(n).addScaledVector(Ms,r);const g=h*m-p*d;if(g<=0&&d-h>=0&&p-m>=0)return Gh.subVectors(o,s),r=(d-h)/(d-h+(p-m)),e.copy(s).addScaledVector(Gh,r);const f=1/(g+_+u);return a=_*f,r=u*f,e.copy(n).addScaledVector(ys,a).addScaledVector(Ms,r)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}}const Fu={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},yi={h:0,s:0,l:0},Jo={h:0,s:0,l:0};function qr(i,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?i+(t-i)*6*e:e<1/2?t:e<2/3?i+(t-i)*6*(2/3-e):i}class Ot{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){const s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=dn){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,Yt.toWorkingColorSpace(this,e),this}setRGB(t,e,n,s=Yt.workingColorSpace){return this.r=t,this.g=e,this.b=n,Yt.toWorkingColorSpace(this,s),this}setHSL(t,e,n,s=Yt.workingColorSpace){if(t=nm(t,1),e=je(e,0,1),n=je(n,0,1),e===0)this.r=this.g=this.b=n;else{const o=n<=.5?n*(1+e):n+e-n*e,a=2*n-o;this.r=qr(a,o,t+1/3),this.g=qr(a,o,t),this.b=qr(a,o,t-1/3)}return Yt.toWorkingColorSpace(this,s),this}setStyle(t,e=dn){function n(o){o!==void 0&&parseFloat(o)<1&&console.warn("THREE.Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let o;const a=s[1],r=s[2];switch(a){case"rgb":case"rgba":if(o=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(r))return n(o[4]),this.setRGB(Math.min(255,parseInt(o[1],10))/255,Math.min(255,parseInt(o[2],10))/255,Math.min(255,parseInt(o[3],10))/255,e);if(o=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(r))return n(o[4]),this.setRGB(Math.min(100,parseInt(o[1],10))/100,Math.min(100,parseInt(o[2],10))/100,Math.min(100,parseInt(o[3],10))/100,e);break;case"hsl":case"hsla":if(o=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(r))return n(o[4]),this.setHSL(parseFloat(o[1])/360,parseFloat(o[2])/100,parseFloat(o[3])/100,e);break;default:console.warn("THREE.Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){const o=s[1],a=o.length;if(a===3)return this.setRGB(parseInt(o.charAt(0),16)/15,parseInt(o.charAt(1),16)/15,parseInt(o.charAt(2),16)/15,e);if(a===6)return this.setHex(parseInt(o,16),e);console.warn("THREE.Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=dn){const n=Fu[t.toLowerCase()];return n!==void 0?this.setHex(n,e):console.warn("THREE.Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=hi(t.r),this.g=hi(t.g),this.b=hi(t.b),this}copyLinearToSRGB(t){return this.r=Os(t.r),this.g=Os(t.g),this.b=Os(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=dn){return Yt.fromWorkingColorSpace(He.copy(this),t),Math.round(je(He.r*255,0,255))*65536+Math.round(je(He.g*255,0,255))*256+Math.round(je(He.b*255,0,255))}getHexString(t=dn){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=Yt.workingColorSpace){Yt.fromWorkingColorSpace(He.copy(this),e);const n=He.r,s=He.g,o=He.b,a=Math.max(n,s,o),r=Math.min(n,s,o);let l,c;const h=(r+a)/2;if(r===a)l=0,c=0;else{const d=a-r;switch(c=h<=.5?d/(a+r):d/(2-a-r),a){case n:l=(s-o)/d+(s<o?6:0);break;case s:l=(o-n)/d+2;break;case o:l=(n-s)/d+4;break}l/=6}return t.h=l,t.s=c,t.l=h,t}getRGB(t,e=Yt.workingColorSpace){return Yt.fromWorkingColorSpace(He.copy(this),e),t.r=He.r,t.g=He.g,t.b=He.b,t}getStyle(t=dn){Yt.fromWorkingColorSpace(He.copy(this),t);const e=He.r,n=He.g,s=He.b;return t!==dn?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(t,e,n){return this.getHSL(yi),this.setHSL(yi.h+t,yi.s+e,yi.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(yi),t.getHSL(Jo);const n=Pr(yi.h,Jo.h,e),s=Pr(yi.s,Jo.s,e),o=Pr(yi.l,Jo.l,e);return this.setHSL(n,s,o),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){const e=this.r,n=this.g,s=this.b,o=t.elements;return this.r=o[0]*e+o[3]*n+o[6]*s,this.g=o[1]*e+o[4]*n+o[7]*s,this.b=o[2]*e+o[5]*n+o[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const He=new Ot;Ot.NAMES=Fu;let ym=0;class hs extends ls{static get type(){return"Material"}get type(){return this.constructor.type}set type(t){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:ym++}),this.uuid=Bo(),this.name="",this.blending=Fs,this.side=Ci,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Ml,this.blendDst=bl,this.blendEquation=Yi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ot(0,0,0),this.blendAlpha=0,this.depthFunc=Gs,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Eh,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=us,this.stencilZFail=us,this.stencilZPass=us,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(const e in t){const n=t[e];if(n===void 0){console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);continue}const s=this[e];if(s===void 0){console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[e]=n}}toJSON(t){const e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});const n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Fs&&(n.blending=this.blending),this.side!==Ci&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Ml&&(n.blendSrc=this.blendSrc),this.blendDst!==bl&&(n.blendDst=this.blendDst),this.blendEquation!==Yi&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Gs&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Eh&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==us&&(n.stencilFail=this.stencilFail),this.stencilZFail!==us&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==us&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(o){const a=[];for(const r in o){const l=o[r];delete l.metadata,a.push(l)}return a}if(e){const o=s(t.textures),a=s(t.images);o.length>0&&(n.textures=o),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;const e=t.clippingPlanes;let n=null;if(e!==null){const s=e.length;n=new Array(s);for(let o=0;o!==s;++o)n[o]=e[o].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class Oe extends hs{static get type(){return"MeshBasicMaterial"}constructor(t){super(),this.isMeshBasicMaterial=!0,this.color=new Ot(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Xn,this.combine=vu,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}}const Te=new L,Qo=new Et;class Me{constructor(t,e,n=!1){if(Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=Th,this.updateRanges=[],this.gpuType=$n,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let s=0,o=this.itemSize;s<o;s++)this.array[t+s]=e.array[n+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)Qo.fromBufferAttribute(this,e),Qo.applyMatrix3(t),this.setXY(e,Qo.x,Qo.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)Te.fromBufferAttribute(this,e),Te.applyMatrix3(t),this.setXYZ(e,Te.x,Te.y,Te.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)Te.fromBufferAttribute(this,e),Te.applyMatrix4(t),this.setXYZ(e,Te.x,Te.y,Te.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)Te.fromBufferAttribute(this,e),Te.applyNormalMatrix(t),this.setXYZ(e,Te.x,Te.y,Te.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)Te.fromBufferAttribute(this,e),Te.transformDirection(t),this.setXYZ(e,Te.x,Te.y,Te.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=oo(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=Qe(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=oo(e,this.array)),e}setX(t,e){return this.normalized&&(e=Qe(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=oo(e,this.array)),e}setY(t,e){return this.normalized&&(e=Qe(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=oo(e,this.array)),e}setZ(t,e){return this.normalized&&(e=Qe(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=oo(e,this.array)),e}setW(t,e){return this.normalized&&(e=Qe(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=Qe(e,this.array),n=Qe(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,s){return t*=this.itemSize,this.normalized&&(e=Qe(e,this.array),n=Qe(n,this.array),s=Qe(s,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this}setXYZW(t,e,n,s,o){return t*=this.itemSize,this.normalized&&(e=Qe(e,this.array),n=Qe(n,this.array),s=Qe(s,this.array),o=Qe(o,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this.array[t+3]=o,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==Th&&(t.usage=this.usage),t}}class Nu extends Me{constructor(t,e,n){super(new Uint16Array(t),e,n)}}class Ou extends Me{constructor(t,e,n){super(new Uint32Array(t),e,n)}}class Zt extends Me{constructor(t,e,n){super(new Float32Array(t),e,n)}}let Mm=0;const mn=new Qt,Yr=new Se,bs=new L,rn=new Di,co=new Di,Ne=new L;class Jt extends ls{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Mm++}),this.uuid=Bo(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(Iu(t)?Ou:Nu)(t,1):this.index=t,this}setIndirect(t){return this.indirect=t,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){const e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const o=new Ft().getNormalMatrix(t);n.applyNormalMatrix(o),n.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return mn.makeRotationFromQuaternion(t),this.applyMatrix4(mn),this}rotateX(t){return mn.makeRotationX(t),this.applyMatrix4(mn),this}rotateY(t){return mn.makeRotationY(t),this.applyMatrix4(mn),this}rotateZ(t){return mn.makeRotationZ(t),this.applyMatrix4(mn),this}translate(t,e,n){return mn.makeTranslation(t,e,n),this.applyMatrix4(mn),this}scale(t,e,n){return mn.makeScale(t,e,n),this.applyMatrix4(mn),this}lookAt(t){return Yr.lookAt(t),Yr.updateMatrix(),this.applyMatrix4(Yr.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(bs).negate(),this.translate(bs.x,bs.y,bs.z),this}setFromPoints(t){const e=this.getAttribute("position");if(e===void 0){const n=[];for(let s=0,o=t.length;s<o;s++){const a=t[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new Zt(n,3))}else{for(let n=0,s=e.count;n<s;n++){const o=t[n];e.setXYZ(n,o.x,o.y,o.z||0)}t.length>e.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Di);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new L(-1/0,-1/0,-1/0),new L(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,s=e.length;n<s;n++){const o=e[n];rn.setFromBufferAttribute(o),this.morphTargetsRelative?(Ne.addVectors(this.boundingBox.min,rn.min),this.boundingBox.expandByPoint(Ne),Ne.addVectors(this.boundingBox.max,rn.max),this.boundingBox.expandByPoint(Ne)):(this.boundingBox.expandByPoint(rn.min),this.boundingBox.expandByPoint(rn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new cs);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new L,1/0);return}if(t){const n=this.boundingSphere.center;if(rn.setFromBufferAttribute(t),e)for(let o=0,a=e.length;o<a;o++){const r=e[o];co.setFromBufferAttribute(r),this.morphTargetsRelative?(Ne.addVectors(rn.min,co.min),rn.expandByPoint(Ne),Ne.addVectors(rn.max,co.max),rn.expandByPoint(Ne)):(rn.expandByPoint(co.min),rn.expandByPoint(co.max))}rn.getCenter(n);let s=0;for(let o=0,a=t.count;o<a;o++)Ne.fromBufferAttribute(t,o),s=Math.max(s,n.distanceToSquared(Ne));if(e)for(let o=0,a=e.length;o<a;o++){const r=e[o],l=this.morphTargetsRelative;for(let c=0,h=r.count;c<h;c++)Ne.fromBufferAttribute(r,c),l&&(bs.fromBufferAttribute(t,c),Ne.add(bs)),s=Math.max(s,n.distanceToSquared(Ne))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=e.position,s=e.normal,o=e.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Me(new Float32Array(4*n.count),4));const a=this.getAttribute("tangent"),r=[],l=[];for(let R=0;R<n.count;R++)r[R]=new L,l[R]=new L;const c=new L,h=new L,d=new L,u=new Et,p=new Et,m=new Et,_=new L,g=new L;function f(R,b,M){c.fromBufferAttribute(n,R),h.fromBufferAttribute(n,b),d.fromBufferAttribute(n,M),u.fromBufferAttribute(o,R),p.fromBufferAttribute(o,b),m.fromBufferAttribute(o,M),h.sub(c),d.sub(c),p.sub(u),m.sub(u);const C=1/(p.x*m.y-m.x*p.y);isFinite(C)&&(_.copy(h).multiplyScalar(m.y).addScaledVector(d,-p.y).multiplyScalar(C),g.copy(d).multiplyScalar(p.x).addScaledVector(h,-m.x).multiplyScalar(C),r[R].add(_),r[b].add(_),r[M].add(_),l[R].add(g),l[b].add(g),l[M].add(g))}let x=this.groups;x.length===0&&(x=[{start:0,count:t.count}]);for(let R=0,b=x.length;R<b;++R){const M=x[R],C=M.start,U=M.count;for(let O=C,B=C+U;O<B;O+=3)f(t.getX(O+0),t.getX(O+1),t.getX(O+2))}const y=new L,v=new L,w=new L,E=new L;function S(R){w.fromBufferAttribute(s,R),E.copy(w);const b=r[R];y.copy(b),y.sub(w.multiplyScalar(w.dot(b))).normalize(),v.crossVectors(E,b);const C=v.dot(l[R])<0?-1:1;a.setXYZW(R,y.x,y.y,y.z,C)}for(let R=0,b=x.length;R<b;++R){const M=x[R],C=M.start,U=M.count;for(let O=C,B=C+U;O<B;O+=3)S(t.getX(O+0)),S(t.getX(O+1)),S(t.getX(O+2))}}computeVertexNormals(){const t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Me(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let u=0,p=n.count;u<p;u++)n.setXYZ(u,0,0,0);const s=new L,o=new L,a=new L,r=new L,l=new L,c=new L,h=new L,d=new L;if(t)for(let u=0,p=t.count;u<p;u+=3){const m=t.getX(u+0),_=t.getX(u+1),g=t.getX(u+2);s.fromBufferAttribute(e,m),o.fromBufferAttribute(e,_),a.fromBufferAttribute(e,g),h.subVectors(a,o),d.subVectors(s,o),h.cross(d),r.fromBufferAttribute(n,m),l.fromBufferAttribute(n,_),c.fromBufferAttribute(n,g),r.add(h),l.add(h),c.add(h),n.setXYZ(m,r.x,r.y,r.z),n.setXYZ(_,l.x,l.y,l.z),n.setXYZ(g,c.x,c.y,c.z)}else for(let u=0,p=e.count;u<p;u+=3)s.fromBufferAttribute(e,u+0),o.fromBufferAttribute(e,u+1),a.fromBufferAttribute(e,u+2),h.subVectors(a,o),d.subVectors(s,o),h.cross(d),n.setXYZ(u+0,h.x,h.y,h.z),n.setXYZ(u+1,h.x,h.y,h.z),n.setXYZ(u+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)Ne.fromBufferAttribute(t,e),Ne.normalize(),t.setXYZ(e,Ne.x,Ne.y,Ne.z)}toNonIndexed(){function t(r,l){const c=r.array,h=r.itemSize,d=r.normalized,u=new c.constructor(l.length*h);let p=0,m=0;for(let _=0,g=l.length;_<g;_++){r.isInterleavedBufferAttribute?p=l[_]*r.data.stride+r.offset:p=l[_]*h;for(let f=0;f<h;f++)u[m++]=c[p++]}return new Me(u,h,d)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const e=new Jt,n=this.index.array,s=this.attributes;for(const r in s){const l=s[r],c=t(l,n);e.setAttribute(r,c)}const o=this.morphAttributes;for(const r in o){const l=[],c=o[r];for(let h=0,d=c.length;h<d;h++){const u=c[h],p=t(u,n);l.push(p)}e.morphAttributes[r]=l}e.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let r=0,l=a.length;r<l;r++){const c=a[r];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){const t={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};const e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});const n=this.attributes;for(const l in n){const c=n[l];t.data.attributes[l]=c.toJSON(t.data)}const s={};let o=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],h=[];for(let d=0,u=c.length;d<u;d++){const p=c[d];h.push(p.toJSON(t.data))}h.length>0&&(s[l]=h,o=!0)}o&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(t.data.groups=JSON.parse(JSON.stringify(a)));const r=this.boundingSphere;return r!==null&&(t.data.boundingSphere={center:r.center.toArray(),radius:r.radius}),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const e={};this.name=t.name;const n=t.index;n!==null&&this.setIndex(n.clone(e));const s=t.attributes;for(const c in s){const h=s[c];this.setAttribute(c,h.clone(e))}const o=t.morphAttributes;for(const c in o){const h=[],d=o[c];for(let u=0,p=d.length;u<p;u++)h.push(d[u].clone(e));this.morphAttributes[c]=h}this.morphTargetsRelative=t.morphTargetsRelative;const a=t.groups;for(let c=0,h=a.length;c<h;c++){const d=a[c];this.addGroup(d.start,d.count,d.materialIndex)}const r=t.boundingBox;r!==null&&(this.boundingBox=r.clone());const l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Vh=new Qt,Oi=new Ho,ta=new cs,Wh=new L,ea=new L,na=new L,ia=new L,jr=new L,sa=new L,$h=new L,oa=new L;class st extends Se{constructor(t=new Jt,e=new Oe){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let o=0,a=s.length;o<a;o++){const r=s[o].name||String(o);this.morphTargetInfluences.push(0),this.morphTargetDictionary[r]=o}}}}getVertexPosition(t,e){const n=this.geometry,s=n.attributes.position,o=n.morphAttributes.position,a=n.morphTargetsRelative;e.fromBufferAttribute(s,t);const r=this.morphTargetInfluences;if(o&&r){sa.set(0,0,0);for(let l=0,c=o.length;l<c;l++){const h=r[l],d=o[l];h!==0&&(jr.fromBufferAttribute(d,t),a?sa.addScaledVector(jr,h):sa.addScaledVector(jr.sub(e),h))}e.add(sa)}return e}raycast(t,e){const n=this.geometry,s=this.material,o=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),ta.copy(n.boundingSphere),ta.applyMatrix4(o),Oi.copy(t.ray).recast(t.near),!(ta.containsPoint(Oi.origin)===!1&&(Oi.intersectSphere(ta,Wh)===null||Oi.origin.distanceToSquared(Wh)>(t.far-t.near)**2))&&(Vh.copy(o).invert(),Oi.copy(t.ray).applyMatrix4(Vh),!(n.boundingBox!==null&&Oi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,Oi)))}_computeIntersections(t,e,n){let s;const o=this.geometry,a=this.material,r=o.index,l=o.attributes.position,c=o.attributes.uv,h=o.attributes.uv1,d=o.attributes.normal,u=o.groups,p=o.drawRange;if(r!==null)if(Array.isArray(a))for(let m=0,_=u.length;m<_;m++){const g=u[m],f=a[g.materialIndex],x=Math.max(g.start,p.start),y=Math.min(r.count,Math.min(g.start+g.count,p.start+p.count));for(let v=x,w=y;v<w;v+=3){const E=r.getX(v),S=r.getX(v+1),R=r.getX(v+2);s=aa(this,f,t,n,c,h,d,E,S,R),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=g.materialIndex,e.push(s))}}else{const m=Math.max(0,p.start),_=Math.min(r.count,p.start+p.count);for(let g=m,f=_;g<f;g+=3){const x=r.getX(g),y=r.getX(g+1),v=r.getX(g+2);s=aa(this,a,t,n,c,h,d,x,y,v),s&&(s.faceIndex=Math.floor(g/3),e.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let m=0,_=u.length;m<_;m++){const g=u[m],f=a[g.materialIndex],x=Math.max(g.start,p.start),y=Math.min(l.count,Math.min(g.start+g.count,p.start+p.count));for(let v=x,w=y;v<w;v+=3){const E=v,S=v+1,R=v+2;s=aa(this,f,t,n,c,h,d,E,S,R),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=g.materialIndex,e.push(s))}}else{const m=Math.max(0,p.start),_=Math.min(l.count,p.start+p.count);for(let g=m,f=_;g<f;g+=3){const x=g,y=g+1,v=g+2;s=aa(this,a,t,n,c,h,d,x,y,v),s&&(s.faceIndex=Math.floor(g/3),e.push(s))}}}}function bm(i,t,e,n,s,o,a,r){let l;if(t.side===Ke?l=n.intersectTriangle(a,o,s,!0,r):l=n.intersectTriangle(s,o,a,t.side===Ci,r),l===null)return null;oa.copy(r),oa.applyMatrix4(i.matrixWorld);const c=e.ray.origin.distanceTo(oa);return c<e.near||c>e.far?null:{distance:c,point:oa.clone(),object:i}}function aa(i,t,e,n,s,o,a,r,l,c){i.getVertexPosition(r,ea),i.getVertexPosition(l,na),i.getVertexPosition(c,ia);const h=bm(i,t,e,n,ea,na,ia,$h);if(h){const d=new L;Sn.getBarycoord($h,ea,na,ia,d),s&&(h.uv=Sn.getInterpolatedAttribute(s,r,l,c,d,new Et)),o&&(h.uv1=Sn.getInterpolatedAttribute(o,r,l,c,d,new Et)),a&&(h.normal=Sn.getInterpolatedAttribute(a,r,l,c,d,new L),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));const u={a:r,b:l,c,normal:new L,materialIndex:0};Sn.getNormal(ea,na,ia,u.normal),h.face=u,h.barycoord=d}return h}class ie extends Jt{constructor(t=1,e=1,n=1,s=1,o=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:s,heightSegments:o,depthSegments:a};const r=this;s=Math.floor(s),o=Math.floor(o),a=Math.floor(a);const l=[],c=[],h=[],d=[];let u=0,p=0;m("z","y","x",-1,-1,n,e,t,a,o,0),m("z","y","x",1,-1,n,e,-t,a,o,1),m("x","z","y",1,1,t,n,e,s,a,2),m("x","z","y",1,-1,t,n,-e,s,a,3),m("x","y","z",1,-1,t,e,n,s,o,4),m("x","y","z",-1,-1,t,e,-n,s,o,5),this.setIndex(l),this.setAttribute("position",new Zt(c,3)),this.setAttribute("normal",new Zt(h,3)),this.setAttribute("uv",new Zt(d,2));function m(_,g,f,x,y,v,w,E,S,R,b){const M=v/S,C=w/R,U=v/2,O=w/2,B=E/2,X=S+1,W=R+1;let Y=0,V=0;const it=new L;for(let Q=0;Q<W;Q++){const ft=Q*C-O;for(let Bt=0;Bt<X;Bt++){const Kt=Bt*M-U;it[_]=Kt*x,it[g]=ft*y,it[f]=B,c.push(it.x,it.y,it.z),it[_]=0,it[g]=0,it[f]=E>0?1:-1,h.push(it.x,it.y,it.z),d.push(Bt/S),d.push(1-Q/R),Y+=1}}for(let Q=0;Q<R;Q++)for(let ft=0;ft<S;ft++){const Bt=u+ft+X*Q,Kt=u+ft+X*(Q+1),q=u+(ft+1)+X*(Q+1),tt=u+(ft+1)+X*Q;l.push(Bt,Kt,tt),l.push(Kt,q,tt),V+=6}r.addGroup(p,V,b),p+=V,u+=Y}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new ie(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}}function qs(i){const t={};for(const e in i){t[e]={};for(const n in i[e]){const s=i[e][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=s.clone():Array.isArray(s)?t[e][n]=s.slice():t[e][n]=s}}return t}function Xe(i){const t={};for(let e=0;e<i.length;e++){const n=qs(i[e]);for(const s in n)t[s]=n[s]}return t}function Sm(i){const t=[];for(let e=0;e<i.length;e++)t.push(i[e].clone());return t}function ku(i){const t=i.getRenderTarget();return t===null?i.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:Yt.workingColorSpace}const zu={clone:qs,merge:Xe};var wm=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Em=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class fi extends hs{static get type(){return"ShaderMaterial"}constructor(t){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=wm,this.fragmentShader=Em,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=qs(t.uniforms),this.uniformsGroups=Sm(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this}toJSON(t){const e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(const s in this.uniforms){const a=this.uniforms[s].value;a&&a.isTexture?e.uniforms[s]={type:"t",value:a.toJSON(t).uuid}:a&&a.isColor?e.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?e.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?e.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?e.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?e.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?e.uniforms[s]={type:"m4",value:a.toArray()}:e.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;const n={};for(const s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}}class Bu extends Se{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Qt,this.projectionMatrix=new Qt,this.projectionMatrixInverse=new Qt,this.coordinateSystem=ri}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(t,e){super.updateWorldMatrix(t,e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Mi=new L,Xh=new Et,qh=new Et;class yn extends Bu{constructor(t=50,e=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){const e=.5*this.getFilmHeight()/t;this.fov=oc*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){const t=Math.tan(Ro*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return oc*2*Math.atan(Math.tan(Ro*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){Mi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(Mi.x,Mi.y).multiplyScalar(-t/Mi.z),Mi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Mi.x,Mi.y).multiplyScalar(-t/Mi.z)}getViewSize(t,e){return this.getViewBounds(t,Xh,qh),e.subVectors(qh,Xh)}setViewOffset(t,e,n,s,o,a){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=o,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=this.near;let e=t*Math.tan(Ro*.5*this.fov)/this.zoom,n=2*e,s=this.aspect*n,o=-.5*s;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,c=a.fullHeight;o+=a.offsetX*s/l,e-=a.offsetY*n/c,s*=a.width/l,n*=a.height/c}const r=this.filmOffset;r!==0&&(o+=t*r/this.getFilmWidth()),this.projectionMatrix.makePerspective(o,o+s,e,e-n,t,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}}const Ss=-90,ws=1;class Tm extends Se{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new yn(Ss,ws,t,e);s.layers=this.layers,this.add(s);const o=new yn(Ss,ws,t,e);o.layers=this.layers,this.add(o);const a=new yn(Ss,ws,t,e);a.layers=this.layers,this.add(a);const r=new yn(Ss,ws,t,e);r.layers=this.layers,this.add(r);const l=new yn(Ss,ws,t,e);l.layers=this.layers,this.add(l);const c=new yn(Ss,ws,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const t=this.coordinateSystem,e=this.children.concat(),[n,s,o,a,r,l]=e;for(const c of e)this.remove(c);if(t===ri)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),o.up.set(0,0,-1),o.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),r.up.set(0,1,0),r.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===ja)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),o.up.set(0,0,1),o.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),r.up.set(0,-1,0),r.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(const c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());const[o,a,r,l,c,h]=this.children,d=t.getRenderTarget(),u=t.getActiveCubeFace(),p=t.getActiveMipmapLevel(),m=t.xr.enabled;t.xr.enabled=!1;const _=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,t.setRenderTarget(n,0,s),t.render(e,o),t.setRenderTarget(n,1,s),t.render(e,a),t.setRenderTarget(n,2,s),t.render(e,r),t.setRenderTarget(n,3,s),t.render(e,l),t.setRenderTarget(n,4,s),t.render(e,c),n.texture.generateMipmaps=_,t.setRenderTarget(n,5,s),t.render(e,h),t.setRenderTarget(d,u,p),t.xr.enabled=m,n.texture.needsPMREMUpdate=!0}}class Hu extends We{constructor(t,e,n,s,o,a,r,l,c,h){t=t!==void 0?t:[],e=e!==void 0?e:Vs,super(t,e,n,s,o,a,r,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}}class Am extends ns{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;const n={width:t,height:t,depth:1},s=[n,n,n,n,n,n];this.texture=new Hu(s,e.mapping,e.wrapS,e.wrapT,e.magFilter,e.minFilter,e.format,e.type,e.anisotropy,e.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=e.generateMipmaps!==void 0?e.generateMipmaps:!1,this.texture.minFilter=e.minFilter!==void 0?e.minFilter:Wn}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new ie(5,5,5),o=new fi({name:"CubemapFromEquirect",uniforms:qs(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Ke,blending:Ei});o.uniforms.tEquirect.value=e;const a=new st(s,o),r=e.minFilter;return e.minFilter===Ki&&(e.minFilter=Wn),new Tm(1,10,this).update(t,a),e.minFilter=r,a.geometry.dispose(),a.material.dispose(),this}clear(t,e,n,s){const o=t.getRenderTarget();for(let a=0;a<6;a++)t.setRenderTarget(this,a),t.clear(e,n,s);t.setRenderTarget(o)}}const Zr=new L,Rm=new L,Cm=new Ft;class Gn{constructor(t=new L(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,s){return this.normal.set(t,e,n),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){const s=Zr.subVectors(n,e).cross(Rm.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){const t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e){const n=t.delta(Zr),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;const o=-(t.start.dot(this.normal)+this.constant)/s;return o<0||o>1?null:e.copy(t.start).addScaledVector(n,o)}intersectsLine(t){const e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){const n=e||Cm.getNormalMatrix(t),s=this.coplanarPoint(Zr).applyMatrix4(t),o=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(o),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}}const ki=new cs,ra=new L;class jc{constructor(t=new Gn,e=new Gn,n=new Gn,s=new Gn,o=new Gn,a=new Gn){this.planes=[t,e,n,s,o,a]}set(t,e,n,s,o,a){const r=this.planes;return r[0].copy(t),r[1].copy(e),r[2].copy(n),r[3].copy(s),r[4].copy(o),r[5].copy(a),this}copy(t){const e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=ri){const n=this.planes,s=t.elements,o=s[0],a=s[1],r=s[2],l=s[3],c=s[4],h=s[5],d=s[6],u=s[7],p=s[8],m=s[9],_=s[10],g=s[11],f=s[12],x=s[13],y=s[14],v=s[15];if(n[0].setComponents(l-o,u-c,g-p,v-f).normalize(),n[1].setComponents(l+o,u+c,g+p,v+f).normalize(),n[2].setComponents(l+a,u+h,g+m,v+x).normalize(),n[3].setComponents(l-a,u-h,g-m,v-x).normalize(),n[4].setComponents(l-r,u-d,g-_,v-y).normalize(),e===ri)n[5].setComponents(l+r,u+d,g+_,v+y).normalize();else if(e===ja)n[5].setComponents(r,d,_,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),ki.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{const e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),ki.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(ki)}intersectsSprite(t){return ki.center.set(0,0,0),ki.radius=.7071067811865476,ki.applyMatrix4(t.matrixWorld),this.intersectsSphere(ki)}intersectsSphere(t){const e=this.planes,n=t.center,s=-t.radius;for(let o=0;o<6;o++)if(e[o].distanceToPoint(n)<s)return!1;return!0}intersectsBox(t){const e=this.planes;for(let n=0;n<6;n++){const s=e[n];if(ra.x=s.normal.x>0?t.max.x:t.min.x,ra.y=s.normal.y>0?t.max.y:t.min.y,ra.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(ra)<0)return!1}return!0}containsPoint(t){const e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function Gu(){let i=null,t=!1,e=null,n=null;function s(o,a){e(o,a),n=i.requestAnimationFrame(s)}return{start:function(){t!==!0&&e!==null&&(n=i.requestAnimationFrame(s),t=!0)},stop:function(){i.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(o){e=o},setContext:function(o){i=o}}}function Pm(i){const t=new WeakMap;function e(r,l){const c=r.array,h=r.usage,d=c.byteLength,u=i.createBuffer();i.bindBuffer(l,u),i.bufferData(l,c,h),r.onUploadCallback();let p;if(c instanceof Float32Array)p=i.FLOAT;else if(c instanceof Uint16Array)r.isFloat16BufferAttribute?p=i.HALF_FLOAT:p=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)p=i.SHORT;else if(c instanceof Uint32Array)p=i.UNSIGNED_INT;else if(c instanceof Int32Array)p=i.INT;else if(c instanceof Int8Array)p=i.BYTE;else if(c instanceof Uint8Array)p=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)p=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:u,type:p,bytesPerElement:c.BYTES_PER_ELEMENT,version:r.version,size:d}}function n(r,l,c){const h=l.array,d=l.updateRanges;if(i.bindBuffer(c,r),d.length===0)i.bufferSubData(c,0,h);else{d.sort((p,m)=>p.start-m.start);let u=0;for(let p=1;p<d.length;p++){const m=d[u],_=d[p];_.start<=m.start+m.count+1?m.count=Math.max(m.count,_.start+_.count-m.start):(++u,d[u]=_)}d.length=u+1;for(let p=0,m=d.length;p<m;p++){const _=d[p];i.bufferSubData(c,_.start*h.BYTES_PER_ELEMENT,h,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(r){return r.isInterleavedBufferAttribute&&(r=r.data),t.get(r)}function o(r){r.isInterleavedBufferAttribute&&(r=r.data);const l=t.get(r);l&&(i.deleteBuffer(l.buffer),t.delete(r))}function a(r,l){if(r.isInterleavedBufferAttribute&&(r=r.data),r.isGLBufferAttribute){const h=t.get(r);(!h||h.version<r.version)&&t.set(r,{buffer:r.buffer,type:r.type,bytesPerElement:r.elementSize,version:r.version});return}const c=t.get(r);if(c===void 0)t.set(r,e(r,l));else if(c.version<r.version){if(c.size!==r.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,r,l),c.version=r.version}}return{get:s,remove:o,update:a}}class qn extends Jt{constructor(t=1,e=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:s};const o=t/2,a=e/2,r=Math.floor(n),l=Math.floor(s),c=r+1,h=l+1,d=t/r,u=e/l,p=[],m=[],_=[],g=[];for(let f=0;f<h;f++){const x=f*u-a;for(let y=0;y<c;y++){const v=y*d-o;m.push(v,-x,0),_.push(0,0,1),g.push(y/r),g.push(1-f/l)}}for(let f=0;f<l;f++)for(let x=0;x<r;x++){const y=x+c*f,v=x+c*(f+1),w=x+1+c*(f+1),E=x+1+c*f;p.push(y,v,E),p.push(v,w,E)}this.setIndex(p),this.setAttribute("position",new Zt(m,3)),this.setAttribute("normal",new Zt(_,3)),this.setAttribute("uv",new Zt(g,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new qn(t.width,t.height,t.widthSegments,t.heightSegments)}}var Lm=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Im=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Dm=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Um=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Fm=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Nm=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Om=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,km=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,zm=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,Bm=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Hm=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Gm=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Vm=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Wm=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,$m=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Xm=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,qm=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Ym=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,jm=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Zm=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Km=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Jm=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Qm=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,tg=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,eg=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,ng=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,ig=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,sg=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,og=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,ag=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,rg="gl_FragColor = linearToOutputTexel( gl_FragColor );",lg=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,cg=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,hg=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,dg=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,ug=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,fg=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,pg=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,mg=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,gg=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,_g=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,vg=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,xg=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,yg=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Mg=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,bg=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,Sg=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,wg=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Eg=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Tg=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Ag=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Rg=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Cg=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Pg=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Lg=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Ig=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Dg=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Ug=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Fg=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Ng=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Og=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,kg=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,zg=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Bg=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Hg=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Gg=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Vg=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Wg=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,$g=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Xg=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,qg=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Yg=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,jg=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Zg=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Kg=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Jg=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Qg=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,t0=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,e0=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,n0=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,i0=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,s0=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,o0=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,a0=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,r0=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,l0=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,c0=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,h0=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,d0=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,u0=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,f0=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,p0=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,m0=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,g0=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,_0=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,v0=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,x0=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,y0=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,M0=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,b0=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,S0=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,w0=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,E0=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,T0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,A0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,R0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,C0=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const P0=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,L0=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,I0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,D0=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,U0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,F0=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,N0=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,O0=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,k0=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,z0=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,B0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,H0=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,G0=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,V0=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,W0=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,$0=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,X0=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,q0=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Y0=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,j0=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Z0=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,K0=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,J0=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Q0=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,t_=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,e_=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,n_=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,i_=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,s_=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,o_=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,a_=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,r_=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,l_=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,c_=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,zt={alphahash_fragment:Lm,alphahash_pars_fragment:Im,alphamap_fragment:Dm,alphamap_pars_fragment:Um,alphatest_fragment:Fm,alphatest_pars_fragment:Nm,aomap_fragment:Om,aomap_pars_fragment:km,batching_pars_vertex:zm,batching_vertex:Bm,begin_vertex:Hm,beginnormal_vertex:Gm,bsdfs:Vm,iridescence_fragment:Wm,bumpmap_pars_fragment:$m,clipping_planes_fragment:Xm,clipping_planes_pars_fragment:qm,clipping_planes_pars_vertex:Ym,clipping_planes_vertex:jm,color_fragment:Zm,color_pars_fragment:Km,color_pars_vertex:Jm,color_vertex:Qm,common:tg,cube_uv_reflection_fragment:eg,defaultnormal_vertex:ng,displacementmap_pars_vertex:ig,displacementmap_vertex:sg,emissivemap_fragment:og,emissivemap_pars_fragment:ag,colorspace_fragment:rg,colorspace_pars_fragment:lg,envmap_fragment:cg,envmap_common_pars_fragment:hg,envmap_pars_fragment:dg,envmap_pars_vertex:ug,envmap_physical_pars_fragment:Sg,envmap_vertex:fg,fog_vertex:pg,fog_pars_vertex:mg,fog_fragment:gg,fog_pars_fragment:_g,gradientmap_pars_fragment:vg,lightmap_pars_fragment:xg,lights_lambert_fragment:yg,lights_lambert_pars_fragment:Mg,lights_pars_begin:bg,lights_toon_fragment:wg,lights_toon_pars_fragment:Eg,lights_phong_fragment:Tg,lights_phong_pars_fragment:Ag,lights_physical_fragment:Rg,lights_physical_pars_fragment:Cg,lights_fragment_begin:Pg,lights_fragment_maps:Lg,lights_fragment_end:Ig,logdepthbuf_fragment:Dg,logdepthbuf_pars_fragment:Ug,logdepthbuf_pars_vertex:Fg,logdepthbuf_vertex:Ng,map_fragment:Og,map_pars_fragment:kg,map_particle_fragment:zg,map_particle_pars_fragment:Bg,metalnessmap_fragment:Hg,metalnessmap_pars_fragment:Gg,morphinstance_vertex:Vg,morphcolor_vertex:Wg,morphnormal_vertex:$g,morphtarget_pars_vertex:Xg,morphtarget_vertex:qg,normal_fragment_begin:Yg,normal_fragment_maps:jg,normal_pars_fragment:Zg,normal_pars_vertex:Kg,normal_vertex:Jg,normalmap_pars_fragment:Qg,clearcoat_normal_fragment_begin:t0,clearcoat_normal_fragment_maps:e0,clearcoat_pars_fragment:n0,iridescence_pars_fragment:i0,opaque_fragment:s0,packing:o0,premultiplied_alpha_fragment:a0,project_vertex:r0,dithering_fragment:l0,dithering_pars_fragment:c0,roughnessmap_fragment:h0,roughnessmap_pars_fragment:d0,shadowmap_pars_fragment:u0,shadowmap_pars_vertex:f0,shadowmap_vertex:p0,shadowmask_pars_fragment:m0,skinbase_vertex:g0,skinning_pars_vertex:_0,skinning_vertex:v0,skinnormal_vertex:x0,specularmap_fragment:y0,specularmap_pars_fragment:M0,tonemapping_fragment:b0,tonemapping_pars_fragment:S0,transmission_fragment:w0,transmission_pars_fragment:E0,uv_pars_fragment:T0,uv_pars_vertex:A0,uv_vertex:R0,worldpos_vertex:C0,background_vert:P0,background_frag:L0,backgroundCube_vert:I0,backgroundCube_frag:D0,cube_vert:U0,cube_frag:F0,depth_vert:N0,depth_frag:O0,distanceRGBA_vert:k0,distanceRGBA_frag:z0,equirect_vert:B0,equirect_frag:H0,linedashed_vert:G0,linedashed_frag:V0,meshbasic_vert:W0,meshbasic_frag:$0,meshlambert_vert:X0,meshlambert_frag:q0,meshmatcap_vert:Y0,meshmatcap_frag:j0,meshnormal_vert:Z0,meshnormal_frag:K0,meshphong_vert:J0,meshphong_frag:Q0,meshphysical_vert:t_,meshphysical_frag:e_,meshtoon_vert:n_,meshtoon_frag:i_,points_vert:s_,points_frag:o_,shadow_vert:a_,shadow_frag:r_,sprite_vert:l_,sprite_frag:c_},ot={common:{diffuse:{value:new Ot(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ft},alphaMap:{value:null},alphaMapTransform:{value:new Ft},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ft}},envmap:{envMap:{value:null},envMapRotation:{value:new Ft},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ft}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ft}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ft},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ft},normalScale:{value:new Et(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ft},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ft}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ft}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ft}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ot(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ot(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ft},alphaTest:{value:0},uvTransform:{value:new Ft}},sprite:{diffuse:{value:new Ot(16777215)},opacity:{value:1},center:{value:new Et(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ft},alphaMap:{value:null},alphaMapTransform:{value:new Ft},alphaTest:{value:0}}},Vn={basic:{uniforms:Xe([ot.common,ot.specularmap,ot.envmap,ot.aomap,ot.lightmap,ot.fog]),vertexShader:zt.meshbasic_vert,fragmentShader:zt.meshbasic_frag},lambert:{uniforms:Xe([ot.common,ot.specularmap,ot.envmap,ot.aomap,ot.lightmap,ot.emissivemap,ot.bumpmap,ot.normalmap,ot.displacementmap,ot.fog,ot.lights,{emissive:{value:new Ot(0)}}]),vertexShader:zt.meshlambert_vert,fragmentShader:zt.meshlambert_frag},phong:{uniforms:Xe([ot.common,ot.specularmap,ot.envmap,ot.aomap,ot.lightmap,ot.emissivemap,ot.bumpmap,ot.normalmap,ot.displacementmap,ot.fog,ot.lights,{emissive:{value:new Ot(0)},specular:{value:new Ot(1118481)},shininess:{value:30}}]),vertexShader:zt.meshphong_vert,fragmentShader:zt.meshphong_frag},standard:{uniforms:Xe([ot.common,ot.envmap,ot.aomap,ot.lightmap,ot.emissivemap,ot.bumpmap,ot.normalmap,ot.displacementmap,ot.roughnessmap,ot.metalnessmap,ot.fog,ot.lights,{emissive:{value:new Ot(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:zt.meshphysical_vert,fragmentShader:zt.meshphysical_frag},toon:{uniforms:Xe([ot.common,ot.aomap,ot.lightmap,ot.emissivemap,ot.bumpmap,ot.normalmap,ot.displacementmap,ot.gradientmap,ot.fog,ot.lights,{emissive:{value:new Ot(0)}}]),vertexShader:zt.meshtoon_vert,fragmentShader:zt.meshtoon_frag},matcap:{uniforms:Xe([ot.common,ot.bumpmap,ot.normalmap,ot.displacementmap,ot.fog,{matcap:{value:null}}]),vertexShader:zt.meshmatcap_vert,fragmentShader:zt.meshmatcap_frag},points:{uniforms:Xe([ot.points,ot.fog]),vertexShader:zt.points_vert,fragmentShader:zt.points_frag},dashed:{uniforms:Xe([ot.common,ot.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:zt.linedashed_vert,fragmentShader:zt.linedashed_frag},depth:{uniforms:Xe([ot.common,ot.displacementmap]),vertexShader:zt.depth_vert,fragmentShader:zt.depth_frag},normal:{uniforms:Xe([ot.common,ot.bumpmap,ot.normalmap,ot.displacementmap,{opacity:{value:1}}]),vertexShader:zt.meshnormal_vert,fragmentShader:zt.meshnormal_frag},sprite:{uniforms:Xe([ot.sprite,ot.fog]),vertexShader:zt.sprite_vert,fragmentShader:zt.sprite_frag},background:{uniforms:{uvTransform:{value:new Ft},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:zt.background_vert,fragmentShader:zt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ft}},vertexShader:zt.backgroundCube_vert,fragmentShader:zt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:zt.cube_vert,fragmentShader:zt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:zt.equirect_vert,fragmentShader:zt.equirect_frag},distanceRGBA:{uniforms:Xe([ot.common,ot.displacementmap,{referencePosition:{value:new L},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:zt.distanceRGBA_vert,fragmentShader:zt.distanceRGBA_frag},shadow:{uniforms:Xe([ot.lights,ot.fog,{color:{value:new Ot(0)},opacity:{value:1}}]),vertexShader:zt.shadow_vert,fragmentShader:zt.shadow_frag}};Vn.physical={uniforms:Xe([Vn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ft},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ft},clearcoatNormalScale:{value:new Et(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ft},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ft},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ft},sheen:{value:0},sheenColor:{value:new Ot(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ft},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ft},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ft},transmissionSamplerSize:{value:new Et},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ft},attenuationDistance:{value:0},attenuationColor:{value:new Ot(0)},specularColor:{value:new Ot(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ft},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ft},anisotropyVector:{value:new Et},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ft}}]),vertexShader:zt.meshphysical_vert,fragmentShader:zt.meshphysical_frag};const la={r:0,b:0,g:0},zi=new Xn,h_=new Qt;function d_(i,t,e,n,s,o,a){const r=new Ot(0);let l=o===!0?0:1,c,h,d=null,u=0,p=null;function m(x){let y=x.isScene===!0?x.background:null;return y&&y.isTexture&&(y=(x.backgroundBlurriness>0?e:t).get(y)),y}function _(x){let y=!1;const v=m(x);v===null?f(r,l):v&&v.isColor&&(f(v,1),y=!0);const w=i.xr.getEnvironmentBlendMode();w==="additive"?n.buffers.color.setClear(0,0,0,1,a):w==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(i.autoClear||y)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function g(x,y){const v=m(y);v&&(v.isCubeTexture||v.mapping===lr)?(h===void 0&&(h=new st(new ie(1,1,1),new fi({name:"BackgroundCubeMaterial",uniforms:qs(Vn.backgroundCube.uniforms),vertexShader:Vn.backgroundCube.vertexShader,fragmentShader:Vn.backgroundCube.fragmentShader,side:Ke,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(w,E,S){this.matrixWorld.copyPosition(S.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(h)),zi.copy(y.backgroundRotation),zi.x*=-1,zi.y*=-1,zi.z*=-1,v.isCubeTexture&&v.isRenderTargetTexture===!1&&(zi.y*=-1,zi.z*=-1),h.material.uniforms.envMap.value=v,h.material.uniforms.flipEnvMap.value=v.isCubeTexture&&v.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=y.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(h_.makeRotationFromEuler(zi)),h.material.toneMapped=Yt.getTransfer(v.colorSpace)!==ae,(d!==v||u!==v.version||p!==i.toneMapping)&&(h.material.needsUpdate=!0,d=v,u=v.version,p=i.toneMapping),h.layers.enableAll(),x.unshift(h,h.geometry,h.material,0,0,null)):v&&v.isTexture&&(c===void 0&&(c=new st(new qn(2,2),new fi({name:"BackgroundMaterial",uniforms:qs(Vn.background.uniforms),vertexShader:Vn.background.vertexShader,fragmentShader:Vn.background.fragmentShader,side:Ci,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=v,c.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,c.material.toneMapped=Yt.getTransfer(v.colorSpace)!==ae,v.matrixAutoUpdate===!0&&v.updateMatrix(),c.material.uniforms.uvTransform.value.copy(v.matrix),(d!==v||u!==v.version||p!==i.toneMapping)&&(c.material.needsUpdate=!0,d=v,u=v.version,p=i.toneMapping),c.layers.enableAll(),x.unshift(c,c.geometry,c.material,0,0,null))}function f(x,y){x.getRGB(la,ku(i)),n.buffers.color.setClear(la.r,la.g,la.b,y,a)}return{getClearColor:function(){return r},setClearColor:function(x,y=1){r.set(x),l=y,f(r,l)},getClearAlpha:function(){return l},setClearAlpha:function(x){l=x,f(r,l)},render:_,addToRenderList:g}}function u_(i,t){const e=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=u(null);let o=s,a=!1;function r(M,C,U,O,B){let X=!1;const W=d(O,U,C);o!==W&&(o=W,c(o.object)),X=p(M,O,U,B),X&&m(M,O,U,B),B!==null&&t.update(B,i.ELEMENT_ARRAY_BUFFER),(X||a)&&(a=!1,v(M,C,U,O),B!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(B).buffer))}function l(){return i.createVertexArray()}function c(M){return i.bindVertexArray(M)}function h(M){return i.deleteVertexArray(M)}function d(M,C,U){const O=U.wireframe===!0;let B=n[M.id];B===void 0&&(B={},n[M.id]=B);let X=B[C.id];X===void 0&&(X={},B[C.id]=X);let W=X[O];return W===void 0&&(W=u(l()),X[O]=W),W}function u(M){const C=[],U=[],O=[];for(let B=0;B<e;B++)C[B]=0,U[B]=0,O[B]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:C,enabledAttributes:U,attributeDivisors:O,object:M,attributes:{},index:null}}function p(M,C,U,O){const B=o.attributes,X=C.attributes;let W=0;const Y=U.getAttributes();for(const V in Y)if(Y[V].location>=0){const Q=B[V];let ft=X[V];if(ft===void 0&&(V==="instanceMatrix"&&M.instanceMatrix&&(ft=M.instanceMatrix),V==="instanceColor"&&M.instanceColor&&(ft=M.instanceColor)),Q===void 0||Q.attribute!==ft||ft&&Q.data!==ft.data)return!0;W++}return o.attributesNum!==W||o.index!==O}function m(M,C,U,O){const B={},X=C.attributes;let W=0;const Y=U.getAttributes();for(const V in Y)if(Y[V].location>=0){let Q=X[V];Q===void 0&&(V==="instanceMatrix"&&M.instanceMatrix&&(Q=M.instanceMatrix),V==="instanceColor"&&M.instanceColor&&(Q=M.instanceColor));const ft={};ft.attribute=Q,Q&&Q.data&&(ft.data=Q.data),B[V]=ft,W++}o.attributes=B,o.attributesNum=W,o.index=O}function _(){const M=o.newAttributes;for(let C=0,U=M.length;C<U;C++)M[C]=0}function g(M){f(M,0)}function f(M,C){const U=o.newAttributes,O=o.enabledAttributes,B=o.attributeDivisors;U[M]=1,O[M]===0&&(i.enableVertexAttribArray(M),O[M]=1),B[M]!==C&&(i.vertexAttribDivisor(M,C),B[M]=C)}function x(){const M=o.newAttributes,C=o.enabledAttributes;for(let U=0,O=C.length;U<O;U++)C[U]!==M[U]&&(i.disableVertexAttribArray(U),C[U]=0)}function y(M,C,U,O,B,X,W){W===!0?i.vertexAttribIPointer(M,C,U,B,X):i.vertexAttribPointer(M,C,U,O,B,X)}function v(M,C,U,O){_();const B=O.attributes,X=U.getAttributes(),W=C.defaultAttributeValues;for(const Y in X){const V=X[Y];if(V.location>=0){let it=B[Y];if(it===void 0&&(Y==="instanceMatrix"&&M.instanceMatrix&&(it=M.instanceMatrix),Y==="instanceColor"&&M.instanceColor&&(it=M.instanceColor)),it!==void 0){const Q=it.normalized,ft=it.itemSize,Bt=t.get(it);if(Bt===void 0)continue;const Kt=Bt.buffer,q=Bt.type,tt=Bt.bytesPerElement,gt=q===i.INT||q===i.UNSIGNED_INT||it.gpuType===Hc;if(it.isInterleavedBufferAttribute){const at=it.data,Rt=at.stride,It=it.offset;if(at.isInstancedInterleavedBuffer){for(let Ht=0;Ht<V.locationSize;Ht++)f(V.location+Ht,at.meshPerAttribute);M.isInstancedMesh!==!0&&O._maxInstanceCount===void 0&&(O._maxInstanceCount=at.meshPerAttribute*at.count)}else for(let Ht=0;Ht<V.locationSize;Ht++)g(V.location+Ht);i.bindBuffer(i.ARRAY_BUFFER,Kt);for(let Ht=0;Ht<V.locationSize;Ht++)y(V.location+Ht,ft/V.locationSize,q,Q,Rt*tt,(It+ft/V.locationSize*Ht)*tt,gt)}else{if(it.isInstancedBufferAttribute){for(let at=0;at<V.locationSize;at++)f(V.location+at,it.meshPerAttribute);M.isInstancedMesh!==!0&&O._maxInstanceCount===void 0&&(O._maxInstanceCount=it.meshPerAttribute*it.count)}else for(let at=0;at<V.locationSize;at++)g(V.location+at);i.bindBuffer(i.ARRAY_BUFFER,Kt);for(let at=0;at<V.locationSize;at++)y(V.location+at,ft/V.locationSize,q,Q,ft*tt,ft/V.locationSize*at*tt,gt)}}else if(W!==void 0){const Q=W[Y];if(Q!==void 0)switch(Q.length){case 2:i.vertexAttrib2fv(V.location,Q);break;case 3:i.vertexAttrib3fv(V.location,Q);break;case 4:i.vertexAttrib4fv(V.location,Q);break;default:i.vertexAttrib1fv(V.location,Q)}}}}x()}function w(){R();for(const M in n){const C=n[M];for(const U in C){const O=C[U];for(const B in O)h(O[B].object),delete O[B];delete C[U]}delete n[M]}}function E(M){if(n[M.id]===void 0)return;const C=n[M.id];for(const U in C){const O=C[U];for(const B in O)h(O[B].object),delete O[B];delete C[U]}delete n[M.id]}function S(M){for(const C in n){const U=n[C];if(U[M.id]===void 0)continue;const O=U[M.id];for(const B in O)h(O[B].object),delete O[B];delete U[M.id]}}function R(){b(),a=!0,o!==s&&(o=s,c(o.object))}function b(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:r,reset:R,resetDefaultState:b,dispose:w,releaseStatesOfGeometry:E,releaseStatesOfProgram:S,initAttributes:_,enableAttribute:g,disableUnusedAttributes:x}}function f_(i,t,e){let n;function s(c){n=c}function o(c,h){i.drawArrays(n,c,h),e.update(h,n,1)}function a(c,h,d){d!==0&&(i.drawArraysInstanced(n,c,h,d),e.update(h,n,d))}function r(c,h,d){if(d===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,h,0,d);let p=0;for(let m=0;m<d;m++)p+=h[m];e.update(p,n,1)}function l(c,h,d,u){if(d===0)return;const p=t.get("WEBGL_multi_draw");if(p===null)for(let m=0;m<c.length;m++)a(c[m],h[m],u[m]);else{p.multiDrawArraysInstancedWEBGL(n,c,0,h,0,u,0,d);let m=0;for(let _=0;_<d;_++)m+=h[_]*u[_];e.update(m,n,1)}}this.setMode=s,this.render=o,this.renderInstances=a,this.renderMultiDraw=r,this.renderMultiDrawInstances=l}function p_(i,t,e,n){let s;function o(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){const S=t.get("EXT_texture_filter_anisotropic");s=i.getParameter(S.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(S){return!(S!==Un&&n.convert(S)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function r(S){const R=S===zo&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(S!==ui&&n.convert(S)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&S!==$n&&!R)}function l(S){if(S==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";S="mediump"}return S==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp";const h=l(c);h!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);const d=e.logarithmicDepthBuffer===!0,u=e.reverseDepthBuffer===!0&&t.has("EXT_clip_control"),p=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),m=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=i.getParameter(i.MAX_TEXTURE_SIZE),g=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),f=i.getParameter(i.MAX_VERTEX_ATTRIBS),x=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),y=i.getParameter(i.MAX_VARYING_VECTORS),v=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),w=m>0,E=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:o,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:r,precision:c,logarithmicDepthBuffer:d,reverseDepthBuffer:u,maxTextures:p,maxVertexTextures:m,maxTextureSize:_,maxCubemapSize:g,maxAttributes:f,maxVertexUniforms:x,maxVaryings:y,maxFragmentUniforms:v,vertexTextures:w,maxSamples:E}}function m_(i){const t=this;let e=null,n=0,s=!1,o=!1;const a=new Gn,r=new Ft,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(d,u){const p=d.length!==0||u||n!==0||s;return s=u,n=d.length,p},this.beginShadows=function(){o=!0,h(null)},this.endShadows=function(){o=!1},this.setGlobalState=function(d,u){e=h(d,u,0)},this.setState=function(d,u,p){const m=d.clippingPlanes,_=d.clipIntersection,g=d.clipShadows,f=i.get(d);if(!s||m===null||m.length===0||o&&!g)o?h(null):c();else{const x=o?0:n,y=x*4;let v=f.clippingState||null;l.value=v,v=h(m,u,y,p);for(let w=0;w!==y;++w)v[w]=e[w];f.clippingState=v,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=x}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function h(d,u,p,m){const _=d!==null?d.length:0;let g=null;if(_!==0){if(g=l.value,m!==!0||g===null){const f=p+_*4,x=u.matrixWorldInverse;r.getNormalMatrix(x),(g===null||g.length<f)&&(g=new Float32Array(f));for(let y=0,v=p;y!==_;++y,v+=4)a.copy(d[y]).applyMatrix4(x,r),a.normal.toArray(g,v),g[v+3]=a.constant}l.value=g,l.needsUpdate=!0}return t.numPlanes=_,t.numIntersection=0,g}}function g_(i){let t=new WeakMap;function e(a,r){return r===Pl?a.mapping=Vs:r===Ll&&(a.mapping=Ws),a}function n(a){if(a&&a.isTexture){const r=a.mapping;if(r===Pl||r===Ll)if(t.has(a)){const l=t.get(a).texture;return e(l,a.mapping)}else{const l=a.image;if(l&&l.height>0){const c=new Am(l.height);return c.fromEquirectangularTexture(i,a),t.set(a,c),a.addEventListener("dispose",s),e(c.texture,a.mapping)}else return null}}return a}function s(a){const r=a.target;r.removeEventListener("dispose",s);const l=t.get(r);l!==void 0&&(t.delete(r),l.dispose())}function o(){t=new WeakMap}return{get:n,dispose:o}}class Vu extends Bu{constructor(t=-1,e=1,n=1,s=-1,o=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=s,this.near=o,this.far=a,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,s,o,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=o,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let o=n-t,a=n+t,r=s+e,l=s-e;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;o+=c*this.view.offsetX,a=o+c*this.view.width,r-=h*this.view.offsetY,l=r-h*this.view.height}this.projectionMatrix.makeOrthographic(o,a,r,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}}const Is=4,Yh=[.125,.215,.35,.446,.526,.582],ji=20,Kr=new Vu,jh=new Ot;let Jr=null,Qr=0,tl=0,el=!1;const $i=(1+Math.sqrt(5))/2,Es=1/$i,Zh=[new L(-$i,Es,0),new L($i,Es,0),new L(-Es,0,$i),new L(Es,0,$i),new L(0,$i,-Es),new L(0,$i,Es),new L(-1,1,-1),new L(1,1,-1),new L(-1,1,1),new L(1,1,1)];class Kh{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(t,e=0,n=.1,s=100){Jr=this._renderer.getRenderTarget(),Qr=this._renderer.getActiveCubeFace(),tl=this._renderer.getActiveMipmapLevel(),el=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const o=this._allocateTargets();return o.depthBuffer=!0,this._sceneToCubeUV(t,n,s,o),e>0&&this._blur(o,0,0,e),this._applyPMREM(o),this._cleanup(o),o}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=td(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Qh(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodPlanes.length;t++)this._lodPlanes[t].dispose()}_cleanup(t){this._renderer.setRenderTarget(Jr,Qr,tl),this._renderer.xr.enabled=el,t.scissorTest=!1,ca(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===Vs||t.mapping===Ws?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),Jr=this._renderer.getRenderTarget(),Qr=this._renderer.getActiveCubeFace(),tl=this._renderer.getActiveMipmapLevel(),el=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:Wn,minFilter:Wn,generateMipmaps:!1,type:zo,format:Un,colorSpace:to,depthBuffer:!1},s=Jh(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Jh(t,e,n);const{_lodMax:o}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=__(o)),this._blurMaterial=v_(o,t,e)}return s}_compileMaterial(t){const e=new st(this._lodPlanes[0],t);this._renderer.compile(e,Kr)}_sceneToCubeUV(t,e,n,s){const r=new yn(90,1,e,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],h=this._renderer,d=h.autoClear,u=h.toneMapping;h.getClearColor(jh),h.toneMapping=Ti,h.autoClear=!1;const p=new Oe({name:"PMREM.Background",side:Ke,depthWrite:!1,depthTest:!1}),m=new st(new ie,p);let _=!1;const g=t.background;g?g.isColor&&(p.color.copy(g),t.background=null,_=!0):(p.color.copy(jh),_=!0);for(let f=0;f<6;f++){const x=f%3;x===0?(r.up.set(0,l[f],0),r.lookAt(c[f],0,0)):x===1?(r.up.set(0,0,l[f]),r.lookAt(0,c[f],0)):(r.up.set(0,l[f],0),r.lookAt(0,0,c[f]));const y=this._cubeSize;ca(s,x*y,f>2?y:0,y,y),h.setRenderTarget(s),_&&h.render(m,r),h.render(t,r)}m.geometry.dispose(),m.material.dispose(),h.toneMapping=u,h.autoClear=d,t.background=g}_textureToCubeUV(t,e){const n=this._renderer,s=t.mapping===Vs||t.mapping===Ws;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=td()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Qh());const o=s?this._cubemapMaterial:this._equirectMaterial,a=new st(this._lodPlanes[0],o),r=o.uniforms;r.envMap.value=t;const l=this._cubeSize;ca(e,0,0,3*l,2*l),n.setRenderTarget(e),n.render(a,Kr)}_applyPMREM(t){const e=this._renderer,n=e.autoClear;e.autoClear=!1;const s=this._lodPlanes.length;for(let o=1;o<s;o++){const a=Math.sqrt(this._sigmas[o]*this._sigmas[o]-this._sigmas[o-1]*this._sigmas[o-1]),r=Zh[(s-o-1)%Zh.length];this._blur(t,o-1,o,a,r)}e.autoClear=n}_blur(t,e,n,s,o){const a=this._pingPongRenderTarget;this._halfBlur(t,a,e,n,s,"latitudinal",o),this._halfBlur(a,t,n,n,s,"longitudinal",o)}_halfBlur(t,e,n,s,o,a,r){const l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,d=new st(this._lodPlanes[s],c),u=c.uniforms,p=this._sizeLods[n]-1,m=isFinite(o)?Math.PI/(2*p):2*Math.PI/(2*ji-1),_=o/m,g=isFinite(o)?1+Math.floor(h*_):ji;g>ji&&console.warn(`sigmaRadians, ${o}, is too large and will clip, as it requested ${g} samples when the maximum is set to ${ji}`);const f=[];let x=0;for(let S=0;S<ji;++S){const R=S/_,b=Math.exp(-R*R/2);f.push(b),S===0?x+=b:S<g&&(x+=2*b)}for(let S=0;S<f.length;S++)f[S]=f[S]/x;u.envMap.value=t.texture,u.samples.value=g,u.weights.value=f,u.latitudinal.value=a==="latitudinal",r&&(u.poleAxis.value=r);const{_lodMax:y}=this;u.dTheta.value=m,u.mipInt.value=y-n;const v=this._sizeLods[s],w=3*v*(s>y-Is?s-y+Is:0),E=4*(this._cubeSize-v);ca(e,w,E,3*v,2*v),l.setRenderTarget(e),l.render(d,Kr)}}function __(i){const t=[],e=[],n=[];let s=i;const o=i-Is+1+Yh.length;for(let a=0;a<o;a++){const r=Math.pow(2,s);e.push(r);let l=1/r;a>i-Is?l=Yh[a-i+Is-1]:a===0&&(l=0),n.push(l);const c=1/(r-2),h=-c,d=1+c,u=[h,h,d,h,d,d,h,h,d,d,h,d],p=6,m=6,_=3,g=2,f=1,x=new Float32Array(_*m*p),y=new Float32Array(g*m*p),v=new Float32Array(f*m*p);for(let E=0;E<p;E++){const S=E%3*2/3-1,R=E>2?0:-1,b=[S,R,0,S+2/3,R,0,S+2/3,R+1,0,S,R,0,S+2/3,R+1,0,S,R+1,0];x.set(b,_*m*E),y.set(u,g*m*E);const M=[E,E,E,E,E,E];v.set(M,f*m*E)}const w=new Jt;w.setAttribute("position",new Me(x,_)),w.setAttribute("uv",new Me(y,g)),w.setAttribute("faceIndex",new Me(v,f)),t.push(w),s>Is&&s--}return{lodPlanes:t,sizeLods:e,sigmas:n}}function Jh(i,t,e){const n=new ns(i,t,e);return n.texture.mapping=lr,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function ca(i,t,e,n,s){i.viewport.set(t,e,n,s),i.scissor.set(t,e,n,s)}function v_(i,t,e){const n=new Float32Array(ji),s=new L(0,1,0);return new fi({name:"SphericalGaussianBlur",defines:{n:ji,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:Zc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Ei,depthTest:!1,depthWrite:!1})}function Qh(){return new fi({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Zc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Ei,depthTest:!1,depthWrite:!1})}function td(){return new fi({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Zc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Ei,depthTest:!1,depthWrite:!1})}function Zc(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function x_(i){let t=new WeakMap,e=null;function n(r){if(r&&r.isTexture){const l=r.mapping,c=l===Pl||l===Ll,h=l===Vs||l===Ws;if(c||h){let d=t.get(r);const u=d!==void 0?d.texture.pmremVersion:0;if(r.isRenderTargetTexture&&r.pmremVersion!==u)return e===null&&(e=new Kh(i)),d=c?e.fromEquirectangular(r,d):e.fromCubemap(r,d),d.texture.pmremVersion=r.pmremVersion,t.set(r,d),d.texture;if(d!==void 0)return d.texture;{const p=r.image;return c&&p&&p.height>0||h&&p&&s(p)?(e===null&&(e=new Kh(i)),d=c?e.fromEquirectangular(r):e.fromCubemap(r),d.texture.pmremVersion=r.pmremVersion,t.set(r,d),r.addEventListener("dispose",o),d.texture):null}}}return r}function s(r){let l=0;const c=6;for(let h=0;h<c;h++)r[h]!==void 0&&l++;return l===c}function o(r){const l=r.target;l.removeEventListener("dispose",o);const c=t.get(l);c!==void 0&&(t.delete(l),c.dispose())}function a(){t=new WeakMap,e!==null&&(e.dispose(),e=null)}return{get:n,dispose:a}}function y_(i){const t={};function e(n){if(t[n]!==void 0)return t[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return t[n]=s,s}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){const s=e(n);return s===null&&yo("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function M_(i,t,e,n){const s={},o=new WeakMap;function a(d){const u=d.target;u.index!==null&&t.remove(u.index);for(const m in u.attributes)t.remove(u.attributes[m]);for(const m in u.morphAttributes){const _=u.morphAttributes[m];for(let g=0,f=_.length;g<f;g++)t.remove(_[g])}u.removeEventListener("dispose",a),delete s[u.id];const p=o.get(u);p&&(t.remove(p),o.delete(u)),n.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,e.memory.geometries--}function r(d,u){return s[u.id]===!0||(u.addEventListener("dispose",a),s[u.id]=!0,e.memory.geometries++),u}function l(d){const u=d.attributes;for(const m in u)t.update(u[m],i.ARRAY_BUFFER);const p=d.morphAttributes;for(const m in p){const _=p[m];for(let g=0,f=_.length;g<f;g++)t.update(_[g],i.ARRAY_BUFFER)}}function c(d){const u=[],p=d.index,m=d.attributes.position;let _=0;if(p!==null){const x=p.array;_=p.version;for(let y=0,v=x.length;y<v;y+=3){const w=x[y+0],E=x[y+1],S=x[y+2];u.push(w,E,E,S,S,w)}}else if(m!==void 0){const x=m.array;_=m.version;for(let y=0,v=x.length/3-1;y<v;y+=3){const w=y+0,E=y+1,S=y+2;u.push(w,E,E,S,S,w)}}else return;const g=new(Iu(u)?Ou:Nu)(u,1);g.version=_;const f=o.get(d);f&&t.remove(f),o.set(d,g)}function h(d){const u=o.get(d);if(u){const p=d.index;p!==null&&u.version<p.version&&c(d)}else c(d);return o.get(d)}return{get:r,update:l,getWireframeAttribute:h}}function b_(i,t,e){let n;function s(u){n=u}let o,a;function r(u){o=u.type,a=u.bytesPerElement}function l(u,p){i.drawElements(n,p,o,u*a),e.update(p,n,1)}function c(u,p,m){m!==0&&(i.drawElementsInstanced(n,p,o,u*a,m),e.update(p,n,m))}function h(u,p,m){if(m===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,p,0,o,u,0,m);let g=0;for(let f=0;f<m;f++)g+=p[f];e.update(g,n,1)}function d(u,p,m,_){if(m===0)return;const g=t.get("WEBGL_multi_draw");if(g===null)for(let f=0;f<u.length;f++)c(u[f]/a,p[f],_[f]);else{g.multiDrawElementsInstancedWEBGL(n,p,0,o,u,0,_,0,m);let f=0;for(let x=0;x<m;x++)f+=p[x]*_[x];e.update(f,n,1)}}this.setMode=s,this.setIndex=r,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=d}function S_(i){const t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(o,a,r){switch(e.calls++,a){case i.TRIANGLES:e.triangles+=r*(o/3);break;case i.LINES:e.lines+=r*(o/2);break;case i.LINE_STRIP:e.lines+=r*(o-1);break;case i.LINE_LOOP:e.lines+=r*o;break;case i.POINTS:e.points+=r*o;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:n}}function w_(i,t,e){const n=new WeakMap,s=new be;function o(a,r,l){const c=a.morphTargetInfluences,h=r.morphAttributes.position||r.morphAttributes.normal||r.morphAttributes.color,d=h!==void 0?h.length:0;let u=n.get(r);if(u===void 0||u.count!==d){let M=function(){R.dispose(),n.delete(r),r.removeEventListener("dispose",M)};var p=M;u!==void 0&&u.texture.dispose();const m=r.morphAttributes.position!==void 0,_=r.morphAttributes.normal!==void 0,g=r.morphAttributes.color!==void 0,f=r.morphAttributes.position||[],x=r.morphAttributes.normal||[],y=r.morphAttributes.color||[];let v=0;m===!0&&(v=1),_===!0&&(v=2),g===!0&&(v=3);let w=r.attributes.position.count*v,E=1;w>t.maxTextureSize&&(E=Math.ceil(w/t.maxTextureSize),w=t.maxTextureSize);const S=new Float32Array(w*E*4*d),R=new Uu(S,w,E,d);R.type=$n,R.needsUpdate=!0;const b=v*4;for(let C=0;C<d;C++){const U=f[C],O=x[C],B=y[C],X=w*E*4*C;for(let W=0;W<U.count;W++){const Y=W*b;m===!0&&(s.fromBufferAttribute(U,W),S[X+Y+0]=s.x,S[X+Y+1]=s.y,S[X+Y+2]=s.z,S[X+Y+3]=0),_===!0&&(s.fromBufferAttribute(O,W),S[X+Y+4]=s.x,S[X+Y+5]=s.y,S[X+Y+6]=s.z,S[X+Y+7]=0),g===!0&&(s.fromBufferAttribute(B,W),S[X+Y+8]=s.x,S[X+Y+9]=s.y,S[X+Y+10]=s.z,S[X+Y+11]=B.itemSize===4?s.w:1)}}u={count:d,texture:R,size:new Et(w,E)},n.set(r,u),r.addEventListener("dispose",M)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,e);else{let m=0;for(let g=0;g<c.length;g++)m+=c[g];const _=r.morphTargetsRelative?1:1-m;l.getUniforms().setValue(i,"morphTargetBaseInfluence",_),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",u.texture,e),l.getUniforms().setValue(i,"morphTargetsTextureSize",u.size)}return{update:o}}function E_(i,t,e,n){let s=new WeakMap;function o(l){const c=n.render.frame,h=l.geometry,d=t.get(l,h);if(s.get(d)!==c&&(t.update(d),s.set(d,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",r)===!1&&l.addEventListener("dispose",r),s.get(l)!==c&&(e.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&e.update(l.instanceColor,i.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){const u=l.skeleton;s.get(u)!==c&&(u.update(),s.set(u,c))}return d}function a(){s=new WeakMap}function r(l){const c=l.target;c.removeEventListener("dispose",r),e.remove(c.instanceMatrix),c.instanceColor!==null&&e.remove(c.instanceColor)}return{update:o,dispose:a}}class Wu extends We{constructor(t,e,n,s,o,a,r,l,c,h=Ns){if(h!==Ns&&h!==Xs)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&h===Ns&&(n=es),n===void 0&&h===Xs&&(n=$s),super(null,s,o,a,r,l,h,n,c),this.isDepthTexture=!0,this.image={width:t,height:e},this.magFilter=r!==void 0?r:un,this.minFilter=l!==void 0?l:un,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.compareFunction=t.compareFunction,this}toJSON(t){const e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}}const $u=new We,ed=new Wu(1,1),Xu=new Uu,qu=new um,Yu=new Hu,nd=[],id=[],sd=new Float32Array(16),od=new Float32Array(9),ad=new Float32Array(4);function eo(i,t,e){const n=i[0];if(n<=0||n>0)return i;const s=t*e;let o=nd[s];if(o===void 0&&(o=new Float32Array(s),nd[s]=o),t!==0){n.toArray(o,0);for(let a=1,r=0;a!==t;++a)r+=e,i[a].toArray(o,r)}return o}function Ue(i,t){if(i.length!==t.length)return!1;for(let e=0,n=i.length;e<n;e++)if(i[e]!==t[e])return!1;return!0}function Fe(i,t){for(let e=0,n=t.length;e<n;e++)i[e]=t[e]}function hr(i,t){let e=id[t];e===void 0&&(e=new Int32Array(t),id[t]=e);for(let n=0;n!==t;++n)e[n]=i.allocateTextureUnit();return e}function T_(i,t){const e=this.cache;e[0]!==t&&(i.uniform1f(this.addr,t),e[0]=t)}function A_(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ue(e,t))return;i.uniform2fv(this.addr,t),Fe(e,t)}}function R_(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(i.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Ue(e,t))return;i.uniform3fv(this.addr,t),Fe(e,t)}}function C_(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ue(e,t))return;i.uniform4fv(this.addr,t),Fe(e,t)}}function P_(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(Ue(e,t))return;i.uniformMatrix2fv(this.addr,!1,t),Fe(e,t)}else{if(Ue(e,n))return;ad.set(n),i.uniformMatrix2fv(this.addr,!1,ad),Fe(e,n)}}function L_(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(Ue(e,t))return;i.uniformMatrix3fv(this.addr,!1,t),Fe(e,t)}else{if(Ue(e,n))return;od.set(n),i.uniformMatrix3fv(this.addr,!1,od),Fe(e,n)}}function I_(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(Ue(e,t))return;i.uniformMatrix4fv(this.addr,!1,t),Fe(e,t)}else{if(Ue(e,n))return;sd.set(n),i.uniformMatrix4fv(this.addr,!1,sd),Fe(e,n)}}function D_(i,t){const e=this.cache;e[0]!==t&&(i.uniform1i(this.addr,t),e[0]=t)}function U_(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ue(e,t))return;i.uniform2iv(this.addr,t),Fe(e,t)}}function F_(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Ue(e,t))return;i.uniform3iv(this.addr,t),Fe(e,t)}}function N_(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ue(e,t))return;i.uniform4iv(this.addr,t),Fe(e,t)}}function O_(i,t){const e=this.cache;e[0]!==t&&(i.uniform1ui(this.addr,t),e[0]=t)}function k_(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ue(e,t))return;i.uniform2uiv(this.addr,t),Fe(e,t)}}function z_(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Ue(e,t))return;i.uniform3uiv(this.addr,t),Fe(e,t)}}function B_(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ue(e,t))return;i.uniform4uiv(this.addr,t),Fe(e,t)}}function H_(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let o;this.type===i.SAMPLER_2D_SHADOW?(ed.compareFunction=Lu,o=ed):o=$u,e.setTexture2D(t||o,s)}function G_(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture3D(t||qu,s)}function V_(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTextureCube(t||Yu,s)}function W_(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture2DArray(t||Xu,s)}function $_(i){switch(i){case 5126:return T_;case 35664:return A_;case 35665:return R_;case 35666:return C_;case 35674:return P_;case 35675:return L_;case 35676:return I_;case 5124:case 35670:return D_;case 35667:case 35671:return U_;case 35668:case 35672:return F_;case 35669:case 35673:return N_;case 5125:return O_;case 36294:return k_;case 36295:return z_;case 36296:return B_;case 35678:case 36198:case 36298:case 36306:case 35682:return H_;case 35679:case 36299:case 36307:return G_;case 35680:case 36300:case 36308:case 36293:return V_;case 36289:case 36303:case 36311:case 36292:return W_}}function X_(i,t){i.uniform1fv(this.addr,t)}function q_(i,t){const e=eo(t,this.size,2);i.uniform2fv(this.addr,e)}function Y_(i,t){const e=eo(t,this.size,3);i.uniform3fv(this.addr,e)}function j_(i,t){const e=eo(t,this.size,4);i.uniform4fv(this.addr,e)}function Z_(i,t){const e=eo(t,this.size,4);i.uniformMatrix2fv(this.addr,!1,e)}function K_(i,t){const e=eo(t,this.size,9);i.uniformMatrix3fv(this.addr,!1,e)}function J_(i,t){const e=eo(t,this.size,16);i.uniformMatrix4fv(this.addr,!1,e)}function Q_(i,t){i.uniform1iv(this.addr,t)}function tv(i,t){i.uniform2iv(this.addr,t)}function ev(i,t){i.uniform3iv(this.addr,t)}function nv(i,t){i.uniform4iv(this.addr,t)}function iv(i,t){i.uniform1uiv(this.addr,t)}function sv(i,t){i.uniform2uiv(this.addr,t)}function ov(i,t){i.uniform3uiv(this.addr,t)}function av(i,t){i.uniform4uiv(this.addr,t)}function rv(i,t,e){const n=this.cache,s=t.length,o=hr(e,s);Ue(n,o)||(i.uniform1iv(this.addr,o),Fe(n,o));for(let a=0;a!==s;++a)e.setTexture2D(t[a]||$u,o[a])}function lv(i,t,e){const n=this.cache,s=t.length,o=hr(e,s);Ue(n,o)||(i.uniform1iv(this.addr,o),Fe(n,o));for(let a=0;a!==s;++a)e.setTexture3D(t[a]||qu,o[a])}function cv(i,t,e){const n=this.cache,s=t.length,o=hr(e,s);Ue(n,o)||(i.uniform1iv(this.addr,o),Fe(n,o));for(let a=0;a!==s;++a)e.setTextureCube(t[a]||Yu,o[a])}function hv(i,t,e){const n=this.cache,s=t.length,o=hr(e,s);Ue(n,o)||(i.uniform1iv(this.addr,o),Fe(n,o));for(let a=0;a!==s;++a)e.setTexture2DArray(t[a]||Xu,o[a])}function dv(i){switch(i){case 5126:return X_;case 35664:return q_;case 35665:return Y_;case 35666:return j_;case 35674:return Z_;case 35675:return K_;case 35676:return J_;case 5124:case 35670:return Q_;case 35667:case 35671:return tv;case 35668:case 35672:return ev;case 35669:case 35673:return nv;case 5125:return iv;case 36294:return sv;case 36295:return ov;case 36296:return av;case 35678:case 36198:case 36298:case 36306:case 35682:return rv;case 35679:case 36299:case 36307:return lv;case 35680:case 36300:case 36308:case 36293:return cv;case 36289:case 36303:case 36311:case 36292:return hv}}class uv{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=$_(e.type)}}class fv{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=dv(e.type)}}class pv{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){const s=this.seq;for(let o=0,a=s.length;o!==a;++o){const r=s[o];r.setValue(t,e[r.id],n)}}}const nl=/(\w+)(\])?(\[|\.)?/g;function rd(i,t){i.seq.push(t),i.map[t.id]=t}function mv(i,t,e){const n=i.name,s=n.length;for(nl.lastIndex=0;;){const o=nl.exec(n),a=nl.lastIndex;let r=o[1];const l=o[2]==="]",c=o[3];if(l&&(r=r|0),c===void 0||c==="["&&a+2===s){rd(e,c===void 0?new uv(r,i,t):new fv(r,i,t));break}else{let d=e.map[r];d===void 0&&(d=new pv(r),rd(e,d)),e=d}}}class za{constructor(t,e){this.seq=[],this.map={};const n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){const o=t.getActiveUniform(e,s),a=t.getUniformLocation(e,o.name);mv(o,a,this)}}setValue(t,e,n,s){const o=this.map[e];o!==void 0&&o.setValue(t,n,s)}setOptional(t,e,n){const s=e[n];s!==void 0&&this.setValue(t,n,s)}static upload(t,e,n,s){for(let o=0,a=e.length;o!==a;++o){const r=e[o],l=n[r.id];l.needsUpdate!==!1&&r.setValue(t,l.value,s)}}static seqWithValue(t,e){const n=[];for(let s=0,o=t.length;s!==o;++s){const a=t[s];a.id in e&&n.push(a)}return n}}function ld(i,t,e){const n=i.createShader(t);return i.shaderSource(n,e),i.compileShader(n),n}const gv=37297;let _v=0;function vv(i,t){const e=i.split(`
`),n=[],s=Math.max(t-6,0),o=Math.min(t+6,e.length);for(let a=s;a<o;a++){const r=a+1;n.push(`${r===t?">":" "} ${r}: ${e[a]}`)}return n.join(`
`)}const cd=new Ft;function xv(i){Yt._getMatrix(cd,Yt.workingColorSpace,i);const t=`mat3( ${cd.elements.map(e=>e.toFixed(4))} )`;switch(Yt.getTransfer(i)){case cr:return[t,"LinearTransferOETF"];case ae:return[t,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",i),[t,"LinearTransferOETF"]}}function hd(i,t,e){const n=i.getShaderParameter(t,i.COMPILE_STATUS),s=i.getShaderInfoLog(t).trim();if(n&&s==="")return"";const o=/ERROR: 0:(\d+)/.exec(s);if(o){const a=parseInt(o[1]);return e.toUpperCase()+`

`+s+`

`+vv(i.getShaderSource(t),a)}else return s}function yv(i,t){const e=xv(t);return[`vec4 ${i}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}function Mv(i,t){let e;switch(t){case zp:e="Linear";break;case Bp:e="Reinhard";break;case Hp:e="Cineon";break;case xu:e="ACESFilmic";break;case Vp:e="AgX";break;case Wp:e="Neutral";break;case Gp:e="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),e="Linear"}return"vec3 "+i+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}const ha=new L;function bv(){Yt.getLuminanceCoefficients(ha);const i=ha.x.toFixed(4),t=ha.y.toFixed(4),e=ha.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Sv(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Mo).join(`
`)}function wv(i){const t=[];for(const e in i){const n=i[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function Ev(i,t){const e={},n=i.getProgramParameter(t,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){const o=i.getActiveAttrib(t,s),a=o.name;let r=1;o.type===i.FLOAT_MAT2&&(r=2),o.type===i.FLOAT_MAT3&&(r=3),o.type===i.FLOAT_MAT4&&(r=4),e[a]={type:o.type,location:i.getAttribLocation(t,a),locationSize:r}}return e}function Mo(i){return i!==""}function dd(i,t){const e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function ud(i,t){return i.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}const Tv=/^[ \t]*#include +<([\w\d./]+)>/gm;function ac(i){return i.replace(Tv,Rv)}const Av=new Map;function Rv(i,t){let e=zt[t];if(e===void 0){const n=Av.get(t);if(n!==void 0)e=zt[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("Can not resolve #include <"+t+">")}return ac(e)}const Cv=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function fd(i){return i.replace(Cv,Pv)}function Pv(i,t,e,n){let s="";for(let o=parseInt(t);o<parseInt(e);o++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+o+" ]").replace(/UNROLLED_LOOP_INDEX/g,o);return s}function pd(i){let t=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?t+=`
#define HIGH_PRECISION`:i.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}function Lv(i){let t="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===gu?t="SHADOWMAP_TYPE_PCF":i.shadowMapType===_u?t="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===si&&(t="SHADOWMAP_TYPE_VSM"),t}function Iv(i){let t="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case Vs:case Ws:t="ENVMAP_TYPE_CUBE";break;case lr:t="ENVMAP_TYPE_CUBE_UV";break}return t}function Dv(i){let t="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case Ws:t="ENVMAP_MODE_REFRACTION";break}return t}function Uv(i){let t="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case vu:t="ENVMAP_BLENDING_MULTIPLY";break;case Op:t="ENVMAP_BLENDING_MIX";break;case kp:t="ENVMAP_BLENDING_ADD";break}return t}function Fv(i){const t=i.envMapCubeUVHeight;if(t===null)return null;const e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:n,maxMip:e}}function Nv(i,t,e,n){const s=i.getContext(),o=e.defines;let a=e.vertexShader,r=e.fragmentShader;const l=Lv(e),c=Iv(e),h=Dv(e),d=Uv(e),u=Fv(e),p=Sv(e),m=wv(o),_=s.createProgram();let g,f,x=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(g=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m].filter(Mo).join(`
`),g.length>0&&(g+=`
`),f=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m].filter(Mo).join(`
`),f.length>0&&(f+=`
`)):(g=[pd(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Mo).join(`
`),f=[pd(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+h:"",e.envMap?"#define "+d:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor||e.batchingColor?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==Ti?"#define TONE_MAPPING":"",e.toneMapping!==Ti?zt.tonemapping_pars_fragment:"",e.toneMapping!==Ti?Mv("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",zt.colorspace_pars_fragment,yv("linearToOutputTexel",e.outputColorSpace),bv(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(Mo).join(`
`)),a=ac(a),a=dd(a,e),a=ud(a,e),r=ac(r),r=dd(r,e),r=ud(r,e),a=fd(a),r=fd(r),e.isRawShaderMaterial!==!0&&(x=`#version 300 es
`,g=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+g,f=["#define varying in",e.glslVersion===Ah?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===Ah?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+f);const y=x+g+a,v=x+f+r,w=ld(s,s.VERTEX_SHADER,y),E=ld(s,s.FRAGMENT_SHADER,v);s.attachShader(_,w),s.attachShader(_,E),e.index0AttributeName!==void 0?s.bindAttribLocation(_,0,e.index0AttributeName):e.morphTargets===!0&&s.bindAttribLocation(_,0,"position"),s.linkProgram(_);function S(C){if(i.debug.checkShaderErrors){const U=s.getProgramInfoLog(_).trim(),O=s.getShaderInfoLog(w).trim(),B=s.getShaderInfoLog(E).trim();let X=!0,W=!0;if(s.getProgramParameter(_,s.LINK_STATUS)===!1)if(X=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,_,w,E);else{const Y=hd(s,w,"vertex"),V=hd(s,E,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(_,s.VALIDATE_STATUS)+`

Material Name: `+C.name+`
Material Type: `+C.type+`

Program Info Log: `+U+`
`+Y+`
`+V)}else U!==""?console.warn("THREE.WebGLProgram: Program Info Log:",U):(O===""||B==="")&&(W=!1);W&&(C.diagnostics={runnable:X,programLog:U,vertexShader:{log:O,prefix:g},fragmentShader:{log:B,prefix:f}})}s.deleteShader(w),s.deleteShader(E),R=new za(s,_),b=Ev(s,_)}let R;this.getUniforms=function(){return R===void 0&&S(this),R};let b;this.getAttributes=function(){return b===void 0&&S(this),b};let M=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return M===!1&&(M=s.getProgramParameter(_,gv)),M},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(_),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=_v++,this.cacheKey=t,this.usedTimes=1,this.program=_,this.vertexShader=w,this.fragmentShader=E,this}let Ov=0;class kv{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){const e=t.vertexShader,n=t.fragmentShader,s=this._getShaderStage(e),o=this._getShaderStage(n),a=this._getShaderCacheForMaterial(t);return a.has(s)===!1&&(a.add(s),s.usedTimes++),a.has(o)===!1&&(a.add(o),o.usedTimes++),this}remove(t){const e=this.materialCache.get(t);for(const n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){const e=this.materialCache;let n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){const e=this.shaderCache;let n=e.get(t);return n===void 0&&(n=new zv(t),e.set(t,n)),n}}class zv{constructor(t){this.id=Ov++,this.code=t,this.usedTimes=0}}function Bv(i,t,e,n,s,o,a){const r=new Yc,l=new kv,c=new Set,h=[],d=s.logarithmicDepthBuffer,u=s.vertexTextures;let p=s.precision;const m={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(b){return c.add(b),b===0?"uv":`uv${b}`}function g(b,M,C,U,O){const B=U.fog,X=O.geometry,W=b.isMeshStandardMaterial?U.environment:null,Y=(b.isMeshStandardMaterial?e:t).get(b.envMap||W),V=Y&&Y.mapping===lr?Y.image.height:null,it=m[b.type];b.precision!==null&&(p=s.getMaxPrecision(b.precision),p!==b.precision&&console.warn("THREE.WebGLProgram.getParameters:",b.precision,"not supported, using",p,"instead."));const Q=X.morphAttributes.position||X.morphAttributes.normal||X.morphAttributes.color,ft=Q!==void 0?Q.length:0;let Bt=0;X.morphAttributes.position!==void 0&&(Bt=1),X.morphAttributes.normal!==void 0&&(Bt=2),X.morphAttributes.color!==void 0&&(Bt=3);let Kt,q,tt,gt;if(it){const se=Vn[it];Kt=se.vertexShader,q=se.fragmentShader}else Kt=b.vertexShader,q=b.fragmentShader,l.update(b),tt=l.getVertexShaderID(b),gt=l.getFragmentShaderID(b);const at=i.getRenderTarget(),Rt=i.state.buffers.depth.getReversed(),It=O.isInstancedMesh===!0,Ht=O.isBatchedMesh===!0,ge=!!b.map,Xt=!!b.matcap,we=!!Y,N=!!b.aoMap,fn=!!b.lightMap,Vt=!!b.bumpMap,Wt=!!b.normalMap,Tt=!!b.displacementMap,fe=!!b.emissiveMap,wt=!!b.metalnessMap,P=!!b.roughnessMap,T=b.anisotropy>0,k=b.clearcoat>0,Z=b.dispersion>0,J=b.iridescence>0,j=b.sheen>0,yt=b.transmission>0,lt=T&&!!b.anisotropyMap,ut=k&&!!b.clearcoatMap,qt=k&&!!b.clearcoatNormalMap,et=k&&!!b.clearcoatRoughnessMap,pt=J&&!!b.iridescenceMap,At=J&&!!b.iridescenceThicknessMap,Ct=j&&!!b.sheenColorMap,mt=j&&!!b.sheenRoughnessMap,$t=!!b.specularMap,kt=!!b.specularColorMap,ce=!!b.specularIntensityMap,I=yt&&!!b.transmissionMap,rt=yt&&!!b.thicknessMap,$=!!b.gradientMap,K=!!b.alphaMap,dt=b.alphaTest>0,ct=!!b.alphaHash,Dt=!!b.extensions;let xe=Ti;b.toneMapped&&(at===null||at.isXRRenderTarget===!0)&&(xe=i.toneMapping);const ze={shaderID:it,shaderType:b.type,shaderName:b.name,vertexShader:Kt,fragmentShader:q,defines:b.defines,customVertexShaderID:tt,customFragmentShaderID:gt,isRawShaderMaterial:b.isRawShaderMaterial===!0,glslVersion:b.glslVersion,precision:p,batching:Ht,batchingColor:Ht&&O._colorsTexture!==null,instancing:It,instancingColor:It&&O.instanceColor!==null,instancingMorph:It&&O.morphTexture!==null,supportsVertexTextures:u,outputColorSpace:at===null?i.outputColorSpace:at.isXRRenderTarget===!0?at.texture.colorSpace:to,alphaToCoverage:!!b.alphaToCoverage,map:ge,matcap:Xt,envMap:we,envMapMode:we&&Y.mapping,envMapCubeUVHeight:V,aoMap:N,lightMap:fn,bumpMap:Vt,normalMap:Wt,displacementMap:u&&Tt,emissiveMap:fe,normalMapObjectSpace:Wt&&b.normalMapType===Yp,normalMapTangentSpace:Wt&&b.normalMapType===Pu,metalnessMap:wt,roughnessMap:P,anisotropy:T,anisotropyMap:lt,clearcoat:k,clearcoatMap:ut,clearcoatNormalMap:qt,clearcoatRoughnessMap:et,dispersion:Z,iridescence:J,iridescenceMap:pt,iridescenceThicknessMap:At,sheen:j,sheenColorMap:Ct,sheenRoughnessMap:mt,specularMap:$t,specularColorMap:kt,specularIntensityMap:ce,transmission:yt,transmissionMap:I,thicknessMap:rt,gradientMap:$,opaque:b.transparent===!1&&b.blending===Fs&&b.alphaToCoverage===!1,alphaMap:K,alphaTest:dt,alphaHash:ct,combine:b.combine,mapUv:ge&&_(b.map.channel),aoMapUv:N&&_(b.aoMap.channel),lightMapUv:fn&&_(b.lightMap.channel),bumpMapUv:Vt&&_(b.bumpMap.channel),normalMapUv:Wt&&_(b.normalMap.channel),displacementMapUv:Tt&&_(b.displacementMap.channel),emissiveMapUv:fe&&_(b.emissiveMap.channel),metalnessMapUv:wt&&_(b.metalnessMap.channel),roughnessMapUv:P&&_(b.roughnessMap.channel),anisotropyMapUv:lt&&_(b.anisotropyMap.channel),clearcoatMapUv:ut&&_(b.clearcoatMap.channel),clearcoatNormalMapUv:qt&&_(b.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:et&&_(b.clearcoatRoughnessMap.channel),iridescenceMapUv:pt&&_(b.iridescenceMap.channel),iridescenceThicknessMapUv:At&&_(b.iridescenceThicknessMap.channel),sheenColorMapUv:Ct&&_(b.sheenColorMap.channel),sheenRoughnessMapUv:mt&&_(b.sheenRoughnessMap.channel),specularMapUv:$t&&_(b.specularMap.channel),specularColorMapUv:kt&&_(b.specularColorMap.channel),specularIntensityMapUv:ce&&_(b.specularIntensityMap.channel),transmissionMapUv:I&&_(b.transmissionMap.channel),thicknessMapUv:rt&&_(b.thicknessMap.channel),alphaMapUv:K&&_(b.alphaMap.channel),vertexTangents:!!X.attributes.tangent&&(Wt||T),vertexColors:b.vertexColors,vertexAlphas:b.vertexColors===!0&&!!X.attributes.color&&X.attributes.color.itemSize===4,pointsUvs:O.isPoints===!0&&!!X.attributes.uv&&(ge||K),fog:!!B,useFog:b.fog===!0,fogExp2:!!B&&B.isFogExp2,flatShading:b.flatShading===!0,sizeAttenuation:b.sizeAttenuation===!0,logarithmicDepthBuffer:d,reverseDepthBuffer:Rt,skinning:O.isSkinnedMesh===!0,morphTargets:X.morphAttributes.position!==void 0,morphNormals:X.morphAttributes.normal!==void 0,morphColors:X.morphAttributes.color!==void 0,morphTargetsCount:ft,morphTextureStride:Bt,numDirLights:M.directional.length,numPointLights:M.point.length,numSpotLights:M.spot.length,numSpotLightMaps:M.spotLightMap.length,numRectAreaLights:M.rectArea.length,numHemiLights:M.hemi.length,numDirLightShadows:M.directionalShadowMap.length,numPointLightShadows:M.pointShadowMap.length,numSpotLightShadows:M.spotShadowMap.length,numSpotLightShadowsWithMaps:M.numSpotLightShadowsWithMaps,numLightProbes:M.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:b.dithering,shadowMapEnabled:i.shadowMap.enabled&&C.length>0,shadowMapType:i.shadowMap.type,toneMapping:xe,decodeVideoTexture:ge&&b.map.isVideoTexture===!0&&Yt.getTransfer(b.map.colorSpace)===ae,decodeVideoTextureEmissive:fe&&b.emissiveMap.isVideoTexture===!0&&Yt.getTransfer(b.emissiveMap.colorSpace)===ae,premultipliedAlpha:b.premultipliedAlpha,doubleSided:b.side===Re,flipSided:b.side===Ke,useDepthPacking:b.depthPacking>=0,depthPacking:b.depthPacking||0,index0AttributeName:b.index0AttributeName,extensionClipCullDistance:Dt&&b.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Dt&&b.extensions.multiDraw===!0||Ht)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:b.customProgramCacheKey()};return ze.vertexUv1s=c.has(1),ze.vertexUv2s=c.has(2),ze.vertexUv3s=c.has(3),c.clear(),ze}function f(b){const M=[];if(b.shaderID?M.push(b.shaderID):(M.push(b.customVertexShaderID),M.push(b.customFragmentShaderID)),b.defines!==void 0)for(const C in b.defines)M.push(C),M.push(b.defines[C]);return b.isRawShaderMaterial===!1&&(x(M,b),y(M,b),M.push(i.outputColorSpace)),M.push(b.customProgramCacheKey),M.join()}function x(b,M){b.push(M.precision),b.push(M.outputColorSpace),b.push(M.envMapMode),b.push(M.envMapCubeUVHeight),b.push(M.mapUv),b.push(M.alphaMapUv),b.push(M.lightMapUv),b.push(M.aoMapUv),b.push(M.bumpMapUv),b.push(M.normalMapUv),b.push(M.displacementMapUv),b.push(M.emissiveMapUv),b.push(M.metalnessMapUv),b.push(M.roughnessMapUv),b.push(M.anisotropyMapUv),b.push(M.clearcoatMapUv),b.push(M.clearcoatNormalMapUv),b.push(M.clearcoatRoughnessMapUv),b.push(M.iridescenceMapUv),b.push(M.iridescenceThicknessMapUv),b.push(M.sheenColorMapUv),b.push(M.sheenRoughnessMapUv),b.push(M.specularMapUv),b.push(M.specularColorMapUv),b.push(M.specularIntensityMapUv),b.push(M.transmissionMapUv),b.push(M.thicknessMapUv),b.push(M.combine),b.push(M.fogExp2),b.push(M.sizeAttenuation),b.push(M.morphTargetsCount),b.push(M.morphAttributeCount),b.push(M.numDirLights),b.push(M.numPointLights),b.push(M.numSpotLights),b.push(M.numSpotLightMaps),b.push(M.numHemiLights),b.push(M.numRectAreaLights),b.push(M.numDirLightShadows),b.push(M.numPointLightShadows),b.push(M.numSpotLightShadows),b.push(M.numSpotLightShadowsWithMaps),b.push(M.numLightProbes),b.push(M.shadowMapType),b.push(M.toneMapping),b.push(M.numClippingPlanes),b.push(M.numClipIntersection),b.push(M.depthPacking)}function y(b,M){r.disableAll(),M.supportsVertexTextures&&r.enable(0),M.instancing&&r.enable(1),M.instancingColor&&r.enable(2),M.instancingMorph&&r.enable(3),M.matcap&&r.enable(4),M.envMap&&r.enable(5),M.normalMapObjectSpace&&r.enable(6),M.normalMapTangentSpace&&r.enable(7),M.clearcoat&&r.enable(8),M.iridescence&&r.enable(9),M.alphaTest&&r.enable(10),M.vertexColors&&r.enable(11),M.vertexAlphas&&r.enable(12),M.vertexUv1s&&r.enable(13),M.vertexUv2s&&r.enable(14),M.vertexUv3s&&r.enable(15),M.vertexTangents&&r.enable(16),M.anisotropy&&r.enable(17),M.alphaHash&&r.enable(18),M.batching&&r.enable(19),M.dispersion&&r.enable(20),M.batchingColor&&r.enable(21),b.push(r.mask),r.disableAll(),M.fog&&r.enable(0),M.useFog&&r.enable(1),M.flatShading&&r.enable(2),M.logarithmicDepthBuffer&&r.enable(3),M.reverseDepthBuffer&&r.enable(4),M.skinning&&r.enable(5),M.morphTargets&&r.enable(6),M.morphNormals&&r.enable(7),M.morphColors&&r.enable(8),M.premultipliedAlpha&&r.enable(9),M.shadowMapEnabled&&r.enable(10),M.doubleSided&&r.enable(11),M.flipSided&&r.enable(12),M.useDepthPacking&&r.enable(13),M.dithering&&r.enable(14),M.transmission&&r.enable(15),M.sheen&&r.enable(16),M.opaque&&r.enable(17),M.pointsUvs&&r.enable(18),M.decodeVideoTexture&&r.enable(19),M.decodeVideoTextureEmissive&&r.enable(20),M.alphaToCoverage&&r.enable(21),b.push(r.mask)}function v(b){const M=m[b.type];let C;if(M){const U=Vn[M];C=zu.clone(U.uniforms)}else C=b.uniforms;return C}function w(b,M){let C;for(let U=0,O=h.length;U<O;U++){const B=h[U];if(B.cacheKey===M){C=B,++C.usedTimes;break}}return C===void 0&&(C=new Nv(i,M,b,o),h.push(C)),C}function E(b){if(--b.usedTimes===0){const M=h.indexOf(b);h[M]=h[h.length-1],h.pop(),b.destroy()}}function S(b){l.remove(b)}function R(){l.dispose()}return{getParameters:g,getProgramCacheKey:f,getUniforms:v,acquireProgram:w,releaseProgram:E,releaseShaderCache:S,programs:h,dispose:R}}function Hv(){let i=new WeakMap;function t(a){return i.has(a)}function e(a){let r=i.get(a);return r===void 0&&(r={},i.set(a,r)),r}function n(a){i.delete(a)}function s(a,r,l){i.get(a)[r]=l}function o(){i=new WeakMap}return{has:t,get:e,remove:n,update:s,dispose:o}}function Gv(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.material.id!==t.material.id?i.material.id-t.material.id:i.z!==t.z?i.z-t.z:i.id-t.id}function md(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.z!==t.z?t.z-i.z:i.id-t.id}function gd(){const i=[];let t=0;const e=[],n=[],s=[];function o(){t=0,e.length=0,n.length=0,s.length=0}function a(d,u,p,m,_,g){let f=i[t];return f===void 0?(f={id:d.id,object:d,geometry:u,material:p,groupOrder:m,renderOrder:d.renderOrder,z:_,group:g},i[t]=f):(f.id=d.id,f.object=d,f.geometry=u,f.material=p,f.groupOrder=m,f.renderOrder=d.renderOrder,f.z=_,f.group=g),t++,f}function r(d,u,p,m,_,g){const f=a(d,u,p,m,_,g);p.transmission>0?n.push(f):p.transparent===!0?s.push(f):e.push(f)}function l(d,u,p,m,_,g){const f=a(d,u,p,m,_,g);p.transmission>0?n.unshift(f):p.transparent===!0?s.unshift(f):e.unshift(f)}function c(d,u){e.length>1&&e.sort(d||Gv),n.length>1&&n.sort(u||md),s.length>1&&s.sort(u||md)}function h(){for(let d=t,u=i.length;d<u;d++){const p=i[d];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:e,transmissive:n,transparent:s,init:o,push:r,unshift:l,finish:h,sort:c}}function Vv(){let i=new WeakMap;function t(n,s){const o=i.get(n);let a;return o===void 0?(a=new gd,i.set(n,[a])):s>=o.length?(a=new gd,o.push(a)):a=o[s],a}function e(){i=new WeakMap}return{get:t,dispose:e}}function Wv(){const i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new L,color:new Ot};break;case"SpotLight":e={position:new L,direction:new L,color:new Ot,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new L,color:new Ot,distance:0,decay:0};break;case"HemisphereLight":e={direction:new L,skyColor:new Ot,groundColor:new Ot};break;case"RectAreaLight":e={color:new Ot,position:new L,halfWidth:new L,halfHeight:new L};break}return i[t.id]=e,e}}}function $v(){const i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Et};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Et};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Et,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[t.id]=e,e}}}let Xv=0;function qv(i,t){return(t.castShadow?2:0)-(i.castShadow?2:0)+(t.map?1:0)-(i.map?1:0)}function Yv(i){const t=new Wv,e=$v(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new L);const s=new L,o=new Qt,a=new Qt;function r(c){let h=0,d=0,u=0;for(let b=0;b<9;b++)n.probe[b].set(0,0,0);let p=0,m=0,_=0,g=0,f=0,x=0,y=0,v=0,w=0,E=0,S=0;c.sort(qv);for(let b=0,M=c.length;b<M;b++){const C=c[b],U=C.color,O=C.intensity,B=C.distance,X=C.shadow&&C.shadow.map?C.shadow.map.texture:null;if(C.isAmbientLight)h+=U.r*O,d+=U.g*O,u+=U.b*O;else if(C.isLightProbe){for(let W=0;W<9;W++)n.probe[W].addScaledVector(C.sh.coefficients[W],O);S++}else if(C.isDirectionalLight){const W=t.get(C);if(W.color.copy(C.color).multiplyScalar(C.intensity),C.castShadow){const Y=C.shadow,V=e.get(C);V.shadowIntensity=Y.intensity,V.shadowBias=Y.bias,V.shadowNormalBias=Y.normalBias,V.shadowRadius=Y.radius,V.shadowMapSize=Y.mapSize,n.directionalShadow[p]=V,n.directionalShadowMap[p]=X,n.directionalShadowMatrix[p]=C.shadow.matrix,x++}n.directional[p]=W,p++}else if(C.isSpotLight){const W=t.get(C);W.position.setFromMatrixPosition(C.matrixWorld),W.color.copy(U).multiplyScalar(O),W.distance=B,W.coneCos=Math.cos(C.angle),W.penumbraCos=Math.cos(C.angle*(1-C.penumbra)),W.decay=C.decay,n.spot[_]=W;const Y=C.shadow;if(C.map&&(n.spotLightMap[w]=C.map,w++,Y.updateMatrices(C),C.castShadow&&E++),n.spotLightMatrix[_]=Y.matrix,C.castShadow){const V=e.get(C);V.shadowIntensity=Y.intensity,V.shadowBias=Y.bias,V.shadowNormalBias=Y.normalBias,V.shadowRadius=Y.radius,V.shadowMapSize=Y.mapSize,n.spotShadow[_]=V,n.spotShadowMap[_]=X,v++}_++}else if(C.isRectAreaLight){const W=t.get(C);W.color.copy(U).multiplyScalar(O),W.halfWidth.set(C.width*.5,0,0),W.halfHeight.set(0,C.height*.5,0),n.rectArea[g]=W,g++}else if(C.isPointLight){const W=t.get(C);if(W.color.copy(C.color).multiplyScalar(C.intensity),W.distance=C.distance,W.decay=C.decay,C.castShadow){const Y=C.shadow,V=e.get(C);V.shadowIntensity=Y.intensity,V.shadowBias=Y.bias,V.shadowNormalBias=Y.normalBias,V.shadowRadius=Y.radius,V.shadowMapSize=Y.mapSize,V.shadowCameraNear=Y.camera.near,V.shadowCameraFar=Y.camera.far,n.pointShadow[m]=V,n.pointShadowMap[m]=X,n.pointShadowMatrix[m]=C.shadow.matrix,y++}n.point[m]=W,m++}else if(C.isHemisphereLight){const W=t.get(C);W.skyColor.copy(C.color).multiplyScalar(O),W.groundColor.copy(C.groundColor).multiplyScalar(O),n.hemi[f]=W,f++}}g>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=ot.LTC_FLOAT_1,n.rectAreaLTC2=ot.LTC_FLOAT_2):(n.rectAreaLTC1=ot.LTC_HALF_1,n.rectAreaLTC2=ot.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=d,n.ambient[2]=u;const R=n.hash;(R.directionalLength!==p||R.pointLength!==m||R.spotLength!==_||R.rectAreaLength!==g||R.hemiLength!==f||R.numDirectionalShadows!==x||R.numPointShadows!==y||R.numSpotShadows!==v||R.numSpotMaps!==w||R.numLightProbes!==S)&&(n.directional.length=p,n.spot.length=_,n.rectArea.length=g,n.point.length=m,n.hemi.length=f,n.directionalShadow.length=x,n.directionalShadowMap.length=x,n.pointShadow.length=y,n.pointShadowMap.length=y,n.spotShadow.length=v,n.spotShadowMap.length=v,n.directionalShadowMatrix.length=x,n.pointShadowMatrix.length=y,n.spotLightMatrix.length=v+w-E,n.spotLightMap.length=w,n.numSpotLightShadowsWithMaps=E,n.numLightProbes=S,R.directionalLength=p,R.pointLength=m,R.spotLength=_,R.rectAreaLength=g,R.hemiLength=f,R.numDirectionalShadows=x,R.numPointShadows=y,R.numSpotShadows=v,R.numSpotMaps=w,R.numLightProbes=S,n.version=Xv++)}function l(c,h){let d=0,u=0,p=0,m=0,_=0;const g=h.matrixWorldInverse;for(let f=0,x=c.length;f<x;f++){const y=c[f];if(y.isDirectionalLight){const v=n.directional[d];v.direction.setFromMatrixPosition(y.matrixWorld),s.setFromMatrixPosition(y.target.matrixWorld),v.direction.sub(s),v.direction.transformDirection(g),d++}else if(y.isSpotLight){const v=n.spot[p];v.position.setFromMatrixPosition(y.matrixWorld),v.position.applyMatrix4(g),v.direction.setFromMatrixPosition(y.matrixWorld),s.setFromMatrixPosition(y.target.matrixWorld),v.direction.sub(s),v.direction.transformDirection(g),p++}else if(y.isRectAreaLight){const v=n.rectArea[m];v.position.setFromMatrixPosition(y.matrixWorld),v.position.applyMatrix4(g),a.identity(),o.copy(y.matrixWorld),o.premultiply(g),a.extractRotation(o),v.halfWidth.set(y.width*.5,0,0),v.halfHeight.set(0,y.height*.5,0),v.halfWidth.applyMatrix4(a),v.halfHeight.applyMatrix4(a),m++}else if(y.isPointLight){const v=n.point[u];v.position.setFromMatrixPosition(y.matrixWorld),v.position.applyMatrix4(g),u++}else if(y.isHemisphereLight){const v=n.hemi[_];v.direction.setFromMatrixPosition(y.matrixWorld),v.direction.transformDirection(g),_++}}}return{setup:r,setupView:l,state:n}}function _d(i){const t=new Yv(i),e=[],n=[];function s(h){c.camera=h,e.length=0,n.length=0}function o(h){e.push(h)}function a(h){n.push(h)}function r(){t.setup(e)}function l(h){t.setupView(e,h)}const c={lightsArray:e,shadowsArray:n,camera:null,lights:t,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:r,setupLightsView:l,pushLight:o,pushShadow:a}}function jv(i){let t=new WeakMap;function e(s,o=0){const a=t.get(s);let r;return a===void 0?(r=new _d(i),t.set(s,[r])):o>=a.length?(r=new _d(i),a.push(r)):r=a[o],r}function n(){t=new WeakMap}return{get:e,dispose:n}}class Zv extends hs{static get type(){return"MeshDepthMaterial"}constructor(t){super(),this.isMeshDepthMaterial=!0,this.depthPacking=Xp,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}}class Kv extends hs{static get type(){return"MeshDistanceMaterial"}constructor(t){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}}const Jv=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Qv=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function tx(i,t,e){let n=new jc;const s=new Et,o=new Et,a=new be,r=new Zv({depthPacking:qp}),l=new Kv,c={},h=e.maxTextureSize,d={[Ci]:Ke,[Ke]:Ci,[Re]:Re},u=new fi({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Et},radius:{value:4}},vertexShader:Jv,fragmentShader:Qv}),p=u.clone();p.defines.HORIZONTAL_PASS=1;const m=new Jt;m.setAttribute("position",new Me(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const _=new st(m,u),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=gu;let f=this.type;this.render=function(E,S,R){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||E.length===0)return;const b=i.getRenderTarget(),M=i.getActiveCubeFace(),C=i.getActiveMipmapLevel(),U=i.state;U.setBlending(Ei),U.buffers.color.setClear(1,1,1,1),U.buffers.depth.setTest(!0),U.setScissorTest(!1);const O=f!==si&&this.type===si,B=f===si&&this.type!==si;for(let X=0,W=E.length;X<W;X++){const Y=E[X],V=Y.shadow;if(V===void 0){console.warn("THREE.WebGLShadowMap:",Y,"has no shadow.");continue}if(V.autoUpdate===!1&&V.needsUpdate===!1)continue;s.copy(V.mapSize);const it=V.getFrameExtents();if(s.multiply(it),o.copy(V.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(o.x=Math.floor(h/it.x),s.x=o.x*it.x,V.mapSize.x=o.x),s.y>h&&(o.y=Math.floor(h/it.y),s.y=o.y*it.y,V.mapSize.y=o.y)),V.map===null||O===!0||B===!0){const ft=this.type!==si?{minFilter:un,magFilter:un}:{};V.map!==null&&V.map.dispose(),V.map=new ns(s.x,s.y,ft),V.map.texture.name=Y.name+".shadowMap",V.camera.updateProjectionMatrix()}i.setRenderTarget(V.map),i.clear();const Q=V.getViewportCount();for(let ft=0;ft<Q;ft++){const Bt=V.getViewport(ft);a.set(o.x*Bt.x,o.y*Bt.y,o.x*Bt.z,o.y*Bt.w),U.viewport(a),V.updateMatrices(Y,ft),n=V.getFrustum(),v(S,R,V.camera,Y,this.type)}V.isPointLightShadow!==!0&&this.type===si&&x(V,R),V.needsUpdate=!1}f=this.type,g.needsUpdate=!1,i.setRenderTarget(b,M,C)};function x(E,S){const R=t.update(_);u.defines.VSM_SAMPLES!==E.blurSamples&&(u.defines.VSM_SAMPLES=E.blurSamples,p.defines.VSM_SAMPLES=E.blurSamples,u.needsUpdate=!0,p.needsUpdate=!0),E.mapPass===null&&(E.mapPass=new ns(s.x,s.y)),u.uniforms.shadow_pass.value=E.map.texture,u.uniforms.resolution.value=E.mapSize,u.uniforms.radius.value=E.radius,i.setRenderTarget(E.mapPass),i.clear(),i.renderBufferDirect(S,null,R,u,_,null),p.uniforms.shadow_pass.value=E.mapPass.texture,p.uniforms.resolution.value=E.mapSize,p.uniforms.radius.value=E.radius,i.setRenderTarget(E.map),i.clear(),i.renderBufferDirect(S,null,R,p,_,null)}function y(E,S,R,b){let M=null;const C=R.isPointLight===!0?E.customDistanceMaterial:E.customDepthMaterial;if(C!==void 0)M=C;else if(M=R.isPointLight===!0?l:r,i.localClippingEnabled&&S.clipShadows===!0&&Array.isArray(S.clippingPlanes)&&S.clippingPlanes.length!==0||S.displacementMap&&S.displacementScale!==0||S.alphaMap&&S.alphaTest>0||S.map&&S.alphaTest>0){const U=M.uuid,O=S.uuid;let B=c[U];B===void 0&&(B={},c[U]=B);let X=B[O];X===void 0&&(X=M.clone(),B[O]=X,S.addEventListener("dispose",w)),M=X}if(M.visible=S.visible,M.wireframe=S.wireframe,b===si?M.side=S.shadowSide!==null?S.shadowSide:S.side:M.side=S.shadowSide!==null?S.shadowSide:d[S.side],M.alphaMap=S.alphaMap,M.alphaTest=S.alphaTest,M.map=S.map,M.clipShadows=S.clipShadows,M.clippingPlanes=S.clippingPlanes,M.clipIntersection=S.clipIntersection,M.displacementMap=S.displacementMap,M.displacementScale=S.displacementScale,M.displacementBias=S.displacementBias,M.wireframeLinewidth=S.wireframeLinewidth,M.linewidth=S.linewidth,R.isPointLight===!0&&M.isMeshDistanceMaterial===!0){const U=i.properties.get(M);U.light=R}return M}function v(E,S,R,b,M){if(E.visible===!1)return;if(E.layers.test(S.layers)&&(E.isMesh||E.isLine||E.isPoints)&&(E.castShadow||E.receiveShadow&&M===si)&&(!E.frustumCulled||n.intersectsObject(E))){E.modelViewMatrix.multiplyMatrices(R.matrixWorldInverse,E.matrixWorld);const O=t.update(E),B=E.material;if(Array.isArray(B)){const X=O.groups;for(let W=0,Y=X.length;W<Y;W++){const V=X[W],it=B[V.materialIndex];if(it&&it.visible){const Q=y(E,it,b,M);E.onBeforeShadow(i,E,S,R,O,Q,V),i.renderBufferDirect(R,null,O,Q,E,V),E.onAfterShadow(i,E,S,R,O,Q,V)}}}else if(B.visible){const X=y(E,B,b,M);E.onBeforeShadow(i,E,S,R,O,X,null),i.renderBufferDirect(R,null,O,X,E,null),E.onAfterShadow(i,E,S,R,O,X,null)}}const U=E.children;for(let O=0,B=U.length;O<B;O++)v(U[O],S,R,b,M)}function w(E){E.target.removeEventListener("dispose",w);for(const R in c){const b=c[R],M=E.target.uuid;M in b&&(b[M].dispose(),delete b[M])}}}const ex={[Sl]:wl,[El]:Rl,[Tl]:Cl,[Gs]:Al,[wl]:Sl,[Rl]:El,[Cl]:Tl,[Al]:Gs};function nx(i,t){function e(){let I=!1;const rt=new be;let $=null;const K=new be(0,0,0,0);return{setMask:function(dt){$!==dt&&!I&&(i.colorMask(dt,dt,dt,dt),$=dt)},setLocked:function(dt){I=dt},setClear:function(dt,ct,Dt,xe,ze){ze===!0&&(dt*=xe,ct*=xe,Dt*=xe),rt.set(dt,ct,Dt,xe),K.equals(rt)===!1&&(i.clearColor(dt,ct,Dt,xe),K.copy(rt))},reset:function(){I=!1,$=null,K.set(-1,0,0,0)}}}function n(){let I=!1,rt=!1,$=null,K=null,dt=null;return{setReversed:function(ct){if(rt!==ct){const Dt=t.get("EXT_clip_control");rt?Dt.clipControlEXT(Dt.LOWER_LEFT_EXT,Dt.ZERO_TO_ONE_EXT):Dt.clipControlEXT(Dt.LOWER_LEFT_EXT,Dt.NEGATIVE_ONE_TO_ONE_EXT);const xe=dt;dt=null,this.setClear(xe)}rt=ct},getReversed:function(){return rt},setTest:function(ct){ct?at(i.DEPTH_TEST):Rt(i.DEPTH_TEST)},setMask:function(ct){$!==ct&&!I&&(i.depthMask(ct),$=ct)},setFunc:function(ct){if(rt&&(ct=ex[ct]),K!==ct){switch(ct){case Sl:i.depthFunc(i.NEVER);break;case wl:i.depthFunc(i.ALWAYS);break;case El:i.depthFunc(i.LESS);break;case Gs:i.depthFunc(i.LEQUAL);break;case Tl:i.depthFunc(i.EQUAL);break;case Al:i.depthFunc(i.GEQUAL);break;case Rl:i.depthFunc(i.GREATER);break;case Cl:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}K=ct}},setLocked:function(ct){I=ct},setClear:function(ct){dt!==ct&&(rt&&(ct=1-ct),i.clearDepth(ct),dt=ct)},reset:function(){I=!1,$=null,K=null,dt=null,rt=!1}}}function s(){let I=!1,rt=null,$=null,K=null,dt=null,ct=null,Dt=null,xe=null,ze=null;return{setTest:function(se){I||(se?at(i.STENCIL_TEST):Rt(i.STENCIL_TEST))},setMask:function(se){rt!==se&&!I&&(i.stencilMask(se),rt=se)},setFunc:function(se,An,jn){($!==se||K!==An||dt!==jn)&&(i.stencilFunc(se,An,jn),$=se,K=An,dt=jn)},setOp:function(se,An,jn){(ct!==se||Dt!==An||xe!==jn)&&(i.stencilOp(se,An,jn),ct=se,Dt=An,xe=jn)},setLocked:function(se){I=se},setClear:function(se){ze!==se&&(i.clearStencil(se),ze=se)},reset:function(){I=!1,rt=null,$=null,K=null,dt=null,ct=null,Dt=null,xe=null,ze=null}}}const o=new e,a=new n,r=new s,l=new WeakMap,c=new WeakMap;let h={},d={},u=new WeakMap,p=[],m=null,_=!1,g=null,f=null,x=null,y=null,v=null,w=null,E=null,S=new Ot(0,0,0),R=0,b=!1,M=null,C=null,U=null,O=null,B=null;const X=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let W=!1,Y=0;const V=i.getParameter(i.VERSION);V.indexOf("WebGL")!==-1?(Y=parseFloat(/^WebGL (\d)/.exec(V)[1]),W=Y>=1):V.indexOf("OpenGL ES")!==-1&&(Y=parseFloat(/^OpenGL ES (\d)/.exec(V)[1]),W=Y>=2);let it=null,Q={};const ft=i.getParameter(i.SCISSOR_BOX),Bt=i.getParameter(i.VIEWPORT),Kt=new be().fromArray(ft),q=new be().fromArray(Bt);function tt(I,rt,$,K){const dt=new Uint8Array(4),ct=i.createTexture();i.bindTexture(I,ct),i.texParameteri(I,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(I,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Dt=0;Dt<$;Dt++)I===i.TEXTURE_3D||I===i.TEXTURE_2D_ARRAY?i.texImage3D(rt,0,i.RGBA,1,1,K,0,i.RGBA,i.UNSIGNED_BYTE,dt):i.texImage2D(rt+Dt,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,dt);return ct}const gt={};gt[i.TEXTURE_2D]=tt(i.TEXTURE_2D,i.TEXTURE_2D,1),gt[i.TEXTURE_CUBE_MAP]=tt(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),gt[i.TEXTURE_2D_ARRAY]=tt(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),gt[i.TEXTURE_3D]=tt(i.TEXTURE_3D,i.TEXTURE_3D,1,1),o.setClear(0,0,0,1),a.setClear(1),r.setClear(0),at(i.DEPTH_TEST),a.setFunc(Gs),Vt(!1),Wt(Mh),at(i.CULL_FACE),N(Ei);function at(I){h[I]!==!0&&(i.enable(I),h[I]=!0)}function Rt(I){h[I]!==!1&&(i.disable(I),h[I]=!1)}function It(I,rt){return d[I]!==rt?(i.bindFramebuffer(I,rt),d[I]=rt,I===i.DRAW_FRAMEBUFFER&&(d[i.FRAMEBUFFER]=rt),I===i.FRAMEBUFFER&&(d[i.DRAW_FRAMEBUFFER]=rt),!0):!1}function Ht(I,rt){let $=p,K=!1;if(I){$=u.get(rt),$===void 0&&($=[],u.set(rt,$));const dt=I.textures;if($.length!==dt.length||$[0]!==i.COLOR_ATTACHMENT0){for(let ct=0,Dt=dt.length;ct<Dt;ct++)$[ct]=i.COLOR_ATTACHMENT0+ct;$.length=dt.length,K=!0}}else $[0]!==i.BACK&&($[0]=i.BACK,K=!0);K&&i.drawBuffers($)}function ge(I){return m!==I?(i.useProgram(I),m=I,!0):!1}const Xt={[Yi]:i.FUNC_ADD,[yp]:i.FUNC_SUBTRACT,[Mp]:i.FUNC_REVERSE_SUBTRACT};Xt[bp]=i.MIN,Xt[Sp]=i.MAX;const we={[wp]:i.ZERO,[Ep]:i.ONE,[Tp]:i.SRC_COLOR,[Ml]:i.SRC_ALPHA,[Ip]:i.SRC_ALPHA_SATURATE,[Pp]:i.DST_COLOR,[Rp]:i.DST_ALPHA,[Ap]:i.ONE_MINUS_SRC_COLOR,[bl]:i.ONE_MINUS_SRC_ALPHA,[Lp]:i.ONE_MINUS_DST_COLOR,[Cp]:i.ONE_MINUS_DST_ALPHA,[Dp]:i.CONSTANT_COLOR,[Up]:i.ONE_MINUS_CONSTANT_COLOR,[Fp]:i.CONSTANT_ALPHA,[Np]:i.ONE_MINUS_CONSTANT_ALPHA};function N(I,rt,$,K,dt,ct,Dt,xe,ze,se){if(I===Ei){_===!0&&(Rt(i.BLEND),_=!1);return}if(_===!1&&(at(i.BLEND),_=!0),I!==xp){if(I!==g||se!==b){if((f!==Yi||v!==Yi)&&(i.blendEquation(i.FUNC_ADD),f=Yi,v=Yi),se)switch(I){case Fs:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case bh:i.blendFunc(i.ONE,i.ONE);break;case Sh:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case wh:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",I);break}else switch(I){case Fs:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case bh:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case Sh:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case wh:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",I);break}x=null,y=null,w=null,E=null,S.set(0,0,0),R=0,g=I,b=se}return}dt=dt||rt,ct=ct||$,Dt=Dt||K,(rt!==f||dt!==v)&&(i.blendEquationSeparate(Xt[rt],Xt[dt]),f=rt,v=dt),($!==x||K!==y||ct!==w||Dt!==E)&&(i.blendFuncSeparate(we[$],we[K],we[ct],we[Dt]),x=$,y=K,w=ct,E=Dt),(xe.equals(S)===!1||ze!==R)&&(i.blendColor(xe.r,xe.g,xe.b,ze),S.copy(xe),R=ze),g=I,b=!1}function fn(I,rt){I.side===Re?Rt(i.CULL_FACE):at(i.CULL_FACE);let $=I.side===Ke;rt&&($=!$),Vt($),I.blending===Fs&&I.transparent===!1?N(Ei):N(I.blending,I.blendEquation,I.blendSrc,I.blendDst,I.blendEquationAlpha,I.blendSrcAlpha,I.blendDstAlpha,I.blendColor,I.blendAlpha,I.premultipliedAlpha),a.setFunc(I.depthFunc),a.setTest(I.depthTest),a.setMask(I.depthWrite),o.setMask(I.colorWrite);const K=I.stencilWrite;r.setTest(K),K&&(r.setMask(I.stencilWriteMask),r.setFunc(I.stencilFunc,I.stencilRef,I.stencilFuncMask),r.setOp(I.stencilFail,I.stencilZFail,I.stencilZPass)),fe(I.polygonOffset,I.polygonOffsetFactor,I.polygonOffsetUnits),I.alphaToCoverage===!0?at(i.SAMPLE_ALPHA_TO_COVERAGE):Rt(i.SAMPLE_ALPHA_TO_COVERAGE)}function Vt(I){M!==I&&(I?i.frontFace(i.CW):i.frontFace(i.CCW),M=I)}function Wt(I){I!==_p?(at(i.CULL_FACE),I!==C&&(I===Mh?i.cullFace(i.BACK):I===vp?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Rt(i.CULL_FACE),C=I}function Tt(I){I!==U&&(W&&i.lineWidth(I),U=I)}function fe(I,rt,$){I?(at(i.POLYGON_OFFSET_FILL),(O!==rt||B!==$)&&(i.polygonOffset(rt,$),O=rt,B=$)):Rt(i.POLYGON_OFFSET_FILL)}function wt(I){I?at(i.SCISSOR_TEST):Rt(i.SCISSOR_TEST)}function P(I){I===void 0&&(I=i.TEXTURE0+X-1),it!==I&&(i.activeTexture(I),it=I)}function T(I,rt,$){$===void 0&&(it===null?$=i.TEXTURE0+X-1:$=it);let K=Q[$];K===void 0&&(K={type:void 0,texture:void 0},Q[$]=K),(K.type!==I||K.texture!==rt)&&(it!==$&&(i.activeTexture($),it=$),i.bindTexture(I,rt||gt[I]),K.type=I,K.texture=rt)}function k(){const I=Q[it];I!==void 0&&I.type!==void 0&&(i.bindTexture(I.type,null),I.type=void 0,I.texture=void 0)}function Z(){try{i.compressedTexImage2D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function J(){try{i.compressedTexImage3D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function j(){try{i.texSubImage2D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function yt(){try{i.texSubImage3D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function lt(){try{i.compressedTexSubImage2D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function ut(){try{i.compressedTexSubImage3D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function qt(){try{i.texStorage2D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function et(){try{i.texStorage3D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function pt(){try{i.texImage2D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function At(){try{i.texImage3D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Ct(I){Kt.equals(I)===!1&&(i.scissor(I.x,I.y,I.z,I.w),Kt.copy(I))}function mt(I){q.equals(I)===!1&&(i.viewport(I.x,I.y,I.z,I.w),q.copy(I))}function $t(I,rt){let $=c.get(rt);$===void 0&&($=new WeakMap,c.set(rt,$));let K=$.get(I);K===void 0&&(K=i.getUniformBlockIndex(rt,I.name),$.set(I,K))}function kt(I,rt){const K=c.get(rt).get(I);l.get(rt)!==K&&(i.uniformBlockBinding(rt,K,I.__bindingPointIndex),l.set(rt,K))}function ce(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),h={},it=null,Q={},d={},u=new WeakMap,p=[],m=null,_=!1,g=null,f=null,x=null,y=null,v=null,w=null,E=null,S=new Ot(0,0,0),R=0,b=!1,M=null,C=null,U=null,O=null,B=null,Kt.set(0,0,i.canvas.width,i.canvas.height),q.set(0,0,i.canvas.width,i.canvas.height),o.reset(),a.reset(),r.reset()}return{buffers:{color:o,depth:a,stencil:r},enable:at,disable:Rt,bindFramebuffer:It,drawBuffers:Ht,useProgram:ge,setBlending:N,setMaterial:fn,setFlipSided:Vt,setCullFace:Wt,setLineWidth:Tt,setPolygonOffset:fe,setScissorTest:wt,activeTexture:P,bindTexture:T,unbindTexture:k,compressedTexImage2D:Z,compressedTexImage3D:J,texImage2D:pt,texImage3D:At,updateUBOMapping:$t,uniformBlockBinding:kt,texStorage2D:qt,texStorage3D:et,texSubImage2D:j,texSubImage3D:yt,compressedTexSubImage2D:lt,compressedTexSubImage3D:ut,scissor:Ct,viewport:mt,reset:ce}}function vd(i,t,e,n){const s=ix(n);switch(e){case wu:return i*t;case Tu:return i*t;case Au:return i*t*2;case Wc:return i*t/s.components*s.byteLength;case $c:return i*t/s.components*s.byteLength;case Ru:return i*t*2/s.components*s.byteLength;case Xc:return i*t*2/s.components*s.byteLength;case Eu:return i*t*3/s.components*s.byteLength;case Un:return i*t*4/s.components*s.byteLength;case qc:return i*t*4/s.components*s.byteLength;case Ua:case Fa:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case Na:case Oa:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Ul:case Nl:return Math.max(i,16)*Math.max(t,8)/4;case Dl:case Fl:return Math.max(i,8)*Math.max(t,8)/2;case Ol:case kl:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case zl:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Bl:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Hl:return Math.floor((i+4)/5)*Math.floor((t+3)/4)*16;case Gl:return Math.floor((i+4)/5)*Math.floor((t+4)/5)*16;case Vl:return Math.floor((i+5)/6)*Math.floor((t+4)/5)*16;case Wl:return Math.floor((i+5)/6)*Math.floor((t+5)/6)*16;case $l:return Math.floor((i+7)/8)*Math.floor((t+4)/5)*16;case Xl:return Math.floor((i+7)/8)*Math.floor((t+5)/6)*16;case ql:return Math.floor((i+7)/8)*Math.floor((t+7)/8)*16;case Yl:return Math.floor((i+9)/10)*Math.floor((t+4)/5)*16;case jl:return Math.floor((i+9)/10)*Math.floor((t+5)/6)*16;case Zl:return Math.floor((i+9)/10)*Math.floor((t+7)/8)*16;case Kl:return Math.floor((i+9)/10)*Math.floor((t+9)/10)*16;case Jl:return Math.floor((i+11)/12)*Math.floor((t+9)/10)*16;case Ql:return Math.floor((i+11)/12)*Math.floor((t+11)/12)*16;case ka:case tc:case ec:return Math.ceil(i/4)*Math.ceil(t/4)*16;case Cu:case nc:return Math.ceil(i/4)*Math.ceil(t/4)*8;case ic:case sc:return Math.ceil(i/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function ix(i){switch(i){case ui:case Mu:return{byteLength:1,components:1};case Uo:case bu:case zo:return{byteLength:2,components:1};case Gc:case Vc:return{byteLength:2,components:4};case es:case Hc:case $n:return{byteLength:4,components:1};case Su:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}function sx(i,t,e,n,s,o,a){const r=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Et,h=new WeakMap;let d;const u=new WeakMap;let p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function m(P,T){return p?new OffscreenCanvas(P,T):Za("canvas")}function _(P,T,k){let Z=1;const J=wt(P);if((J.width>k||J.height>k)&&(Z=k/Math.max(J.width,J.height)),Z<1)if(typeof HTMLImageElement<"u"&&P instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&P instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&P instanceof ImageBitmap||typeof VideoFrame<"u"&&P instanceof VideoFrame){const j=Math.floor(Z*J.width),yt=Math.floor(Z*J.height);d===void 0&&(d=m(j,yt));const lt=T?m(j,yt):d;return lt.width=j,lt.height=yt,lt.getContext("2d").drawImage(P,0,0,j,yt),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+J.width+"x"+J.height+") to ("+j+"x"+yt+")."),lt}else return"data"in P&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+J.width+"x"+J.height+")."),P;return P}function g(P){return P.generateMipmaps}function f(P){i.generateMipmap(P)}function x(P){return P.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:P.isWebGL3DRenderTarget?i.TEXTURE_3D:P.isWebGLArrayRenderTarget||P.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function y(P,T,k,Z,J=!1){if(P!==null){if(i[P]!==void 0)return i[P];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+P+"'")}let j=T;if(T===i.RED&&(k===i.FLOAT&&(j=i.R32F),k===i.HALF_FLOAT&&(j=i.R16F),k===i.UNSIGNED_BYTE&&(j=i.R8)),T===i.RED_INTEGER&&(k===i.UNSIGNED_BYTE&&(j=i.R8UI),k===i.UNSIGNED_SHORT&&(j=i.R16UI),k===i.UNSIGNED_INT&&(j=i.R32UI),k===i.BYTE&&(j=i.R8I),k===i.SHORT&&(j=i.R16I),k===i.INT&&(j=i.R32I)),T===i.RG&&(k===i.FLOAT&&(j=i.RG32F),k===i.HALF_FLOAT&&(j=i.RG16F),k===i.UNSIGNED_BYTE&&(j=i.RG8)),T===i.RG_INTEGER&&(k===i.UNSIGNED_BYTE&&(j=i.RG8UI),k===i.UNSIGNED_SHORT&&(j=i.RG16UI),k===i.UNSIGNED_INT&&(j=i.RG32UI),k===i.BYTE&&(j=i.RG8I),k===i.SHORT&&(j=i.RG16I),k===i.INT&&(j=i.RG32I)),T===i.RGB_INTEGER&&(k===i.UNSIGNED_BYTE&&(j=i.RGB8UI),k===i.UNSIGNED_SHORT&&(j=i.RGB16UI),k===i.UNSIGNED_INT&&(j=i.RGB32UI),k===i.BYTE&&(j=i.RGB8I),k===i.SHORT&&(j=i.RGB16I),k===i.INT&&(j=i.RGB32I)),T===i.RGBA_INTEGER&&(k===i.UNSIGNED_BYTE&&(j=i.RGBA8UI),k===i.UNSIGNED_SHORT&&(j=i.RGBA16UI),k===i.UNSIGNED_INT&&(j=i.RGBA32UI),k===i.BYTE&&(j=i.RGBA8I),k===i.SHORT&&(j=i.RGBA16I),k===i.INT&&(j=i.RGBA32I)),T===i.RGB&&k===i.UNSIGNED_INT_5_9_9_9_REV&&(j=i.RGB9_E5),T===i.RGBA){const yt=J?cr:Yt.getTransfer(Z);k===i.FLOAT&&(j=i.RGBA32F),k===i.HALF_FLOAT&&(j=i.RGBA16F),k===i.UNSIGNED_BYTE&&(j=yt===ae?i.SRGB8_ALPHA8:i.RGBA8),k===i.UNSIGNED_SHORT_4_4_4_4&&(j=i.RGBA4),k===i.UNSIGNED_SHORT_5_5_5_1&&(j=i.RGB5_A1)}return(j===i.R16F||j===i.R32F||j===i.RG16F||j===i.RG32F||j===i.RGBA16F||j===i.RGBA32F)&&t.get("EXT_color_buffer_float"),j}function v(P,T){let k;return P?T===null||T===es||T===$s?k=i.DEPTH24_STENCIL8:T===$n?k=i.DEPTH32F_STENCIL8:T===Uo&&(k=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):T===null||T===es||T===$s?k=i.DEPTH_COMPONENT24:T===$n?k=i.DEPTH_COMPONENT32F:T===Uo&&(k=i.DEPTH_COMPONENT16),k}function w(P,T){return g(P)===!0||P.isFramebufferTexture&&P.minFilter!==un&&P.minFilter!==Wn?Math.log2(Math.max(T.width,T.height))+1:P.mipmaps!==void 0&&P.mipmaps.length>0?P.mipmaps.length:P.isCompressedTexture&&Array.isArray(P.image)?T.mipmaps.length:1}function E(P){const T=P.target;T.removeEventListener("dispose",E),R(T),T.isVideoTexture&&h.delete(T)}function S(P){const T=P.target;T.removeEventListener("dispose",S),M(T)}function R(P){const T=n.get(P);if(T.__webglInit===void 0)return;const k=P.source,Z=u.get(k);if(Z){const J=Z[T.__cacheKey];J.usedTimes--,J.usedTimes===0&&b(P),Object.keys(Z).length===0&&u.delete(k)}n.remove(P)}function b(P){const T=n.get(P);i.deleteTexture(T.__webglTexture);const k=P.source,Z=u.get(k);delete Z[T.__cacheKey],a.memory.textures--}function M(P){const T=n.get(P);if(P.depthTexture&&(P.depthTexture.dispose(),n.remove(P.depthTexture)),P.isWebGLCubeRenderTarget)for(let Z=0;Z<6;Z++){if(Array.isArray(T.__webglFramebuffer[Z]))for(let J=0;J<T.__webglFramebuffer[Z].length;J++)i.deleteFramebuffer(T.__webglFramebuffer[Z][J]);else i.deleteFramebuffer(T.__webglFramebuffer[Z]);T.__webglDepthbuffer&&i.deleteRenderbuffer(T.__webglDepthbuffer[Z])}else{if(Array.isArray(T.__webglFramebuffer))for(let Z=0;Z<T.__webglFramebuffer.length;Z++)i.deleteFramebuffer(T.__webglFramebuffer[Z]);else i.deleteFramebuffer(T.__webglFramebuffer);if(T.__webglDepthbuffer&&i.deleteRenderbuffer(T.__webglDepthbuffer),T.__webglMultisampledFramebuffer&&i.deleteFramebuffer(T.__webglMultisampledFramebuffer),T.__webglColorRenderbuffer)for(let Z=0;Z<T.__webglColorRenderbuffer.length;Z++)T.__webglColorRenderbuffer[Z]&&i.deleteRenderbuffer(T.__webglColorRenderbuffer[Z]);T.__webglDepthRenderbuffer&&i.deleteRenderbuffer(T.__webglDepthRenderbuffer)}const k=P.textures;for(let Z=0,J=k.length;Z<J;Z++){const j=n.get(k[Z]);j.__webglTexture&&(i.deleteTexture(j.__webglTexture),a.memory.textures--),n.remove(k[Z])}n.remove(P)}let C=0;function U(){C=0}function O(){const P=C;return P>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+P+" texture units while this GPU supports only "+s.maxTextures),C+=1,P}function B(P){const T=[];return T.push(P.wrapS),T.push(P.wrapT),T.push(P.wrapR||0),T.push(P.magFilter),T.push(P.minFilter),T.push(P.anisotropy),T.push(P.internalFormat),T.push(P.format),T.push(P.type),T.push(P.generateMipmaps),T.push(P.premultiplyAlpha),T.push(P.flipY),T.push(P.unpackAlignment),T.push(P.colorSpace),T.join()}function X(P,T){const k=n.get(P);if(P.isVideoTexture&&Tt(P),P.isRenderTargetTexture===!1&&P.version>0&&k.__version!==P.version){const Z=P.image;if(Z===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(Z.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{q(k,P,T);return}}e.bindTexture(i.TEXTURE_2D,k.__webglTexture,i.TEXTURE0+T)}function W(P,T){const k=n.get(P);if(P.version>0&&k.__version!==P.version){q(k,P,T);return}e.bindTexture(i.TEXTURE_2D_ARRAY,k.__webglTexture,i.TEXTURE0+T)}function Y(P,T){const k=n.get(P);if(P.version>0&&k.__version!==P.version){q(k,P,T);return}e.bindTexture(i.TEXTURE_3D,k.__webglTexture,i.TEXTURE0+T)}function V(P,T){const k=n.get(P);if(P.version>0&&k.__version!==P.version){tt(k,P,T);return}e.bindTexture(i.TEXTURE_CUBE_MAP,k.__webglTexture,i.TEXTURE0+T)}const it={[Do]:i.REPEAT,[Zi]:i.CLAMP_TO_EDGE,[Il]:i.MIRRORED_REPEAT},Q={[un]:i.NEAREST,[$p]:i.NEAREST_MIPMAP_NEAREST,[Wo]:i.NEAREST_MIPMAP_LINEAR,[Wn]:i.LINEAR,[Cr]:i.LINEAR_MIPMAP_NEAREST,[Ki]:i.LINEAR_MIPMAP_LINEAR},ft={[jp]:i.NEVER,[em]:i.ALWAYS,[Zp]:i.LESS,[Lu]:i.LEQUAL,[Kp]:i.EQUAL,[tm]:i.GEQUAL,[Jp]:i.GREATER,[Qp]:i.NOTEQUAL};function Bt(P,T){if(T.type===$n&&t.has("OES_texture_float_linear")===!1&&(T.magFilter===Wn||T.magFilter===Cr||T.magFilter===Wo||T.magFilter===Ki||T.minFilter===Wn||T.minFilter===Cr||T.minFilter===Wo||T.minFilter===Ki)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(P,i.TEXTURE_WRAP_S,it[T.wrapS]),i.texParameteri(P,i.TEXTURE_WRAP_T,it[T.wrapT]),(P===i.TEXTURE_3D||P===i.TEXTURE_2D_ARRAY)&&i.texParameteri(P,i.TEXTURE_WRAP_R,it[T.wrapR]),i.texParameteri(P,i.TEXTURE_MAG_FILTER,Q[T.magFilter]),i.texParameteri(P,i.TEXTURE_MIN_FILTER,Q[T.minFilter]),T.compareFunction&&(i.texParameteri(P,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(P,i.TEXTURE_COMPARE_FUNC,ft[T.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(T.magFilter===un||T.minFilter!==Wo&&T.minFilter!==Ki||T.type===$n&&t.has("OES_texture_float_linear")===!1)return;if(T.anisotropy>1||n.get(T).__currentAnisotropy){const k=t.get("EXT_texture_filter_anisotropic");i.texParameterf(P,k.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(T.anisotropy,s.getMaxAnisotropy())),n.get(T).__currentAnisotropy=T.anisotropy}}}function Kt(P,T){let k=!1;P.__webglInit===void 0&&(P.__webglInit=!0,T.addEventListener("dispose",E));const Z=T.source;let J=u.get(Z);J===void 0&&(J={},u.set(Z,J));const j=B(T);if(j!==P.__cacheKey){J[j]===void 0&&(J[j]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,k=!0),J[j].usedTimes++;const yt=J[P.__cacheKey];yt!==void 0&&(J[P.__cacheKey].usedTimes--,yt.usedTimes===0&&b(T)),P.__cacheKey=j,P.__webglTexture=J[j].texture}return k}function q(P,T,k){let Z=i.TEXTURE_2D;(T.isDataArrayTexture||T.isCompressedArrayTexture)&&(Z=i.TEXTURE_2D_ARRAY),T.isData3DTexture&&(Z=i.TEXTURE_3D);const J=Kt(P,T),j=T.source;e.bindTexture(Z,P.__webglTexture,i.TEXTURE0+k);const yt=n.get(j);if(j.version!==yt.__version||J===!0){e.activeTexture(i.TEXTURE0+k);const lt=Yt.getPrimaries(Yt.workingColorSpace),ut=T.colorSpace===wi?null:Yt.getPrimaries(T.colorSpace),qt=T.colorSpace===wi||lt===ut?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,T.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,T.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,T.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,qt);let et=_(T.image,!1,s.maxTextureSize);et=fe(T,et);const pt=o.convert(T.format,T.colorSpace),At=o.convert(T.type);let Ct=y(T.internalFormat,pt,At,T.colorSpace,T.isVideoTexture);Bt(Z,T);let mt;const $t=T.mipmaps,kt=T.isVideoTexture!==!0,ce=yt.__version===void 0||J===!0,I=j.dataReady,rt=w(T,et);if(T.isDepthTexture)Ct=v(T.format===Xs,T.type),ce&&(kt?e.texStorage2D(i.TEXTURE_2D,1,Ct,et.width,et.height):e.texImage2D(i.TEXTURE_2D,0,Ct,et.width,et.height,0,pt,At,null));else if(T.isDataTexture)if($t.length>0){kt&&ce&&e.texStorage2D(i.TEXTURE_2D,rt,Ct,$t[0].width,$t[0].height);for(let $=0,K=$t.length;$<K;$++)mt=$t[$],kt?I&&e.texSubImage2D(i.TEXTURE_2D,$,0,0,mt.width,mt.height,pt,At,mt.data):e.texImage2D(i.TEXTURE_2D,$,Ct,mt.width,mt.height,0,pt,At,mt.data);T.generateMipmaps=!1}else kt?(ce&&e.texStorage2D(i.TEXTURE_2D,rt,Ct,et.width,et.height),I&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,et.width,et.height,pt,At,et.data)):e.texImage2D(i.TEXTURE_2D,0,Ct,et.width,et.height,0,pt,At,et.data);else if(T.isCompressedTexture)if(T.isCompressedArrayTexture){kt&&ce&&e.texStorage3D(i.TEXTURE_2D_ARRAY,rt,Ct,$t[0].width,$t[0].height,et.depth);for(let $=0,K=$t.length;$<K;$++)if(mt=$t[$],T.format!==Un)if(pt!==null)if(kt){if(I)if(T.layerUpdates.size>0){const dt=vd(mt.width,mt.height,T.format,T.type);for(const ct of T.layerUpdates){const Dt=mt.data.subarray(ct*dt/mt.data.BYTES_PER_ELEMENT,(ct+1)*dt/mt.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,$,0,0,ct,mt.width,mt.height,1,pt,Dt)}T.clearLayerUpdates()}else e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,$,0,0,0,mt.width,mt.height,et.depth,pt,mt.data)}else e.compressedTexImage3D(i.TEXTURE_2D_ARRAY,$,Ct,mt.width,mt.height,et.depth,0,mt.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else kt?I&&e.texSubImage3D(i.TEXTURE_2D_ARRAY,$,0,0,0,mt.width,mt.height,et.depth,pt,At,mt.data):e.texImage3D(i.TEXTURE_2D_ARRAY,$,Ct,mt.width,mt.height,et.depth,0,pt,At,mt.data)}else{kt&&ce&&e.texStorage2D(i.TEXTURE_2D,rt,Ct,$t[0].width,$t[0].height);for(let $=0,K=$t.length;$<K;$++)mt=$t[$],T.format!==Un?pt!==null?kt?I&&e.compressedTexSubImage2D(i.TEXTURE_2D,$,0,0,mt.width,mt.height,pt,mt.data):e.compressedTexImage2D(i.TEXTURE_2D,$,Ct,mt.width,mt.height,0,mt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):kt?I&&e.texSubImage2D(i.TEXTURE_2D,$,0,0,mt.width,mt.height,pt,At,mt.data):e.texImage2D(i.TEXTURE_2D,$,Ct,mt.width,mt.height,0,pt,At,mt.data)}else if(T.isDataArrayTexture)if(kt){if(ce&&e.texStorage3D(i.TEXTURE_2D_ARRAY,rt,Ct,et.width,et.height,et.depth),I)if(T.layerUpdates.size>0){const $=vd(et.width,et.height,T.format,T.type);for(const K of T.layerUpdates){const dt=et.data.subarray(K*$/et.data.BYTES_PER_ELEMENT,(K+1)*$/et.data.BYTES_PER_ELEMENT);e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,K,et.width,et.height,1,pt,At,dt)}T.clearLayerUpdates()}else e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,et.width,et.height,et.depth,pt,At,et.data)}else e.texImage3D(i.TEXTURE_2D_ARRAY,0,Ct,et.width,et.height,et.depth,0,pt,At,et.data);else if(T.isData3DTexture)kt?(ce&&e.texStorage3D(i.TEXTURE_3D,rt,Ct,et.width,et.height,et.depth),I&&e.texSubImage3D(i.TEXTURE_3D,0,0,0,0,et.width,et.height,et.depth,pt,At,et.data)):e.texImage3D(i.TEXTURE_3D,0,Ct,et.width,et.height,et.depth,0,pt,At,et.data);else if(T.isFramebufferTexture){if(ce)if(kt)e.texStorage2D(i.TEXTURE_2D,rt,Ct,et.width,et.height);else{let $=et.width,K=et.height;for(let dt=0;dt<rt;dt++)e.texImage2D(i.TEXTURE_2D,dt,Ct,$,K,0,pt,At,null),$>>=1,K>>=1}}else if($t.length>0){if(kt&&ce){const $=wt($t[0]);e.texStorage2D(i.TEXTURE_2D,rt,Ct,$.width,$.height)}for(let $=0,K=$t.length;$<K;$++)mt=$t[$],kt?I&&e.texSubImage2D(i.TEXTURE_2D,$,0,0,pt,At,mt):e.texImage2D(i.TEXTURE_2D,$,Ct,pt,At,mt);T.generateMipmaps=!1}else if(kt){if(ce){const $=wt(et);e.texStorage2D(i.TEXTURE_2D,rt,Ct,$.width,$.height)}I&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,pt,At,et)}else e.texImage2D(i.TEXTURE_2D,0,Ct,pt,At,et);g(T)&&f(Z),yt.__version=j.version,T.onUpdate&&T.onUpdate(T)}P.__version=T.version}function tt(P,T,k){if(T.image.length!==6)return;const Z=Kt(P,T),J=T.source;e.bindTexture(i.TEXTURE_CUBE_MAP,P.__webglTexture,i.TEXTURE0+k);const j=n.get(J);if(J.version!==j.__version||Z===!0){e.activeTexture(i.TEXTURE0+k);const yt=Yt.getPrimaries(Yt.workingColorSpace),lt=T.colorSpace===wi?null:Yt.getPrimaries(T.colorSpace),ut=T.colorSpace===wi||yt===lt?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,T.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,T.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,T.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ut);const qt=T.isCompressedTexture||T.image[0].isCompressedTexture,et=T.image[0]&&T.image[0].isDataTexture,pt=[];for(let K=0;K<6;K++)!qt&&!et?pt[K]=_(T.image[K],!0,s.maxCubemapSize):pt[K]=et?T.image[K].image:T.image[K],pt[K]=fe(T,pt[K]);const At=pt[0],Ct=o.convert(T.format,T.colorSpace),mt=o.convert(T.type),$t=y(T.internalFormat,Ct,mt,T.colorSpace),kt=T.isVideoTexture!==!0,ce=j.__version===void 0||Z===!0,I=J.dataReady;let rt=w(T,At);Bt(i.TEXTURE_CUBE_MAP,T);let $;if(qt){kt&&ce&&e.texStorage2D(i.TEXTURE_CUBE_MAP,rt,$t,At.width,At.height);for(let K=0;K<6;K++){$=pt[K].mipmaps;for(let dt=0;dt<$.length;dt++){const ct=$[dt];T.format!==Un?Ct!==null?kt?I&&e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,dt,0,0,ct.width,ct.height,Ct,ct.data):e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,dt,$t,ct.width,ct.height,0,ct.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):kt?I&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,dt,0,0,ct.width,ct.height,Ct,mt,ct.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,dt,$t,ct.width,ct.height,0,Ct,mt,ct.data)}}}else{if($=T.mipmaps,kt&&ce){$.length>0&&rt++;const K=wt(pt[0]);e.texStorage2D(i.TEXTURE_CUBE_MAP,rt,$t,K.width,K.height)}for(let K=0;K<6;K++)if(et){kt?I&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,0,0,pt[K].width,pt[K].height,Ct,mt,pt[K].data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,$t,pt[K].width,pt[K].height,0,Ct,mt,pt[K].data);for(let dt=0;dt<$.length;dt++){const Dt=$[dt].image[K].image;kt?I&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,dt+1,0,0,Dt.width,Dt.height,Ct,mt,Dt.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,dt+1,$t,Dt.width,Dt.height,0,Ct,mt,Dt.data)}}else{kt?I&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,0,0,Ct,mt,pt[K]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,$t,Ct,mt,pt[K]);for(let dt=0;dt<$.length;dt++){const ct=$[dt];kt?I&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,dt+1,0,0,Ct,mt,ct.image[K]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,dt+1,$t,Ct,mt,ct.image[K])}}}g(T)&&f(i.TEXTURE_CUBE_MAP),j.__version=J.version,T.onUpdate&&T.onUpdate(T)}P.__version=T.version}function gt(P,T,k,Z,J,j){const yt=o.convert(k.format,k.colorSpace),lt=o.convert(k.type),ut=y(k.internalFormat,yt,lt,k.colorSpace),qt=n.get(T),et=n.get(k);if(et.__renderTarget=T,!qt.__hasExternalTextures){const pt=Math.max(1,T.width>>j),At=Math.max(1,T.height>>j);J===i.TEXTURE_3D||J===i.TEXTURE_2D_ARRAY?e.texImage3D(J,j,ut,pt,At,T.depth,0,yt,lt,null):e.texImage2D(J,j,ut,pt,At,0,yt,lt,null)}e.bindFramebuffer(i.FRAMEBUFFER,P),Wt(T)?r.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,Z,J,et.__webglTexture,0,Vt(T)):(J===i.TEXTURE_2D||J>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&J<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,Z,J,et.__webglTexture,j),e.bindFramebuffer(i.FRAMEBUFFER,null)}function at(P,T,k){if(i.bindRenderbuffer(i.RENDERBUFFER,P),T.depthBuffer){const Z=T.depthTexture,J=Z&&Z.isDepthTexture?Z.type:null,j=v(T.stencilBuffer,J),yt=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,lt=Vt(T);Wt(T)?r.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,lt,j,T.width,T.height):k?i.renderbufferStorageMultisample(i.RENDERBUFFER,lt,j,T.width,T.height):i.renderbufferStorage(i.RENDERBUFFER,j,T.width,T.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,yt,i.RENDERBUFFER,P)}else{const Z=T.textures;for(let J=0;J<Z.length;J++){const j=Z[J],yt=o.convert(j.format,j.colorSpace),lt=o.convert(j.type),ut=y(j.internalFormat,yt,lt,j.colorSpace),qt=Vt(T);k&&Wt(T)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,qt,ut,T.width,T.height):Wt(T)?r.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,qt,ut,T.width,T.height):i.renderbufferStorage(i.RENDERBUFFER,ut,T.width,T.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Rt(P,T){if(T&&T.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(e.bindFramebuffer(i.FRAMEBUFFER,P),!(T.depthTexture&&T.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const Z=n.get(T.depthTexture);Z.__renderTarget=T,(!Z.__webglTexture||T.depthTexture.image.width!==T.width||T.depthTexture.image.height!==T.height)&&(T.depthTexture.image.width=T.width,T.depthTexture.image.height=T.height,T.depthTexture.needsUpdate=!0),X(T.depthTexture,0);const J=Z.__webglTexture,j=Vt(T);if(T.depthTexture.format===Ns)Wt(T)?r.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,J,0,j):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,J,0);else if(T.depthTexture.format===Xs)Wt(T)?r.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,J,0,j):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,J,0);else throw new Error("Unknown depthTexture format")}function It(P){const T=n.get(P),k=P.isWebGLCubeRenderTarget===!0;if(T.__boundDepthTexture!==P.depthTexture){const Z=P.depthTexture;if(T.__depthDisposeCallback&&T.__depthDisposeCallback(),Z){const J=()=>{delete T.__boundDepthTexture,delete T.__depthDisposeCallback,Z.removeEventListener("dispose",J)};Z.addEventListener("dispose",J),T.__depthDisposeCallback=J}T.__boundDepthTexture=Z}if(P.depthTexture&&!T.__autoAllocateDepthBuffer){if(k)throw new Error("target.depthTexture not supported in Cube render targets");Rt(T.__webglFramebuffer,P)}else if(k){T.__webglDepthbuffer=[];for(let Z=0;Z<6;Z++)if(e.bindFramebuffer(i.FRAMEBUFFER,T.__webglFramebuffer[Z]),T.__webglDepthbuffer[Z]===void 0)T.__webglDepthbuffer[Z]=i.createRenderbuffer(),at(T.__webglDepthbuffer[Z],P,!1);else{const J=P.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,j=T.__webglDepthbuffer[Z];i.bindRenderbuffer(i.RENDERBUFFER,j),i.framebufferRenderbuffer(i.FRAMEBUFFER,J,i.RENDERBUFFER,j)}}else if(e.bindFramebuffer(i.FRAMEBUFFER,T.__webglFramebuffer),T.__webglDepthbuffer===void 0)T.__webglDepthbuffer=i.createRenderbuffer(),at(T.__webglDepthbuffer,P,!1);else{const Z=P.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,J=T.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,J),i.framebufferRenderbuffer(i.FRAMEBUFFER,Z,i.RENDERBUFFER,J)}e.bindFramebuffer(i.FRAMEBUFFER,null)}function Ht(P,T,k){const Z=n.get(P);T!==void 0&&gt(Z.__webglFramebuffer,P,P.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),k!==void 0&&It(P)}function ge(P){const T=P.texture,k=n.get(P),Z=n.get(T);P.addEventListener("dispose",S);const J=P.textures,j=P.isWebGLCubeRenderTarget===!0,yt=J.length>1;if(yt||(Z.__webglTexture===void 0&&(Z.__webglTexture=i.createTexture()),Z.__version=T.version,a.memory.textures++),j){k.__webglFramebuffer=[];for(let lt=0;lt<6;lt++)if(T.mipmaps&&T.mipmaps.length>0){k.__webglFramebuffer[lt]=[];for(let ut=0;ut<T.mipmaps.length;ut++)k.__webglFramebuffer[lt][ut]=i.createFramebuffer()}else k.__webglFramebuffer[lt]=i.createFramebuffer()}else{if(T.mipmaps&&T.mipmaps.length>0){k.__webglFramebuffer=[];for(let lt=0;lt<T.mipmaps.length;lt++)k.__webglFramebuffer[lt]=i.createFramebuffer()}else k.__webglFramebuffer=i.createFramebuffer();if(yt)for(let lt=0,ut=J.length;lt<ut;lt++){const qt=n.get(J[lt]);qt.__webglTexture===void 0&&(qt.__webglTexture=i.createTexture(),a.memory.textures++)}if(P.samples>0&&Wt(P)===!1){k.__webglMultisampledFramebuffer=i.createFramebuffer(),k.__webglColorRenderbuffer=[],e.bindFramebuffer(i.FRAMEBUFFER,k.__webglMultisampledFramebuffer);for(let lt=0;lt<J.length;lt++){const ut=J[lt];k.__webglColorRenderbuffer[lt]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,k.__webglColorRenderbuffer[lt]);const qt=o.convert(ut.format,ut.colorSpace),et=o.convert(ut.type),pt=y(ut.internalFormat,qt,et,ut.colorSpace,P.isXRRenderTarget===!0),At=Vt(P);i.renderbufferStorageMultisample(i.RENDERBUFFER,At,pt,P.width,P.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+lt,i.RENDERBUFFER,k.__webglColorRenderbuffer[lt])}i.bindRenderbuffer(i.RENDERBUFFER,null),P.depthBuffer&&(k.__webglDepthRenderbuffer=i.createRenderbuffer(),at(k.__webglDepthRenderbuffer,P,!0)),e.bindFramebuffer(i.FRAMEBUFFER,null)}}if(j){e.bindTexture(i.TEXTURE_CUBE_MAP,Z.__webglTexture),Bt(i.TEXTURE_CUBE_MAP,T);for(let lt=0;lt<6;lt++)if(T.mipmaps&&T.mipmaps.length>0)for(let ut=0;ut<T.mipmaps.length;ut++)gt(k.__webglFramebuffer[lt][ut],P,T,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+lt,ut);else gt(k.__webglFramebuffer[lt],P,T,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+lt,0);g(T)&&f(i.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(yt){for(let lt=0,ut=J.length;lt<ut;lt++){const qt=J[lt],et=n.get(qt);e.bindTexture(i.TEXTURE_2D,et.__webglTexture),Bt(i.TEXTURE_2D,qt),gt(k.__webglFramebuffer,P,qt,i.COLOR_ATTACHMENT0+lt,i.TEXTURE_2D,0),g(qt)&&f(i.TEXTURE_2D)}e.unbindTexture()}else{let lt=i.TEXTURE_2D;if((P.isWebGL3DRenderTarget||P.isWebGLArrayRenderTarget)&&(lt=P.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(lt,Z.__webglTexture),Bt(lt,T),T.mipmaps&&T.mipmaps.length>0)for(let ut=0;ut<T.mipmaps.length;ut++)gt(k.__webglFramebuffer[ut],P,T,i.COLOR_ATTACHMENT0,lt,ut);else gt(k.__webglFramebuffer,P,T,i.COLOR_ATTACHMENT0,lt,0);g(T)&&f(lt),e.unbindTexture()}P.depthBuffer&&It(P)}function Xt(P){const T=P.textures;for(let k=0,Z=T.length;k<Z;k++){const J=T[k];if(g(J)){const j=x(P),yt=n.get(J).__webglTexture;e.bindTexture(j,yt),f(j),e.unbindTexture()}}}const we=[],N=[];function fn(P){if(P.samples>0){if(Wt(P)===!1){const T=P.textures,k=P.width,Z=P.height;let J=i.COLOR_BUFFER_BIT;const j=P.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,yt=n.get(P),lt=T.length>1;if(lt)for(let ut=0;ut<T.length;ut++)e.bindFramebuffer(i.FRAMEBUFFER,yt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ut,i.RENDERBUFFER,null),e.bindFramebuffer(i.FRAMEBUFFER,yt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ut,i.TEXTURE_2D,null,0);e.bindFramebuffer(i.READ_FRAMEBUFFER,yt.__webglMultisampledFramebuffer),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,yt.__webglFramebuffer);for(let ut=0;ut<T.length;ut++){if(P.resolveDepthBuffer&&(P.depthBuffer&&(J|=i.DEPTH_BUFFER_BIT),P.stencilBuffer&&P.resolveStencilBuffer&&(J|=i.STENCIL_BUFFER_BIT)),lt){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,yt.__webglColorRenderbuffer[ut]);const qt=n.get(T[ut]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,qt,0)}i.blitFramebuffer(0,0,k,Z,0,0,k,Z,J,i.NEAREST),l===!0&&(we.length=0,N.length=0,we.push(i.COLOR_ATTACHMENT0+ut),P.depthBuffer&&P.resolveDepthBuffer===!1&&(we.push(j),N.push(j),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,N)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,we))}if(e.bindFramebuffer(i.READ_FRAMEBUFFER,null),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),lt)for(let ut=0;ut<T.length;ut++){e.bindFramebuffer(i.FRAMEBUFFER,yt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ut,i.RENDERBUFFER,yt.__webglColorRenderbuffer[ut]);const qt=n.get(T[ut]).__webglTexture;e.bindFramebuffer(i.FRAMEBUFFER,yt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ut,i.TEXTURE_2D,qt,0)}e.bindFramebuffer(i.DRAW_FRAMEBUFFER,yt.__webglMultisampledFramebuffer)}else if(P.depthBuffer&&P.resolveDepthBuffer===!1&&l){const T=P.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[T])}}}function Vt(P){return Math.min(s.maxSamples,P.samples)}function Wt(P){const T=n.get(P);return P.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&T.__useRenderToTexture!==!1}function Tt(P){const T=a.render.frame;h.get(P)!==T&&(h.set(P,T),P.update())}function fe(P,T){const k=P.colorSpace,Z=P.format,J=P.type;return P.isCompressedTexture===!0||P.isVideoTexture===!0||k!==to&&k!==wi&&(Yt.getTransfer(k)===ae?(Z!==Un||J!==ui)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",k)),T}function wt(P){return typeof HTMLImageElement<"u"&&P instanceof HTMLImageElement?(c.width=P.naturalWidth||P.width,c.height=P.naturalHeight||P.height):typeof VideoFrame<"u"&&P instanceof VideoFrame?(c.width=P.displayWidth,c.height=P.displayHeight):(c.width=P.width,c.height=P.height),c}this.allocateTextureUnit=O,this.resetTextureUnits=U,this.setTexture2D=X,this.setTexture2DArray=W,this.setTexture3D=Y,this.setTextureCube=V,this.rebindTextures=Ht,this.setupRenderTarget=ge,this.updateRenderTargetMipmap=Xt,this.updateMultisampleRenderTarget=fn,this.setupDepthRenderbuffer=It,this.setupFrameBufferTexture=gt,this.useMultisampledRTT=Wt}function ox(i,t){function e(n,s=wi){let o;const a=Yt.getTransfer(s);if(n===ui)return i.UNSIGNED_BYTE;if(n===Gc)return i.UNSIGNED_SHORT_4_4_4_4;if(n===Vc)return i.UNSIGNED_SHORT_5_5_5_1;if(n===Su)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===Mu)return i.BYTE;if(n===bu)return i.SHORT;if(n===Uo)return i.UNSIGNED_SHORT;if(n===Hc)return i.INT;if(n===es)return i.UNSIGNED_INT;if(n===$n)return i.FLOAT;if(n===zo)return i.HALF_FLOAT;if(n===wu)return i.ALPHA;if(n===Eu)return i.RGB;if(n===Un)return i.RGBA;if(n===Tu)return i.LUMINANCE;if(n===Au)return i.LUMINANCE_ALPHA;if(n===Ns)return i.DEPTH_COMPONENT;if(n===Xs)return i.DEPTH_STENCIL;if(n===Wc)return i.RED;if(n===$c)return i.RED_INTEGER;if(n===Ru)return i.RG;if(n===Xc)return i.RG_INTEGER;if(n===qc)return i.RGBA_INTEGER;if(n===Ua||n===Fa||n===Na||n===Oa)if(a===ae)if(o=t.get("WEBGL_compressed_texture_s3tc_srgb"),o!==null){if(n===Ua)return o.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Fa)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Na)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Oa)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(o=t.get("WEBGL_compressed_texture_s3tc"),o!==null){if(n===Ua)return o.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Fa)return o.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Na)return o.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Oa)return o.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Dl||n===Ul||n===Fl||n===Nl)if(o=t.get("WEBGL_compressed_texture_pvrtc"),o!==null){if(n===Dl)return o.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Ul)return o.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Fl)return o.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Nl)return o.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Ol||n===kl||n===zl)if(o=t.get("WEBGL_compressed_texture_etc"),o!==null){if(n===Ol||n===kl)return a===ae?o.COMPRESSED_SRGB8_ETC2:o.COMPRESSED_RGB8_ETC2;if(n===zl)return a===ae?o.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:o.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===Bl||n===Hl||n===Gl||n===Vl||n===Wl||n===$l||n===Xl||n===ql||n===Yl||n===jl||n===Zl||n===Kl||n===Jl||n===Ql)if(o=t.get("WEBGL_compressed_texture_astc"),o!==null){if(n===Bl)return a===ae?o.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:o.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Hl)return a===ae?o.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:o.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Gl)return a===ae?o.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:o.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Vl)return a===ae?o.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:o.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Wl)return a===ae?o.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:o.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===$l)return a===ae?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:o.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Xl)return a===ae?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:o.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===ql)return a===ae?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:o.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Yl)return a===ae?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:o.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===jl)return a===ae?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:o.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Zl)return a===ae?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:o.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Kl)return a===ae?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:o.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Jl)return a===ae?o.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:o.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Ql)return a===ae?o.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:o.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===ka||n===tc||n===ec)if(o=t.get("EXT_texture_compression_bptc"),o!==null){if(n===ka)return a===ae?o.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:o.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===tc)return o.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===ec)return o.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Cu||n===nc||n===ic||n===sc)if(o=t.get("EXT_texture_compression_rgtc"),o!==null){if(n===ka)return o.COMPRESSED_RED_RGTC1_EXT;if(n===nc)return o.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===ic)return o.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===sc)return o.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===$s?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:e}}class ax extends yn{constructor(t=[]){super(),this.isArrayCamera=!0,this.cameras=t}}class Nt extends Se{constructor(){super(),this.isGroup=!0,this.type="Group"}}const rx={type:"move"};class il{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Nt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Nt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new L,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new L),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Nt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new L,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new L),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){const e=this._hand;if(e)for(const n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let s=null,o=null,a=null;const r=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){a=!0;for(const _ of t.hand.values()){const g=e.getJointPose(_,n),f=this._getHandJoint(c,_);g!==null&&(f.matrix.fromArray(g.transform.matrix),f.matrix.decompose(f.position,f.rotation,f.scale),f.matrixWorldNeedsUpdate=!0,f.jointRadius=g.radius),f.visible=g!==null}const h=c.joints["index-finger-tip"],d=c.joints["thumb-tip"],u=h.position.distanceTo(d.position),p=.02,m=.005;c.inputState.pinching&&u>p+m?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&u<=p-m&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(o=e.getPose(t.gripSpace,n),o!==null&&(l.matrix.fromArray(o.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,o.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(o.linearVelocity)):l.hasLinearVelocity=!1,o.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(o.angularVelocity)):l.hasAngularVelocity=!1));r!==null&&(s=e.getPose(t.targetRaySpace,n),s===null&&o!==null&&(s=o),s!==null&&(r.matrix.fromArray(s.transform.matrix),r.matrix.decompose(r.position,r.rotation,r.scale),r.matrixWorldNeedsUpdate=!0,s.linearVelocity?(r.hasLinearVelocity=!0,r.linearVelocity.copy(s.linearVelocity)):r.hasLinearVelocity=!1,s.angularVelocity?(r.hasAngularVelocity=!0,r.angularVelocity.copy(s.angularVelocity)):r.hasAngularVelocity=!1,this.dispatchEvent(rx)))}return r!==null&&(r.visible=s!==null),l!==null&&(l.visible=o!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){const n=new Nt;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}}const lx=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,cx=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class hx{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e,n){if(this.texture===null){const s=new We,o=t.properties.get(s);o.__webglTexture=e.texture,(e.depthNear!=n.depthNear||e.depthFar!=n.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=s}}getMesh(t){if(this.texture!==null&&this.mesh===null){const e=t.cameras[0].viewport,n=new fi({vertexShader:lx,fragmentShader:cx,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new st(new qn(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class dx extends ls{constructor(t,e){super();const n=this;let s=null,o=1,a=null,r="local-floor",l=1,c=null,h=null,d=null,u=null,p=null,m=null;const _=new hx,g=e.getContextAttributes();let f=null,x=null;const y=[],v=[],w=new Et;let E=null;const S=new yn;S.viewport=new be;const R=new yn;R.viewport=new be;const b=[S,R],M=new ax;let C=null,U=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(q){let tt=y[q];return tt===void 0&&(tt=new il,y[q]=tt),tt.getTargetRaySpace()},this.getControllerGrip=function(q){let tt=y[q];return tt===void 0&&(tt=new il,y[q]=tt),tt.getGripSpace()},this.getHand=function(q){let tt=y[q];return tt===void 0&&(tt=new il,y[q]=tt),tt.getHandSpace()};function O(q){const tt=v.indexOf(q.inputSource);if(tt===-1)return;const gt=y[tt];gt!==void 0&&(gt.update(q.inputSource,q.frame,c||a),gt.dispatchEvent({type:q.type,data:q.inputSource}))}function B(){s.removeEventListener("select",O),s.removeEventListener("selectstart",O),s.removeEventListener("selectend",O),s.removeEventListener("squeeze",O),s.removeEventListener("squeezestart",O),s.removeEventListener("squeezeend",O),s.removeEventListener("end",B),s.removeEventListener("inputsourceschange",X);for(let q=0;q<y.length;q++){const tt=v[q];tt!==null&&(v[q]=null,y[q].disconnect(tt))}C=null,U=null,_.reset(),t.setRenderTarget(f),p=null,u=null,d=null,s=null,x=null,Kt.stop(),n.isPresenting=!1,t.setPixelRatio(E),t.setSize(w.width,w.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(q){o=q,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(q){r=q,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(q){c=q},this.getBaseLayer=function(){return u!==null?u:p},this.getBinding=function(){return d},this.getFrame=function(){return m},this.getSession=function(){return s},this.setSession=async function(q){if(s=q,s!==null){if(f=t.getRenderTarget(),s.addEventListener("select",O),s.addEventListener("selectstart",O),s.addEventListener("selectend",O),s.addEventListener("squeeze",O),s.addEventListener("squeezestart",O),s.addEventListener("squeezeend",O),s.addEventListener("end",B),s.addEventListener("inputsourceschange",X),g.xrCompatible!==!0&&await e.makeXRCompatible(),E=t.getPixelRatio(),t.getSize(w),s.renderState.layers===void 0){const tt={antialias:g.antialias,alpha:!0,depth:g.depth,stencil:g.stencil,framebufferScaleFactor:o};p=new XRWebGLLayer(s,e,tt),s.updateRenderState({baseLayer:p}),t.setPixelRatio(1),t.setSize(p.framebufferWidth,p.framebufferHeight,!1),x=new ns(p.framebufferWidth,p.framebufferHeight,{format:Un,type:ui,colorSpace:t.outputColorSpace,stencilBuffer:g.stencil})}else{let tt=null,gt=null,at=null;g.depth&&(at=g.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,tt=g.stencil?Xs:Ns,gt=g.stencil?$s:es);const Rt={colorFormat:e.RGBA8,depthFormat:at,scaleFactor:o};d=new XRWebGLBinding(s,e),u=d.createProjectionLayer(Rt),s.updateRenderState({layers:[u]}),t.setPixelRatio(1),t.setSize(u.textureWidth,u.textureHeight,!1),x=new ns(u.textureWidth,u.textureHeight,{format:Un,type:ui,depthTexture:new Wu(u.textureWidth,u.textureHeight,gt,void 0,void 0,void 0,void 0,void 0,void 0,tt),stencilBuffer:g.stencil,colorSpace:t.outputColorSpace,samples:g.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1})}x.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(r),Kt.setContext(s),Kt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return _.getDepthTexture()};function X(q){for(let tt=0;tt<q.removed.length;tt++){const gt=q.removed[tt],at=v.indexOf(gt);at>=0&&(v[at]=null,y[at].disconnect(gt))}for(let tt=0;tt<q.added.length;tt++){const gt=q.added[tt];let at=v.indexOf(gt);if(at===-1){for(let It=0;It<y.length;It++)if(It>=v.length){v.push(gt),at=It;break}else if(v[It]===null){v[It]=gt,at=It;break}if(at===-1)break}const Rt=y[at];Rt&&Rt.connect(gt)}}const W=new L,Y=new L;function V(q,tt,gt){W.setFromMatrixPosition(tt.matrixWorld),Y.setFromMatrixPosition(gt.matrixWorld);const at=W.distanceTo(Y),Rt=tt.projectionMatrix.elements,It=gt.projectionMatrix.elements,Ht=Rt[14]/(Rt[10]-1),ge=Rt[14]/(Rt[10]+1),Xt=(Rt[9]+1)/Rt[5],we=(Rt[9]-1)/Rt[5],N=(Rt[8]-1)/Rt[0],fn=(It[8]+1)/It[0],Vt=Ht*N,Wt=Ht*fn,Tt=at/(-N+fn),fe=Tt*-N;if(tt.matrixWorld.decompose(q.position,q.quaternion,q.scale),q.translateX(fe),q.translateZ(Tt),q.matrixWorld.compose(q.position,q.quaternion,q.scale),q.matrixWorldInverse.copy(q.matrixWorld).invert(),Rt[10]===-1)q.projectionMatrix.copy(tt.projectionMatrix),q.projectionMatrixInverse.copy(tt.projectionMatrixInverse);else{const wt=Ht+Tt,P=ge+Tt,T=Vt-fe,k=Wt+(at-fe),Z=Xt*ge/P*wt,J=we*ge/P*wt;q.projectionMatrix.makePerspective(T,k,Z,J,wt,P),q.projectionMatrixInverse.copy(q.projectionMatrix).invert()}}function it(q,tt){tt===null?q.matrixWorld.copy(q.matrix):q.matrixWorld.multiplyMatrices(tt.matrixWorld,q.matrix),q.matrixWorldInverse.copy(q.matrixWorld).invert()}this.updateCamera=function(q){if(s===null)return;let tt=q.near,gt=q.far;_.texture!==null&&(_.depthNear>0&&(tt=_.depthNear),_.depthFar>0&&(gt=_.depthFar)),M.near=R.near=S.near=tt,M.far=R.far=S.far=gt,(C!==M.near||U!==M.far)&&(s.updateRenderState({depthNear:M.near,depthFar:M.far}),C=M.near,U=M.far),S.layers.mask=q.layers.mask|2,R.layers.mask=q.layers.mask|4,M.layers.mask=S.layers.mask|R.layers.mask;const at=q.parent,Rt=M.cameras;it(M,at);for(let It=0;It<Rt.length;It++)it(Rt[It],at);Rt.length===2?V(M,S,R):M.projectionMatrix.copy(S.projectionMatrix),Q(q,M,at)};function Q(q,tt,gt){gt===null?q.matrix.copy(tt.matrixWorld):(q.matrix.copy(gt.matrixWorld),q.matrix.invert(),q.matrix.multiply(tt.matrixWorld)),q.matrix.decompose(q.position,q.quaternion,q.scale),q.updateMatrixWorld(!0),q.projectionMatrix.copy(tt.projectionMatrix),q.projectionMatrixInverse.copy(tt.projectionMatrixInverse),q.isPerspectiveCamera&&(q.fov=oc*2*Math.atan(1/q.projectionMatrix.elements[5]),q.zoom=1)}this.getCamera=function(){return M},this.getFoveation=function(){if(!(u===null&&p===null))return l},this.setFoveation=function(q){l=q,u!==null&&(u.fixedFoveation=q),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=q)},this.hasDepthSensing=function(){return _.texture!==null},this.getDepthSensingMesh=function(){return _.getMesh(M)};let ft=null;function Bt(q,tt){if(h=tt.getViewerPose(c||a),m=tt,h!==null){const gt=h.views;p!==null&&(t.setRenderTargetFramebuffer(x,p.framebuffer),t.setRenderTarget(x));let at=!1;gt.length!==M.cameras.length&&(M.cameras.length=0,at=!0);for(let It=0;It<gt.length;It++){const Ht=gt[It];let ge=null;if(p!==null)ge=p.getViewport(Ht);else{const we=d.getViewSubImage(u,Ht);ge=we.viewport,It===0&&(t.setRenderTargetTextures(x,we.colorTexture,u.ignoreDepthValues?void 0:we.depthStencilTexture),t.setRenderTarget(x))}let Xt=b[It];Xt===void 0&&(Xt=new yn,Xt.layers.enable(It),Xt.viewport=new be,b[It]=Xt),Xt.matrix.fromArray(Ht.transform.matrix),Xt.matrix.decompose(Xt.position,Xt.quaternion,Xt.scale),Xt.projectionMatrix.fromArray(Ht.projectionMatrix),Xt.projectionMatrixInverse.copy(Xt.projectionMatrix).invert(),Xt.viewport.set(ge.x,ge.y,ge.width,ge.height),It===0&&(M.matrix.copy(Xt.matrix),M.matrix.decompose(M.position,M.quaternion,M.scale)),at===!0&&M.cameras.push(Xt)}const Rt=s.enabledFeatures;if(Rt&&Rt.includes("depth-sensing")){const It=d.getDepthInformation(gt[0]);It&&It.isValid&&It.texture&&_.init(t,It,s.renderState)}}for(let gt=0;gt<y.length;gt++){const at=v[gt],Rt=y[gt];at!==null&&Rt!==void 0&&Rt.update(at,tt,c||a)}ft&&ft(q,tt),tt.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:tt}),m=null}const Kt=new Gu;Kt.setAnimationLoop(Bt),this.setAnimationLoop=function(q){ft=q},this.dispose=function(){}}}const Bi=new Xn,ux=new Qt;function fx(i,t){function e(g,f){g.matrixAutoUpdate===!0&&g.updateMatrix(),f.value.copy(g.matrix)}function n(g,f){f.color.getRGB(g.fogColor.value,ku(i)),f.isFog?(g.fogNear.value=f.near,g.fogFar.value=f.far):f.isFogExp2&&(g.fogDensity.value=f.density)}function s(g,f,x,y,v){f.isMeshBasicMaterial||f.isMeshLambertMaterial?o(g,f):f.isMeshToonMaterial?(o(g,f),d(g,f)):f.isMeshPhongMaterial?(o(g,f),h(g,f)):f.isMeshStandardMaterial?(o(g,f),u(g,f),f.isMeshPhysicalMaterial&&p(g,f,v)):f.isMeshMatcapMaterial?(o(g,f),m(g,f)):f.isMeshDepthMaterial?o(g,f):f.isMeshDistanceMaterial?(o(g,f),_(g,f)):f.isMeshNormalMaterial?o(g,f):f.isLineBasicMaterial?(a(g,f),f.isLineDashedMaterial&&r(g,f)):f.isPointsMaterial?l(g,f,x,y):f.isSpriteMaterial?c(g,f):f.isShadowMaterial?(g.color.value.copy(f.color),g.opacity.value=f.opacity):f.isShaderMaterial&&(f.uniformsNeedUpdate=!1)}function o(g,f){g.opacity.value=f.opacity,f.color&&g.diffuse.value.copy(f.color),f.emissive&&g.emissive.value.copy(f.emissive).multiplyScalar(f.emissiveIntensity),f.map&&(g.map.value=f.map,e(f.map,g.mapTransform)),f.alphaMap&&(g.alphaMap.value=f.alphaMap,e(f.alphaMap,g.alphaMapTransform)),f.bumpMap&&(g.bumpMap.value=f.bumpMap,e(f.bumpMap,g.bumpMapTransform),g.bumpScale.value=f.bumpScale,f.side===Ke&&(g.bumpScale.value*=-1)),f.normalMap&&(g.normalMap.value=f.normalMap,e(f.normalMap,g.normalMapTransform),g.normalScale.value.copy(f.normalScale),f.side===Ke&&g.normalScale.value.negate()),f.displacementMap&&(g.displacementMap.value=f.displacementMap,e(f.displacementMap,g.displacementMapTransform),g.displacementScale.value=f.displacementScale,g.displacementBias.value=f.displacementBias),f.emissiveMap&&(g.emissiveMap.value=f.emissiveMap,e(f.emissiveMap,g.emissiveMapTransform)),f.specularMap&&(g.specularMap.value=f.specularMap,e(f.specularMap,g.specularMapTransform)),f.alphaTest>0&&(g.alphaTest.value=f.alphaTest);const x=t.get(f),y=x.envMap,v=x.envMapRotation;y&&(g.envMap.value=y,Bi.copy(v),Bi.x*=-1,Bi.y*=-1,Bi.z*=-1,y.isCubeTexture&&y.isRenderTargetTexture===!1&&(Bi.y*=-1,Bi.z*=-1),g.envMapRotation.value.setFromMatrix4(ux.makeRotationFromEuler(Bi)),g.flipEnvMap.value=y.isCubeTexture&&y.isRenderTargetTexture===!1?-1:1,g.reflectivity.value=f.reflectivity,g.ior.value=f.ior,g.refractionRatio.value=f.refractionRatio),f.lightMap&&(g.lightMap.value=f.lightMap,g.lightMapIntensity.value=f.lightMapIntensity,e(f.lightMap,g.lightMapTransform)),f.aoMap&&(g.aoMap.value=f.aoMap,g.aoMapIntensity.value=f.aoMapIntensity,e(f.aoMap,g.aoMapTransform))}function a(g,f){g.diffuse.value.copy(f.color),g.opacity.value=f.opacity,f.map&&(g.map.value=f.map,e(f.map,g.mapTransform))}function r(g,f){g.dashSize.value=f.dashSize,g.totalSize.value=f.dashSize+f.gapSize,g.scale.value=f.scale}function l(g,f,x,y){g.diffuse.value.copy(f.color),g.opacity.value=f.opacity,g.size.value=f.size*x,g.scale.value=y*.5,f.map&&(g.map.value=f.map,e(f.map,g.uvTransform)),f.alphaMap&&(g.alphaMap.value=f.alphaMap,e(f.alphaMap,g.alphaMapTransform)),f.alphaTest>0&&(g.alphaTest.value=f.alphaTest)}function c(g,f){g.diffuse.value.copy(f.color),g.opacity.value=f.opacity,g.rotation.value=f.rotation,f.map&&(g.map.value=f.map,e(f.map,g.mapTransform)),f.alphaMap&&(g.alphaMap.value=f.alphaMap,e(f.alphaMap,g.alphaMapTransform)),f.alphaTest>0&&(g.alphaTest.value=f.alphaTest)}function h(g,f){g.specular.value.copy(f.specular),g.shininess.value=Math.max(f.shininess,1e-4)}function d(g,f){f.gradientMap&&(g.gradientMap.value=f.gradientMap)}function u(g,f){g.metalness.value=f.metalness,f.metalnessMap&&(g.metalnessMap.value=f.metalnessMap,e(f.metalnessMap,g.metalnessMapTransform)),g.roughness.value=f.roughness,f.roughnessMap&&(g.roughnessMap.value=f.roughnessMap,e(f.roughnessMap,g.roughnessMapTransform)),f.envMap&&(g.envMapIntensity.value=f.envMapIntensity)}function p(g,f,x){g.ior.value=f.ior,f.sheen>0&&(g.sheenColor.value.copy(f.sheenColor).multiplyScalar(f.sheen),g.sheenRoughness.value=f.sheenRoughness,f.sheenColorMap&&(g.sheenColorMap.value=f.sheenColorMap,e(f.sheenColorMap,g.sheenColorMapTransform)),f.sheenRoughnessMap&&(g.sheenRoughnessMap.value=f.sheenRoughnessMap,e(f.sheenRoughnessMap,g.sheenRoughnessMapTransform))),f.clearcoat>0&&(g.clearcoat.value=f.clearcoat,g.clearcoatRoughness.value=f.clearcoatRoughness,f.clearcoatMap&&(g.clearcoatMap.value=f.clearcoatMap,e(f.clearcoatMap,g.clearcoatMapTransform)),f.clearcoatRoughnessMap&&(g.clearcoatRoughnessMap.value=f.clearcoatRoughnessMap,e(f.clearcoatRoughnessMap,g.clearcoatRoughnessMapTransform)),f.clearcoatNormalMap&&(g.clearcoatNormalMap.value=f.clearcoatNormalMap,e(f.clearcoatNormalMap,g.clearcoatNormalMapTransform),g.clearcoatNormalScale.value.copy(f.clearcoatNormalScale),f.side===Ke&&g.clearcoatNormalScale.value.negate())),f.dispersion>0&&(g.dispersion.value=f.dispersion),f.iridescence>0&&(g.iridescence.value=f.iridescence,g.iridescenceIOR.value=f.iridescenceIOR,g.iridescenceThicknessMinimum.value=f.iridescenceThicknessRange[0],g.iridescenceThicknessMaximum.value=f.iridescenceThicknessRange[1],f.iridescenceMap&&(g.iridescenceMap.value=f.iridescenceMap,e(f.iridescenceMap,g.iridescenceMapTransform)),f.iridescenceThicknessMap&&(g.iridescenceThicknessMap.value=f.iridescenceThicknessMap,e(f.iridescenceThicknessMap,g.iridescenceThicknessMapTransform))),f.transmission>0&&(g.transmission.value=f.transmission,g.transmissionSamplerMap.value=x.texture,g.transmissionSamplerSize.value.set(x.width,x.height),f.transmissionMap&&(g.transmissionMap.value=f.transmissionMap,e(f.transmissionMap,g.transmissionMapTransform)),g.thickness.value=f.thickness,f.thicknessMap&&(g.thicknessMap.value=f.thicknessMap,e(f.thicknessMap,g.thicknessMapTransform)),g.attenuationDistance.value=f.attenuationDistance,g.attenuationColor.value.copy(f.attenuationColor)),f.anisotropy>0&&(g.anisotropyVector.value.set(f.anisotropy*Math.cos(f.anisotropyRotation),f.anisotropy*Math.sin(f.anisotropyRotation)),f.anisotropyMap&&(g.anisotropyMap.value=f.anisotropyMap,e(f.anisotropyMap,g.anisotropyMapTransform))),g.specularIntensity.value=f.specularIntensity,g.specularColor.value.copy(f.specularColor),f.specularColorMap&&(g.specularColorMap.value=f.specularColorMap,e(f.specularColorMap,g.specularColorMapTransform)),f.specularIntensityMap&&(g.specularIntensityMap.value=f.specularIntensityMap,e(f.specularIntensityMap,g.specularIntensityMapTransform))}function m(g,f){f.matcap&&(g.matcap.value=f.matcap)}function _(g,f){const x=t.get(f).light;g.referencePosition.value.setFromMatrixPosition(x.matrixWorld),g.nearDistance.value=x.shadow.camera.near,g.farDistance.value=x.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function px(i,t,e,n){let s={},o={},a=[];const r=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(x,y){const v=y.program;n.uniformBlockBinding(x,v)}function c(x,y){let v=s[x.id];v===void 0&&(m(x),v=h(x),s[x.id]=v,x.addEventListener("dispose",g));const w=y.program;n.updateUBOMapping(x,w);const E=t.render.frame;o[x.id]!==E&&(u(x),o[x.id]=E)}function h(x){const y=d();x.__bindingPointIndex=y;const v=i.createBuffer(),w=x.__size,E=x.usage;return i.bindBuffer(i.UNIFORM_BUFFER,v),i.bufferData(i.UNIFORM_BUFFER,w,E),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,y,v),v}function d(){for(let x=0;x<r;x++)if(a.indexOf(x)===-1)return a.push(x),x;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(x){const y=s[x.id],v=x.uniforms,w=x.__cache;i.bindBuffer(i.UNIFORM_BUFFER,y);for(let E=0,S=v.length;E<S;E++){const R=Array.isArray(v[E])?v[E]:[v[E]];for(let b=0,M=R.length;b<M;b++){const C=R[b];if(p(C,E,b,w)===!0){const U=C.__offset,O=Array.isArray(C.value)?C.value:[C.value];let B=0;for(let X=0;X<O.length;X++){const W=O[X],Y=_(W);typeof W=="number"||typeof W=="boolean"?(C.__data[0]=W,i.bufferSubData(i.UNIFORM_BUFFER,U+B,C.__data)):W.isMatrix3?(C.__data[0]=W.elements[0],C.__data[1]=W.elements[1],C.__data[2]=W.elements[2],C.__data[3]=0,C.__data[4]=W.elements[3],C.__data[5]=W.elements[4],C.__data[6]=W.elements[5],C.__data[7]=0,C.__data[8]=W.elements[6],C.__data[9]=W.elements[7],C.__data[10]=W.elements[8],C.__data[11]=0):(W.toArray(C.__data,B),B+=Y.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,U,C.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function p(x,y,v,w){const E=x.value,S=y+"_"+v;if(w[S]===void 0)return typeof E=="number"||typeof E=="boolean"?w[S]=E:w[S]=E.clone(),!0;{const R=w[S];if(typeof E=="number"||typeof E=="boolean"){if(R!==E)return w[S]=E,!0}else if(R.equals(E)===!1)return R.copy(E),!0}return!1}function m(x){const y=x.uniforms;let v=0;const w=16;for(let S=0,R=y.length;S<R;S++){const b=Array.isArray(y[S])?y[S]:[y[S]];for(let M=0,C=b.length;M<C;M++){const U=b[M],O=Array.isArray(U.value)?U.value:[U.value];for(let B=0,X=O.length;B<X;B++){const W=O[B],Y=_(W),V=v%w,it=V%Y.boundary,Q=V+it;v+=it,Q!==0&&w-Q<Y.storage&&(v+=w-Q),U.__data=new Float32Array(Y.storage/Float32Array.BYTES_PER_ELEMENT),U.__offset=v,v+=Y.storage}}}const E=v%w;return E>0&&(v+=w-E),x.__size=v,x.__cache={},this}function _(x){const y={boundary:0,storage:0};return typeof x=="number"||typeof x=="boolean"?(y.boundary=4,y.storage=4):x.isVector2?(y.boundary=8,y.storage=8):x.isVector3||x.isColor?(y.boundary=16,y.storage=12):x.isVector4?(y.boundary=16,y.storage=16):x.isMatrix3?(y.boundary=48,y.storage=48):x.isMatrix4?(y.boundary=64,y.storage=64):x.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",x),y}function g(x){const y=x.target;y.removeEventListener("dispose",g);const v=a.indexOf(y.__bindingPointIndex);a.splice(v,1),i.deleteBuffer(s[y.id]),delete s[y.id],delete o[y.id]}function f(){for(const x in s)i.deleteBuffer(s[x]);a=[],s={},o={}}return{bind:l,update:c,dispose:f}}class mx{constructor(t={}){const{canvas:e=sm(),context:n=null,depth:s=!0,stencil:o=!1,alpha:a=!1,antialias:r=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:d=!1,reverseDepthBuffer:u=!1}=t;this.isWebGLRenderer=!0;let p;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=n.getContextAttributes().alpha}else p=a;const m=new Uint32Array(4),_=new Int32Array(4);let g=null,f=null;const x=[],y=[];this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=dn,this.toneMapping=Ti,this.toneMappingExposure=1;const v=this;let w=!1,E=0,S=0,R=null,b=-1,M=null;const C=new be,U=new be;let O=null;const B=new Ot(0);let X=0,W=e.width,Y=e.height,V=1,it=null,Q=null;const ft=new be(0,0,W,Y),Bt=new be(0,0,W,Y);let Kt=!1;const q=new jc;let tt=!1,gt=!1;const at=new Qt,Rt=new Qt,It=new L,Ht=new be,ge={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Xt=!1;function we(){return R===null?V:1}let N=n;function fn(A,D){return e.getContext(A,D)}try{const A={alpha:!0,depth:s,stencil:o,antialias:r,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:d};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${Bc}`),e.addEventListener("webglcontextlost",K,!1),e.addEventListener("webglcontextrestored",dt,!1),e.addEventListener("webglcontextcreationerror",ct,!1),N===null){const D="webgl2";if(N=fn(D,A),N===null)throw fn(D)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(A){throw console.error("THREE.WebGLRenderer: "+A.message),A}let Vt,Wt,Tt,fe,wt,P,T,k,Z,J,j,yt,lt,ut,qt,et,pt,At,Ct,mt,$t,kt,ce,I;function rt(){Vt=new y_(N),Vt.init(),kt=new ox(N,Vt),Wt=new p_(N,Vt,t,kt),Tt=new nx(N,Vt),Wt.reverseDepthBuffer&&u&&Tt.buffers.depth.setReversed(!0),fe=new S_(N),wt=new Hv,P=new sx(N,Vt,Tt,wt,Wt,kt,fe),T=new g_(v),k=new x_(v),Z=new Pm(N),ce=new u_(N,Z),J=new M_(N,Z,fe,ce),j=new E_(N,J,Z,fe),Ct=new w_(N,Wt,P),et=new m_(wt),yt=new Bv(v,T,k,Vt,Wt,ce,et),lt=new fx(v,wt),ut=new Vv,qt=new jv(Vt),At=new d_(v,T,k,Tt,j,p,l),pt=new tx(v,j,Wt),I=new px(N,fe,Wt,Tt),mt=new f_(N,Vt,fe),$t=new b_(N,Vt,fe),fe.programs=yt.programs,v.capabilities=Wt,v.extensions=Vt,v.properties=wt,v.renderLists=ut,v.shadowMap=pt,v.state=Tt,v.info=fe}rt();const $=new dx(v,N);this.xr=$,this.getContext=function(){return N},this.getContextAttributes=function(){return N.getContextAttributes()},this.forceContextLoss=function(){const A=Vt.get("WEBGL_lose_context");A&&A.loseContext()},this.forceContextRestore=function(){const A=Vt.get("WEBGL_lose_context");A&&A.restoreContext()},this.getPixelRatio=function(){return V},this.setPixelRatio=function(A){A!==void 0&&(V=A,this.setSize(W,Y,!1))},this.getSize=function(A){return A.set(W,Y)},this.setSize=function(A,D,H=!0){if($.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}W=A,Y=D,e.width=Math.floor(A*V),e.height=Math.floor(D*V),H===!0&&(e.style.width=A+"px",e.style.height=D+"px"),this.setViewport(0,0,A,D)},this.getDrawingBufferSize=function(A){return A.set(W*V,Y*V).floor()},this.setDrawingBufferSize=function(A,D,H){W=A,Y=D,V=H,e.width=Math.floor(A*H),e.height=Math.floor(D*H),this.setViewport(0,0,A,D)},this.getCurrentViewport=function(A){return A.copy(C)},this.getViewport=function(A){return A.copy(ft)},this.setViewport=function(A,D,H,G){A.isVector4?ft.set(A.x,A.y,A.z,A.w):ft.set(A,D,H,G),Tt.viewport(C.copy(ft).multiplyScalar(V).round())},this.getScissor=function(A){return A.copy(Bt)},this.setScissor=function(A,D,H,G){A.isVector4?Bt.set(A.x,A.y,A.z,A.w):Bt.set(A,D,H,G),Tt.scissor(U.copy(Bt).multiplyScalar(V).round())},this.getScissorTest=function(){return Kt},this.setScissorTest=function(A){Tt.setScissorTest(Kt=A)},this.setOpaqueSort=function(A){it=A},this.setTransparentSort=function(A){Q=A},this.getClearColor=function(A){return A.copy(At.getClearColor())},this.setClearColor=function(){At.setClearColor.apply(At,arguments)},this.getClearAlpha=function(){return At.getClearAlpha()},this.setClearAlpha=function(){At.setClearAlpha.apply(At,arguments)},this.clear=function(A=!0,D=!0,H=!0){let G=0;if(A){let F=!1;if(R!==null){const nt=R.texture.format;F=nt===qc||nt===Xc||nt===$c}if(F){const nt=R.texture.type,ht=nt===ui||nt===es||nt===Uo||nt===$s||nt===Gc||nt===Vc,_t=At.getClearColor(),vt=At.getClearAlpha(),Pt=_t.r,Ut=_t.g,xt=_t.b;ht?(m[0]=Pt,m[1]=Ut,m[2]=xt,m[3]=vt,N.clearBufferuiv(N.COLOR,0,m)):(_[0]=Pt,_[1]=Ut,_[2]=xt,_[3]=vt,N.clearBufferiv(N.COLOR,0,_))}else G|=N.COLOR_BUFFER_BIT}D&&(G|=N.DEPTH_BUFFER_BIT),H&&(G|=N.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),N.clear(G)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",K,!1),e.removeEventListener("webglcontextrestored",dt,!1),e.removeEventListener("webglcontextcreationerror",ct,!1),ut.dispose(),qt.dispose(),wt.dispose(),T.dispose(),k.dispose(),j.dispose(),ce.dispose(),I.dispose(),yt.dispose(),$.dispose(),$.removeEventListener("sessionstart",uh),$.removeEventListener("sessionend",fh),Ui.stop()};function K(A){A.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),w=!0}function dt(){console.log("THREE.WebGLRenderer: Context Restored."),w=!1;const A=fe.autoReset,D=pt.enabled,H=pt.autoUpdate,G=pt.needsUpdate,F=pt.type;rt(),fe.autoReset=A,pt.enabled=D,pt.autoUpdate=H,pt.needsUpdate=G,pt.type=F}function ct(A){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",A.statusMessage)}function Dt(A){const D=A.target;D.removeEventListener("dispose",Dt),xe(D)}function xe(A){ze(A),wt.remove(A)}function ze(A){const D=wt.get(A).programs;D!==void 0&&(D.forEach(function(H){yt.releaseProgram(H)}),A.isShaderMaterial&&yt.releaseShaderCache(A))}this.renderBufferDirect=function(A,D,H,G,F,nt){D===null&&(D=ge);const ht=F.isMesh&&F.matrixWorld.determinant()<0,_t=fp(A,D,H,G,F);Tt.setMaterial(G,ht);let vt=H.index,Pt=1;if(G.wireframe===!0){if(vt=J.getWireframeAttribute(H),vt===void 0)return;Pt=2}const Ut=H.drawRange,xt=H.attributes.position;let jt=Ut.start*Pt,he=(Ut.start+Ut.count)*Pt;nt!==null&&(jt=Math.max(jt,nt.start*Pt),he=Math.min(he,(nt.start+nt.count)*Pt)),vt!==null?(jt=Math.max(jt,0),he=Math.min(he,vt.count)):xt!=null&&(jt=Math.max(jt,0),he=Math.min(he,xt.count));const pe=he-jt;if(pe<0||pe===1/0)return;ce.setup(F,G,_t,H,vt);let Je,te=mt;if(vt!==null&&(Je=Z.get(vt),te=$t,te.setIndex(Je)),F.isMesh)G.wireframe===!0?(Tt.setLineWidth(G.wireframeLinewidth*we()),te.setMode(N.LINES)):te.setMode(N.TRIANGLES);else if(F.isLine){let Mt=G.linewidth;Mt===void 0&&(Mt=1),Tt.setLineWidth(Mt*we()),F.isLineSegments?te.setMode(N.LINES):F.isLineLoop?te.setMode(N.LINE_LOOP):te.setMode(N.LINE_STRIP)}else F.isPoints?te.setMode(N.POINTS):F.isSprite&&te.setMode(N.TRIANGLES);if(F.isBatchedMesh)if(F._multiDrawInstances!==null)te.renderMultiDrawInstances(F._multiDrawStarts,F._multiDrawCounts,F._multiDrawCount,F._multiDrawInstances);else if(Vt.get("WEBGL_multi_draw"))te.renderMultiDraw(F._multiDrawStarts,F._multiDrawCounts,F._multiDrawCount);else{const Mt=F._multiDrawStarts,Zn=F._multiDrawCounts,ee=F._multiDrawCount,Rn=vt?Z.get(vt).bytesPerElement:1,ds=wt.get(G).currentProgram.getUniforms();for(let on=0;on<ee;on++)ds.setValue(N,"_gl_DrawID",on),te.render(Mt[on]/Rn,Zn[on])}else if(F.isInstancedMesh)te.renderInstances(jt,pe,F.count);else if(H.isInstancedBufferGeometry){const Mt=H._maxInstanceCount!==void 0?H._maxInstanceCount:1/0,Zn=Math.min(H.instanceCount,Mt);te.renderInstances(jt,pe,Zn)}else te.render(jt,pe)};function se(A,D,H){A.transparent===!0&&A.side===Re&&A.forceSinglePass===!1?(A.side=Ke,A.needsUpdate=!0,Vo(A,D,H),A.side=Ci,A.needsUpdate=!0,Vo(A,D,H),A.side=Re):Vo(A,D,H)}this.compile=function(A,D,H=null){H===null&&(H=A),f=qt.get(H),f.init(D),y.push(f),H.traverseVisible(function(F){F.isLight&&F.layers.test(D.layers)&&(f.pushLight(F),F.castShadow&&f.pushShadow(F))}),A!==H&&A.traverseVisible(function(F){F.isLight&&F.layers.test(D.layers)&&(f.pushLight(F),F.castShadow&&f.pushShadow(F))}),f.setupLights();const G=new Set;return A.traverse(function(F){if(!(F.isMesh||F.isPoints||F.isLine||F.isSprite))return;const nt=F.material;if(nt)if(Array.isArray(nt))for(let ht=0;ht<nt.length;ht++){const _t=nt[ht];se(_t,H,F),G.add(_t)}else se(nt,H,F),G.add(nt)}),y.pop(),f=null,G},this.compileAsync=function(A,D,H=null){const G=this.compile(A,D,H);return new Promise(F=>{function nt(){if(G.forEach(function(ht){wt.get(ht).currentProgram.isReady()&&G.delete(ht)}),G.size===0){F(A);return}setTimeout(nt,10)}Vt.get("KHR_parallel_shader_compile")!==null?nt():setTimeout(nt,10)})};let An=null;function jn(A){An&&An(A)}function uh(){Ui.stop()}function fh(){Ui.start()}const Ui=new Gu;Ui.setAnimationLoop(jn),typeof self<"u"&&Ui.setContext(self),this.setAnimationLoop=function(A){An=A,$.setAnimationLoop(A),A===null?Ui.stop():Ui.start()},$.addEventListener("sessionstart",uh),$.addEventListener("sessionend",fh),this.render=function(A,D){if(D!==void 0&&D.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(w===!0)return;if(A.matrixWorldAutoUpdate===!0&&A.updateMatrixWorld(),D.parent===null&&D.matrixWorldAutoUpdate===!0&&D.updateMatrixWorld(),$.enabled===!0&&$.isPresenting===!0&&($.cameraAutoUpdate===!0&&$.updateCamera(D),D=$.getCamera()),A.isScene===!0&&A.onBeforeRender(v,A,D,R),f=qt.get(A,y.length),f.init(D),y.push(f),Rt.multiplyMatrices(D.projectionMatrix,D.matrixWorldInverse),q.setFromProjectionMatrix(Rt),gt=this.localClippingEnabled,tt=et.init(this.clippingPlanes,gt),g=ut.get(A,x.length),g.init(),x.push(g),$.enabled===!0&&$.isPresenting===!0){const nt=v.xr.getDepthSensingMesh();nt!==null&&Rr(nt,D,-1/0,v.sortObjects)}Rr(A,D,0,v.sortObjects),g.finish(),v.sortObjects===!0&&g.sort(it,Q),Xt=$.enabled===!1||$.isPresenting===!1||$.hasDepthSensing()===!1,Xt&&At.addToRenderList(g,A),this.info.render.frame++,tt===!0&&et.beginShadows();const H=f.state.shadowsArray;pt.render(H,A,D),tt===!0&&et.endShadows(),this.info.autoReset===!0&&this.info.reset();const G=g.opaque,F=g.transmissive;if(f.setupLights(),D.isArrayCamera){const nt=D.cameras;if(F.length>0)for(let ht=0,_t=nt.length;ht<_t;ht++){const vt=nt[ht];mh(G,F,A,vt)}Xt&&At.render(A);for(let ht=0,_t=nt.length;ht<_t;ht++){const vt=nt[ht];ph(g,A,vt,vt.viewport)}}else F.length>0&&mh(G,F,A,D),Xt&&At.render(A),ph(g,A,D);R!==null&&(P.updateMultisampleRenderTarget(R),P.updateRenderTargetMipmap(R)),A.isScene===!0&&A.onAfterRender(v,A,D),ce.resetDefaultState(),b=-1,M=null,y.pop(),y.length>0?(f=y[y.length-1],tt===!0&&et.setGlobalState(v.clippingPlanes,f.state.camera)):f=null,x.pop(),x.length>0?g=x[x.length-1]:g=null};function Rr(A,D,H,G){if(A.visible===!1)return;if(A.layers.test(D.layers)){if(A.isGroup)H=A.renderOrder;else if(A.isLOD)A.autoUpdate===!0&&A.update(D);else if(A.isLight)f.pushLight(A),A.castShadow&&f.pushShadow(A);else if(A.isSprite){if(!A.frustumCulled||q.intersectsSprite(A)){G&&Ht.setFromMatrixPosition(A.matrixWorld).applyMatrix4(Rt);const ht=j.update(A),_t=A.material;_t.visible&&g.push(A,ht,_t,H,Ht.z,null)}}else if((A.isMesh||A.isLine||A.isPoints)&&(!A.frustumCulled||q.intersectsObject(A))){const ht=j.update(A),_t=A.material;if(G&&(A.boundingSphere!==void 0?(A.boundingSphere===null&&A.computeBoundingSphere(),Ht.copy(A.boundingSphere.center)):(ht.boundingSphere===null&&ht.computeBoundingSphere(),Ht.copy(ht.boundingSphere.center)),Ht.applyMatrix4(A.matrixWorld).applyMatrix4(Rt)),Array.isArray(_t)){const vt=ht.groups;for(let Pt=0,Ut=vt.length;Pt<Ut;Pt++){const xt=vt[Pt],jt=_t[xt.materialIndex];jt&&jt.visible&&g.push(A,ht,jt,H,Ht.z,xt)}}else _t.visible&&g.push(A,ht,_t,H,Ht.z,null)}}const nt=A.children;for(let ht=0,_t=nt.length;ht<_t;ht++)Rr(nt[ht],D,H,G)}function ph(A,D,H,G){const F=A.opaque,nt=A.transmissive,ht=A.transparent;f.setupLightsView(H),tt===!0&&et.setGlobalState(v.clippingPlanes,H),G&&Tt.viewport(C.copy(G)),F.length>0&&Go(F,D,H),nt.length>0&&Go(nt,D,H),ht.length>0&&Go(ht,D,H),Tt.buffers.depth.setTest(!0),Tt.buffers.depth.setMask(!0),Tt.buffers.color.setMask(!0),Tt.setPolygonOffset(!1)}function mh(A,D,H,G){if((H.isScene===!0?H.overrideMaterial:null)!==null)return;f.state.transmissionRenderTarget[G.id]===void 0&&(f.state.transmissionRenderTarget[G.id]=new ns(1,1,{generateMipmaps:!0,type:Vt.has("EXT_color_buffer_half_float")||Vt.has("EXT_color_buffer_float")?zo:ui,minFilter:Ki,samples:4,stencilBuffer:o,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Yt.workingColorSpace}));const nt=f.state.transmissionRenderTarget[G.id],ht=G.viewport||C;nt.setSize(ht.z,ht.w);const _t=v.getRenderTarget();v.setRenderTarget(nt),v.getClearColor(B),X=v.getClearAlpha(),X<1&&v.setClearColor(16777215,.5),v.clear(),Xt&&At.render(H);const vt=v.toneMapping;v.toneMapping=Ti;const Pt=G.viewport;if(G.viewport!==void 0&&(G.viewport=void 0),f.setupLightsView(G),tt===!0&&et.setGlobalState(v.clippingPlanes,G),Go(A,H,G),P.updateMultisampleRenderTarget(nt),P.updateRenderTargetMipmap(nt),Vt.has("WEBGL_multisampled_render_to_texture")===!1){let Ut=!1;for(let xt=0,jt=D.length;xt<jt;xt++){const he=D[xt],pe=he.object,Je=he.geometry,te=he.material,Mt=he.group;if(te.side===Re&&pe.layers.test(G.layers)){const Zn=te.side;te.side=Ke,te.needsUpdate=!0,gh(pe,H,G,Je,te,Mt),te.side=Zn,te.needsUpdate=!0,Ut=!0}}Ut===!0&&(P.updateMultisampleRenderTarget(nt),P.updateRenderTargetMipmap(nt))}v.setRenderTarget(_t),v.setClearColor(B,X),Pt!==void 0&&(G.viewport=Pt),v.toneMapping=vt}function Go(A,D,H){const G=D.isScene===!0?D.overrideMaterial:null;for(let F=0,nt=A.length;F<nt;F++){const ht=A[F],_t=ht.object,vt=ht.geometry,Pt=G===null?ht.material:G,Ut=ht.group;_t.layers.test(H.layers)&&gh(_t,D,H,vt,Pt,Ut)}}function gh(A,D,H,G,F,nt){A.onBeforeRender(v,D,H,G,F,nt),A.modelViewMatrix.multiplyMatrices(H.matrixWorldInverse,A.matrixWorld),A.normalMatrix.getNormalMatrix(A.modelViewMatrix),F.onBeforeRender(v,D,H,G,A,nt),F.transparent===!0&&F.side===Re&&F.forceSinglePass===!1?(F.side=Ke,F.needsUpdate=!0,v.renderBufferDirect(H,D,G,F,A,nt),F.side=Ci,F.needsUpdate=!0,v.renderBufferDirect(H,D,G,F,A,nt),F.side=Re):v.renderBufferDirect(H,D,G,F,A,nt),A.onAfterRender(v,D,H,G,F,nt)}function Vo(A,D,H){D.isScene!==!0&&(D=ge);const G=wt.get(A),F=f.state.lights,nt=f.state.shadowsArray,ht=F.state.version,_t=yt.getParameters(A,F.state,nt,D,H),vt=yt.getProgramCacheKey(_t);let Pt=G.programs;G.environment=A.isMeshStandardMaterial?D.environment:null,G.fog=D.fog,G.envMap=(A.isMeshStandardMaterial?k:T).get(A.envMap||G.environment),G.envMapRotation=G.environment!==null&&A.envMap===null?D.environmentRotation:A.envMapRotation,Pt===void 0&&(A.addEventListener("dispose",Dt),Pt=new Map,G.programs=Pt);let Ut=Pt.get(vt);if(Ut!==void 0){if(G.currentProgram===Ut&&G.lightsStateVersion===ht)return vh(A,_t),Ut}else _t.uniforms=yt.getUniforms(A),A.onBeforeCompile(_t,v),Ut=yt.acquireProgram(_t,vt),Pt.set(vt,Ut),G.uniforms=_t.uniforms;const xt=G.uniforms;return(!A.isShaderMaterial&&!A.isRawShaderMaterial||A.clipping===!0)&&(xt.clippingPlanes=et.uniform),vh(A,_t),G.needsLights=mp(A),G.lightsStateVersion=ht,G.needsLights&&(xt.ambientLightColor.value=F.state.ambient,xt.lightProbe.value=F.state.probe,xt.directionalLights.value=F.state.directional,xt.directionalLightShadows.value=F.state.directionalShadow,xt.spotLights.value=F.state.spot,xt.spotLightShadows.value=F.state.spotShadow,xt.rectAreaLights.value=F.state.rectArea,xt.ltc_1.value=F.state.rectAreaLTC1,xt.ltc_2.value=F.state.rectAreaLTC2,xt.pointLights.value=F.state.point,xt.pointLightShadows.value=F.state.pointShadow,xt.hemisphereLights.value=F.state.hemi,xt.directionalShadowMap.value=F.state.directionalShadowMap,xt.directionalShadowMatrix.value=F.state.directionalShadowMatrix,xt.spotShadowMap.value=F.state.spotShadowMap,xt.spotLightMatrix.value=F.state.spotLightMatrix,xt.spotLightMap.value=F.state.spotLightMap,xt.pointShadowMap.value=F.state.pointShadowMap,xt.pointShadowMatrix.value=F.state.pointShadowMatrix),G.currentProgram=Ut,G.uniformsList=null,Ut}function _h(A){if(A.uniformsList===null){const D=A.currentProgram.getUniforms();A.uniformsList=za.seqWithValue(D.seq,A.uniforms)}return A.uniformsList}function vh(A,D){const H=wt.get(A);H.outputColorSpace=D.outputColorSpace,H.batching=D.batching,H.batchingColor=D.batchingColor,H.instancing=D.instancing,H.instancingColor=D.instancingColor,H.instancingMorph=D.instancingMorph,H.skinning=D.skinning,H.morphTargets=D.morphTargets,H.morphNormals=D.morphNormals,H.morphColors=D.morphColors,H.morphTargetsCount=D.morphTargetsCount,H.numClippingPlanes=D.numClippingPlanes,H.numIntersection=D.numClipIntersection,H.vertexAlphas=D.vertexAlphas,H.vertexTangents=D.vertexTangents,H.toneMapping=D.toneMapping}function fp(A,D,H,G,F){D.isScene!==!0&&(D=ge),P.resetTextureUnits();const nt=D.fog,ht=G.isMeshStandardMaterial?D.environment:null,_t=R===null?v.outputColorSpace:R.isXRRenderTarget===!0?R.texture.colorSpace:to,vt=(G.isMeshStandardMaterial?k:T).get(G.envMap||ht),Pt=G.vertexColors===!0&&!!H.attributes.color&&H.attributes.color.itemSize===4,Ut=!!H.attributes.tangent&&(!!G.normalMap||G.anisotropy>0),xt=!!H.morphAttributes.position,jt=!!H.morphAttributes.normal,he=!!H.morphAttributes.color;let pe=Ti;G.toneMapped&&(R===null||R.isXRRenderTarget===!0)&&(pe=v.toneMapping);const Je=H.morphAttributes.position||H.morphAttributes.normal||H.morphAttributes.color,te=Je!==void 0?Je.length:0,Mt=wt.get(G),Zn=f.state.lights;if(tt===!0&&(gt===!0||A!==M)){const pn=A===M&&G.id===b;et.setState(G,A,pn)}let ee=!1;G.version===Mt.__version?(Mt.needsLights&&Mt.lightsStateVersion!==Zn.state.version||Mt.outputColorSpace!==_t||F.isBatchedMesh&&Mt.batching===!1||!F.isBatchedMesh&&Mt.batching===!0||F.isBatchedMesh&&Mt.batchingColor===!0&&F.colorTexture===null||F.isBatchedMesh&&Mt.batchingColor===!1&&F.colorTexture!==null||F.isInstancedMesh&&Mt.instancing===!1||!F.isInstancedMesh&&Mt.instancing===!0||F.isSkinnedMesh&&Mt.skinning===!1||!F.isSkinnedMesh&&Mt.skinning===!0||F.isInstancedMesh&&Mt.instancingColor===!0&&F.instanceColor===null||F.isInstancedMesh&&Mt.instancingColor===!1&&F.instanceColor!==null||F.isInstancedMesh&&Mt.instancingMorph===!0&&F.morphTexture===null||F.isInstancedMesh&&Mt.instancingMorph===!1&&F.morphTexture!==null||Mt.envMap!==vt||G.fog===!0&&Mt.fog!==nt||Mt.numClippingPlanes!==void 0&&(Mt.numClippingPlanes!==et.numPlanes||Mt.numIntersection!==et.numIntersection)||Mt.vertexAlphas!==Pt||Mt.vertexTangents!==Ut||Mt.morphTargets!==xt||Mt.morphNormals!==jt||Mt.morphColors!==he||Mt.toneMapping!==pe||Mt.morphTargetsCount!==te)&&(ee=!0):(ee=!0,Mt.__version=G.version);let Rn=Mt.currentProgram;ee===!0&&(Rn=Vo(G,D,F));let ds=!1,on=!1,io=!1;const me=Rn.getUniforms(),kn=Mt.uniforms;if(Tt.useProgram(Rn.program)&&(ds=!0,on=!0,io=!0),G.id!==b&&(b=G.id,on=!0),ds||M!==A){Tt.buffers.depth.getReversed()?(at.copy(A.projectionMatrix),am(at),rm(at),me.setValue(N,"projectionMatrix",at)):me.setValue(N,"projectionMatrix",A.projectionMatrix),me.setValue(N,"viewMatrix",A.matrixWorldInverse);const pi=me.map.cameraPosition;pi!==void 0&&pi.setValue(N,It.setFromMatrixPosition(A.matrixWorld)),Wt.logarithmicDepthBuffer&&me.setValue(N,"logDepthBufFC",2/(Math.log(A.far+1)/Math.LN2)),(G.isMeshPhongMaterial||G.isMeshToonMaterial||G.isMeshLambertMaterial||G.isMeshBasicMaterial||G.isMeshStandardMaterial||G.isShaderMaterial)&&me.setValue(N,"isOrthographic",A.isOrthographicCamera===!0),M!==A&&(M=A,on=!0,io=!0)}if(F.isSkinnedMesh){me.setOptional(N,F,"bindMatrix"),me.setOptional(N,F,"bindMatrixInverse");const pn=F.skeleton;pn&&(pn.boneTexture===null&&pn.computeBoneTexture(),me.setValue(N,"boneTexture",pn.boneTexture,P))}F.isBatchedMesh&&(me.setOptional(N,F,"batchingTexture"),me.setValue(N,"batchingTexture",F._matricesTexture,P),me.setOptional(N,F,"batchingIdTexture"),me.setValue(N,"batchingIdTexture",F._indirectTexture,P),me.setOptional(N,F,"batchingColorTexture"),F._colorsTexture!==null&&me.setValue(N,"batchingColorTexture",F._colorsTexture,P));const so=H.morphAttributes;if((so.position!==void 0||so.normal!==void 0||so.color!==void 0)&&Ct.update(F,H,Rn),(on||Mt.receiveShadow!==F.receiveShadow)&&(Mt.receiveShadow=F.receiveShadow,me.setValue(N,"receiveShadow",F.receiveShadow)),G.isMeshGouraudMaterial&&G.envMap!==null&&(kn.envMap.value=vt,kn.flipEnvMap.value=vt.isCubeTexture&&vt.isRenderTargetTexture===!1?-1:1),G.isMeshStandardMaterial&&G.envMap===null&&D.environment!==null&&(kn.envMapIntensity.value=D.environmentIntensity),on&&(me.setValue(N,"toneMappingExposure",v.toneMappingExposure),Mt.needsLights&&pp(kn,io),nt&&G.fog===!0&&lt.refreshFogUniforms(kn,nt),lt.refreshMaterialUniforms(kn,G,V,Y,f.state.transmissionRenderTarget[A.id]),za.upload(N,_h(Mt),kn,P)),G.isShaderMaterial&&G.uniformsNeedUpdate===!0&&(za.upload(N,_h(Mt),kn,P),G.uniformsNeedUpdate=!1),G.isSpriteMaterial&&me.setValue(N,"center",F.center),me.setValue(N,"modelViewMatrix",F.modelViewMatrix),me.setValue(N,"normalMatrix",F.normalMatrix),me.setValue(N,"modelMatrix",F.matrixWorld),G.isShaderMaterial||G.isRawShaderMaterial){const pn=G.uniformsGroups;for(let pi=0,mi=pn.length;pi<mi;pi++){const xh=pn[pi];I.update(xh,Rn),I.bind(xh,Rn)}}return Rn}function pp(A,D){A.ambientLightColor.needsUpdate=D,A.lightProbe.needsUpdate=D,A.directionalLights.needsUpdate=D,A.directionalLightShadows.needsUpdate=D,A.pointLights.needsUpdate=D,A.pointLightShadows.needsUpdate=D,A.spotLights.needsUpdate=D,A.spotLightShadows.needsUpdate=D,A.rectAreaLights.needsUpdate=D,A.hemisphereLights.needsUpdate=D}function mp(A){return A.isMeshLambertMaterial||A.isMeshToonMaterial||A.isMeshPhongMaterial||A.isMeshStandardMaterial||A.isShadowMaterial||A.isShaderMaterial&&A.lights===!0}this.getActiveCubeFace=function(){return E},this.getActiveMipmapLevel=function(){return S},this.getRenderTarget=function(){return R},this.setRenderTargetTextures=function(A,D,H){wt.get(A.texture).__webglTexture=D,wt.get(A.depthTexture).__webglTexture=H;const G=wt.get(A);G.__hasExternalTextures=!0,G.__autoAllocateDepthBuffer=H===void 0,G.__autoAllocateDepthBuffer||Vt.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),G.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(A,D){const H=wt.get(A);H.__webglFramebuffer=D,H.__useDefaultFramebuffer=D===void 0},this.setRenderTarget=function(A,D=0,H=0){R=A,E=D,S=H;let G=!0,F=null,nt=!1,ht=!1;if(A){const vt=wt.get(A);if(vt.__useDefaultFramebuffer!==void 0)Tt.bindFramebuffer(N.FRAMEBUFFER,null),G=!1;else if(vt.__webglFramebuffer===void 0)P.setupRenderTarget(A);else if(vt.__hasExternalTextures)P.rebindTextures(A,wt.get(A.texture).__webglTexture,wt.get(A.depthTexture).__webglTexture);else if(A.depthBuffer){const xt=A.depthTexture;if(vt.__boundDepthTexture!==xt){if(xt!==null&&wt.has(xt)&&(A.width!==xt.image.width||A.height!==xt.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");P.setupDepthRenderbuffer(A)}}const Pt=A.texture;(Pt.isData3DTexture||Pt.isDataArrayTexture||Pt.isCompressedArrayTexture)&&(ht=!0);const Ut=wt.get(A).__webglFramebuffer;A.isWebGLCubeRenderTarget?(Array.isArray(Ut[D])?F=Ut[D][H]:F=Ut[D],nt=!0):A.samples>0&&P.useMultisampledRTT(A)===!1?F=wt.get(A).__webglMultisampledFramebuffer:Array.isArray(Ut)?F=Ut[H]:F=Ut,C.copy(A.viewport),U.copy(A.scissor),O=A.scissorTest}else C.copy(ft).multiplyScalar(V).floor(),U.copy(Bt).multiplyScalar(V).floor(),O=Kt;if(Tt.bindFramebuffer(N.FRAMEBUFFER,F)&&G&&Tt.drawBuffers(A,F),Tt.viewport(C),Tt.scissor(U),Tt.setScissorTest(O),nt){const vt=wt.get(A.texture);N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_CUBE_MAP_POSITIVE_X+D,vt.__webglTexture,H)}else if(ht){const vt=wt.get(A.texture),Pt=D||0;N.framebufferTextureLayer(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,vt.__webglTexture,H||0,Pt)}b=-1},this.readRenderTargetPixels=function(A,D,H,G,F,nt,ht){if(!(A&&A.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let _t=wt.get(A).__webglFramebuffer;if(A.isWebGLCubeRenderTarget&&ht!==void 0&&(_t=_t[ht]),_t){Tt.bindFramebuffer(N.FRAMEBUFFER,_t);try{const vt=A.texture,Pt=vt.format,Ut=vt.type;if(!Wt.textureFormatReadable(Pt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Wt.textureTypeReadable(Ut)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}D>=0&&D<=A.width-G&&H>=0&&H<=A.height-F&&N.readPixels(D,H,G,F,kt.convert(Pt),kt.convert(Ut),nt)}finally{const vt=R!==null?wt.get(R).__webglFramebuffer:null;Tt.bindFramebuffer(N.FRAMEBUFFER,vt)}}},this.readRenderTargetPixelsAsync=async function(A,D,H,G,F,nt,ht){if(!(A&&A.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let _t=wt.get(A).__webglFramebuffer;if(A.isWebGLCubeRenderTarget&&ht!==void 0&&(_t=_t[ht]),_t){const vt=A.texture,Pt=vt.format,Ut=vt.type;if(!Wt.textureFormatReadable(Pt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Wt.textureTypeReadable(Ut))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(D>=0&&D<=A.width-G&&H>=0&&H<=A.height-F){Tt.bindFramebuffer(N.FRAMEBUFFER,_t);const xt=N.createBuffer();N.bindBuffer(N.PIXEL_PACK_BUFFER,xt),N.bufferData(N.PIXEL_PACK_BUFFER,nt.byteLength,N.STREAM_READ),N.readPixels(D,H,G,F,kt.convert(Pt),kt.convert(Ut),0);const jt=R!==null?wt.get(R).__webglFramebuffer:null;Tt.bindFramebuffer(N.FRAMEBUFFER,jt);const he=N.fenceSync(N.SYNC_GPU_COMMANDS_COMPLETE,0);return N.flush(),await om(N,he,4),N.bindBuffer(N.PIXEL_PACK_BUFFER,xt),N.getBufferSubData(N.PIXEL_PACK_BUFFER,0,nt),N.deleteBuffer(xt),N.deleteSync(he),nt}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(A,D=null,H=0){A.isTexture!==!0&&(yo("WebGLRenderer: copyFramebufferToTexture function signature has changed."),D=arguments[0]||null,A=arguments[1]);const G=Math.pow(2,-H),F=Math.floor(A.image.width*G),nt=Math.floor(A.image.height*G),ht=D!==null?D.x:0,_t=D!==null?D.y:0;P.setTexture2D(A,0),N.copyTexSubImage2D(N.TEXTURE_2D,H,0,0,ht,_t,F,nt),Tt.unbindTexture()},this.copyTextureToTexture=function(A,D,H=null,G=null,F=0){A.isTexture!==!0&&(yo("WebGLRenderer: copyTextureToTexture function signature has changed."),G=arguments[0]||null,A=arguments[1],D=arguments[2],F=arguments[3]||0,H=null);let nt,ht,_t,vt,Pt,Ut,xt,jt,he;const pe=A.isCompressedTexture?A.mipmaps[F]:A.image;H!==null?(nt=H.max.x-H.min.x,ht=H.max.y-H.min.y,_t=H.isBox3?H.max.z-H.min.z:1,vt=H.min.x,Pt=H.min.y,Ut=H.isBox3?H.min.z:0):(nt=pe.width,ht=pe.height,_t=pe.depth||1,vt=0,Pt=0,Ut=0),G!==null?(xt=G.x,jt=G.y,he=G.z):(xt=0,jt=0,he=0);const Je=kt.convert(D.format),te=kt.convert(D.type);let Mt;D.isData3DTexture?(P.setTexture3D(D,0),Mt=N.TEXTURE_3D):D.isDataArrayTexture||D.isCompressedArrayTexture?(P.setTexture2DArray(D,0),Mt=N.TEXTURE_2D_ARRAY):(P.setTexture2D(D,0),Mt=N.TEXTURE_2D),N.pixelStorei(N.UNPACK_FLIP_Y_WEBGL,D.flipY),N.pixelStorei(N.UNPACK_PREMULTIPLY_ALPHA_WEBGL,D.premultiplyAlpha),N.pixelStorei(N.UNPACK_ALIGNMENT,D.unpackAlignment);const Zn=N.getParameter(N.UNPACK_ROW_LENGTH),ee=N.getParameter(N.UNPACK_IMAGE_HEIGHT),Rn=N.getParameter(N.UNPACK_SKIP_PIXELS),ds=N.getParameter(N.UNPACK_SKIP_ROWS),on=N.getParameter(N.UNPACK_SKIP_IMAGES);N.pixelStorei(N.UNPACK_ROW_LENGTH,pe.width),N.pixelStorei(N.UNPACK_IMAGE_HEIGHT,pe.height),N.pixelStorei(N.UNPACK_SKIP_PIXELS,vt),N.pixelStorei(N.UNPACK_SKIP_ROWS,Pt),N.pixelStorei(N.UNPACK_SKIP_IMAGES,Ut);const io=A.isDataArrayTexture||A.isData3DTexture,me=D.isDataArrayTexture||D.isData3DTexture;if(A.isRenderTargetTexture||A.isDepthTexture){const kn=wt.get(A),so=wt.get(D),pn=wt.get(kn.__renderTarget),pi=wt.get(so.__renderTarget);Tt.bindFramebuffer(N.READ_FRAMEBUFFER,pn.__webglFramebuffer),Tt.bindFramebuffer(N.DRAW_FRAMEBUFFER,pi.__webglFramebuffer);for(let mi=0;mi<_t;mi++)io&&N.framebufferTextureLayer(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,wt.get(A).__webglTexture,F,Ut+mi),A.isDepthTexture?(me&&N.framebufferTextureLayer(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,wt.get(D).__webglTexture,F,he+mi),N.blitFramebuffer(vt,Pt,nt,ht,xt,jt,nt,ht,N.DEPTH_BUFFER_BIT,N.NEAREST)):me?N.copyTexSubImage3D(Mt,F,xt,jt,he+mi,vt,Pt,nt,ht):N.copyTexSubImage2D(Mt,F,xt,jt,he+mi,vt,Pt,nt,ht);Tt.bindFramebuffer(N.READ_FRAMEBUFFER,null),Tt.bindFramebuffer(N.DRAW_FRAMEBUFFER,null)}else me?A.isDataTexture||A.isData3DTexture?N.texSubImage3D(Mt,F,xt,jt,he,nt,ht,_t,Je,te,pe.data):D.isCompressedArrayTexture?N.compressedTexSubImage3D(Mt,F,xt,jt,he,nt,ht,_t,Je,pe.data):N.texSubImage3D(Mt,F,xt,jt,he,nt,ht,_t,Je,te,pe):A.isDataTexture?N.texSubImage2D(N.TEXTURE_2D,F,xt,jt,nt,ht,Je,te,pe.data):A.isCompressedTexture?N.compressedTexSubImage2D(N.TEXTURE_2D,F,xt,jt,pe.width,pe.height,Je,pe.data):N.texSubImage2D(N.TEXTURE_2D,F,xt,jt,nt,ht,Je,te,pe);N.pixelStorei(N.UNPACK_ROW_LENGTH,Zn),N.pixelStorei(N.UNPACK_IMAGE_HEIGHT,ee),N.pixelStorei(N.UNPACK_SKIP_PIXELS,Rn),N.pixelStorei(N.UNPACK_SKIP_ROWS,ds),N.pixelStorei(N.UNPACK_SKIP_IMAGES,on),F===0&&D.generateMipmaps&&N.generateMipmap(Mt),Tt.unbindTexture()},this.copyTextureToTexture3D=function(A,D,H=null,G=null,F=0){return A.isTexture!==!0&&(yo("WebGLRenderer: copyTextureToTexture3D function signature has changed."),H=arguments[0]||null,G=arguments[1]||null,A=arguments[2],D=arguments[3],F=arguments[4]||0),yo('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(A,D,H,G,F)},this.initRenderTarget=function(A){wt.get(A).__webglFramebuffer===void 0&&P.setupRenderTarget(A)},this.initTexture=function(A){A.isCubeTexture?P.setTextureCube(A,0):A.isData3DTexture?P.setTexture3D(A,0):A.isDataArrayTexture||A.isCompressedArrayTexture?P.setTexture2DArray(A,0):P.setTexture2D(A,0),Tt.unbindTexture()},this.resetState=function(){E=0,S=0,R=null,Tt.reset(),ce.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return ri}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;const e=this.getContext();e.drawingBufferColorspace=Yt._getDrawingBufferColorSpace(t),e.unpackColorSpace=Yt._getUnpackColorSpace()}}class Kc{constructor(t,e=1,n=1e3){this.isFog=!0,this.name="",this.color=new Ot(t),this.near=e,this.far=n}clone(){return new Kc(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}}class gx extends Se{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Xn,this.environmentIntensity=1,this.environmentRotation=new Xn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){const e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(e.object.environmentIntensity=this.environmentIntensity),e.object.environmentRotation=this.environmentRotation.toArray(),e}}class _x extends We{constructor(t=null,e=1,n=1,s,o,a,r,l,c=un,h=un,d,u){super(null,a,r,l,c,h,s,o,d,u),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class xd extends Me{constructor(t,e,n,s=1){super(t,e,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){const t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}}const Ts=new Qt,yd=new Qt,da=[],Md=new Di,vx=new Qt,ho=new st,uo=new cs;class ju extends st{constructor(t,e,n){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new xd(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,vx)}computeBoundingBox(){const t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new Di),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,Ts),Md.copy(t.boundingBox).applyMatrix4(Ts),this.boundingBox.union(Md)}computeBoundingSphere(){const t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new cs),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,Ts),uo.copy(t.boundingSphere).applyMatrix4(Ts),this.boundingSphere.union(uo)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){const n=e.morphTargetInfluences,s=this.morphTexture.source.data.data,o=n.length+1,a=t*o+1;for(let r=0;r<n.length;r++)n[r]=s[a+r]}raycast(t,e){const n=this.matrixWorld,s=this.count;if(ho.geometry=this.geometry,ho.material=this.material,ho.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),uo.copy(this.boundingSphere),uo.applyMatrix4(n),t.ray.intersectsSphere(uo)!==!1))for(let o=0;o<s;o++){this.getMatrixAt(o,Ts),yd.multiplyMatrices(n,Ts),ho.matrixWorld=yd,ho.raycast(t,da);for(let a=0,r=da.length;a<r;a++){const l=da[a];l.instanceId=o,l.object=this,e.push(l)}da.length=0}}setColorAt(t,e){this.instanceColor===null&&(this.instanceColor=new xd(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3)}setMatrixAt(t,e){e.toArray(this.instanceMatrix.array,t*16)}setMorphAt(t,e){const n=e.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new _x(new Float32Array(s*this.count),s,this.count,Wc,$n));const o=this.morphTexture.source.data.data;let a=0;for(let c=0;c<n.length;c++)a+=n[c];const r=this.geometry.morphTargetsRelative?1:1-a,l=s*t;o[l]=r,o.set(n,l+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}}class Ve extends hs{static get type(){return"LineBasicMaterial"}constructor(t){super(),this.isLineBasicMaterial=!0,this.color=new Ot(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}}const Ka=new L,Ja=new L,bd=new Qt,fo=new Ho,ua=new cs,sl=new L,Sd=new L;class ai extends Se{constructor(t=new Jt,e=new Ve){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,n=[0];for(let s=1,o=e.count;s<o;s++)Ka.fromBufferAttribute(e,s-1),Ja.fromBufferAttribute(e,s),n[s]=n[s-1],n[s]+=Ka.distanceTo(Ja);t.setAttribute("lineDistance",new Zt(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(t,e){const n=this.geometry,s=this.matrixWorld,o=t.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),ua.copy(n.boundingSphere),ua.applyMatrix4(s),ua.radius+=o,t.ray.intersectsSphere(ua)===!1)return;bd.copy(s).invert(),fo.copy(t.ray).applyMatrix4(bd);const r=o/((this.scale.x+this.scale.y+this.scale.z)/3),l=r*r,c=this.isLineSegments?2:1,h=n.index,u=n.attributes.position;if(h!==null){const p=Math.max(0,a.start),m=Math.min(h.count,a.start+a.count);for(let _=p,g=m-1;_<g;_+=c){const f=h.getX(_),x=h.getX(_+1),y=fa(this,t,fo,l,f,x);y&&e.push(y)}if(this.isLineLoop){const _=h.getX(m-1),g=h.getX(p),f=fa(this,t,fo,l,_,g);f&&e.push(f)}}else{const p=Math.max(0,a.start),m=Math.min(u.count,a.start+a.count);for(let _=p,g=m-1;_<g;_+=c){const f=fa(this,t,fo,l,_,_+1);f&&e.push(f)}if(this.isLineLoop){const _=fa(this,t,fo,l,m-1,p);_&&e.push(_)}}}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let o=0,a=s.length;o<a;o++){const r=s[o].name||String(o);this.morphTargetInfluences.push(0),this.morphTargetDictionary[r]=o}}}}}function fa(i,t,e,n,s,o){const a=i.geometry.attributes.position;if(Ka.fromBufferAttribute(a,s),Ja.fromBufferAttribute(a,o),e.distanceSqToSegment(Ka,Ja,sl,Sd)>n)return;sl.applyMatrix4(i.matrixWorld);const l=t.ray.origin.distanceTo(sl);if(!(l<t.near||l>t.far))return{distance:l,point:Sd.clone().applyMatrix4(i.matrixWorld),index:s,face:null,faceIndex:null,barycoord:null,object:i}}const wd=new L,Ed=new L;class is extends ai{constructor(t,e){super(t,e),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,n=[];for(let s=0,o=e.count;s<o;s+=2)wd.fromBufferAttribute(e,s),Ed.fromBufferAttribute(e,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+wd.distanceTo(Ed);t.setAttribute("lineDistance",new Zt(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class Zu extends ai{constructor(t,e){super(t,e),this.isLineLoop=!0,this.type="LineLoop"}}class Jc extends hs{static get type(){return"PointsMaterial"}constructor(t){super(),this.isPointsMaterial=!0,this.color=new Ot(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}}const Td=new Qt,rc=new Ho,pa=new cs,ma=new L;class Ku extends Se{constructor(t=new Jt,e=new Jc){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}raycast(t,e){const n=this.geometry,s=this.matrixWorld,o=t.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),pa.copy(n.boundingSphere),pa.applyMatrix4(s),pa.radius+=o,t.ray.intersectsSphere(pa)===!1)return;Td.copy(s).invert(),rc.copy(t.ray).applyMatrix4(Td);const r=o/((this.scale.x+this.scale.y+this.scale.z)/3),l=r*r,c=n.index,d=n.attributes.position;if(c!==null){const u=Math.max(0,a.start),p=Math.min(c.count,a.start+a.count);for(let m=u,_=p;m<_;m++){const g=c.getX(m);ma.fromBufferAttribute(d,g),Ad(ma,g,l,s,t,e,this)}}else{const u=Math.max(0,a.start),p=Math.min(d.count,a.start+a.count);for(let m=u,_=p;m<_;m++)ma.fromBufferAttribute(d,m),Ad(ma,m,l,s,t,e,this)}}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let o=0,a=s.length;o<a;o++){const r=s[o].name||String(o);this.morphTargetInfluences.push(0),this.morphTargetDictionary[r]=o}}}}}function Ad(i,t,e,n,s,o,a){const r=rc.distanceSqToPoint(i);if(r<e){const l=new L;rc.closestPointToPoint(i,l),l.applyMatrix4(n);const c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;o.push({distance:c,distanceToRay:Math.sqrt(r),point:l,index:t,face:null,faceIndex:null,barycoord:null,object:a})}}class xx extends We{constructor(t,e,n,s,o,a,r,l,c){super(t,e,n,s,o,a,r,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}class no extends Jt{constructor(t=1,e=32,n=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:t,segments:e,thetaStart:n,thetaLength:s},e=Math.max(3,e);const o=[],a=[],r=[],l=[],c=new L,h=new Et;a.push(0,0,0),r.push(0,0,1),l.push(.5,.5);for(let d=0,u=3;d<=e;d++,u+=3){const p=n+d/e*s;c.x=t*Math.cos(p),c.y=t*Math.sin(p),a.push(c.x,c.y,c.z),r.push(0,0,1),h.x=(a[u]/t+1)/2,h.y=(a[u+1]/t+1)/2,l.push(h.x,h.y)}for(let d=1;d<=e;d++)o.push(d,d+1,0);this.setIndex(o),this.setAttribute("position",new Zt(a,3)),this.setAttribute("normal",new Zt(r,3)),this.setAttribute("uv",new Zt(l,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new no(t.radius,t.segments,t.thetaStart,t.thetaLength)}}class ve extends Jt{constructor(t=1,e=1,n=1,s=32,o=1,a=!1,r=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:n,radialSegments:s,heightSegments:o,openEnded:a,thetaStart:r,thetaLength:l};const c=this;s=Math.floor(s),o=Math.floor(o);const h=[],d=[],u=[],p=[];let m=0;const _=[],g=n/2;let f=0;x(),a===!1&&(t>0&&y(!0),e>0&&y(!1)),this.setIndex(h),this.setAttribute("position",new Zt(d,3)),this.setAttribute("normal",new Zt(u,3)),this.setAttribute("uv",new Zt(p,2));function x(){const v=new L,w=new L;let E=0;const S=(e-t)/n;for(let R=0;R<=o;R++){const b=[],M=R/o,C=M*(e-t)+t;for(let U=0;U<=s;U++){const O=U/s,B=O*l+r,X=Math.sin(B),W=Math.cos(B);w.x=C*X,w.y=-M*n+g,w.z=C*W,d.push(w.x,w.y,w.z),v.set(X,S,W).normalize(),u.push(v.x,v.y,v.z),p.push(O,1-M),b.push(m++)}_.push(b)}for(let R=0;R<s;R++)for(let b=0;b<o;b++){const M=_[b][R],C=_[b+1][R],U=_[b+1][R+1],O=_[b][R+1];(t>0||b!==0)&&(h.push(M,C,O),E+=3),(e>0||b!==o-1)&&(h.push(C,U,O),E+=3)}c.addGroup(f,E,0),f+=E}function y(v){const w=m,E=new Et,S=new L;let R=0;const b=v===!0?t:e,M=v===!0?1:-1;for(let U=1;U<=s;U++)d.push(0,g*M,0),u.push(0,M,0),p.push(.5,.5),m++;const C=m;for(let U=0;U<=s;U++){const B=U/s*l+r,X=Math.cos(B),W=Math.sin(B);S.x=b*W,S.y=g*M,S.z=b*X,d.push(S.x,S.y,S.z),u.push(0,M,0),E.x=X*.5+.5,E.y=W*.5*M+.5,p.push(E.x,E.y),m++}for(let U=0;U<s;U++){const O=w+U,B=C+U;v===!0?h.push(B,B+1,O):h.push(B+1,B,O),R+=3}c.addGroup(f,R,v===!0?1:2),f+=R}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new ve(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class Qa extends ve{constructor(t=1,e=1,n=32,s=1,o=!1,a=0,r=Math.PI*2){super(0,t,e,n,s,o,a,r),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:n,heightSegments:s,openEnded:o,thetaStart:a,thetaLength:r}}static fromJSON(t){return new Qa(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class Qc extends Jt{constructor(t=[],e=[],n=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:n,detail:s};const o=[],a=[];r(s),c(n),h(),this.setAttribute("position",new Zt(o,3)),this.setAttribute("normal",new Zt(o.slice(),3)),this.setAttribute("uv",new Zt(a,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function r(x){const y=new L,v=new L,w=new L;for(let E=0;E<e.length;E+=3)p(e[E+0],y),p(e[E+1],v),p(e[E+2],w),l(y,v,w,x)}function l(x,y,v,w){const E=w+1,S=[];for(let R=0;R<=E;R++){S[R]=[];const b=x.clone().lerp(v,R/E),M=y.clone().lerp(v,R/E),C=E-R;for(let U=0;U<=C;U++)U===0&&R===E?S[R][U]=b:S[R][U]=b.clone().lerp(M,U/C)}for(let R=0;R<E;R++)for(let b=0;b<2*(E-R)-1;b++){const M=Math.floor(b/2);b%2===0?(u(S[R][M+1]),u(S[R+1][M]),u(S[R][M])):(u(S[R][M+1]),u(S[R+1][M+1]),u(S[R+1][M]))}}function c(x){const y=new L;for(let v=0;v<o.length;v+=3)y.x=o[v+0],y.y=o[v+1],y.z=o[v+2],y.normalize().multiplyScalar(x),o[v+0]=y.x,o[v+1]=y.y,o[v+2]=y.z}function h(){const x=new L;for(let y=0;y<o.length;y+=3){x.x=o[y+0],x.y=o[y+1],x.z=o[y+2];const v=g(x)/2/Math.PI+.5,w=f(x)/Math.PI+.5;a.push(v,1-w)}m(),d()}function d(){for(let x=0;x<a.length;x+=6){const y=a[x+0],v=a[x+2],w=a[x+4],E=Math.max(y,v,w),S=Math.min(y,v,w);E>.9&&S<.1&&(y<.2&&(a[x+0]+=1),v<.2&&(a[x+2]+=1),w<.2&&(a[x+4]+=1))}}function u(x){o.push(x.x,x.y,x.z)}function p(x,y){const v=x*3;y.x=t[v+0],y.y=t[v+1],y.z=t[v+2]}function m(){const x=new L,y=new L,v=new L,w=new L,E=new Et,S=new Et,R=new Et;for(let b=0,M=0;b<o.length;b+=9,M+=6){x.set(o[b+0],o[b+1],o[b+2]),y.set(o[b+3],o[b+4],o[b+5]),v.set(o[b+6],o[b+7],o[b+8]),E.set(a[M+0],a[M+1]),S.set(a[M+2],a[M+3]),R.set(a[M+4],a[M+5]),w.copy(x).add(y).add(v).divideScalar(3);const C=g(w);_(E,M+0,x,C),_(S,M+2,y,C),_(R,M+4,v,C)}}function _(x,y,v,w){w<0&&x.x===1&&(a[y]=x.x-1),v.x===0&&v.z===0&&(a[y]=w/2/Math.PI+.5)}function g(x){return Math.atan2(x.z,-x.x)}function f(x){return Math.atan2(-x.y,Math.sqrt(x.x*x.x+x.z*x.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Qc(t.vertices,t.indices,t.radius,t.details)}}const ga=new L,_a=new L,ol=new L,va=new Sn;class lc extends Jt{constructor(t=null,e=1){if(super(),this.type="EdgesGeometry",this.parameters={geometry:t,thresholdAngle:e},t!==null){const s=Math.pow(10,4),o=Math.cos(Ro*e),a=t.getIndex(),r=t.getAttribute("position"),l=a?a.count:r.count,c=[0,0,0],h=["a","b","c"],d=new Array(3),u={},p=[];for(let m=0;m<l;m+=3){a?(c[0]=a.getX(m),c[1]=a.getX(m+1),c[2]=a.getX(m+2)):(c[0]=m,c[1]=m+1,c[2]=m+2);const{a:_,b:g,c:f}=va;if(_.fromBufferAttribute(r,c[0]),g.fromBufferAttribute(r,c[1]),f.fromBufferAttribute(r,c[2]),va.getNormal(ol),d[0]=`${Math.round(_.x*s)},${Math.round(_.y*s)},${Math.round(_.z*s)}`,d[1]=`${Math.round(g.x*s)},${Math.round(g.y*s)},${Math.round(g.z*s)}`,d[2]=`${Math.round(f.x*s)},${Math.round(f.y*s)},${Math.round(f.z*s)}`,!(d[0]===d[1]||d[1]===d[2]||d[2]===d[0]))for(let x=0;x<3;x++){const y=(x+1)%3,v=d[x],w=d[y],E=va[h[x]],S=va[h[y]],R=`${v}_${w}`,b=`${w}_${v}`;b in u&&u[b]?(ol.dot(u[b].normal)<=o&&(p.push(E.x,E.y,E.z),p.push(S.x,S.y,S.z)),u[b]=null):R in u||(u[R]={index0:c[x],index1:c[y],normal:ol.clone()})}}for(const m in u)if(u[m]){const{index0:_,index1:g}=u[m];ga.fromBufferAttribute(r,_),_a.fromBufferAttribute(r,g),p.push(ga.x,ga.y,ga.z),p.push(_a.x,_a.y,_a.z)}this.setAttribute("position",new Zt(p,3))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}}class th extends Qc{constructor(t=1,e=0){const n=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],s=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(n,s,t,e),this.type="OctahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new th(t.radius,t.detail)}}class Ai extends Jt{constructor(t=.5,e=1,n=32,s=1,o=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:t,outerRadius:e,thetaSegments:n,phiSegments:s,thetaStart:o,thetaLength:a},n=Math.max(3,n),s=Math.max(1,s);const r=[],l=[],c=[],h=[];let d=t;const u=(e-t)/s,p=new L,m=new Et;for(let _=0;_<=s;_++){for(let g=0;g<=n;g++){const f=o+g/n*a;p.x=d*Math.cos(f),p.y=d*Math.sin(f),l.push(p.x,p.y,p.z),c.push(0,0,1),m.x=(p.x/e+1)/2,m.y=(p.y/e+1)/2,h.push(m.x,m.y)}d+=u}for(let _=0;_<s;_++){const g=_*(n+1);for(let f=0;f<n;f++){const x=f+g,y=x,v=x+n+1,w=x+n+2,E=x+1;r.push(y,v,E),r.push(v,w,E)}}this.setIndex(r),this.setAttribute("position",new Zt(l,3)),this.setAttribute("normal",new Zt(c,3)),this.setAttribute("uv",new Zt(h,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Ai(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}}class ss extends Jt{constructor(t=1,e=32,n=16,s=0,o=Math.PI*2,a=0,r=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:s,phiLength:o,thetaStart:a,thetaLength:r},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));const l=Math.min(a+r,Math.PI);let c=0;const h=[],d=new L,u=new L,p=[],m=[],_=[],g=[];for(let f=0;f<=n;f++){const x=[],y=f/n;let v=0;f===0&&a===0?v=.5/e:f===n&&l===Math.PI&&(v=-.5/e);for(let w=0;w<=e;w++){const E=w/e;d.x=-t*Math.cos(s+E*o)*Math.sin(a+y*r),d.y=t*Math.cos(a+y*r),d.z=t*Math.sin(s+E*o)*Math.sin(a+y*r),m.push(d.x,d.y,d.z),u.copy(d).normalize(),_.push(u.x,u.y,u.z),g.push(E+v,1-y),x.push(c++)}h.push(x)}for(let f=0;f<n;f++)for(let x=0;x<e;x++){const y=h[f][x+1],v=h[f][x],w=h[f+1][x],E=h[f+1][x+1];(f!==0||a>0)&&p.push(y,v,E),(f!==n-1||l<Math.PI)&&p.push(v,w,E)}this.setIndex(p),this.setAttribute("position",new Zt(m,3)),this.setAttribute("normal",new Zt(_,3)),this.setAttribute("uv",new Zt(g,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new ss(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}}class dr extends Jt{constructor(t=1,e=.4,n=12,s=48,o=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:n,tubularSegments:s,arc:o},n=Math.floor(n),s=Math.floor(s);const a=[],r=[],l=[],c=[],h=new L,d=new L,u=new L;for(let p=0;p<=n;p++)for(let m=0;m<=s;m++){const _=m/s*o,g=p/n*Math.PI*2;d.x=(t+e*Math.cos(g))*Math.cos(_),d.y=(t+e*Math.cos(g))*Math.sin(_),d.z=e*Math.sin(g),r.push(d.x,d.y,d.z),h.x=t*Math.cos(_),h.y=t*Math.sin(_),u.subVectors(d,h).normalize(),l.push(u.x,u.y,u.z),c.push(m/s),c.push(p/n)}for(let p=1;p<=n;p++)for(let m=1;m<=s;m++){const _=(s+1)*p+m-1,g=(s+1)*(p-1)+m-1,f=(s+1)*(p-1)+m,x=(s+1)*p+m;a.push(_,g,x),a.push(g,f,x)}this.setIndex(a),this.setAttribute("position",new Zt(r,3)),this.setAttribute("normal",new Zt(l,3)),this.setAttribute("uv",new Zt(c,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new dr(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc)}}class Lt extends hs{static get type(){return"MeshStandardMaterial"}constructor(t){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.color=new Ot(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ot(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Pu,this.normalScale=new Et(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Xn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}class Ju extends Ve{static get type(){return"LineDashedMaterial"}constructor(t){super(),this.isLineDashedMaterial=!0,this.scale=1,this.dashSize=3,this.gapSize=1,this.setValues(t)}copy(t){return super.copy(t),this.scale=t.scale,this.dashSize=t.dashSize,this.gapSize=t.gapSize,this}}class Qu extends Se{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new Ot(t),this.intensity=e}dispose(){}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){const e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,this.groundColor!==void 0&&(e.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(e.object.distance=this.distance),this.angle!==void 0&&(e.object.angle=this.angle),this.decay!==void 0&&(e.object.decay=this.decay),this.penumbra!==void 0&&(e.object.penumbra=this.penumbra),this.shadow!==void 0&&(e.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(e.object.target=this.target.uuid),e}}class yx extends Qu{constructor(t,e,n){super(t,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Se.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ot(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}}const al=new Qt,Rd=new L,Cd=new L;class Mx{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Et(512,512),this.map=null,this.mapPass=null,this.matrix=new Qt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new jc,this._frameExtents=new Et(1,1),this._viewportCount=1,this._viewports=[new be(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(t){const e=this.camera,n=this.matrix;Rd.setFromMatrixPosition(t.matrixWorld),e.position.copy(Rd),Cd.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(Cd),e.updateMatrixWorld(),al.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),this._frustum.setFromProjectionMatrix(al),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(al)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.mapSize.copy(t.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const t={};return this.intensity!==1&&(t.intensity=this.intensity),this.bias!==0&&(t.bias=this.bias),this.normalBias!==0&&(t.normalBias=this.normalBias),this.radius!==1&&(t.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(t.mapSize=this.mapSize.toArray()),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}}class bx extends Mx{constructor(){super(new Vu(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class Sx extends Qu{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Se.DEFAULT_UP),this.updateMatrix(),this.target=new Se,this.shadow=new bx}dispose(){this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}}const Pd=new Qt;class tf{constructor(t,e,n=0,s=1/0){this.ray=new Ho(t,e),this.near=n,this.far=s,this.camera=null,this.layers=new Yc,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,e){this.ray.set(t,e)}setFromCamera(t,e){e.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(t.x,t.y,.5).unproject(e).sub(this.ray.origin).normalize(),this.camera=e):e.isOrthographicCamera?(this.ray.origin.set(t.x,t.y,(e.near+e.far)/(e.near-e.far)).unproject(e),this.ray.direction.set(0,0,-1).transformDirection(e.matrixWorld),this.camera=e):console.error("THREE.Raycaster: Unsupported camera type: "+e.type)}setFromXRController(t){return Pd.identity().extractRotation(t.matrixWorld),this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Pd),this}intersectObject(t,e=!0,n=[]){return cc(t,this,n,e),n.sort(Ld),n}intersectObjects(t,e=!0,n=[]){for(let s=0,o=t.length;s<o;s++)cc(t[s],this,n,e);return n.sort(Ld),n}}function Ld(i,t){return i.distance-t.distance}function cc(i,t,e,n){let s=!0;if(i.layers.test(t.layers)&&i.raycast(t,e)===!1&&(s=!1),s===!0&&n===!0){const o=i.children;for(let a=0,r=o.length;a<r;a++)cc(o[a],t,e,!0)}}class Id{constructor(t=1,e=0,n=0){return this.radius=t,this.phi=e,this.theta=n,this}set(t,e,n){return this.radius=t,this.phi=e,this.theta=n,this}copy(t){return this.radius=t.radius,this.phi=t.phi,this.theta=t.theta,this}makeSafe(){return this.phi=Math.max(1e-6,Math.min(Math.PI-1e-6,this.phi)),this}setFromVector3(t){return this.setFromCartesianCoords(t.x,t.y,t.z)}setFromCartesianCoords(t,e,n){return this.radius=Math.sqrt(t*t+e*e+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(t,n),this.phi=Math.acos(je(e/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}}class wx extends is{constructor(t=10,e=10,n=4473924,s=8947848){n=new Ot(n),s=new Ot(s);const o=e/2,a=t/e,r=t/2,l=[],c=[];for(let u=0,p=0,m=-r;u<=e;u++,m+=a){l.push(-r,0,m,r,0,m),l.push(m,0,-r,m,0,r);const _=u===o?n:s;_.toArray(c,p),p+=3,_.toArray(c,p),p+=3,_.toArray(c,p),p+=3,_.toArray(c,p),p+=3}const h=new Jt;h.setAttribute("position",new Zt(l,3)),h.setAttribute("color",new Zt(c,3));const d=new Ve({vertexColors:!0,toneMapped:!1});super(h,d),this.type="GridHelper"}dispose(){this.geometry.dispose(),this.material.dispose()}}const xa=new Di;class Ex extends is{constructor(t,e=16776960){const n=new Uint16Array([0,1,1,2,2,3,3,0,4,5,5,6,6,7,7,4,0,4,1,5,2,6,3,7]),s=new Float32Array(24),o=new Jt;o.setIndex(new Me(n,1)),o.setAttribute("position",new Me(s,3)),super(o,new Ve({color:e,toneMapped:!1})),this.object=t,this.type="BoxHelper",this.matrixAutoUpdate=!1,this.update()}update(t){if(t!==void 0&&console.warn("THREE.BoxHelper: .update() has no longer arguments."),this.object!==void 0&&xa.setFromObject(this.object),xa.isEmpty())return;const e=xa.min,n=xa.max,s=this.geometry.attributes.position,o=s.array;o[0]=n.x,o[1]=n.y,o[2]=n.z,o[3]=e.x,o[4]=n.y,o[5]=n.z,o[6]=e.x,o[7]=e.y,o[8]=n.z,o[9]=n.x,o[10]=e.y,o[11]=n.z,o[12]=n.x,o[13]=n.y,o[14]=e.z,o[15]=e.x,o[16]=n.y,o[17]=e.z,o[18]=e.x,o[19]=e.y,o[20]=e.z,o[21]=n.x,o[22]=e.y,o[23]=e.z,s.needsUpdate=!0,this.geometry.computeBoundingSphere()}setFromObject(t){return this.object=t,this.update(),this}copy(t,e){return super.copy(t,e),this.object=t.object,this}dispose(){this.geometry.dispose(),this.material.dispose()}}class Tx extends is{constructor(t=1){const e=[0,0,0,t,0,0,0,0,0,0,t,0,0,0,0,0,0,t],n=[1,0,0,1,.6,0,0,1,0,.6,1,0,0,0,1,0,.6,1],s=new Jt;s.setAttribute("position",new Zt(e,3)),s.setAttribute("color",new Zt(n,3));const o=new Ve({vertexColors:!0,toneMapped:!1});super(s,o),this.type="AxesHelper"}setColors(t,e,n){const s=new Ot,o=this.geometry.attributes.color.array;return s.set(t),s.toArray(o,0),s.toArray(o,3),s.set(e),s.toArray(o,6),s.toArray(o,9),s.set(n),s.toArray(o,12),s.toArray(o,15),this.geometry.attributes.color.needsUpdate=!0,this}dispose(){this.geometry.dispose(),this.material.dispose()}}class Ax extends ls{constructor(t,e=null){super(),this.object=t,this.domElement=e,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(){}disconnect(){}dispose(){}update(){}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Bc}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Bc);const Dd={type:"change"},eh={type:"start"},ef={type:"end"},ya=new Ho,Ud=new Gn,Rx=Math.cos(70*im.DEG2RAD),Ie=new L,tn=2*Math.PI,re={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},rl=1e-6;class Cx extends Ax{constructor(t,e=null){super(t,e),this.state=re.NONE,this.enabled=!0,this.target=new L,this.cursor=new L,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:Us.ROTATE,MIDDLE:Us.DOLLY,RIGHT:Us.PAN},this.touches={ONE:Ls.ROTATE,TWO:Ls.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._domElementKeyEvents=null,this._lastPosition=new L,this._lastQuaternion=new Pi,this._lastTargetPosition=new L,this._quat=new Pi().setFromUnitVectors(t.up,new L(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new Id,this._sphericalDelta=new Id,this._scale=1,this._panOffset=new L,this._rotateStart=new Et,this._rotateEnd=new Et,this._rotateDelta=new Et,this._panStart=new Et,this._panEnd=new Et,this._panDelta=new Et,this._dollyStart=new Et,this._dollyEnd=new Et,this._dollyDelta=new Et,this._dollyDirection=new L,this._mouse=new Et,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=Lx.bind(this),this._onPointerDown=Px.bind(this),this._onPointerUp=Ix.bind(this),this._onContextMenu=zx.bind(this),this._onMouseWheel=Fx.bind(this),this._onKeyDown=Nx.bind(this),this._onTouchStart=Ox.bind(this),this._onTouchMove=kx.bind(this),this._onMouseDown=Dx.bind(this),this._onMouseMove=Ux.bind(this),this._interceptControlDown=Bx.bind(this),this._interceptControlUp=Hx.bind(this),this.domElement!==null&&this.connect(),this.update()}connect(){this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(t){t.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=t}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(Dd),this.update(),this.state=re.NONE}update(t=null){const e=this.object.position;Ie.copy(e).sub(this.target),Ie.applyQuaternion(this._quat),this._spherical.setFromVector3(Ie),this.autoRotate&&this.state===re.NONE&&this._rotateLeft(this._getAutoRotationAngle(t)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let n=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(n)&&isFinite(s)&&(n<-Math.PI?n+=tn:n>Math.PI&&(n-=tn),s<-Math.PI?s+=tn:s>Math.PI&&(s-=tn),n<=s?this._spherical.theta=Math.max(n,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(n+s)/2?Math.max(n,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let o=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{const a=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),o=a!=this._spherical.radius}if(Ie.setFromSpherical(this._spherical),Ie.applyQuaternion(this._quatInverse),e.copy(this.target).add(Ie),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let a=null;if(this.object.isPerspectiveCamera){const r=Ie.length();a=this._clampDistance(r*this._scale);const l=r-a;this.object.position.addScaledVector(this._dollyDirection,l),this.object.updateMatrixWorld(),o=!!l}else if(this.object.isOrthographicCamera){const r=new L(this._mouse.x,this._mouse.y,0);r.unproject(this.object);const l=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),o=l!==this.object.zoom;const c=new L(this._mouse.x,this._mouse.y,0);c.unproject(this.object),this.object.position.sub(c).add(r),this.object.updateMatrixWorld(),a=Ie.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;a!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(a).add(this.object.position):(ya.origin.copy(this.object.position),ya.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(ya.direction))<Rx?this.object.lookAt(this.target):(Ud.setFromNormalAndCoplanarPoint(this.object.up,this.target),ya.intersectPlane(Ud,this.target))))}else if(this.object.isOrthographicCamera){const a=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),a!==this.object.zoom&&(this.object.updateProjectionMatrix(),o=!0)}return this._scale=1,this._performCursorZoom=!1,o||this._lastPosition.distanceToSquared(this.object.position)>rl||8*(1-this._lastQuaternion.dot(this.object.quaternion))>rl||this._lastTargetPosition.distanceToSquared(this.target)>rl?(this.dispatchEvent(Dd),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(t){return t!==null?tn/60*this.autoRotateSpeed*t:tn/60/60*this.autoRotateSpeed}_getZoomScale(t){const e=Math.abs(t*.01);return Math.pow(.95,this.zoomSpeed*e)}_rotateLeft(t){this._sphericalDelta.theta-=t}_rotateUp(t){this._sphericalDelta.phi-=t}_panLeft(t,e){Ie.setFromMatrixColumn(e,0),Ie.multiplyScalar(-t),this._panOffset.add(Ie)}_panUp(t,e){this.screenSpacePanning===!0?Ie.setFromMatrixColumn(e,1):(Ie.setFromMatrixColumn(e,0),Ie.crossVectors(this.object.up,Ie)),Ie.multiplyScalar(t),this._panOffset.add(Ie)}_pan(t,e){const n=this.domElement;if(this.object.isPerspectiveCamera){const s=this.object.position;Ie.copy(s).sub(this.target);let o=Ie.length();o*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*t*o/n.clientHeight,this.object.matrix),this._panUp(2*e*o/n.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(t*(this.object.right-this.object.left)/this.object.zoom/n.clientWidth,this.object.matrix),this._panUp(e*(this.object.top-this.object.bottom)/this.object.zoom/n.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(t,e){if(!this.zoomToCursor)return;this._performCursorZoom=!0;const n=this.domElement.getBoundingClientRect(),s=t-n.left,o=e-n.top,a=n.width,r=n.height;this._mouse.x=s/a*2-1,this._mouse.y=-(o/r)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(t){return Math.max(this.minDistance,Math.min(this.maxDistance,t))}_handleMouseDownRotate(t){this._rotateStart.set(t.clientX,t.clientY)}_handleMouseDownDolly(t){this._updateZoomParameters(t.clientX,t.clientX),this._dollyStart.set(t.clientX,t.clientY)}_handleMouseDownPan(t){this._panStart.set(t.clientX,t.clientY)}_handleMouseMoveRotate(t){this._rotateEnd.set(t.clientX,t.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const e=this.domElement;this._rotateLeft(tn*this._rotateDelta.x/e.clientHeight),this._rotateUp(tn*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(t){this._dollyEnd.set(t.clientX,t.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(t){this._panEnd.set(t.clientX,t.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(t){this._updateZoomParameters(t.clientX,t.clientY),t.deltaY<0?this._dollyIn(this._getZoomScale(t.deltaY)):t.deltaY>0&&this._dollyOut(this._getZoomScale(t.deltaY)),this.update()}_handleKeyDown(t){let e=!1;switch(t.code){case this.keys.UP:t.ctrlKey||t.metaKey||t.shiftKey?this._rotateUp(tn*this.rotateSpeed/this.domElement.clientHeight):this._pan(0,this.keyPanSpeed),e=!0;break;case this.keys.BOTTOM:t.ctrlKey||t.metaKey||t.shiftKey?this._rotateUp(-tn*this.rotateSpeed/this.domElement.clientHeight):this._pan(0,-this.keyPanSpeed),e=!0;break;case this.keys.LEFT:t.ctrlKey||t.metaKey||t.shiftKey?this._rotateLeft(tn*this.rotateSpeed/this.domElement.clientHeight):this._pan(this.keyPanSpeed,0),e=!0;break;case this.keys.RIGHT:t.ctrlKey||t.metaKey||t.shiftKey?this._rotateLeft(-tn*this.rotateSpeed/this.domElement.clientHeight):this._pan(-this.keyPanSpeed,0),e=!0;break}e&&(t.preventDefault(),this.update())}_handleTouchStartRotate(t){if(this._pointers.length===1)this._rotateStart.set(t.pageX,t.pageY);else{const e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._rotateStart.set(n,s)}}_handleTouchStartPan(t){if(this._pointers.length===1)this._panStart.set(t.pageX,t.pageY);else{const e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._panStart.set(n,s)}}_handleTouchStartDolly(t){const e=this._getSecondPointerPosition(t),n=t.pageX-e.x,s=t.pageY-e.y,o=Math.sqrt(n*n+s*s);this._dollyStart.set(0,o)}_handleTouchStartDollyPan(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enablePan&&this._handleTouchStartPan(t)}_handleTouchStartDollyRotate(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enableRotate&&this._handleTouchStartRotate(t)}_handleTouchMoveRotate(t){if(this._pointers.length==1)this._rotateEnd.set(t.pageX,t.pageY);else{const n=this._getSecondPointerPosition(t),s=.5*(t.pageX+n.x),o=.5*(t.pageY+n.y);this._rotateEnd.set(s,o)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const e=this.domElement;this._rotateLeft(tn*this._rotateDelta.x/e.clientHeight),this._rotateUp(tn*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(t){if(this._pointers.length===1)this._panEnd.set(t.pageX,t.pageY);else{const e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._panEnd.set(n,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(t){const e=this._getSecondPointerPosition(t),n=t.pageX-e.x,s=t.pageY-e.y,o=Math.sqrt(n*n+s*s);this._dollyEnd.set(0,o),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);const a=(t.pageX+e.x)*.5,r=(t.pageY+e.y)*.5;this._updateZoomParameters(a,r)}_handleTouchMoveDollyPan(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enablePan&&this._handleTouchMovePan(t)}_handleTouchMoveDollyRotate(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enableRotate&&this._handleTouchMoveRotate(t)}_addPointer(t){this._pointers.push(t.pointerId)}_removePointer(t){delete this._pointerPositions[t.pointerId];for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId){this._pointers.splice(e,1);return}}_isTrackingPointer(t){for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId)return!0;return!1}_trackPointer(t){let e=this._pointerPositions[t.pointerId];e===void 0&&(e=new Et,this._pointerPositions[t.pointerId]=e),e.set(t.pageX,t.pageY)}_getSecondPointerPosition(t){const e=t.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[e]}_customWheelEvent(t){const e=t.deltaMode,n={clientX:t.clientX,clientY:t.clientY,deltaY:t.deltaY};switch(e){case 1:n.deltaY*=16;break;case 2:n.deltaY*=100;break}return t.ctrlKey&&!this._controlActive&&(n.deltaY*=10),n}}function Px(i){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(i.pointerId),this.domElement.addEventListener("pointermove",this._onPointerMove),this.domElement.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(i)&&(this._addPointer(i),i.pointerType==="touch"?this._onTouchStart(i):this._onMouseDown(i)))}function Lx(i){this.enabled!==!1&&(i.pointerType==="touch"?this._onTouchMove(i):this._onMouseMove(i))}function Ix(i){switch(this._removePointer(i),this._pointers.length){case 0:this.domElement.releasePointerCapture(i.pointerId),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(ef),this.state=re.NONE;break;case 1:const t=this._pointers[0],e=this._pointerPositions[t];this._onTouchStart({pointerId:t,pageX:e.x,pageY:e.y});break}}function Dx(i){let t;switch(i.button){case 0:t=this.mouseButtons.LEFT;break;case 1:t=this.mouseButtons.MIDDLE;break;case 2:t=this.mouseButtons.RIGHT;break;default:t=-1}switch(t){case Us.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(i),this.state=re.DOLLY;break;case Us.ROTATE:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=re.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=re.ROTATE}break;case Us.PAN:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=re.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=re.PAN}break;default:this.state=re.NONE}this.state!==re.NONE&&this.dispatchEvent(eh)}function Ux(i){switch(this.state){case re.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(i);break;case re.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(i);break;case re.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(i);break}}function Fx(i){this.enabled===!1||this.enableZoom===!1||this.state!==re.NONE||(i.preventDefault(),this.dispatchEvent(eh),this._handleMouseWheel(this._customWheelEvent(i)),this.dispatchEvent(ef))}function Nx(i){this.enabled===!1||this.enablePan===!1||this._handleKeyDown(i)}function Ox(i){switch(this._trackPointer(i),this._pointers.length){case 1:switch(this.touches.ONE){case Ls.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(i),this.state=re.TOUCH_ROTATE;break;case Ls.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(i),this.state=re.TOUCH_PAN;break;default:this.state=re.NONE}break;case 2:switch(this.touches.TWO){case Ls.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(i),this.state=re.TOUCH_DOLLY_PAN;break;case Ls.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(i),this.state=re.TOUCH_DOLLY_ROTATE;break;default:this.state=re.NONE}break;default:this.state=re.NONE}this.state!==re.NONE&&this.dispatchEvent(eh)}function kx(i){switch(this._trackPointer(i),this.state){case re.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(i),this.update();break;case re.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(i),this.update();break;case re.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(i),this.update();break;case re.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(i),this.update();break;default:this.state=re.NONE}}function zx(i){this.enabled!==!1&&i.preventDefault()}function Bx(i){i.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function Hx(i){i.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}class ur extends st{constructor(){const t=ur.SkyShader,e=new fi({name:t.name,uniforms:zu.clone(t.uniforms),vertexShader:t.vertexShader,fragmentShader:t.fragmentShader,side:Ke,depthWrite:!1});super(new ie(1,1,1),e),this.isSky=!0}}ur.SkyShader={name:"SkyShader",uniforms:{turbidity:{value:2},rayleigh:{value:1},mieCoefficient:{value:.005},mieDirectionalG:{value:.8},sunPosition:{value:new L},up:{value:new L(0,1,0)}},vertexShader:`
		uniform vec3 sunPosition;
		uniform float rayleigh;
		uniform float turbidity;
		uniform float mieCoefficient;
		uniform vec3 up;

		varying vec3 vWorldPosition;
		varying vec3 vSunDirection;
		varying float vSunfade;
		varying vec3 vBetaR;
		varying vec3 vBetaM;
		varying float vSunE;

		// constants for atmospheric scattering
		const float e = 2.71828182845904523536028747135266249775724709369995957;
		const float pi = 3.141592653589793238462643383279502884197169;

		// wavelength of used primaries, according to preetham
		const vec3 lambda = vec3( 680E-9, 550E-9, 450E-9 );
		// this pre-calcuation replaces older TotalRayleigh(vec3 lambda) function:
		// (8.0 * pow(pi, 3.0) * pow(pow(n, 2.0) - 1.0, 2.0) * (6.0 + 3.0 * pn)) / (3.0 * N * pow(lambda, vec3(4.0)) * (6.0 - 7.0 * pn))
		const vec3 totalRayleigh = vec3( 5.804542996261093E-6, 1.3562911419845635E-5, 3.0265902468824876E-5 );

		// mie stuff
		// K coefficient for the primaries
		const float v = 4.0;
		const vec3 K = vec3( 0.686, 0.678, 0.666 );
		// MieConst = pi * pow( ( 2.0 * pi ) / lambda, vec3( v - 2.0 ) ) * K
		const vec3 MieConst = vec3( 1.8399918514433978E14, 2.7798023919660528E14, 4.0790479543861094E14 );

		// earth shadow hack
		// cutoffAngle = pi / 1.95;
		const float cutoffAngle = 1.6110731556870734;
		const float steepness = 1.5;
		const float EE = 1000.0;

		float sunIntensity( float zenithAngleCos ) {
			zenithAngleCos = clamp( zenithAngleCos, -1.0, 1.0 );
			return EE * max( 0.0, 1.0 - pow( e, -( ( cutoffAngle - acos( zenithAngleCos ) ) / steepness ) ) );
		}

		vec3 totalMie( float T ) {
			float c = ( 0.2 * T ) * 10E-18;
			return 0.434 * c * MieConst;
		}

		void main() {

			vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
			vWorldPosition = worldPosition.xyz;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			gl_Position.z = gl_Position.w; // set z to camera.far

			vSunDirection = normalize( sunPosition );

			vSunE = sunIntensity( dot( vSunDirection, up ) );

			vSunfade = 1.0 - clamp( 1.0 - exp( ( sunPosition.y / 450000.0 ) ), 0.0, 1.0 );

			float rayleighCoefficient = rayleigh - ( 1.0 * ( 1.0 - vSunfade ) );

			// extinction (absorbtion + out scattering)
			// rayleigh coefficients
			vBetaR = totalRayleigh * rayleighCoefficient;

			// mie coefficients
			vBetaM = totalMie( turbidity ) * mieCoefficient;

		}`,fragmentShader:`
		varying vec3 vWorldPosition;
		varying vec3 vSunDirection;
		varying float vSunfade;
		varying vec3 vBetaR;
		varying vec3 vBetaM;
		varying float vSunE;

		uniform float mieDirectionalG;
		uniform vec3 up;

		// constants for atmospheric scattering
		const float pi = 3.141592653589793238462643383279502884197169;

		const float n = 1.0003; // refractive index of air
		const float N = 2.545E25; // number of molecules per unit volume for air at 288.15K and 1013mb (sea level -45 celsius)

		// optical length at zenith for molecules
		const float rayleighZenithLength = 8.4E3;
		const float mieZenithLength = 1.25E3;
		// 66 arc seconds -> degrees, and the cosine of that
		const float sunAngularDiameterCos = 0.999956676946448443553574619906976478926848692873900859324;

		// 3.0 / ( 16.0 * pi )
		const float THREE_OVER_SIXTEENPI = 0.05968310365946075;
		// 1.0 / ( 4.0 * pi )
		const float ONE_OVER_FOURPI = 0.07957747154594767;

		float rayleighPhase( float cosTheta ) {
			return THREE_OVER_SIXTEENPI * ( 1.0 + pow( cosTheta, 2.0 ) );
		}

		float hgPhase( float cosTheta, float g ) {
			float g2 = pow( g, 2.0 );
			float inverse = 1.0 / pow( 1.0 - 2.0 * g * cosTheta + g2, 1.5 );
			return ONE_OVER_FOURPI * ( ( 1.0 - g2 ) * inverse );
		}

		void main() {

			vec3 direction = normalize( vWorldPosition - cameraPosition );

			// optical length
			// cutoff angle at 90 to avoid singularity in next formula.
			float zenithAngle = acos( max( 0.0, dot( up, direction ) ) );
			float inverse = 1.0 / ( cos( zenithAngle ) + 0.15 * pow( 93.885 - ( ( zenithAngle * 180.0 ) / pi ), -1.253 ) );
			float sR = rayleighZenithLength * inverse;
			float sM = mieZenithLength * inverse;

			// combined extinction factor
			vec3 Fex = exp( -( vBetaR * sR + vBetaM * sM ) );

			// in scattering
			float cosTheta = dot( direction, vSunDirection );

			float rPhase = rayleighPhase( cosTheta * 0.5 + 0.5 );
			vec3 betaRTheta = vBetaR * rPhase;

			float mPhase = hgPhase( cosTheta, mieDirectionalG );
			vec3 betaMTheta = vBetaM * mPhase;

			vec3 Lin = pow( vSunE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * ( 1.0 - Fex ), vec3( 1.5 ) );
			Lin *= mix( vec3( 1.0 ), pow( vSunE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * Fex, vec3( 1.0 / 2.0 ) ), clamp( pow( 1.0 - dot( up, vSunDirection ), 5.0 ), 0.0, 1.0 ) );

			// nightsky
			float theta = acos( direction.y ); // elevation --> y-axis, [-pi/2, pi/2]
			float phi = atan( direction.z, direction.x ); // azimuth --> x-axis [-pi/2, pi/2]
			vec2 uv = vec2( phi, theta ) / vec2( 2.0 * pi, pi ) + vec2( 0.5, 0.0 );
			vec3 L0 = vec3( 0.1 ) * Fex;

			// composition + solar disc
			float sundisk = smoothstep( sunAngularDiameterCos, sunAngularDiameterCos + 0.00002, cosTheta );
			L0 += ( vSunE * 19000.0 * Fex ) * sundisk;

			vec3 texColor = ( Lin + L0 ) * 0.04 + vec3( 0.0, 0.0003, 0.00075 );

			vec3 retColor = pow( texColor, vec3( 1.0 / ( 1.2 + ( 1.2 * vSunfade ) ) ) );

			gl_FragColor = vec4( retColor, 1.0 );

			#include <tonemapping_fragment>
			#include <colorspace_fragment>

		}`};function Gx(i,t=!1){const e=i[0].index!==null,n=new Set(Object.keys(i[0].attributes)),s=new Set(Object.keys(i[0].morphAttributes)),o={},a={},r=i[0].morphTargetsRelative,l=new Jt;let c=0;for(let h=0;h<i.length;++h){const d=i[h];let u=0;if(e!==(d.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(const p in d.attributes){if(!n.has(p))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+'. All geometries must have compatible attributes; make sure "'+p+'" attribute exists among all geometries, or in none of them.'),null;o[p]===void 0&&(o[p]=[]),o[p].push(d.attributes[p]),u++}if(u!==n.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". Make sure all geometries have the same number of attributes."),null;if(r!==d.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(const p in d.morphAttributes){if(!s.has(p))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+".  .morphAttributes must be consistent throughout all geometries."),null;a[p]===void 0&&(a[p]=[]),a[p].push(d.morphAttributes[p])}if(t){let p;if(e)p=d.index.count;else if(d.attributes.position!==void 0)p=d.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,p,h),c+=p}}if(e){let h=0;const d=[];for(let u=0;u<i.length;++u){const p=i[u].index;for(let m=0;m<p.count;++m)d.push(p.getX(m)+h);h+=i[u].attributes.position.count}l.setIndex(d)}for(const h in o){const d=Fd(o[h]);if(!d)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" attribute."),null;l.setAttribute(h,d)}for(const h in a){const d=a[h][0].length;if(d===0)break;l.morphAttributes=l.morphAttributes||{},l.morphAttributes[h]=[];for(let u=0;u<d;++u){const p=[];for(let _=0;_<a[h].length;++_)p.push(a[h][_][u]);const m=Fd(p);if(!m)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" morphAttribute."),null;l.morphAttributes[h].push(m)}}return l}function Fd(i){let t,e,n,s=-1,o=0;for(let c=0;c<i.length;++c){const h=i[c];if(t===void 0&&(t=h.array.constructor),t!==h.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(e===void 0&&(e=h.itemSize),e!==h.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(n===void 0&&(n=h.normalized),n!==h.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(s===-1&&(s=h.gpuType),s!==h.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;o+=h.count*e}const a=new t(o),r=new Me(a,e,n);let l=0;for(let c=0;c<i.length;++c){const h=i[c];if(h.isInterleavedBufferAttribute){const d=l/e;for(let u=0,p=h.count;u<p;u++)for(let m=0;m<e;m++){const _=h.getComponent(u,m);r.setComponent(u+d,m,_)}}else a.set(h.array,l);l+=h.count*e}return s!==void 0&&(r.gpuType=s),r}const nf=new L(0,1,0);function fr(i){let t=i>>>0;return()=>{t|=0,t=t+1831565813|0;let e=Math.imul(t^t>>>15,1|t);return e=e+Math.imul(e^e>>>7,61|e)^e,((e^e>>>14)>>>0)/4294967296}}function Qi(i,t,e){const n=t instanceof L?t:new L(...t),s=e instanceof L?e:new L(...e),o=s.clone().sub(n),a=Math.max(o.length(),.01);i.scale.set(1,a,1),i.position.copy(n.clone().add(s).multiplyScalar(.5)),i.quaternion.setFromUnitVectors(nf,o.normalize())}function ts(i,t=.035){const e=new st(new ve(t,t,1,5,1,!0),i);return e.castShadow=!0,e}function Ma(i,t,e,n){const s=new L(...t),o=new L(...e),a=o.clone().sub(s),r=a.length();if(r<1e-6)return;const l=new ve(n,n,1,5,1,!0),c=new Qt().compose(s.add(o).multiplyScalar(.5),new Pi().setFromUnitVectors(nf,a.normalize()),new L(1,r,1));l.applyMatrix4(c),i.push(l)}function Vx({length:i,width:t,height:e=t,bays:n=Math.max(2,Math.round(i/1.8)),chordRadius:s=.055,laceRadius:o=.03,section:a="square"}){const r=[],l=t/2,c=e/2,h=a==="triangle"?[[c,0],[-c,-l],[-c,l]]:[[c,-l],[c,l],[-c,-l],[-c,l]];for(const[p,m]of h)Ma(r,[0,p,m],[i,p,m],s);const d=a==="triangle"?[[0,1],[0,2],[1,2]]:[[0,1],[2,3],[0,2],[1,3]],u=i/n;for(let p=0;p<n;p++){const m=p*u,_=m+u;for(const[g,f]of d){const x=h[g],y=h[f];p%2===0?Ma(r,[m,x[0],x[1]],[_,y[0],y[1]],o):Ma(r,[m,y[0],y[1]],[_,x[0],x[1]],o),Ma(r,[_,x[0],x[1]],[_,y[0],y[1]],o)}}return Gx(r)}function Co(i,t){const e=new st(Vx(i),t);return e.castShadow=!0,e}function sf({blockMat:i,hookMat:t}){const e=new Nt,n=new st(new ie(.55,.75,.28),i);n.position.y=-.42,n.castShadow=!0,e.add(n);for(const a of[-.09,.09]){const r=new st(new ve(.16,.16,.06,12),t);r.rotation.x=Math.PI/2,r.position.set(0,-.12,a),e.add(r)}const s=new st(new ve(.05,.05,.25,6),t);s.position.y=-.85,e.add(s);const o=new st(new dr(.24,.075,8,16,Math.PI*1.5),t);return o.position.y=-1.08,o.rotation.z=Math.PI*.75,o.castShadow=!0,e.add(o),e}function Ba(i=1){const t=fr(i),e=new Lt({color:t()>.5?15759384:14272808,roughness:.8,emissive:3349504}),n=new Lt({color:3818576,roughness:.9}),s=new Lt({color:13146234,roughness:.7}),o=new Lt({color:t()>.5?15921902:15255590,roughness:.35}),a=new Nt,r=new st(new ie(.34,.8,.22),n);r.position.y=.4,a.add(r);const l=new st(new ie(.44,.6,.26),e);l.position.y=1.1,l.castShadow=!0,a.add(l);const c=new st(new ss(.13,8,8),s);c.position.y=1.55,a.add(c);const h=new st(new ss(.15,8,6,0,Math.PI*2,0,Math.PI*.55),o);return h.position.y=1.58,a.add(h),a.rotation.y=t()*Math.PI*2,a}function of(i=2,t=.012){const e=new Nt;return[[i,.08],[i*.68,.1],[i*.42,.12]].forEach(([s,o],a)=>{const r=new st(new no(s,24),new Oe({color:0,transparent:!0,opacity:o,depthWrite:!1}));r.rotation.x=-Math.PI/2,r.position.y=t+a*.004,e.add(r)}),e}const po=new L(.55,.72,.42).normalize();var ke,af,rf,hc,lf,cf,hf,df;class Wx{constructor(t){Le(this,ke);this.container=t,this.renderer=new mx({antialias:!0}),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2)),this.renderer.setSize(t.clientWidth,t.clientHeight),this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=_u,this.renderer.toneMapping=xu,this.renderer.toneMappingExposure=.85,t.appendChild(this.renderer.domElement),this.scene=new gx,this.scene.fog=new Kc(12372950,150,520),this.camera=new yn(55,t.clientWidth/t.clientHeight,.1,2500),this.camera.position.set(35,25,35),this.controls=new Cx(this.camera,this.renderer.domElement),this.controls.target.set(0,8,0),this.controls.enableDamping=!0,this.controls.dampingFactor=.08,this.controls.maxPolarAngle=Math.PI*.495,this.controls.minDistance=5,this.controls.maxDistance=400,this.siteEnv=null,z(this,ke,af).call(this),z(this,ke,rf).call(this),z(this,ke,cf).call(this),window.addEventListener("resize",()=>z(this,ke,df).call(this))}toggleGrid(){return this.devHelpers.visible=!this.devHelpers.visible,this.devHelpers.visible}applySite(t,e=[]){this.siteEnv&&(this.scene.remove(this.siteEnv),this.siteEnv=null);const n=t.site;let s,o,a,r;if(n)s=n.minX??-(n.width??120)/2,o=s+(n.width??120),a=n.minZ??-(n.depth??120)/2,r=a+(n.depth??120);else if(e.length){const d=e.map(p=>p[0]),u=e.map(p=>p.length===3?p[2]:p[1]);s=Math.min(...d)-15,o=Math.max(...d)+15,a=Math.min(...u)-15,r=Math.max(...u)+15}else s=-60,o=60,a=-60,r=60;const l=(s+o)/2,c=(a+r)/2,h=Math.max(80,o-s,r-a);z(this,ke,hc).call(this,l,c,h),this.scene.fog.near=Math.max(150,h*1.3),this.scene.fog.far=Math.max(520,h*3.4),n&&(this.siteEnv=new Nt,z(this,ke,hf).call(this,s,o,a,r),this.scene.add(this.siteEnv))}render(){this.controls.update(),this.renderer.render(this.scene,this.camera)}framePoints(t=[]){if(!t.length)return;const e=t.map(d=>d[0]),n=t.map(d=>d.length===3?d[2]:d[1]),s=Math.min(...e),o=Math.max(...e),a=Math.min(...n),r=Math.max(...n),l=(s+o)/2,c=(a+r)/2,h=Math.max(30,o-s,r-a);this.controls.target.set(l,Math.min(15,h*.12),c),this.camera.position.set(l+h*.72,h*.62,c+h*.72),this.camera.lookAt(this.controls.target),this.controls.update()}onGroundDoubleClick(t){const e=new tf,n=new Et,s=new Gn(new L(0,1,0),0),o=new L;this.renderer.domElement.addEventListener("dblclick",a=>{const r=this.renderer.domElement.getBoundingClientRect();n.x=(a.clientX-r.left)/r.width*2-1,n.y=-((a.clientY-r.top)/r.height)*2+1,e.setFromCamera(n,this.camera),e.ray.intersectPlane(s,o)&&t([o.x,o.z])})}}ke=new WeakSet,af=function(){const t=new ur;t.scale.setScalar(2e3);const e=t.material.uniforms;e.turbidity.value=6,e.rayleigh.value=1.6,e.mieCoefficient.value=.004,e.mieDirectionalG.value=.75,e.sunPosition.value.copy(po),this.scene.add(t)},rf=function(){const t=new yx(14674677,5522734,.75);this.scene.add(t),this.sun=new Sx(16773853,2.6),this.sun.position.copy(po).multiplyScalar(140),this.sun.castShadow=!0,this.sun.shadow.mapSize.set(2048,2048),this.sun.shadow.bias=-5e-4,this.scene.add(this.sun),this.scene.add(this.sun.target),z(this,ke,hc).call(this,0,0,130)},hc=function(t,e,n){const s=n*.62+18;this.sun.position.set(t+po.x*n*1.6,po.y*n*1.6,e+po.z*n*1.6),this.sun.target.position.set(t,0,e);const o=this.sun.shadow.camera;o.left=-s,o.right=s,o.top=s,o.bottom=-s,o.near=1,o.far=n*4+150,o.updateProjectionMatrix()},lf=function(){if(typeof document>"u")return null;const t=1024,e=document.createElement("canvas");e.width=t,e.height=t;const n=e.getContext("2d");n.fillStyle="#8f8a7d",n.fillRect(0,0,t,t);const s=fr(20260705),o=["#7d766a","#989284","#a39b8b","#867f70","#9c9484"];for(let r=0;r<1400;r++){const l=4+s()*26;n.globalAlpha=.05+s()*.06,n.fillStyle=o[Math.floor(s()*o.length)%o.length],n.beginPath(),n.ellipse(s()*t,s()*t,l,l*(.4+s()*.6),s()*Math.PI,0,Math.PI*2),n.fill()}for(let r=0;r<22;r++){n.globalAlpha=.045,n.strokeStyle=s()>.5?"#797367":"#7d7669",n.lineWidth=5+s()*9,n.beginPath();const l=s()*t;n.moveTo(0,l),n.bezierCurveTo(t*.3,l+(s()-.5)*180,t*.7,l+(s()-.5)*180,t,l+(s()-.5)*120),n.stroke()}n.globalAlpha=1;const a=new xx(e);return a.wrapS=Do,a.wrapT=Do,a.repeat.set(5,5),a.anisotropy=4,a.colorSpace=dn,a},cf=function(){const t=z(this,ke,lf).call(this),e=new Lt({color:t?16777215:9407101,map:t,roughness:.95,metalness:0}),n=new st(new qn(1e3,1e3),e);n.rotation.x=-Math.PI/2,n.receiveShadow=!0,this.scene.add(n),this.devHelpers=new Nt;const s=new wx(200,20,4478310,6715272);s.material.opacity=.35,s.material.transparent=!0,s.position.y=.01,this.devHelpers.add(s);const o=new Tx(5);o.position.y=.02,this.devHelpers.add(o),this.devHelpers.visible=!1,this.scene.add(this.devHelpers)},hf=function(t,e,n,s){const o=new ie(.09,1.9,.09),a=new Lt({color:8225674,roughness:.6,metalness:.4}),r=4,l=[{from:[t,n],to:[e,n]},{from:[e,n],to:[e,s]},{from:[e,s],to:[t,s]},{from:[t,s],to:[t,n]}];let c=0;const h=[];for(const _ of l){const g=_.to[0]-_.from[0],f=_.to[1]-_.from[1],x=Math.hypot(g,f),y=Math.max(1,Math.floor(x/r));for(let v=0;v<y;v++)h.push([_.from[0]+g*v/y,_.from[1]+f*v/y]);c+=y}const d=new ju(o,a,c),u=new Qt;h.forEach(([_,g],f)=>d.setMatrixAt(f,u.makeTranslation(_,.95,g))),d.instanceMatrix.needsUpdate=!0,this.siteEnv.add(d);const p=new Lt({color:13489112,transparent:!0,opacity:.22,side:Re,depthWrite:!1}),m=new Lt({color:10133928,roughness:.5,metalness:.4});for(const _ of l){const g=_.to[0]-_.from[0],f=_.to[1]-_.from[1],x=Math.hypot(g,f),y=Math.atan2(f,g),v=(_.from[0]+_.to[0])/2,w=(_.from[1]+_.to[1])/2,E=new st(new qn(x,1.6),p);E.position.set(v,.95,w),E.rotation.y=-y,this.siteEnv.add(E);const S=new st(new ie(x,.05,.05),m);S.position.set(v,1.82,w),S.rotation.y=-y,this.siteEnv.add(S)}},df=function(){const t=this.container.clientWidth,e=this.container.clientHeight;this.camera.aspect=t/e,this.camera.updateProjectionMatrix(),this.renderer.setSize(t,e)};const _e={track:new Lt({color:3817285,roughness:.9}),shoe:new Lt({color:2369323,roughness:.85,metalness:.1}),body:new Lt({color:14262554,roughness:.55,metalness:.15}),cab:new Lt({color:15262938,roughness:.5}),glass:new Lt({color:2771558,roughness:.15,metalness:.6}),boom:new Lt({color:13181978,roughness:.5,metalness:.25}),counter:new Lt({color:5593955,roughness:.8}),counterAlt:new Lt({color:4738647,roughness:.8}),rope:new Lt({color:1908514,roughness:.6}),hook:new Lt({color:1579291,roughness:.4,metalness:.5}),rail:new Lt({color:15262938,roughness:.6})},$x=2*Math.PI/180,Xx=.55,ba=.5,Nd=new L,qx=new L,Od=new Qt;function ni(i,t,e,n){const s=new st(new ie(i,t,e),n);return s.castShadow=!0,s.receiveShadow=!0,s}var Ii,dc,uc;class Yx{constructor(t){Le(this,Ii);const e=t.geometry;this.spec=t,this.root=new Nt,this.lower=new Nt,this.root.add(this.lower);const n=1.1,s=e.bodyLength,o=1.2,a=e.bodyWidth-o;this.trackDims={trackH:n,trackL:s,trackW:o},this.tracks=[];for(const f of[-1,1]){const x=new Nt;x.position.z=f*a/2,this.lower.add(x);const y=ni(s-.7,.75,o-.25,_e.track);y.position.y=n/2,x.add(y);for(const E of[-1,1]){const S=new st(new ve(.4,.4,o-.3,14),_e.track);S.rotation.x=Math.PI/2,S.position.set(E*(s/2-.45),.52,0),S.castShadow=!0,x.add(S)}const v=Math.ceil(s/ba),w=new ju(new ie(ba*.86,.16,o+.12),_e.shoe,v*2);w.castShadow=!0,x.add(w),this.tracks.push({shoes:w,rows:v})}this._scroll=0,this._prevTime=null,z(this,Ii,uc).call(this);const r=ni(s*.55,.7,a*.85,_e.counter);r.position.y=n+.35,this.lower.add(r),this.upper=new Nt,this.upper.position.y=n+.7,this.root.add(this.upper);const l=ni(6.5,.6,3.2,_e.body);l.position.set(-.5,.3,0),this.upper.add(l);const c=ni(2.2,1.6,1.4,_e.body);c.position.set(1.8,1.4,1.4),this.upper.add(c);const h=ni(1,1,1.35,_e.glass);h.position.set(2.5,1.5,1.4),this.upper.add(h);for(let f=0;f<3;f++){const x=ni(1.55,.55,3,f%2===0?_e.counter:_e.counterAlt);x.position.set(-2.9,.9+f*.58,0),this.upper.add(x)}const d=ni(3,1.3,2.8,_e.body);d.position.set(-1.2,1.25,0),this.upper.add(d);const u=new st(new ve(.09,.09,1,8),_e.hook);u.position.set(-.4,2.4,-1.05),u.castShadow=!0,this.upper.add(u);const p=new st(new ie(2.6,.05,.05),_e.rail);p.position.set(-2.9,2.7,1.45),this.upper.add(p);const m=p.clone();m.position.z=-1.45,this.upper.add(m);for(const f of[-4.1,-1.7])for(const x of[-1.45,1.45]){const y=new st(new ie(.05,.55,.05),_e.rail);y.position.set(f,2.45,x),this.upper.add(y)}this.gantryApex=new Se,this.gantryApex.position.set(-2.6,4.1,0),this.upper.add(this.gantryApex);for(const f of[-.75,.75]){const x=ts(_e.boom,.07);Qi(x,[-2,.6,f],[-2.6,4.1,0]),this.upper.add(x)}const _=ni(.3,.3,1.7,_e.boom);_.position.set(-2.6,4.1,0),this.upper.add(_),this.boomPivot=new Nt,this.boomPivot.position.set(e.pivotOffset,e.pivotHeight-(n+.7),0),this.upper.add(this.boomPivot),this.baseBoomLength=e.boomLength,this.currentBoomLength=0,this.boomInner=new Nt,this.boomOuter=new Nt,this.boomPivot.add(this.boomInner),this.boomInner.add(this.boomOuter),this.tipAnchor=new Se,this.boomOuter.add(this.tipAnchor),this.bridleAnchor=new Se,this.boomOuter.add(this.bridleAnchor),z(this,Ii,dc).call(this,e.boomLength),this.pendants=[];for(let f=0;f<2;f++){const x=ts(_e.rope,.028);this.root.add(x),this.pendants.push(x)}const g=Math.max(1,Math.min(t.geometry.hoistFalls??4,4));this.ropeFalls=[];for(let f=0;f<g;f++){const x=ts(_e.rope,.03);this.root.add(x),this.ropeFalls.push(x)}this.hookMesh=sf({blockMat:_e.hook,hookMat:_e.hook}),this.root.add(this.hookMesh)}update(t,e){const[n,s,o]=t.basePos;this.root.position.set(n,s,o),this.lower.rotation.y=-(t.extra.driveYaw??0),this.upper.rotation.y=-t.slewAngle,this.boomPivot.rotation.z=t.extra.boomAngle;const a=Number.isFinite(t.loadRatio)?t.loadRatio:1.2;this.boomOuter.rotation.z=t.loadMass>0?-$x*Math.min(a,1.2):0;const r=t.extra.boomLength??this.baseBoomLength;if(Math.abs(r-this.currentBoomLength)>1e-9&&z(this,Ii,dc).call(this,r),e!=null&&this._prevTime!=null&&e>this._prevTime){const y=t.extra.driveVel??0;y!==0&&(this._scroll+=y*(e-this._prevTime),z(this,Ii,uc).call(this))}this._prevTime=e??null,this.root.updateMatrixWorld(!0);const l=this.tipAnchor.getWorldPosition(Nd),[c,h,d]=t.hookPos,u=[l.x-n,l.y-s,l.z-o],p=[c-n,h-s,d-o],m=[-Math.sin(t.slewAngle),0,Math.cos(t.slewAngle)],_=this.ropeFalls.length;this.ropeFalls.forEach((y,v)=>{const w=_>1?v-(_-1)/2:0,E=w*.11,S=w*.055;Qi(y,[u[0]+m[0]*E,u[1],u[2]+m[2]*E],[p[0]+m[0]*S,p[1],p[2]+m[2]*S])}),this.hookMesh.position.set(p[0],p[1],p[2]),this.hookMesh.rotation.y=-t.slewAngle;const g=this.gantryApex.getWorldPosition(qx),f=this.bridleAnchor.getWorldPosition(Nd),x=.35;this.pendants.forEach((y,v)=>{const w=(v===0?-1:1)*x;Qi(y,[g.x-n+m[0]*w,g.y-s,g.z-o+m[2]*w],[f.x-n+m[0]*w*.4,f.y-s,f.z-o+m[2]*w*.4])})}}Ii=new WeakSet,dc=function(t){this.currentBoomLength=t;for(const r of[this.boomInner,this.boomOuter])for(const l of[...r.children])l.isMesh&&r.remove(l);const e=t*Xx,n=t-e,s=.95;this.boomInner.add(Co({length:e,width:s},_e.boom)),this.boomOuter.position.x=e,this.boomOuter.add(Co({length:n,width:s*.9},_e.boom));const o=ni(.7,1,1,_e.boom);o.position.x=n,this.boomOuter.add(o);const a=new st(new ve(.2,.2,.5,12),_e.hook);a.rotation.x=Math.PI/2,a.position.set(n+.25,-.25,0),a.castShadow=!0,this.boomOuter.add(a),this.boomHead=o,this.tipAnchor.position.set(n+.25,-.45,0),this.bridleAnchor.position.set(n-.6,.55,0)},uc=function(){const{trackH:t,trackL:e}=this.trackDims,n=e/2,s=o=>(o%e+e)%e;for(const{shoes:o,rows:a}of this.tracks){for(let r=0;r<a;r++){const l=-n+s(r*ba-this._scroll),c=-n+s(r*ba+this._scroll);o.setMatrixAt(r,Od.makeTranslation(l,.09,0)),o.setMatrixAt(a+r,Od.makeTranslation(c,t-.06,0))}o.instanceMatrix.needsUpdate=!0}};const De={mast:new Lt({color:14262554,roughness:.55,metalness:.15}),jib:new Lt({color:14262554,roughness:.55,metalness:.15}),cab:new Lt({color:15262938,roughness:.5}),glass:new Lt({color:2771558,roughness:.15,metalness:.6}),counter:new Lt({color:5593955,roughness:.8}),trolley:new Lt({color:13181978,roughness:.5,metalness:.2}),rope:new Lt({color:1908514,roughness:.6}),hook:new Lt({color:1579291,roughness:.4,metalness:.5}),base:new Lt({color:9080726,roughness:.9}),beacon:new Oe({color:16722458})};function bi(i,t,e,n){const s=new st(new ie(i,t,e),n);return s.castShadow=!0,s.receiveShadow=!0,s}class jx{constructor(t){const e=t.geometry;this.spec=t,this.root=new Nt;const n=bi(4,1.2,4,De.base);n.position.y=.6,this.root.add(n);for(const[x,y]of[[-1.6,-1.6],[-1.6,1.6],[1.6,-1.6],[1.6,1.6]]){const v=bi(.5,.35,.5,De.counter);v.position.set(x,1.35,y),this.root.add(v)}const s=e.mastHeight-1.2,o=Co({length:s,width:1.5,bays:Math.max(4,Math.round(s/2.2)),chordRadius:.07},De.mast);o.rotation.z=Math.PI/2,o.position.y=1.2,this.root.add(o),this.upper=new Nt,this.upper.position.y=e.mastHeight,this.root.add(this.upper);const a=bi(1.8,1.2,1.8,De.mast);a.position.y=.6,this.upper.add(a);const r=Co({length:5,width:.8,bays:4,chordRadius:.05},De.mast);r.rotation.z=Math.PI/2,r.position.y=1.2,this.upper.add(r);const l=bi(1.6,1.8,1.5,De.cab);l.position.set(1.2,1.4,1.3),this.upper.add(l);const c=bi(.9,1,1.45,De.glass);c.position.set(1.7,1.4,1.3),this.upper.add(c);const h=1.35,d=Co({length:e.jibLength,width:.95,height:1.05,section:"triangle",bays:Math.max(6,Math.round(e.jibLength/1.6)),chordRadius:.055},De.jib);d.position.set(0,h,0),this.upper.add(d);const u=e.counterJibLength??e.jibLength*.3,p=bi(u,.35,1.8,De.jib);p.position.set(-u/2,h,0),this.upper.add(p);for(let x=0;x<3;x++){const y=bi(.45,1.6,2.2,De.counter);y.position.set(-u+.7+x*.55,h-1,0),this.upper.add(y)}for(const x of[-.85,.85]){const y=new st(new ie(u-.5,.05,.05),De.cab);y.position.set(-u/2,h+.75,x),this.upper.add(y)}const m=ts(De.rope,.045);Qi(m,[0,6,0],[e.jibLength*.6,h+.55,0]),this.upper.add(m);const _=ts(De.rope,.045);Qi(_,[0,6,0],[-u+.7,h+.35,0]),this.upper.add(_),this.beacon=new st(new ss(.14,8,8),De.beacon),this.beacon.position.y=6.4,this.upper.add(this.beacon),this.trolley=new Nt,this.trolley.position.y=.9;const g=bi(1.1,.4,1.2,De.trolley);this.trolley.add(g);for(const x of[-.3,.3]){const y=new st(new ve(.15,.15,.07,12),De.hook);y.rotation.x=Math.PI/2,y.position.set(0,-.28,x),this.trolley.add(y)}this.upper.add(this.trolley);const f=Math.max(1,Math.min(t.geometry.hoistFalls??2,4));this.ropeFalls=[];for(let x=0;x<f;x++){const y=ts(De.rope,.028);this.root.add(y),this.ropeFalls.push(y)}this.hookMesh=sf({blockMat:De.hook,hookMat:De.hook}),this.root.add(this.hookMesh)}update(t,e){const[n,s,o]=t.basePos;this.root.position.set(n,s,o),this.upper.rotation.y=-t.slewAngle,this.trolley.position.x=t.extra.trolleyPos,this.beacon.visible=e==null?!0:e%1.6<.8;const[a,r,l]=t.hookPos,c=s+t.extra.mastHeight+.55,h=n+t.extra.trolleyPos*Math.cos(t.slewAngle),d=o+t.extra.trolleyPos*Math.sin(t.slewAngle),u=[h-n,c-s,d-o],p=[a-n,r-s,l-o],m=[-Math.sin(t.slewAngle),0,Math.cos(t.slewAngle)],_=this.ropeFalls.length;this.ropeFalls.forEach((g,f)=>{const x=_>1?f-(_-1)/2:0,y=x*.3,v=x*.09;Qi(g,[u[0]+m[0]*y,u[1],u[2]+m[2]*y],[p[0]+m[0]*v,p[1],p[2]+m[2]*v])}),this.hookMesh.position.set(p[0],p[1],p[2]),this.hookMesh.rotation.y=-t.slewAngle}}class Zx{constructor(t){this.id=t.id,this.name=t.name??t.id,this.size=t.size,this.mass=t.mass,this.shape=t.shape??null,this.windArea=t.windArea??null,this.tandem=t.tandem===!0;const e=Math.max(this.size[0],this.size[2])*.4;this.liftPoints=t.liftPoints?t.liftPoints.map(n=>[...n]):[[-e,0],[e,0]],this.cog=t.cog?[t.cog[0],t.cog[1]??t.cog[2]??0]:[0,0],this.tandemCraneIds=null,this.targetYaw=t.targetYaw??null,this.yawTolerance=t.yawTolerance??Math.PI/18,this.slingHeight=t.slingHeight??null,this.minSlingAngle=t.minSlingAngle??null,this.blockUnsafeSling=t.blockUnsafeSling??!1,this.resourceRequirements={...t.resourceRequirements??{}},this.erectionOrder=t.erectionOrder??null,this.placementError=null,this.placementYawError=null,this.pos=[...t.pos],this.elev=t.elev??0,this.pos[1]=this.elev+this.size[1]/2,this.route=t.route?t.route.map(n=>({target:[...n.target],elev:n.elev??0})):t.target?[{target:[...t.target],elev:t.targetElev??0}]:[],this.stage=0,this.rigTime=t.rigTime??0,this.derigTime=t.derigTime??0,this.timer=0,this.arriveTime=t.arriveTime??0,this.dependsOn=t.dependsOn?[...t.dependsOn]:[],this.maxWind=t.maxWind??null,this.state=this.arriveTime>0?"pending":"ground",this.removed=!1,this.hookedBy=null,this.stageChangedAt=null,this.yardedAt=null,this.yaw=0,this.yawVel=0,this._yawOffset=0,this.sway=null}get target(){var t;return((t=this.route[this.stage])==null?void 0:t.target)??null}get targetElev(){var t;return((t=this.route[this.stage])==null?void 0:t.elev)??0}get finalLeg(){return this.stage>=this.route.length-1}advanceStage(){return this.finalLeg?!1:(this.stage+=1,!0)}get topY(){return this.pos[1]+this.size[1]/2}get bottomY(){return this.pos[1]-this.size[1]/2}getState(){return{id:this.id,name:this.name,size:[...this.size],mass:this.mass,shape:this.shape,windArea:this.windArea,yaw:this.yaw,pos:[...this.pos],target:this.target?[...this.target]:null,targetElev:this.targetElev,route:this.route.map(t=>({target:[...t.target],elev:t.elev})),stage:this.stage,stages:this.route.length,state:this.state,removed:this.removed,hookedBy:this.hookedBy,tandem:this.tandem,liftPoints:this.liftPoints.map(t=>[...t]),cog:[...this.cog],tandemCraneIds:this.tandemCraneIds?[...this.tandemCraneIds]:null,targetYaw:this.targetYaw,yawTolerance:this.yawTolerance,placementError:this.placementError,placementYawError:this.placementYawError,sling:this.sling?{...this.sling}:null,resourceRequirements:{...this.resourceRequirements},erectionOrder:this.erectionOrder,rigRemain:this.state==="rigging"||this.state==="derigging"?this.timer:0,rigTime:this.rigTime,derigTime:this.derigTime,arriveTime:this.arriveTime,stageChangedAt:this.stageChangedAt,yardedAt:this.yardedAt,dependsOn:[...this.dependsOn]}}}const Kx=9.81;class nh{constructor(t={}){this.damping=t.damping??.25,this.ox=0,this.oz=0,this.vx=0,this.vz=0,this._prevSx=null,this._prevSz=null,this._prevVx=0,this._prevVz=0}update(t,e,n,s,o=0,a=0){let r=0,l=0;if(this._prevSx!==null){const h=(e-this._prevSx)/t,d=(n-this._prevSz)/t;r=(h-this._prevVx)/t,l=(d-this._prevVz)/t,this._prevVx=h,this._prevVz=d}this._prevSx=e,this._prevSz=n;const c=Kx/Math.max(s,2);this.vx+=(-c*this.ox-this.damping*this.vx-r+o)*t,this.vz+=(-c*this.oz-this.damping*this.vz-l+a)*t,this.ox+=this.vx*t,this.oz+=this.vz*t}get offset(){return[this.ox,this.oz]}get magnitude(){return Math.hypot(this.ox,this.oz)}}const Jx=1.5,kd=1.5;function Qx(i,t,e,n){const s=bo(t,i),o=bo(n,e),a=bo(i,e),r=mo(s,s),l=mo(o,o),c=mo(o,a);let h,d;if(r<=1e-12&&l<=1e-12)return fc(a);if(r<=1e-12)h=0,d=go(c/l);else{const m=mo(s,a);if(l<=1e-12)d=0,h=go(-m/r);else{const _=mo(s,o),g=r*l-_*_;h=g>1e-12?go((_*c-m*l)/g):0,d=(_*h+c)/l,d<0?(d=0,h=go(-m/r)):d>1&&(d=1,h=go((_-m)/r))}}const u=Hd(i,Gd(s,h)),p=Hd(e,Gd(o,d));return fc(bo(u,p))}function zd(i){const[t,e,n]=i.basePos,s=i.slewAngle,o=[Math.cos(s),Math.sin(s)],a=i.spec.geometry;if(i.spec.type==="tower"){const h=e+i.mastHeight+1.4,d=a.counterJibLength??i.jibLength*.3;return{segments:[{a:[t,h,n],b:[t+i.jibLength*o[0],h,n+i.jibLength*o[1]],part:"jib"},{a:[t,h,n],b:[t-d*o[0],h,n-d*o[1]],part:"counterJib"}],tail:{pos:[t-d*o[0],h,n-d*o[1]],r:kd},body:{pos:[t,e,n],radius:a.bodyRadius??1.2,height:i.mastHeight}}}const r=a.tailSwingRadius??4.5,l=e+(a.tailHeight??2.5),c=i.getRadius();return{segments:[{a:[t+a.pivotOffset*o[0],e+a.pivotHeight,n+a.pivotOffset*o[1]],b:[t+c*o[0],e+i.boomTipY(),n+c*o[1]],part:"boom"}],tail:{pos:[t-r*o[0],l,n-r*o[1]],r:kd},body:{pos:[t,e,n],radius:a.bodyRadius??Math.max(a.bodyWidth,a.bodyLength)/2,height:a.bodyHeight??3.2}}}function uf(i,t){let e=1/0;for(const s of i.segments)for(const o of t.segments)e=Math.min(e,Qx(s.a,s.b,o.a,o.b));const n=ty(i.tail,t.tail)||Bd(i.tail,t.body)||Bd(t.tail,i.body);return{boomDist:e,tailContact:n,clash:e<Jx||n}}function ty(i,t){return!i||!t?!1:fc(bo(i.pos,t.pos))<i.r+t.r}function Bd(i,t){return!i||!t||Math.hypot(i.pos[0]-t.pos[0],i.pos[2]-t.pos[2])>=i.r+t.radius?!1:i.pos[1]-i.r<t.pos[1]+t.height&&i.pos[1]+i.r>t.pos[1]}const bo=(i,t)=>[i[0]-t[0],i[1]-t[1],i[2]-t[2]],Hd=(i,t)=>[i[0]+t[0],i[1]+t[1],i[2]+t[2]],Gd=(i,t)=>[i[0]*t,i[1]*t,i[2]*t],mo=(i,t)=>i[0]*t[0]+i[1]*t[1]+i[2]*t[2],fc=i=>Math.hypot(i[0],i[1],i[2]),go=i=>Math.min(1,Math.max(0,i)),ff=1.33;function pr({spec:i,boomLength:t,radius:e,loadMass:n,direction:s="side",ground:o=null,safetyFactor:a=ff}){var b;const r=i.masses,l=i.geometry;if(!r)return{ok:!0,skipped:!0};const c=l.trackWidth??1.2,h=l.bodyLength,d=s==="side"?l.bodyWidth/2:l.bodyLength/2,u=(r.boomPerMeter??.35)*t,p=((b=i.rating)==null?void 0:b.hookBlockMass)??0,m=l.pivotOffset+(e-l.pivotOffset)/2,_=r.base*d+r.counterweight*(d+(l.tailSwingRadius??4.5)),g=(n+p)*Math.max(0,e-d)+u*Math.max(0,m-d),f=g>1e-9?_/g:1/0,x=f>=a,y=r.base+r.counterweight+u+n+p,v=2*h*c,w=((n+p)*e+u*m-r.counterweight*(l.tailSwingRadius??4.5))/y,E=s==="side"?l.bodyWidth:l.bodyLength,S=y/v*(1+6*Math.abs(w)/E),R=!o||S<=o.bearingCapacity;return{ok:x&&R,tipOK:x,tippingMargin:f,groundOK:R,groundPressure:S,direction:s}}const ey=9.81;function ny(i,t={}){return i*(t.pickCarryFactor??.66)}function iy({spec:i,boomLength:t,carryRadius:e,carryHeight:n,loadMass:s,accel:o,direction:a="front",safetyFactor:r=ff}){var y;const l=i.masses,c=i.geometry;if(!l)return{ok:!0,skipped:!0};const h=a==="side"?c.bodyWidth/2:c.bodyLength/2,d=(l.boomPerMeter??.35)*t,u=((y=i.rating)==null?void 0:y.hookBlockMass)??0,p=c.pivotOffset+(e-c.pivotOffset)/2,m=l.base*h+l.counterweight*(h+(c.tailSwingRadius??4.5)),_=(s+u)*Math.max(0,e-h)+d*Math.max(0,p-h),g=s*(Math.abs(o)/ey)*Math.max(0,n),f=_+g,x=f>1e-9?m/f:1/0;return{ok:x>=r,tipOK:x>=r,tippingMargin:x,dynamicShare:f>0?g/f:0,direction:a}}const sy=Math.PI/3;function oy(i,t={}){var d,u;const e=Math.max(2,((d=i.liftPoints)==null?void 0:d.length)??t.pointCount??4),n=Math.max(.1,i.slingHeight??t.slingHeight??3),s=Math.max(.1,i.size[0]/2),o=Math.max(.1,i.size[2]/2),a=(u=i.liftPoints)!=null&&u.length?Math.max(...i.liftPoints.map(p=>Math.hypot(p[0],p[1]??0))):Math.hypot(s,o),r=Math.atan2(n,a),l=i.minSlingAngle??t.minAngle??sy,c=i.mass/(e*Math.max(Math.sin(r),1e-6)),h=r<l;return{pointCount:e,height:n,horizontal:a,angle:r,minAngle:l,tensionPerLeg:c,totalVertical:c*e*Math.sin(r),warning:h,blocked:h&&(i.blockUnsafeSling??t.blockUnsafeSling??!1)}}function ay(i,t={}){const e=i.loads.filter(_=>_.target);if(!e.length||!e.every(_=>_.state==="placed"))return null;const n=_=>_.reduce((g,f)=>g+f,0)/Math.max(1,_.length),s=n(e.map(_=>_.placementError??0)),o=n(e.map(_=>Math.abs(_.placementYawError??0))),a=i.safety??{},r=(a.agentHoldTime??0)+(a.tandemHoldTime??0),l=(a.collisionCount??0)+(a.violationCount??0)+(a.craneClashCount??0)+(a.siteRuleViolationCount??0),c=Math.max(1,t.parTime??i.time),h=Math.max(0,i.time-c)/c*20,d=Math.min(30,s*15),u=Math.min(20,o*(180/Math.PI)),p=l*(t.violationPenalty??12)+r*(t.holdPenaltyPerSecond??.1),m=Math.max(0,Math.min(100,100-h-d-u-p));return{value:m,stars:Math.max(1,Math.min(5,Math.ceil(m/20))),time:i.time,parTime:c,positionError:s,yawError:o,violations:l,holdTime:r,penalties:{time:h,position:d,yaw:u,safety:p}}}const ry=(i,t,e)=>Math.max(t,Math.min(e,i));function ly(i,t,e){const n=e.map((r,l)=>r-t[l]),s=i.map((r,l)=>r-t[l]),o=n.reduce((r,l)=>r+l*l,0),a=o>0?ry(s.reduce((r,l,c)=>r+l*n[c],0)/o,0,1):0;return Math.hypot(...i.map((r,l)=>r-(t[l]+n[l]*a)))}function mr(i,t=[]){if(!t.length)return{skipped:!0,safe:!0,clearance:1/0,lineId:null};let e={clearance:1/0,lineId:null,required:0};for(const n of t){const s=ly(i,n.a,n.b);s<e.clearance&&(e={clearance:s,lineId:n.id,required:n.clearance??6})}return{skipped:!1,...e,safe:e.clearance>=e.required}}function pf(i,t,e=[],n=24){if(!e.length)return{skipped:!0,safe:!0,clearance:1/0,lineId:null};let s={clearance:1/0,lineId:null,required:0};for(let o=0;o<=n;o++){const a=o/n,r=i.map((c,h)=>c+(t[h]-c)*a),l=mr(r,e);l.clearance<s.clearance&&(s=l)}return s}function Fo(i,t=[]){const e=t.find(n=>i[0]>=n.min[0]&&i[0]<=n.max[0]&&i[2]>=n.min[1]&&i[2]<=n.max[1]);return e?{skipped:!1,safe:i[1]<=e.maxHeight,limit:e.maxHeight,zoneId:e.id}:{skipped:!0,safe:!0,limit:1/0,zoneId:null}}function ll(i,t,e=0){var s;if(!i)return e;if(!((s=i.timeline)!=null&&s.length))return i.value??i.speed??e;let n=i.timeline[0][1];for(const[o,a]of i.timeline){if(o>t)break;n=a}return n}function Ha(i,t){if(!i)return{blocked:!1,reasons:[],rain:0,lightning:1/0,visibility:1/0};const e=ll(i.rain,t),n=ll(i.lightning,t,1/0),s=ll(i.visibility,t,1/0),o=[];return e>(i.maxRain??1/0)&&o.push("rain"),n<(i.minLightningDistance??10)&&o.push("lightning"),s<(i.minVisibility??200)&&o.push("visibility"),{blocked:o.length>0,reasons:o,rain:e,lightning:n,visibility:s}}function Ga(i=[],t){if(!i.length)return{available:!0,shiftId:null};const e=24*3600,n=(t%e+e)%e,s=i.find(o=>n>=o.start&&n<o.end);return{available:!!s,shiftId:(s==null?void 0:s.id)??null}}function cy(i,t){var a;if(!((a=t==null?void 0:t.slots)!=null&&a.length))return{skipped:!0,feasible:!0,placements:[],rehandles:[]};const e=[],n=new Map(t.slots.map(r=>[r.id,[]])),s=[];for(const r of i){const l=t.slots.find(h=>n.get(h.id).length<(h.maxLayers??1)&&r.size[0]<=h.size[0]&&r.size[2]<=h.size[1]&&r.mass<=(h.maxMass??1/0));if(!l)return{skipped:!1,feasible:!1,reason:`no-slot:${r.id}`,placements:e,rehandles:s};const c=n.get(l.id);c.push(r.id),e.push({loadId:r.id,slotId:l.id,layer:c.length-1})}const o=new Map(i.map((r,l)=>[r.id,r.erectionOrder??l]));for(const r of n.values())for(let l=0;l<r.length;l++)for(let c=l+1;c<r.length;c++)o.get(r[l])<o.get(r[c])&&s.push({loadId:r[c],blocking:r.slice(c+1),count:r.length-c-1});return{skipped:!1,feasible:!0,placements:e,rehandles:s}}function hy(i,t,e=[]){var l,c,h;const n=(l=i.outrigger)==null?void 0:l.points;if(!(n!=null&&n.length))return{skipped:!0,feasible:!0,pads:[]};const s=(((c=i.masses)==null?void 0:c.base)??0)+(((h=i.masses)==null?void 0:h.counterweight)??0)+(t.loadMass??0),o=(t.loadMass??0)*(t.radius??0),a=Math.max(...n.map(d=>Math.abs(d[0])),1),r=n.map(d=>{const u=t.pos[0]+d[0],p=t.pos[1]+d[1],m=Math.sign(d[0])||1,_=Math.max(0,s/n.length+m*o/(n.length*a)),g=e.find(v=>u>=v.min[0]&&u<=v.max[0]&&p>=v.min[1]&&p<=v.max[1]),f=i.outrigger.padArea??1,x=_/f,y=(g==null?void 0:g.bearingCapacity)??t.defaultBearingCapacity??1/0;return{point:[...d],pos:[u,p],reaction:_,pressure:x,capacity:y,safe:x<=y}});return{skipped:!1,feasible:r.every(d=>d.safe),pads:r}}function dy(i,t,e,n={}){if(!e||t===e.id)return{required:!1,feasible:!0,duration:0,cost:0};const s=e.assemblyArea??[0,0],o=n.assemblyArea??[1/0,1/0],a=s[0]<=o[0]&&s[1]<=o[1]&&(e.assistCraneRequired?(n.assistCranes??0)>0:!0);return{required:!0,feasible:a,duration:e.duration??0,cost:e.cost??0,trucks:e.trucks??0,reason:a?null:"assembly-logistics"}}const Ds=2,Sa=4,Vd=.5,wn=1.2,cl=1.5,uy=.8,fy=1.6,py=12,my=.75,gy=.4,_y=.4,vy=.32,xy=.35;var St,pc,mc,mf,gf,_f,gc,vf,Va,xf,yf,_c,vc,Wa,Mf,xc,yc,bf,Mc,Sf;class yy{constructor(){Le(this,St);this.cranes=[],this.loads=[],this.obstacles=[],this.noFlyZones=[],this.trucks=[],this.agents=[],this.agentRules={dangerRadius:5},this.agentHolds=new Set,this.agentHoldCount=0,this.agentHoldTime=0,this._prevHolds=new Set,this.tandemHolds=new Set,this.tandemHoldTime=0,this.time=0,this.lastEvent=null,this.collisionIds=[],this.zoneViolation=!1,this.collisionCount=0,this.violationCount=0,this._prevColliding=!1,this._prevViolating=!1,this.cranePairs=[],this.craneMinClearance=1/0,this.craneClashCount=0,this._prevClashing=!1,this.windDef=null,this.windSpeed=0,this.siteBounds=null,this.powerLines=[],this.heightLimits=[],this.weatherDef=null,this.shifts=[],this.siteRuleViolations=[],this.siteRuleViolationCount=0,this._prevSiteRuleViolation=!1}setWind(t){this.windDef=t??null,this.windSpeed=z(this,St,pc).call(this,0)*z(this,St,mc).call(this,0)}windLimitFor(t){var e;return t.maxWind??((e=this.windDef)==null?void 0:e.maxOperating)??1/0}addCrane(t){return this.cranes.push(t),this.cranes.length-1}addLoad(t){const e=new Zx(t);e.sling=oy(e),this.loads.push(e)}addObstacle(t){this.obstacles.push({id:t.id,pos:[...t.pos],size:[...t.size]})}addNoFlyZone(t){this.noFlyZones.push({id:t.id,min:[...t.min],max:[...t.max]})}addAgent(t){this.agents.push(t)}setAgentRules(t){this.agentRules={...this.agentRules,...t}}addTruck(t){for(const e of t.loadIds){const n=this.loads.find(s=>s.id===e);n&&t.cargoDock.set(e,[n.pos[0],n.pos[2]])}this.trucks.push(t)}setOperationalRules(t={}){this.powerLines=structuredClone(t.powerLines??[]),this.heightLimits=structuredClone(t.heightLimits??[]),this.weatherDef=structuredClone(t.weather??null),this.shifts=structuredClone(t.shifts??[])}step(t,e=[]){var n,s,o;this.windSpeed=z(this,St,pc).call(this,this.time)*z(this,St,mc).call(this,this.time),z(this,St,mf).call(this),z(this,St,_f).call(this);for(const a of this.loads)a.state==="pending"&&this.time>=a.arriveTime&&(a.state="ground",this.lastEvent=`🚚 반입: ${a.name}`);for(const a of this.loads)if(!(a.state!=="rigging"&&a.state!=="derigging")&&(a.timer-=t,a.timer<=0)){const r=this.cranes[a.hookedBy];a.state==="rigging"?z(this,St,xc).call(this,a.hookedBy,r,a):z(this,St,Mc).call(this,r,a)}for(const a of this.agents)a.step(t,this);z(this,St,gf).call(this,t),this.tandemHolds.clear();for(const a of this.loads.filter(r=>r.state==="hooked"&&r.tandemCraneIds)){const r=this.tandemSyncPreview(a.id);if(r!=null&&r.hold)for(const l of a.tandemCraneIds)this.tandemHolds.add(l)}this.tandemHoldTime+=t*this.tandemHolds.size,this.cranes.forEach((a,r)=>{const l=a.basePos[0],c=a.basePos[2],h=z(this,St,gc).call(this,r)||this.agentHolds.has(r)||this.tandemHolds.has(r);a.step(t,h?{}:e[r]??{}),(a.basePos[0]!==l||a.basePos[2]!==c)&&z(this,St,vf).call(this,r)&&(a.basePos[0]=l,a.basePos[2]=c,a.driveVel!==void 0&&(a.driveVel=0))});for(const a of this.loads){if(a.state!=="hooked")continue;const r=this.cranes[a.hookedBy],l=(n=a.tandemCraneIds)==null?void 0:n.map(u=>this.cranes[u].getHookPos()),c=l?[(l[0][0]+l[1][0])/2,(l[0][1]+l[1][1])/2,(l[0][2]+l[1][2])/2]:r.getHookPos();let h=0,d=0;if(a.sway){const u=Math.max(wn+a.size[1]/2,1);a.sway.update(t,c[0],c[2],u,r.windAccel[0],r.windAccel[1]),[h,d]=a.sway.offset}if(a.pos=[c[0]+h,c[1]-wn-a.size[1]/2,c[2]+d],(s=r.spec.physics)!=null&&s.loadYaw){const u=r.slewAngle+a._yawOffset,p=((o=e[a.hookedBy])==null?void 0:o.tag)??0;a.yawVel+=(-.15*hl(a.yaw,u)-_y*a.yawVel+vy*Math.max(-1,Math.min(1,p)))*t,a.yaw+=a.yawVel*t}}z(this,St,yf).call(this),z(this,St,Sf).call(this),z(this,St,xf).call(this),this.time+=t}toggleAttach(t){const e=this.cranes[t];if(z(this,St,gc).call(this,t))return this.lastEvent="리깅 작업 중 — 완료까지 대기",{ok:!1,msg:this.lastEvent};const n=this.loads.find(s=>{var o;return s.state==="hooked"&&(s.hookedBy===t||((o=s.tandemCraneIds)==null?void 0:o.includes(t)))});return n?z(this,St,bf).call(this,t,e,n):z(this,St,Mf).call(this,t,e)}tandemLoadShares(t){if(!(t!=null&&t.tandem)||t.liftPoints.length!==2)return null;const n=t.liftPoints.map(o=>Math.max(1e-6,Math.hypot(o[0]-t.cog[0],o[1]-t.cog[1]))).map(o=>1/o),s=n[0]+n[1];return n.map(o=>t.mass*o/s)}tandemAttachPreview(t,e,n=null){if(t===e||!this.cranes[t]||!this.cranes[e])return null;const s=this.loads.find(f=>f.state==="ground"&&f.tandem&&(!n||f.id===n));if(!s)return null;const o=s.liftPoints.map(f=>[s.pos[0]+f[0],s.topY,s.pos[2]+f[1]]),a=[this.cranes[t].getHookPos(),this.cranes[e].getHookPos()],r=f=>a.map((x,y)=>{const v=o[f?1-y:y];return{horiz:Math.hypot(x[0]-v[0],x[2]-v[2]),vert:Math.abs(x[1]-v[1])}}),l=r(!1),c=r(!0),h=f=>f.reduce((x,y)=>x+y.horiz+y.vert,0),d=h(l)<=h(c)?l:c,u=this.tandemLoadShares(s),p=[t,e],m=u.every((f,x)=>f<=this.cranes[p[x]].getCapacity()),_=p.map(f=>s.mass>this.cranes[f].getCapacity()),g=z(this,St,Wa).call(this,s);return{load:s,craneIds:p,offsets:d,shares:u,capacityOk:m,singleCraneLimiter:_,ok:d.every(f=>f.horiz<=Ds&&f.vert<=Sa)&&m&&!g,blockReason:(g==null?void 0:g.reason)??(m?null:"capacity")}}tandemSyncPreview(t){const e=this.loads.find(r=>r.id===t&&r.state==="hooked"&&r.tandemCraneIds);if(!e)return null;const n=e.tandemCraneIds.map(r=>this.cranes[r].getHookPos()),s=Math.hypot(n[0][0]-n[1][0],n[0][2]-n[1][2]),o=Math.hypot(e.liftPoints[0][0]-e.liftPoints[1][0],e.liftPoints[0][1]-e.liftPoints[1][1]),a=Math.abs(s-o);return{loadId:t,craneIds:[...e.tandemCraneIds],actual:s,expected:o,deviation:a,warning:a>uy,hold:a>fy}}attachPreview(t){const e=this.cranes[t];if(!e)return null;const[n,s,o]=e.getHookPos(),a=z(this,St,_c).call(this,e);let r=a;if(!r){let d=py;for(const u of this.loads){if(u.state!=="ground")continue;const p=Math.hypot(u.pos[0]-n,u.pos[2]-o);p<d&&(r=u,d=p)}}if(!r)return null;const l=Math.hypot(r.pos[0]-n,r.pos[2]-o),c=Math.abs(s-r.topY),h=z(this,St,Wa).call(this,r);return{load:r,horiz:l,vert:c,horizOk:l<=Ds,vertOk:c<=Sa,eligible:r===a,blockReason:(h==null?void 0:h.reason)??null,block:h,ok:r===a&&!h}}sweepPreview(t,e=5){const n=this.cranes[t],s=this.loads.find(m=>{var _;return m.state==="hooked"&&(m.hookedBy===t||((_=m.tandemCraneIds)==null?void 0:_.includes(t)))});if(!n||!s)return null;const[o,,a]=n.basePos,r=n.getRadius(),l=Wd(s),c=s.pos[1],h=.1,d=this.loads.filter(m=>m.state==="placed"),u=Math.max(8,Math.round(360/e)),p=[];for(let m=0;m<u;m++){const _=m/u*Math.PI*2,g=[o+r*Math.cos(_),c,a+r*Math.sin(_)];let f=null;for(const x of this.obstacles)if(Hi(g,l,x)){f="obstacle";break}if(!f)for(const x of d){const y=[x.size[0]-h*2,x.size[1]-h*2,x.size[2]-h*2];if(Hi(g,l,{pos:[x.pos[0],x.bottomY+h,x.pos[2]],size:y})){f="placed";break}}if(!f)for(const x of this.trucks){const y=x.obstacle();if(y&&Hi(g,l,y)){f="truck";break}}if(!f){for(const x of this.noFlyZones)if(g[0]>=x.min[0]&&g[0]<=x.max[0]&&g[2]>=x.min[1]&&g[2]<=x.max[1]){f="nfz";break}}p.push({angle:_,x:g[0],z:g[2],hit:f})}return{radius:r,height:c,samples:p}}nfzProximity(t,e=3){const n=this.loads.find(o=>{var a;return o.state==="hooked"&&(o.hookedBy===t||((a=o.tandemCraneIds)==null?void 0:a.includes(t)))});if(!this.cranes[t]||!n||this.noFlyZones.length===0)return null;let s=null;for(const o of this.noFlyZones){const a=Math.max(o.min[0]-n.pos[0],0,n.pos[0]-o.max[0]),r=Math.max(o.min[1]-n.pos[2],0,n.pos[2]-o.max[1]),l=Math.hypot(a,r);(!s||l<s.distance)&&(s={zoneId:o.id,distance:l,min:[...o.min],max:[...o.max],near:l<=e})}return s}drivePathPreview(t,e=0,n=20,s=1){var _,g,f;const o=this.cranes[t],a=this.loads.find(x=>{var y;return x.state==="hooked"&&(x.hookedBy===t||((y=x.tandemCraneIds)==null?void 0:y.includes(t)))});if(!o||!a||o.driveYaw==null)return null;const r=Math.max(.25,s),l=((_=o.spec.planning)==null?void 0:_.driveSpeed)??((g=o.spec.planning)==null?void 0:g.travelSpeed)??1,c=((f=o.spec.planning)==null?void 0:f.steerRate)??.14,h=Math.max(-1,Math.min(1,e))*c/Math.max(l,1e-6);let d=o.basePos[0],u=o.basePos[2],p=o.driveYaw;const m=[{x:d,z:u,heading:p,blocked:z(this,St,Va).call(this,t,d,u)}];for(let x=r;x<=n+1e-9;x+=r)p+=h*r,d+=Math.cos(p)*r,u+=Math.sin(p)*r,m.push({x:d,z:u,heading:p,blocked:z(this,St,Va).call(this,t,d,u)});return{samples:m}}limitRadius(t){var h;const e=this.cranes[t],n=this.loads.find(d=>{var u;return d.state==="hooked"&&(d.hookedBy===t||((u=d.tandemCraneIds)==null?void 0:u.includes(t)))});if(!e||!n||!e.getRadiusRange)return null;const[s,o]=e.getRadiusRange(),a=e.driveVel!=null&&Math.abs(e.driveVel)>.05?((h=e.spec.rating)==null?void 0:h.pickCarryFactor)??.66:1,r=d=>e.capacityAtRadius(d)*a;if(r(s)<n.mass)return null;if(r(o)>=n.mass)return o;let l=s,c=o;for(let d=0;d<48;d++){const u=(l+c)/2;r(u)>=n.mass?l=u:c=u}return l}guidanceTarget(t){var s;const e=this.loads.find(o=>{var a;return o.state==="hooked"&&(o.hookedBy===t||((a=o.tandemCraneIds)==null?void 0:a.includes(t)))});if(e!=null&&e.target)return{kind:"target",id:e.id,pos:[e.target[0],e.targetElev??0,e.target[1]]};const n=(s=this.attachPreview(t))==null?void 0:s.load;return n?{kind:"load",id:n.id,pos:[...n.pos]}:null}liftReadiness(){return this.loads.filter(t=>t.state==="ground"&&t.target).map(t=>{const e=z(this,St,vc).call(this,t);return{id:t.id,pos:[...t.pos],size:[...t.size],ready:e.length===0,unmet:e}})}releasePreview(t){const e=this.loads.find(c=>{var h;return c.state==="hooked"&&(c.hookedBy===t||((h=c.tandemCraneIds)==null?void 0:h.includes(t)))});if(!e)return null;let n=0,s=!1,o=null;e.target&&(o=Math.hypot(e.pos[0]-e.target[0],e.pos[2]-e.target[1]),o<=cl&&(n=e.targetElev,s=!0));const a=e.bottomY-n,r=e.targetYaw==null?null:hl(e.yaw,e.targetYaw),l=r==null||Math.abs(r)<=e.yawTolerance;return{held:e,support:n,bottomGap:a,canRelease:a<=Vd&&(!s||l),onTarget:s,err:o,tol:cl,maxGap:Vd,targetYaw:e.targetYaw,yawError:r,yawTolerance:e.yawTolerance,yawOk:l}}allPlaced(){const t=this.loads.filter(e=>e.target);return t.length>0&&t.every(e=>e.state==="placed")}completionScore(t={}){return ay(this.getState(),t)}siteRulePreview(t){const e=this.cranes[t];if(!e)return null;const n=this.loads.find(l=>{var c;return l.state==="hooked"&&(l.hookedBy===t||((c=l.tandemCraneIds)==null?void 0:c.includes(t)))}),s=zd(e),o=[e.getHookPos(),...s.segments.flatMap(l=>[l.a,l.b])];n&&o.push([...n.pos]);const a=[...o.map(l=>mr(l,this.powerLines)),...s.segments.map(l=>pf(l.a,l.b,this.powerLines))].sort((l,c)=>l.clearance-c.clearance)[0],r=o.map(l=>Fo(l,this.heightLimits)).find(l=>!l.safe)??Fo(o[0],this.heightLimits);return{power:a,height:r,weather:Ha(this.weatherDef,this.time),shift:Ga(this.shifts,this.time)}}stabilityPreview(t){var o;const e=this.cranes[t],n=this.loads.find(a=>{var r;return a.state==="hooked"&&(a.hookedBy===t||((r=a.tandemCraneIds)==null?void 0:r.includes(t)))});if(!e||!n)return null;const s=pr({spec:e.spec,boomLength:e.boomLength??((o=e.spec.geometry)==null?void 0:o.boomLength),radius:e.getRadius(),loadMass:e.loadMass});return s.skipped?null:s.tippingMargin}getState(){return{time:this.time,cranes:this.cranes.map((t,e)=>({...t.getState(),stabilityFactor:this.stabilityPreview(e),limitRadius:this.limitRadius(e)})),loads:this.loads.map(t=>t.getState()),obstacles:this.obstacles.map(t=>({id:t.id,pos:[...t.pos],size:[...t.size]})),noFlyZones:this.noFlyZones.map(t=>({id:t.id,min:[...t.min],max:[...t.max]})),trucks:this.trucks.map(t=>t.snapshot(this.time)),agents:this.agents.map(t=>t.snapshot()),wind:this.windDef?{speed:this.windSpeed,dir:this.windDef.dir??0,maxOperating:this.windDef.maxOperating??null}:null,safety:{collisionIds:[...this.collisionIds],zoneViolation:this.zoneViolation,collisionCount:this.collisionCount,violationCount:this.violationCount,craneClashCount:this.craneClashCount,craneMinClearance:this.craneMinClearance,cranePairs:this.cranePairs.map(t=>({...t})),agentHolds:[...this.agentHolds],agentHoldCount:this.agentHoldCount,agentHoldTime:this.agentHoldTime,tandemHolds:[...this.tandemHolds],tandemHoldTime:this.tandemHoldTime,tandem:this.loads.filter(t=>t.tandemCraneIds).map(t=>this.tandemSyncPreview(t.id)),dangerRadius:this.agentRules.dangerRadius,siteRuleViolations:[...this.siteRuleViolations],siteRuleViolationCount:this.siteRuleViolationCount},operations:{weather:Ha(this.weatherDef,this.time),shift:Ga(this.shifts,this.time)},lastEvent:this.lastEvent}}}St=new WeakSet,pc=function(t){var e;if(!this.windDef)return 0;if(this.windDef.timeline){let n=((e=this.windDef.timeline[0])==null?void 0:e[1])??0;for(const[s,o]of this.windDef.timeline)if(s<=t)n=o;else break;return n}return this.windDef.speed??0},mc=function(t){var o;const e=(o=this.windDef)==null?void 0:o.gust;if(!(e!=null&&e.amp))return 1;const n=e.period??10,s=Math.sin(2*Math.PI*t/n)*Math.sin(2*Math.PI*t/(n*.377));return Math.max(0,1+e.amp*s)},mf=function(){var t;for(let e=0;e<this.cranes.length;e++){const n=this.cranes[e];if(!this.windDef||this.windSpeed<=0||!n.sway){n.windAccel[0]=0,n.windAccel[1]=0;continue}const s=this.loads.find(h=>h.state==="hooked"&&h.hookedBy===e),o=s?s.windArea??Math.max(s.size[0],s.size[2])*s.size[1]:gy,a=((t=n.spec.rating)==null?void 0:t.hookBlockMass)??.35,r=(s?s.mass:0)+a,l=my*this.windSpeed**2*o/(r*1e3),c=this.windDef.dir??0;n.windAccel[0]=l*Math.cos(c),n.windAccel[1]=l*Math.sin(c)}},gf=function(t){if(this.agentHolds.clear(),this.agents.length>0){const e=this.agentRules.dangerRadius;for(const n of this.loads)if(n.state==="hooked"){for(const s of this.agents)if(Math.hypot(n.pos[0]-s.pos[0],n.pos[2]-s.pos[1])<e){this.agentHolds.add(n.hookedBy);break}}}for(const e of this.agentHolds)this._prevHolds.has(e)||(this.agentHoldCount+=1,this.lastEvent=`⛔ 지상 인원·장비 접근: 작업 일시정지 (crane ${e})`);this.agentHoldTime+=t*this.agentHolds.size,this._prevHolds=new Set(this.agentHolds)},_f=function(){var t;for(const e of this.trucks){e.departAt==null&&e.loadIds.length>0&&(e.departAt=e.departAtFrom(this.loads));const n=e.motionAt(this.time);if(e.phase=n.phase,e.pos=n.pos,e.mode==="export"){if(n.phase==="departing"||n.phase==="gone")for(const s of e.loadIds){const o=this.loads.find(r=>r.id===s);if(!o||o.state!=="placed")continue;const a=((t=o.route[o.route.length-1])==null?void 0:t.target)??[o.pos[0],o.pos[2]];o.pos[0]=a[0]+e.heading[0]*n.offset,o.pos[2]=a[1]+e.heading[1]*n.offset,n.phase==="gone"&&(o.removed=!0)}continue}if(n.phase==="entering")for(const s of e.loadIds){const o=this.loads.find(r=>r.id===s),a=e.cargoDock.get(s);o&&a&&o.state==="pending"&&(o.pos[0]=a[0]+e.heading[0]*n.offset,o.pos[2]=a[1]+e.heading[1]*n.offset)}}},gc=function(t){return this.loads.some(e=>{var n;return(e.hookedBy===t||((n=e.tandemCraneIds)==null?void 0:n.includes(t)))&&(e.state==="rigging"||e.state==="derigging")})},vf=function(t){const e=this.cranes[t];return z(this,St,Va).call(this,t,e.basePos[0],e.basePos[2])},Va=function(t,e,n){var l;const o=this.cranes[t].spec.geometry,a=o.bodyRadius??Math.max(o.bodyWidth??2,o.bodyLength??2)/2,r=this.siteBounds;if(r){const c=r.minX??-((r.width??1/0)/2),h=r.maxX??c+(r.width??1/0),d=r.minZ??-((r.depth??1/0)/2),u=r.maxZ??d+(r.depth??1/0);if(e<c+a||e>h-a||n<d+a||n>u-a)return!0}for(const c of this.obstacles)if(Math.abs(e-c.pos[0])<=c.size[0]/2+a&&Math.abs(n-c.pos[2])<=c.size[2]/2+a)return!0;for(const c of this.noFlyZones)if(e>=c.min[0]-a&&e<=c.max[0]+a&&n>=c.min[1]-a&&n<=c.max[1]+a)return!0;for(const c of this.trucks){const h=(l=c.obstacle)==null?void 0:l.call(c);if(h&&Math.abs(e-h.pos[0])<=h.size[0]/2+a&&Math.abs(n-h.pos[2])<=h.size[2]/2+a)return!0}for(let c=0;c<this.cranes.length;c++){if(c===t)continue;const h=this.cranes[c].spec.geometry,d=h.bodyRadius??Math.max(h.bodyWidth??2,h.bodyLength??2)/2,u=this.cranes[c].basePos;if(Math.hypot(e-u[0],n-u[2])<a+d)return!0}for(const c of this.agents)if(c.kind==="vehicle"){const h=c.obstacle();if(Math.abs(e-h.pos[0])<=h.size[0]/2+a&&Math.abs(n-h.pos[2])<=h.size[2]/2+a)return!0}else if(Math.hypot(e-c.pos[0],n-c.pos[1])<a+1)return!0;return!1},xf=function(){if(this.cranePairs=[],this.craneMinClearance=1/0,this.cranes.length<2){this._prevClashing=!1;return}const t=this.cranes.map(n=>zd(n));let e=!1;for(let n=0;n<t.length;n++)for(let s=n+1;s<t.length;s++){const o=uf(t[n],t[s]);this.cranePairs.push({a:n,b:s,...o}),this.craneMinClearance=Math.min(this.craneMinClearance,o.boomDist),o.clash&&(e=!0)}if(e&&!this._prevClashing){this.craneClashCount+=1;const n=this.cranePairs.find(s=>s.clash);this.lastEvent=n.tailContact?`⚠ 크레인 충돌: 테일스윙 접촉 (crane ${n.a}↔${n.b})`:`⚠ 크레인 충돌: 붐 간섭 ${n.boomDist.toFixed(1)}m (crane ${n.a}↔${n.b})`}this._prevClashing=e},yf=function(){const t=this.loads.filter(s=>s.state==="hooked").map(s=>({l:s,size:Wd(s)}));this.collisionIds=[];for(const s of this.obstacles)for(const{l:o,size:a}of t)if(Hi(o.pos,a,s)){this.collisionIds.push(s.id);break}for(const s of this.trucks){const o=s.obstacle();if(o){for(const{l:a,size:r}of t)if(!(s.loadIds.includes(a.id)&&(s.mode==="export"?a.finalLeg:a.stage===0))&&Hi(a.pos,r,o)){this.collisionIds.push(o.id);break}}}for(const s of this.agents){if(s.kind!=="vehicle")continue;const o=s.obstacle();for(const{l:a,size:r}of t)if(Hi(a.pos,r,o)){this.collisionIds.push(o.id);break}}const e=.1;for(const s of this.loads){if(s.state!=="placed"||s.removed)continue;const o=[s.size[0]-e*2,s.size[1]-e*2,s.size[2]-e*2];for(const{l:a,size:r}of t)if(Hi(a.pos,r,{pos:[s.pos[0],s.bottomY+e,s.pos[2]],size:o})){this.collisionIds.push(s.id);break}}this.zoneViolation=t.some(({l:s})=>this.noFlyZones.some(o=>s.pos[0]>=o.min[0]&&s.pos[0]<=o.max[0]&&s.pos[2]>=o.min[1]&&s.pos[2]<=o.max[1]));const n=this.collisionIds.length>0;n&&!this._prevColliding&&(this.collisionCount+=1,this.lastEvent=`⚠ 충돌: ${this.collisionIds.join(", ")}`),this.zoneViolation&&!this._prevViolating&&(this.violationCount+=1,this.lastEvent="⚠ 인양 금지구역 침범"),this._prevColliding=n,this._prevViolating=this.zoneViolation},_c=function(t){const[e,n,s]=t.getHookPos();let o=null,a=1/0;for(const r of this.loads){if(r.state!=="ground")continue;const l=r.pos[0]-e,c=r.pos[2]-s,h=Math.hypot(l,c),d=Math.abs(n-r.topY);h<=Ds&&d<=Sa&&h<a&&(o=r,a=h)}return o},vc=function(t){return t.finalLeg?t.dependsOn.filter(e=>{var n;return((n=this.loads.find(s=>s.id===e))==null?void 0:n.state)!=="placed"}):[]},Wa=function(t){var n;{const s=z(this,St,vc).call(this,t);if(s.length>0)return{reason:"precedence",unmet:s}}if(this.windDef&&this.windSpeed>this.windLimitFor(t))return{reason:"wind",limit:this.windLimitFor(t)};if((n=t.sling)!=null&&n.blocked)return{reason:"sling",sling:{...t.sling}};const e=Ha(this.weatherDef,this.time);return e.blocked?{reason:"weather",weather:e}:Ga(this.shifts,this.time).available?null:{reason:"shift"}},Mf=function(t,e){for(const o of this.loads.filter(a=>a.state==="ground"&&a.tandem))if(o.liftPoints.some(r=>{const l=e.getHookPos();return Math.hypot(l[0]-o.pos[0]-r[0],l[2]-o.pos[2]-r[1])<=Ds&&Math.abs(l[1]-o.topY)<=Sa})){for(let r=0;r<this.cranes.length;r++){const l=this.tandemAttachPreview(t,r,o.id);if(l!=null&&l.ok)return z(this,St,yc).call(this,l)}return this.lastEvent="탠덤 픽업 불가: 두 크레인 후크를 양단 인양점에 정렬하세요",{ok:!1,msg:this.lastEvent}}const n=z(this,St,_c).call(this,e);if(!n)return this.lastEvent="픽업 실패: 근처에 부재 없음 (후크를 부재 위로)",{ok:!1,msg:this.lastEvent};if(n.tandem){for(let o=0;o<this.cranes.length;o++){const a=this.tandemAttachPreview(t,o,n.id);if(a!=null&&a.ok)return z(this,St,yc).call(this,a)}return this.lastEvent="탠덤 픽업 불가: 두 크레인 후크를 양단 인양점에 정렬하세요",{ok:!1,msg:this.lastEvent}}const s=z(this,St,Wa).call(this,n);return(s==null?void 0:s.reason)==="precedence"?(this.lastEvent=`픽업 불가: 선행 부재 미완 (${s.unmet.join(", ")})`,{ok:!1,msg:this.lastEvent}):(s==null?void 0:s.reason)==="wind"?(this.lastEvent=`픽업 불가: 풍속 초과 (${this.windSpeed.toFixed(1)} > ${s.limit} m/s)`,{ok:!1,msg:this.lastEvent}):(s==null?void 0:s.reason)==="sling"?(this.lastEvent=`픽업 불가: 슬링 각도 ${(s.sling.angle*180/Math.PI).toFixed(0)}° < ${(s.sling.minAngle*180/Math.PI).toFixed(0)}°`,{ok:!1,msg:this.lastEvent}):(s==null?void 0:s.reason)==="weather"?(this.lastEvent=`픽업 불가: 기상 작업중지 (${s.weather.reasons.join(", ")})`,{ok:!1,msg:this.lastEvent}):(s==null?void 0:s.reason)==="shift"?(this.lastEvent="픽업 불가: 작업 교대시간 외",{ok:!1,msg:this.lastEvent}):n.rigTime>0?(n.state="rigging",n.hookedBy=t,n.timer=n.rigTime,this.lastEvent=`줄걸이 시작: ${n.name} (${n.rigTime}s)`,{ok:!0,msg:this.lastEvent,pending:!0}):z(this,St,xc).call(this,t,e,n)},xc=function(t,e,n){var s;return n.state="hooked",n.hookedBy=t,n.timer=0,e.loadMass=n.mass,n._yawOffset=n.yaw-e.slewAngle,n.yawVel=0,n.sway=(s=e.spec.physics)!=null&&s.doublePendulum?new nh({damping:xy}):null,e.setHookHeight(n.topY+wn),e.minHookY=n.size[1]+wn,this.lastEvent=`픽업: ${n.name} (${n.mass}t)`,{ok:!0,msg:this.lastEvent}},yc=function(t){const{load:e,craneIds:n,shares:s}=t;return e.state="hooked",e.hookedBy=n[0],e.tandemCraneIds=[...n],n.forEach((o,a)=>{this.cranes[o].loadMass=s[a],this.cranes[o].minHookY=e.size[1]+wn}),this.lastEvent=`탠덤 픽업: ${e.name} (${s.map(o=>o.toFixed(1)).join("+")}t)`,{ok:!0,msg:this.lastEvent,tandem:!0,shares:s}},bf=function(t,e,n){const s=this.releasePreview(t);return s.canRelease?n.derigTime>0?(n.state="derigging",n.timer=n.derigTime,this.lastEvent=`해체 시작: ${n.name} (${n.derigTime}s)`,{ok:!0,msg:this.lastEvent,pending:!0}):z(this,St,Mc).call(this,e,n):s.onTarget&&!s.yawOk?(this.lastEvent=`해제 불가: 자세 오차 ${(Math.abs(s.yawError)*180/Math.PI).toFixed(1)}° (허용 ${(s.yawTolerance*180/Math.PI).toFixed(0)}°)`,{ok:!1,msg:this.lastEvent}):(this.lastEvent=`해제 불가: 공중 해제 금지 (지지면과 ${s.bottomGap.toFixed(1)}m)`,{ok:!1,msg:this.lastEvent})},Mc=function(t,e){if(e.tandemCraneIds){for(const n of e.tandemCraneIds)this.cranes[n].loadMass=0,this.cranes[n].minHookY=0;e.tandemCraneIds=null}if(e.hookedBy=null,e.timer=0,t.loadMass=0,t.minHookY=0,e.sway=null,e.yawVel=0,e.target){const n=e.pos[0]-e.target[0],s=e.pos[2]-e.target[1],o=Math.hypot(n,s);if(o<=cl){const a=e.targetYaw==null?0:hl(e.yaw,e.targetYaw);return e.placementError=o,e.placementYawError=a,e.pos[0]=e.target[0],e.pos[2]=e.target[1],e.pos[1]=e.targetElev+e.size[1]/2,e.yaw=e.targetYaw??0,e.finalLeg?(e.state="placed",e.stageChangedAt=this.time,this.lastEvent=`🎯 최종 안착: ${e.name} (오차 ${o.toFixed(2)}m${e.targetElev>0?`, EL+${e.targetElev}m`:""})`,{ok:!0,msg:this.lastEvent,placed:!0,error:o}):(e.stage===0&&(e.yardedAt=this.time),e.advanceStage(),e.state="ground",e.stageChangedAt=this.time,this.lastEvent=`📦 야적 완료: ${e.name} (다음: 건립 단계)`,{ok:!0,msg:this.lastEvent,placed:!1,staged:!0,error:o})}return e.pos[1]=e.size[1]/2,e.state="ground",this.lastEvent=`안착(목표 이탈 ${o.toFixed(1)}m): ${e.name}`,{ok:!0,msg:this.lastEvent,placed:!1,error:o}}return e.pos[1]=e.size[1]/2,e.state="ground",this.lastEvent=`안착: ${e.name}`,{ok:!0,msg:this.lastEvent}},Sf=function(){this.siteRuleViolations=[];for(let e=0;e<this.cranes.length;e++){const n=this.siteRulePreview(e);n&&!n.power.safe&&this.siteRuleViolations.push(`power:${n.power.lineId}`),n&&!n.height.safe&&this.siteRuleViolations.push(`height:${n.height.zoneId}`)}const t=this.siteRuleViolations.length>0;t&&!this._prevSiteRuleViolation&&(this.siteRuleViolationCount+=1,this.lastEvent=`⚠ 현장 제한 위반: ${this.siteRuleViolations.join(", ")}`),this._prevSiteRuleViolation=t};function hl(i,t){let e=i-t;for(;e>Math.PI;)e-=Math.PI*2;for(;e<-Math.PI;)e+=Math.PI*2;return e}function Wd(i){if(!i.yaw)return i.size;const t=Math.abs(Math.cos(i.yaw)),e=Math.abs(Math.sin(i.yaw)),[n,s,o]=i.size;return[n*t+o*e,s,n*e+o*t]}function Hi(i,t,e){const[n,s,o]=i,[a,r,l]=t,[c,h,d]=e.pos,[u,p,m]=e.size,_=Math.abs(n-c)<=(a+u)/2,g=Math.abs(o-d)<=(l+m)/2,f=s-r/2<=h+p&&s+r/2>=h;return _&&g&&f}const tr=[4882357,7183979,11569743,9072048,11559519],My=new Lt({color:2895667,roughness:.7}),by=new Ve({color:2764081}),Sy=.4,dl=i=>Math.max(0,Math.min(1,i));function ih(i){let t=0;for(let e=1;e<3;e++)i[e]>i[t]&&(t=e);return t}function sh(i,t){t===1?i.rotation.z=Math.PI/2:t===2&&(i.rotation.y=-Math.PI/2)}function ks(i,t,e,n){const s=new st(new ie(i,t,e),n);return s.castShadow=!0,s.receiveShadow=!0,s}function wy(i,t){const e=ih(i),n=i[e],s=[0,1,2].filter(p=>p!==e),o=i[s[0]],a=i[s[1]],r=Math.max(.04,Math.min(o*.14,.16)),l=Math.max(.04,Math.min(a*.16,.14)),c=new Nt,h=ks(n,r,a,t);h.position.y=o/2-r/2;const d=ks(n,r,a,t);d.position.y=-(o/2-r/2);const u=ks(n,o-r*2,l,t);return c.add(h,d,u),sh(c,e),c}function Ey(i,t){const e=ih(i),n=i[e],s=[0,1,2].filter(l=>l!==e),o=Math.min(i[s[0]],i[s[1]])/2*.92,a=new Nt,r=new st(new ve(o,o,n*.98,14),t);r.rotation.z=Math.PI/2,r.castShadow=!0,a.add(r);for(const l of[-1,1]){const c=new st(new ve(o*1.18,o*1.18,.07,14),t);c.rotation.z=Math.PI/2,c.position.x=l*(n/2-.05),c.castShadow=!0,a.add(c)}return sh(a,e),a}function Ty(i,t){const e=ih(i),n=i[e],s=[0,1,2].filter(c=>c!==e),o=Math.min(i[s[0]],i[s[1]])/2*.8,a=Math.max(o/3,.03),r=new Nt,l=[[0,0]];for(let c=0;c<6;c++){const h=c/6*Math.PI*2;l.push([Math.cos(h)*o*.62,Math.sin(h)*o*.62])}for(const[c,h]of l){const d=new st(new ve(a,a,n,6),t);d.rotation.z=Math.PI/2,d.position.set(0,c,h),d.castShadow=!0,r.add(d)}for(const c of[-n*.3,n*.3]){const h=new st(new ve(o*1.02,o*1.02,.12,10),t);h.rotation.z=Math.PI/2,h.position.x=c,r.add(h)}return sh(r,e),r}function Ay(i,t){const e=Math.min(i[0],i[2])/2*.96,n=i[1],s=new Nt,o=new st(new ve(e,e,n*.86,18),t);o.position.y=-n*.07,o.castShadow=!0,o.receiveShadow=!0,s.add(o);const a=new st(new ss(e,18,10,0,Math.PI*2,0,Math.PI/2),t);a.position.y=n*.36,a.castShadow=!0,s.add(a);const r=new st(new dr(e*1.01,.04,6,20),t);return r.rotation.x=Math.PI/2,r.position.y=n*.1,s.add(r),s}function Ry(i,t){const[e,n,s]=i,o=new Nt,a=ks(e*.92,n*.92,s*.92,t);o.add(a);for(const l of[-1,1])for(const c of[-1,1]){const h=ks(.12,n,.12,t);h.position.set(l*(e/2-.06),0,c*(s/2-.06)),o.add(h)}const r=new is(new lc(new ie(e,n,s)),by);return o.add(r),o}function Cy(i,t){switch(i.shape){case"h-beam":return wy(i.size,t);case"pipe":return Ey(i.size,t);case"rebar":return Ty(i.size,t);case"tank":return Ay(i.size,t);case"module":return Ry(i.size,t);default:return ks(...i.size,t)}}var Yn,wf,Ef,Tf,Af;class Py{constructor(t){Le(this,Yn);this.root=new Nt,this.meshes=new Map,this.materials=new Map,this.slings=new Map,this.riggers=new Map,this.shadows=new Map,this._prevState=new Map,this._ease=new Map,t.forEach((e,n)=>{const s=e.shape==="h-beam"||e.shape==="rebar",o=new Lt({color:tr[n%tr.length],roughness:s?.45:.7,metalness:s?.45:.1});o.emissive=new Ot(0);const a=Cy(e,o);a.userData.visualEdit={kind:"load",id:e.id},this.meshes.set(e.id,a),this.materials.set(e.id,o),this.root.add(a);const r=Array.from({length:4},()=>{const d=ts(My.clone(),.022);return d.visible=!1,this.root.add(d),d});this.slings.set(e.id,r);const l=new Nt;l.add(Ba(n*7+1),Ba(n*7+2)),l.children[0].position.set(e.size[0]/2+.7,0,.4),l.children[1].position.set(-(e.size[0]/2+.7),0,-.4),l.visible=!1,this.root.add(l);const c=Ba(n*7+5);c.visible=!1,this.root.add(c),this.riggers.set(e.id,{crew:l,signal:c});const h=of(Math.max(e.size[0],e.size[2])/2+.5);this.root.add(h),this.shadows.set(e.id,h),this._prevState.set(e.id,e.state)})}update(t,e=[],n=[],s=null){const o=new Set(e.filter(a=>a.visible).flatMap(a=>a.loadIds));for(const a of t){const r=this.meshes.get(a.id);if(!r)continue;const l=this._prevState.get(a.id),c=(l==="hooked"||l==="derigging")&&(a.state==="ground"||a.state==="placed");s!=null&&c&&this._ease.set(a.id,{from:[r.position.x,r.position.y,r.position.z],start:s}),this._prevState.set(a.id,a.state);let h=a.pos[0],d=a.pos[1],u=a.pos[2];const p=this._ease.get(a.id);if(p&&s!=null){const _=dl((s-p.start)/Sy),g=_*(2-_);h=p.from[0]+(a.pos[0]-p.from[0])*g,d=p.from[1]+(a.pos[1]-p.from[1])*g,u=p.from[2]+(a.pos[2]-p.from[2])*g,_>=1&&this._ease.delete(a.id)}r.position.set(h,d,u),r.rotation.y=-(a.yaw??0),r.visible=(a.state!=="pending"||o.has(a.id))&&!a.removed;const m=a.state==="hooked"?2241297:a.state==="rigging"||a.state==="derigging"?5583633:0;this.materials.get(a.id).emissive.setHex(m),z(this,Yn,Ef).call(this,a,r,n),z(this,Yn,Tf).call(this,a,s),z(this,Yn,Af).call(this,a,r)}}}Yn=new WeakSet,wf=function(t){if(t.state==="hooked")return 4;if(t.state==="rigging"){const e=t.rigTime??0;return e>0?Math.ceil(4*dl(1-t.rigRemain/e)):4}if(t.state==="derigging"){const e=t.derigTime??0;return e>0?Math.ceil(4*dl(t.rigRemain/e)):0}return 0},Ef=function(t,e,n){var m,_;const s=this.slings.get(t.id),o=z(this,Yn,wf).call(this,t);if(!(o>0&&t.hookedBy!=null&&e.visible)){for(const g of s)g.visible=!1;return}const r=n[t.hookedBy],l=(m=t.sling)!=null&&m.blocked?14699060:(_=t.sling)!=null&&_.warning?14722362:2895667,c=e.position.y+t.size[1]/2,h=(r==null?void 0:r.hookPos)??[e.position.x,c+wn,e.position.z],d=Math.cos(t.yaw??0),u=Math.sin(t.yaw??0),p=[[-t.size[0]/2,-t.size[2]/2],[t.size[0]/2,-t.size[2]/2],[t.size[0]/2,t.size[2]/2],[-t.size[0]/2,t.size[2]/2]];s.forEach((g,f)=>{if(f>=o){g.visible=!1;return}const[x,y]=p[f],v=e.position.x+x*d-y*u,w=e.position.z+x*u+y*d;g.visible=!0,g.material.color.setHex(l),Qi(g,h,[v,c,w])})},Tf=function(t,e){const n=this.riggers.get(t.id),s=t.state==="rigging"||t.state==="derigging",o=t.pos[1]-t.size[1]/2<2;n.crew.visible=s&&o,n.crew.visible&&(n.crew.position.set(t.pos[0],0,t.pos[2]),n.crew.rotation.y=-(t.yaw??0),e!=null&&n.crew.children.forEach((a,r)=>{a.scale.y=1-.06*Math.abs(Math.sin(e*1.7+r*1.3))})),n.signal.visible=t.state==="derigging",n.signal.visible&&n.signal.position.set(t.pos[0]+2.2,0,t.pos[2]+2.2)},Af=function(t,e){const n=this.shadows.get(t.id),s=t.pos[1]-t.size[1]/2,o=t.state==="hooked"||t.state==="rigging"||t.state==="derigging",a=(t.state==="ground"||t.state==="placed")&&s<.5,r=e.visible&&t.state!=="pending"&&(o||a);if(n.visible=r,!r)return;n.position.set(e.position.x,0,e.position.z);const l=Math.max(.3,1/(1+s*.1));n.scale.set(l,1,l)};const $d=(i,t,e)=>Math.max(t,Math.min(e,i));function Xd(i,{distance:t,duration:e,maxAcceleration:n=.3}={}){const s=Math.max(0,Number(t)||0),o=Math.max(1e-6,Number(e)||0),a=Math.max(1e-6,Number(n)||0),r=$d(Number(i)||0,0,o),l=o*o-4*s/a,c=l>=0?(o-Math.sqrt(l))/2:o/2,h=s/Math.max(1e-9,c*(o-c)),d=h*c,u=o-c;let p,m,_,g;if(r<c)p=.5*h*r*r,m=h*r,_=h,g="accelerating";else if(r<u)p=.5*h*c*c+d*(r-c),m=d,_=0,g="cruising";else if(r<o){const f=o-r;p=s-.5*h*f*f,m=h*f,_=-h,g="braking"}else p=s,m=0,_=0,g="stopped";return{position:$d(p,0,s),velocity:m,acceleration:_,phase:g,maxSpeed:d,accelTime:c}}const oi={entryDistance:26,entryDuration:30,exitDuration:30,maxAcceleration:.3,bedHeight:1.35,bodyWidth:3.2,bodyHeight:2.9};var Dn,bc,Cs;class gr{constructor(t){Le(this,Dn);this.id=t.id,this.mode=t.mode==="export"?"export":"import",this.dockPos=[...t.dockPos];const e=t.heading??[0,1],n=Math.hypot(e[0],e[1])||1;this.heading=[e[0]/n,e[1]/n],this.size=t.size?[...t.size]:[oi.bodyWidth,oi.bodyHeight,12],this.bedHeight=t.bedHeight??oi.bedHeight,this.arriveTime=t.arriveTime??0,this.entryDistance=t.entryDistance??oi.entryDistance,this.entryDuration=t.entryDuration??oi.entryDuration,this.exitDuration=t.exitDuration??oi.exitDuration,this.maxAcceleration=t.maxAcceleration??oi.maxAcceleration,this.loadIds=[...t.loads??[]],this.departAt=null,this.cargoDock=new Map,this.phase="scheduled",this.pos=z(this,Dn,bc).call(this,-this.entryDistance)}motionAt(t,e=this.departAt){const n=this.arriveTime-this.entryDuration;if(t<n)return z(this,Dn,Cs).call(this,"scheduled",-this.entryDistance,0,0,0,!1);if(t<this.arriveTime){const s=Xd(t-n,{distance:this.entryDistance,duration:this.entryDuration,maxAcceleration:this.maxAcceleration});return z(this,Dn,Cs).call(this,"entering",-(this.entryDistance-s.position),s.velocity,s.acceleration,s.position,!0)}if(e==null||t<e)return z(this,Dn,Cs).call(this,"docked",0,0,0,this.entryDistance,!0);if(t<e+this.exitDuration){const s=Xd(t-e,{distance:this.entryDistance,duration:this.exitDuration,maxAcceleration:this.maxAcceleration});return z(this,Dn,Cs).call(this,"departing",-s.position,-s.velocity,-s.acceleration,this.entryDistance-s.position,!0)}return z(this,Dn,Cs).call(this,"gone",-this.entryDistance,0,0,0,!1)}obstacle(){if(this.phase==="scheduled"||this.phase==="gone")return null;const t=Math.abs(this.heading[1])>=Math.abs(this.heading[0]),[e,n,s]=this.size;return{id:`truck:${this.id}`,pos:[this.pos[0],0,this.pos[1]],size:t?[e,n,s]:[s,n,e]}}dockZone(t=0){const e=Math.abs(this.heading[1])>=Math.abs(this.heading[0]),[n,,s]=this.size,o=(e?n:s)/2+t,a=(e?s:n)/2+t;return{id:`truck:${this.id}`,min:[this.dockPos[0]-o,this.dockPos[1]-a],max:[this.dockPos[0]+o,this.dockPos[1]+a]}}departAtFrom(t){const e=this.loadIds.map(n=>t.find(s=>s.id===n)).filter(Boolean);return e.length===0?null:this.mode==="export"?e.every(n=>n.state==="placed")?Math.max(...e.map(n=>n.stageChangedAt??0)):null:e.every(n=>n.stage>0||n.state==="placed")?Math.max(...e.map(n=>n.yardedAt??n.stageChangedAt??0)):null}snapshot(t,e=this.departAt){const n=this.motionAt(t,e);return{id:this.id,mode:this.mode,phase:n.phase,visible:n.visible,pos:[...n.pos],dockPos:[...this.dockPos],heading:[...this.heading],size:[...this.size],bedHeight:this.bedHeight,offset:n.offset,velocity:n.velocity,vehicleAccel:n.vehicleAccel,wheelDistance:n.wheelDistance,arriveTime:this.arriveTime,departAt:e,loadIds:[...this.loadIds]}}}Dn=new WeakSet,bc=function(t){return[this.dockPos[0]+this.heading[0]*t,this.dockPos[1]+this.heading[1]*t]},Cs=function(t,e,n,s,o,a){return{phase:t,offset:e,velocity:n,vehicleAccel:s,wheelDistance:o,visible:a,pos:z(this,Dn,bc).call(this,e)}};function _r(i){var n;if(!((n=i.loads)!=null&&n.some(s=>{var o;return(((o=s.route)==null?void 0:o.length)??0)>1})))return[];const t=new Map;for(const s of i.loads){const o=s.arriveTime??0;t.has(o)||t.set(o,[]),t.get(o).push(s)}const e=[];for(const[s,o]of t){const a=o.map(d=>d.pos[0]),r=Math.min(...o.map(d=>d.pos[2]-d.size[2]/2)),l=Math.max(...o.map(d=>d.pos[2]+d.size[2]/2)),c=(r+l)/2,h=Math.max(7,l-r+1);e.push({id:`truck-${s}`,dockPos:[a.reduce((d,u)=>d+u,0)/a.length,c],heading:[0,c>=0?-1:1],size:[oi.bodyWidth,oi.bodyHeight,h],arriveTime:s,loads:o.map(d=>d.id)})}return e}const ii={targetFill:new Oe({color:3523178,transparent:!0,opacity:.22,side:Re,depthWrite:!1}),targetRing:new Oe({color:3523178,side:Re}),targetDone:new Oe({color:4882357,transparent:!0,opacity:.35,side:Re,depthWrite:!1}),obstacle:new Lt({color:7304832,roughness:.85}),obstacleEdge:new Ve({color:3817286}),nfzFill:new Oe({color:14172202,transparent:!0,opacity:.16,side:Re,depthWrite:!1}),nfzEdge:new Ve({color:14172202})},ul=1.5,Ly=.55,Iy=.08;var Qs,Rf,Cf;class Dy{constructor(t,e={}){Le(this,Qs);this.root=new Nt,this.targets=new Map,this.obstacles=new Map,this.noFlyZones=new Map,this.trucks=[],z(this,Qs,Cf).call(this,e);for(const n of t.loads){if(!n.target)continue;const[s,o]=n.target,a=new st(new no(ul,40),ii.targetFill);a.userData.visualEdit={kind:"target",id:n.id},a.rotation.x=-Math.PI/2,a.position.set(s,.03,o),this.root.add(a);const r=new st(new Ai(ul-.12,ul,48),ii.targetRing);r.userData.visualEdit={kind:"target",id:n.id},r.rotation.x=-Math.PI/2,r.position.set(s,.04,o),this.root.add(r),this.targets.set(n.id,{fill:a,ring:r})}for(const n of t.obstacles??[]){const s=z(this,Qs,Rf).call(this,n,e);s.userData.visualEdit={kind:"obstacle",id:n.id},this.obstacles.set(n.id,s),this.root.add(s)}for(const n of t.noFlyZones??[]){const s=n.max[0]-n.min[0],o=n.max[1]-n.min[1],a=(n.min[0]+n.max[0])/2,r=(n.min[1]+n.max[1])/2,l=new st(new qn(s,o),ii.nfzFill);l.rotation.x=-Math.PI/2,l.position.set(a,.02,r),l.userData.visualEdit={kind:"noFlyZone",id:n.id},this.root.add(l);const c=new Zu(new Jt().setFromPoints([new L(-s/2,.05,-o/2),new L(s/2,.05,-o/2),new L(s/2,.05,o/2),new L(-s/2,.05,o/2)]),ii.nfzEdge);c.position.set(a,0,r),this.root.add(c),this.noFlyZones.set(n.id,{fill:l,border:c})}for(const n of e.powerLines??[]){const s=new Jt().setFromPoints([new L(...n.a),new L(...n.b)]);this.root.add(new ai(s,new Ve({color:15910987})));for(const o of[n.a,n.b]){const a=new st(new ve(.12,.18,Math.max(o[1],1),8),new Lt({color:6313796}));a.position.set(o[0],o[1]/2,o[2]),this.root.add(a)}}for(const n of e.heightLimits??[]){const s=n.max[0]-n.min[0],o=n.max[1]-n.min[1],a=new st(new qn(s,o),new Oe({color:14722362,transparent:!0,opacity:.12,side:Re,depthWrite:!1}));a.rotation.x=-Math.PI/2,a.position.set((n.min[0]+n.max[0])/2,n.maxHeight,(n.min[1]+n.max[1])/2),this.root.add(a)}}update(t){var e;for(const n of t.loads){const s=this.targets.get(n.id);if(!s)continue;const o=(e=n.route)==null?void 0:e[n.stage],a=(o==null?void 0:o.target)??n.target,r=(o==null?void 0:o.elev)??n.targetElev??0;a&&(s.fill.position.set(a[0],r+.03,a[1]),s.ring.position.set(a[0],r+.04,a[1])),n.state==="placed"&&s.fill.material!==ii.targetDone&&(s.fill.material=ii.targetDone,s.ring.material=ii.targetDone)}for(const n of this.trucks){const s=n.truck.motionAt(t.time,n.truck.departAtFrom(t.loads));n.root.visible=s.visible,n.root.position.set(s.pos[0],0,s.pos[1]);const o=n.travelDirection*s.vehicleAccel;n.chassis.rotation.x=-o*Iy;for(const a of n.wheels)a.rotation.x=s.wheelDistance/Ly*n.travelDirection}}}Qs=new WeakSet,Rf=function(t,e){var h;const n=((h=(e.obstacles??[]).find(d=>d.id===t.id))==null?void 0:h.kind)??null,[s,o,a]=t.size,r=new Nt;if(r.position.set(t.pos[0],0,t.pos[2]),n==="office"){const d=new Lt({color:14210250,roughness:.7}),u=new st(new ie(s,o,a),d);u.position.y=o/2,u.castShadow=!0,u.receiveShadow=!0,r.add(u);const p=new Lt({color:2573662,roughness:.2,metalness:.4,emissive:924970}),m=Math.max(1,Math.round(o/3));for(let g=0;g<m;g++){const f=new st(new ie(s*.94,.8,a+.06),p);f.position.y=(g+.62)*(o/m),r.add(f)}const _=new st(new ie(s+.3,.18,a+.3),new Lt({color:7304832,roughness:.8}));return _.position.y=o+.09,r.add(_),r}const l=new st(new ie(s,o,a),ii.obstacle);l.position.y=o/2,l.castShadow=!0,l.receiveShadow=!0,r.add(l);const c=new is(new lc(l.geometry),ii.obstacleEdge);if(c.position.y=o/2,r.add(c),n==="structure"){const d=new st(new ie(s+.12,.15,a+.12),new Lt({color:6120299,roughness:.9}));d.position.y=o+.075,r.add(d)}return r},Cf=function(t){const e=t.trucks??_r(t);if(e.length===0)return;const n=new Nt,s=new st(new ie(18,.15,30),new Lt({color:7433055,roughness:.95}));s.position.set(-21,.075,0),s.receiveShadow=!0,n.add(s);const o=new Oe({color:14727247});for(const h of[-29.5,-21,-12.5]){const d=new st(new ie(.12,.02,30),o);d.position.set(h,.17,0),n.add(d)}this.root.add(n);const a=new Lt({color:3235718,roughness:.55}),r=new Lt({color:10331304,metalness:.35}),l=new Lt({color:1513755,roughness:.9});for(const h of e){const d=new gr(h),u=d.size[2],p=d.heading[1]>=0?1:-1,m=new Nt,_=new Nt,g=[],f=new st(new ie(d.size[0],1.15,u),r);f.position.set(0,.78,0);const x=new st(new ie(d.size[0],3,3.5),a);x.position.set(0,1.5,p*(u/2+2)),_.add(f,x),m.add(_);for(const v of[p*(u/2+1.2),-u/3,u/3])for(const w of[-1.65,1.65]){const E=new st(new ve(.55,.55,.35,16),l);E.rotation.z=Math.PI/2,E.position.set(w,.55,v),m.add(E),g.push(E)}const y=d.motionAt(0,null);m.position.set(y.pos[0],0,y.pos[1]),m.visible=y.visible,this.root.add(m),this.trucks.push({truck:d,root:m,loadIds:[...d.loadIds],arriveTime:d.arriveTime,bayX:d.dockPos[0],bayZ:d.dockPos[1],travelDirection:p,chassis:_,wheels:g})}const c=new is(new lc(new ie(10,.12,14)),new Ve({color:15779915}));c.position.set(16,.08,0),this.root.add(c)};const qd=1.1,Uy=18,wa=26,Fy=.22;var Ri,Pf,$a;class Ny{constructor(t){Le(this,Ri);this.scene=t,this.pool=[],this.active=[],this._prevLoadState=new Map,this._driveQuantum=new Map;for(let e=0;e<Uy;e++)this.pool.push(z(this,Ri,Pf).call(this))}update(t){const e=t.time;for(const n of t.loads??[]){const s=this._prevLoadState.get(n.id);if(s&&s!==n.state){const o=[n.pos[0],Math.max(n.pos[1]-n.size[1]/2,.05),n.pos[2]];(s==="hooked"||s==="derigging")&&(n.state==="ground"||n.state==="placed")?z(this,Ri,$a).call(this,o,e,1.3):s==="rigging"&&n.state==="hooked"&&z(this,Ri,$a).call(this,[o[0],.05,o[2]],e,.6)}this._prevLoadState.set(n.id,n.state)}(t.cranes??[]).forEach((n,s)=>{var c,h;const o=((c=n.extra)==null?void 0:c.driveVel)??0;if(Math.abs(o)<.25)return;const a=Math.floor(e/Fy);if(this._driveQuantum.get(s)===a)return;this._driveQuantum.set(s,a);const r=((h=n.extra)==null?void 0:h.driveYaw)??0,l=-Math.sign(o)*3.2;z(this,Ri,$a).call(this,[n.basePos[0]+Math.cos(r)*l,.05,n.basePos[2]+Math.sin(r)*l],e,.5+Math.min(Math.abs(o)*.3,.5))});for(let n=this.active.length-1;n>=0;n--){const s=this.active[n],o=e-s.born;if(o<0||o>qd){s.points.visible=!1,this.active.splice(n,1),this.pool.push(s);continue}const a=o/qd,r=(.6+a*2.2)*s.strength,l=s.points.geometry.getAttribute("position");for(let c=0;c<wa;c++)l.array[c*3]=s.base[0]+s.dirs[c*3]*r,l.array[c*3+1]=s.base[1]+s.dirs[c*3+1]*r*.8,l.array[c*3+2]=s.base[2]+s.dirs[c*3+2]*r;l.needsUpdate=!0,s.points.material.opacity=.42*(1-a)*(1-a),s.points.material.size=.6+a*1.3}}dispose(){for(const t of[...this.active,...this.pool])this.scene.remove(t.points);this.active=[],this.pool=[]}}Ri=new WeakSet,Pf=function(){const t=new Jt;t.setAttribute("position",new Me(new Float32Array(wa*3),3));const e=new Jc({color:12168078,size:.8,transparent:!0,opacity:0,depthWrite:!1,sizeAttenuation:!0}),n=new Ku(t,e);return n.visible=!1,n.frustumCulled=!1,this.scene.add(n),{points:n,born:0,base:[0,0,0],dirs:new Float32Array(wa*3),strength:1}},$a=function(t,e,n=1){const s=this.pool.pop()??this.active.shift();if(!s)return;s.born=e,s.base=[...t],s.strength=n;const o=fr(Math.floor(e*997)+Math.floor(t[0]*13+t[2]*7));for(let a=0;a<wa;a++){const r=o()*Math.PI*2,l=.3+o()*.7;s.dirs[a*3]=Math.cos(r)*l,s.dirs[a*3+1]=.15+o()*.55,s.dirs[a*3+2]=Math.sin(r)*l}s.points.visible=!0,this.active.push(s)};const Gi={body:new Lt({color:14252824,roughness:.55,metalness:.2}),dark:new Lt({color:2829875,roughness:.85}),mast:new Lt({color:5527903,roughness:.5,metalness:.4}),fork:new Lt({color:1908514,roughness:.4,metalness:.5}),beacon:new Oe({color:16756768})};function _o(i,t,e,n){const s=new st(new ie(i,t,e),n);return s.castShadow=!0,s}function Oy(){const i=new Nt,t=_o(2.4,1,1.7,Gi.body);t.position.set(-.5,.75,0),i.add(t);const e=_o(1.1,1.1,1.5,Gi.dark);e.position.set(-.5,1.75,0),i.add(e);const n=_o(.7,.8,1.5,Gi.dark);n.position.set(-1.7,.7,0),i.add(n);for(const o of[-.45,.45]){const a=_o(.12,2.1,.12,Gi.mast);a.position.set(.85,1.15,o),i.add(a)}for(const o of[-.35,.35]){const a=_o(1,.07,.16,Gi.fork);a.position.set(1.55,.18,o),i.add(a)}for(const[o,a]of[[.45,-.8],[.45,.8],[-1.25,-.8],[-1.25,.8]]){const r=new st(new ve(.34,.34,.28,12),Gi.dark);r.rotation.x=Math.PI/2,r.position.set(o,.34,a),r.castShadow=!0,i.add(r)}const s=new st(new ss(.09,8,8),Gi.beacon.clone());return s.position.set(-.5,2.42,0),i.add(s),i.userData.beacon=s,i}class ky{constructor(t){this.root=new Nt,this.figures=new Map,t.forEach((e,n)=>{const s=e.kind==="vehicle"?Oy():Ba(1e3+n*13);e.kind==="worker"&&(s.rotation.y=0);const o=of(e.kind==="vehicle"?2.2:.7);s.add(o),this.figures.set(e.id,{group:s,kind:e.kind}),this.root.add(s)})}update(t=[],e=null){t.forEach((n,s)=>{const o=this.figures.get(n.id);if(o)if(o.group.position.set(n.pos[0],0,n.pos[1]),o.group.rotation.y=-Math.atan2(n.heading[1],n.heading[0]),o.kind==="worker"){const a=n.moving&&e!=null?1+.045*Math.sin(e*9+s*2.1):1;o.group.scale.y=a}else e!=null&&(o.group.userData.beacon.visible=e%.9<.5)})}}const fl=["orbit","follow","cab","hook"],zy={orbit:"궤도",follow:"추적",cab:"운전실",hook:"후크"};class By{constructor(t,e){this.camera=t,this.controls=e,this.mode="orbit",this._look=new L,this._desired=new L,this._lookTarget=new L,this._snapped=!1}get label(){return zy[this.mode]}cycle(){return this.mode=fl[(fl.indexOf(this.mode)+1)%fl.length],this._snapped=!1,this.mode==="orbit"&&(this.controls.enabled=!0),this.mode}retarget(){this._snapped=!1}update(t){var u;if(this.mode==="orbit"||!t){this.controls.enabled=!0;return}this.controls.enabled=!1;const[e,n,s]=t.basePos??[0,0,0],o=t.slewAngle??0,a=Math.cos(o),r=Math.sin(o),l=t.hookPos??[e+12*a,6,s+12*r];let c,h,d;if(this.mode==="follow")c=e-a*17,h=n+10.5,d=s-r*17,this._lookTarget.set((l[0]+e)/2,Math.max(4,(l[1]+n)/2),(l[2]+s)/2);else if(this.mode==="cab"){const p=t.type==="tower",m=p?(((u=t.extra)==null?void 0:u.mastHeight)??30)+1.6:3.5,_=p?1.6:2.7,g=1.35;c=e+a*_-r*g,h=n+m,d=s+r*_+a*g,this._lookTarget.set(l[0],l[1],l[2])}else c=l[0]-a*6,h=l[1]+5,d=l[2]-r*6,this._lookTarget.set(l[0],l[1]-1.5,l[2]);this._desired.set(c,h,d),this._snapped?(this.camera.position.lerp(this._desired,.1),this._look.lerp(this._lookTarget,.14)):(this.camera.position.copy(this._desired),this._look.copy(this._lookTarget),this._snapped=!0),this.camera.lookAt(this._look)}}var qe,Bn,Sc;class Hy{constructor(){Le(this,qe);this.supported=typeof window<"u"&&!!(window.AudioContext||window.webkitAudioContext),this.muted=!1,this.ctx=null,this._prevLoadState=new Map}unlock(){if(!this.supported||this.ctx)return;const t=window.AudioContext||window.webkitAudioContext;this.ctx=new t;const e=r=>{const l=this.ctx.createGain();return l.gain.value=r,l};this.master=e(this.muted?0:.9),this.master.connect(this.ctx.destination),this.engineOsc=this.ctx.createOscillator(),this.engineOsc.type="sawtooth",this.engineOsc.frequency.value=36;const n=this.ctx.createBiquadFilter();n.type="lowpass",n.frequency.value=240,this.engineGain=e(0),this.engineOsc.connect(n),n.connect(this.engineGain),this.engineGain.connect(this.master),this.engineOsc.start(),this.slewOsc=this.ctx.createOscillator(),this.slewOsc.type="triangle",this.slewOsc.frequency.value=85,this.slewGain=e(0),this.slewOsc.connect(this.slewGain),this.slewGain.connect(this.master),this.slewOsc.start(),this.winchOsc=this.ctx.createOscillator(),this.winchOsc.type="triangle",this.winchOsc.frequency.value=130,this.winchGain=e(0),this.winchOsc.connect(this.winchGain),this.winchGain.connect(this.master),this.winchOsc.start(),this.alarmOsc=this.ctx.createOscillator(),this.alarmOsc.type="square",this.alarmOsc.frequency.value=920,this.alarmGain=e(0),this.alarmOsc.connect(this.alarmGain),this.alarmGain.connect(this.master),this.alarmOsc.start();const s=Math.floor(this.ctx.sampleRate*.4);this.noise=this.ctx.createBuffer(1,s,this.ctx.sampleRate);const o=this.noise.getChannelData(0);let a=987654321;for(let r=0;r<s;r++)a=a*16807%2147483647,o[r]=a/2147483647*2-1}toggleMute(){return this.muted=!this.muted,this.master&&(this.master.gain.value=this.muted?0:.9),this.muted}update(t,{live:e=!0,activeCrane:n=0}={}){var m,_,g,f,x,y;if(!this.ctx)return;const s=(m=t.cranes)==null?void 0:m[n];if(!s||!e){for(const v of[this.engineGain,this.slewGain,this.winchGain,this.alarmGain])z(this,qe,Bn).call(this,v.gain,0);return}const o=((_=s.extra)==null?void 0:_.vel)??{},a=Math.abs(((g=s.extra)==null?void 0:g.driveVel)??0),r=Math.abs(o.slew??0),l=Math.abs(o.hoist??0),c=Math.abs(o.luff??o.trolley??0),h=r>.001||l>.01||c>.001||a>.02;s.type==="mobile"?(z(this,qe,Bn).call(this,this.engineGain.gain,.05+(h?.02:0)+Math.min(a*.06,.08)),z(this,qe,Bn).call(this,this.engineOsc.frequency,34+a*16+(h?5:0))):z(this,qe,Bn).call(this,this.engineGain.gain,0),z(this,qe,Bn).call(this,this.slewGain.gain,r>.001?.035:0),z(this,qe,Bn).call(this,this.slewOsc.frequency,70+r*2600),z(this,qe,Bn).call(this,this.winchGain.gain,l>.01?.05:0),z(this,qe,Bn).call(this,this.winchOsc.frequency,110+l*190);const d=(((f=t.safety)==null?void 0:f.cranePairs)??[]).some(v=>v.clash),u=(((x=t.safety)==null?void 0:x.agentHolds)??[]).includes(n),p=(((y=s.extra)==null?void 0:y.limiterActive)||d||u)&&t.time%.5<.22;z(this,qe,Bn).call(this,this.alarmGain.gain,p?.09:0);for(const v of t.loads??[]){const w=this._prevLoadState.get(v.id);w&&w!==v.state&&(v.state==="hooked"&&(w==="ground"||w==="rigging")?z(this,qe,Sc).call(this,{freq:2400,type:"highpass",dur:.07,vol:.12}):(w==="hooked"||w==="derigging")&&(v.state==="ground"||v.state==="placed")&&z(this,qe,Sc).call(this,{freq:240,type:"lowpass",dur:.22,vol:.3})),this._prevLoadState.set(v.id,v.state)}}}qe=new WeakSet,Bn=function(t,e){t.cancelScheduledValues(this.ctx.currentTime),t.linearRampToValueAtTime(e,this.ctx.currentTime+.09)},Sc=function({freq:t,type:e,dur:n,vol:s}){if(!this.ctx||this.muted)return;const o=this.ctx.createBufferSource();o.buffer=this.noise;const a=this.ctx.createBiquadFilter();a.type=e,a.frequency.value=t;const r=this.ctx.createGain();r.gain.setValueAtTime(s,this.ctx.currentTime),r.gain.exponentialRampToValueAtTime(.001,this.ctx.currentTime+n),o.connect(a),a.connect(r),r.connect(this.master),o.start(),o.stop(this.ctx.currentTime+n+.02)};const en={idle:12108492,near:14722362,ok:4116334,danger:14699060};function vo(i,t=.85){return new Oe({color:i,transparent:!0,opacity:t,side:Re,depthWrite:!1})}function Gy(i,t=.8){return new Ju({color:i,transparent:!0,opacity:t,dashSize:.8,gapSize:.5,depthWrite:!1})}function Ea(i,t,e,n=48){const s=new st(new Ai(i,t,n),e);return s.rotation.x=-Math.PI/2,s}var Tn,wc,Lf,If,Ec;class Vy{constructor(){Le(this,Tn);this.root=new Nt,this.enabled=!0,this.mats={idle:vo(en.idle,.65),near:vo(en.near,.85),ok:vo(en.ok,.9),danger:vo(en.danger,.9)},this.reticle=new Nt,this.reticleRing=Ea(.34,.46,this.mats.idle),this.reticle.add(this.reticleRing),this.reticleCross=[];for(let o=0;o<4;o++){const a=new st(new qn(.5,.07),this.mats.idle);a.rotation.x=-Math.PI/2,a.rotation.z=o*Math.PI/2;const r=o*Math.PI/2;a.position.set(Math.cos(r)*.75,0,Math.sin(r)*.75),this.reticleCross.push(a),this.reticle.add(a)}this.root.add(this.reticle),this.dropLine=new st(new ve(.015,.015,1,4,1,!0),vo(en.idle,.3)),this.root.add(this.dropLine),this.pickupRing=Ea(Ds-.08,Ds,this.mats.near,56),this.root.add(this.pickupRing),this.brackets=[];for(let o=0;o<4;o++){const a=new Nt;for(const r of[0,Math.PI/2]){const l=new st(new qn(.55,.08),this.mats.near);l.rotation.x=-Math.PI/2,l.rotation.z=r,l.position.set(r===0?-.24:0,0,r===0?0:-.24),a.add(l)}this.brackets.push(a),this.root.add(a)}this.leadGeo=new Jt().setFromPoints([new L,new L]),this.leadLine=new ai(this.leadGeo,Gy(en.near)),this.root.add(this.leadLine),this.settleRing=Ea(1.62,1.86,this.mats.idle,56),this.root.add(this.settleRing),this.gapLine=new st(new ve(.03,.03,1,4,1,!0),this.mats.near),this.root.add(this.gapLine);const t=73;this.sweepGeo=new Jt,this.sweepGeo.setAttribute("position",new Me(new Float32Array(t*3),3)),this.sweepGeo.setAttribute("color",new Me(new Float32Array(t*3),3)),this.sweepLine=new ai(this.sweepGeo,new Ve({vertexColors:!0,transparent:!0,opacity:.85,depthWrite:!1})),this.root.add(this.sweepLine),this.sweepHazards=[];for(let o=0;o<24;o++){const a=new st(new no(.55,12),this.mats.danger);a.rotation.x=-Math.PI/2,this.sweepHazards.push(a),this.root.add(a)}this.nfzGeo=new Jt().setFromPoints([new L,new L,new L,new L,new L]),this.nfzOutline=new ai(this.nfzGeo,new Ve({color:en.danger,transparent:!0,opacity:.95,depthWrite:!1})),this.root.add(this.nfzOutline);const e=21;this.driveGeo=new Jt,this.driveGeo.setAttribute("position",new Me(new Float32Array(e*3),3)),this.driveGeo.setAttribute("color",new Me(new Float32Array(e*3),3)),this.driveLine=new ai(this.driveGeo,new Ju({vertexColors:!0,transparent:!0,opacity:.9,dashSize:.7,gapSize:.45,depthWrite:!1})),this.drivePoints=new Ku(this.driveGeo,new Jc({vertexColors:!0,size:.24,sizeAttenuation:!0,depthWrite:!1})),this.root.add(this.driveLine,this.drivePoints),this.swayArrow=new Nt;const n=new st(new ve(.05,.05,1,5),this.mats.near);n.rotation.z=-Math.PI/2,n.position.x=.5,this.swayArrow.add(n);const s=new st(new Qa(.16,.4,6),this.mats.near);s.rotation.z=-Math.PI/2,s.position.x=1.15,this.swayArrow.add(s),this.root.add(this.swayArrow),this.tandemGeo=new Jt().setFromPoints([new L,new L]),this.tandemLine=new ai(this.tandemGeo,new Ve({color:en.ok,transparent:!0,opacity:.95,depthWrite:!1})),this.root.add(this.tandemLine),this.yawGhost=new Zu(new Jt().setFromPoints([new L(-.5,0,-.5),new L(.5,0,-.5),new L(.5,0,.5),new L(-.5,0,.5)]),new Ve({color:en.ok,transparent:!0,opacity:.8,depthWrite:!1})),this.root.add(this.yawGhost),this.missionMarks=[];for(let o=0;o<12;o++){const a=new st(new th(.4),this.mats.ok);this.missionMarks.push(a),this.root.add(a)}this.TRAIL_MAX=120,this.trailGeo=new Jt,this.trailGeo.setAttribute("position",new Me(new Float32Array(this.TRAIL_MAX*3),3)),this.trailGeo.setAttribute("color",new Me(new Float32Array(this.TRAIL_MAX*3),3)),this.trailLine=new ai(this.trailGeo,new Ve({vertexColors:!0,transparent:!0,opacity:.55,depthWrite:!1})),this.root.add(this.trailLine),this._trail=[],this._trailLastT=null,this.dangerRing=Ea(.94,1,this.mats.near,64),this.root.add(this.dangerRing),this.intruderMarks=[];for(let o=0;o<4;o++){const a=new st(new Qa(.28,.55,4),this.mats.danger);a.rotation.x=Math.PI,this.intruderMarks.push(a),this.root.add(a)}z(this,Tn,wc).call(this)}update(t,e,{live:n=!0,enabled:s=this.enabled,preview:o=null,release:a=null,sweep:r=null,readiness:l=null,nfz:c=null,drivePath:h=null,time:d=null}={}){var f,x,y,v,w,E;this.enabled=s;const u=n&&s;if(this.root.visible=u,!u)return;z(this,Tn,wc).call(this);const p=(f=t.cranes)==null?void 0:f[e];if(!p)return;const m=p.hookPos,_=a!=null,g=(((x=t.safety)==null?void 0:x.tandem)??[]).find(S=>S.craneIds.includes(e));if(g){const S=g.craneIds.find(b=>b!==e),R=(y=t.cranes)==null?void 0:y[S];R&&(this.tandemGeo.setFromPoints([new L(...m),new L(...R.hookPos)]),this.tandemLine.material.color.setHex(g.hold?en.danger:g.warning?en.near:en.ok),this.tandemLine.visible=!0)}if(c!=null&&c.near){const[S,R]=c.min,[b,M]=c.max,C=this.nfzGeo.getAttribute("position");[[S,R],[b,R],[b,M],[S,M],[S,R]].forEach(([U,O],B)=>C.setXYZ(B,U,.12,O)),C.needsUpdate=!0,this.nfzGeo.computeBoundingSphere(),this.nfzOutline.visible=!0}if((v=h==null?void 0:h.samples)!=null&&v.length){const S=this.driveGeo.getAttribute("position"),R=this.driveGeo.getAttribute("color"),b=Math.min(h.samples.length,S.count);for(let M=0;M<S.count;M++){const C=h.samples[Math.min(M,b-1)];S.setXYZ(M,C.x,.14,C.z),C.blocked?R.setXYZ(M,.88,.29,.2):R.setXYZ(M,.24,.81,.43)}S.needsUpdate=!0,R.needsUpdate=!0,this.driveGeo.setDrawRange(0,b),this.driveGeo.computeBoundingSphere(),this.driveLine.computeLineDistances(),this.driveLine.visible=!0,this.drivePoints.visible=h.samples.some(M=>M.blocked)}if(_){const S=a.held;if(S.targetYaw!=null&&S.target&&(this.yawGhost.visible=!0,this.yawGhost.position.set(S.target[0],S.targetElev+.08,S.target[1]),this.yawGhost.scale.set(S.size[0],1,S.size[2]),this.yawGhost.rotation.y=-S.targetYaw,this.yawGhost.material.color.setHex(a.yawOk?en.ok:en.near)),S.target){const[b,M]=S.target,C=S.targetElev??0,U=a.canRelease&&a.onTarget?this.mats.ok:a.onTarget?this.mats.near:this.mats.idle;this.settleRing.visible=!0,this.settleRing.material=U,this.settleRing.position.set(b,C+.06,M),z(this,Tn,Ec).call(this,[S.pos[0],S.pos[1],S.pos[2]],[b,C+.1,M],U.color)}S.pos[1]-S.size[1]/2;const R=Math.max(a.bottomGap,.02);if(this.gapLine.visible=!0,this.gapLine.material=a.canRelease?this.mats.ok:this.mats.near,this.gapLine.scale.y=R,this.gapLine.position.set(S.pos[0],a.support+R/2,S.pos[2]),r&&r.samples.some(b=>b.hit)){const b=this.sweepGeo.getAttribute("position"),M=this.sweepGeo.getAttribute("color"),C=r.samples.length;let U=0;for(let O=0;O<=C;O++){const B=r.samples[O%C];if(b.setXYZ(O,B.x,.09,B.z),B.hit?M.setXYZ(O,.88,.29,.2):M.setXYZ(O,.55,.62,.58),B.hit&&O<C&&U<this.sweepHazards.length){const X=this.sweepHazards[U++];X.visible=!0,X.position.set(B.x,.1,B.z)}}b.needsUpdate=!0,M.needsUpdate=!0,this.sweepGeo.computeBoundingSphere(),this.sweepLine.visible=!0}if(p.basePos&&p.radius!=null&&p.slewAngle!=null){const b=[p.basePos[0]+p.radius*Math.cos(p.slewAngle),p.basePos[2]+p.radius*Math.sin(p.slewAngle)],M=m[0]-b[0],C=m[2]-b[1],U=Math.hypot(M,C);U>.05&&(this.swayArrow.visible=!0,this.swayArrow.position.set(S.pos[0],S.pos[1]-S.size[1]/2-.3,S.pos[2]),this.swayArrow.rotation.y=-Math.atan2(C,M),this.swayArrow.scale.setScalar(Math.min(1+U*2.5,4)))}if((t.agents??[]).length>0){const b=((w=t.safety)==null?void 0:w.dangerRadius)??5,M=(((E=t.safety)==null?void 0:E.agentHolds)??[]).includes(e);this.dangerRing.visible=!0,this.dangerRing.material=M?this.mats.danger:this.mats.near;const C=M&&d!=null?1+.04*Math.sin(d*5):1;this.dangerRing.scale.set(b*C,b*C,1),this.dangerRing.position.set(S.pos[0],.05,S.pos[2]);let U=0;for(const O of t.agents){if(U>=this.intruderMarks.length)break;if(Math.hypot(S.pos[0]-O.pos[0],S.pos[2]-O.pos[1])<b){const X=this.intruderMarks[U++];X.visible=!0;const W=d!=null?.12*Math.sin(d*6):0;X.position.set(O.pos[0],2.5+W,O.pos[1])}}}}else{const S=o!=null&&o.ok?this.mats.ok:o!=null&&o.horizOk?this.mats.near:this.mats.idle;if(this.reticle.visible=!0,this.reticle.position.set(m[0],.07,m[2]),z(this,Tn,If).call(this,S),this.dropLine.visible=!0,this.dropLine.material=S,this.dropLine.scale.y=Math.max(m[1],.1),this.dropLine.position.set(m[0],m[1]/2,m[2]),o!=null&&o.load){const R=o.load,b=R.pos[1]+R.size[1]/2,M=o.ok?this.mats.ok:this.mats.near;this.pickupRing.visible=!0,this.pickupRing.material=M,this.pickupRing.position.set(R.pos[0],b+.06,R.pos[2]);const C=Math.cos(R.yaw??0),U=Math.sin(R.yaw??0),O=[[-R.size[0]/2,-R.size[2]/2],[R.size[0]/2,-R.size[2]/2],[R.size[0]/2,R.size[2]/2],[-R.size[0]/2,R.size[2]/2]];this.brackets.forEach((B,X)=>{const[W,Y]=O[X];B.visible=!0,B.position.set(R.pos[0]+W*C-Y*U,b+.08,R.pos[2]+W*U+Y*C),B.rotation.y=-(R.yaw??0)+X*Math.PI/2;for(const V of B.children)V.material=M}),z(this,Tn,Ec).call(this,[m[0],m[1],m[2]],[R.pos[0],b,R.pos[2]],M.color)}l&&l.slice(0,this.missionMarks.length).forEach((R,b)=>{const M=this.missionMarks[b];M.visible=!0,M.material=R.ready?this.mats.ok:this.mats.idle;const C=R.ready&&d!=null?.25*Math.sin(d*3+b):0;M.position.set(R.pos[0],R.pos[1]+R.size[1]/2+1.7+C,R.pos[2]),M.rotation.y=d!=null?d*(R.ready?1.2:0):0,M.scale.setScalar(R.ready?1:.65)})}z(this,Tn,Lf).call(this,_?a.held.pos:m,d)}}Tn=new WeakSet,wc=function(){this.reticle.visible=!1,this.dropLine.visible=!1,this.pickupRing.visible=!1;for(const t of this.brackets)t.visible=!1;this.leadLine.visible=!1,this.settleRing.visible=!1,this.gapLine.visible=!1,this.dangerRing.visible=!1;for(const t of this.intruderMarks)t.visible=!1;this.sweepLine.visible=!1;for(const t of this.sweepHazards)t.visible=!1;this.nfzOutline.visible=!1,this.driveLine.visible=!1,this.drivePoints.visible=!1,this.swayArrow.visible=!1,this.tandemLine.visible=!1,this.yawGhost.visible=!1;for(const t of this.missionMarks)t.visible=!1;this.trailLine.visible=!1},Lf=function(t,e){if(e==null||!t||(this._trailLastT!=null&&e<this._trailLastT&&(this._trail=[]),(this._trailLastT==null||e-this._trailLastT>=.2||this._trail.length===0)&&(this._trail.push([t[0],t[1],t[2]]),this._trail.length>this.TRAIL_MAX&&this._trail.shift(),this._trailLastT=e),this._trail.length<2))return;const n=this.trailGeo.getAttribute("position"),s=this.trailGeo.getAttribute("color"),o=this._trail.length;for(let a=0;a<o;a++){const r=this._trail[a];n.setXYZ(a,r[0],r[1],r[2]);const l=.15+.85*(a/(o-1));s.setXYZ(a,.88*l,.75*l,.35*l)}n.needsUpdate=!0,s.needsUpdate=!0,this.trailGeo.setDrawRange(0,o),this.trailGeo.computeBoundingSphere(),this.trailLine.visible=!0},If=function(t){this.reticleRing.material=t;for(const e of this.reticleCross)e.material=t},Ec=function(t,e,n){this.leadLine.visible=!0;const s=this.leadGeo.getAttribute("position");s.setXYZ(0,t[0],t[1],t[2]),s.setXYZ(1,e[0],e[1],e[2]),s.needsUpdate=!0,this.leadGeo.computeBoundingSphere(),this.leadLine.computeLineDistances(),this.leadLine.material.color.set(n)};const As=900,Yd=70,Wy=42,xo=44,jd=.9,$y=34,Xy=2.2,qy=8;class Yy{constructor(){this.root=new Nt,this.root.visible=!1,this.bx=new Float32Array(As),this.bz=new Float32Array(As),this.phase=new Float32Array(As);const t=fr(20260710);for(let n=0;n<As;n++)this.bx[n]=(t()-.5)*Yd,this.bz[n]=(t()-.5)*Yd,this.phase[n]=t()*xo;this.positions=new Float32Array(As*2*3);const e=new Jt;e.setAttribute("position",new Me(this.positions,3)),this.mat=new Ve({color:10465472,transparent:!0,opacity:0,depthWrite:!1}),this.lines=new is(e,this.mat),this.lines.frustumCulled=!1,this.root.add(this.lines)}update(t,e,n=null){var d;const s=(t==null?void 0:t.rain)??0,o=Math.max(0,Math.min(1,s/qy));if(o<=.04){this.root.visible=!1;return}this.root.visible=!0;const a=(d=t==null?void 0:t.reasons)!=null&&d.includes("rain")?1.25:1;this.mat.opacity=Math.min(.6,.12+o*.42*a);const r=n?n[0]:0,l=n?n[2]:0,c=(e*$y%xo+xo)%xo,h=this.positions;for(let u=0;u<As;u++){let p=Wy-(this.phase[u]+c)%xo;const m=r+this.bx[u],_=l+this.bz[u],g=p+jd,f=u*6;h[f]=m+Xy*jd*.5,h[f+1]=g,h[f+2]=_,h[f+3]=m,h[f+4]=p,h[f+5]=_}this.lines.geometry.getAttribute("position").needsUpdate=!0}dispose(){this.lines.geometry.dispose(),this.mat.dispose(),this.root.remove(this.lines)}}const pl=8,Tc=16096779,jy=5990002,ml=2.2;function Zy(i){const t=new Ot(Tc),e=new Ot(jy);return t.lerp(e,Math.max(0,Math.min(1,i)))}var rr,Df;class Ky{constructor(){Le(this,rr);this.root=new Nt,this.root.visible=!1,this.markers=[];for(let t=0;t<pl;t++)this.markers.push(z(this,rr,Df).call(this));this.reachRing=new st(new Ai(1,1.15,64),new Oe({color:Tc,transparent:!0,opacity:.35,side:Re,depthWrite:!1})),this.reachRing.rotation.x=-Math.PI/2,this.reachRing.position.y=.05,this.reachRing.visible=!1,this.root.add(this.reachRing)}setCandidates(t){const e=Math.min(t.length,pl);for(let s=0;s<pl;s++){const o=this.markers[s];if(s>=e){o.group.visible=!1;continue}const a=t[s],r=e>1?s/(e-1):0,l=Zy(r);o.group.visible=!0,o.group.position.set(a.pos[0],0,a.pos[1]),o.diskMat.color.copy(l),o.ringMat.color.copy(l),o.diskMat.opacity=.3-r*.16,o.ringMat.opacity=.95-r*.45,o.pole.visible=s===0,s===0&&o.pole.material.color.set(Tc)}const n=t[0];n&&n.reach?(this.reachRing.geometry.dispose(),this.reachRing.geometry=new Ai(n.reach-.4,n.reach,96),this.reachRing.position.set(n.pos[0],.05,n.pos[1]),this.reachRing.visible=!0):this.reachRing.visible=!1}setVisible(t){this.root.visible=t}dispose(){this.setVisible(!1)}}rr=new WeakSet,Df=function(){const t=new Nt,e=new Oe({transparent:!0,opacity:.28,side:Re,depthWrite:!1}),n=new st(new no(ml,40),e);n.rotation.x=-Math.PI/2,n.position.y=.04;const s=new Oe({transparent:!0,opacity:.9,side:Re,depthWrite:!1}),o=new st(new Ai(ml*.92,ml,40),s);o.rotation.x=-Math.PI/2,o.position.y=.05;const a=new st(new ve(.12,.12,6,8),new Oe({transparent:!0,opacity:.85}));return a.position.y=3,a.visible=!1,t.add(n,o,a),t.visible=!1,this.root.add(t),{group:t,disk:n,ring:o,pole:a,diskMat:e,ringMat:s}};class vr{constructor(t){if(!(t!=null&&t.length))throw new Error("LoadChart: empty table");this.points=[...t].sort((e,n)=>e[0]-n[0])}capacityAt(t){const e=this.points;if(t<=e[0][0])return e[0][1];if(t>e[e.length-1][0])return 0;for(let n=0;n<e.length-1;n++){const[s,o]=e[n],[a,r]=e[n+1];if(t>=s&&t<=a){const l=(t-s)/(a-s);return o+l*(r-o)}}return 0}get minRadius(){return this.points[0][0]}get maxRadius(){return this.points[this.points.length-1][0]}}class Uf{constructor(t){if(!(t!=null&&t.length))throw new Error("LoadChart2D: empty chart");this.rows=[...t].sort((e,n)=>e[0]-n[0]).map(([e,n])=>({len:e,chart:new vr(n)}))}capacityAt(t,e){const n=this.rows;if(t<=n[0].len)return n[0].chart.capacityAt(e);if(t>=n[n.length-1].len)return n[n.length-1].chart.capacityAt(e);for(let s=0;s<n.length-1;s++){const o=n[s],a=n[s+1];if(t>=o.len&&t<=a.len){const r=(t-o.len)/(a.len-o.len);return o.chart.capacityAt(e)*(1-r)+a.chart.capacityAt(e)*r}}return 0}get boomLengths(){return this.rows.map(t=>t.len)}}const er=i=>i.length===3?[i[0],i[2]]:[i[0],i[1]],Zd=(i,t)=>Math.hypot(i[0]-t[0],i[1]-t[1]),Ta=i=>i.pos.length===3?i.pos[1]:0,Aa=i=>i.target.length===3?i.target[1]:i.targetHeight??i.z??0;function Ys(i,t){if(i.type==="tower")return[i.geometry.trolleyMin??2.5,i.geometry.jibLength];const e=i.geometry.pivotOffset??0,n=i.limits;return[e+t*Math.cos(n.boomAngleMax),e+t*Math.cos(n.boomAngleMin)]}function Jy(i,t){if(i.capacityChart){const n=new Uf(i.capacityChart);return s=>n.capacityAt(t,s)}const e=new vr(i.loadChart);return n=>e.capacityAt(n)}function xr(i,t,e,n={}){var f;const s=t.boomLength??i.geometry.boomLength,[o,a]=Ys(i,s),r=Jy(i,s),l=i.rating??{},c=l.dynamicFactor??1,h=l.hookBlockMass??0,d=n.ground??null,u=[];let p=1/0,m=1/0,_=0;const g=dy(i,t.currentConfig??null,((f=i.configurations)==null?void 0:f.find(x=>x.id===t.configId))??null,n.logistics??{});if(!g.feasible)return{feasible:!1,boomLength:s,lifts:[],minCapMargin:0,minTipMargin:0,maxGroundPressure:0,assembly:g,reason:g.reason};for(const x of e){const y=Zd(t.pos,er(x.pos)),v=Zd(t.pos,er(x.target)),w=Math.max(y,v),E=i.type==="tower"?i.geometry.mastHeight:i.geometry.pivotHeight,S=i.type==="tower"?0:i.geometry.pivotOffset??0,R=i.type==="tower"?i.geometry.jibLength:Math.max(Math.hypot(Math.max(0,y-S),Math.max(0,Ta(x)-E)),Math.hypot(Math.max(0,v-S),Math.max(0,Aa(x)-E))),b=x.mass*c,M=i.type==="tower"?i.geometry.mastHeight-(i.limits.ropeMin??0):1/0;let C=!0,U=null;if(Math.max(Ta(x),Aa(x))>M+1e-6)C=!1,U=`높이 도달 불가: ${Math.max(Ta(x),Aa(x)).toFixed(1)}m > 최대 ${M.toFixed(1)}m`;else if(R>s+1e-6)C=!1,U=`붐 길이 부족: 필요 ${R.toFixed(1)}m > 구성 ${s}m`;else if(y<o||v<o)C=!1,U=`최소 반경(${o.toFixed(1)}m) 미만 — 너무 가까움`;else if(w>a)C=!1,U=`도달 불가: r=${w.toFixed(1)}m > 최대 ${a.toFixed(1)}m (붐 ${s}m)`;else{const O=Math.min(r(y),r(v))-h-b;if(O<0)C=!1,U=`정격 부족: 여유 ${O.toFixed(1)}t @r=${w.toFixed(1)}m`;else{p=Math.min(p,O);const B=d?pr({spec:i,boomLength:s,radius:w,loadMass:x.mass,ground:d}):{skipped:!0};B.skipped||(m=Math.min(m,B.tippingMargin),_=Math.max(_,B.groundPressure),B.tipOK?B.groundOK||(C=!1,U=`지반 지지력 부족 (${B.groundPressure.toFixed(1)} t/m²)`):(C=!1,U=`전도 여유 부족 (안전율 ${B.tippingMargin.toFixed(2)})`))}}if(C){const O=[[x.pos[0],Ta(x),x.pos.length===3?x.pos[2]:x.pos[1]],[x.target[0],Aa(x),x.target.length===3?x.target[2]:x.target[1]]],B=O.map(W=>mr(W,n.powerLines??[])).find(W=>!W.safe),X=O.map(W=>Fo(W,n.heightLimits??[])).find(W=>!W.safe);B?(C=!1,U=`전력선 이격 부족: ${B.clearance.toFixed(1)}m < ${B.required}m`):X&&(C=!1,U=`고도 제한 초과: 최대 ${X.limit}m`)}C&&(hy(i,{pos:t.pos,loadMass:x.mass,radius:w,defaultBearingCapacity:d==null?void 0:d.bearingCapacity},n.groundZones??[]).feasible||(C=!1,U="개별 아웃리거 지지력 부족")),u.push({id:x.id,feasible:C,reason:U,rLoad:y,rTarget:v,requiredBoomLength:R})}return{feasible:u.every(x=>x.feasible),boomLength:s,lifts:u,minCapMargin:Number.isFinite(p)?p:0,minTipMargin:m,maxGroundPressure:_,assembly:g}}function Kd(i,t,e={},n={}){const s=n.angles??16,o=n.ringStep??4,a=n.topN??5,r=n.boomLengths??(i.capacityChart?i.capacityChart.map(u=>u[0]):[i.geometry.boomLength]),l=[];for(const u of t)l.push(er(u.pos),er(u.target));const c=l.reduce((u,p)=>u+p[0],0)/l.length,h=l.reduce((u,p)=>u+p[1],0)/l.length,d=[];for(const u of r){const[,p]=Ys(i,u),m=[[c,h]];for(let _=o;_<=p;_+=o)for(let g=0;g<s;g++){const f=2*Math.PI*g/s;m.push([c+_*Math.cos(f),h+_*Math.sin(f)])}for(const _ of m){const g=xr(i,{pos:_,boomLength:u},t,e);g.feasible&&d.push({pos:_,boomLength:u,score:g.minCapMargin,eval:g})}}return d.sort((u,p)=>p.score-u.score||u.boomLength-p.boomLength),d.slice(0,a)}const Vi=new L,Qy=i=>`#${i.toString(16).padStart(6,"0")}`;function tM(i){return i<1?"#e04a34":i<1.33?"#e0a53a":"#3ecf6e"}function eM(i,t,e,n,s=368){const o=new L(i[0],i[1],i[2]).project(t),a=o.z>1;let r=a?-o.x:o.x,l=a?o.y:-o.y;if(!a&&o.z>=-1&&Math.abs(o.x)<=.9&&Math.abs(o.y)<=.9)return null;Math.abs(r)+Math.abs(l)<1e-9&&(l=-1);const c=Math.max(e-s-28,28),h=Math.min(e/2,c/2),d=n/2,u=Math.max(h-24,1),p=Math.max(d-24,1),m=1/Math.max(Math.abs(r)/u,Math.abs(l)/p);return{x:Math.min(Math.max(h+r*m,24),c),y:Math.min(Math.max(d+l*m,24),n-24),angle:Math.atan2(l,r)}}function nM(i){var o,a,r;const t=((o=i==null?void 0:i.extra)==null?void 0:o.driveVel)??0;if(Math.abs(t)<.05)return{visible:!1,text:"",derated:!1};const e=Math.abs(t)*3.6,n=((a=i.extra)==null?void 0:a.carryDerated)===!0,s=((r=i.extra)==null?void 0:r.pickCarryFactor)??.66;return{visible:!0,derated:n,text:`🚜 ${e.toFixed(1)} km/h${n?` · 픽앤캐리 감격 ×${s}`:""}`}}function iM(i,t,e,n,s){var r,l,c,h;if(!n)return{html:null,cls:""};const o=i.loads.find(d=>d.hookedBy===t&&(d.state==="rigging"||d.state==="derigging"));if((((r=i.safety)==null?void 0:r.agentHolds)??[]).includes(t))return{html:"⛔ 지상 인원·장비 접근 — 작업 일시정지",cls:"danger"};const a=(((l=i.safety)==null?void 0:l.tandem)??[]).find(d=>d.craneIds.includes(t));if(a!=null&&a.hold)return{html:`⛔ 탠덤 동기 이탈 ${a.deviation.toFixed(2)}m — 두 크레인 홀드`,cls:"danger"};if(a!=null&&a.warning)return{html:`⚠ 탠덤 후크 간격 ${a.actual.toFixed(1)}m / 목표 ${a.expected.toFixed(1)}m`,cls:"work"};if((c=e.extra)!=null&&c.limiterActive)return{html:"⚠ 모멘트 리미터 작동 — 반경을 줄이세요",cls:"danger"};if(s!=null&&s.near)return{html:`⚠ 금지구역 접근 (${s.distance.toFixed(1)}m) — 경로를 변경하세요`,cls:"danger"};if(o){const d=o.state==="rigging"?o.rigTime:o.derigTime,u=d>0?Math.round((1-o.rigRemain/d)*100):0;return{html:`🔧 ${o.state==="rigging"?"줄걸이":"해체"} 작업 중 ${u}% <span class="ov-progress"><span style="width:${u}%"></span></span>`,cls:"work"}}return(h=i.wind)!=null&&h.maxOperating&&i.wind.speed>i.wind.maxOperating?{html:`⛔ 풍속 초과 (${i.wind.speed.toFixed(1)} > ${i.wind.maxOperating} m/s) — 작업 중지`,cls:"danger"}:{html:null,cls:""}}var $e,Ff,Nf,Of,kf,zf,Bf,Hf;class sM{constructor(t){Le(this,$e);this.ok=typeof document<"u"&&!!t,this.enabled=!0,this.ok&&(this.container=t,t.innerHTML=`
      <div class="ov-gauge"><canvas width="196" height="136"></canvas></div>
      <div class="ov-side">
        <div class="ov-speed" hidden></div>
        <div class="ov-wind" hidden><span class="ov-wind-arrow">➤</span><span class="ov-wind-text"></span></div>
        <div class="ov-minimap"><canvas width="208" height="164"></canvas></div>
      </div>
      <div class="ov-banner" hidden></div>
      <div class="ov-label" hidden></div>
      <div class="ov-target-arrow" hidden>➤</div>
      <div class="ov-onboard" hidden></div>
      <div class="ov-score" hidden></div>
    `,this.gaugeCanvas=t.querySelector(".ov-gauge canvas"),this.mapCanvas=t.querySelector(".ov-minimap canvas"),this.speedBox=t.querySelector(".ov-speed"),this.windBox=t.querySelector(".ov-wind"),this.windArrow=t.querySelector(".ov-wind-arrow"),this.windText=t.querySelector(".ov-wind-text"),this.banner=t.querySelector(".ov-banner"),this.label=t.querySelector(".ov-label"),this.targetArrow=t.querySelector(".ov-target-arrow"),this.onboard=t.querySelector(".ov-onboard"),this.scoreCard=t.querySelector(".ov-score"),this._onboardUntil=0,this._lastBanner=null,this._lastLabel=null)}setEnabled(t){return this.enabled=t,this.ok&&(this.container.style.display=t?"":"none"),t}update(t,e,n,{spec:s=null,scenario:o=null,live:a=!0,preview:r=null,release:l=null,nfz:c=null,guidance:h=null,planNote:d=null}={}){var p;if(!this.ok||!this.enabled)return;const u=(p=t.cranes)==null?void 0:p[e];u&&(z(this,$e,Ff).call(this,u,s,a),z(this,$e,Nf).call(this,t,e,n,o),z(this,$e,Of).call(this,u),z(this,$e,kf).call(this,t),z(this,$e,zf).call(this,t,e,u,a,c,d),z(this,$e,Hf).call(this,t,u,n,a,r,l),z(this,$e,Bf).call(this,n,a,h),this.onboard&&!this.onboard.hidden&&Date.now()>this._onboardUntil&&(this.onboard.hidden=!0))}showOnboarding(t){!this.ok||!t||(this.onboard.innerHTML=`<strong>${t.name}</strong><span>${t.desc??""}</span><em>화살표 선회·기복 / Q·E 권상 / WASD 주행 / Space 픽업 / H 보조UI / K 셋업후보</em>`,this.onboard.hidden=!1,this._onboardUntil=Date.now()+6e3)}showScore(t){!this.ok||!t||(this.scoreCard.innerHTML=`<strong>${"★".repeat(t.stars)}${"☆".repeat(5-t.stars)} · ${t.value.toFixed(0)}점</strong><span>시간 ${t.time.toFixed(1)}s · 위치 ${t.positionError.toFixed(2)}m · 자세 ${(t.yawError*180/Math.PI).toFixed(1)}° · 안전위반 ${t.violations}</span>`,this.scoreCard.hidden=!1)}hideScore(){this.ok&&(this.scoreCard.hidden=!0)}}$e=new WeakSet,Ff=function(t,e,n){var f,x,y,v;const s=this.gaugeCanvas.getContext("2d"),o=this.gaugeCanvas.width,a=this.gaugeCanvas.height;s.clearRect(0,0,o,a);let r=(e==null?void 0:e.loadChart)??[];if((f=e==null?void 0:e.capacityChart)!=null&&f.length){const w=((x=t.extra)==null?void 0:x.boomLength)??((y=e.geometry)==null?void 0:y.boomLength);let E=e.capacityChart[0];for(const S of e.capacityChart)Math.abs(S[0]-w)<Math.abs(E[0]-w)&&(E=S);r=E[1]}if(!r.length)return;const l=r[0][0],c=r[r.length-1][0],h=Math.max(...r.map(([,w])=>w)),d=w=>34+(w-l)/(c-l)*(o-44),u=w=>a-26-w/h*(a-44);if(s.strokeStyle="rgba(255,255,255,0.22)",s.lineWidth=1,s.strokeRect(34,12,o-44,a-38),s.beginPath(),r.forEach(([w,E],S)=>S===0?s.moveTo(d(w),u(E)):s.lineTo(d(w),u(E))),s.strokeStyle="#7fa8cc",s.lineWidth=1.6,s.stroke(),(v=t.extra)!=null&&v.carryDerated){const w=t.extra.pickCarryFactor??.66;s.beginPath(),r.forEach(([E,S],R)=>R===0?s.moveTo(d(E),u(S*w)):s.lineTo(d(E),u(S*w))),s.strokeStyle="#e0a53a",s.setLineDash([5,3]),s.stroke(),s.setLineDash([]),s.fillStyle="#ffcf7a",s.font="10px Consolas, monospace",s.fillText(`캐리 감격 ×${w}`,o-92,10)}const p=Number.isFinite(t.loadRatio)?t.loadRatio:1.2,m=t.loadMass>0&&p>=1,_=t.loadMass>0&&p>=.8;t.loadMass>0&&(s.strokeStyle=m?"#e04a34":_?"#e0a53a":"#3ecf6e",s.setLineDash([4,3]),s.beginPath(),s.moveTo(34,u(t.loadMass)),s.lineTo(o-10,u(t.loadMass)),s.stroke(),s.setLineDash([]));const g=d(Math.min(Math.max(t.radius,l),c));if(s.fillStyle=m?"#e04a34":_?"#e0a53a":"#8fd8a8",s.beginPath(),s.arc(g,u(t.capacity),4,0,Math.PI*2),s.fill(),s.strokeStyle="rgba(255,255,255,0.35)",s.setLineDash([3,3]),s.beginPath(),s.moveTo(g,12),s.lineTo(g,a-26),s.stroke(),s.setLineDash([]),n&&Number.isFinite(t.limitRadius)){const w=d(Math.min(Math.max(t.limitRadius,l),c));s.strokeStyle="#e04a34",s.lineWidth=2,s.beginPath(),s.moveTo(w,12),s.lineTo(w,a-26),s.stroke(),s.fillStyle="#ff8a76",s.textAlign="center",s.fillText("한계",w,a-29),s.textAlign="left"}if(s.fillStyle="#c8d2dc",s.font="10px Consolas, monospace",s.fillText(`R ${t.radius.toFixed(1)}m`,34,a-13),s.fillText(`정격 ${t.capacity.toFixed(1)}t`,96,a-13),t.loadMass>0?(s.fillStyle=m?"#ff8a76":_?"#ffcf7a":"#9fe8b8",s.fillText(`하중 ${t.loadMass.toFixed(1)}t (${(p*100).toFixed(0)}%)`,34,10)):s.fillText("무부하",34,10),Number.isFinite(t.stabilityFactor)){const w=tM(t.stabilityFactor);s.fillStyle=w,s.fillRect(34,a-25,o-44,5),s.fillStyle=w,s.textAlign="right",s.fillText(`전도 SF ${t.stabilityFactor.toFixed(2)}`,o-10,22),s.textAlign="left"}s.save(),s.translate(10,a/2),s.rotate(-Math.PI/2),s.fillStyle="rgba(200,210,220,0.6)",s.fillText("t",0,0),s.restore()},Nf=function(t,e,n,s){const o=this.mapCanvas.getContext("2d"),a=this.mapCanvas.width,r=this.mapCanvas.height;o.clearRect(0,0,a,r);const l=s==null?void 0:s.site;let c,h,d,u;if(l)c=l.minX??-(l.width??100)/2,h=c+(l.width??100),d=l.minZ??-(l.depth??100)/2,u=d+(l.depth??100);else{const y=[],v=[];for(const w of t.cranes)y.push(w.basePos[0]),v.push(w.basePos[2]);for(const w of t.loads)y.push(w.pos[0]),v.push(w.pos[2]),w.target&&(y.push(w.target[0]),v.push(w.target[1]));c=Math.min(...y,-30)-8,h=Math.max(...y,30)+8,d=Math.min(...v,-30)-8,u=Math.max(...v,30)+8}const p=8,m=Math.min((a-p*2)/(h-c),(r-p*2)/(u-d)),_=(a-(h-c)*m)/2,g=(r-(u-d)*m)/2,f=y=>_+(y-c)*m,x=y=>g+(y-d)*m;o.strokeStyle="rgba(160,175,190,0.5)",o.strokeRect(f(c),x(d),(h-c)*m,(u-d)*m);for(const y of t.noFlyZones??[])o.fillStyle="rgba(216,64,42,0.25)",o.fillRect(f(y.min[0]),x(y.min[1]),(y.max[0]-y.min[0])*m,(y.max[1]-y.min[1])*m);for(const y of t.obstacles??[])o.fillStyle="rgba(140,148,158,0.55)",o.fillRect(f(y.pos[0]-y.size[0]/2),x(y.pos[2]-y.size[2]/2),y.size[0]*m,y.size[2]*m);for(const y of t.trucks??[])y.visible&&(o.fillStyle="rgba(74,127,181,0.8)",o.fillRect(f(y.pos[0])-2.5,x(y.pos[1])-4,5,8));t.loads.forEach((y,v)=>{const w=Qy(tr[v%tr.length]);y.target&&y.state!=="placed"&&(o.strokeStyle=w,o.beginPath(),o.arc(f(y.target[0]),x(y.target[1]),4,0,Math.PI*2),o.stroke()),y.state!=="pending"&&(o.fillStyle=y.state==="placed"?"rgba(200,208,216,0.5)":w,o.fillRect(f(y.pos[0])-2,x(y.pos[2])-2,4,4))});for(const y of t.agents??[])o.fillStyle=y.kind==="vehicle"?"#e0a53a":"#f0e13a",o.beginPath(),o.arc(f(y.pos[0]),x(y.pos[1]),y.kind==="vehicle"?2.6:1.7,0,Math.PI*2),o.fill();if(t.cranes.forEach((y,v)=>{const w=v===e,E=f(y.basePos[0]),S=x(y.basePos[2]),R=Math.cos(y.slewAngle),b=Math.sin(y.slewAngle);o.strokeStyle=w?"#3ecf6e":"rgba(217,161,26,0.9)",o.lineWidth=w?2:1.3,o.beginPath(),o.moveTo(E-R*4,S-b*4),o.lineTo(E+R*y.radius*m,S+b*y.radius*m),o.stroke(),o.fillStyle=w?"#3ecf6e":"#d9a11a",o.beginPath(),o.arc(E,S,w?4:3,0,Math.PI*2),o.fill(),o.lineWidth=1}),n){n.getWorldDirection(Vi);const y=Math.atan2(Vi.z,Vi.x),v=f(n.position.x),w=x(n.position.z);o.fillStyle="rgba(233,238,245,0.14)",o.beginPath(),o.moveTo(v,w),o.arc(v,w,20,y-.45,y+.45),o.closePath(),o.fill()}},Of=function(t){const e=nM(t);this.speedBox.hidden=!e.visible,e.visible&&(this.speedBox.textContent=e.text,this.speedBox.classList.toggle("derated",e.derated))},kf=function(t){const e=t.wind;if(this.windBox.hidden=!e,!e)return;this.windArrow.style.transform=`rotate(${e.dir??0}rad)`;const n=e.maxOperating&&e.speed>e.maxOperating;this.windArrow.style.color=n?"#e04a34":e.speed>(e.maxOperating??1/0)*.8?"#e0a53a":"#8fc8e8",this.windText.textContent=`${e.speed.toFixed(1)}m/s${e.maxOperating?` / ${e.maxOperating}`:""}`},zf=function(t,e,n,s,o,a=null){const{html:r,cls:l}=!s&&a?{html:`▶ ${a}`,cls:"work"}:iM(t,e,n,s,o);r!==this._lastBanner?(this._lastBanner=r,this.banner.hidden=!r,r&&(this.banner.innerHTML=r,this.banner.className=`ov-banner ${l}`)):r&&r.includes("ov-progress")&&(this.banner.innerHTML=r)},Bf=function(t,e,n){if(!e||!t||!(n!=null&&n.pos)){this.targetArrow.hidden=!0;return}const s=eM(n.pos,t,window.innerWidth,window.innerHeight);this.targetArrow.hidden=!s,s&&(this.targetArrow.style.left=`${s.x}px`,this.targetArrow.style.top=`${s.y}px`,this.targetArrow.style.transform=`translate(-50%, -50%) rotate(${s.angle}rad)`,this.targetArrow.className=`ov-target-arrow ${n.kind}`)},Hf=function(t,e,n,s,o,a){var u;let r=null,l=null,c="";if(s&&n)if((u=a==null?void 0:a.held)!=null&&u.target){const p=a.yawError==null?"":` · 자세 ${Math.abs(a.yawError*180/Math.PI).toFixed(1)}°`;r=a.onTarget?a.canRelease?`안착 가능 — Space${p}`:a.yawOk?`내리세요 · 바닥까지 ${a.bottomGap.toFixed(1)}m${p}`:`태그라인 Z/X로 정렬${p}`:`목표까지 ${a.err.toFixed(1)}m`,c=a.onTarget&&a.canRelease?"ok":a.onTarget?"near":"",l=[a.held.pos[0],a.held.pos[1]+a.held.size[1]/2+1.2,a.held.pos[2]]}else!a&&(o!=null&&o.load)&&(r=o.ok?"픽업 가능 — Space":`수평 ${o.horiz.toFixed(1)}m${o.horizOk?"":"✕"} · 수직 ${o.vert.toFixed(1)}m${o.vertOk?"":"✕"}`,c=o.ok?"ok":o.horizOk?"near":"",l=e.hookPos);if(!r){this._lastLabel!==null&&(this._lastLabel=null,this.label.hidden=!0);return}if(Vi.set(l[0],l[1],l[2]).project(n),Vi.z>1){this.label.hidden=!0,this._lastLabel=null;return}const h=Math.min((Vi.x+1)/2*window.innerWidth,window.innerWidth-560),d=Math.max((-Vi.y+1)/2*window.innerHeight,40);this.label.style.left=`${h+14}px`,this.label.style.top=`${d-10}px`,r!==this._lastLabel&&(this._lastLabel=r,this.label.hidden=!1,this.label.textContent=r,this.label.className=`ov-label ${c}`)};class yr{constructor(t){if(new.target===yr)throw new Error("Crane is abstract");this.spec=t,this.basePos=[...t.basePos??[0,0,0]],this.slewAngle=0,this.loadMass=0,this.windAccel=[0,0]}step(t,e){throw new Error("not implemented")}getRadius(){throw new Error("not implemented")}getHookPos(){throw new Error("not implemented")}getCapacity(){throw new Error("not implemented")}capacityAtRadius(t){return this.loadChart.capacityAt(t)}getState(){const t=this.getRadius(),e=this.getCapacity();return{type:this.spec.type,basePos:[...this.basePos],slewAngle:this.slewAngle,radius:t,hookHeight:this.getHookPos()[1],hookPos:this.getHookPos(),capacity:e,loadMass:this.loadMass,loadRatio:e>0?this.loadMass/e:1/0,extra:this.getExtraState()}}getExtraState(){return{}}}function Ye(i,t,e){return Math.min(e,Math.max(t,i))}function Ji(i,t,e,n){const s=Ye(t-i,-e*n,e*n);return i+s}var rs,Gf,Ac;class oM extends yr{constructor(e){var s,o,a,r,l;super(e);Le(this,rs);const n=e.geometry;this.boomLength=n.boomLength,this.pivotHeight=n.pivotHeight,this.pivotOffset=n.pivotOffset??0,this.boomAngle=((s=e.initial)==null?void 0:s.boomAngle)??60*Math.PI/180,this.slewAngle=((o=e.initial)==null?void 0:o.slewAngle)??0,this.ropeLength=((a=e.initial)==null?void 0:a.ropeLength)??10,this.driveYaw=((r=e.initial)==null?void 0:r.driveYaw)??0,this.driveVel=0,this.vel={slew:0,luff:0,hoist:0},this.minHookY=0,this.limits=e.limits,this.loadChart=new vr(e.loadChart),this.chart2d=e.capacityChart?new Uf(e.capacityChart):null,this.sway=(l=e.physics)!=null&&l.sway?new nh(e.physics):null}step(e,n){const s=this.limits,o={slew:Ye((n==null?void 0:n.slew)??0,-1,1),luff:Ye((n==null?void 0:n.luff)??0,-1,1),hoist:Ye((n==null?void 0:n.hoist)??0,-1,1)};z(this,rs,Gf).call(this,e,Ye((n==null?void 0:n.drive)??0,-1,1),Ye((n==null?void 0:n.steer)??0,-1,1));const a=this.getCapacity(),r=this.loadMass>0&&a>0&&this.loadMass>=a;if(this.limiterActive=r||this.loadMass>0&&a<=0,this.limiterActive&&(o.hoist>0&&(o.hoist=0),o.luff>0&&(o.luff=0)),this.vel.slew=Ji(this.vel.slew,o.slew*s.slewRate,s.slewAccel,e),this.vel.luff=Ji(this.vel.luff,o.luff*s.luffRate,s.luffAccel,e),this.vel.hoist=Ji(this.vel.hoist,o.hoist*s.hoistSpeed,s.hoistAccel,e),this.slewAngle+=this.vel.slew*e,this.boomAngle=Ye(this.boomAngle-this.vel.luff*e,s.boomAngleMin,s.boomAngleMax),this.ropeLength=Ye(this.ropeLength-this.vel.hoist*e,s.ropeMin,this.maxRopeLength()),this.sway){const l=this.getRadius(),[c,,h]=this.basePos;this.sway.update(e,c+l*Math.cos(this.slewAngle),h+l*Math.sin(this.slewAngle),this.ropeLength,this.windAccel[0],this.windAccel[1])}}maxRopeLength(){return this.boomTipY()-this.minHookY}setHookHeight(e){this.ropeLength=Ye(this.boomTipY()-e,this.limits.ropeMin,this.maxRopeLength())}boomTipY(){return this.pivotHeight+this.boomLength*Math.sin(this.boomAngle)}getRadius(){return this.pivotOffset+this.boomLength*Math.cos(this.boomAngle)}getHookPos(){const e=this.getRadius(),[n,s,o]=this.basePos,[a,r]=this.sway?this.sway.offset:[0,0];return[n+e*Math.cos(this.slewAngle)+a,s+this.boomTipY()-this.ropeLength,o+e*Math.sin(this.slewAngle)+r]}getCapacity(){var n;const e=this.capacityAtRadius(this.getRadius());return z(this,rs,Ac).call(this)?e*(((n=this.spec.rating)==null?void 0:n.pickCarryFactor)??.66):e}capacityAtRadius(e){return this.chart2d?this.chart2d.capacityAt(this.boomLength,e):this.loadChart.capacityAt(e)}getRadiusRange(){const e=this.limits;return[this.pivotOffset+this.boomLength*Math.cos(e.boomAngleMax),this.pivotOffset+this.boomLength*Math.cos(e.boomAngleMin)]}maxHookHeightAt(e){const n=Math.max(0,Math.min(e-this.pivotOffset,this.boomLength));return this.pivotHeight+Math.sqrt(Math.max(0,this.boomLength**2-n**2))-this.limits.ropeMin}getExtraState(){var e;return{boomAngle:this.boomAngle,boomLength:this.boomLength,ropeLength:this.ropeLength,boomTipY:this.boomTipY(),vel:{...this.vel},limiterActive:this.limiterActive??!1,swayMag:this.sway?this.sway.magnitude:0,driveYaw:this.driveYaw,driveVel:this.driveVel,carryDerated:z(this,rs,Ac).call(this),pickCarryFactor:((e=this.spec.rating)==null?void 0:e.pickCarryFactor)??.66}}}rs=new WeakSet,Gf=function(e,n,s){const o=this.spec.planning??{};if((o.movable??!0)===!1)return;const a=o.steerRate??.14,r=o.driveSpeed??o.travelSpeed??1,l=o.driveAccel??o.travelAccel??.3;s!==0&&(this.driveYaw+=s*a*e),this.driveVel=Ji(this.driveVel,n*r,l,e),Math.abs(this.driveVel)>1e-5&&(this.basePos[0]+=Math.cos(this.driveYaw)*this.driveVel*e,this.basePos[2]+=Math.sin(this.driveYaw)*this.driveVel*e)},Ac=function(){return this.loadMass>0&&Math.abs(this.driveVel)>.05};var ko,Rc;class aM extends yr{constructor(e){var s,o,a,r;super(e);Le(this,ko);const n=e.geometry;this.mastHeight=n.mastHeight,this.jibLength=n.jibLength,this.trolleyMin=n.trolleyMin??2.5,this.trolleyPos=((s=e.initial)==null?void 0:s.trolleyPos)??this.jibLength/2,this.slewAngle=((o=e.initial)==null?void 0:o.slewAngle)??0,this.ropeLength=((a=e.initial)==null?void 0:a.ropeLength)??10,this.vel={slew:0,trolley:0,hoist:0},this.minHookY=0,this.limits=e.limits,this.loadChart=new vr(e.loadChart),this.sway=(r=e.physics)!=null&&r.sway?new nh(e.physics):null}step(e,n){const s=this.limits,o={slew:Ye((n==null?void 0:n.slew)??0,-1,1),luff:Ye((n==null?void 0:n.luff)??0,-1,1),hoist:Ye((n==null?void 0:n.hoist)??0,-1,1)},a=this.getCapacity(),r=this.loadMass>0&&a>0&&this.loadMass>=a;if(this.limiterActive=r||this.loadMass>0&&a<=0,this.limiterActive&&(o.hoist>0&&(o.hoist=0),o.luff>0&&(o.luff=0)),this.vel.slew=Ji(this.vel.slew,o.slew*s.slewRate,s.slewAccel,e),this.vel.trolley=Ji(this.vel.trolley,o.luff*s.trolleySpeed,s.trolleyAccel,e),this.vel.hoist=Ji(this.vel.hoist,o.hoist*s.hoistSpeed,s.hoistAccel,e),this.slewAngle+=this.vel.slew*e,this.trolleyPos=Ye(this.trolleyPos+this.vel.trolley*e,this.trolleyMin,this.jibLength),this.ropeLength=Ye(this.ropeLength-this.vel.hoist*e,s.ropeMin,this.maxRopeLength()),this.sway){const[l,,c]=z(this,ko,Rc).call(this);this.sway.update(e,l,c,this.ropeLength,this.windAccel[0],this.windAccel[1])}}maxRopeLength(){return this.mastHeight-this.minHookY}setHookHeight(e){this.ropeLength=Ye(this.mastHeight-e,this.limits.ropeMin,this.maxRopeLength())}getRadius(){return this.trolleyPos}getHookPos(){const[e,n,s]=z(this,ko,Rc).call(this),[o,a]=this.sway?this.sway.offset:[0,0];return[e+o,n-this.ropeLength,s+a]}getCapacity(){return this.capacityAtRadius(this.getRadius())}getRadiusRange(){return[this.trolleyMin,this.jibLength]}maxHookHeightAt(){return this.mastHeight-this.limits.ropeMin}getExtraState(){return{trolleyPos:this.trolleyPos,ropeLength:this.ropeLength,mastHeight:this.mastHeight,jibLength:this.jibLength,vel:{...this.vel},limiterActive:this.limiterActive??!1,swayMag:this.sway?this.sway.magnitude:0}}}ko=new WeakSet,Rc=function(){const[e,n,s]=this.basePos;return[e+this.trolleyPos*Math.cos(this.slewAngle),n+this.mastHeight,s+this.trolleyPos*Math.sin(this.slewAngle)]};function rM(i){let t=i>>>0;return()=>{t|=0,t=t+1831565813|0;let e=Math.imul(t^t>>>15,1|t);return e=e+Math.imul(e^e>>>7,61|e)^e,((e^e>>>14)>>>0)/4294967296}}const Jd=.5,Qd=3;var On,Vf,Cc,Wf,$f;class tu{constructor(t,e){Le(this,On);if(this.id=t.id,this.kind=t.kind??"worker",this.rng=rM(e),this.heading=[1,0],this.waiting=!1,this.kind==="vehicle")if(this.route=t.route.map(n=>[...n]),this.speed=t.speed??2.2,this.size=t.size?[...t.size]:[2.2,2.2,4.5],t.startFraction!=null){const n=cM(this.route,t.startFraction);this.pos=n.pos,this.wpIndex=n.wpIndex}else{const n=t.startIndex??0;this.pos=[...this.route[n%this.route.length]],this.wpIndex=(n+1)%this.route.length}else{this.area={min:[...t.area.min],max:[...t.area.max]};const[n,s]=t.speed??[.8,1.4];this.speed=n+this.rng()*(s-n),this.idleRange=t.idle??[2,6],this.radius=.5,this.pos=z(this,On,Cc).call(this,null),this.target=null,this.idleTimer=this.rng()*this.idleRange[1]}}step(t,e){this.kind==="vehicle"?z(this,On,Wf).call(this,t,e):z(this,On,Vf).call(this,t,e)}obstacle(){if(this.kind!=="vehicle")return null;const[t,e,n]=this.size,s=Math.abs(this.heading[0]),o=Math.abs(this.heading[1]);return{id:this.id,pos:[this.pos[0],0,this.pos[1]],size:[n*s+t*o,e,n*o+t*s]}}snapshot(){return{id:this.id,kind:this.kind,pos:[...this.pos],heading:[...this.heading],moving:this.kind==="vehicle"?!this.waiting:this.idleTimer<=0&&this.target!==null,waiting:this.waiting}}}On=new WeakSet,Vf=function(t,e){if(this.idleTimer>0){this.idleTimer-=t;return}this.target||(this.target=z(this,On,Cc).call(this,e));const n=this.target[0]-this.pos[0],s=this.target[1]-this.pos[1],o=Math.hypot(n,s);if(o<Jd){this.target=null;const[c,h]=this.idleRange;this.idleTimer=c+this.rng()*(h-c);return}const a=Math.min(this.speed*t,o),r=this.pos[0]+n/o*a,l=this.pos[1]+s/o*a;if(e&&gl(e,r,l,.6)){this.target=null,this.idleTimer=.5;return}this.heading=[n/o,s/o],this.pos[0]=r,this.pos[1]=l},Cc=function(t){const{min:e,max:n}=this.area;let s=[e[0],e[1]];for(let o=0;o<10;o++)if(s=[e[0]+this.rng()*(n[0]-e[0]),e[1]+this.rng()*(n[1]-e[1])],!t||!gl(t,s[0],s[1],1))return s;return s},Wf=function(t,e){const n=this.route[this.wpIndex],s=n[0]-this.pos[0],o=n[1]-this.pos[1],a=Math.hypot(s,o);if(a<Jd*1.6){this.wpIndex=(this.wpIndex+1)%this.route.length;return}this.heading=[s/a,o/a];const r=this.pos[0]+this.heading[0]*Qd,l=this.pos[1]+this.heading[1]*Qd;if(this.waiting=e?z(this,On,$f).call(this,e,r,l):!1,this.waiting)return;const c=Math.min(this.speed*t,a);this.pos[0]+=this.heading[0]*c,this.pos[1]+=this.heading[1]*c},$f=function(t,e,n){var s;for(const o of t.cranes){const r=(o.spec.geometry??{}).bodyRadius??3;if(Math.hypot(e-o.basePos[0],n-o.basePos[2])<r+1.2)return!0}for(const o of t.trucks){const a=(s=o.obstacle)==null?void 0:s.call(o);if(a&&Math.abs(e-a.pos[0])<a.size[0]/2+1&&Math.abs(n-a.pos[2])<a.size[2]/2+1)return!0}return gl(t,e,n,.8)};function gl(i,t,e,n){for(const s of i.obstacles)if(Math.abs(t-s.pos[0])<=s.size[0]/2+n&&Math.abs(e-s.pos[2])<=s.size[2]/2+n)return!0;return!1}function lM(i){const t=i==null?void 0:i.agents;if(!t)return{agents:[],rules:{dangerRadius:5}};const e=(t.seed??1)>>>0,n=[];let s=0;const o=hM(i.site);for(const a of t.workers??[]){const r=a.count??1;for(let l=0;l<r;l++)n.push(new tu({id:a.id?`${a.id}-${l+1}`:`W-${n.length+1}`,kind:"worker",area:a.area??o,speed:a.speed,idle:a.idle},e+(s+=1)*104729))}for(const a of t.vehicles??[]){const r=a.count??1;for(let l=0;l<r;l++)n.push(new tu({id:a.id?`${a.id}-${l+1}`:`V-${n.length+1}`,kind:"vehicle",route:a.route,speed:a.speed,size:a.size,startIndex:l*Math.max(1,Math.floor(a.route.length/r)),startFraction:l/r},e+(s+=1)*104729))}return{agents:n,rules:{dangerRadius:t.dangerRadius??5}}}function cM(i,t){const e=i.map((o,a)=>{const r=i[(a+1)%i.length];return Math.hypot(r[0]-o[0],r[1]-o[1])}),n=e.reduce((o,a)=>o+a,0);let s=(t%1+1)%1*n;for(let o=0;o<i.length;o++){if(s<=e[o]||o===i.length-1){const a=(o+1)%i.length,r=e[o]>0?s/e[o]:0;return{pos:[i[o][0]+(i[a][0]-i[o][0])*r,i[o][1]+(i[a][1]-i[o][1])*r],wpIndex:a}}s-=e[o]}return{pos:[...i[0]],wpIndex:1%i.length}}function hM(i){if(!i)return{min:[-40,-40],max:[40,40]};const t=i.minX??-(i.width??80)/2,e=i.minZ??-(i.depth??80)/2;return{min:[t+3,e+3],max:[t+(i.width??80)-3,e+(i.depth??80)-3]}}const li=1/60;class oh{constructor(t){this.scenario=t,this.accumulator=0,this.timeScale=1,this.reset()}setTimeScale(t){this.timeScale=t}reset(){this.world=new yy;for(const n of this.scenario.cranes)this.world.addCrane(dM(n));const t=this.scenario.rigging;for(const n of this.scenario.loads??[])this.world.addLoad({...n,rigTime:n.rigTime??(t==null?void 0:t.rigTime),derigTime:n.derigTime??(t==null?void 0:t.derigTime)});for(const n of this.scenario.obstacles??[])this.world.addObstacle(n);for(const n of this.scenario.trucks??_r(this.scenario))this.world.addTruck(new gr(n));for(const n of this.scenario.noFlyZones??[])this.world.addNoFlyZone(n);this.world.setWind(this.scenario.wind??null),this.world.siteBounds=this.scenario.site??null,this.world.setOperationalRules(this.scenario);const e=lM(this.scenario);for(const n of e.agents)this.world.addAgent(n);return this.world.setAgentRules(e.rules),this.world.scoringDef=this.scenario.scoring??{},this.accumulator=0,this.getState()}toggleAttach(t=0){return this.world.toggleAttach(t)}step(t,e){for(this.accumulator+=Math.min(t,.25)*this.timeScale;this.accumulator>=li;)this.world.step(li,e),this.accumulator-=li;return this.getState()}stepFixed(t,e=1){for(let n=0;n<e;n++)this.world.step(li,t);return this.getState()}getState(){return this.world.getState()}completionScore(){return this.world.completionScore(this.scenario.scoring??{})}}function dM(i){switch(i.type){case"mobile":return new oM(i);case"tower":return new aM(i);default:throw new Error(`unknown crane type: ${i.type}`)}}class uM{constructor(){this.active=!1,this.data=null}start(t){this.active=!0,this.data={version:2,scenarioId:t,createdAt:new Date().toISOString(),frames:[]}}frame(t,e,n,s=-1){this.active&&this.data.frames.push({dt:t,ts:e,cmds:n.map(o=>({slew:o.slew??0,luff:o.luff??0,hoist:o.hoist??0,drive:o.drive??0,steer:o.steer??0,tag:o.tag??0})),at:s})}stop(t=null){this.active=!1;const e=this.data;return e&&t&&(e.score=structuredClone(t)),e}get frameCount(){var t;return((t=this.data)==null?void 0:t.frames.length)??0}}class fM{constructor(t=window){this.keys=new Set,this.attachPressed=!1,t.addEventListener("keydown",e=>{this.keys.add(e.code),(e.code.startsWith("Arrow")||e.code==="Space")&&e.preventDefault(),e.code==="Space"&&!e.repeat&&(this.attachPressed=!0)}),t.addEventListener("keyup",e=>this.keys.delete(e.code)),window.addEventListener("blur",()=>this.keys.clear())}consumeAttach(){const t=this.attachPressed;return this.attachPressed=!1,t}getCommand(){const t=this.keys;return{slew:(t.has("ArrowRight")?1:0)+(t.has("ArrowLeft")?-1:0),luff:(t.has("ArrowDown")?1:0)+(t.has("ArrowUp")?-1:0),hoist:(t.has("KeyQ")?1:0)+(t.has("KeyE")?-1:0),drive:(t.has("KeyW")?1:0)+(t.has("KeyS")?-1:0),steer:(t.has("KeyD")?1:0)+(t.has("KeyA")?-1:0),tag:(t.has("KeyX")?1:0)+(t.has("KeyZ")?-1:0)}}}const eu=i=>String(i).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]);var Ze,Xa,Xi,Xf;class pM{constructor(t,e,n){Le(this,Ze);this.root=t,this.scenarios=e,this.handlers=n,this.command={slew:0,luff:0,hoist:0,drive:0,steer:0,tag:0},this.render(),this.bind()}render(){this.root.innerHTML=`
      <header class="dash-head">
        <h1 class="dash-title">Crane Control</h1>
        <p class="dash-subtitle"><span class="status-dot" data-status-dot></span><span data-status>시뮬레이션 실행 중</span></p>
      </header>

      <section class="dash-section">
        <label class="dash-label" for="scenario-select">시나리오</label>
        <select class="dash-select" id="scenario-select">
          ${this.scenarios.map((t,e)=>`<option value="${e}">${t.name}</option>`).join("")}
        </select>
        <div class="dash-row" style="margin-top:8px">
          <button class="dash-btn" data-action="pause">⏸ 일시정지</button>
          <button class="dash-btn warn" data-action="reset">↺ 초기화</button>
        </div>
      </section>

      <section class="dash-section">
        <span class="dash-label">시뮬레이션 속도</span>
        <div class="speed-grid">
          ${[1,5,10,20].map(t=>`<button class="dash-btn" data-speed="${t}">×${t}</button>`).join("")}
        </div>
      </section>

      <section class="dash-section">
        <label class="dash-label" for="crane-select">제어 크레인</label>
        <select class="dash-select" id="crane-select"></select>
      </section>

      <section class="dash-section">
        <span class="dash-label">수동 제어 · 버튼을 누르고 있거나 키를 사용</span>

        <span class="dash-label" style="margin-top:2px">🚜 주행 (이동식) · <b>W A S D</b></span>
        <div class="control-grid">
          <button class="dash-btn" data-control="drive" data-value="1">W · 전진 ▲</button>
          <button class="dash-btn" data-control="drive" data-value="-1">S · 후진 ▼</button>
          <button class="dash-btn" data-control="steer" data-value="-1">A · 좌회전 ◀</button>
          <button class="dash-btn" data-control="steer" data-value="1">D · 우회전 ▶</button>
        </div>

        <span class="dash-label" style="margin-top:8px">🏗 팔 조작 · <b>← → ↑ ↓ Q E</b></span>
        <div class="control-grid">
          <button class="dash-btn" data-control="slew" data-value="-1">← 좌선회 ↶</button>
          <button class="dash-btn" data-control="slew" data-value="1">→ 우선회 ↷</button>
          <button class="dash-btn" data-control="luff" data-value="-1">↑ 붐 올림 (반경↓)</button>
          <button class="dash-btn" data-control="luff" data-value="1">↓ 붐 내림 (반경↑)</button>
          <button class="dash-btn" data-control="hoist" data-value="1">Q · 권상 ↑</button>
          <button class="dash-btn" data-control="hoist" data-value="-1">E · 권하 ↓</button>
          <button class="dash-btn" data-control="tag" data-value="-1">Z · 태그라인 ↶</button>
          <button class="dash-btn" data-control="tag" data-value="1">X · 태그라인 ↷</button>
        </div>

        <button class="dash-btn primary" data-action="attach" style="width:100%;margin-top:8px">Space · 픽업 / 해제</button>
      </section>

      <section class="dash-section">
        <span class="dash-label">실시간 상태</span>
        <div class="metrics">
          <div class="metric"><div class="metric-name">시간</div><div class="metric-value" data-metric="time">0.0 s</div></div>
          <div class="metric"><div class="metric-name">작업 반경</div><div class="metric-value" data-metric="radius">-</div></div>
          <div class="metric"><div class="metric-name">후크 높이</div><div class="metric-value" data-metric="hook">-</div></div>
          <div class="metric"><div class="metric-name">하중률</div><div class="metric-value" data-metric="load">-</div></div>
          <div class="metric"><div class="metric-name">완료</div><div class="metric-value" data-metric="progress">0 / 0</div></div>
          <div class="metric"><div class="metric-name">안전 상태</div><div class="metric-value safe" data-metric="safety">정상</div></div>
        </div>
      </section>

      <section class="dash-section">
        <span class="dash-label">전체 양중 계획</span>
        <div class="dash-row">
          <select class="dash-select" id="plan-policy">
            <option value="earliestFinish">최단 종료시간</option>
            <option value="radiusPriority">동일 셋업 우선</option>
            <option value="nearest">최단 이동거리</option>
          </select>
          <button class="dash-btn primary" data-action="plan">계획 생성</button>
        </div>
        <button class="dash-btn" data-action="planPlay" data-plan-play disabled style="width:100%;margin-top:8px">▶ 3D 계획 재생</button>
        <div class="dash-row" style="margin-top:8px">
          <select class="dash-select" id="plan-speed" disabled>
            <option value="60">재생 ×60</option>
            <option value="300" selected>재생 ×300</option>
            <option value="600">재생 ×600</option>
          </select>
          <button class="dash-btn" data-action="planReset" data-plan-reset disabled>처음으로</button>
        </div>
        <input class="plan-seek" data-plan-seek type="range" min="0" max="1" value="0" step="1" disabled />
        <div class="plan-summary" data-plan-summary>계획을 생성하면 전체 시간축이 표시됩니다.</div>
        <button class="dash-btn" data-action="calibrate" style="width:100%;margin-top:8px">근사↔물리 캘리브레이션</button>
        <div class="calibration-summary" data-calibration-summary></div>
        <div class="gantt" data-gantt></div>
        <div class="plan-editor" data-plan-editor></div>
      </section>

      <section class="dash-section">
        <span class="dash-label">시나리오 편집기 · 3D + JSON</span>
        <button class="dash-btn" data-action="visualEdit" data-visual-edit style="width:100%;margin-bottom:8px">✥ 3D 배치 편집 시작</button>
        <div class="dash-row" style="margin-bottom:8px">
          <button class="dash-btn" data-action="editorUndo" data-editor-undo disabled>↶ 실행 취소</button>
          <button class="dash-btn" data-action="editorRedo" data-editor-redo disabled>↷ 다시 실행</button>
        </div>
        <div class="scenario-edit-help" data-visual-help>시작 후 크레인·부재·목표·장애물·제한구역을 클릭해 지면에서 드래그합니다.</div>
        <div class="dash-row">
          <select class="dash-select" data-object-kind>
            <option value="load">양중물</option><option value="obstacle">장애물</option>
            <option value="noFlyZone">제한구역</option><option value="crane">크레인</option>
          </select>
          <button class="dash-btn" data-action="objectAdd">＋ 추가</button>
        </div>
        <select class="dash-select" data-object-select style="margin-top:8px"><option>객체 없음</option></select>
        <div class="scenario-property-grid">
          <label>X<input type="number" step="0.5" data-object-field="x"></label>
          <label>Z<input type="number" step="0.5" data-object-field="z"></label>
          <label>폭<input type="number" min="0.1" step="0.5" data-object-field="width"></label>
          <label>높이<input type="number" min="0.1" step="0.5" data-object-field="height"></label>
          <label>깊이<input type="number" min="0.1" step="0.5" data-object-field="depth"></label>
          <label>중량(t)<input type="number" min="0.1" step="0.5" data-object-field="mass"></label>
        </div>
        <div class="dash-row" style="margin-top:8px">
          <button class="dash-btn primary" data-action="objectUpdate">선택 객체 적용</button>
          <button class="dash-btn warn" data-action="objectDelete">삭제</button>
        </div>
        <span class="dash-label" style="margin-top:10px">현장 환경</span>
        <div class="scenario-property-grid">
          <label>현장 폭<input type="number" min="10" data-env-field="width"></label>
          <label>현장 깊이<input type="number" min="10" data-env-field="depth"></label>
          <label>풍속(m/s)<input type="number" min="0" step="0.5" data-env-field="windSpeed"></label>
          <label>풍향(°)<input type="number" step="5" data-env-field="windDirection"></label>
          <label>작업한계풍속<input type="number" min="0.1" step="0.5" data-env-field="maxOperatingWind"></label>
          <label>돌풍 진폭(%)<input type="number" min="0" step="5" data-env-field="gustPercent"></label>
          <label>돌풍 주기(s)<input type="number" min="1" step="1" data-env-field="gustPeriod"></label>
          <label>지지력(t/m²)<input type="number" min="0.1" step="0.5" data-env-field="bearingCapacity"></label>
          <label>작업자 수<input type="number" min="0" step="1" data-env-field="workerCount"></label>
          <label>보행속도(m/s)<input type="number" min="0.1" step="0.1" data-env-field="workerSpeed"></label>
          <label>이동장비 수<input type="number" min="0" step="1" data-env-field="vehicleCount"></label>
          <label>장비속도(m/s)<input type="number" min="0.1" step="0.1" data-env-field="vehicleSpeed"></label>
          <label>위험반경(m)<input type="number" min="0.5" step="0.5" data-env-field="dangerRadius"></label>
        </div>
        <button class="dash-btn" data-action="environmentUpdate" style="width:100%;margin:8px 0">환경 적용</button>
        <textarea class="scenario-json" data-scenario-json rows="12" spellcheck="false"></textarea>
        <div class="dash-row" style="margin-top:8px">
          <button class="dash-btn" data-action="scenarioTemplate">새 템플릿</button>
          <button class="dash-btn primary" data-action="scenarioApply">검증·실행</button>
        </div>
        <div class="dash-row" style="margin-top:8px">
          <button class="dash-btn" data-action="scenarioSave">JSON 저장</button>
          <button class="dash-btn" data-action="scenarioLoad">JSON 불러오기</button>
          <input data-scenario-file type="file" accept=".json,application/json" hidden />
        </div>
        <div class="scenario-validation" data-scenario-validation>템플릿을 만들거나 JSON을 불러오세요.</div>
        <div class="quick-validation" data-quick-validation></div>
      </section>

      <section class="dash-section">
        <span class="dash-label">뷰 · 연출</span>
        <div class="dash-row">
          <button class="dash-btn" data-action="camera">📷 카메라: 궤도 (C)</button>
          <button class="dash-btn" data-action="mute">🔊 소리 켬 (M)</button>
        </div>
        <div class="dash-row" style="margin-top:8px">
          <button class="dash-btn" data-action="assist">🎯 보조 UI 켬 (H)</button>
          <button class="dash-btn" data-action="hud">📋 정보창 켬 (I)</button>
        </div>
      </section>

      <section class="dash-section">
        <span class="dash-label">기록</span>
        <div class="dash-row">
          <button class="dash-btn" data-action="record">● 기록 시작</button>
          <button class="dash-btn" data-action="replay">▶ 리플레이</button>
        </div>
      </section>

      <section class="dash-section">
        <span class="dash-label">최근 이벤트</span>
        <div class="event-box" data-event>-</div>
      </section>
    `}bind(){this.root.querySelector("#scenario-select").addEventListener("change",e=>{this.handlers.scenario(Number(e.target.value))}),this.root.querySelector("#crane-select").addEventListener("change",e=>{this.handlers.crane(Number(e.target.value))}),this.root.querySelectorAll("[data-speed]").forEach(e=>{e.addEventListener("click",()=>this.handlers.speed(Number(e.dataset.speed)))}),this.root.querySelector("#plan-speed").addEventListener("change",e=>{var n,s;(s=(n=this.handlers).planSpeed)==null||s.call(n,Number(e.target.value))}),this.root.querySelector("[data-plan-seek]").addEventListener("input",e=>{var n,s;(s=(n=this.handlers).planSeek)==null||s.call(n,Number(e.target.value))}),this.root.querySelectorAll("[data-action]").forEach(e=>{e.addEventListener("click",()=>{var n,s;return(s=(n=this.handlers)[e.dataset.action])==null?void 0:s.call(n)})});const t=()=>{this.command={slew:0,luff:0,hoist:0,drive:0,steer:0,tag:0},this.root.querySelectorAll("[data-control]").forEach(e=>e.classList.remove("is-active"))};this.root.querySelectorAll("[data-control]").forEach(e=>{const n=s=>{s.preventDefault(),t(),this.command[e.dataset.control]=Number(e.dataset.value),e.classList.add("is-active")};e.addEventListener("pointerdown",n),e.addEventListener("pointerup",t),e.addEventListener("pointercancel",t),e.addEventListener("pointerleave",t)}),window.addEventListener("pointerup",t),window.addEventListener("blur",t),this.root.querySelector("[data-scenario-file]").addEventListener("change",async e=>{var s,o,a;const n=(s=e.target.files)==null?void 0:s[0];n&&(this.setScenarioJSON(await n.text()),(a=(o=this.handlers).scenarioApply)==null||a.call(o),e.target.value="")}),this.root.querySelector("[data-quick-validation]").addEventListener("click",e=>{var o;const n=e.target.closest("[data-validation-object]");if(!n)return;const s=(o=this.quickValidationIssues)==null?void 0:o[Number(n.dataset.validationObject)];s&&this.selectScenarioObject(s)}),this.root.querySelector("[data-object-select]").addEventListener("change",()=>{z(this,Ze,Xa).call(this)}),this.root.querySelector("[data-plan-editor]").addEventListener("click",e=>{var d,u,p,m;const n=e.target.closest("[data-plan-pick]");if(n){(u=(d=this.handlers).requestSetupPick)==null||u.call(d,Number(n.dataset.index)),n.textContent="3D 지면 더블클릭…";return}const s=e.target.closest("[data-plan-move]");if(!s||!this.editablePlan)return;const o=Number(s.dataset.index),a=Number(s.dataset.planMove),r=this.editablePlan[o],l=this.editablePlan.map((_,g)=>({entry:_,i:g})).filter(({entry:_})=>_.craneId===r.craneId),c=l.findIndex(_=>_.i===o),h=l[c+a];h&&([this.editablePlan[o],this.editablePlan[h.i]]=[this.editablePlan[h.i],this.editablePlan[o]],(m=(p=this.handlers).manualPlan)==null||m.call(p,this.editablePlan.map(_=>({..._}))))}),this.root.querySelector("[data-plan-editor]").addEventListener("change",e=>{var o,a,r,l,c,h;const n=e.target.closest("[data-plan-setup]");if(n&&this.editablePlan){const d=Number(n.dataset.index),u=(a=(o=this.setupAlternatives)==null?void 0:o[d])==null?void 0:a[Number(n.value)];if(!u)return;this.editablePlan[d].setupPos=[...u.pos],this.editablePlan[d].boomLength=u.boomLength,(l=(r=this.handlers).manualPlan)==null||l.call(r,this.editablePlan.map(p=>({...p})));return}const s=e.target.closest("[data-plan-crane]");!s||!this.editablePlan||(this.editablePlan[Number(s.dataset.index)].craneId=s.value,delete this.editablePlan[Number(s.dataset.index)].setupPos,delete this.editablePlan[Number(s.dataset.index)].boomLength,(h=(c=this.handlers).manualPlan)==null||h.call(c,this.editablePlan.map(d=>({...d}))))})}getCommand(){return{...this.command}}getScenarioJSON(){return this.root.querySelector("[data-scenario-json]").value}setScenarioJSON(t){this.root.querySelector("[data-scenario-json]").value=typeof t=="string"?t:JSON.stringify(t,null,2)}setEditorDescriptor(t,e=null){var r,l,c,h,d,u,p,m,_,g,f,x,y,v,w,E,S;this.editorDescriptor=t;const n=this.root.querySelector("[data-object-select]"),s=[["crane","크레인",t.cranes],["load","양중물",t.loads],["obstacle","장애물",t.obstacles],["noFlyZone","제한구역",t.noFlyZones]];n.innerHTML=s.flatMap(([R,b,M])=>M.map(C=>`<option value="${R}:${C.id}">${b} · ${C.name??C.id}</option>`)).join("")||'<option value="">객체 없음</option>',e&&(n.value=`${e.kind}:${e.id}`);const o=t.site??{},a={width:o.width??100,depth:o.depth??80,windSpeed:((r=t.wind)==null?void 0:r.speed)??0,windDirection:(((l=t.wind)==null?void 0:l.dir)??0)*180/Math.PI,maxOperatingWind:((c=t.wind)==null?void 0:c.maxOperating)??15,gustPercent:(((d=(h=t.wind)==null?void 0:h.gust)==null?void 0:d.amp)??0)*100,gustPeriod:((p=(u=t.wind)==null?void 0:u.gust)==null?void 0:p.period)??20,bearingCapacity:((m=t.ground)==null?void 0:m.bearingCapacity)??20,workerCount:(((_=t.agents)==null?void 0:_.workers)??[]).reduce((R,b)=>R+(b.count??1),0),workerSpeed:(x=(f=(g=t.agents)==null?void 0:g.workers)==null?void 0:f[0])!=null&&x.speed?(t.agents.workers[0].speed[0]+t.agents.workers[0].speed[1])/2:1.1,vehicleCount:(((y=t.agents)==null?void 0:y.vehicles)??[]).reduce((R,b)=>R+(b.count??1),0),vehicleSpeed:((E=(w=(v=t.agents)==null?void 0:v.vehicles)==null?void 0:w[0])==null?void 0:E.speed)??2.2,dangerRadius:((S=t.agents)==null?void 0:S.dangerRadius)??5};for(const[R,b]of Object.entries(a))this.root.querySelector(`[data-env-field="${R}"]`).value=b;z(this,Ze,Xa).call(this)}getObjectKind(){return this.root.querySelector("[data-object-kind]").value}getSelectedObject(){const[t,...e]=this.root.querySelector("[data-object-select]").value.split(":");return e.length?{kind:t,id:e.join(":")}:null}getObjectValues(){return Object.fromEntries([...this.root.querySelectorAll("[data-object-field]")].map(t=>[t.dataset.objectField,Number(t.value)]))}getEnvironmentValues(){return Object.fromEntries([...this.root.querySelectorAll("[data-env-field]")].map(t=>[t.dataset.envField,Number(t.value)]))}selectScenarioObject(t){t.kind==="target"&&(t={kind:"load",id:t.id});const e=this.root.querySelector("[data-object-select]");e.value=`${t.kind}:${t.id}`,z(this,Ze,Xa).call(this)}showScenarioValidation(t=[]){const e=this.root.querySelector("[data-scenario-validation]");e.textContent=t.length?t.join(" · "):"검증 통과 — 사용자 시나리오를 실행 중입니다.",e.classList.toggle("validation-danger",t.length>0)}showScenarioPending(){const t=this.root.querySelector("[data-scenario-validation]");t.textContent="배치 변경됨 — 편집 종료 또는 검증·실행 시 시뮬레이션에 적용됩니다.",t.classList.remove("validation-danger")}showQuickValidation(t=[]){const e=this.root.querySelector("[data-quick-validation]");if(this.quickValidationIssues=t,!t.length){e.innerHTML="<strong>빠른 사전검증 통과</strong><span>즉시 확인 가능한 위반이 없습니다.</span>",e.classList.remove("has-errors");return}e.classList.add("has-errors"),e.innerHTML=`<strong>빠른 사전검증 ${t.length}건</strong>`+t.slice(0,8).map((n,s)=>`<button type="button" data-validation-object="${s}">${eu(n.id)} · ${eu(n.message)}</button>`).join("")+(t.length>8?`<span>외 ${t.length-8}건</span>`:"")}setVisualEdit(t){const e=this.root.querySelector("[data-visual-edit]");e.textContent=t?"✓ 3D 배치 편집 종료":"✥ 3D 배치 편집 시작",e.classList.toggle("is-selected",t),this.root.querySelector("[data-visual-help]").textContent=t?"편집 중: 여러 객체를 연속 배치하고, 편집 종료 시 시뮬레이션을 한 번 갱신합니다.":"시작 후 크레인·부재·목표·장애물·제한구역을 클릭해 지면에서 드래그합니다."}setEditorHistory(t,e){this.root.querySelector("[data-editor-undo]").disabled=!t,this.root.querySelector("[data-editor-redo]").disabled=!e}showCalibration(t){var n,s,o;const e=this.root.querySelector("[data-calibration-summary]");if(!((n=t==null?void 0:t.rows)!=null&&n.length)){e.textContent="비교 가능한 양중이 없습니다.";return}e.innerHTML=`<strong>보정계수 ${((s=t.correctionFactor)==null?void 0:s.toFixed(3))??"-"}</strong> · MAE ${((o=t.mae)==null?void 0:o.toFixed(1))??"-"}s<br>`+t.rows.map(a=>{var r,l;return`${a.loadId}: ${((r=a.estimate)==null?void 0:r.toFixed(1))??"-"} → ${((l=a.simulate)==null?void 0:l.toFixed(1))??"-"}s`}).join("<br>")}openScenarioFile(){this.root.querySelector("[data-scenario-file]").click()}getPlanPolicy(){return this.root.querySelector("#plan-policy").value}setPlanResult(t){var h;const e=this.root.querySelector("[data-plan-summary]"),n=this.root.querySelector("[data-gantt]");if(!t){e.textContent="계획을 생성하면 전체 시간축이 표시됩니다.",n.innerHTML="",this.root.querySelector("[data-plan-play]").disabled=!0,this.root.querySelector("[data-plan-reset]").disabled=!0,this.root.querySelector("#plan-speed").disabled=!0,this.root.querySelector("[data-plan-seek]").disabled=!0,this.root.querySelector("[data-plan-editor]").innerHTML="",this.editablePlan=null;return}this.root.querySelector("[data-plan-play]").disabled=!1,this.root.querySelector("[data-plan-reset]").disabled=!1,this.root.querySelector("#plan-speed").disabled=!1;const s=this.root.querySelector("[data-plan-seek]");s.disabled=!1,s.max=String(Math.ceil(t.makespan)),s.value="0";const o=t.makespan/60,a=t.validation3D,r=a?a.valid?" · 3D 검증 정상":` · 3D 충돌 ${a.violations.length}구간`:"",l=(h=t.repairs)!=null&&h.length?` · 자동수정 ${t.repairs.length}회`:"";e.innerHTML=`<strong>${t.completed}/${t.total}건 완료 · ${o.toFixed(1)}분</strong><span>이동 ${t.perCrane.reduce((d,u)=>d+u.travelDistance,0).toFixed(0)}m · soft 간섭 ${t.softConflicts} · 실패 ${t.failed.length}${l}${r}</span>`+(a&&!a.valid?`<span class="validation-danger">${Object.entries(a.byType).map(([d,u])=>`${d} ${u}`).join(" · ")}</span>`:"");const c=Math.max(1,t.makespan);n.innerHTML=t.perCrane.map(d=>{const p=t.events.filter(m=>m.craneId===d.craneId).map(m=>{const _=m.start/c*100,g=Math.max(.7,m.duration/c*100);return`<span class="gantt-bar ${m.type}" style="left:${_}%;width:${g}%" title="${m.type} · ${m.loadId??"최종"} · ${(m.duration/60).toFixed(1)}분"></span>`}).join("");return`<div class="gantt-lane"><span class="gantt-name">${d.craneId}</span><div class="gantt-track">${p}</div></div>`}).join(""),this.editablePlan=(t.manualPlan??[...t.assignments].sort((d,u)=>d.craneId.localeCompare(u.craneId)||d.liftStart-u.liftStart).map(d=>({craneId:d.craneId,loadId:d.loadId,setupPos:[...d.setupPos],boomLength:d.boomLength}))).map(d=>({...d})),this.setupAlternatives={};for(let d=0;d<this.editablePlan.length;d++){const u=this.editablePlan[d],p=t.assignments.find(g=>g.craneId===u.craneId&&g.loadId===u.loadId),m=p?[{pos:p.setupPos,boomLength:p.boomLength,move:p.move,capacityMargin:p.capacityMargin}]:[],_=(p==null?void 0:p.setupAlternatives)??[];this.setupAlternatives[d]=[...m,..._].filter((g,f,x)=>x.findIndex(y=>Math.hypot(y.pos[0]-g.pos[0],y.pos[1]-g.pos[1])<.1&&y.boomLength===g.boomLength)===f).slice(0,5)}z(this,Ze,Xf).call(this,t)}applySetupPoint(t,e){var n,s,o;(n=this.editablePlan)!=null&&n[t]&&(this.editablePlan[t].setupPos=[...e],(o=(s=this.handlers).manualPlan)==null||o.call(s,this.editablePlan.map(a=>({...a}))))}showPlanError(t){this.root.querySelector("[data-plan-summary]").innerHTML=`<strong class="validation-danger">계획 수정 불가</strong><span>${t}</span>`}setPlanPlayback(t,e=0,n=0){const s=this.root.querySelector("[data-plan-play]");s.textContent=t?`■ 3D 재생 정지 · ${(e/60).toFixed(1)}/${(n/60).toFixed(1)}분`:`▶ 3D 계획 재생 · ${(e/60).toFixed(1)}/${(n/60).toFixed(1)}분`,this.root.querySelector("[data-plan-seek]").value=String(Math.round(e));const o=this.root.querySelector("[data-gantt]");let a=o.querySelector(".gantt-cursor");a||(a=document.createElement("div"),a.className="gantt-cursor",o.appendChild(a)),a.style.left=`${e/Math.max(1,n)*100}%`}setScenario(t){this.root.querySelector("#scenario-select").value=String(t)}addScenario(t,e){const n=this.root.querySelector("#scenario-select"),s=document.createElement("option");s.value=String(e),s.textContent=t.name,n.appendChild(s)}renameScenario(t,e){const n=this.root.querySelector(`#scenario-select option[value="${t}"]`);n&&(n.textContent=e)}setCranes(t,e){const n=this.root.querySelector("#crane-select");n.innerHTML=t.map((s,o)=>`<option value="${o}">${o+1}. ${s.name??s.type}</option>`).join(""),n.value=String(e)}setActiveCrane(t){this.root.querySelector("#crane-select").value=String(t)}setCameraMode(t){this.root.querySelector('[data-action="camera"]').textContent=`📷 카메라: ${t} (C)`}setMuted(t){this.root.querySelector('[data-action="mute"]').textContent=t?"🔇 소리 꺼짐 (M)":"🔊 소리 켬 (M)"}setHud(t){this.root.querySelector('[data-action="hud"]').textContent=t?"📋 정보창 켬 (I)":"📋 정보창 꺼짐 (I)"}setAssist(t){this.root.querySelector('[data-action="assist"]').textContent=t?"🎯 보조 UI 켬 (H)":"🎯 보조 UI 꺼짐 (H)"}update(t,e,n){var p,m;const s=t.cranes[e],o=t.safety??{},a=t.loads.filter(_=>_.target),r=a.filter(_=>_.state==="placed").length,l=(((p=o.collisionIds)==null?void 0:p.length)??0)>0||o.zoneViolation||(o.cranePairs??[]).some(_=>_.clash)||(((m=o.agentHolds)==null?void 0:m.length)??0)>0||s.extra.limiterActive;z(this,Ze,Xi).call(this,"time",`${t.time.toFixed(1)} s`),z(this,Ze,Xi).call(this,"radius",`${s.radius.toFixed(1)} m`),z(this,Ze,Xi).call(this,"hook",`${s.hookHeight.toFixed(1)} m`),z(this,Ze,Xi).call(this,"load",s.loadMass>0?`${(s.loadRatio*100).toFixed(0)} %`:"-"),z(this,Ze,Xi).call(this,"progress",`${r} / ${a.length}`),z(this,Ze,Xi).call(this,"safety",l?"주의":"정상");const c=this.root.querySelector('[data-metric="safety"]');c.classList.toggle("safe",!l),c.classList.toggle("danger",l),this.root.querySelector("[data-event]").textContent=t.lastEvent??"-",this.root.querySelectorAll("[data-speed]").forEach(_=>{_.classList.toggle("is-selected",Number(_.dataset.speed)===n.speed)});const h=this.root.querySelector('[data-action="pause"]');h.textContent=n.paused?"▶ 계속":"⏸ 일시정지";const d=this.root.querySelector('[data-action="record"]');d.textContent=n.recording?"■ 기록 종료":"● 기록 시작",this.root.querySelector('[data-action="replay"]').disabled=!n.canReplay||n.recording;const u=this.root.querySelector("[data-status-dot]");u.className=`status-dot${n.recording?" recording":n.paused?" paused":""}`,this.root.querySelector("[data-status]").textContent=n.recording?"작업 기록 중":n.playing?"리플레이 재생 중":n.paused?"일시정지됨":"시뮬레이션 실행 중"}}Ze=new WeakSet,Xa=function(){const t=this.getSelectedObject();if(!t||!this.editorDescriptor)return;const n=(t.kind==="noFlyZone"?this.editorDescriptor.noFlyZones:this.editorDescriptor[`${t.kind}s`]).find(l=>l.id===t.id);if(!n)return;const s=t.kind==="noFlyZone",o=s?[(n.min[0]+n.max[0])/2,(n.min[1]+n.max[1])/2]:n.pos,a=s?[n.max[0]-n.min[0],.1,n.max[1]-n.min[1]]:n.size??[1,1,1],r={x:o[0],z:o[1],width:a[0],height:a[1],depth:a[2],mass:n.mass??1};for(const[l,c]of Object.entries(r))this.root.querySelector(`[data-object-field="${l}"]`).value=c},Xi=function(t,e){this.root.querySelector(`[data-metric="${t}"]`).textContent=e},Xf=function(t){const e=this.root.querySelector("[data-plan-editor]"),n=t.perCrane.map(s=>s.craneId);e.innerHTML=n.map(s=>{const o=this.editablePlan.map((a,r)=>({item:a,index:r})).filter(({item:a})=>a.craneId===s);return`<div class="queue-lane">
        <div class="queue-title">${s}<span>${o.length}건</span></div>
        ${o.map(({item:a,index:r},l)=>{var c;return`<div class="queue-item">
          <span class="queue-order">${l+1}</span>
          <strong>${a.loadId}</strong>
          <select data-plan-crane data-index="${r}">
            ${n.map(h=>`<option value="${h}"${h===a.craneId?" selected":""}>${h}</option>`).join("")}
          </select>
          <button data-plan-move="-1" data-index="${r}" title="앞으로">↑</button>
          <button data-plan-move="1" data-index="${r}" title="뒤로">↓</button>
          <div class="setup-editor">
            <select data-plan-setup data-index="${r}" title="추천 셋업 후보">
              ${(((c=this.setupAlternatives)==null?void 0:c[r])??[]).map((h,d)=>`<option value="${d}">[${h.pos.map(u=>u.toFixed(0)).join(",")}] · 붐 ${h.boomLength}m · 이동 ${h.move.toFixed(0)}m · 여유 ${h.capacityMargin.toFixed(1)}t</option>`).join("")}
            </select>
            <button data-plan-pick data-index="${r}">3D에서 셋업 선택</button>
          </div>
        </div>`}).join("")||'<div class="queue-empty">배정 없음</div>'}
      </div>`}).join("")};const cn=(i,t,e)=>i+(t-i)*e,Pc=i=>Math.max(0,Math.min(1,i)),mM=.6;function nu(i,t){if(!(i!=null&&i.length))return[0,0];if(i.length===1)return i[0];const e=[];let n=0;for(let o=1;o<i.length;o++){const a=Math.hypot(i[o][0]-i[o-1][0],i[o][1]-i[o-1][1]);e.push(a),n+=a}let s=Pc(t)*n;for(let o=0;o<e.length;o++){if(s<=e[o]||o===e.length-1){const a=e[o]>0?s/e[o]:0;return[cn(i[o][0],i[o+1][0],a),cn(i[o][1],i[o+1][1],a)]}s-=e[o]}return i[i.length-1]}var bn,Ic,qi;class Lc{constructor(t,e){Le(this,bn);this.scenario=t,this.result=e,this.time=0,this.playing=!1,this.speed=300,this.trucks=(t.trucks??_r(t)).map(n=>new gr(n))}toggle(){this.time>=this.result.makespan&&(this.time=0),this.playing=!this.playing}reset(){this.time=0,this.playing=!1}setSpeed(t){this.speed=Math.max(1,Number(t)||1)}seek(t){this.time=Math.max(0,Math.min(this.result.makespan,Number(t)||0))}update(t){this.playing&&(this.time=Math.min(this.result.makespan,this.time+t*this.speed),this.time>=this.result.makespan&&(this.playing=!1))}stateAt(t,e=this.time){var r;const n=structuredClone(t);n.time=e;const s=new Map(this.scenario.cranes.map((l,c)=>[l.id,c])),o=new Map(n.loads.map((l,c)=>[l.id,c])),a=new Set;for(const l of this.result.assignments){if(l.tandem){for(const _ of l.cranePlans){const g=s.get(_.craneId),f=n.cranes[g];let x=_.fromPos;if(e>=_.travelFinish)x=_.setupPos;else if(e>=_.travelStart&&_.travelFinish>_.travelStart)x=nu(_.movePath,(e-_.travelStart)/(_.travelFinish-_.travelStart));else continue;const y=x[0]-f.basePos[0],v=x[1]-f.basePos[2];f.basePos=[x[0],f.basePos[1],x[1]],f.hookPos=[f.hookPos[0]+y,f.hookPos[1],f.hookPos[2]+v]}continue}const c=s.get(l.craneId);if(c==null)continue;const h=n.cranes[c];let d=l.fromPos;if(e>=l.travelFinish)d=l.setupPos;else if(e>=l.travelStart&&l.travelFinish>l.travelStart)d=nu(l.movePath,(e-l.travelStart)/(l.travelFinish-l.travelStart));else if(e<l.travelStart)continue;const u=h.basePos,p=d[0]-u[0],m=d[1]-u[2];h.basePos=[d[0],u[1],d[1]],h.hookPos=[h.hookPos[0]+p,h.hookPos[1],h.hookPos[2]+m]}for(const l of this.result.assignments){const c=o.get(l.loadId);if(c==null)continue;const h=n.loads[c],d=this.scenario.loads.find(x=>x.id===l.loadId);if(!d)continue;const u=l.pickupPos??d.pos,p=l.targetPos??d.target;if(!p)continue;const m=p.length===3?p:[p[0],u[1],p[1]],_=(((r=h.size)==null?void 0:r[1])??1)/2+mM;if(l.tandem){const x=Pc((e-l.liftStart)/l.liftDuration);if(e>=l.liftFinish)h.pos=[...m],h.state="placed";else if(e>=l.liftStart){const y=Math.max(u[1],m[1])+12,v=x<.3?0:x<.7?(x-.3)/.4:1,w=x<.3?cn(u[1],y,x/.3):x<.7?y:cn(y,m[1],(x-.7)/.3);h.pos=[cn(u[0],m[0],v),w,cn(u[2],m[2],v)],h.state="hooked";const E=l.liftPoints??[[-4,0],[4,0]];l.cranePlans.forEach((S,R)=>{const b=n.cranes[s.get(S.craneId)];a.add(S.craneId),z(this,bn,qi).call(this,b,{...l,craneId:S.craneId,boomLength:S.boomLength},[h.pos[0]+E[R][0],h.pos[1]+_,h.pos[2]+(E[R][1]??0)])})}continue}const g=[u[0],u[1]+_,u[2]],f=[m[0],m[1]+_,m[2]];if(e>=l.liftFinish)h.pos=[...m],h.state=l.stage>=l.stages-1?"placed":"ground",h.stage=Math.min(l.stage+1,l.stages-1),h.stageChangedAt=l.liftFinish,l.stage===0&&l.stages>1&&(h.yardedAt=l.liftFinish);else if(e>=l.liftStart){a.add(l.craneId);const x=Pc((e-l.liftStart)/l.liftDuration),y=n.cranes[s.get(l.craneId)],v=Math.max(u[1],m[1])+12;if(x<.15){z(this,bn,Ic).call(this,y,this.scenario.cranes[s.get(l.craneId)]);const w=[...y.hookPos],E=x/.15;h.pos=[...u],h.state="ground",z(this,bn,qi).call(this,y,l,[cn(w[0],g[0],E),cn(w[1],g[1],E),cn(w[2],g[2],E)])}else if(x<.35){const w=(x-.15)/.2;h.pos=[u[0],cn(u[1],v,w),u[2]],h.state="hooked",z(this,bn,qi).call(this,y,l,[h.pos[0],h.pos[1]+_,h.pos[2]])}else if(x<.7){const w=(x-.35)/.35;h.pos=[cn(u[0],m[0],w),v,cn(u[2],m[2],w)],h.state="hooked",z(this,bn,qi).call(this,y,l,[h.pos[0],h.pos[1]+_,h.pos[2]])}else if(x<.9){const w=(x-.7)/.2;h.pos=[m[0],cn(v,m[1],w),m[2]],h.state="hooked",z(this,bn,qi).call(this,y,l,[h.pos[0],h.pos[1]+_,h.pos[2]])}else h.pos=[...m],h.state=l.stage>=l.stages-1?"placed":"ground",h.stage=Math.min(l.stage+1,l.stages-1),h.stageChangedAt=l.liftFinish,l.stage===0&&l.stages>1&&(h.yardedAt=l.liftFinish),z(this,bn,qi).call(this,y,l,f)}else(l.stage??0)===0&&e<(d.arriveTime??0)?(h.pos=[...u],h.state="pending"):(h.stage??0)===(l.stage??0)&&(h.pos=[...u],h.state="ground")}for(let l=0;l<n.cranes.length;l++){const c=this.scenario.cranes[l];a.has(c.id)||z(this,bn,Ic).call(this,n.cranes[l],c)}return n.trucks=this.trucks.map(l=>l.snapshot(e,l.departAtFrom(n.loads))),n.lastEvent=this.currentEvent(e),n}currentEvent(t=this.time){const e=this.result.events.filter(n=>t>=n.start&&t<n.finish);return e.length?e.map(n=>`${n.craneId} ${n.type}${n.loadId?` ${n.loadId}`:""}`).join(" · "):"계획 대기"}}bn=new WeakSet,Ic=function(t,e){var u,p;const[n,s,o]=t.basePos,a=((u=this.result.parkSlewAngles)==null?void 0:u[e.id])??((p=e.planning)==null?void 0:p.parkSlewAngle)??0;if(t.slewAngle=a,e.type==="tower"){const m=e.geometry.trolleyMin??2.5,_=s+Math.max(2,e.geometry.mastHeight-10);t.radius=m,t.extra.trolleyPos=m,t.extra.ropeLength=e.geometry.mastHeight+s-_,t.hookPos=[n+m*Math.cos(a),_,o+m*Math.sin(a)],t.hookHeight=_;return}const r=t.extra.boomLength??e.geometry.boomLength,l=e.limits.boomAngleMax,c=(e.geometry.pivotOffset??0)+r*Math.cos(l),h=s+e.geometry.pivotHeight+r*Math.sin(l),d=Math.max(s+2,h-Math.max(e.limits.ropeMin,5));t.radius=c,t.extra.boomAngle=l,t.extra.boomTipY=h-s,t.extra.ropeLength=h-d,t.hookPos=[n+c*Math.cos(a),d,o+c*Math.sin(a)],t.hookHeight=d},qi=function(t,e,n){if(!t)return;const s=this.scenario.cranes.find(f=>f.id===e.craneId);if(!s)return;const[o,a,r]=t.basePos,l=n[0]-o,c=n[2]-r,h=Math.hypot(l,c),d=n[1];if(t.slewAngle=Math.atan2(c,l),t.hookPos=[...n],t.hookHeight=d,s.type==="tower"){const f=s.geometry.trolleyMin??2.5,x=Math.max(f,Math.min(s.geometry.jibLength,h));t.radius=x,t.extra.trolleyPos=x,t.extra.ropeLength=Math.max(s.limits.ropeMin??0,s.geometry.mastHeight+a-d);return}const u=e.boomLength??s.geometry.boomLength,p=s.geometry.pivotOffset??0,m=Math.max(0,Math.min(u,h-p)),_=Math.acos(m/u),g=a+s.geometry.pivotHeight+u*Math.sin(_);t.radius=p+m,t.extra.boomAngle=_,t.extra.boomLength=u,t.extra.boomTipY=g-a,t.extra.ropeLength=Math.max(s.limits.ropeMin??0,g-d)};const hn=1e-9;function ah(i,t=0){const e=i.min??[i.x1,i.y1],n=i.max??[i.x2,i.y2];return{id:i.id,minX:Math.min(e[0],n[0])-t,minZ:Math.min(e[1],n[1])-t,maxX:Math.max(e[0],n[0])+t,maxZ:Math.max(e[1],n[1])+t}}function js(i,t,e=0){const n=ah(t,e);return i[0]>=n.minX&&i[0]<=n.maxX&&i[1]>=n.minZ&&i[1]<=n.maxZ}function So(i,t,e){return(t[0]-i[0])*(e[1]-i[1])-(t[1]-i[1])*(e[0]-i[0])}function Ra(i,t,e){return Math.abs(So(i,t,e))<=hn&&e[0]>=Math.min(i[0],t[0])-hn&&e[0]<=Math.max(i[0],t[0])+hn&&e[1]>=Math.min(i[1],t[1])-hn&&e[1]<=Math.max(i[1],t[1])+hn}function gM(i,t,e,n){const s=So(i,t,e),o=So(i,t,n),a=So(e,n,i),r=So(e,n,t);return(s>hn&&o<-hn||s<-hn&&o>hn)&&(a>hn&&r<-hn||a<-hn&&r>hn)?!0:Ra(i,t,e)||Ra(i,t,n)||Ra(e,n,i)||Ra(e,n,t)}function iu(i,t,e=[],n=0){for(const s of e){const o=ah(s,n);if(js(i,s,n)||js(t,s,n))return!0;const a=[[o.minX,o.minZ],[o.maxX,o.minZ],[o.maxX,o.maxZ],[o.minX,o.maxZ]];for(let r=0;r<4;r++)if(gM(i,t,a[r],a[(r+1)%4]))return!0}return!1}const su=(i,t)=>Math.hypot(i[0]-t[0],i[1]-t[1]);function qf(i,t,e=[],n={}){const s=n.clearance??1,o=su(i,t);if(e.some(p=>js(i,p,s)||js(t,p,s)))return{ok:!1,path:[],distance:1/0,directDistance:o,detourDistance:1/0};if(!iu(i,t,e,s))return{ok:!0,path:[i,t],distance:o,directDistance:o,detourDistance:0};const a=[i,t];for(const p of e){const m=ah(p,s);a.push([m.minX,m.minZ],[m.maxX,m.minZ],[m.maxX,m.maxZ],[m.minX,m.maxZ])}const r=Array.from({length:a.length},()=>[]);for(let p=0;p<a.length;p++)for(let m=p+1;m<a.length;m++){if(iu(a[p],a[m],e,0))continue;const _=su(a[p],a[m]);r[p].push([m,_]),r[m].push([p,_])}const l=new Array(a.length).fill(1/0),c=new Array(a.length).fill(-1),h=new Array(a.length).fill(!1);l[0]=0;for(let p=0;p<a.length;p++){let m=-1;for(let _=0;_<a.length;_++)!h[_]&&(m<0||l[_]<l[m])&&(m=_);if(m<0||!Number.isFinite(l[m])||m===1)break;h[m]=!0;for(const[_,g]of r[m])l[m]+g<l[_]&&(l[_]=l[m]+g,c[_]=m)}if(!Number.isFinite(l[1]))return{ok:!1,path:[],distance:1/0,directDistance:o,detourDistance:1/0};const d=[];for(let p=1;p>=0&&(d.push(p),p!==0);p=c[p]);return d.reverse(),{ok:!0,path:d.map(p=>a[p]),distance:l[1],directDistance:o,detourDistance:Math.max(0,l[1]-o)}}const Zs=i=>i.length===3?[i[0],i[2]]:[i[0],i[1]],os=(i,t)=>Math.hypot(i[0]-t[0],i[1]-t[1]),nr=(i,t,e=.25)=>os(i,t)<=e,_M=["earliestFinish","nearest","radiusPriority"];function vM(i){const t=i.liftPoints??[[-Math.max(i.size[0],i.size[2])*.4,0],[Math.max(i.size[0],i.size[2])*.4,0]],e=i.cog??[0,0],n=t.map(o=>1/Math.max(1e-6,Math.hypot(o[0]-e[0],(o[1]??0)-(e[1]??0)))),s=n[0]+n[1];return n.map(o=>i.mass*o/s)}function xM(i,t,e,n={}){if(!t.tandem||e.length<2)return[];const s=vM(t),o=t.liftPoints??[[-Math.max(t.size[0],t.size[2])*.4,0],[Math.max(t.size[0],t.size[2])*.4,0]],a=[];for(let r=0;r<e.length;r++)for(let l=r+1;l<e.length;l++){const c=[e[r],e[l]],h=c.map((d,u)=>{const p={...t,tandem:!1,mass:s[u],pos:[t.pos[0]+o[u][0],t.pos[1],t.pos[2]+(o[u][1]??0)],target:[t.target[0]+o[u][0],t.target[1],t.target[2]+(o[u][1]??0)]};return ir(d.spec,p,i,d.pos,n)[0]??null});h.every(Boolean)&&a.push({craneStates:c,craneIds:c.map(d=>d.spec.id),setups:h,shares:s,move:h[0].path.distance+h[1].path.distance})}return a}function Yf(i){var l;const t=[],e=new Set,n=new Set;for(const[c,h]of(i.cranes??[]).entries())h.id||t.push(`cranes[${c}].id 누락`),e.has(h.id)&&t.push(`중복 crane id: ${h.id}`),e.add(h.id);for(const[c,h]of(i.loads??[]).entries())h.id||t.push(`loads[${c}].id 누락`),!h.target&&!((l=h.route)!=null&&l.length)&&t.push(`${h.id??c}: target 또는 route 누락`),n.has(h.id)&&t.push(`중복 load id: ${h.id}`),n.add(h.id);for(const c of i.loads??[])for(const h of c.dependsOn??[])n.has(h)||t.push(`${c.id}: 존재하지 않는 선행 작업 ${h}`);const s=new Set,o=new Set,a=new Map((i.loads??[]).map(c=>[c.id,c])),r=c=>{var h;if(s.has(c))return!0;if(o.has(c))return!1;s.add(c);for(const d of((h=a.get(c))==null?void 0:h.dependsOn)??[])if(r(d))return!0;return s.delete(c),o.add(c),!1};for(const c of n)if(r(c)){t.push(`선행 작업 순환: ${c}`);break}return{valid:t.length===0,errors:t}}function ou(i){const t=i.loads.filter(e=>{var n;return(((n=e.route)==null?void 0:n.length)??0)>1}).map(e=>`${e.id}@0`);return i.loads.flatMap(e=>{var o;const n=(o=e.route)!=null&&o.length?e.route:[{target:e.target,elev:e.targetElev??0}];let s=[...e.pos];return s.length===2?s=[s[0],(e.elev??0)+e.size[1]/2,s[1]]:s[1]=(e.elev??s[1]-e.size[1]/2)+e.size[1]/2,n.map((a,r)=>{const l=a.elev??0,c=[a.target[0],l+e.size[1]/2,a.target[1]],h=`${e.id}@${r}`,d=r>0?[`${e.id}@${r-1}`]:[],u=r>0?t.filter(_=>_!==`${e.id}@0`):[],p=r===n.length-1?(e.dependsOn??[]).map(_=>{var f;const g=i.loads.find(x=>x.id===_);return`${_}@${Math.max(0,(((f=g==null?void 0:g.route)==null?void 0:f.length)??1)-1)}`}):[],m={...e,id:h,loadId:e.id,jobId:h,stage:r,stages:n.length,pos:[...s],target:[...c],targetElev:l,dependsOn:[...new Set([...d,...u,...p])],arriveTime:r===0?e.arriveTime??0:0};return s=[...c],m})})}function yM(i){return i.restrictedZones??i.noFlyZones??[]}function MM(i){return(i.obstacles??[]).map(t=>{const e=Zs(t.pos),n=t.size??[1,1,1];return{id:`obstacle:${t.id??"unknown"}`,min:[e[0]-n[0]/2,e[1]-n[2]/2],max:[e[0]+n[0]/2,e[1]+n[2]/2],kind:"obstacle"}})}function bM(i,t){return i.cranes.filter(e=>{var n;return e.id!==t.id&&(((n=e.planning)==null?void 0:n.movable)??e.type!=="tower")===!1}).map(e=>{const n=Zs(e.basePos),s=e.geometry.bodyRadius??Math.max(e.geometry.bodyWidth??2,e.geometry.bodyLength??2)/2;return{id:`fixed-crane:${e.id}`,min:[n[0]-s,n[1]-s],max:[n[0]+s,n[1]+s],kind:"fixedCrane"}})}function SM(i){return(i.trucks??_r(i)).map(t=>new gr(t).dockZone(.5))}function jf(i,t){return[...yM(i),...MM(i),...bM(i,t),...SM(i)]}function Zf(i,t){const e=t.site;if(!e)return!0;const n=e.minX??-((e.width??200)/2),s=e.maxX??n+(e.width??200),o=e.minZ??-((e.depth??200)/2),a=e.maxZ??o+(e.depth??200);return i[0]>=n&&i[0]<=s&&i[1]>=o&&i[1]<=a}function Dc(i){var t;return i.type==="tower"?[i.geometry.jibLength]:((t=i.capacityChart)==null?void 0:t.map(e=>e[0]))??[i.geometry.boomLength]}function ir(i,t,e,n,s={}){var f,x,y,v;const o=jf(e,i),a=s.bodyClearance??Math.max(i.geometry.bodyRadius??Math.max(i.geometry.bodyWidth??2,i.geometry.bodyLength??2)/2,i.geometry.tailSwingRadius??0),r=s.angles??16,l=s.rings??5,c=s.topK??8,h=Zs(t.pos),d=Zs(t.target),u=[(h[0]+d[0])/2,(h[1]+d[1])/2],p=[n,u,h,d];for(const w of Dc(i)){const[,E]=Ys(i,w);for(let S=1;S<=l;S++){const R=E*.9*S/l;for(let b=0;b<r;b++){const M=2*Math.PI*b/r;p.push([u[0]+R*Math.cos(M),u[1]+R*Math.sin(M)])}}}const m=[],_=new Set;for(const w of p){const E=`${w[0].toFixed(2)},${w[1].toFixed(2)}`;_.has(E)||!Zf(w,e)||o.some(S=>js(w,S,a))||(_.add(E),m.push(w))}const g=[];for(const w of Dc(i))for(const E of m){const S=(x=(f=i.configurations)==null?void 0:f.find(C=>C.boomLength===w))==null?void 0:x.id,R=xr(i,{pos:E,boomLength:w,configId:S},[t],e);if(!R.feasible)continue;const b=qf(n,E,o,{clearance:a});if(!b.ok)continue;const M=R.lifts[0];g.push({pos:E,boomLength:w,path:b,sameSetup:nr(n,E),pickupRadius:M.rLoad,targetRadius:M.rTarget,actualRadius:Math.max(M.rLoad,M.rTarget),requiredBoomLength:M.requiredBoomLength,capacityMargin:R.minCapMargin,tippingMargin:R.minTipMargin,groundPressure:R.maxGroundPressure,assemblyTime:((y=R.assembly)==null?void 0:y.duration)??0,assemblyCost:((v=R.assembly)==null?void 0:v.cost)??0})}return g.sort((w,E)=>Number(E.sameSetup)-Number(w.sameSetup)||w.path.distance-E.path.distance||E.capacityMargin-w.capacityMargin||w.boomLength-E.boomLength),g.slice(0,c)}function wM(i,t,e,n,s,o,a={}){var _,g,f;const r=Zs(s),l=jf(e,i),c=a.bodyClearance??Math.max(i.geometry.bodyRadius??Math.max(i.geometry.bodyWidth??2,i.geometry.bodyLength??2)/2,i.geometry.tailSwingRadius??0);if(!Zf(r,e))return{feasible:!1,reason:"현장 경계 밖 셋업"};const h=l.find(x=>js(r,x,c));if(h)return{feasible:!1,reason:`셋업 금지영역: ${h.id}`};const d=o??Dc(i)[0],u=xr(i,{pos:r,boomLength:d},[t],e);if(!u.feasible)return{feasible:!1,reason:((_=u.lifts[0])==null?void 0:_.reason)??"셋업 불가"};const p=qf(n,r,l,{clearance:c});if(!p.ok)return{feasible:!1,reason:"셋업 위치까지 이동 경로 없음"};const m=u.lifts[0];return{feasible:!0,pos:r,boomLength:d,path:p,sameSetup:nr(n,r),pickupRadius:m.rLoad,targetRadius:m.rTarget,actualRadius:Math.max(m.rLoad,m.rTarget),requiredBoomLength:m.requiredBoomLength,capacityMargin:u.minCapMargin,tippingMargin:u.minTipMargin,groundPressure:u.maxGroundPressure,assemblyTime:((g=u.assembly)==null?void 0:g.duration)??0,assemblyCost:((f=u.assembly)==null?void 0:f.cost)??0}}function vn(i,t,e,n,s,o,a,r={}){a<=o+1e-9||i.push({assignmentId:t,craneId:e,loadId:n,type:s,start:o,finish:a,duration:a-o,...r})}function Po(i,t,e,n){return i<n-1e-9&&e<t-1e-9}function wo(i,t,e){const n=e[0]-t[0],s=e[1]-t[1],o=n*n+s*s;if(o<=1e-12)return os(i,t);const a=Math.max(0,Math.min(1,((i[0]-t[0])*n+(i[1]-t[1])*s)/o));return os(i,[t[0]+n*a,t[1]+s*a])}function EM(i,t,e,n){const s=(c,h,d)=>(h[0]-c[0])*(d[1]-c[1])-(h[1]-c[1])*(d[0]-c[0]),o=s(i,t,e),a=s(i,t,n),r=s(e,n,i),l=s(e,n,t);return(o>=0&&a<=0||o<=0&&a>=0)&&(r>=0&&l<=0||r<=0&&l>=0)?0:Math.min(wo(i,e,n),wo(t,e,n),wo(e,i,t),wo(n,i,t))}function Uc(i,t){if(!(i!=null&&i.length))return 1/0;if(i.length===1)return os(i[0],t);let e=1/0;for(let n=1;n<i.length;n++)e=Math.min(e,wo(t,i[n-1],i[n]));return e}function TM(i,t){if(!(i!=null&&i.length)||!(t!=null&&t.length))return 1/0;if(i.length===1)return Uc(t,i[0]);if(t.length===1)return Uc(i,t[0]);let e=1/0;for(let n=1;n<i.length;n++)for(let s=1;s<t.length;s++)e=Math.min(e,EM(i[n-1],i[n],t[s-1],t[s]));return e}function au(i,t,e){const n=os(i.setupPos,t.setupPos),s=Po(i.liftStart,i.liftFinish,t.liftStart,t.liftFinish)&&n<i.actualRadius+t.actualRadius+(e.hardClearance??0),o=i.workingRadius,a=t.workingRadius,r=Po(i.liftStart,i.liftFinish,t.liftStart,t.liftFinish)&&n<o+a+(e.softClearance??0);return{hard:s,soft:r,baseDist:n}}function Kf(i,t,e,n,s,o,a={}){var B,X,W;const r=t.spec,l=r.planning??{};if(!(l.movable??r.type!=="tower")&&!nr(t.pos,o.pos))return{feasible:!1,reason:"고정식 크레인은 셋업 위치를 변경할 수 없음"};const h=Math.max(0,...(e.dependsOn??[]).map(Y=>{var V;return((V=n.get(Y))==null?void 0:V.liftFinish)??-1/0}));if(!Number.isFinite(h))return{feasible:!1,blocked:!0,reason:"선행 작업 미완료"};const d=nr(t.pos,o.pos),u=d||t.jobs===0?0:l.teardownTime??300,p=Math.max(.01,l.travelSpeed??1.5),m=d?0:o.path.distance/p,_=(d&&t.jobs>0?0:l.setupTime??(r.type==="tower"?0:600))+(o.assemblyTime??0),g=e.duration??((B=i.planning)==null?void 0:B.defaultLiftDuration)??1200,f=t.available;let x=0,y=f,v=y+u,w=v,E=w+m,S=E,R=S+_,b=Math.max(R,e.arriveTime??0,h);b=Math.max(b,((X=a.notBefore)==null?void 0:X[`${r.id}:${e.id}`])??0);let M=b+g,C=[];const U=r.geometry.bodyRadius??Math.max(r.geometry.bodyWidth??2,r.geometry.bodyLength??2)/2;for(let Y=0;Y<s.length+1;Y++){const V=s.map(Q=>{if(Q.craneId===r.id)return null;const ft=i.cranes.find(at=>at.id===Q.craneId),Bt=(ft==null?void 0:ft.geometry.bodyRadius)??Math.max((ft==null?void 0:ft.geometry.bodyWidth)??2,(ft==null?void 0:ft.geometry.bodyLength)??2)/2,Kt=U+Bt+(a.setupClearance??1),q=Po(S,M,Q.setupStart,Q.liftFinish)&&os(o.pos,Q.setupPos)<Kt,tt=m>0&&Po(w,E,Q.setupStart,Q.liftFinish)&&Uc(o.path.path,Q.setupPos)<Kt,gt=m>0&&Q.travelTime>0&&Po(w,E,Q.travelStart,Q.travelFinish)&&TM(o.path.path,Q.movePath)<Kt;return!q&&!tt&&!gt?null:{assignment:Q,waitUntil:q||tt?Q.liftFinish:Q.travelFinish}}).filter(Boolean);if(!V.length)break;const it=Math.max(...V.map(Q=>Q.waitUntil));x=Math.max(x,it-f),y=f+x,v=y+u,w=v,E=w+m,S=E,R=S+_,b=Math.max(R,e.arriveTime??0,h),b=Math.max(b,((W=a.notBefore)==null?void 0:W[`${r.id}:${e.id}`])??0),M=b+g}for(let Y=0;Y<s.length+1;Y++){const V={setupPos:o.pos,actualRadius:o.actualRadius,workingRadius:l.workingRadius??Ys(r,o.boomLength)[1],liftStart:b,liftFinish:M},it=s.filter(Q=>Q.craneId!==r.id).map(Q=>({a:Q,c:au(V,Q,a)})).filter(Q=>Q.c.hard);if(!it.length)break;C=it.map(Q=>Q.a.assignmentId),b=Math.max(b,...it.map(Q=>Q.a.liftFinish)),M=b+g}const O={feasible:!0,assignmentId:`${r.id}:${e.jobId??e.id}`,craneId:r.id,loadId:e.loadId??e.id,jobId:e.jobId??e.id,stage:e.stage??0,stages:e.stages??1,pickupPos:[...e.pos],targetPos:[...e.target],setupPos:o.pos,fromPos:t.pos,boomLength:o.boomLength,movePath:o.path.path,directMove:o.path.directDistance,move:o.path.distance,detourDistance:o.path.detourDistance,sameSetup:d,pickupRadius:o.pickupRadius,targetRadius:o.targetRadius,actualRadius:o.actualRadius,requiredBoomLength:o.requiredBoomLength,capacityMargin:o.capacityMargin,workingRadius:l.workingRadius??Ys(r,o.boomLength)[1],teardownStart:y,teardownFinish:v,travelStart:w,travelFinish:E,setupStart:S,setupFinish:R,liftStart:b,liftFinish:M,teardownTime:u,travelTime:m,setupTime:_,liftDuration:g,assemblyCost:o.assemblyCost??0,spatialWait:x,hardConflicts:C,softConflicts:[]};return O.softConflicts=s.filter(Y=>Y.craneId!==r.id&&au(O,Y,a).soft).map(Y=>Y.assignmentId),O}function AM(i,t){return i==="nearest"?[t.move,t.liftFinish,t.softConflicts.length,-t.capacityMargin]:i==="radiusPriority"?[t.sameSetup?0:1,t.liftFinish,t.move,t.softConflicts.length]:[t.liftFinish,t.softConflicts.length,t.sameSetup?0:1,t.move,-t.capacityMargin]}function RM(i,t){for(let e=0;e<Math.max(i.length,t.length);e++){const n=(i[e]??0)-(t[e]??0);if(Math.abs(n)>1e-9)return n}return 0}function CM(i,t={}){var f,x,y;const e=Yf(i);if(!e.valid)throw new Error(e.errors.join("; "));const n=t.policy??"earliestFinish";if(!_M.includes(n))throw new Error(`지원하지 않는 정책: ${n}`);const s=i.cranes.map(v=>({spec:v,pos:Zs(v.basePos??[0,0,0]),available:0,jobs:0})),o=cy(i.loads??[],i.laydown);if(!o.feasible)return{policy:n,assignments:[],events:[],makespan:0,completed:0,total:ou(i).length,failed:[{loadId:null,reason:`야적장 용량 부족 (${o.reason})`}],hardConflicts:0,softConflicts:0,perCrane:[],laydown:o};const a=((f=i.laydown)==null?void 0:f.rehandleDuration)??0,r=o.rehandles.reduce((v,w)=>v+w.count,0);s[0]&&r>0&&(s[0].available=r*a);const l=ou(i);if(l.length>0&&l.every(v=>v.tandem))return PM(i,l,s,t);const c=new Map(l.map(v=>[v.jobId,v])),h=new Map,d=[],u=[];let p=0;for(;c.size&&p++<l.length*4;){const v=[...c.values()].filter(S=>(S.dependsOn??[]).every(R=>h.has(R)));if(!v.length)break;const w=[];for(const S of v)for(const R of s){const b=ir(R.spec,S,i,R.pos,t);for(const M of b){const C=Kf(i,R,S,h,d,M,t);C.feasible&&w.push({out:C,craneState:R,lift:S,key:AM(n,C)})}}if(!w.length){for(const S of v)u.push({loadId:S.id,reason:"모든 크레인·셋업 후보에서 실행 불가"}),c.delete(S.id);continue}w.sort((S,R)=>RM(S.key,R.key)||S.lift.id.localeCompare(R.lift.id)||S.out.craneId.localeCompare(R.out.craneId));const E=w[0];E.out.setupAlternatives=w.filter(S=>S.out.craneId===E.out.craneId&&S.lift.id===E.lift.id).slice(0,5).map(S=>({pos:S.out.setupPos,boomLength:S.out.boomLength,move:S.out.move,capacityMargin:S.out.capacityMargin})),d.push(E.out),h.set(E.lift.jobId,E.out),c.delete(E.lift.jobId),E.craneState.pos=E.out.setupPos,E.craneState.available=E.out.liftFinish,E.craneState.jobs+=1}for(const v of c.values())u.push({loadId:v.id,reason:"선행 작업 미완료 또는 계획 데드락"});const m=[];r>0&&s[0]&&vn(m,"laydown:rehandle",s[0].spec.id,null,"rehandle",0,r*a,{count:r});for(const v of d)vn(m,v.assignmentId,v.craneId,v.loadId,"spaceWait",v.teardownStart-v.spatialWait,v.teardownStart),vn(m,v.assignmentId,v.craneId,v.loadId,"teardown",v.teardownStart,v.teardownFinish),vn(m,v.assignmentId,v.craneId,v.loadId,"travel",v.travelStart,v.travelFinish,{path:v.movePath}),vn(m,v.assignmentId,v.craneId,v.loadId,"setup",v.setupStart,v.setupFinish),vn(m,v.assignmentId,v.craneId,v.loadId,"waiting",v.setupFinish,v.liftStart),vn(m,v.assignmentId,v.craneId,v.loadId,"lift",v.liftStart,v.liftFinish);if(((x=i.planning)==null?void 0:x.includeFinalTeardown)??!0)for(const v of s){if(!v.jobs)continue;const w=((y=v.spec.planning)==null?void 0:y.teardownTime)??(v.spec.type==="tower"?0:300);vn(m,`${v.spec.id}:final`,v.spec.id,null,"finalTeardown",v.available,v.available+w),v.available+=w}m.sort((v,w)=>v.start-w.start||v.craneId.localeCompare(w.craneId));const _=Math.max(0,...s.map(v=>v.available)),g=s.map(v=>{const E=m.filter(S=>S.craneId===v.spec.id).filter(S=>S.type!=="waiting").reduce((S,R)=>S+R.duration,0);return{craneId:v.spec.id,jobs:d.filter(S=>S.craneId===v.spec.id).length,busyTime:E,idleTime:Math.max(0,_-E),travelDistance:d.filter(S=>S.craneId===v.spec.id).reduce((S,R)=>S+R.move,0),setupChanges:d.filter(S=>S.craneId===v.spec.id&&!S.sameSetup).length}});return{policy:n,assignments:d,events:m,makespan:_,completed:d.length,total:l.length,failed:u,hardConflicts:d.reduce((v,w)=>v+w.hardConflicts.length,0),softConflicts:d.reduce((v,w)=>v+w.softConflicts.length,0),perCrane:g,laydown:o,rehandleCount:r}}function PM(i,t,e,n){var l;const s=[],o=[],a=[];for(const c of t){const d=xM(i,c,e,n).sort((y,v)=>{const w=Math.max(...y.craneStates.map(S=>S.available))+y.move,E=Math.max(...v.craneStates.map(S=>S.available))+v.move;return w-E||y.craneIds.join(":").localeCompare(v.craneIds.join(":"))})[0];if(!d){a.push({loadId:c.loadId,reason:"탠덤 크레인쌍·셋업 후보 없음"});continue}const u=c.duration??((l=i.planning)==null?void 0:l.defaultLiftDuration)??1200,p=d.craneStates.map((y,v)=>{const w=y.spec.planning??{},E=d.setups[v].path.distance/Math.max(.01,w.travelSpeed??1.5);return y.available+E+(w.setupTime??600)}),m=Math.max(...p,c.arriveTime??0),_=m+u,g=`${d.craneIds.join("+")}:${c.jobId}`,f=d.craneStates.map((y,v)=>{const w=d.setups[v],E=y.spec.planning??{},S=w.path.distance/Math.max(.01,E.travelSpeed??1.5),R=y.available,b=R+S,M=b,C=M+(E.setupTime??600);return{craneId:y.spec.id,fromPos:[...y.pos],setupPos:[...w.pos],movePath:w.path.path,boomLength:w.boomLength,travelStart:R,travelFinish:b,setupStart:M,setupFinish:C}}),x={assignmentId:g,tandem:!0,craneIds:[...d.craneIds],craneId:d.craneIds[0],loadId:c.loadId,jobId:c.jobId,stage:c.stage,stages:c.stages,pickupPos:[...c.pos],targetPos:[...c.target],loadShares:[...d.shares],liftPoints:c.liftPoints,cranePlans:f,liftStart:m,liftFinish:_,liftDuration:u,hardConflicts:[],softConflicts:[]};s.push(x);for(const y of f)vn(o,g,y.craneId,c.loadId,"travel",y.travelStart,y.travelFinish,{path:y.movePath,tandem:!0}),vn(o,g,y.craneId,c.loadId,"setup",y.setupStart,y.setupFinish,{tandem:!0}),vn(o,g,y.craneId,c.loadId,"waiting",y.setupFinish,m,{tandem:!0}),vn(o,g,y.craneId,c.loadId,"lift",m,_,{tandem:!0,partnerIds:d.craneIds.filter(v=>v!==y.craneId)});d.craneStates.forEach((y,v)=>{y.pos=[...d.setups[v].pos],y.available=_,y.jobs+=1})}const r=Math.max(0,...e.map(c=>c.available));return{policy:n.policy??"earliestFinish",assignments:s,events:o,makespan:r,completed:s.length,total:t.length,failed:a,hardConflicts:0,softConflicts:0,perCrane:e.map(c=>({craneId:c.spec.id,jobs:c.jobs,busyTime:o.filter(h=>h.craneId===c.spec.id&&h.type!=="waiting").reduce((h,d)=>h+d.duration,0),idleTime:0,travelDistance:s.reduce((h,d)=>{const u=d.cranePlans.find(p=>p.craneId===c.spec.id);return h+(u?LM(u.movePath):0)},0),setupChanges:c.jobs}))}}function LM(i){let t=0;for(let e=1;e<((i==null?void 0:i.length)??0);e++)t+=os(i[e-1],i[e]);return t}const ru=1.5;function IM(i,t){const[e,n,s]=t.basePos,o=t.slewAngle,a=[Math.cos(o),Math.sin(o)],r=i.geometry;if(i.type==="tower"){const p=n+r.mastHeight+1.4,m=r.counterJibLength??r.jibLength*.3;return{segments:[{a:[e,p,s],b:[e+r.jibLength*a[0],p,s+r.jibLength*a[1]],part:"jib"},{a:[e,p,s],b:[e-m*a[0],p,s-m*a[1]],part:"counterJib"}],tail:{pos:[e-m*a[0],p,s-m*a[1]],r:ru},body:{pos:[e,n,s],radius:r.bodyRadius??1.2,height:r.mastHeight}}}const l=t.extra.boomLength??r.boomLength,c=t.extra.boomAngle,h=(r.pivotOffset??0)+l*Math.cos(c),d=n+r.pivotHeight+l*Math.sin(c),u=r.tailSwingRadius??4.5;return{segments:[{a:[e+(r.pivotOffset??0)*a[0],n+r.pivotHeight,s+(r.pivotOffset??0)*a[1]],b:[e+h*a[0],d,s+h*a[1]],part:"boom"}],tail:{pos:[e-u*a[0],n+(r.tailHeight??2.5),s-u*a[1]],r:ru},body:{pos:[e,n,s],radius:r.bodyRadius??Math.max(r.bodyWidth,r.bodyLength)/2,height:r.bodyHeight??3.2}}}function DM(i){const[t,e,n]=i.pos,[s,o,a]=i.size;return{min:[t-s/2,e,n-a/2],max:[t+s/2,e+o,n+a/2]}}function UM(i,t,e,n=0){let s=0,o=1;for(let a=0;a<3;a++){const r=e.min[a]-n,l=e.max[a]+n,c=t[a]-i[a];if(Math.abs(c)<1e-12){if(i[a]<r||i[a]>l)return!1;continue}const h=1/c;let d=(r-i[a])*h,u=(l-i[a])*h;if(d>u&&([d,u]=[u,d]),s=Math.max(s,d),o=Math.min(o,u),s>o)return!1}return!0}function FM(i,t){const e=Math.max(t.min[0],Math.min(i.pos[0],t.max[0])),n=Math.max(t.min[2],Math.min(i.pos[2],t.max[2])),s=Math.hypot(i.pos[0]-e,i.pos[2]-n);return i.pos[1]<t.max[1]&&i.pos[1]+i.height>t.min[1]&&s<i.radius}function NM(i,t){let e=0;for(let n=0;n<3;n++){const s=i.pos[n],o=Math.max(t.min[n],Math.min(s,t.max[n]));e+=(s-o)**2}return e<i.r**2}function OM(i,t){const e=i.size.map(n=>n/2);return[0,1,2].every(n=>i.pos[n]+e[n]>t.min[n]&&i.pos[n]-e[n]<t.max[n])}function kM(i,t){const e=t.min??[t.x1,t.y1],n=t.max??[t.x2,t.y2];return i[0]>=Math.min(e[0],n[0])&&i[0]<=Math.max(e[0],n[0])&&i[2]>=Math.min(e[1],n[1])&&i[2]<=Math.max(e[1],n[1])}function zM(i,t){const e=[],n=t.cranes.map((a,r)=>IM(i.cranes[r],a)),s=(i.obstacles??[]).map(a=>({obstacle:a,box:DM(a)}));for(let a=0;a<n.length;a++){const r=n[a],l=i.cranes[a].id;for(const{obstacle:c,box:h}of s)FM(r.body,h)&&e.push({key:`body:${l}:${c.id}`,type:"bodyObstacle",craneId:l,obstacleId:c.id}),r.segments.some(d=>UM(d.a,d.b,h,.5))&&e.push({key:`boom:${l}:${c.id}`,type:"boomObstacle",craneId:l,obstacleId:c.id}),NM(r.tail,h)&&e.push({key:`tail:${l}:${c.id}`,type:"tailObstacle",craneId:l,obstacleId:c.id})}for(let a=0;a<n.length;a++)for(let r=a+1;r<n.length;r++){const l=uf(n[a],n[r]);if(l.clash){const c=i.cranes[a].id,h=i.cranes[r].id;e.push({key:`crane:${c}:${h}`,type:l.tailContact?"tailCrane":"boomCrane",craneIds:[c,h],clearance:l.boomDist})}}const o=i.restrictedZones??i.noFlyZones??[];for(const a of t.loads.filter(r=>r.state==="hooked")){for(const{obstacle:r,box:l}of s)OM(a,l)&&e.push({key:`load:${a.id}:${r.id}`,type:"loadObstacle",loadId:a.id,obstacleId:r.id});for(const r of o)kM(a.pos,r)&&e.push({key:`zone:${a.id}:${r.id}`,type:"loadRestrictedZone",loadId:a.id,zoneId:r.id})}return t.cranes.forEach((a,r)=>{const l=i.cranes[r].id,c=n[r],h=[mr(a.hookPos,i.powerLines??[]),...c.segments.map(u=>pf(u.a,u.b,i.powerLines??[]))].sort((u,p)=>u.clearance-p.clearance)[0];h.safe||e.push({key:`power:${l}:${h.lineId}`,type:"powerLineClearance",craneId:l,lineId:h.lineId,clearance:h.clearance});const d=[a.hookPos,...c.segments.flatMap(u=>[u.a,u.b])].map(u=>Fo(u,i.heightLimits??[])).find(u=>!u.safe)??Fo(a.hookPos,i.heightLimits??[]);d.safe||e.push({key:`height:${l}:${d.zoneId}`,type:"heightLimit",craneId:l,zoneId:d.zoneId})}),e}function Jf(i,t,e={}){var d;const n=Math.max(.25,e.sampleStep??5),s=new oh(i),o=new Lc(i,t),a=s.getState(),r=new Map,l=[];for(const u of t.assignments.filter(p=>p.tandem)){const p=t.events.filter(g=>g.assignmentId===u.assignmentId&&g.type==="lift"),m=new Set(p.map(g=>g.craneId));(!(p.length===2&&m.size===2&&Math.abs(p[0].start-p[1].start)<1e-9&&Math.abs(p[0].finish-p[1].finish)<1e-9)||(d=u.craneIds)!=null&&d.some(g=>!m.has(g)))&&l.push({key:`tandem-sync:${u.assignmentId}`,type:"tandemSynchronization",loadId:u.loadId,craneIds:u.craneIds,start:u.liftStart,end:u.liftFinish})}let c=0;for(let u=0;u<=t.makespan+1e-9;u+=n){c+=1;const p=zM(i,o.stateAt(a,Math.min(u,t.makespan))),m=new Set(p.map(_=>_.key));for(const _ of p){const g=r.get(_.key);g?g.end=Math.min(u+n,t.makespan):r.set(_.key,{..._,start:u,end:Math.min(u+n,t.makespan)})}for(const[_,g]of r)m.has(_)||(l.push(g),r.delete(_))}l.push(...r.values());const h={};for(const u of l)h[u.type]=(h[u.type]??0)+1;return{valid:l.length===0,sampleStep:n,samples:c,violations:l,byType:h}}function BM(i,t,e,n=!1){const s=i.assignments.filter(a=>a.craneId===t).sort((a,r)=>a.liftStart-r.liftStart),o=s.find(a=>e>=a.liftStart&&e<a.liftFinish);return n?o??null:o??[...s].reverse().find(a=>a.liftStart<=e)??s.find(a=>a.liftStart>e)??null}function HM(i,t,e,n,s){var a;const o=[];for(const r of t.violations){if(!((a=r.craneIds)!=null&&a.length))continue;const l=(r.start+r.end)/2,c=r.craneIds.map(p=>BM(i,p,l,!0)).filter(Boolean);if(c.length<2){const p=new Set(c.map(f=>f.craneId)),m=r.craneIds.find(f=>!p.has(f));if(!m)continue;const g=(n[m]??0)+Math.PI/2;n[m]=g,o.push({violationType:r.type,violationStart:r.start,parkedCrane:m,parkSlewAngle:g});continue}c.sort((p,m)=>p.liftStart-m.liftStart||p.craneId.localeCompare(m.craneId));const h=c[0],d=c[c.length-1];if(h.assignmentId===d.assignmentId)continue;const u=h.liftFinish+s;(e[d.assignmentId]??0)>=u-1e-9||(e[d.assignmentId]=u,o.push({violationType:r.type,violationStart:r.start,blocker:h.assignmentId,delayed:d.assignmentId,notBefore:u}))}return o}function GM(i,t={}){const e=t.maxRepairs??6,n=t.repairBuffer??10,s=t.sampleStep??5,o={...t.notBefore??{}},a={...t.parkSlewAngles??{}},r=[];let l,c;for(let h=0;h<=e&&(l=CM(i,{...t,notBefore:o}),l.parkSlewAngles={...a},c=Jf(i,l,{sampleStep:s}),!c.valid);h++){const d=HM(l,c,o,a,n);if(!d.length)break;r.push(...d.map(u=>({iteration:h+1,...u})))}return l.validation3D=c,l.repairs=r,l.repairConstraints=o,l.parkSlewAngles=a,l.repaired=r.length>0,l}const VM=i=>i.length===3?[i[0],i[2]]:[i[0],i[1]];function Wi(i,t,e,n,s,o,a,r={}){a<=o+1e-9||i.push({assignmentId:t,craneId:e,loadId:n,type:s,start:o,finish:a,duration:a-o,...r})}function WM(i,t){const e=[...Yf(i).errors],n=new Set(i.cranes.map(a=>a.id)),s=new Set(i.loads.filter(a=>a.target).map(a=>a.id)),o=new Set;for(const[a,r]of t.entries())n.has(r.craneId)||e.push(`plan[${a}]: 잘못된 craneId ${r.craneId}`),s.has(r.loadId)||e.push(`plan[${a}]: 잘못된 loadId ${r.loadId}`),o.has(r.loadId)&&e.push(`중복 배정: ${r.loadId}`),o.add(r.loadId);for(const a of s)o.has(a)||e.push(`미배정 양중물: ${a}`);return{valid:e.length===0,errors:e}}function $M(i,t,e={}){var _,g;const n=WM(i,t);if(!n.valid)throw new Error(n.errors.join("; "));const s=i.cranes.map(f=>({spec:f,pos:VM(f.basePos),available:0,jobs:0})),o=new Map(s.map(f=>[f.spec.id,f])),a=new Map(i.loads.map(f=>[f.id,f])),r=new Map(i.cranes.map(f=>[f.id,[]]));for(const f of t)r.get(f.craneId).push({...f});const l=new Map,c=[],h=[];let d=0;for(;l.size+h.length<t.length&&d++<t.length*4;){const f=[];for(const[y,v]of r){for(;v.length&&(l.has(v[0].loadId)||h.some(C=>C.loadId===v[0].loadId));)v.shift();if(!v.length)continue;const w=v[0],E=a.get(w.loadId);if(!(E.dependsOn??[]).every(C=>l.has(C)))continue;const S=o.get(y);let R,b;if(w.setupPos){const C=wM(S.spec,E,i,S.pos,w.setupPos,w.boomLength,e);if(!C.feasible){h.push({loadId:E.id,craneId:y,reason:C.reason}),v.shift();continue}R=[C],b=[C,...ir(S.spec,E,i,S.pos,e).filter(U=>Math.hypot(U.pos[0]-C.pos[0],U.pos[1]-C.pos[1])>.25||U.boomLength!==C.boomLength)].slice(0,5)}else R=ir(S.spec,E,i,S.pos,e),b=R;const M=R.map(C=>Kf(i,S,E,l,c,C,e)).filter(C=>C.feasible).sort((C,U)=>C.liftFinish-U.liftFinish||Number(U.sameSetup)-Number(C.sameSetup)||C.move-U.move);M.length?(M[0].setupAlternatives=b.slice(0,5).map(C=>({pos:C.pos,boomLength:C.boomLength,move:C.path.distance,capacityMargin:C.capacityMargin})),f.push({craneState:S,load:E,outcome:M[0]})):(h.push({loadId:E.id,craneId:y,reason:"지정 크레인에서 실행 가능한 셋업 없음"}),v.shift())}if(!f.length)break;f.sort((y,v)=>y.outcome.liftFinish-v.outcome.liftFinish);const x=f[0];c.push(x.outcome),l.set(x.load.id,x.outcome),r.get(x.craneState.spec.id).shift(),x.craneState.pos=x.outcome.setupPos,x.craneState.available=x.outcome.liftFinish,x.craneState.jobs+=1}for(const[f,x]of r)for(const y of x)!l.has(y.loadId)&&!h.some(v=>v.loadId===y.loadId)&&h.push({loadId:y.loadId,craneId:f,reason:"크레인별 순서와 선행 작업이 충돌해 데드락"});const u=[];for(const f of c)Wi(u,f.assignmentId,f.craneId,f.loadId,"spaceWait",f.teardownStart-f.spatialWait,f.teardownStart),Wi(u,f.assignmentId,f.craneId,f.loadId,"teardown",f.teardownStart,f.teardownFinish),Wi(u,f.assignmentId,f.craneId,f.loadId,"travel",f.travelStart,f.travelFinish,{path:f.movePath}),Wi(u,f.assignmentId,f.craneId,f.loadId,"setup",f.setupStart,f.setupFinish),Wi(u,f.assignmentId,f.craneId,f.loadId,"waiting",f.setupFinish,f.liftStart),Wi(u,f.assignmentId,f.craneId,f.loadId,"lift",f.liftStart,f.liftFinish);if(((_=i.planning)==null?void 0:_.includeFinalTeardown)??!0)for(const f of s){if(!f.jobs)continue;const x=((g=f.spec.planning)==null?void 0:g.teardownTime)??(f.spec.type==="tower"?0:300);Wi(u,`${f.spec.id}:final`,f.spec.id,null,"finalTeardown",f.available,f.available+x),f.available+=x}u.sort((f,x)=>f.start-x.start||f.craneId.localeCompare(x.craneId));const p=Math.max(0,...s.map(f=>f.available)),m=s.map(f=>{const y=u.filter(w=>w.craneId===f.spec.id).filter(w=>w.type!=="waiting"&&w.type!=="spaceWait").reduce((w,E)=>w+E.duration,0),v=c.filter(w=>w.craneId===f.spec.id);return{craneId:f.spec.id,jobs:v.length,busyTime:y,idleTime:Math.max(0,p-y),travelDistance:v.reduce((w,E)=>w+E.move,0),setupChanges:v.filter(w=>!w.sameSetup).length}});return{policy:"manual",manualPlan:t.map(f=>({...f})),assignments:c,events:u,makespan:p,completed:c.length,total:t.length,failed:h,hardConflicts:c.reduce((f,x)=>f+x.hardConflicts.length,0),softConflicts:c.reduce((f,x)=>f+x.softConflicts.length,0),perCrane:m}}const Hn=i=>i*Math.PI/180,Pe={id:"crawler-100t",name:"100t Crawler Crane",type:"mobile",basePos:[0,0,0],geometry:{boomLength:40,pivotHeight:2,pivotOffset:1.2,bodyWidth:6,bodyLength:7.5,trackWidth:1.2,tailSwingRadius:4.5,tailHeight:2.5,bodyRadius:3.5,bodyHeight:3.2},masses:{base:55,counterweight:30,boomPerMeter:.35},rating:{dynamicFactor:1.1,hookBlockMass:.35,pickCarryFactor:.66},limits:{slewRate:Hn(1.5),slewAccel:Hn(.8),luffRate:Hn(.7),luffAccel:Hn(.5),hoistSpeed:1,hoistAccel:.6,boomAngleMin:Hn(15),boomAngleMax:Hn(82),ropeMin:2},loadChart:[[4.5,100],[6,78],[8,57],[10,44],[12,35],[14,29],[18,21],[22,15.5],[26,11.5],[30,8.5],[34,6.2],[38,4.3]],capacityChart:[[40,[[4.5,100],[6,78],[8,57],[10,44],[12,35],[14,29],[18,21],[22,15.5],[26,11.5],[30,8.5],[34,6.2],[38,4.3]]],[52,[[6,60],[8,45],[10,36],[12,29],[14,24],[18,17.5],[22,13],[26,9.8],[30,7.4],[34,5.6],[38,4.2],[42,3.2],[46,2.4],[50,1.8]]]],initial:{boomAngle:Hn(60),slewAngle:0,ropeLength:15}},Mr={id:"tower-8t",name:"8t Tower Crane",type:"tower",basePos:[0,0,0],geometry:{mastHeight:32,jibLength:35,counterJibLength:11,trolleyMin:3,bodyRadius:1.2},limits:{slewRate:Hn(2.4),slewAccel:Hn(1.2),trolleySpeed:.8,trolleyAccel:.5,hoistSpeed:1.4,hoistAccel:.8,ropeMin:2},loadChart:[[3,8],[13,8],[16,6.4],[20,5],[24,4.1],[28,3.4],[32,2.9],[35,2.6]],rating:{dynamicFactor:1.1,hookBlockMass:.15},initial:{trolleyPos:15,slewAngle:0,ropeLength:12}},XM={cranes:[Pe],loads:[{id:"girder-1",name:"철골 거더",size:[8,.8,.5],mass:5,shape:"h-beam",pos:[21,0,4]},{id:"pc-slab-1",name:"PC 슬래브",size:[4,.3,2.5],mass:8,pos:[18,0,-8]},{id:"module-1",name:"설비 모듈",size:[3,2.5,3],mass:15,shape:"module",pos:[14,0,10]},{id:"tank-1",name:"중량 탱크",size:[4,3,4],mass:25,shape:"tank",pos:[21.2,0,0]}]},lu=Hn(40),qM={cranes:[Pe],loads:[{id:"pipe-1",name:"배관 스풀",size:[6,.6,.6],shape:"pipe",mass:8,pos:[21.2,0,0],target:[21.2*Math.cos(lu),21.2*Math.sin(lu)]}],obstacles:[{id:"structure-1",kind:"structure",pos:[10,0,24],size:[4,8,4]}],noFlyZones:[{id:"nfz-1",min:[-6,-30],max:[6,-18]}]},No=i=>i*Math.PI/180,oe=(i,t)=>[i*Math.cos(No(t)),i*Math.sin(No(t))],YM={...Pe,id:"crawler-100t-sway",physics:{sway:!0}},Eo=qM,jM={cranes:[Pe],loads:[{id:"module-1",name:"설비 모듈",size:[3,2.5,3],mass:10,pos:[21.2,0,0],target:oe(21.2,60)}],obstacles:[{id:"rack-1",kind:"structure",pos:[oe(21.2,30)[0],0,oe(21.2,30)[1]],size:[5,10,5]}],noFlyZones:[]},ZM={cranes:[Pe],loads:[{id:"girder-1",name:"철골 거더",size:[8,.8,.5],shape:"h-beam",mass:8,pos:[21.2,0,0],target:oe(21.2,90)}],obstacles:[],noFlyZones:[{id:"office-zone",min:[12,12],max:[26,26]}]},KM={cranes:[YM],loads:[{id:"pc-slab-1",name:"PC 슬래브",size:[4,.3,2.5],mass:8,pos:[21.2,0,0],target:oe(21.2,-50)},{id:"pipe-1",name:"배관 스풀",size:[6,.6,.6],shape:"pipe",mass:6,pos:[oe(21.2,25)[0],0,oe(21.2,25)[1]],target:oe(21.2,70)}],obstacles:[{id:"shed-1",kind:"structure",pos:[oe(26,-15)[0],0,oe(26,-15)[1]],size:[4,5,4]}],noFlyZones:[]},JM={cranes:[Mr],loads:[{id:"rebar-1",name:"철근 다발",size:[8,.5,.8],shape:"rebar",mass:3,pos:[15,0,0],target:oe(25,110)},{id:"form-1",name:"거푸집 팩",size:[3,1.5,2],mass:2,pos:[oe(20,40)[0],0,oe(20,40)[1]],target:oe(10,180)}],obstacles:[{id:"core-wall",kind:"structure",pos:[oe(18,75)[0],0,oe(18,75)[1]],size:[6,14,3]}],noFlyZones:[{id:"gate-zone",min:[-30,-8],max:[-18,8]}]},QM={cranes:[{...Pe,basePos:[-28,0,0]},{...Mr,basePos:[28,0,0]}],loads:[{id:"tank-1",name:"중량 탱크",size:[4,3,4],shape:"tank",mass:14,pos:[-28+21.2,0,0],target:[-28+oe(21.2,55)[0],oe(21.2,55)[1]]},{id:"duct-1",name:"덕트 모듈",size:[5,1.2,1.5],shape:"module",mass:3,pos:[13,0,0],target:[28+oe(22,120)[0],oe(22,120)[1]]}],obstacles:[{id:"plant-1",kind:"structure",pos:[0,0,14],size:[8,12,6]}],noFlyZones:[{id:"road-zone",min:[-8,-30],max:[8,-14]}]},tb={cranes:Eo.cranes,loads:Eo.loads.map(i=>({...i})),obstacles:Eo.obstacles,noFlyZones:Eo.noFlyZones,rigging:{rigTime:90,derigTime:45,trialLiftTime:10}},eb={...Pe,id:"MC-01",name:"Crawler A",basePos:[-45,0,-25],planning:{movable:!0,travelSpeed:1.2,setupTime:480,teardownTime:240,workingRadius:32}},nb={...Pe,id:"MC-02",name:"Crawler B",basePos:[45,0,-25],planning:{movable:!0,travelSpeed:1.2,setupTime:480,teardownTime:240,workingRadius:32}},ib={...Mr,id:"TC-01",name:"Tower Center",basePos:[0,0,20],planning:{movable:!1,setupTime:0,teardownTime:0,workingRadius:35}},gn=(i,t,e,n,s=[])=>({id:i,name:i,size:t>10?[5,1.2,2]:[4,.8,1.5],mass:t,pos:[e[0],0,e[1]],target:n,duration:900,dependsOn:s}),sb={site:{width:140,depth:120,minX:-70,minZ:-45},cranes:[eb,nb,ib],loads:[gn("COL-A1",12,[-55,-8],[-38,-5]),gn("COL-A2",12,[-35,-10],[-22,8]),gn("COL-B1",12,[55,-8],[38,-5]),gn("COL-B2",12,[35,-10],[22,8]),gn("BEAM-A1",8,[-52,8],[-30,12],["COL-A1","COL-A2"]),gn("BEAM-B1",8,[52,8],[30,12],["COL-B1","COL-B2"]),gn("CORE-1",6,[-12,2],[-8,25]),gn("CORE-2",6,[12,2],[8,25],["CORE-1"]),gn("SLAB-A",7,[-42,25],[-20,30],["BEAM-A1"]),gn("SLAB-B",7,[42,25],[20,30],["BEAM-B1"]),gn("DUCT-1",3,[-10,42],[-5,45],["CORE-2"]),gn("DUCT-2",3,[10,42],[5,45],["CORE-2"])],obstacles:[{id:"site-office",kind:"office",pos:[0,0,-18],size:[16,8,10]}],noFlyZones:[{id:"central-road",min:[-8,-38],max:[8,-5]},{id:"east-storage",min:[48,15],max:[66,34]}],planning:{defaultLiftDuration:900,includeFinalTeardown:!0,hardClearance:1.5,softClearance:5}},cu=(i,t,e)=>({...Pe,id:i,name:t,basePos:e,physics:{sway:!0},planning:{movable:!0,travelSpeed:1,setupTime:300,teardownTime:150,workingRadius:30}}),br=1.35,In=(i,t,e,n,s,o,a,r,l=[],c=0)=>({id:i,name:t,size:e,mass:n,shape:Math.max(e[0],e[1],e[2])/Math.min(e[0],e[1],e[2])>4?"h-beam":void 0,pos:[s[0],0,s[1]],elev:br,route:[{target:o,elev:0},{target:a,elev:r}],dependsOn:l,...c>0?{arriveTime:c}:{}}),ob={site:{width:120,depth:90,minX:-60,minZ:-45},cranes:[cu("CR-A","Crawler A",[-16,0,-18]),cu("CR-B","Crawler B",[-16,0,18])],loads:[In("C-11","기둥 C-11",[.8,6,.8],7,[-34,-20],[-24,-11],[12,-6],0,[],30),In("C-21","기둥 C-21",[.8,6,.8],7,[-34,-17.5],[-24,-7],[20,-6],0,[],30),In("GX-1","거더 GX-1",[8,.6,.5],5,[-34,-15],[-17,-10],[16,-6],6,["C-11","C-21"],30),In("GZ-1","거더 GZ-1",[.5,.6,12],5,[-34,-12.5],[-17,-5],[12,0],6,["C-11","C-12"],30),In("D-1","데크 D-1",[7,.4,5],4,[-34,-10],[-24,-3],[16,-3],6.6,["GX-1","GZ-1","GZ-2"],30),In("C-12","기둥 C-12",[.8,6,.8],7,[-34,20],[-24,11],[12,6],0,[],30),In("C-22","기둥 C-22",[.8,6,.8],7,[-34,17.5],[-24,7],[20,6],0,[],30),In("GX-2","거더 GX-2",[8,.6,.5],5,[-34,15],[-17,10],[16,6],6,["C-12","C-22"],30),In("GZ-2","거더 GZ-2",[.5,.6,12],5,[-34,12.5],[-17,5],[20,0],6,["C-21","C-22"],30),In("D-2","데크 D-2",[7,.4,5],4,[-34,10],[-24,3],[16,3],6.6,["GX-2","GZ-1","GZ-2"],30),In("M-1","지붕 유닛 M-1",[6,1.5,6],6,[-34,5],[-17,0],[16,0],7,["D-1","D-2"],30)],trucks:[{id:"T-1",dockPos:[-34,0],heading:[0,-1],size:[3.2,2.9,42],bedHeight:br,arriveTime:30,entryDistance:26,entryDuration:30,exitDuration:30,loads:["C-11","C-21","GX-1","GZ-1","D-1","C-12","C-22","GX-2","GZ-2","D-2","M-1"]}],obstacles:[{id:"site-office",kind:"office",pos:[0,0,-24],size:[12,6,8]}],noFlyZones:[],ground:{bearingCapacity:25,grade:"다짐 지반"},rigging:{rigTime:60,derigTime:30,trialLiftTime:0},planning:{defaultLiftDuration:300}},ab={...Pe,id:"PC-01",name:"Pick&Carry Crawler",basePos:[34,0,0],planning:{movable:!0,travelSpeed:1,setupTime:300,teardownTime:150,carrySpeed:.5,carryAccel:.3,carryRadius:8}},rb={site:{width:120,depth:40,minX:-60,minZ:-20},cranes:[ab],loads:[{id:"PM-1",name:"설비 모듈 1",size:[3,2,3],mass:12,shape:"module",pos:[44,0,6],target:[-34,6]},{id:"PM-2",name:"설비 모듈 2",size:[3,2,3],mass:10,shape:"module",pos:[44,0,-6],target:[-34,-6]}],ground:{bearingCapacity:30,grade:"다짐 노반"},rigging:{rigTime:45,derigTime:25,trialLiftTime:0},planning:{defaultLiftDuration:300}},lb={...Pe,id:"crawler-100t-storm",physics:{sway:!0,loadYaw:!0,doublePendulum:!0}},cb={site:{width:90,depth:70,minX:-45,minZ:-35},cranes:[lb],loads:[{id:"girder-w1",name:"장스팬 거더",size:[12,.9,.4],mass:6.5,shape:"h-beam",windArea:10.8,pos:[21.2,0,0],target:oe(21.2,75)},{id:"panel-w1",name:"외장 패널 팩",size:[5,2.4,.6],mass:3,windArea:12,maxWind:12,pos:[oe(21.2,-30)[0],0,oe(21.2,-30)[1]],target:oe(15,-95)}],obstacles:[],noFlyZones:[],wind:{timeline:[[0,7],[120,10],[240,12.5]],dir:No(115),gust:{amp:.35,period:9},maxOperating:14},rigging:{rigTime:45,derigTime:25}},hb={site:{width:90,depth:56,minX:-45,minZ:-28},cranes:[{...Pe,id:"GC-01",name:"Yard Crawler"}],loads:[{id:"HM-1",name:"설비 모듈",size:[3,2,3],mass:9,shape:"module",pos:[21.2,0,0],target:oe(21.2,80)},{id:"HB-1",name:"H형강 거더",size:[8,.8,.5],mass:6,shape:"h-beam",pos:[oe(21.2,-35)[0],0,oe(21.2,-35)[1]],target:oe(16,150)}],obstacles:[{id:"site-office",kind:"office",pos:[-30,0,-22],size:[10,6,8]}],noFlyZones:[],agents:{seed:20260705,dangerRadius:6,workers:[{count:5,area:{min:[-38,-22],max:[38,22]},speed:[.8,1.3],idle:[2,5]}],vehicles:[{route:[[-40,12],[40,12],[40,-14],[-40,-14]],speed:2.4}]},rigging:{rigTime:30,derigTime:15}},db={site:{width:100,depth:70,minX:-50,minZ:-35},cranes:[{...Pe,id:"TC-A",name:"Tandem Crawler A",basePos:[-14,0,-12]},{...Pe,id:"TC-B",name:"Tandem Crawler B",basePos:[14,0,-12]}],loads:[{id:"TG-70",name:"70t 장대 거더",size:[20,1.4,1.2],mass:70,shape:"h-beam",pos:[0,0,0],target:[0,22],tandem:!0,liftPoints:[[-8,0],[8,0]],cog:[0,0],duration:900}],obstacles:[],noFlyZones:[],planning:{defaultLiftDuration:900,includeFinalTeardown:!1}},ub={site:{width:70,depth:60,minX:-35,minZ:-30},cranes:[{...Pe,id:"TAG-01",name:"Tagline Crawler",physics:{...Pe.physics??{},loadYaw:!0}}],loads:[{id:"YG-1",name:"방위 제어 거더",size:[10,.9,.6],mass:6,shape:"h-beam",pos:[21.2,0,0],target:oe(21.2,55),targetYaw:No(90),yawTolerance:No(10),slingHeight:10,rigTime:20,derigTime:10}],obstacles:[],noFlyZones:[],scoring:{parTime:180,violationPenalty:12,holdPenaltyPerSecond:.1}},fb={...Pe,id:"OPS-01",name:"Operations Crawler",outrigger:{points:[[-3,-3],[3,-3],[-3,3],[3,3]],padArea:2.5},configurations:[{id:"boom40",boomLength:40,assemblyArea:[18,8],duration:900,cost:5e5,trucks:1},{id:"boom52",boomLength:52,assemblyArea:[30,10],duration:2400,cost:15e5,trucks:2,assistCraneRequired:!0}]},pb={site:{width:100,depth:70,minX:-50,minZ:-35},cranes:[fb],loads:[{id:"OP-A",name:"선행 기둥",size:[2,8,2],mass:8,pos:[18,0,-12],target:[10,15],resourceRequirements:{rigger:2},erectionOrder:0},{id:"OP-B",name:"후속 거더",size:[10,1,1],mass:7,pos:[22,0,-8],target:[15,18],dependsOn:["OP-A"],resourceRequirements:{rigger:2,signaler:1},erectionOrder:1}],obstacles:[],noFlyZones:[],powerLines:[{id:"PL-1",a:[-35,14,5],b:[35,14,5],clearance:6}],heightLimits:[{id:"HL-1",min:[25,10],max:[45,30],maxHeight:18}],weather:{rain:{timeline:[[0,12],[300,0]]},maxRain:10,lightning:{value:20},minLightningDistance:10,visibility:{value:500},minVisibility:200},shifts:[{id:"day",start:0,end:12*3600}],resources:[{type:"rigger",count:2},{type:"signaler",count:1}],laydown:{slots:[{id:"Y-1",size:[12,4],maxLayers:2,maxMass:12}],rehandleDuration:180},ground:{bearingCapacity:30},groundZones:[{id:"soft",min:[0,-8],max:[15,8],bearingCapacity:8}],logistics:{assemblyArea:[35,12],assistCranes:1},planning:{defaultLiftDuration:600}},_l=(i,t,e,n,s,o)=>({id:i,name:t,size:e,mass:n,shape:Math.max(e[0],e[1],e[2])/Math.min(e[0],e[1],e[2])>4?"h-beam":void 0,pos:[s[0],0,s[1]],route:[{target:o,elev:br}]}),mb={site:{width:100,depth:70,minX:-50,minZ:-35},cranes:[{...Pe,id:"EX-01",name:"Export Crawler",basePos:[0,0,0]}],loads:[_l("SC-1","가설 기둥 1",[.8,6,.8],5,[16,-8],[-22,-4]),_l("SC-2","가설 기둥 2",[.8,6,.8],5,[20,-2],[-22,0]),_l("FP-1","잔여 폼 패널",[4,1,3],4,[16,4],[-22,4])],trucks:[{id:"EXT-1",mode:"export",dockPos:[-22,0],heading:[0,-1],size:[3.2,2.9,14],bedHeight:br,arriveTime:30,entryDistance:26,entryDuration:30,exitDuration:30,loads:["SC-1","SC-2","FP-1"]}],obstacles:[{id:"site-office",kind:"office",pos:[10,0,20],size:[10,6,8]}],noFlyZones:[],ground:{bearingCapacity:25},planning:{defaultLiftDuration:240},scoring:{parTime:240,violationPenalty:12,holdPenaltyPerSecond:.1}},Ee=[{id:"free",name:"자유 연습",desc:"목표 없음 — 부재 4종 자유 조작",scenario:XM},{id:"place-basic",name:"S1 기본 안착",desc:"픽업 → 선회 40° → 목표 안착",scenario:Eo},{id:"obstacle-hop",name:"S2 장애물 넘기기",desc:"10m 구조물 위로 충분히 권상 후 통과",scenario:jM},{id:"nfz-detour",name:"S3 금지구역 우회",desc:"붐을 올려 반경을 줄이고 안쪽으로 우회",scenario:ZM},{id:"relay-sway",name:"S4 릴레이(흔들림)",desc:"부재 2개 연속 안착 — 후크 흔들림 물리 ON",scenario:KM},{id:"tower-yard",name:"S5 타워크레인 야드",desc:"트롤리·선회로 자재 2건 이송",scenario:JM},{id:"dual-site",name:"S6 협동 현장",desc:"크롤러+타워 2대 — Tab으로 크레인 전환",scenario:QM},{id:"rig-real",name:"S7 리깅 현실화",desc:"줄걸이 90s·해체 45s·시험인양 10s — 사이클타임 현실화",scenario:tb},{id:"macro-plan",name:"S8 전체 계획 현장",desc:"크레인 3대 · 양중물 12개 · 셋업 이동과 시공순서",scenario:sb},{id:"yard-erection",name:"S9 트럭 하역·철골 건립",desc:"트럭 1대 전량 반입 → 야적장 하역 → 2×2 입체 철골 건립 (여정 2단계·고소 안착·전도안정성)",scenario:ob},{id:"pick-carry",name:"S10 픽앤캐리 통로",desc:"픽업·목표 78m 이격 — 하중 매단 채 주행(감격 정격·주행 전도)으로 안착",scenario:rb},{id:"storm-rig",name:"S11 강풍 리깅",desc:"바람 외력→흔들림·부재 요 회전·이중진자 ON — 거스트 창에서 정밀 안착",scenario:cb},{id:"ground-traffic",name:"S12 지상 인원·장비",desc:"인원 5명 배회 + 지게차 순환 — 위험 반경 6m 진입 시 작업 홀드(신호수 규칙), 시드 결정론",scenario:hb},{id:"tandem-lift",name:"S13 탠덤 리프트",desc:"1대 정격을 넘는 70t 장대 거더를 크롤러 2대가 동기 공동 인양",scenario:db},{id:"yaw-rig-score",name:"S14 자세·슬링·채점",desc:"Z/X 태그라인으로 거더를 90° 방위에 정렬하고 안착 정확도·안전·시간을 채점",scenario:ub},{id:"operations-site",name:"S15 통합 현실 현장",desc:"전력선·고도·기상·교대·공유인력·야적·개별지반·조립물류 통합",scenario:pb},{id:"export-haul",name:"S16 부재 반출 트럭",desc:"현장 잔여 부재를 반출 트럭 적재함에 적재 → 전량 적재 시 싣고 출차(현장 제거)",scenario:mb}],gb={crawler:Pe,tower:Mr};function _b(i){const t=i.spec?structuredClone(i.spec):gb[i.base]??Pe,e={...t,id:i.id,name:i.name??t.name,basePos:[i.pos[0],0,i.pos[1]]};return i.base==="crawler"&&i.boomLength&&(e.geometry={...t.geometry,boomLength:i.boomLength}),i.sway&&(e.physics={sway:!0}),e}function Qf(i){var e,n,s;const t={cranes:i.cranes.map(_b),loads:i.loads.map(o=>{var a;return{...structuredClone(o),id:o.id,name:o.name??o.id,size:o.size??[3,1.5,3],mass:o.mass,pos:[o.pos[0],0,o.pos[1]],target:[o.target[0],o.target[1]],rigTime:o.rigTime||void 0,derigTime:o.derigTime||void 0,arriveTime:o.arriveTime||void 0,dependsOn:(a=o.dependsOn)!=null&&a.length?o.dependsOn:void 0,maxWind:o.maxWind||void 0,targetYaw:o.targetYaw??void 0,tandem:o.tandem||void 0,liftPoints:o.liftPoints,slingHeight:o.slingHeight,blockUnsafeSling:o.blockUnsafeSling,resourceRequirements:o.resourceRequirements,erectionOrder:o.erectionOrder}}),obstacles:i.obstacles.map(o=>({...structuredClone(o),id:o.id,pos:[o.pos[0],0,o.pos[1]],size:o.size})),noFlyZones:i.noFlyZones.map(o=>({id:o.id,min:[...o.min],max:[...o.max]}))};i.rigging&&(i.rigging.rigTime||i.rigging.derigTime||i.rigging.trialLiftTime)&&(t.rigging={...i.rigging}),(e=i.ground)!=null&&e.bearingCapacity&&(t.ground={bearingCapacity:i.ground.bearingCapacity}),((n=i.wind)!=null&&n.maxOperating||(s=i.wind)!=null&&s.speed)&&(t.wind={...i.wind});for(const o of["site","powerLines","heightLimits","weather","shifts","resources","laydown","groundZones","logistics","planning","scoring","agents","trucks"])i[o]!=null&&(t[o]=structuredClone(i[o]));return t}function rh(i,t="사용자 시나리오"){const e={name:t,cranes:(i.cranes??[]).map(n=>{var s,o;return{id:n.id,name:n.name,base:n.type==="tower"?"tower":"crawler",spec:structuredClone(n),pos:[n.basePos[0],n.basePos[2]],...n.type!=="tower"&&((s=n.geometry)!=null&&s.boomLength)?{boomLength:n.geometry.boomLength}:{},...(o=n.physics)!=null&&o.sway?{sway:!0}:{}}}),loads:(i.loads??[]).map(n=>({...structuredClone(n),pos:[n.pos[0],n.pos[2]],target:n.target?[...n.target]:[n.pos[0],n.pos[2]]})),obstacles:(i.obstacles??[]).map(n=>({...structuredClone(n),pos:[n.pos[0],n.pos[2]]})),noFlyZones:structuredClone(i.noFlyZones??[])};for(const n of["rigging","ground","wind","site","powerLines","heightLimits","weather","shifts","resources","laydown","groundZones","logistics","planning","scoring","agents","trucks"])i[n]!=null&&(e[n]=structuredClone(i[n]));return e}function vb(i){const t=[];if(!i||typeof i!="object")return{valid:!1,errors:["JSON 객체가 필요합니다."]};for(const n of["cranes","loads","obstacles","noFlyZones"])Array.isArray(i[n])||t.push(`${n} 배열이 필요합니다.`);const e=new Set;for(const n of[...i.cranes??[],...i.loads??[]])n.id?e.has(n.id)?t.push(`중복 id: ${n.id}`):e.add(n.id):t.push("크레인·부재 id가 필요합니다.");for(const n of i.loads??[]){(!Array.isArray(n.pos)||n.pos.length!==2)&&t.push(`${n.id}: pos는 [x,z]`),(!Array.isArray(n.target)||n.target.length!==2)&&t.push(`${n.id}: target은 [x,z]`),n.mass>0||t.push(`${n.id}: mass는 양수`);for(const s of n.dependsOn??[])(i.loads??[]).some(o=>o.id===s)||t.push(`${n.id}: 없는 선행 ${s}`)}return{valid:t.length===0,errors:t}}function hu(i){let t;try{t=JSON.parse(i)}catch(e){return{valid:!1,errors:[`JSON 구문 오류: ${e.message}`],descriptor:null}}return{...vb(t),descriptor:t}}function Ca(i,t){const e=new Set(i.map(s=>s.id));let n=1;for(;e.has(`${t}-${n}`);)n+=1;return`${t}-${n}`}function xb(i,t){if(t==="crane"){const e={id:Ca(i.cranes,"crane"),base:"crawler",pos:[0,0],boomLength:40};return i.cranes.push(e),e}if(t==="load"){const e={id:Ca(i.loads,"load"),name:"새 양중물",size:[3,1.5,3],mass:5,pos:[5,0],target:[15,0]};return i.loads.push(e),e}if(t==="obstacle"){const e={id:Ca(i.obstacles,"obstacle"),pos:[0,0],size:[6,4,6]};return i.obstacles.push(e),e}if(t==="noFlyZone"){const e={id:Ca(i.noFlyZones,"zone"),min:[-5,-5],max:[5,5]};return i.noFlyZones.push(e),e}throw new Error(`지원하지 않는 객체 종류: ${t}`)}function yb(i,t,e){const n=t==="noFlyZone"?i.noFlyZones:i[`${t}s`],s=n.findIndex(o=>o.id===e);if(s>=0&&n.splice(s,1),t==="load")for(const o of i.loads)o.dependsOn&&(o.dependsOn=o.dependsOn.filter(a=>a!==e));return s>=0}function Mb(i,t,e,n){const o=(t==="noFlyZone"?i.noFlyZones:i[`${t}s`]).find(d=>d.id===e);if(!o)throw new Error(`객체 없음: ${t}:${e}`);const a=Number(n.x),r=Number(n.z),l=Math.max(.1,Number(n.width)),c=Math.max(.1,Number(n.height)),h=Math.max(.1,Number(n.depth));return t==="noFlyZone"?(o.min=[a-l/2,r-h/2],o.max=[a+l/2,r+h/2]):(o.pos=[a,r],(t==="load"||t==="obstacle")&&(o.size=[l,c,h]),t==="load"&&(o.mass=Math.max(.1,Number(n.mass)))),o}function bb(i,t){var d;const e=(u,p)=>Number.isFinite(Number(u))?Number(u):p,n=Math.max(10,Number(t.width)),s=Math.max(10,Number(t.depth));i.site={...i.site??{},width:n,depth:s,minX:-n/2,minZ:-s/2},i.wind={...i.wind??{},speed:Math.max(0,Number(t.windSpeed)),dir:e(t.windDirection,0)*Math.PI/180,maxOperating:Math.max(.1,e(t.maxOperatingWind,15)),gust:{amp:Math.max(0,e(t.gustPercent,0))/100,period:Math.max(1,e(t.gustPeriod,20))}},i.ground={...i.ground??{},bearingCapacity:Math.max(.1,Number(t.bearingCapacity))};const o=-n/2+3,a=n/2-3,r=-s/2+3,l=s/2-3,c=Math.max(0,Math.floor(e(t.workerCount,0))),h=Math.max(0,Math.floor(e(t.vehicleCount,0)));return i.agents={seed:((d=i.agents)==null?void 0:d.seed)??20260706,dangerRadius:Math.max(.5,e(t.dangerRadius,5)),workers:c?[{count:c,area:{min:[o,r],max:[a,l]},speed:[Math.max(.1,e(t.workerSpeed,1.1)*.8),Math.max(.1,e(t.workerSpeed,1.1)*1.2)],idle:[2,6]}]:[],vehicles:h?[{count:h,route:[[o,r],[a,r],[a,l],[o,l]],speed:Math.max(.1,e(t.vehicleSpeed,2.2))}]:[]},i}function Sb(){return{name:"새 시나리오",cranes:[],loads:[],obstacles:[],noFlyZones:[],rigging:{rigTime:0,derigTime:0,trialLiftTime:0},ground:{bearingCapacity:0},wind:{speed:0,maxOperating:0},site:{width:100,depth:80,minX:-50,minZ:-40},powerLines:[],heightLimits:[],weather:null,shifts:[],resources:[],laydown:{slots:[]},groundZones:[],logistics:{assemblyArea:[30,20],assistCranes:0}}}function wb(i,t){const e=[...t.pos];if(t.kind==="crane")i.cranes.find(n=>n.id===t.id).pos=e;else if(t.kind==="load")i.loads.find(n=>n.id===t.id).pos=e;else if(t.kind==="target")i.loads.find(n=>n.id===t.id).target=e;else if(t.kind==="obstacle")i.obstacles.find(n=>n.id===t.id).pos=e;else if(t.kind==="noFlyZone"){const n=i.noFlyZones.find(a=>a.id===t.id),s=[(n.min[0]+n.max[0])/2,(n.min[1]+n.max[1])/2],o=[e[0]-s[0],e[1]-s[1]];n.min=[n.min[0]+o[0],n.min[1]+o[1]],n.max=[n.max[0]+o[0],n.max[1]+o[1]]}return i}function Eb(i,t){return i.set(`${t.kind}:${t.id}`,{...t,pos:[...t.pos]}),i}function Tb(i){let t=i;for(;t;){if(t.userData.visualEdit)return t.userData.visualEdit;t=t.parent}return null}function Ab(i){let t=i;for(;t;){if(t.userData.visualEdit)return t;t=t.parent}return null}var sn,Fc,tp,ep,np,Nc;class Rb{constructor({camera:t,domElement:e,scene:n,controls:s,getObjects:o,onPreview:a,onCommit:r,onSelect:l}){Le(this,sn);this.camera=t,this.domElement=e,this.controls=s,this.getObjects=o,this.onPreview=a,this.onCommit=r,this.onSelect=l,this.enabled=!1,this.dragging=!1,this.currentEdit=null,this.raycaster=new tf,this.pointer=new Et,this.ground=new Gn(new L(0,1,0),0),this.hit=new L,this.marker=new st(new Ai(1.1,1.35,32),new Oe({color:16763989,side:Re,depthTest:!1})),this.marker.rotation.x=-Math.PI/2,this.marker.renderOrder=100,this.marker.visible=!1,n.add(this.marker),this._down=c=>z(this,sn,tp).call(this,c),this._move=c=>z(this,sn,ep).call(this,c),this._up=c=>z(this,sn,np).call(this,c),e.addEventListener("pointerdown",this._down,{capture:!0}),e.addEventListener("pointermove",this._move,{capture:!0}),e.addEventListener("pointerup",this._up,{capture:!0}),e.addEventListener("pointercancel",this._up,{capture:!0})}setEnabled(t){this.enabled=t,this.domElement.style.cursor=t?"grab":"",t||z(this,sn,Nc).call(this,!1)}refreshPreview(){var t;this.dragging&&this.currentEdit&&((t=this.onPreview)==null||t.call(this,this.currentEdit))}}sn=new WeakSet,Fc=function(t){const e=this.domElement.getBoundingClientRect();this.pointer.set((t.clientX-e.left)/e.width*2-1,-((t.clientY-e.top)/e.height)*2+1),this.raycaster.setFromCamera(this.pointer,this.camera)},tp=function(t){var a,r,l;if(!this.enabled||t.button!==0)return;z(this,sn,Fc).call(this,t);const e=this.raycaster.intersectObjects(this.getObjects(),!0).find(c=>Tb(c.object));if(!e)return;const n=Ab(e.object),s=n.userData.visualEdit;(a=this.onSelect)==null||a.call(this,s);const o=n.getWorldPosition(new L);this.dragOffset=new Et(o.x-e.point.x,o.z-e.point.z),this.dragging=!0,this.currentEdit={...s,pos:[o.x,o.z]},this.marker.visible=!0,this.marker.position.set(o.x,.08,o.z),this.controlsEnabledBeforeDrag=this.controls.enabled,this.controls.enabled=!1,this.domElement.style.cursor="grabbing",(l=(r=this.domElement).setPointerCapture)==null||l.call(r,t.pointerId),t.preventDefault(),t.stopImmediatePropagation(),t.stopPropagation()},ep=function(t){if(!this.dragging||(z(this,sn,Fc).call(this,t),!this.raycaster.ray.intersectPlane(this.ground,this.hit)))return;const e=this.hit.x+this.dragOffset.x,n=this.hit.z+this.dragOffset.y;this.currentEdit={...this.currentEdit,pos:[e,n]},this.marker.position.set(e,.08,n),t.preventDefault(),t.stopImmediatePropagation(),t.stopPropagation()},np=function(t){var n,s,o;if(!this.dragging)return;const e=this.currentEdit;z(this,sn,Nc).call(this,!0),(s=(n=this.domElement).releasePointerCapture)==null||s.call(n,t.pointerId),(o=this.onCommit)==null||o.call(this,e),t.preventDefault(),t.stopImmediatePropagation(),t.stopPropagation()},Nc=function(t){const e=this.dragging;this.dragging=!1,this.currentEdit=null,e&&(this.controls.enabled=this.controlsEnabledBeforeDrag),this.marker.visible=!!(t&&this.enabled),this.domElement.style.cursor=this.enabled?"grab":""};const Pa=(i,t)=>{if(!t)return!0;const e=t.minX??-(t.width??100)/2,n=t.minZ??-(t.depth??100)/2;return i[0]>=e&&i[0]<=e+(t.width??100)&&i[1]>=n&&i[1]<=n+(t.depth??100)},Cb=(i,t)=>Math.abs(i.pos[0]-t.pos[0])<(i.size[0]+t.size[0])/2&&Math.abs(i.pos[1]-t.pos[1])<(i.size[2]+t.size[2])/2,du=(i,t)=>i[0]>=t.min[0]&&i[0]<=t.max[0]&&i[1]>=t.min[1]&&i[1]<=t.max[1];function _n(i,t,e,n,s="error"){return{kind:i,id:t,code:e,message:n,severity:s}}function Pb(i){var s,o;const t=[],e=Qf(i),n=i.site;for(const a of i.cranes)Pa(a.pos,n)||t.push(_n("crane",a.id,"site-boundary","크레인이 현장 경계 밖에 있습니다."));for(const a of i.loads){Pa(a.pos,n)||t.push(_n("load",a.id,"site-boundary","양중물이 현장 경계 밖에 있습니다.")),Pa(a.target,n)||t.push(_n("target",a.id,"site-boundary","목표 위치가 현장 경계 밖에 있습니다."));const r=i.noFlyZones.find(u=>du(a.pos,u)),l=i.noFlyZones.find(u=>du(a.target,u));r&&t.push(_n("load",a.id,"no-fly-zone",`픽업 위치가 제한구역 ${r.id} 내부입니다.`)),l&&t.push(_n("target",a.id,"no-fly-zone",`목표 위치가 제한구역 ${l.id} 내부입니다.`));const c=e.loads.find(u=>u.id===a.id),h={...c,targetHeight:c.targetHeight??c.targetElev},d=e.cranes.map(u=>xr(u,{pos:[u.basePos[0],u.basePos[2]],boomLength:u.geometry.boomLength},[h],e));if(e.cranes.length===0)t.push(_n("load",a.id,"no-crane","배치된 크레인이 없습니다."));else if(!d.some(u=>u.feasible)){const u=[...new Set(d.flatMap(p=>p.lifts.map(m=>m.reason).filter(Boolean)))];t.push(_n("load",a.id,"lift-infeasible",`현재 셋업에서 인양 불가: ${u.slice(0,2).join(" / ")||"타당한 크레인 없음"}`)),t.push(_n("target",a.id,"lift-infeasible","현재 셋업에서 목표까지 도달할 수 없습니다."))}}for(const a of i.obstacles)Pa(a.pos,n)||t.push(_n("obstacle",a.id,"site-boundary","장애물이 현장 경계 밖에 있습니다."));for(let a=0;a<i.obstacles.length;a++)for(let r=a+1;r<i.obstacles.length;r++){const l=i.obstacles[a],c=i.obstacles[r];Cb(l,c)&&(t.push(_n("obstacle",l.id,"overlap",`장애물 ${c.id}와 겹칩니다.`)),t.push(_n("obstacle",c.id,"overlap",`장애물 ${l.id}와 겹칩니다.`)))}for(const a of i.cranes)for(const r of i.obstacles){const l=((o=(s=a.spec)==null?void 0:s.geometry)==null?void 0:o.bodyRadius)??3.5;Math.abs(a.pos[0]-r.pos[0])<l+r.size[0]/2&&Math.abs(a.pos[1]-r.pos[1])<l+r.size[2]/2&&t.push(_n("crane",a.id,"obstacle-overlap",`장애물 ${r.id}와 본체가 겹칩니다.`))}return t}class Lb{constructor(){this.root=new Nt,this.root.name="quick-validation"}update(t,e){this.root.clear();const n=new Set;for(const s of t){const o=`${s.kind}:${s.id}`;if(n.has(o))continue;n.add(o);const a=e(s.kind,s.id);if(!a)continue;a.updateWorldMatrix(!0,!0);const r=new Ex(a,s.severity==="error"?16726832:16756768);r.material.depthTest=!1,r.material.transparent=!0,r.material.opacity=.95,r.renderOrder=110,this.root.add(r)}}}const vl=i=>structuredClone(i);class Ib{constructor(t=50){this.limit=Math.max(2,t),this.entries=[],this.index=-1}reset(t){return this.entries=[vl(t)],this.index=0,this.current()}commit(t){const e=vl(t),n=this.entries[this.index];return n&&JSON.stringify(n)===JSON.stringify(e)?this.current():(this.entries.splice(this.index+1),this.entries.push(e),this.entries.length>this.limit&&this.entries.shift(),this.index=this.entries.length-1,this.current())}undo(){return this.canUndo?(this.index-=1,this.current()):null}redo(){return this.canRedo?(this.index+=1,this.current()):null}current(){return this.index>=0?vl(this.entries[this.index]):null}get canUndo(){return this.index>0}get canRedo(){return this.index>=0&&this.index<this.entries.length-1}}const Sr={maxSteps:4e4,slewGain:20,luffGain:1.25,hoistGain:1.25,alignTol:.5,approachTol:1,releaseSwayMax:.2,clearance:1.5,creepSpeed:.3,creepZone:2,trialLiftTime:null},To={slew:0,luff:0,hoist:0},zn=(i,t,e)=>Math.min(e,Math.max(t,i)),Oc=i=>{for(;i>Math.PI;)i-=2*Math.PI;for(;i<-Math.PI;)i+=2*Math.PI;return i};function ip(i,t){var n,s;if(t.state==="pending")return`반입 전 (t=${t.arriveTime}s 도착 예정)`;if(t.finalLeg){const o=t.dependsOn.filter(a=>{var r;return((r=i.world.loads.find(l=>l.id===a))==null?void 0:r.state)!=="placed"});if(o.length>0)return`선행 부재 미완: ${o.join(", ")}`}if(i.world.windDef&&i.world.windSpeed>i.world.windLimitFor(t))return`풍속 초과: ${i.world.windSpeed.toFixed(1)} > 한계 ${i.world.windLimitFor(t)} m/s`;const e=Ha((n=i.scenario)==null?void 0:n.weather,i.world.time);return e.blocked?`기상 작업중지: ${e.reasons.join(", ")}`:Ga((s=i.scenario)==null?void 0:s.shifts,i.world.time).available?null:"작업 교대시간 외"}function lh(i,t,e){const n=Math.max(0,...i.world.obstacles.map(s=>s.size[1]),...i.world.loads.filter(s=>s.state==="placed").map(s=>s.topY));return Math.max(8,n+t.size[1]+wn+e,t.targetElev+t.size[1]+wn+e)}function ch(i,t,e,n={}){var R;const s=n.clearance??Sr.clearance,o=i.world.cranes[t],a=i.world.loads.find(b=>b.id===e);if(!o)return{feasible:!1,reason:`크레인 없음: ${t}`};if(!a)return{feasible:!1,reason:`부재 없음: ${e}`};if(!a.target)return{feasible:!1,reason:`목표(target) 미정의: ${e}`};if(a.state==="placed")return{feasible:!1,reason:"이미 안착됨"};if(a.state==="hooked"&&a.hookedBy!==t)return{feasible:!1,reason:"다른 크레인이 인양 중"};const[r,,l]=o.basePos,c=Math.hypot(a.pos[0]-r,a.pos[2]-l),h=Math.hypot(a.target[0]-r,a.target[1]-l),[d,u]=o.getRadiusRange(),p=.05;if(c<d-p||c>u+p)return{feasible:!1,reason:`픽업 반경 ${c.toFixed(1)}m가 도달범위 [${d.toFixed(1)}, ${u.toFixed(1)}] 밖`};if(h<d-p||h>u+p)return{feasible:!1,reason:`목표 반경 ${h.toFixed(1)}m가 도달범위 [${d.toFixed(1)}, ${u.toFixed(1)}] 밖`};const m=o.spec.rating??{},_=a.mass*(m.dynamicFactor??1),g=m.hookBlockMass??0,f=o.capacityAtRadius(c)-g,x=o.capacityAtRadius(h)-g;if(_>f)return{feasible:!1,reason:`정격 초과: 필요 ${_.toFixed(1)}t(동하중 포함) > 가용 ${f.toFixed(1)}t @픽업 r=${c.toFixed(1)}m`};if(_>x)return{feasible:!1,reason:`정격 초과: 필요 ${_.toFixed(1)}t(동하중 포함) > 가용 ${x.toFixed(1)}t @목표 r=${h.toFixed(1)}m`};const y=((R=i.scenario)==null?void 0:R.ground)??null;if(y&&o.spec.masses){const b=pr({spec:o.spec,boomLength:o.boomLength,radius:Math.max(c,h),loadMass:a.mass,ground:y});if(!b.tipOK)return{feasible:!1,reason:`전도 여유 부족: 안전율 ${b.tippingMargin.toFixed(2)} < 1.33 @r=${Math.max(c,h).toFixed(1)}m`};if(!b.groundOK)return{feasible:!1,reason:`지반 지지력 부족: 접지압 ${b.groundPressure.toFixed(1)} > 허용 ${y.bearingCapacity}t/m²`}}const v=ip(i,a);if(v)return{feasible:!1,blocked:!0,reason:v};const w=lh(i,a,s),E=Math.min(o.maxHookHeightAt(c),o.maxHookHeightAt(h))-.5;return{feasible:!0,travelY:Math.min(w,E),target:[...a.target],rLoad:c,rTarget:h}}function Db(i,t,e,n,s={}){var S;const o=i.world.cranes[t],a=i.world.loads.find(R=>R.id===e);if(!o||o.spec.type!=="mobile")return{feasible:!1,reason:"픽앤캐리는 이동식 크레인만 가능"};if(!a)return{feasible:!1,reason:`부재 없음: ${e}`};if(!a.target)return{feasible:!1,reason:`목표 미정의: ${e}`};const r=o.spec.planning??{};if(!(r.movable??!0))return{feasible:!1,reason:"고정식 크레인"};const l=o.spec.rating??{},c=l.dynamicFactor??1,h=l.hookBlockMass??0,[d,u]=s.fromBase??[o.basePos[0],o.basePos[2]],[p,m]=o.getRadiusRange(),_=Math.hypot(a.pos[0]-d,a.pos[2]-u);if(_<p-.05||_>m+.05)return{feasible:!1,reason:`픽업 반경 ${_.toFixed(1)}m 도달범위 밖 [${p.toFixed(1)}, ${m.toFixed(1)}]`};if(a.mass*c>o.capacityAtRadius(_)-h)return{feasible:!1,reason:`픽업 정격 초과 @r=${_.toFixed(1)}m`};const g=Math.hypot(a.target[0]-n[0],a.target[1]-n[1]);if(g<p-.05||g>m+.05)return{feasible:!1,reason:`안착 반경 ${g.toFixed(1)}m 도달범위 밖 (캐리 목적지 기준)`};if(a.mass*c>o.capacityAtRadius(g)-h)return{feasible:!1,reason:`안착 정격 초과 @r=${g.toFixed(1)}m`};const f=Math.min(m,Math.max(p,r.carryRadius??p+2)),x=a.size[1]/2+(r.carryClearance??.8),y=ny(o.capacityAtRadius(f),l)-h;if(a.mass>y)return{feasible:!1,reason:`픽앤캐리 감격 정격 초과: ${a.mass}t > 감격 ${y.toFixed(1)}t @r=${f.toFixed(1)}m`};const v=((S=i.scenario)==null?void 0:S.ground)??null;if(o.spec.masses){const R=r.carryAccel??.3,b=iy({spec:o.spec,boomLength:o.boomLength,carryRadius:f,carryHeight:x,loadMass:a.mass,accel:R});if(!b.tipOK)return{feasible:!1,reason:`주행 중 전도 여유 부족: 안전율 ${b.tippingMargin.toFixed(2)} < 1.33`};if(v){const M=pr({spec:o.spec,boomLength:o.boomLength,radius:f,loadMass:a.mass,ground:v});if(!M.groundOK)return{feasible:!1,reason:`지반 지지력 부족(캐리): 접지압 ${M.groundPressure.toFixed(1)} > ${v.bearingCapacity}`}}}const w=ip(i,a);if(w)return{feasible:!1,blocked:!0,reason:w};const E=lh(i,a,s.clearance??Sr.clearance);return{feasible:!0,carryRadius:f,carryHeight:x,target:[...a.target],travelY:E,rPick:_,rPlace:g}}function Ub(i,t,e,n={}){var b,M;const s=i.world.cranes[t],o=i.world.loads.find(C=>C.id===e);let a;if(n.assumeFeasible)a={feasible:!0,travelY:lh(i,o,n.clearance??Sr.clearance)};else if(a=ch(i,t,e,n),!a.feasible&&!a.blocked)return null;const[r,l]=n.basePos??[s.basePos[0],s.basePos[2]],c=n.boomLength??s.boomLength,h=s.limits,d=s.slewAngle,u=s.getRadius(),p=s.getHookPos()[1],m=Math.atan2(o.pos[2]-l,o.pos[0]-r),_=Math.hypot(o.pos[0]-r,o.pos[2]-l),g=Math.atan2(o.target[1]-l,o.target[0]-r),f=Math.hypot(o.target[0]-r,o.target[1]-l),x=s.spec.type==="tower"?h.trolleySpeed:c*.8*h.luffRate,y=h.hoistSpeed,v=a.travelY??10,w=o.topY,E=o.targetElev??0,S=n.trialLiftTime??((M=(b=i.scenario)==null?void 0:b.rigging)==null?void 0:M.trialLiftTime)??0;return(Math.abs(Oc(m-d))/h.slewRate+Math.abs(_-u)/x+Math.abs(p-(w+2.5))/y+o.rigTime+S+Math.max(0,v-(w+1.2))/y+Math.abs(Oc(g-m))/h.slewRate+Math.abs(f-_)/x+Math.max(0,v-(E+o.size[1]))/y+2/(.3*y)+o.derigTime+3.5/y+8)*1.15}var le,qa,ln,Si;class Fb{constructor(t,e,n,s={}){Le(this,le);var r,l;this.sim=t,this.craneId=e,this.loadId=n,this.opts={...Sr,...s},this.phase="init",this.done=!1,this.ok=!1,this.reason=null,this.steps=0,this.phaseLog=[],this.finalErr=null,this._toggleRequested=!1,this.trialTime=this.opts.trialLiftTime??((l=(r=t.scenario)==null?void 0:r.rigging)==null?void 0:l.trialLiftTime)??0,this._trialSteps=0;const o=t.world.loads.find(c=>c.id===n);this._pickupElev=o?o.bottomY:0,this._startStage=(o==null?void 0:o.stage)??0,this.carryTo=s.carryTo??null,this.carrying=!1,this._carryVel=0;const a=this.carryTo?Db(t,e,n,this.carryTo,this.opts):ch(t,e,n,this.opts);a.feasible?(this.travelY=a.travelY,this.target=a.target,this.carryTo&&(this.carrying=!0,this.carryRadius=a.carryRadius,this.carryHeight=a.carryHeight),z(this,le,ln).call(this,"goto-load")):z(this,le,Si).call(this,!1,a.reason,"infeasible")}decide(){var d;if(this.done)return{command:To,attach:!1,done:!0,phase:this.phase};if(this.steps+=1,this.steps>this.opts.maxSteps)return z(this,le,Si).call(this,!1,`타임아웃 (phase=${this.phase})`),{command:To,attach:!1,done:!0,phase:this.phase};const t=this.opts,e=this.sim.getState(),n=e.cranes[this.craneId],s=e.loads.find(u=>u.id===this.loadId);if(!s)return z(this,le,Si).call(this,!1,"부재 소실"),{command:To,attach:!1,done:!0,phase:this.phase};const o=n.hookPos,a=s.pos[1]+s.size[1]/2,r=s.state==="hooked"?s.targetElev??0:0,l=s.pos[1]-s.size[1]/2-r;let c=To,h=!1;switch(this.phase){case"goto-load":{c=z(this,le,qa).call(this,n,s.pos[0],s.pos[2],a+2.5),Math.hypot(o[0]-s.pos[0],o[2]-s.pos[2])<=t.approachTol&&Math.abs(o[1]-a)<=3.5&&z(this,le,ln).call(this,"attach");break}case"attach":{this._toggleRequested?s.state==="rigging"||(s.state==="hooked"&&s.hookedBy===this.craneId?(this._toggleRequested=!1,z(this,le,ln).call(this,this.trialTime>0?"trial":this.carrying?"lift-carry":"lift")):(this._toggleRequested=!1,z(this,le,Si).call(this,!1,"줄걸이 실패 (후크가 부재 범위 밖)"))):(this._toggleRequested=!0,h=!0);break}case"trial":{const u=s.pos[1]-s.size[1]/2-(this._pickupElev??0),p=(this._pickupElev??0)+wn+s.size[1]+.4;u<.25?c={slew:0,luff:0,hoist:zn((p-o[1])*t.hoistGain,-1,.4)}:(this._trialSteps+=1,this._trialSteps*li>=this.trialTime&&z(this,le,ln).call(this,this.carrying?"lift-carry":"lift"));break}case"lift-carry":{const u=this.carryHeight+s.size[1]/2+wn;c={slew:0,luff:zn((this.carryRadius-n.radius)*t.luffGain,-1,1),hoist:zn((u-o[1])*t.hoistGain,-1,1)},Math.abs(n.radius-this.carryRadius)<.5&&Math.abs(o[1]-u)<.4&&z(this,le,ln).call(this,"carry");break}case"carry":{const u=this.sim.world.cranes[this.craneId],p=u.spec.planning??{},m=Math.max(.01,p.carrySpeed??.4),_=Math.max(.01,p.carryAccel??.3),g=this.carryTo[0]-u.basePos[0],f=this.carryTo[1]-u.basePos[2],x=Math.hypot(g,f),y=this.carryHeight+s.size[1]/2+wn;if(c={slew:0,luff:zn((this.carryRadius-n.radius)*t.luffGain,-1,1),hoist:zn((y-o[1])*t.hoistGain,-1,1)},x<.15)this._carryVel=0,this.carrying=!1,z(this,le,ln).call(this,"lift");else{const v=Math.min(m,Math.sqrt(2*_*x));this._carryVel=Math.min(this._carryVel+_*li,v);const w=Math.min(x,this._carryVel*li);u.basePos[0]+=g/x*w,u.basePos[2]+=f/x*w}break}case"lift":{c={slew:0,luff:0,hoist:zn((this.travelY-o[1])*t.hoistGain,-1,1)},Math.abs(o[1]-this.travelY)<.4&&z(this,le,ln).call(this,"goto-target");break}case"goto-target":{c=z(this,le,qa).call(this,n,this.target[0],this.target[1],this.travelY),Math.hypot(s.pos[0]-this.target[0],s.pos[2]-this.target[1])<=t.alignTol&&z(this,le,ln).call(this,"lower");break}case"lower":{const u=Math.hypot(s.pos[0]-this.target[0],s.pos[2]-this.target[1]),p=z(this,le,qa).call(this,n,this.target[0],this.target[1],(s.targetElev??0)+wn+s.size[1]+.3);u>t.alignTol*2&&(p.hoist=0),l<t.creepZone&&(p.hoist=Math.max(p.hoist,-t.creepSpeed)),c=p;const m=(n.extra.swayMag??0)<=t.releaseSwayMax;l<=.45&&u<=t.alignTol&&m&&(this.finalErr=u,z(this,le,ln).call(this,"release"));break}case"release":{this._toggleRequested?s.state==="derigging"||(this._toggleRequested=!1,s.state==="placed"||(s.stage??0)>this._startStage?z(this,le,ln).call(this,"clear"):s.state==="hooked"?z(this,le,ln).call(this,"lower"):z(this,le,Si).call(this,!1,`목표 밖 안착 (오차 ${(d=this.finalErr)==null?void 0:d.toFixed(2)}m)`)):(this._toggleRequested=!0,h=!0);break}case"clear":{c={slew:0,luff:0,hoist:zn((a+3.5-o[1])*t.hoistGain,-1,1)},o[1]>=a+3&&z(this,le,Si).call(this,!0,null);break}default:z(this,le,Si).call(this,!1,`알 수 없는 phase: ${this.phase}`)}return{command:c,attach:h,done:this.done,phase:this.phase}}}le=new WeakSet,qa=function(t,e,n,s){const o=this.opts,[a,,r]=t.basePos,l=Math.atan2(n-r,e-a),c=Math.hypot(e-a,n-r);return{slew:zn(Oc(l-t.slewAngle)*o.slewGain,-1,1),luff:zn((c-t.radius)*o.luffGain,-1,1),hoist:zn((s-t.hookPos[1])*o.hoistGain,-1,1)}},ln=function(t){this.phase=t,this.phaseLog.push({phase:t,t:this.steps*li})},Si=function(t,e,n="done"){this.done=!0,this.ok=t,this.reason=e,z(this,le,ln).call(this,n)};function Nb(i,t,e,n={}){const s=new Fb(i,t,e,n),o=i.getState().cranes.length,a=i.getState().safety,r={col:a.collisionCount,vio:a.violationCount};for(;!s.done;){const c=s.decide();if(c.done)break;c.attach&&i.toggleAttach(t);const h=Array.from({length:o},(d,u)=>u===t?c.command:To);i.stepFixed(h,1)}const l=i.getState().safety;return{ok:s.ok,reason:s.reason,steps:s.steps,cycleTime:s.steps*li,placeError:s.finalErr,collisions:l.collisionCount-r.col,violations:l.violationCount-r.vio,phases:s.phaseLog}}function uu(i,t,e,n={}){const s=n.mode??"estimate",o=new oh(i),a=ch(o,t,e);if(!a.feasible)return{feasible:!1,blocked:!!a.blocked,reason:a.reason,cycleTime:null,method:s};if(s==="simulate"){const r=Nb(o,t,e);return{feasible:r.ok,blocked:!1,reason:r.reason,cycleTime:r.ok?r.cycleTime:null,collisions:r.collisions,violations:r.violations,placeError:r.placeError,method:"simulate"}}return{feasible:!0,blocked:!1,reason:null,cycleTime:Ub(o,t,e),method:"estimate"}}function Ob(i,t=[]){const e=t.map(({craneId:a,loadId:r})=>{const l=uu(i,a,r,{mode:"estimate"}),c=uu(i,a,r,{mode:"simulate"}),h=l.cycleTime&&c.cycleTime?c.cycleTime/l.cycleTime:null;return{craneId:a,loadId:r,estimate:l.cycleTime,simulate:c.cycleTime,ratio:h,feasible:l.feasible&&c.feasible}}),n=e.filter(a=>Number.isFinite(a.ratio)),s=n.length?n.reduce((a,r)=>a+r.ratio,0)/n.length:null,o=n.length?n.reduce((a,r)=>a+Math.abs(r.simulate-r.estimate),0)/n.length:null;return{rows:e,correctionFactor:s,mae:o}}const kb=document.getElementById("app"),hh=document.getElementById("hud"),zb=document.getElementById("dashboard"),ue=new Wx(kb),fu=new fM,Fn=new uM,as=new By(ue.camera,ue.controls),wr=new Hy,sp=new Vy;ue.scene.add(sp.root);const op=new Yy;ue.scene.add(op.root);const zs=new Ky;ue.scene.add(zs.root);let Ps=!1;const Er=new Lb;Er.root.visible=!1;ue.scene.add(Er.root);const Ks=new sM(document.getElementById("overlay"));let nn=!0,ci=!0;for(const i of["pointerdown","keydown"])window.addEventListener(i,()=>wr.unlock(),{once:!0});const xl=i=>i*180/Math.PI;let Ae=1,Gt=null,Js=[],En=null,ye=null,Ao=null,Ya=null,ne=0,Nn=!1,xn=null,de=null,Lo=null,kc=!1,Rs=-1,Mn=!1,Ce=null,pu=!1,Bs=null,sr=!1;const Tr=new Map,di=new Ib(50);let Hs=null,Ge=null;const bt=new pM(zb,Ee,{scenario:i=>{Mn&&Io(),Li(i),Oo()},crane:i=>{ne=i},speed:i=>Gt.setTimeScale(i),pause:()=>{Nn=!Nn},reset:()=>{Mn&&Io(),Li(Ae),Oo()},attach:()=>{!Ge&&!Nn&&Gt.toggleAttach(ne)},record:()=>lp(),replay:()=>cp(),plan:()=>{var i,t;try{xn=GM(Ee[Ae].scenario,{policy:bt.getPlanPolicy(),hardClearance:(i=Ee[Ae].scenario.planning)==null?void 0:i.hardClearance,softClearance:(t=Ee[Ae].scenario.planning)==null?void 0:t.softClearance,sampleStep:5}),de=new Lc(Ee[Ae].scenario,xn),bt.setPlanResult(xn)}catch(e){bt.setPlanResult(null),console.error(e)}},planPlay:()=>{de&&de.toggle()},planReset:()=>de==null?void 0:de.reset(),planSpeed:i=>de==null?void 0:de.setSpeed(i),planSeek:i=>de==null?void 0:de.seek(i),manualPlan:i=>{var t,e;try{const n=Ee[Ae].scenario;xn=$M(n,i,{hardClearance:(t=n.planning)==null?void 0:t.hardClearance,softClearance:(e=n.planning)==null?void 0:e.softClearance}),xn.validation3D=Jf(n,xn,{sampleStep:5}),de=new Lc(n,xn),bt.setPlanResult(xn)}catch(n){bt.showPlanError(n.message)}},scenarioTemplate:()=>{bt.setScenarioJSON(Sb()),bt.showScenarioValidation([])},scenarioApply:()=>{const i=hu(bt.getScenarioJSON());if(!i.valid){bt.showScenarioValidation(i.errors);return}dh(i.descriptor),Ar(i.descriptor)},scenarioSave:()=>{const i=hu(bt.getScenarioJSON());if(!i.valid)return bt.showScenarioValidation(i.errors);hp(i.descriptor,`scenario-${Date.now()}.json`)},scenarioLoad:()=>bt.openScenarioFile(),visualEdit:()=>Io(),editorUndo:()=>ar(di.undo()),editorRedo:()=>ar(di.redo()),objectAdd:()=>{const i=La(),t=xb(i,bt.getObjectKind());Ia(i,{kind:bt.getObjectKind(),id:t.id})},objectUpdate:()=>{const i=bt.getSelectedObject();if(!i)return;const t=La();Mb(t,i.kind,i.id,bt.getObjectValues()),Ia(t,i)},objectDelete:()=>{const i=bt.getSelectedObject();if(!i)return;const t=La();yb(t,i.kind,i.id),Ia(t)},environmentUpdate:()=>{const i=La();bb(i,bt.getEnvironmentValues()),Ia(i)},calibrate:()=>{const i=Ee[Ae].scenario,t=(i.loads??[]).slice(0,3).map(e=>({craneId:0,loadId:e.id}));bt.showCalibration(Ob(i,t))},requestSetupPick:i=>{Lo=i},camera:()=>{as.cycle(),bt.setCameraMode(as.label)},mute:()=>bt.setMuted(wr.toggleMute()),hud:()=>{ci=!ci,hh.style.display=ci?"":"none",bt.setHud(ci)},assist:()=>{nn=!nn,Ks.setEnabled(nn),bt.setAssist(nn)}});Bs=new Rb({camera:ue.camera,domElement:ue.renderer.domElement,scene:ue.scene,controls:ue.controls,getObjects:()=>[...Js.map(i=>i.root),...En?[...En.meshes.values()]:[],...ye?[...[...ye.targets.values()].flatMap(i=>[i.fill,i.ring]),...ye.obstacles.values(),...[...ye.noFlyZones.values()].flatMap(i=>[i.fill,i.border])]:[]],onPreview:i=>ap(i),onSelect:i=>bt.selectScenarioObject(i),onCommit:i=>{wb(Ce,i),Eb(Tr,i),dh(Ce),bt.setScenarioJSON(Ce),sr=!0,bt.showScenarioPending(),rp()}});ue.onGroundDoubleClick(i=>{if(Lo==null)return;const t=Lo;Lo=null,kc=!1,Ks.hideScore(),bt.applySetupPoint(t,i)});function Bb(i){return i.type==="tower"?new jx(i):new Yx(i)}function La(){return Ce?structuredClone(Ce):rh(Ee[Ae].scenario,Ee[Ae].name)}function Ia(i,t=null){dh(i),bt.setScenarioJSON(i),Ar(i),bt.setEditorDescriptor(Ce,t)}function or(){bt.setEditorHistory(di.canUndo,di.canRedo)}function Oo(){di.reset(Ce),or()}function dh(i){di.commit(i),or()}function ar(i){if(!i)return or();bt.setScenarioJSON(i),Ar(i),bt.setEditorDescriptor(Ce),or()}function Ar(i){Ce=structuredClone(i);const t={id:"custom",name:i.name??"사용자 시나리오",desc:"시나리오 편집기에서 생성",scenario:Qf(i)};Rs<0?(Ee.push(t),Rs=Ee.length-1,bt.addScenario(t,Rs)):(Ee[Rs]=t,bt.renameScenario(Rs,t.name)),bt.showScenarioValidation([]),sr=!1,Tr.clear(),Li(Rs)}function Io(){if(Mn=!Mn,Mn){const i=Ee[Ae];Ce=rh(i.scenario,i.name),bt.setScenarioJSON(Ce),bt.setEditorDescriptor(Ce),pu=Nn,Nn=!0,de=null,Ge=null,sr=!1,Tr.clear()}else Bs.setEnabled(!1),sr&&Ar(Ce),Nn=pu;Mn&&Bs.setEnabled(!0),Er.root.visible=Mn,bt.setVisualEdit(Mn)}function ap(i){const[t,e]=i.pos;if(i.kind==="crane"){const n=Ce.cranes.findIndex(s=>s.id===i.id);n>=0&&Js[n].root.position.set(t,0,e)}else if(i.kind==="load"){const n=En.meshes.get(i.id);n&&n.position.set(t,n.position.y,e)}else if(i.kind==="target"){const n=ye.targets.get(i.id);n==null||n.fill.position.set(t,n.fill.position.y,e),n==null||n.ring.position.set(t,n.ring.position.y,e)}else if(i.kind==="obstacle"){const n=ye.obstacles.get(i.id);n==null||n.position.set(t,n.position.y,e)}else if(i.kind==="noFlyZone"){const n=ye.noFlyZones.get(i.id);n==null||n.fill.position.set(t,n.fill.position.y,e),n==null||n.border.position.set(t,0,e)}}function Hb(i,t){var e,n,s;if(i==="crane"){const o=Ce.cranes.findIndex(a=>a.id===t);return((e=Js[o])==null?void 0:e.root)??null}return i==="load"?(En==null?void 0:En.meshes.get(t))??null:i==="target"?((n=ye==null?void 0:ye.targets.get(t))==null?void 0:n.fill)??null:i==="obstacle"?(ye==null?void 0:ye.obstacles.get(t))??null:i==="noFlyZone"?((s=ye==null?void 0:ye.noFlyZones.get(t))==null?void 0:s.fill)??null:null}function rp(){if(!Ce||!En||!ye)return;const i=Pb(Ce);Er.update(i,Hb),bt.showQuickValidation(i)}function Li(i){Ae=(i%Ee.length+Ee.length)%Ee.length;const t=Ee[Ae];Mn||(Ce=rh(t.scenario,t.name));for(const s of Js)ue.scene.remove(s.root);En&&ue.scene.remove(En.root),ye&&ue.scene.remove(ye.root),Ao&&ue.scene.remove(Ao.root),Ya&&Ya.dispose(),Gt=new oh(t.scenario),Gt.setTimeScale(5),ne=0,Nn=!1,xn=null,de=null,Lo=null,Ge=null,Fn.active&&Fn.stop();const e=Gt.getState();Js=t.scenario.cranes.map(s=>{const o=Bb(s);return o.root.userData.visualEdit={kind:"crane",id:s.id},ue.scene.add(o.root),o}),En=new Py(e.loads),ue.scene.add(En.root),ye=new Dy(e,t.scenario),ue.scene.add(ye.root),Ao=new ky(e.agents??[]),ue.scene.add(Ao.root),Ya=new Ny(ue.scene);const n=[...t.scenario.cranes.map(s=>s.basePos),...(t.scenario.loads??[]).flatMap(s=>[s.pos,s.target,...(s.route??[]).map(o=>o.target)].filter(Boolean))];ue.applySite(t.scenario,n),ue.framePoints(n),as.retarget(),bt.setScenario(Ae),bt.setCranes(t.scenario.cranes,ne),bt.setPlanResult(null),bt.setEditorDescriptor(Ce),Ks.showOnboarding(t),zc(),zs.setVisible(Ps),Mn&&(Nn=!0),rp()}function zc(){try{const i=Ee[Ae].scenario,t=i.cranes[ne],e=(i.loads??[]).map(o=>{const a=o.route??(o.target?[{target:o.target,elev:o.targetElev??0}]:[]),r=a[a.length-1];return r?{id:o.id,pos:o.pos,target:[r.target[0],r.elev??0,r.target[1]],mass:o.mass}:null}).filter(Boolean);if(e.length===0){zs.setCandidates([]);return}const n={ground:i.ground,groundZones:i.groundZones,powerLines:i.powerLines,heightLimits:i.heightLimits,logistics:i.logistics};let s=Kd(t,e,n,{topN:8});if(s.length===0){const o=[];for(const a of e){const r=Kd(t,[a],n,{topN:1});r[0]&&o.push(r[0])}s=o.sort((a,r)=>r.score-a.score).slice(0,8)}zs.setCandidates(s.map(o=>({pos:o.pos,boomLength:o.boomLength,score:o.score,reach:Ys(t,o.boomLength)[1]})))}catch{zs.setCandidates([])}}Li(Ae);bt.setScenarioJSON(Ce);Oo();window.addEventListener("keydown",i=>{if(i.code==="Tab"&&i.preventDefault(),(i.ctrlKey||i.metaKey)&&!i.altKey&&i.code==="KeyZ"){i.preventDefault(),ar(i.shiftKey?di.redo():di.undo());return}if((i.ctrlKey||i.metaKey)&&!i.altKey&&i.code==="KeyY"){i.preventDefault(),ar(di.redo());return}i.code==="Digit1"&&Gt.setTimeScale(1),i.code==="Digit2"&&Gt.setTimeScale(5),i.code==="Digit3"&&Gt.setTimeScale(10),i.code==="Digit4"&&Gt.setTimeScale(20),i.code==="KeyN"&&(Mn&&Io(),Li(Ae+(i.shiftKey?-1:1)),Oo()),i.code==="KeyO"&&(Mn&&Io(),Li(Ae),Oo()),i.code==="KeyG"&&ue.toggleGrid(),i.code==="KeyC"&&(as.cycle(),bt.setCameraMode(as.label)),i.code==="KeyM"&&bt.setMuted(wr.toggleMute()),i.code==="KeyH"&&(nn=!nn,Ks.setEnabled(nn),bt.setAssist(nn)),i.code==="KeyI"&&(ci=!ci,hh.style.display=ci?"":"none",bt.setHud(ci)),i.code==="KeyK"&&(Ps=!Ps,Ps&&zc(),zs.setVisible(Ps)),i.code==="Tab"&&(ne=(ne+1)%Gt.getState().cranes.length,bt.setActiveCrane(ne),Ps&&zc()),i.code==="KeyR"&&!Ge&&lp(),i.code==="KeyP"&&Hs&&!Fn.active&&cp()});function lp(){if(!Ge)if(Fn.active){const i=Fn.stop(Gt.completionScore());hp(i,`episode-${i.scenarioId}-${Date.now()}.json`),Hs=i}else Li(Ae),Fn.start(Ee[Ae].id)}function cp(){if(!Hs||Fn.active)return;const i=Ee.findIndex(t=>t.id===Hs.scenarioId);i>=0&&(Li(i),Ge={frames:Hs.frames,i:0})}function hp(i,t){const e=new Blob([JSON.stringify(i)],{type:"application/json"}),n=document.createElement("a");n.href=URL.createObjectURL(e),n.download=t,n.click(),URL.revokeObjectURL(n.href)}let mu=performance.now(),yl=0,dp=0,Da=0;function up(i){var m,_,g;const t=Math.min((i-mu)/1e3,.1);mu=i,yl+=1,Da+=t,Da>=.5&&(dp=Math.round(yl/Da),yl=0,Da=0);const e=Gt.getState().cranes.length;let n,s={slew:0,luff:0,hoist:0,tag:0};if(de)de.update(t),n=de.stateAt(Gt.getState());else if(Ge){const f=Ge.frames[Ge.i];f?(f.at!=null&&f.at>=0&&Gt.toggleAttach(f.at),Gt.setTimeScale(f.ts??1),n=Gt.step(f.dt,f.cmds),s=f.cmds[ne]??s,Ge.i+=1):(Ge=null,n=Gt.getState())}else if(Nn)n=Gt.getState();else{let f=-1;fu.consumeAttach()&&(Gt.toggleAttach(ne),f=ne);const x=fu.getCommand(),y=bt.getCommand(),v=E=>Math.max(-1,Math.min(1,E));s={slew:v(x.slew+y.slew),luff:v(x.luff+y.luff),hoist:v(x.hoist+y.hoist),drive:v((x.drive??0)+(y.drive??0)),steer:v((x.steer??0)+(y.steer??0)),tag:v((x.tag??0)+(y.tag??0))};const w=Array.from({length:e},(E,S)=>S===ne?s:{slew:0,luff:0,hoist:0,tag:0});Fn.frame(t,Gt.timeScale,w,f),n=Gt.step(t,w)}n.cranes.forEach((f,x)=>Js[x].update(f,n.time)),ye.update(n),En.update(n.loads,n.trucks,n.cranes,n.time),Ao.update(n.agents??[],n.time),Ya.update(n);const o=ue.camera.position;op.update((m=n.operations)==null?void 0:m.weather,n.time,[o.x,o.y,o.z]);for(const f of Tr.values())ap(f);Bs==null||Bs.refreshPreview(),as.update(n.cranes[ne]);const a=!Ge&&!de&&!Nn;wr.update(n,{live:a,activeCrane:ne});const r=a?Gt.world.attachPreview(ne):null,l=a?Gt.world.releasePreview(ne):null,c=a&&nn?Gt.world.nfzProximity(ne):null,h=Math.abs(s.drive??0)>0||Math.abs(((g=(_=n.cranes[ne])==null?void 0:_.extra)==null?void 0:g.driveVel)??0)>.05,d=a&&l&&nn&&h?Gt.world.drivePathPreview(ne,s.steer):null,u=a&&nn?Gt.world.guidanceTarget(ne):null;sp.update(n,ne,{live:a,enabled:nn,preview:r,release:l,sweep:a&&l&&nn?Gt.world.sweepPreview(ne):null,readiness:a&&!l&&nn?Gt.world.liftReadiness():null,nfz:c,drivePath:d,time:n.time});const p=de&&xn?xn.events.filter(f=>f.start<=de.time&&de.time<f.start+f.duration).slice(0,3).map(f=>`${f.craneId} ${f.type}${f.loadId?"·"+f.loadId:""}`).join("  |  "):null;if(Ks.update(n,ne,ue.camera,{spec:Gt.scenario.cranes[ne],scenario:Gt.scenario,live:a,preview:r,release:l,nfz:c,guidance:u,planNote:p}),!de&&!kc){const f=Gt.completionScore();f&&(kc=!0,Ks.showScore(f))}ue.render(),Gb(n,s),bt.update(n,ne,{speed:Gt.timeScale,paused:Nn,recording:Fn.active,playing:!!Ge,canReplay:!!Hs}),de&&bt.setPlanPlayback(de.playing,de.time,xn.makespan),requestAnimationFrame(up)}function Gb(i,t){if(!ci)return;const e=Ee[Ae],n=i.cranes[ne],s=n.loadMass>0?(n.loadRatio*100).toFixed(0):"-",o=n.extra.limiterActive?`
⛔ 모멘트 리미터 작동: 권상·반경확대 차단 (반경을 줄이세요)`:"",a=i.loads.filter(E=>E.target),r=a.filter(E=>E.state==="placed").length;let l="임무     : (자유 연습 — 목표 없음)";if(a.length>0){const E=a.find(S=>S.state!=="placed");if(!E)l=`임무     : ✅ 완료! (${r}/${a.length} 안착)`;else{const S=n.hookPos,R=E.state==="hooked"?Math.hypot(E.pos[0]-E.target[0],E.pos[2]-E.target[1]):Math.hypot(S[0]-E.pos[0],S[2]-E.pos[2]),b=E.state==="hooked"?"목표까지":"부재까지";l=`임무     : ${r}/${a.length} 안착 | ${E.name} ${b} ${R.toFixed(1)}m`}}const c=i.loads.find(E=>E.hookedBy===ne&&(E.state==="rigging"||E.state==="derigging")),h=c?`
🔧 ${c.state==="rigging"?"줄걸이":"해체"} 작업 중: ${c.name} (남은 ${c.rigRemain.toFixed(0)}s — 크레인 동결)`:"",d=i.safety??{collisionCount:0,violationCount:0,collisionIds:[],zoneViolation:!1},u=(d.cranePairs??[]).some(E=>E.clash),p=(d.collisionIds.length>0?` ⚠충돌중(${d.collisionIds.join(",")})`:"")+(d.zoneViolation?" ⚠금지구역!":"")+(u?" ⚠크레인간섭!":""),m=(d.agentHolds??[]).includes(ne)?`
⛔ 지상 인원·장비 접근 — 작업 일시정지 (위험반경 통과 대기)`:"",_=(i.agents??[]).length>0?` · 홀드 ${d.agentHoldCount??0}회 ${(d.agentHoldTime??0).toFixed(0)}s`:"",g=i.cranes.length>1&&Number.isFinite(d.craneMinClearance)?` · 붐이격 ${d.craneMinClearance.toFixed(1)}m · 크레인충돌 ${d.craneClashCount??0}회`:"",f=n.extra.swayMag>.05?` | 흔들림 ${n.extra.swayMag.toFixed(2)}m`:"",x=i.wind?`
풍속     : ${i.wind.speed.toFixed(1)} m/s · 풍향 ${xl(i.wind.dir??0).toFixed(0)}°${i.wind.maxOperating?` (한계 ${i.wind.maxOperating})`:""}${i.wind.maxOperating&&i.wind.speed>i.wind.maxOperating?" ⛔ 작업중지":""}`:"",y=Fn.active?`
● REC 기록 중 (${Fn.frameCount}f) — R로 종료·저장`:Ge?`
▶ 리플레이 재생 중 (${Ge.i}/${Ge.frames.length}f)`:"",v=i.cranes.length>1?`크레인   : [${ne+1}/${i.cranes.length}] ${Gt.scenario.cranes[ne].name} (Tab 전환)`:`크레인   : ${Gt.scenario.cranes[0].name}`,w=n.type==="tower"?"트롤리   ":"작업반경 ";hh.textContent=[`Crane Sim — ${e.name} | FPS ${dp} | t=${i.time.toFixed(1)}s | 배속 ×${Gt.timeScale} | 카메라 ${as.label}`,`${e.desc}`,"",v,`입력     : slew=${t.slew} luff=${t.luff} hoist=${t.hoist} tag=${t.tag??0}${n.type!=="tower"?` drive=${t.drive??0} steer=${t.steer??0}`:""}`,n.type!=="tower"?`주행     : ${(n.extra.driveVel??0).toFixed(2)} m/s · 헤딩 ${xl(n.extra.driveYaw??0).toFixed(0)}° · 위치 (${n.basePos[0].toFixed(1)}, ${n.basePos[2].toFixed(1)})`:"위치     : 고정식 (마스트)",`선회각   : ${xl(n.slewAngle).toFixed(1)}°`,`${w}: ${n.radius.toFixed(2)} m`,`후크높이 : ${n.hookHeight.toFixed(2)} m${f}${x}`,`정격하중 : ${n.capacity.toFixed(1)} t`,`인양하중 : ${n.loadMass>0?n.loadMass.toFixed(1)+" t":"(없음)"}`,`하중률   : ${s}%${n.loadRatio>=.9&&n.loadMass>0?" ⚠":""}${o}${h}${m}`,"",l,`안전     : 충돌 ${d.collisionCount}회 · 금지구역 ${d.violationCount}회${g}${_}${p}`,`이벤트   : ${i.lastEvent??"-"}`,`${y}`,"","[주행] W/S 전·후진  A/D 좌·우회전    [팔] ←/→ 선회  ↑/↓ 기복  Q/E 권상·권하  Z/X 태그라인  Space 픽업","N 다음 시나리오  O 리셋  Tab 크레인 전환  1~4 배속  C 카메라  M 소리  H 보조UI  I 정보창  G 그리드  R 기록  P 리플레이","마우스: 회전 | 휠: 줌 | 우클릭: 이동"].join(`
`)}requestAnimationFrame(up);
