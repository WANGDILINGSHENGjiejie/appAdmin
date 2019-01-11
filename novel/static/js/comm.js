$(function(){
	toastr.options.positionClass = 'toast-top-center';
	$('[data-toggle="tooltip"]').tooltip();
	
});
/*全选*/
function CheckAll(form)
  {
  	console.log(form);
  for (var i=0;i<form.elements.length;i++)
    {
    var e = form.elements[i];
    if (e.name != 'chkall')
       e.checked = form.chkall.checked;
    }
}
/*获取全选ID值*/
function getCheckAllData(){
	var ids='';
	$("#formlist [name='ids']:checked").each(function(){ 
	ids+=ids!=''?',':'';
	ids+=$(this).val();
	});
	return ids;
}
var noticemsg=new function(){///公告
	var _notice_key='notice_msg';
	var _authread_index=-1;
	this.showmsgnumEx=function(num){
		if(num>0){
			_show(num);
			$("#noticemenu").css('color','#E85656');
		}
	}
	this.showmsgnum=function(num){
        var val=Cookies.get(_notice_key);
        if(val){
        	val=num-parseInt(val);
        	if(val>0){
        		_show(val);
        	}
        }else{
        	_show(num);
        }
	}
	this.setmsgnum=function(){
		Cookies.set(_notice_key, _Notice, { expires: 10 * 365 * 24 * 60 * 60 });
	}
	function _show(num){
		num=num>=9?'9+':num;
		$(".notice_msgnum").text(num);
	}
    this.autoreaddlg=function(){
        var is_adm = $.cookie('is_adm');

        if(  typeof(is_adm) == "undefined" || is_adm <= 0 ) {

            _autoreaddlg();

        }

    }
	function _autoreaddlg(){

		var length= typeof _unReadTop != 'undefined' ? _unReadTop.length : 0;
		if(length<=0 && _authread_index>=length){
			return;
		}

		var info=_unReadTop[++_authread_index];
        // var info=data.data;

		var dialog=Ewin.dialog({
			'title':info.title,
			'message':info.body,
			'btnok':'我知道了',
			'isbtncl':false
		});
		//info.id
		
		var pdata = { action:'notice_rd', id:info.id };

		var api_url = "/notice/notice_read";

		sendData(api_url, pdata, function(data){});
		
		dialog.on(function(status){
			_autoreaddlg();
		});
    }
}

var api=new function(){
	this.showtip=function(msg){////警告提示信息
		$("#tipdlg").html('<div class="alert alert-warning alert-dismissible" role="alert" ><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><i class="fa fa-exclamation-triangle" aria-hidden="true"></i>'+msg+'</div>');
	}
	this.submitStatus=function(status,elname,txt){////提交btn状态更新
	    if(status){
	    	txt=!txt?'':txt;
	        $(elname).attr({"disabled":'disabled'}).html('<i class="fa fa-spinner fa-spin"></i>'+txt);
	    }else{
	        $(elname).removeAttr('disabled').html(txt);
	    }
	}
	this.GetRandomNum=function (Min,Max){   
		var Range = Max - Min;   
		var Rand = Math.random();   
		return(Min + Math.round(Rand * Range));   
	}
	
	this.TextToHtml=function (text) {
	  if (!text) {
	    return text;
	  }
	  text = text.replace(/((http|https):\/\/[^\s]+)/g, function (url) {
	    return '<a href="' + url + '" target="_blank">' + url + '</a>';
	  });
	  text = text.replace(/\n/g, '<br/>');
	  return text;
	}
	this.CopyText_modal=function(){
		new Clipboard('.btn-copy-url', {
        	text: function() {return $(".text-copy-url").text();}
	    }).on('success', function(e) {
	        e.clearSelection();
		    toastr.success('推广链接复制成功');
	    });
	}
	this.CopyText_footbar=function(){
		new Clipboard('.foot-btn-copy-url', {
        	text: function() {return $(".foot-text-copy-url").text();}
	    }).on('success', function(e) {
	        e.clearSelection();
		    toastr.success('推广链接复制成功');
	    });
	}
}
function sendData(url,data,callback){
	$.ajax({
        type: "POST",
        url: url,
        data: data,
        dataType: "json",
        success: function (data) {          
            try {
            	callback(data);
            } catch(e) {
				console.log(e);
			}
            return false;
        },
        error : function (XMLHttpRequest, textStatus, errorThrown){
            callback('error');
        }
    });	
}
function getDispatchFollow(obj,aid,Ver){
    var value=$(obj).val();
    if(value==''){
        $(obj).next().text('');
        return;
    }
    if( Ver > 0 ){
		var data={
	        action:'getfollowtext',
	        aid:aid,
	        num:value,
	        ver_code:Ver,
	    }
    } else {
		var data={
	        action:'getfollowtext',
	        aid:aid,
	        num:value,
	    }
    }
    sendData(api_url,data,function(data){
            $(obj).next().text(data.data.text);
    });
}
function submitActivityDispatch(type,ltype,channelId,url){

    if (channelId > 0) {
        var url = url + '?type=' + type + '&ltype=' + ltype + '&channelId=' + channelId ;
    } else {
        var url = url + '?type=' + type + '&ltype=' + ltype ;
    }

    var dialog=Ewin.dialog({
        btnok:type>0?'保存修改':'保存创建',
        title:ltype>0?"修改属性":"创建活动链接",
        message:'<div style="text-align:center"><i class="fa fa-spinner fa-spin" style="font-size: 46px;margin:0 auto;"></i></div>',
        url:url,
    });

    $("#"+dialog.id).off().on( 'hidden');

    $("#"+dialog.id).off().on('hidden.bs.modal');

    dialog.on(function(result){

        if(result){
            try{
                if(__cfg && ltype==0){
                    $("#title_id").val(__cfg.title);
                    $("#cover_id").val(__cfg.cover);
                    $("#body_id").val(__cfg.body);
                    $("#footer_id").val(__cfg.footer);
                }
            }catch(e){
                console.log(e);
            }

            var data=$("#dispatch-form").serialize();


            if( channelId > 0  ){
                data+='&data[channelId]='+channelId;
            }

            var link = "/channel/save_creation_activity";

            sendData(link,data,function(data){

                $("#"+dialog.id).remove();

                $(".modal-backdrop").remove();

                $("body").removeClass('modal-open').removeAttr('style');

                var qrcode = data.data.url+data.data.linkType.code ;

                var qrimg = data.data.url+data.data.linkType.img ;

                if( data.verCode > 0 ){
                    showResultDlg(data.data.link , data.data.ltype ,  data.data.cid ,  qrimg , qrcode , data.data.qrlink , data.data.verCode );
                } else {
                    showResultDlg(data.data.link , data.data.ltype ,  data.data.cid ,  qrimg , qrcode , data.data.qrlink  );
                }

            });

        }else{

            $("#"+dialog.id).remove();
            $(".modal-backdrop").remove();
            $("body").removeClass('modal-open').removeAttr('style');

        }

        return true;
    });
}
function submitDispatch(type,ltype,bid,num,Ver,url,channelId,writing){
	if( bid > 0 ){
        if (Ver > 0) {
            var url = url + '?type=' + type + '&ltype=' + ltype + '&bid=' + bid + '&num=' + num + "&ver_code=" + Ver;
        } else {
            var url = url + '?type=' + type + '&ltype=' + ltype + '&bid=' + bid + '&num=' + num;
        }
    }else{
        if (Ver > 0) {
            var url = url + '?linktype=home&type=' + type + '&ltype=' + ltype + '&bid=' + bid + '&num=' + num + "&ver_code=" + Ver;
        } else {
            var url = url + '?linktype=home&type=' + type + '&ltype=' + ltype + '&bid=' + bid + '&num=' + num;
        }
	}
	if( channelId > 0  ){
		url += '&channelId='+channelId;
	}

	if( writing > 0  ){
		url += '&writing='+writing;
	}

    var dialog=Ewin.dialog({
        btnok:type>0?'保存修改':'保存创建',
        title:ltype>0?"修改属性":"创建推广链接",
        message:'<div style="text-align:center"><i class="fa fa-spinner fa-spin" style="font-size: 46px;margin:0 auto;"></i></div>',
        url:url,
    });

    $("#"+dialog.id).off().on( 'hidden');

    $("#"+dialog.id).off().on('hidden.bs.modal');

    dialog.on(function(result){

        if(result){
            try{
                if(__cfg && ltype==0){
                    $("#title_id").val(__cfg.title);
                    $("#cover_id").val(__cfg.cover);
                    $("#body_id").val(__cfg.body);
                    $("#footer_id").val(__cfg.footer);
                }
            }catch(e){
                console.log(e);
            }

            var data=$("#dispatch-form").serialize();

            if( channelId > 0  ){
            	data += '&data[channelId]='+channelId;
			}

			if( Ver > 0 ){
                data += '&data[ver]='+Ver;
            }

            if( bid >  0 ){
                var link =  '/channel/save_creation';
            } else {
            	var link =  '/channel/save_home_link';
			}

            sendData(link,data,function(data){

                $("#"+dialog.id).remove();

                $(".modal-backdrop").remove();

                $("body").removeClass('modal-open').removeAttr('style');

                var qrcode = data.data.url+data.data.linkType.code ;

                var qrimg = data.data.url+data.data.linkType.img ;

                if( data.data.verCode > 0 ){
                    showResultDlg(data.data.link , data.data.ltype ,  data.data.cid ,  qrimg , qrcode , data.data.qrlink , data.data.verCode );
                } else {
                    showResultDlg(data.data.link , data.data.ltype ,  data.data.cid ,  qrimg , qrcode , data.data.qrlink  );
                }

            });

        }else{

            $("#"+dialog.id).remove();
            $(".modal-backdrop").remove();
            $("body").removeClass('modal-open').removeAttr('style');

        }

        return true;
    });
}
function submitInDispatch(type,ltype,bid,num,Ver,url,eid,writing){

    if (Ver > 0) {
        var url = url + '?type=' + type + '&ltype=' + ltype + '&bid=' + bid + '&num=' + num + "&ver_code=" + Ver;
    } else {
        var url = url + '?type=' + type + '&ltype=' + ltype + '&bid=' + bid + '&num=' + num;
    }

    if(eid > 0 ){
        url += '&eid='+eid;
    }

    if( writing > 0  ){
        url += "&writing="+writing;
    }

	if( type == 2 ){

	    if( ltype == 1 ){
	        var  btnok = '保存创建';
	        var  title = '创建关键词';
        } else if( ltype == 2){
	        var  btnok = '保存修改';
	        var  title = '修改属性';
        }
    	var dialog=Ewin.dialog({
        	btnok:btnok,
        	title:title,
        	message:'<div style="text-align:center"><i class="fa fa-spinner fa-spin" style="font-size: 46px;margin:0 auto;"></i></div>',
        	url:url,
    	});
    } else {
        var dialog=Ewin.dialog({
            btnok:type>0?'保存修改':'保存创建',
            title:ltype>0?"修改属性":"创建内推链接",
            message:'<div style="text-align:center"><i class="fa fa-spinner fa-spin" style="font-size: 46px;margin:0 auto;"></i></div>',
            url:url,
        });
	}

    $("#"+dialog.id).off().on( 'hidden');
    $("#"+dialog.id).off().on( 'hidden.bs.modal');

    dialog.on(function(result){

        if(result){
        	try{
	            if(__cfg && did==0){
	                $("#title_id").val(__cfg.title);
	                $("#cover_id").val(__cfg.cover);
	                $("#body_id").val(__cfg.body);
	                $("#footer_id").val(__cfg.footer);
	            }
	        }catch(e){
	        	console.log(e);
	        }
            var data=$("#dispatch-form").serialize();

        	if( eid > 0 ){
        	    data += "&data[eid]="+eid;
            }

			if(type == 2 ){
            	var link = '/keyreplys/add_key';
            } else {
            	var link = '/channel/save_creation_internal';
			}

            sendData(link,data,function(data){

                if( type == 2 ){
                    var msg = data.msg;

                    if( msg == 200 ){
                        toastr.success('新增成功');

                        setTimeout('location.reload()',1000);

                        return false;
                    }else if( msg == 404 ){
                        toastr.warning('关键词不得为空');
                        return false;
                    } else if( msg == 301 ){
                        toastr.error('系统繁忙,稍后再试');
                        return false;
                    } else if( msg == 302 ){
                        toastr.error('系统繁忙,稍后再试');
                        return false;
                    } else if( msg == 405 ){
                        toastr.error('关键字已存在');
                        return false;
                    }
                }

                $("#"+dialog.id).remove();
                $(".modal-backdrop").remove();
                $("body").removeClass('modal-open').removeAttr('style');

                var qrcode = data.data.url+data.data.linkType.code ;

                var qrimg = data.data.url+data.data.linkType.img ;

                if( data.data.verCode > 0 ){
                	showResultDlg(data.data.link , data.data.ltype ,  data.data.cid ,  qrimg , qrcode , data.data.qrlink , data.data.verCode );
                } else {
                	showResultDlg(data.data.link , data.data.ltype ,  data.data.cid ,  qrimg , qrcode , data.data.qrlink  );
                }


            });
        }else{
            $("#"+dialog.id).remove();
            $(".modal-backdrop").remove();
            $("body").removeClass('modal-open').removeAttr('style');
        }
        return true;
    });
}
function showResultDlg(url,did,newdid,imgUrl,codeUrl,backGround,Ver){

    var html='<div style="font-size:16px;"><div>请复制下方推广链接，您可以在后台菜单的"推广链接"中找到它并查看统计数据</div><div style="margin:10px 0" class="text-success text-copy-url">'+url+'</div><div style="color:red;"><i class="fa fa-info-circle"></i> 请使用此链接作为文案的原文链接地址</div></div>';
    if( Ver ||  typeof(Ver) != "undefined" ){
    	var qrcode_img= imgUrl+'?qrimgcid='+newdid+'&ver='+Ver;//文案二维码
    	var qrcode_code= codeUrl+'?qrcodecid='+newdid+'&ver='+Ver;//普通二维码
    } else {
    	var qrcode_img= imgUrl+'?qrimgcid='+newdid;//文案二维码
    	var qrcode_code= codeUrl+'?qrcodecid='+newdid;//普通二维码
    }

    html+='<div class="disatch_qrcodebox">\
    		<div class="qr-line">\
    			<div class="w1 img"><div id="qrcodeimg1"></div><img src="'+backGround+'"></div>\
    			<div class="w2"><a class="btn btn-success" href="'+qrcode_img+'" download="qrcodeimg'+newdid+'">下载</a></div>\
    		</div>\
    		<div class="qr-line">\
    			<div class="w1"><div id="qrcodeimg2"></div></div>\
    			<div class="w2"><a class="btn btn-success" href="'+qrcode_code+'" download="qrcodecode'+newdid+'">下载</a></div>\
    		</div>\
    		</div>';

    var dialog=Ewin.dialog({
        btnok:'复制推广链接',
        isbtncl:false,
        'isprev':false,
        'isnext':false,
        'backdropstate':false,
        title:'保存成功',
        message:html,
    });
    $('#qrcodeimg1').qrcode({width: 100,height:100,text: url});
    $('#qrcodeimg2').qrcode({width: 100,height:100,text:url});
    $("#"+dialog.id).find('.ok').addClass('btn-copy-url');
    // $("#"+dialog.id).off().on( 'hidden', 'hidden.bs.modal');
    $("#"+dialog.id).off().on( 'hidden');
    $("#"+dialog.id).off().on('hidden.bs.modal');
    dialog.on(function(result){

        if(result){

        }else{

            if(did==newdid){
                $("#"+dialog.id).remove();
                $(".modal-backdrop").remove();
                $("body").removeClass('modal-open').removeAttr('style');
            }else{

            	if('/wxeditor/view'==location.pathname){///文案页
                	window.location.href='/wxeditor/view?did='+newdid;
                	return;
            	}else if('/wxeditor/in-view'==location.pathname){///文案页
                	window.location.href='/wxeditor/in-view?did='+newdid;
                	return;
            	}
            }

            if('/channel/activity' == location.pathname){//活动列表
        		window.location.reload();
        		return;
        	}
            if('/book/body'== location.pathname || '/copywriting/index'== location.pathname ){///章节列表
        		if(location.search.match('in_link')){
					window.location.href='/channel/Internal';
        			return;
        		} else {
        			window.location.href='/channel/index';
        			return;
        		}
        	}

        	if( '/channel/Internal'== location.pathname ){
                var param = window.location.search;
                if( param ){
                    window.location.href = '/channel/Internal'+param;
                } else {
                    window.location.reload();
                }
            }
        	if( '/channel/index'== location.pathname ){
                var param = window.location.search;
                if( param ){
        	        window.location.href = '/channel/index'+param;
                } else {
                    window.location.reload();
                }
            }

        }
        
    });
}




/****Bootstrap对话框*******************************/
(function ($) {
	window.Ewin = function () {
		var html = '<div id="[Id]" class="modal fade" role="dialog" aria-labelledby="modalLabel">' +
		'<div class="modal-dialog modal-sm">' +
		 '<div class="modal-content">' +
		 '<div class="modal-header">' +
		  '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">×</span><span class="sr-only">Close</span></button>' +
		  '<h4 class="modal-title" id="modalLabel">[Title]</h4>' +
		 '</div>' +
		 '<div class="modal-body">' +
		 '<p>[Message]</p>' +
		 '</div>' +
		 '<div class="modal-footer">' +
		'<button type="button" class="btn btn-default cancel" data-dismiss="modal">[BtnCancel]</button>' +
		'<button type="button" class="btn btn-success ok" data-dismiss="modal">[BtnOk]</button>' +
		'<button type="button" class="btn btn-success prev" data-dismiss="modal" >[BtnPrev]</button>' +
		'<button type="button" class="btn btn-success next" data-dismiss="modal" >[BtnNext]</button>' +
		'</div>' +
		 '</div>' +
		'</div>' +
		'</div>';
		var reg = new RegExp("\\[([^\\[\\]]*?)\\]", 'igm');
		var generateId = function () {
			var date = new Date();
			return 'mdl' + date.valueOf();
		}
		var init = function (options) {
		  options = $.extend({}, {
			  title: "操作提示",
			  message: "提示内容",
			  btnok: "确定",
			  btncl: "取消",
			  prev: "上一页",
			  next: "下一页",
			  isbtnok:true,
			  isbtncl:true,
              isprev:false,
              isnext:false,
              backdropstate:true,
			  width: 200,
			  auto: false
			  }, options || {});
		  var modalId = generateId();
		  var content = html.replace(reg, function (node, key) {
			  return {
				   Id: modalId,
				   Title: options.title,
				   Message: options.message,
				   BtnOk: options.btnok,
				   BtnCancel: options.btncl,
				   BtnPrev: options.prev,
				   BtnNext: options.next,
			  }[key];
		  });
		  $('body').append(content);
		  var modal=$('#' + modalId);
		  if( options.backdropstate ){
              modal.modal({
                  width: options.width,
                  backdrop: 'static'
              });
		  } else {
              modal.modal({
                  width: options.width,
              });
		  }

		  modal.on('hide.bs.modal', function (e) {
		  	$('body').find('#' + modalId).remove();
		  });
		  !options.isbtnok && modal.find('.ok').hide();
		  !options.isbtncl && modal.find('.cancel').hide();
		  !options.isprev && modal.find('.prev').hide();
		  !options.isnext && modal.find('.next').hide();
		  return modalId;
		}

		return {
			alert: function (options) {
			  if (typeof options == 'string') {
			   options = {message: options};
			  }
			  var id = init(options);
			  var modal = $('#' + id);
			  modal.find('.ok').removeClass('btn-success').addClass('btn-primary');
			  modal.find('.cancel').hide();
				return {
				   id: id,
				   on: function (callback) {
					   if (callback && callback instanceof Function) {
					    modal.find('.ok').click(function () { callback(true); });
					   }
				   },
				   hide: function (callback) {
					   if (callback && callback instanceof Function) {
					    modal.on('hide.bs.modal', function (e) {
					    callback(e);
					    });
					   }
				   }
			    };
			},
			confirm: function (options) {
			  var id = init(options);
			  var modal = $('#' + id);
			  modal.find('.ok').removeClass('btn-primary').addClass('btn-success');
			  modal.find('.cancel').show();
			  return {
				   id: id,
				   on: function (callback) {
					   if (callback && callback instanceof Function) {
					    modal.find('.ok').click(function () { callback(true); });
					    modal.find('.cancel').click(function () { callback(false); });
					   }
				   },
				   hide: function (callback) {
					   if (callback && callback instanceof Function) {
					    modal.on('hide.bs.modal', function (e) {
					    callback(e);
					    });
					   }
				   }
			  };
			},
			dialog: function (options) {
				var id = init(options);
				var modal = $('#' + id);
			  	modal.find('.modal-dialog').removeClass('modal-sm');

			  	if(options.url){
			  		modal.find('.modal-body').load(options.url);
			  	}else{
			  		modal.find('.modal-body').html(options.message);
			  	}
			  	return {
				   id: id,
				   on: function (callback) {
					   if (callback && callback instanceof Function) {
					    modal.find('.ok').click(function () { callback(true); });
					    modal.find('.cancel').click(function () { callback(false); });
					    modal.find('.close').click(function () { callback(false); });
					   }
				   },
				   hide: function (callback) {
					   if (callback && callback instanceof Function) {
					    modal.on('hide.bs.modal', function (e) {
					    callback(e);
					    });
					   }
				   }
			    };
				
			}
		}
	}();
})(jQuery);
