(function($){$.tools=$.tools||{version:'@VERSION'};$.tools.overlay={addEffect:function(name,loadFn,closeFn){effects[name]=[loadFn,closeFn]},conf:{close:null,closeOnClick:true,closeOnEsc:true,closeSpeed:'fast',effect:'default',fixed:!$.browser.msie||$.browser.version>6,left:'center',load:false,mask:null,oneInstance:true,speed:'normal',target:null,top:'10%'}};var instances=[],effects={};$.tools.overlay.addEffect('default',function(pos,onLoad){var conf=this.getConf(),w=$(window);if(!conf.fixed){pos.top+=w.scrollTop();pos.left+=w.scrollLeft()}pos.position=conf.fixed?'fixed':'absolute';this.getOverlay().css(pos).fadeIn(conf.speed,onLoad)},function(onClose){this.getOverlay().fadeOut(this.getConf().closeSpeed,onClose)});function Overlay(trigger,conf){var self=this,fire=trigger.add(self),w=$(window),closers,overlay,opened,maskConf=$.tools.expose&&(conf.mask||conf.expose),uid=Math.random().toString().slice(10);if(maskConf){if(typeof maskConf=='string'){maskConf={color:maskConf}}maskConf.closeOnClick=maskConf.closeOnEsc=false}var jq=conf.target||trigger.attr("rel");overlay=jq?$(jq):null||trigger;if(!overlay.length){throw"Could not find Overlay: "+jq;}if(trigger&&trigger.index(overlay)==-1){trigger.click(function(e){self.load(e);return e.preventDefault()})}$.extend(self,{load:function(e){if(self.isOpened()){return self}var eff=effects[conf.effect];if(!eff){throw"Overlay: cannot find effect : \""+conf.effect+"\"";}if(conf.oneInstance){$.each(instances,function(){this.close(e)})}e=e||$.Event();e.type="onBeforeLoad";fire.trigger(e);if(e.isDefaultPrevented()){return self}opened=true;if(maskConf){$(overlay).expose(maskConf)}var top=conf.top,left=conf.left,oWidth=overlay.outerWidth({margin:true}),oHeight=overlay.outerHeight({margin:true});if(typeof top=='string'){top=top=='center'?Math.max((w.height()-oHeight)/2,0):parseInt(top,10)/100*w.height()}if(left=='center'){left=Math.max((w.width()-oWidth)/2,0)}eff[0].call(self,{top:top,left:left},function(){if(opened){e.type="onLoad";fire.trigger(e)}});if(maskConf&&conf.closeOnClick){$.mask.getMask().one("click",self.close)}if(conf.closeOnClick){$(document).on("click."+uid,function(e){if(!$(e.target).parents(overlay).length){self.close(e)}})}if(conf.closeOnEsc){$(document).on("keydown."+uid,function(e){if(e.keyCode==27){self.close(e)}})}return self},close:function(e){if(!self.isOpened()){return self}e=e||$.Event();e.type="onBeforeClose";fire.trigger(e);if(e.isDefaultPrevented()){return}opened=false;effects[conf.effect][1].call(self,function(){e.type="onClose";fire.trigger(e)});$(document).off("click."+uid+" keydown."+uid);if(maskConf){$.mask.close()}return self},getOverlay:function(){return overlay},getTrigger:function(){return trigger},getClosers:function(){return closers},isOpened:function(){return opened},getConf:function(){return conf}});$.each("onBeforeLoad,onStart,onLoad,onBeforeClose,onClose".split(","),function(i,name){if($.isFunction(conf[name])){$(self).on(name,conf[name])}self[name]=function(fn){if(fn){$(self).on(name,fn)}return self}});closers=overlay.find(conf.close||".close");if(!closers.length&&!conf.close){closers=$('<a class="close"></a>');overlay.prepend(closers)}closers.click(function(e){self.close(e)});if(conf.load){self.load()}}$.fn.overlay=function(conf){var el=this.data("overlay");if(el){return el}if($.isFunction(conf)){conf={onBeforeLoad:conf}}conf=$.extend(true,{},$.tools.overlay.conf,conf);this.each(function(){el=new Overlay($(this),conf);instances.push(el);$(this).data("overlay",el)});return conf.api?el:this}})(jQuery);(function($){$.tools=$.tools||{version:'@VERSION'};var tool;tool=$.tools.expose={conf:{maskId:'exposeMask',loadSpeed:'slow',closeSpeed:'fast',closeOnClick:true,closeOnEsc:true,zIndex:9998,opacity:0.8,startOpacity:0,color:'#fff',onLoad:null,onClose:null}};function viewport(){if($.browser.msie){var d=$(document).height(),w=$(window).height();return[window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth,d-w<20?w:d]}return[$(document).width(),$(document).height()]}function call(fn){if(fn){return fn.call($.mask)}}var mask,exposed,loaded,config,overlayIndex;$.mask={load:function(conf,els){if(loaded){return this}if(typeof conf=='string'){conf={color:conf}}conf=conf||config;config=conf=$.extend($.extend({},tool.conf),conf);mask=$("#"+conf.maskId);if(!mask.length){mask=$('<div/>').attr("id",conf.maskId);$("body").append(mask)}var size=viewport();mask.css({position:'absolute',top:0,left:0,width:size[0],height:size[1],display:'none',opacity:conf.startOpacity,zIndex:conf.zIndex});if(conf.color){mask.css("backgroundColor",conf.color)}if(call(conf.onBeforeLoad)===false){return this}if(conf.closeOnEsc){$(document).on("keydown.mask",function(e){if(e.keyCode==27){$.mask.close(e)}})}if(conf.closeOnClick){mask.on("click.mask",function(e){$.mask.close(e)})}$(window).on("resize.mask",function(){$.mask.fit()});if(els&&els.length){overlayIndex=els.eq(0).css("zIndex");$.each(els,function(){var el=$(this);if(!/relative|absolute|fixed/i.test(el.css("position"))){el.css("position","relative")}});exposed=els.css({zIndex:Math.max(conf.zIndex+1,overlayIndex=='auto'?0:overlayIndex)})}mask.css({display:'block'}).fadeTo(conf.loadSpeed,conf.opacity,function(){$.mask.fit();call(conf.onLoad);loaded="full"});loaded=true;return this},close:function(){if(loaded){if(call(config.onBeforeClose)===false){return this}mask.fadeOut(config.closeSpeed,function(){call(config.onClose);if(exposed){exposed.css({zIndex:overlayIndex})}loaded=false});$(document).off("keydown.mask");mask.off("click.mask");$(window).off("resize.mask")}return this},fit:function(){if(loaded){var size=viewport();mask.css({width:size[0],height:size[1]})}},getMask:function(){return mask},isLoaded:function(fully){return fully?loaded=='full':loaded},getConf:function(){return config},getExposed:function(){return exposed}};$.fn.mask=function(conf){$.mask.load(conf);return this};$.fn.expose=function(conf){$.mask.load(conf,this);return this}})(jQuery);