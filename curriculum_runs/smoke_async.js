const fs=require('fs'), vm=require('vm'), path=require('path');
const ids={};
function ctx(){return {clearRect(){},fillRect(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},arc(){},fill(){},ellipse(){},fillText(){},save(){},restore(){},setLineDash(){},strokeStyle:'',fillStyle:'',globalAlpha:1,lineWidth:1};}
function elem(id){if(!ids[id])ids[id]={id,value:'',textContent:'',innerHTML:'',disabled:false,width:1100,height:460,max:1,min:0,getContext:ctx,appendChild(){},click(){},remove(){},addEventListener(){},files:[]};return ids[id];}
['resultPath','levelSelect','splitSelect','policySelect','loadStatus','mComplete','mMakespan','mInterference','mEff','compareRows','replaySlider','speed','playBtn','replayInfo','replayCanvas','scheduleText','fileInput'].forEach(elem);
ids.resultPath.value='python_mappo/final_baseline/curriculum_mappo_result.json'; ids.splitSelect.value='unseen'; ids.policySelect.value='mappo'; ids.speed.value='1';
const context={console,Math,Date,setInterval,clearInterval,document:{getElementById:elem,createElement:()=>elem('created')},window:{addEventListener(){}},Blob:function(){},URL:{createObjectURL:()=>'',revokeObjectURL(){}}};
context.global=context; vm.createContext(context);
try{vm.runInContext(fs.readFileSync(path.join(__dirname,'crane_script.js'),'utf8'),context); console.log('LOAD_OK PyTorch dashboard script');}
catch(e){console.error('LOAD_ERR',e.stack); process.exit(1);}
const sample={levels:[{level:{name:'Lx_2C2L',num_cranes:2,num_lifts:2},config:{crane_radius:18},unseen:{mappo:{completeRate:100,makespan:40,soft:1,hardExecuted:0,hardMask:2,travel:3,setup:10,move:30},nearest:{completeRate:100,makespan:45,soft:0,hardExecuted:0,hardMask:1,travel:4,setup:10,move:40}},representative:{mappo:{done:2,total:2,makespan:40,reward:10,softInter:1,hardExecuted:0,hardMask:2,travelTotal:3,setupTotal:10,moveTotal:30,events:[{craneId:'C1',liftId:'L1',start:0,finish:20,travel:0,setup:0,duration:20,fromX:10,fromY:10,toX:10,toY:10,radiusCenterX:10,radiusCenterY:10,liftX:25,liftY:10,actualLiftRadius:15,craneRadius:18,softConflict:0,hardMask:0},{craneId:'C2',liftId:'L2',start:5,finish:40,travel:3,setup:10,duration:20,fromX:42,fromY:10,toX:42, toY:10,radiusCenterX:42,radiusCenterY:10,liftX:58,liftY:10,actualLiftRadius:16,craneRadius:18,softConflict:1,hardMask:2}],cranes:[{id:'C1',schedule:['L1 0~20']},{id:'C2',schedule:['L2 5~40']}]} }}]};
try{context.importPyTorchResult(sample); context.renderSelection(); context.setReplayTime(10); console.log('IMPORT_OK', ids.mMakespan.textContent, ids.compareRows.innerHTML.includes('PyTorch MAPPO'), ids.replayInfo.textContent.includes('진행 중'));}
catch(e){console.error('CALL_ERR',e.stack); process.exit(2);}
const script=fs.readFileSync(path.join(__dirname,'crane_script.js'),'utf8');
for (const forbidden of ['qTables','initMappoModel','startTraining','function evaluatePolicy','runCurriculumTrainingEvaluation']) {
  if (script.includes(forbidden)) { console.error('LEGACY_FOUND', forbidden); process.exit(3); }
}
console.log('LEGACY_REMOVED_OK');
