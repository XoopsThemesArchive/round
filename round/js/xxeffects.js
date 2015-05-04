String.prototype.parseColor=function(){
var _1="#";
if(this.slice(0,4)=="rgb("){
var _2=this.slice(4,this.length-1).split(",");
var i=0;
do{
_1+=parseInt(_2[i]).toColorPart();
}while(++i<3);
}else{
if(this.slice(0,1)=="#"){
if(this.length==4){
for(var i=1;i<4;i++){
_1+=(this.charAt(i)+this.charAt(i)).toLowerCase();
}
}
if(this.length==7){
_1=this.toLowerCase();
}
}
}
return (_1.length==7?_1:(arguments[0]||this));
};
Element.collectTextNodes=function(_5){
return $A($(_5).childNodes).collect(function(_6){
return (_6.nodeType==3?_6.nodeValue:(_6.hasChildNodes()?Element.collectTextNodes(_6):""));
}).flatten().join("");
};
Element.collectTextNodesIgnoreClass=function(_7,_8){
return $A($(_7).childNodes).collect(function(_9){
return (_9.nodeType==3?_9.nodeValue:((_9.hasChildNodes()&&!Element.hasClassName(_9,_8))?Element.collectTextNodes(_9):""));
}).flatten().join("");
};
Element.setStyle=function(_a,_b){
_a=$(_a);
for(k in _b){
_a.style[k.camelize()]=_b[k];
}
};
Element.setContentZoom=function(_c,_d){
Element.setStyle(_c,{fontSize:(_d/100)+"em"});
if(navigator.appVersion.indexOf("AppleWebKit")>0){
window.scrollBy(0,0);
}
};
Element.getOpacity=function(_e){
var _f;
if(_f=Element.getStyle(_e,"opacity")){
return parseFloat(_f);
}
if(_f=(Element.getStyle(_e,"filter")||"").match(/alpha\(opacity=(.*)\)/)){
if(_f[1]){
return parseFloat(_f[1])/100;
}
}
return 1;
};
Element.setOpacity=function(_10,_11){
_10=$(_10);
if(_11==1){
Element.setStyle(_10,{opacity:(/Gecko/.test(navigator.userAgent)&&!/Konqueror|Safari|KHTML/.test(navigator.userAgent))?0.999999:null});
if(/MSIE/.test(navigator.userAgent)){
Element.setStyle(_10,{filter:Element.getStyle(_10,"filter").replace(/alpha\([^\)]*\)/gi,"")});
}
}else{
if(_11<0.00001){
_11=0;
}
Element.setStyle(_10,{opacity:_11});
if(/MSIE/.test(navigator.userAgent)){
Element.setStyle(_10,{filter:Element.getStyle(_10,"filter").replace(/alpha\([^\)]*\)/gi,"")+"alpha(opacity="+_11*100+")"});
}
}
};
Element.getInlineOpacity=function(_12){
return $(_12).style.opacity||"";
};
Element.childrenWithClassName=function(_13,_14){
return $A($(_13).getElementsByTagName("*")).select(function(c){
return Element.hasClassName(c,_14);
});
};
Array.prototype.call=function(){
var _16=arguments;
this.each(function(f){
f.apply(this,_16);
});
};
var Effect={tagifyText:function(_18){
var _19="position:relative";
if(/MSIE/.test(navigator.userAgent)){
_19+=";zoom:1";
}
_18=$(_18);
$A(_18.childNodes).each(function(_1a){
if(_1a.nodeType==3){
_1a.nodeValue.toArray().each(function(_1b){
_18.insertBefore(Builder.node("span",{style:_19},_1b==" "?String.fromCharCode(160):_1b),_1a);
});
Element.remove(_1a);
}
});
},multiple:function(_1c,_1d){
var _1e;
if(((typeof _1c=="object")||(typeof _1c=="function"))&&(_1c.length)){
_1e=_1c;
}else{
_1e=$(_1c).childNodes;
}
var _1f=Object.extend({speed:0.1,delay:0},arguments[2]||{});
var _20=_1f.delay;
$A(_1e).each(function(_21,_22){
new _1d(_21,Object.extend(_1f,{delay:_22*_1f.speed+_20}));
});
},PAIRS:{"slide":["SlideDown","SlideUp"],"blind":["BlindDown","BlindUp"],"appear":["Appear","Fade"]},toggle:function(_23,_24){
_23=$(_23);
_24=(_24||"appear").toLowerCase();
var _25=Object.extend({queue:{position:"end",scope:(_23.id||"global")}},arguments[2]||{});
Effect[Element.visible(_23)?Effect.PAIRS[_24][1]:Effect.PAIRS[_24][0]](_23,_25);
}};
var Effect2=Effect;
Effect.Transitions={};
Effect.Transitions.linear=function(pos){
return pos;
};
Effect.Transitions.sinoidal=function(pos){
return (-Math.cos(pos*Math.PI)/2)+0.5;
};
Effect.Transitions.reverse=function(pos){
return 1-pos;
};
Effect.Transitions.flicker=function(pos){
return ((-Math.cos(pos*Math.PI)/4)+0.75)+Math.random()/4;
};
Effect.Transitions.wobble=function(pos){
return (-Math.cos(pos*Math.PI*(9*pos))/2)+0.5;
};
Effect.Transitions.pulse=function(pos){
return (Math.floor(pos*10)%2==0?(pos*10-Math.floor(pos*10)):1-(pos*10-Math.floor(pos*10)));
};
Effect.Transitions.none=function(pos){
return 0;
};
Effect.Transitions.full=function(pos){
return 1;
};
Effect.ScopedQueue=Class.create();
Object.extend(Object.extend(Effect.ScopedQueue.prototype,Enumerable),{initialize:function(){
this.effects=[];
this.interval=null;
},_each:function(_2e){
this.effects._each(_2e);
},add:function(_2f){
var _30=new Date().getTime();
var _31=(typeof _2f.options.queue=="string")?_2f.options.queue:_2f.options.queue.position;
switch(_31){
case "front":
this.effects.findAll(function(e){
return e.state=="idle";
}).each(function(e){
e.startOn+=_2f.finishOn;
e.finishOn+=_2f.finishOn;
});
break;
case "end":
_30=this.effects.pluck("finishOn").max()||_30;
break;
}
_2f.startOn+=_30;
_2f.finishOn+=_30;
this.effects.push(_2f);
if(!this.interval){
this.interval=setInterval(this.loop.bind(this),40);
}
},remove:function(_34){
this.effects=this.effects.reject(function(e){
return e==_34;
});
if(this.effects.length==0){
clearInterval(this.interval);
this.interval=null;
}
},loop:function(){
var _36=new Date().getTime();
this.effects.invoke("loop",_36);
}});
Effect.Queues={instances:$H(),get:function(_37){
if(typeof _37!="string"){
return _37;
}
if(!this.instances[_37]){
this.instances[_37]=new Effect.ScopedQueue();
}
return this.instances[_37];
}};
Effect.Queue=Effect.Queues.get("global");
Effect.DefaultOptions={transition:Effect.Transitions.sinoidal,duration:1,fps:25,sync:false,from:0,to:1,delay:0,queue:"parallel"};
Effect.Base=function(){
};
Effect.Base.prototype={position:null,start:function(_38){
this.options=Object.extend(Object.extend({},Effect.DefaultOptions),_38||{});
this.currentFrame=0;
this.state="idle";
this.startOn=this.options.delay*1000;
this.finishOn=this.startOn+(this.options.duration*1000);
this.event("beforeStart");
if(!this.options.sync){
Effect.Queues.get(typeof this.options.queue=="string"?"global":this.options.queue.scope).add(this);
}
},loop:function(_39){
if(_39>=this.startOn){
if(_39>=this.finishOn){
this.render(1);
this.cancel();
this.event("beforeFinish");
if(this.finish){
this.finish();
}
this.event("afterFinish");
return;
}
var pos=(_39-this.startOn)/(this.finishOn-this.startOn);
var _3b=Math.round(pos*this.options.fps*this.options.duration);
if(_3b>this.currentFrame){
this.render(pos);
this.currentFrame=_3b;
}
}
},render:function(pos){
if(this.state=="idle"){
this.state="running";
this.event("beforeSetup");
if(this.setup){
this.setup();
}
this.event("afterSetup");
}
if(this.state=="running"){
if(this.options.transition){
pos=this.options.transition(pos);
}
pos*=(this.options.to-this.options.from);
pos+=this.options.from;
this.position=pos;
this.event("beforeUpdate");
if(this.update){
this.update(pos);
}
this.event("afterUpdate");
}
},cancel:function(){
if(!this.options.sync){
Effect.Queues.get(typeof this.options.queue=="string"?"global":this.options.queue.scope).remove(this);
}
this.state="finished";
},event:function(_3d){
if(this.options[_3d+"Internal"]){
this.options[_3d+"Internal"](this);
}
if(this.options[_3d]){
this.options[_3d](this);
}
},inspect:function(){
return "#<Effect:"+$H(this).inspect()+",options:"+$H(this.options).inspect()+">";
}};
Effect.Parallel=Class.create();
Object.extend(Object.extend(Effect.Parallel.prototype,Effect.Base.prototype),{initialize:function(_3e){
this.effects=_3e||[];
this.start(arguments[1]);
},update:function(_3f){
this.effects.invoke("render",_3f);
},finish:function(_40){
this.effects.each(function(_41){
_41.render(1);
_41.cancel();
_41.event("beforeFinish");
if(_41.finish){
_41.finish(_40);
}
_41.event("afterFinish");
});
}});
Effect.Opacity=Class.create();
Object.extend(Object.extend(Effect.Opacity.prototype,Effect.Base.prototype),{initialize:function(_42){
this.element=$(_42);
if(/MSIE/.test(navigator.userAgent)&&(!this.element.hasLayout)){
Element.setStyle(this.element,{zoom:1});
}
var _43=Object.extend({from:Element.getOpacity(this.element)||0,to:1},arguments[1]||{});
this.start(_43);
},update:function(_44){
Element.setOpacity(this.element,_44);
}});
Effect.Move=Class.create();
Object.extend(Object.extend(Effect.Move.prototype,Effect.Base.prototype),{initialize:function(_45){
this.element=$(_45);
var _46=Object.extend({x:0,y:0,mode:"relative"},arguments[1]||{});
this.start(_46);
},setup:function(){
Element.makePositioned(this.element);
this.originalLeft=parseFloat(Element.getStyle(this.element,"left")||"0");
this.originalTop=parseFloat(Element.getStyle(this.element,"top")||"0");
if(this.options.mode=="absolute"){
this.options.x=this.options.x-this.originalLeft;
this.options.y=this.options.y-this.originalTop;
}
},update:function(_47){
Element.setStyle(this.element,{left:this.options.x*_47+this.originalLeft+"px",top:this.options.y*_47+this.originalTop+"px"});
}});
Effect.MoveBy=function(_48,_49,_4a){
return new Effect.Move(_48,Object.extend({x:_4a,y:_49},arguments[3]||{}));
};
Effect.Scale=Class.create();
Object.extend(Object.extend(Effect.Scale.prototype,Effect.Base.prototype),{initialize:function(_4b,_4c){
this.element=$(_4b);
var _4d=Object.extend({scaleX:true,scaleY:true,scaleContent:true,scaleFromCenter:false,scaleMode:"box",scaleFrom:100,scaleTo:_4c},arguments[2]||{});
this.start(_4d);
},setup:function(){
this.restoreAfterFinish=this.options.restoreAfterFinish||false;
this.elementPositioning=Element.getStyle(this.element,"position");
this.originalStyle={};
["top","left","width","height","fontSize"].each(function(k){
this.originalStyle[k]=this.element.style[k];
}.bind(this));
this.originalTop=this.element.offsetTop;
this.originalLeft=this.element.offsetLeft;
var _4f=Element.getStyle(this.element,"font-size")||"100%";
["em","px","%"].each(function(_50){
if(_4f.indexOf(_50)>0){
this.fontSize=parseFloat(_4f);
this.fontSizeType=_50;
}
}.bind(this));
this.factor=(this.options.scaleTo-this.options.scaleFrom)/100;
this.dims=null;
if(this.options.scaleMode=="box"){
this.dims=[this.element.offsetHeight,this.element.offsetWidth];
}
if(/^content/.test(this.options.scaleMode)){
this.dims=[this.element.scrollHeight,this.element.scrollWidth];
}
if(!this.dims){
this.dims=[this.options.scaleMode.originalHeight,this.options.scaleMode.originalWidth];
}
},update:function(_51){
var _52=(this.options.scaleFrom/100)+(this.factor*_51);
if(this.options.scaleContent&&this.fontSize){
Element.setStyle(this.element,{fontSize:this.fontSize*_52+this.fontSizeType});
}
this.setDimensions(this.dims[0]*_52,this.dims[1]*_52);
},finish:function(_53){
if(this.restoreAfterFinish){
Element.setStyle(this.element,this.originalStyle);
}
},setDimensions:function(_54,_55){
var d={};
if(this.options.scaleX){
d.width=_55+"px";
}
if(this.options.scaleY){
d.height=_54+"px";
}
if(this.options.scaleFromCenter){
var _57=(_54-this.dims[0])/2;
var _58=(_55-this.dims[1])/2;
if(this.elementPositioning=="absolute"){
if(this.options.scaleY){
d.top=this.originalTop-_57+"px";
}
if(this.options.scaleX){
d.left=this.originalLeft-_58+"px";
}
}else{
if(this.options.scaleY){
d.top=-_57+"px";
}
if(this.options.scaleX){
d.left=-_58+"px";
}
}
}
Element.setStyle(this.element,d);
}});
Effect.Highlight=Class.create();
Object.extend(Object.extend(Effect.Highlight.prototype,Effect.Base.prototype),{initialize:function(_59){
this.element=$(_59);
var _5a=Object.extend({startcolor:"#ffff99"},arguments[1]||{});
this.start(_5a);
},setup:function(){
if(Element.getStyle(this.element,"display")=="none"){
this.cancel();
return;
}
this.oldStyle={backgroundImage:Element.getStyle(this.element,"background-image")};
Element.setStyle(this.element,{backgroundImage:"none"});
if(!this.options.endcolor){
this.options.endcolor=Element.getStyle(this.element,"background-color").parseColor("#ffffff");
}
if(!this.options.restorecolor){
this.options.restorecolor=Element.getStyle(this.element,"background-color");
}
this._base=$R(0,2).map(function(i){
return parseInt(this.options.startcolor.slice(i*2+1,i*2+3),16);
}.bind(this));
this._delta=$R(0,2).map(function(i){
return parseInt(this.options.endcolor.slice(i*2+1,i*2+3),16)-this._base[i];
}.bind(this));
},update:function(_5d){
Element.setStyle(this.element,{backgroundColor:$R(0,2).inject("#",function(m,v,i){
return m+(Math.round(this._base[i]+(this._delta[i]*_5d)).toColorPart());
}.bind(this))});
},finish:function(){
Element.setStyle(this.element,Object.extend(this.oldStyle,{backgroundColor:this.options.restorecolor}));
}});
Effect.ScrollTo=Class.create();
Object.extend(Object.extend(Effect.ScrollTo.prototype,Effect.Base.prototype),{initialize:function(_61){
this.element=$(_61);
this.start(arguments[1]||{});
},setup:function(){
Position.prepare();
var _62=Position.cumulativeOffset(this.element);
if(this.options.offset){
_62[1]+=this.options.offset;
}
var max=window.innerHeight?window.height-window.innerHeight:document.body.scrollHeight-(document.documentElement.clientHeight?document.documentElement.clientHeight:document.body.clientHeight);
this.scrollStart=Position.deltaY;
this.delta=(_62[1]>max?max:_62[1])-this.scrollStart;
},update:function(_64){
Position.prepare();
window.scrollTo(Position.deltaX,this.scrollStart+(_64*this.delta));
}});
Effect.Fade=function(_65){
var _66=Element.getInlineOpacity(_65);
var _67=Object.extend({from:Element.getOpacity(_65)||1,to:0,afterFinishInternal:function(_68){
with(Element){
if(_68.options.to!=0){
return;
}
hide(_68.element);
setStyle(_68.element,{opacity:_66});
}
}},arguments[1]||{});
return new Effect.Opacity(_65,_67);
};
Effect.Appear=function(_69){
var _6a=Object.extend({from:(Element.getStyle(_69,"display")=="none"?0:Element.getOpacity(_69)||0),to:1,beforeSetup:function(_6b){
with(Element){
setOpacity(_6b.element,_6b.options.from);
show(_6b.element);
}
}},arguments[1]||{});
return new Effect.Opacity(_69,_6a);
};
Effect.Puff=function(_6c){
_6c=$(_6c);
var _6d={opacity:Element.getInlineOpacity(_6c),position:Element.getStyle(_6c,"position")};
return new Effect.Parallel([new Effect.Scale(_6c,200,{sync:true,scaleFromCenter:true,scaleContent:true,restoreAfterFinish:true}),new Effect.Opacity(_6c,{sync:true,to:0})],Object.extend({duration:1,beforeSetupInternal:function(_6e){
with(Element){
setStyle(_6e.effects[0].element,{position:"absolute"});
}
},afterFinishInternal:function(_6f){
with(Element){
hide(_6f.effects[0].element);
setStyle(_6f.effects[0].element,_6d);
}
}},arguments[1]||{}));
};
Effect.BlindUp=function(_70){
_70=$(_70);
Element.makeClipping(_70);
return new Effect.Scale(_70,0,Object.extend({scaleContent:false,scaleX:false,restoreAfterFinish:true,afterFinishInternal:function(_71){
with(Element){
[hide,undoClipping].call(_71.element);
}
}},arguments[1]||{}));
};
Effect.BlindDown=function(_72){
_72=$(_72);
var _73=Element.getStyle(_72,"height");
var _74=Element.getDimensions(_72);
return new Effect.Scale(_72,100,Object.extend({scaleContent:false,scaleX:false,scaleFrom:0,scaleMode:{originalHeight:_74.height,originalWidth:_74.width},restoreAfterFinish:true,afterSetup:function(_75){
with(Element){
makeClipping(_75.element);
setStyle(_75.element,{height:"0px"});
show(_75.element);
}
},afterFinishInternal:function(_76){
with(Element){
undoClipping(_76.element);
setStyle(_76.element,{height:_73});
}
}},arguments[1]||{}));
};
Effect.SwitchOff=function(_77){
_77=$(_77);
var _78=Element.getInlineOpacity(_77);
return new Effect.Appear(_77,{duration:0.4,from:0,transition:Effect.Transitions.flicker,afterFinishInternal:function(_79){
new Effect.Scale(_79.element,1,{duration:0.3,scaleFromCenter:true,scaleX:false,scaleContent:false,restoreAfterFinish:true,beforeSetup:function(_7a){
with(Element){
[makePositioned,makeClipping].call(_7a.element);
}
},afterFinishInternal:function(_7b){
with(Element){
[hide,undoClipping,undoPositioned].call(_7b.element);
setStyle(_7b.element,{opacity:_78});
}
}});
}});
};
Effect.DropOut=function(_7c){
_7c=$(_7c);
var _7d={top:Element.getStyle(_7c,"top"),left:Element.getStyle(_7c,"left"),opacity:Element.getInlineOpacity(_7c)};
return new Effect.Parallel([new Effect.Move(_7c,{x:0,y:100,sync:true}),new Effect.Opacity(_7c,{sync:true,to:0})],Object.extend({duration:0.5,beforeSetup:function(_7e){
with(Element){
makePositioned(_7e.effects[0].element);
}
},afterFinishInternal:function(_7f){
with(Element){
[hide,undoPositioned].call(_7f.effects[0].element);
setStyle(_7f.effects[0].element,_7d);
}
}},arguments[1]||{}));
};
Effect.Shake=function(_80){
_80=$(_80);
var _81={top:Element.getStyle(_80,"top"),left:Element.getStyle(_80,"left")};
return new Effect.Move(_80,{x:20,y:0,duration:0.05,afterFinishInternal:function(_82){
new Effect.Move(_82.element,{x:-40,y:0,duration:0.1,afterFinishInternal:function(_83){
new Effect.Move(_83.element,{x:40,y:0,duration:0.1,afterFinishInternal:function(_84){
new Effect.Move(_84.element,{x:-40,y:0,duration:0.1,afterFinishInternal:function(_85){
new Effect.Move(_85.element,{x:40,y:0,duration:0.1,afterFinishInternal:function(_86){
new Effect.Move(_86.element,{x:-20,y:0,duration:0.05,afterFinishInternal:function(_87){
with(Element){
undoPositioned(_87.element);
setStyle(_87.element,_81);
}
}});
}});
}});
}});
}});
}});
};
Effect.SlideDown=function(_88){
_88=$(_88);
Element.cleanWhitespace(_88);
var _89=Element.getStyle(_88.firstChild,"bottom");
var _8a=Element.getDimensions(_88);
return new Effect.Scale(_88,100,Object.extend({scaleContent:false,scaleX:false,scaleFrom:0,scaleMode:{originalHeight:_8a.height,originalWidth:_8a.width},restoreAfterFinish:true,afterSetup:function(_8b){
with(Element){
makePositioned(_8b.element);
makePositioned(_8b.element.firstChild);
if(window.opera){
setStyle(_8b.element,{top:""});
}
makeClipping(_8b.element);
setStyle(_8b.element,{height:"0px"});
show(_88);
}
},afterUpdateInternal:function(_8c){
with(Element){
setStyle(_8c.element.firstChild,{bottom:(_8c.dims[0]-_8c.element.clientHeight)+"px"});
}
},afterFinishInternal:function(_8d){
with(Element){
undoClipping(_8d.element);
undoPositioned(_8d.element.firstChild);
undoPositioned(_8d.element);
setStyle(_8d.element.firstChild,{bottom:_89});
}
}},arguments[1]||{}));
};
Effect.SlideUp=function(_8e){
_8e=$(_8e);
Element.cleanWhitespace(_8e);
var _8f=Element.getStyle(_8e.firstChild,"bottom");
return new Effect.Scale(_8e,0,Object.extend({scaleContent:false,scaleX:false,scaleMode:"box",scaleFrom:100,restoreAfterFinish:true,beforeStartInternal:function(_90){
with(Element){
makePositioned(_90.element);
makePositioned(_90.element.firstChild);
if(window.opera){
setStyle(_90.element,{top:""});
}
makeClipping(_90.element);
show(_8e);
}
},afterUpdateInternal:function(_91){
with(Element){
setStyle(_91.element.firstChild,{bottom:(_91.dims[0]-_91.element.clientHeight)+"px"});
}
},afterFinishInternal:function(_92){
with(Element){
[hide,undoClipping].call(_92.element);
undoPositioned(_92.element.firstChild);
undoPositioned(_92.element);
setStyle(_92.element.firstChild,{bottom:_8f});
}
}},arguments[1]||{}));
};
Effect.Squish=function(_93){
return new Effect.Scale(_93,window.opera?1:0,{restoreAfterFinish:true,beforeSetup:function(_94){
with(Element){
makeClipping(_94.element);
}
},afterFinishInternal:function(_95){
with(Element){
hide(_95.element);
undoClipping(_95.element);
}
}});
};
Effect.Grow=function(_96){
_96=$(_96);
var _97=Object.extend({direction:"center",moveTransistion:Effect.Transitions.sinoidal,scaleTransition:Effect.Transitions.sinoidal,opacityTransition:Effect.Transitions.full},arguments[1]||{});
var _98={top:_96.style.top,left:_96.style.left,height:_96.style.height,width:_96.style.width,opacity:Element.getInlineOpacity(_96)};
var _99=Element.getDimensions(_96);
var _9a,initialMoveY;
var _9b,moveY;
switch(_97.direction){
case "top-left":
_9a=initialMoveY=_9b=moveY=0;
break;
case "top-right":
_9a=_99.width;
initialMoveY=moveY=0;
_9b=-_99.width;
break;
case "bottom-left":
_9a=_9b=0;
initialMoveY=_99.height;
moveY=-_99.height;
break;
case "bottom-right":
_9a=_99.width;
initialMoveY=_99.height;
_9b=-_99.width;
moveY=-_99.height;
break;
case "center":
_9a=_99.width/2;
initialMoveY=_99.height/2;
_9b=-_99.width/2;
moveY=-_99.height/2;
break;
}
return new Effect.Move(_96,{x:_9a,y:initialMoveY,duration:0.01,beforeSetup:function(_9c){
with(Element){
hide(_9c.element);
makeClipping(_9c.element);
makePositioned(_9c.element);
}
},afterFinishInternal:function(_9d){
new Effect.Parallel([new Effect.Opacity(_9d.element,{sync:true,to:1,from:0,transition:_97.opacityTransition}),new Effect.Move(_9d.element,{x:_9b,y:moveY,sync:true,transition:_97.moveTransition}),new Effect.Scale(_9d.element,100,{scaleMode:{originalHeight:_99.height,originalWidth:_99.width},sync:true,scaleFrom:window.opera?1:0,transition:_97.scaleTransition,restoreAfterFinish:true})],Object.extend({beforeSetup:function(_9e){
with(Element){
setStyle(_9e.effects[0].element,{height:"0px"});
show(_9e.effects[0].element);
}
},afterFinishInternal:function(_9f){
with(Element){
[undoClipping,undoPositioned].call(_9f.effects[0].element);
setStyle(_9f.effects[0].element,_98);
}
}},_97));
}});
};
Effect.Shrink=function(_a0){
_a0=$(_a0);
var _a1=Object.extend({direction:"center",moveTransistion:Effect.Transitions.sinoidal,scaleTransition:Effect.Transitions.sinoidal,opacityTransition:Effect.Transitions.none},arguments[1]||{});
var _a2={top:_a0.style.top,left:_a0.style.left,height:_a0.style.height,width:_a0.style.width,opacity:Element.getInlineOpacity(_a0)};
var _a3=Element.getDimensions(_a0);
var _a4,moveY;
switch(_a1.direction){
case "top-left":
_a4=moveY=0;
break;
case "top-right":
_a4=_a3.width;
moveY=0;
break;
case "bottom-left":
_a4=0;
moveY=_a3.height;
break;
case "bottom-right":
_a4=_a3.width;
moveY=_a3.height;
break;
case "center":
_a4=_a3.width/2;
moveY=_a3.height/2;
break;
}
return new Effect.Parallel([new Effect.Opacity(_a0,{sync:true,to:0,from:1,transition:_a1.opacityTransition}),new Effect.Scale(_a0,window.opera?1:0,{sync:true,transition:_a1.scaleTransition,restoreAfterFinish:true}),new Effect.Move(_a0,{x:_a4,y:moveY,sync:true,transition:_a1.moveTransition})],Object.extend({beforeStartInternal:function(_a5){
with(Element){
[makePositioned,makeClipping].call(_a5.effects[0].element);
}
},afterFinishInternal:function(_a6){
with(Element){
[hide,undoClipping,undoPositioned].call(_a6.effects[0].element);
setStyle(_a6.effects[0].element,_a2);
}
}},_a1));
};
Effect.Pulsate=function(_a7){
_a7=$(_a7);
var _a8=arguments[1]||{};
var _a9=Element.getInlineOpacity(_a7);
var _aa=_a8.transition||Effect.Transitions.sinoidal;
var _ab=function(pos){
return _aa(1-Effect.Transitions.pulse(pos));
};
_ab.bind(_aa);
return new Effect.Opacity(_a7,Object.extend(Object.extend({duration:3,from:0,afterFinishInternal:function(_ad){
Element.setStyle(_ad.element,{opacity:_a9});
}},_a8),{transition:_ab}));
};
Effect.Fold=function(_ae){
_ae=$(_ae);
var _af={top:_ae.style.top,left:_ae.style.left,width:_ae.style.width,height:_ae.style.height};
Element.makeClipping(_ae);
return new Effect.Scale(_ae,5,Object.extend({scaleContent:false,scaleX:false,afterFinishInternal:function(_b0){
new Effect.Scale(_ae,1,{scaleContent:false,scaleY:false,afterFinishInternal:function(_b1){
with(Element){
[hide,undoClipping].call(_b1.element);
setStyle(_b1.element,_af);
}
}});
}},arguments[1]||{}));
};

