var App = {
	playerID: $('.play-box'),
	puffinFullscreen: false,
	frameBlank: 'about:blank',
	gameImgMobi: null,
	playGameImg: settings.publicUrl + 'images/flash.png',
	gameOrientation: 'portrait',
	init: function(){
		App.gotoTop();
		App.flash().init();
		App.slide().init();
		App.ecapeInIframe();
		App.setOldVersion();
		App.view().createSearchBox();
		App.message().post('new_version_actived');
		App.view().alertBox();
		/* Drap Scrollbar */
		if(!App.detect().mobile()){			
			$('.panel-scrollbar:not(.no-scrollbar), .panel-scrollbar:not(.no-scrollbar)').each(function(){		
				if( !App.detect().mobile() ){	
					App.slide().dragScroll( $(this).get(0) );
				};	
			});
		};
		/* Anti-adblock*/
        App.AD().detectAdBlock(function(){
            $('#detect__adblock').show();
        }, function(){
            $('#detect__adblock').hide();
        });
		/* Modal init */
		App.FSGModal();
	},
	getOSName: function() {
		var userAgent = window.navigator.userAgent,
			platform = window.navigator.platform,
			macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
			windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
			iosPlatforms = ['iPhone', 'iPad', 'iPod'],
			os = null;

		if (macosPlatforms.indexOf(platform) !== -1) {
			os = 'macos';
		} else if (iosPlatforms.indexOf(platform) !== -1) {
			os = 'ios';
		} else if (windowsPlatforms.indexOf(platform) !== -1) {
			os = 'windows';
		} else if (/Android/.test(userAgent)) {
			os = 'android';
		} else if (/Linux/.test(platform)) {
			os = 'linux';
		};
		return os;
	},
	copyToClipboard: function(copyText, callback){
		 if (window.clipboardData && window.clipboardData.setData) {
			/* Internet Explorer-specific code path to prevent textarea being shown while dialog is visible. */
			window.clipboardData.setData("Text", copyText);

		}else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
			var textarea = document.createElement("textarea");
				textarea.textContent = copyText;
				textarea.style.position = "fixed";  /* Prevent scrolling to bottom of page in Microsoft Edge. */
				document.body.appendChild(textarea);
				textarea.select();
				try {
					document.execCommand("copy");  /* Security exception may be thrown by some browsers. */
				}
				catch (ex) {
					console.warn("Copy to clipboard failed.", ex);
				}
				finally {
					document.body.removeChild(textarea);
				}
		};
		if(callback != undefined && typeof(callback) == 'function'){
			callback();
		};
	},
	WarningLeave: function(){
		window.onbeforeunload = function (e) {
			e = e || window.event;
		
			// For IE and Firefox prior to version 4
			if (e) {
				e.returnValue = 'Sure?';
			}
		
			// For Safari
			return 'Sure?';
		};
	},
	clearWarningLeave: function(){
		window.onbeforeunload = null;
	},
	ecapeInIframe: function(){	
		if(App.detect().FSGBrowser()){
			$('body').attr('class', 'bg-digital-art');
		}else{
			if (window!=window.top){
				$('a').attr('target', '_top'); 
				console.log('Escape the ifrme: ', true);
			}
		}
	},
	bytesToSize: function(bytes) {
		var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
		if (bytes == 0) { return '0 Byte'; }
		var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
		return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
	},
	isNumeric: function(str) {
	  if (typeof str != "string") { return false; };  /* we only process strings!  */
	  return !isNaN(str) && /* use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)... */
			 !isNaN(parseFloat(str)) /* ...and ensure strings of whitespace fail */
	},
	nFormatter: function(num, digits) {
		var si = [
			{ value: 1, symbol: " Views" },
			{ value: 1E3, symbol: "k" },
			{ value: 1E6, symbol: "M" },
			{ value: 1E9, symbol: "G" },
			{ value: 1E12, symbol: "T" },
			{ value: 1E15, symbol: "P" },
			{ value: 1E18, symbol: "E" }
			];
		var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
		var i;
		for (i = si.length - 1; i > 0; i--) {
			if (num >= si[i].value) {
				break;
			}
		}
		return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
	},
	jqGetOuterHtml: function(section){
		return $('<div>').append($(section).clone()).html();
	},	
	jqGetWidth: function(){
		var win = window,
			doc = document,
			docElem = doc.documentElement,
			body = doc.getElementsByTagName('body')[0],
			windowWidth = win.innerWidth || docElem.clientWidth || body.clientWidth;			
			return windowWidth;
	},
	jqGetHeight: function(){
		var win = window,
			doc = document,
			docElem = doc.documentElement,
			body = doc.getElementsByTagName('body')[0],
			windowHeight = win.innerHeight || docElem.clientHeight || body.clientHeight;			
			return windowHeight;
	},
	setOldVersion: function(){
		$('.old-version').click(function(){
			FSG.COOKIE.set('layout', 'windows', 1, true);
			if(FSG.COOKIE.get('layout', true) == 'windows'){
				location.reload();
			}
		});
	},
	gotoTop:function(){
		var backgroundColor = $('body:first').css('background-color'),
			bodyBg = (backgroundColor != undefined) ? backgroundColor : 'red';
			$(window).scroll(function(){
				if($(this).scrollTop() > 30){
					if($('.goto-top-btn').get(0) == undefined){
						$('body').append('<div id="quick_scroll_to_top" style="background:url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNy4xLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB3aWR0aD0iMTZweCIgaGVpZ2h0PSIxNnB4IiB2aWV3Qm94PSIwIDAgMTYgMTYiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDE2IDE2IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxwb2x5Z29uIGZpbGw9IiNGRkZGRkYiIHBvaW50cz0iOCwyLjggMTYsMTAuNyAxMy42LDEzLjEgOC4xLDcuNiAyLjUsMTMuMiAwLDEwLjcgIi8+DQo8L3N2Zz4=) center center no-repeat '+bodyBg+';width:60px;height:30px;position:fixed;bottom:0;right:10px;z-index:9999;cursor:pointer;border-radius:5px 5px 0 0;box-shadow:0 5px 15px 5px rgba(0,0,0,0.6);opacity:0.6" class="goto-top-btn"></div>');
						if(App.detect().mobile()){
							$('#quick_scroll_to_top').css({left:'50%', right: 'auto', bottom: '20px', transform: 'translateX(-50%)', width:'40px', height: '40px', 'border-radius': '50%', margin: '0', padding: '0'});
						};
						$('.goto-top-btn').hover(function(){$(this).css({opacity:1})}, function(){$(this).css({opacity:0.6})});
					};
				}else{
					$('.goto-top-btn').remove();	
				};
			});
			/* Action */
			$('body').on('click', '.goto-top-btn', function(){ 
				$('html,body').animate({ scrollTop: 0 }, 300);
			});
			/*$('meta[name="theme-color"]').attr('content', backgroundColor);*/
		
	},
	str: function(){
		return {
			slug: function(str){
				str = str + '';
				str = str.replace(/\&/g, 'and');
				str = str.replace(/^\s+|\s+$/g, '');
				str = str.toLowerCase();
				var from = "ãàáäâẽèéëêìíïîõòóöôùúüûñç·/_,:;";
				var to = "aaaaaeeeeeiiiiooooouuuunc------";
					for (var i = 0, l = from.length; i < l; i++) {
						str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i))
					};
				str = str.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a')
					.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e')
					.replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i')
					.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o')
					.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u')
					.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y')
					.replace(/đ/gi, 'd')
					.replace(/\'+/g, '-')
					.replace(/\.+/g, '-')
					.replace(/[^a-z0-9 -]/g, '')
					.replace(/\s+/g, '-')
					.replace(/-+/g, '-')
					.replace('039-', '-')/*
					.replace('-s-', 's-')*/;
					return str
			},
			unslug: function(str){
				return str.replace('-s-', "'s ").replace('-s ', "'s ").replace(/\-s$/gi, "'s").replace(/\-|\_/gi, ' ');
			},
			ucwords: function(str) {
				return (str + '').replace(/^([a-z])|\s+([a-z])/g, function ($1) {
					return $1.toUpperCase();
				});
			},
			truncate: function(str, num, specialChars, moreChar) {
				var more = (typeof moreChar == 'undefined') ? '...' : moreChar;
				var specialCharsList = (typeof specialChars == 'undefined') ? ' ' : specialChars;
					if (str.length < num) {
						return str;
					};	
					var strTruncated = str.slice(0, num),
						lastPosChar = 0;
						if(specialCharsList.indexOf('|') != -1){
							var arraySpecialChars = specialCharsList.split('|');
								for(var i in arraySpecialChars){
									var currentPosChar = strTruncated.lastIndexOf(arraySpecialChars[i]);
										if(currentPosChar != -1 && arraySpecialChars[i] == '...'){
											lastPosChar = currentPosChar;
											break;	
										}else if(currentPosChar != -1 && currentPosChar > lastPosChar){
											lastPosChar = currentPosChar;
										};
								};
						}else{
							lastPosChar = strTruncated.lastIndexOf(spaceKey);
						};
						if(lastPosChar != -1){
							var result = strTruncated.slice(0, lastPosChar);
								if(more == result.slice(-3)){
									return result;
								}else{
									return result + more;
								};
						};
						return '';
			},
			stripTags: function(strWithHTML){
				return strWithHTML.replace(/(<([^>]+)>)/gi, "");
			},
			getTextWidth: function(nodeWithText){
				var textNode = $(nodeWithText).contents().filter(function () {
						return this.nodeType == Node.TEXT_NODE;
					})[0];
				var range = document.createRange();
					range.selectNode(textNode);
					return range.getBoundingClientRect().width;
			}
		};
	},
	detect: function(){
		return {
			localhost: function(){
				return location.hostname.indexOf('flashstorage.v2') != -1 
					|| location.hostname.indexOf('flashstorage.test') != -1
					|| location.hostname.indexOf('localhost') != -1
					|| App.request().get('test_mode') == 'true';
			},
			mobile: function(){
				var check = false;
					(function(a) {
						if (/android|bb\d+|meego|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|iphone|ipod|ipad|kindle|mobile|netfront|opera mini|opera mobi|palm os|phone|symbian|vodafone|wap|windows ce|xda|xiino/i.test(a)) {
							check = true;
						}
					})(navigator.userAgent || navigator.vendor || window.opera);
					return check;
			},
			puffin: function(){
				try{
					var userAgent = navigator.userAgent.toLowerCase();
						if(userAgent.indexOf('puffin') != -1){
							return true;
						};
				}catch(e){
					console.log(e);
				}
				return false;
			},
			FSGBrowser: function(){
				try{
					var userAgent = navigator.userAgent.toLowerCase();
						if(userAgent.indexOf('fsg-browser') != -1){
							return true;
						};
				}catch(e){
					console.log(e);
				}
				return false;
			},
			iOS: function() {
				return [
					'iPad Simulator',
					'iPhone Simulator',
					'iPod Simulator',
					'iPad',
					'iPhone',
					'iPod'
				].includes(navigator.platform)
				/* iPad on iOS 13 detection */
				|| (navigator.userAgent.includes("Mac") && "ontouchend" in document)
			},
			basilisk: function(){
				var userAgent = navigator.userAgent.toLowerCase();
					if(userAgent.indexOf('basilisk') != -1){
						return true;
					}
					return false;
			},
			smallScreen: function(){
				if(App.jqGetWidth() < 601){
					return true;
				}
				return false;
			},
			rotate: function(){
				if(App.jqGetWidth() > App.jqGetHeight() && App.detect().mobile()){
					/* Landscape */
					return true;
				}
				return false;
			},
			isFirefox: function(){
				return navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
			}
			
		};		
	},
	request: function(){
		return new URLSearchParams(window.location.search);
	},	
	fullscreen: function(){
		return {
			request: function(el){
				if(App.detect().iOS()){
					App.playerID.cssImportant({		
						width: 'auto',				
						height: App.jqGetHeight() + 'px',
						maxHeight: '10000px',
						position: 'fixed', 
						left:0, top: 0, right:0, bottom:0, 
						'z-index': 9999999, 
						background: 'black'
					});	
					App.view().createMobileLayout_iOS(App.playGameImg, false, App.gameOrientation);
					$('body').css({'touch-action': 'none', 'overflow': 'hidden'});

				}else if(App.detect().localhost() || App.detect().FSGBrowser()){
					let srcIframe;
						if(typeof $('.playbox__layer').get(0) != 'undefined'){
							srcIframe = $('.playbox__layer').attr('data-frame-src') + '#fullscreen=true';
						}else{							
							srcIframe = typeof($(el).find('iframe').attr('src')) != 'undefined' 
								? $(el).find('iframe').attr('src') + '#fullscreen=true'
								: $(el).find('iframe').attr('data-src') + '#fullscreen=true'; 
						};
						srcIframe = srcIframe.replace(/game\=[^\&|\#|\?]+/gi, 'metadata=no');
						/* Ouput to layout */
						if(srcIframe != 'undefined#fullscreen=true'){
							App.fullscreen().popupWindow(srcIframe, 'PLAYING..', App.jqGetWidth(), App.jqGetHeight());
						}else{
							console.log('URL Error: '+ $(el).html());
						};
				}else{
					/* Supports most browsers and their versions. */
					var requestMethod = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullscreen;
						if(App.detect().puffin()){
							App.puffinFullscreen = true;
							App.view().createMobileLayout_iOS(App.playGameImg, false, App.gameOrientation);
						};
						if (requestMethod) { /* Native full screen.*/
							requestMethod.call(el);
						} else if (el.webkitEnterFullscreen){	
							el.webkitEnterFullscreen(); /* on iPhone */
						} else if (typeof window.ActiveXObject !== "undefined") { /* Older IE.*/
							var wscript = new ActiveXObject("WScript.Shell");
							if (wscript !== null) {
								wscript.SendKeys("{F11}");
							}
						};
						screen.orientation.unlock();
						screen.orientation.lock('landscape');
						return false;
				};
			},
			isMax: function(){
				if(App.detect().puffin()){
					return App.puffinFullscreen;
				}else if(App.detect().iOS()){
					if(App.playerID.css('position') == 'fixed' && App.playerID.css('z-index') == 9999999){
						return true;
					};
				};
				return document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
			},
			cancel: function(callback, img){
				if(App.fullscreen().isMax()) {
					if(App.detect().iOS()){
						App.playerID.cssImportant({position: 'relative', left: 'auto', top: 'auto', right: 'auto', bottom: 'auto', zIndex: 0, width: '', height: '', maxHeight: ''});
						App.view().createMobileLayout_iOS(img, false, App.gameOrientation);
						$('body').css({'touch-action': 'auto', 'overflow': 'auto'});
					}else{	
						var el = document;
						var requestMethod = el.cancelFullScreen||el.webkitCancelFullScreen||el.mozCancelFullScreen||el.exitFullscreen||el.webkitExitFullscreen;
							if(App.detect().puffin()){
								App.puffinFullscreen = false;
							};
							if (requestMethod) { /* cancel full screen.*/
								requestMethod.call(el);
							} else if (typeof window.ActiveXObject !== "undefined") { /* Older IE.*/
								var wscript = new ActiveXObject("WScript.Shell");
								if (wscript !== null) {
									wscript.SendKeys("{F11}");
								}
							};
							screen.orientation.unlock();
							screen.orientation.lock('portrait');
					};					
					if(callback != undefined){
						callback();
					};
				};
			},
			attachToButton: function(){
				$('.fullscreen-btn').unbind('click');
				$('.fullscreen-btn').click(function(){
					if(App.detect().iOS()){						
						if(App.view().getFrameId().attr('data-src')){
							location.href = App.view().getFrameId().attr('data-src');
						}else{
							location.href = App.view().getFrameId().attr('src');
						};
					}else{
						App.fullscreen().request( $('.play-box').get(0) );
					};
				});
				$('#wide_size').unbind('click');
				$('#wide_size').bind('click', function(){
					if( $('.right-box').is(":visible") ) { 
						if($(this).attr('data-size') == 1){
							App.fullscreen().wideSize(false, function(){							
								App.view().clearOtherGames();
								FSG.COOKIE.set('player_is_wide', 'off', 7);
								App.view().fitQuickControls();								
					
								let rightBoxWidth = ($('.right-box').outerWidth(true) + parseInt($(".play-nav .fullscreen-btn").css('marginRight')));
									$(".play-nav .fullscreen-btn").css({marginRight: rightBoxWidth});
							});
						}else{
							App.fullscreen().wideSize(true, function(){							
								App.view().clearOtherGames();
								FSG.COOKIE.set('player_is_wide', 'on', 7);
								App.view().fitQuickControls();
								$('#controls-box').css({'margin-top': 0});
								$(window).scrollTop(0);
							});
						};
					}else{
						alert('This action is disabled!'); 
						return false;
					};
				});
			},
			moveButton: function(){
				if(typeof $('.more-tools').find('.fullscreen-btn').get(0) == 'undefined'){
					var fullScreenHTML = $(".fullscreen-btn").clone();
						$('.more-tools').append(fullScreenHTML);
						$('.more-tools .fullscreen-btn')
							.html('Fullscreen Mode')
							.addClass('player-tooltip')
							.css({
								marginRight: 'auto', 
								marginTop: '0', 
								marginLeft: '4px',  
								width: '28px', 
								height: '28px', 
								float:'right', 
								paddingLeft: 0, 
								backgroundPosition:'center center',
								'border-right': "1px solid rgba(255,255,255,.1)", 
								'border-bottom': "1px solid rgba(255,255,255,.1)", 
								'background-color': 'rgba(0,0,0,.2)',
								'color': 'transparent'
							});
							/* Attach event to button */
							App.fullscreen().attachToButton();
				};		
					
			},
			popupWindow: function(url, title, w, h) {
				var left = (screen.width/2)-(w/2);
				var top = (screen.height/2)-(h/2);			
					window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);
			},
			wideSize: function(wStatus, fn){
				if(wStatus == true){
					$(".play-tool-box:visible").prependTo("#content");
					$(".play-box:visible").prependTo("#content");		
					$(".play-box:visible").css({height: 800});
					/* Set status */
					$('#wide_size').attr('data-size', 1);

					/* Move fullscreen button to up */
					$(".play-nav:visible").prependTo("#content");
					$(".play-nav .fullscreen-btn").css({marginRight: 0});		
					

				}else{
					$(".play-tool-box:visible").prependTo("#play .game-info");
					$(".play-box:visible").prependTo("#play");
					$(".play-box").css({height: 550});
					$('#wide_size').attr('data-size', 0);

					/* Move fullscreen button to up */
					/*setTimeout(function(){
						
					let playBoxRight = $(window).width() - ($('#play .play-box').position().left + $('#play .play-box').outerWidth(true)); 
					alert(playBoxRight);
					$(".play-nav .fullscreen-btn").css({marginRight: playBoxRight});
					}, 100);*/

					$(".play-nav:visible").prependTo(".play-page");
					
				};
				if(typeof fn != 'undefined' && typeof fn == 'function'){
					fn();
				};
			},
			detectPlayerWide: function(fn){
				var playerIsWide = FSG.COOKIE.get('player_is_wide');
					if((typeof playerIsWide != 'undefined' && playerIsWide == 'on') || App.request().get('widescreen') == 'on'){
						App.fullscreen().wideSize(true);
					};
					if(typeof fn != 'undefined' && typeof fn == 'function'){
						fn();
					};
			}
		};
	},
	flash: function(){
		return {
			init: function(){
				this.freshWebsite(); /* Fresh website if flash installed */
				this.requestAllGames(); /* Use can request all games when not install flash player */
			},
			installed: function(){
				if(typeof(FlashDetect.installed) != undefined){
					return FlashDetect.installed;
				}
				return false;
			},
			freshWebsite: function(){
				var flashPlayer = FSG.COOKIE.get('flash_player', true);
					console.log('App.flash.freshWebsite: Flash Player is', flashPlayer ? flashPlayer : 'off');
					if(App.flash().installed() && flashPlayer != 'on'){
						FSG.COOKIE.set('flash_player', 'on', 7, true);
						console.log('App.flash.freshWebsite: Adobe Flash Player is ', flashPlayer ? flashPlayer : 'off');
						if(FSG.COOKIE.get('flash_player', true) == 'on'){
							window.location.reload();
						}
					}
			},
			requestAllGames: function(){
				$('.default-btn').unbind('click');
				$('.default-btn').bind('click', function(){
					var filter = $(this).data('filter');
						if(filter == 'all-games'){
							FSG.COOKIE.set('user_request', 'all', 7, true);
							if(FSG.COOKIE.get('user_request', true) == 'all'){
								window.location.reload();
							};
							return false;
						}else if(filter == 'for-you'){
							FSG.COOKIE.set('user_request', 'emulator', 7, true);
							if(FSG.COOKIE.get('user_request', true) == 'emulator'){
								window.location.reload();
							};
							return false;
						}
						
				});
			},
			getPlayable: function(){
				if(App.flash().installed() || FSG.COOKIE.get('user_request', true) == 'all'){
					return 'all';
				}
				return 'emulator';
			},
			getPlayableByCategory: function(categorySlug){
				let flashPlayer = FSG.COOKIE.get('flash_player', true),
					userRequest = FSG.COOKIE.get('user_request', true);
					if((!App.flash().installed() && userRequest != 'all') 
						|| categorySlug == 'emulator' 
						|| categorySlug == 'ruffle' 
						|| categorySlug == 'mac' 
						|| categorySlug == 'without-flash'){
							return 'emulator';
					}else { 
						return 'all';
					};
			}
		};
	},
	slide: function(){
		return {
			init:function(){
				if(App.scrolling == undefined){
					App.scrolling = false;	
				};
				this.largeContent();
				this.gripContent();
			},
			largeContent: function(parentID, isResize){
				var largeContentSection = (typeof parentID != 'undefined') ? parentID+ ' .large-content' : '.large-content';
					$(largeContentSection).each(function(key, val){			
						var itemLC = $(val).find('.large-item').outerWidth(true),
							total = $(val).find('.large-item').length;
						var wrapperWidth = 	itemLC * total;
							$(val).css({width: wrapperWidth});
						var panel = $(val).parents('.large-panel');	
							if(typeof isResize == 'undefined'){
								App.slide().setNextAndPrevious(panel.find('.panel-next'), panel.find('.panel-previous'), panel.find('.panel-scrollbar'), panel.find('.panel-scrollbar').width(), wrapperWidth);
							};
							if(App.detect().basilisk()){
								var lastHeight = $(val).parent('.panel-scrollbar').height();
									$(val).parents('.large-panel').css({overflow: 'hidden', height: lastHeight + 30});
									$(val).parent('.panel-scrollbar').not('.no-scrollbar').css({height: lastHeight + 40});
							}
					});
			},
			gripContent: function(parentId, next){
				var gripContentSection = (typeof parentId != 'undefined') ? parentId + ' .panel-scrollbar' : '.panel-scrollbar', totalBlocks = 4 * 4;
					$(gripContentSection).each(function(key, val){
						var contentWidth = $(val).width()-2,
							itemOutWidth = $(val).find('.grip-item:first').outerWidth(true),
							itemWidth = $(val).find('.grip-item:first').width(),
							itemMargin = itemOutWidth - itemWidth,
							totalItem = $(val).find('.grip-item').length;
						var cols = 	Math.round((((contentWidth - itemMargin)/itemOutWidth) * 100)/100),
							newItemWidth = ((contentWidth - itemMargin)/cols) - itemMargin;
							$(val).find('.grip-item').css({width: newItemWidth});
						var maxWidth = (newItemWidth + itemMargin)  * totalBlocks;
							if(totalItem < totalBlocks){
								maxWidth = (newItemWidth + itemMargin)  * totalItem;
							};
							$(val).find('.grip-content:not(.no-resize)').css({width: maxWidth});
						
							var gripPanel = $(val).parent('.grip-panel');
								if(maxWidth > gripPanel.width() && next != true){
									App.slide().setNextAndPrevious(gripPanel.find('.panel-next'), gripPanel.find('.panel-previous'), val, contentWidth, maxWidth);
								};						
								if(App.detect().basilisk()){
									var lastHeight = $(val).height();
										$(val).not('.no-scrollbar').parents('.grip-panel').css({overflow: 'hidden', height: lastHeight + 30});
										$(val).not('.no-scrollbar').css({height: lastHeight + 40});
								};					
							
					});
					if( window.location.pathname == '/' ){
						let gripContentId = $(gripContentSection).find('.grip-content:not(.no-resize)').attr('id');
							if(gripContentId == 'popular-box'){							
							}else if(gripContentId == 'last-played'){
								this.sortGripContent('#last-played', 2);
							}else if(gripContentId == 'new-games'){
								this.sortGripContent('#new-games', 2);
							};
							this.sortGripContent('#popular-box', 3);

							if(typeof $(gripContentSection).get(0) != 'undefined'){
								$(gripContentSection).get(0).style.scrollSnapType  = 'x mandatory';
							};
					};
			},
			sortGripContent: function(section, rows){
				var gripItem = $(section).find('.grip-item:first'),
					itemWidth = gripItem.outerWidth(true);
				var blockHTML = '',
					nextBlock = 0;	
					 $(section+ ' .grip-item').each(function(index, item){
						 if(index%rows == 0){
							 blockHTML += '<div class="grip-content-sorted" style="width:'+itemWidth+'px;display: inline-block;vertical-align: top;margin:0;padding:0;border:0">';
							 nextBlock = 0;
						 };
						 blockHTML += App.jqGetOuterHtml(item);
						 nextBlock++;
						 if(nextBlock == rows){
							 blockHTML += '</div>';
						 }
					 });
					 $(section).html(blockHTML);
					 if(typeof FSG.ROUTE != 'undefined' && FSG.ROUTE.actived == true){
						/*FSG.ROUTE.pushLinksToState(section, true);*/
					 };
			},
			setNextAndPrevious: function(nextButton, preButton, val, contentWidth, maxWidth){
			   _this = this;		
				nextButton.show();				
				nextButton.unbind('click');
				nextButton.bind('click', function(){
					var lastScolleft = $(val).scrollLeft();
						App.scrolling = true;
						$(val).get(0).style.scrollSnapType  = 'none';
						$(val).animate({scrollLeft: lastScolleft + contentWidth}, function(){							
							if($(val).scrollLeft() > 0){
								preButton.show();
							};
							if($(val).scrollLeft() + contentWidth >= maxWidth-10){
								nextButton.hide();
							};
							App.scrolling = false;
							$(val).get(0).style.scrollSnapType  = 'x mandatory';
						});
						
				});
				preButton.unbind('click');
				preButton.bind('click', function(){
					var lastScolleft = $(val).scrollLeft();
						App.scrolling = true;
						$(val).get(0).style.scrollSnapType  = 'none';
						$(val).animate({scrollLeft: lastScolleft - contentWidth}, function(){
							if($(val).scrollLeft() < 1){
								preButton.hide();
							};
							if($(val).scrollLeft() < maxWidth - contentWidth){
								nextButton.show();
							};
							App.scrolling = false;
							$(val).get(0).style.scrollSnapType  = 'x mandatory';
						});
				});
				var rollScrollLeftFn = function(val, _this){
					if(App.scrolling == false){
						var itemWidth = (typeof $(_this).find('.large-item:first').get(0) != 'undefined') ? 
							$(_this).find('.large-item:first').outerWidth(true) : 
							$(_this).find('.grip-item:first').outerWidth(true),
							cols = Math.round( $(_this).scrollLeft() / itemWidth);
						var moveToScrollLeft = cols * itemWidth; 
						var wrapperScrollWidth = (typeof $(_this).find('.large-content').get(0) != 'undefined') ? $(_this).find('.large-content').width() : $(_this).find('.grip-content').width(),
							currentScrollLeft = parseInt($(_this).scrollLeft()) + parseInt($(_this).width());
							if((itemWidth * 52/100) + currentScrollLeft > wrapperScrollWidth){
								$(val).animate({scrollLeft: wrapperScrollWidth});
							}else{
								$(val).animate({scrollLeft: moveToScrollLeft});
							};
					}	
				};
				var timer = null;
					$(val).unbind('scroll');
					$(val).scroll(function(){	
						if($(this).scrollLeft() < 100){
							preButton.hide();
						};
						if($(this).scrollLeft() < maxWidth - contentWidth){
							nextButton.show();
						};
						if($(this).scrollLeft() >= 100){
							preButton.show();
						};
						if($(this).scrollLeft() + contentWidth >= maxWidth-100){
							nextButton.hide();
						};
						/*
						if(timer !== null) {
							clearTimeout(timer);        
						};
						if(App.detect().mobile()){
							var _this = this;
								timer = setTimeout(function() {
									rollScrollLeftFn(val, _this);
								}, 300);
						}*/
					});

					/*
					$(val).on('touchmove touchstart', function(){
						if(timer !== null) {
							clearTimeout(timer);
						};
						$(val).stop();
					});
					
					// Rescroll when mouse leave 
					$(val).on('mouseleave', function(){
						rollScrollLeftFn(val, this);
					});
					*/
			},
			dragScroll: function(slider){
				let isDown = false;
				let startX;
				let scrollLeft;
		
				slider.addEventListener("mousedown", (e) => {
					isDown = true;
					startX = e.pageX - slider.offsetLeft;
					scrollLeft = slider.scrollLeft;
					slider.style.scrollSnapType = 'none';
				});
				slider.addEventListener("mouseleave", () => {
					slider.style.scrollSnapType = 'x mandatory';
					isDown = false;
				});
				slider.addEventListener("mouseup", () => {
					slider.style.scrollSnapType = 'x mandatory';
					isDown = false;
				});
				slider.addEventListener("mousemove", (e) => {
					if (!isDown) { return; };
					e.preventDefault();
					const x = e.pageX - slider.offsetLeft;
					const walk = (x - startX) * 2;
					slider.scrollLeft = scrollLeft - walk;
					console.log(walk);
				});
		
			}
		};
	},
	AD: function(){
		return {
			detectAdBlock: function(hasAdblock, noAdblock){        
					window.addEventListener("load", () => {
						fetch(
							"https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js",
							/* "https://www3.doubleclick.net",*/
							/* "https://static.ads-twitter.com/uwt.js" */
							{ method: "HEAD", mode: "no-cors", cache: "no-store" }
						)
						.then(res => noAdblock(res))
						.catch(err => hasAdblock(err));
					});
			},
			convertAdUnit: function(section, unit){
				var adWidth = parseInt($(section).outerWidth(true)), adHeight = parseInt($(section).outerHeight(true));
					if(adWidth >= 1200 && adHeight >= 300){
						unit = '1200x300';
					}else if(adWidth >= 300 && adHeight >= 600){
						unit = '300x600';
					}else if(adWidth >= 1200 && adHeight >= 90){
						unit = '1200x90';
					}else if(adWidth >= 728 && adHeight >= 90){
						unit = '728x90';
					}else if(adWidth >= 290 && adHeight >= 250){
						unit = '300x250';
					}
					return unit;
			},
			distributeAdTo: function(section, unit, gameSlug){
				var unit = App.AD().convertAdUnit(section, unit);					
					if(App.detect().localhost()){
						/* Localhost */
						App.AD().setAlternativeAd(section, unit, 'cpmstar');
					}else if(App.detect().FSGBrowser()){
						/* If The  Browser is FSG Browser */
						App.AD().setAlternativeAd(section, unit);
					}else{
						var adSource = $(section).data('ad-source');
							/* Get other Ad */
							if(typeof adSource != "undefined"){
								App.AD().setAlternativeAd(section, unit, adSource);
							}else{
								/* Google Adsenes Ad */
								var cacheId = (gameSlug == undefined) ? new Date().getTime() : gameSlug,
									csrfToken = $('meta[name="csrf-token"]').attr('content');
									$.ajaxSetup({superCache: false, cache: false});
									$.get(settings.baseUrl + 'api/ads/unit/'+unit+'?gameSlug='+cacheId, {'_token': csrfToken}, function(result){
										$(section).html(result);
										if(unit != 'auto'){
											var u = unit.split('x'),
												width = (u[0] != undefined && App.isNumeric(u[0])) ? u[0] : 1200,
												height = (u[1] != undefined  && App.isNumeric(u[1])) ? u[1] : 250;
												
												console.log('Ad unit: ', u);
												/* Set css */
												$(section).css({width: width, height: parseInt(height) + 10});
										};
										console.log(trans.ad_in + ': ', cacheId);
									});
							}
					}
			},
			setAlternativeAd: function(section, unit, adSource){
				if(typeof adSource != 'undefined' && typeof unit != 'undefined' && window.location.hostname == 'flashga.me'){
					let adPath = settings.publicUrl +  'ads/'+ window.location.hostname+'/'+ adSource + '/' + unit + '.html?t=2';
					var arrUnit = unit.split('x'),
						width = (typeof arrUnit[0] != 'undefined' && App.isNumeric(arrUnit[0])) ? arrUnit[0] : 1200,
						height = (typeof arrUnit[1] != 'undefined' && App.isNumeric(arrUnit[1])) ? arrUnit[1] : 250;
						// Put ad to the section 
						$(section)
							.show()
							.attr({style: 'height:'+ (parseInt(height) + 10) + 'px!important'})
							.html('<iframe title="'+ App.str().ucwords(adSource) +' Ad '+ width +'x'+ height +'" src="'+adPath+'" width="'+width+'" height="'+height+'" marginwidth="0" marginheight="0" scrolling="no" border="0" style="border:0;padding:0"></iframe>');					
				}else{
					$(section).hide();
				};
				/*$(section).empty();*/
			},
			fillEmptyAd: function(timer){
				return;
				var timer = (typeof timer == 'undefined') ? 500 : timer,
					counter = 1;
				var objInterval = setInterval(function(){
						if(counter < 8) { /* Processing will exit in 3 seconds or when find empty ad */
							$('div[data-ad]').find('*[data-ad-status="unfilled"]').each(function(index, adEmpty){
								var prentAd = $(adEmpty).parent('div[data-ad]');
								var unit = App.AD().convertAdUnit(prentAd,  $(prentAd).data('ad') );
									if(App.detect().FSGBrowser()){
										/* If The Browser is FSG Browser */
										App.AD().setAlternativeAd(prentAd, unit);
									}else{
										App.AD().setAlternativeAd(prentAd, unit, 'cpmstar');
									}
							});
						}else{
							clearInterval(objInterval);
						}
						counter++;
					}, timer);
			},
			preloadAd: function(){
				if(settings.preloadAd == 1 && App.detect().FSGBrowser() == false && !App.detect().mobile()){
					var playerId = $('.play-box'),
						leftCounter = 5;
						/* Use FSG ad increaseDelay method */
						FSG.AD.increaseDelay(settings.returnAdAfter * 60 * 1000, 'last_time_ad_shown_3', function(){
							var preloadTemplate = '<div id="preload-ad">';
								preloadTemplate += '<div class="preload-ad-container">';
								preloadTemplate += '<b>'+ trans.advertisement +'</b>';
								preloadTemplate += '<div data-ad="300x250" data-ad-source="cpmstar" class="preload-ad-body">';
								preloadTemplate += '</div>';
								preloadTemplate += '<button class="preload-close-button">'+ trans.ad_counter_title +': '+leftCounter+'</button>';
								preloadTemplate += '</div>';
								preloadTemplate += '</div>';
								playerId.append(preloadTemplate);
								App.AD().distributeAdTo('.preload-ad-body', '300x250');
							var adLoadedCounter = 0;	
							var adLoadedInterval = setInterval(function(){
								if(adLoadedCounter >= 100){
									console.log('Load Ad is failed!');
									App.AD().countPreloadAd(leftCounter);
									clearInterval(adLoadedInterval);
								}else{	
									if(typeof $('.preload-ad-body iframe').get(0) != 'undefined') {
										$('.preload-ad-body iframe').on('load', function(){
											console.log('Ad is loaded!');
											App.AD().countPreloadAd(leftCounter);
											clearInterval(adLoadedInterval);
										});
									}else if(typeof $('.preload-ad-body img').get(0) != 'undefined'){	
										$('.preload-ad-body img').one('load', function(){
											console.log('Ad is loaded!');
											App.AD().countPreloadAd(leftCounter);
											clearInterval(adLoadedInterval);
										});
									}else{
										if(typeof $('.preload-ad-body').find('*[data-ad-status="unfilled"]').get(0) != 'undefined'){
											console.log('Ad is loaded!');
											App.AD().countPreloadAd(leftCounter);
											clearInterval(adLoadedInterval);
										}
									}
								}	
								adLoadedCounter++;
							}, 20);
						});
				}
			},
			countPreloadAd: function(counter){
				if(window.preloadTimeout){
					clearInterval(window.preloadTimeout);
				};
				window.preloadTimeout = setInterval(function(){
					if(counter < 1){
						clearInterval(window.preloadTimeout);
						$('.preload-close-button')
							.html(trans.play_game)
							.attr('data-completed', 'true')
							.addClass('preload-ad-play-game');
							App.AD().closePreloadAd('.preload-ad-play-game');
							/* Set delay ad */
							FSG.COOKIE.set('last_time_ad_shown', (new Date().getTime()), 1/48);
					}else{
						$('.preload-close-button').html(trans.ad_counter_title +': ' + counter);
					}
					counter--;
				}, 1000);
			},
			closePreloadAd: function(section){
				$(section).unbind('click');
				$(section).bind('click', function(){
					$('#preload-ad').remove();
				});
			},
			remove: function(section){
				/*$(section).find('div[data-ad]').empty();*/
			}
		};
	},
	rate: function(){
		return {
			id: 'games_voted_list',
			to: function(star){
				$('#ratings .star').each(function(){
				   $(this).removeClass('selected');
				});
				$('#ratings .star[data-star="'+star+'"]').addClass('selected');
			},
			now: function(GAME){
				this.to(GAME.voted);
				var lastStar = $('#ratings .star.selected').data('star');
					$('#ratings .star').hover(function(){ 
						var star = $(this).data('star');
							$('#ratings .star').removeClass('selected');
							$('#ratings .star').each(function(i, s){
								var currentStar = $(s).data('star');
									if(currentStar <= star){
										$(s).addClass('selected');
									}
							});
					}, function(){
						$('#ratings .star').removeClass('selected');
						$('#ratings .star').each(function(i, s){
							var currentStar = $(s).data('star');
								if(currentStar <= lastStar){
									$(s).addClass('selected');
								}
						});
					});
					$('#ratings .star').one('click', function(){			
						if(App.rate().has(GAME.id) == false){
							var star = $(this).data('star'),
								_csrfToken = $('meta[name="csrf-token"]').attr('content'),
								_this = this;

								/* Show when user start vote */
								$('.vote-status').show().text(trans.you_are_voting);

								/* Call to RESTful API */
								$.post(settings.baseUrl + 'api/games/'+ GAME.id, {action: 'voting', star: star, star_counter: GAME.star_counter, star_user: GAME.star_user, '_token': _csrfToken, '_method': 'PUT'}, function(voted){
									if(voted && voted > 0){ 
										/* Apply to HTML */
										$('#game_voted').html('<i style="color:red">'+voted+'</i>');

										/* Change style */
										App.rate().to(voted);

										/* Show thanks tooltip */
										$('.vote-status').text(trans.thank_for_voted);

										/* Hide tooltip */
										setTimeout(function(){ $('.vote-status').hide(); }, 2000);
										
										/* Update voted to clinet database */
										FSG.DB.table('games').get(function(games){
											for(var i in games){
												if(games[i].u != undefined){
													if(games[i].u == GAME.slug){
														games[i].voted = voted;
														break;
													}
												}
											}
										});
									}
								});
						}else{
							$('.vote-status').show().text(trans.alert_voted);
							setTimeout(function(){ $('.vote-status').hide(); }, 1000);
						}
					});
			},
			has: function(gameSlug){
				var lastGameId = FSG.COOKIE.get(this.id);
					if(lastGameId && lastGameId.indexOf(gameSlug + '|') != -1){
						return true;
					}else{
						FSG.COOKIE.set(this.id, lastGameId + gameSlug + '|', 7);
						console.log('Voted: ', gameSlug);
					}
					return false;
			}
		};
	},
	played: function(){
		return {
			limit: 40,
			expired: 7,
			cookieId: 'last_played_list',
			add: function(gameSlug){
				var lastPlayedList = this.truncate(FSG.COOKIE.get(this.cookieId, true));
					if(lastPlayedList.indexOf(','+ gameSlug) == -1){
						lastPlayedList += ','+gameSlug;
					}else{
						lastPlayedList = lastPlayedList.replace(','+gameSlug, '') + ',' + gameSlug;
					}
					FSG.COOKIE.set(this.cookieId, lastPlayedList, this.expired, true);
					console.log('Last played added: [', gameSlug, '] '+lastPlayedList);
					return this;
			},
			truncate: function(cookie, n){
				var limit = (typeof n != 'undefined') ? n : this.limit,
					lastPlayedList = this.trim(cookie, ','),
					arrayLastPlayed = lastPlayedList.split(',');
					if(arrayLastPlayed.length > limit){
						var shortArrayPlayed = arrayLastPlayed.reverse().slice(0, limit);
						return shortArrayPlayed.reverse().join(',');
					}
					return cookie;
			},
			trim: function(cookie){
				return cookie.replace(/^\,+|\,+$/gi, '');
			},
			toArray: function(order){
				var lastPlayedList = this.trim(FSG.COOKIE.get(this.cookieId, true), ','),
					arrayLastPlayed = lastPlayedList.split(',');
					if(typeof order != 'undefined' && order.toLowerCase() == 'ASC'){
						return arrayLastPlayed;
					}else{
						return arrayLastPlayed.reverse();
					}
			}
		};
	},
	view: function(){
		return {
			getFrameId: function(){
				return $('#iframe_container');
			},
			alertBox: function(){
				$('.alert-dont-show-agian').click(function(){
					$('.alert-wrapper').hide();
					FSG.COOKIE.set('dont_show_again', 'yes', 1, true);
				});
				$('.alert-close').click(function(){
					$('.alert-wrapper').hide();
				});
			},
			elementIsVisibleInViewport: function(el, partiallyVisible) {
				var partiallyVisible = (typeof partiallyVisible == 'undefined') ? false : true;
				let rect = el.getBoundingClientRect(),
					windowHeight = (window.innerHeight || document.documentElement.clientHeight);
				let percentVisible = 100;	
					if(partiallyVisible){
						percentVisible = 0;
					};
					return !(
						Math.floor(100 - (((rect.top >= 0 ? 0 : rect.top) / +-rect.height) * 100)) < percentVisible ||
						Math.floor(100 - ((rect.bottom - windowHeight) / rect.height) * 100) < percentVisible
					);
			},
			createSearchBox: function(){
				$('#search').submit(function(){
					var keyword = $(this).find('input[type="text"]:first').val();
					var value = $.trim( keyword ),
						categorySlug = '';
						if(value != '' && value != 'undefined'){
							categorySlug = App.str().slug(value);
							if(categorySlug == '-'){
								location.href = settings.localeBaseUrl + value;	
							}else{
								location.href = settings.localeBaseUrl + categorySlug;
							};
						};
						if(value == 'undefined'){
							location.href = settings.localeBaseUrl + keyword;
						};
						return false;
				});
			},
			setPlayerFrame: function(srcUrl){
				var prentFrameId = App.view().getFrameId().parent(),
					dataSrc = App.view().getFrameId().attr('data-src'),
					dataStyle = App.view().getFrameId().attr('data-style');
					prentFrameId.find('#iframe_container').remove();
				var setDataSrc = (typeof dataSrc != 'undefined' && dataSrc) ? ' data-src="'+ dataSrc +'"' : '',
				    setDataStyle = (typeof dataStyle != 'undefined' && dataStyle) ? ' style="'+ dataStyle +'"' : '';	
					prentFrameId.prepend('<iframe title="FSG Player Box" id="iframe_container"'+setDataStyle+' src="'+ srcUrl +'"'+ setDataSrc +' width="100%" height="100%" scrolling="no" frameborder="0" marginheight="0" marginwidth="0" webkitAllowFullScreen="yes" mozallowfullscreen="yes" allowFullScreen="yes"></iframe>');
			},
			reloadGame: function(){				
				/* Reload Game */
				$('.more-tool-reload').unbind('click');
				$('.more-tool-reload').bind('click', function(){
					if(confirm(trans.are_you_sure)){
						var lastSrc = App.view().getFrameId().attr('src');
							if(typeof lastSrc != 'undefined' && lastSrc){
								App.view().setPlayerFrame(lastSrc);	
							}
					}
				});
				setTimeout(function(){
					$('.player-tooltip').removeClass('tooltip-alway-show');
				}, 5000);
			},
			convertControls: function(){
				var controls = $('#controls').html();
					if(typeof controls != 'undefined' && controls){				
							/*controls = controls.replace(/(\n+|\<br\/?\>)/gi, '    ');*/
							controls = controls.replace(/HACKED\sKEYS?\s?\:?/gi, 'HACKS');
							controls = controls.replace(/KEY\sHACKS?\s?\:?/gi, 'HACKS');
							/* Player 1, player 2*/
							controls = controls.replace(/^PLAYER\s([\d]{1})\s?\:/gi, '<b class="w3-tag w3-blue w3-round w3-text-black">PLAYER \$1</b>\n');
							controls = controls.replace(/\sPLAYER\s([\d]{1})\s?\:/gi, '\n\n<b class="w3-tag w3-blue w3-round w3-text-black">PLAYER \$1</b>\n');
							/* 1 player and 2 player ...*/
							controls = controls.replace(/^([\d]{1})\sPLAYER\s?\:/gi, '<b class="w3-tag w3-blue w3-round w3-text-black">\$1 PLAYER</b>\n');
							controls = controls.replace(/\s([\d]{1})\sPLAYER\s?\:/gi, '\n\n<b class="w3-tag w3-blue w3-round w3-text-black">\$1 PLAYER</b>\n');

							controls = controls.replace(/^HACKED\s?\:?/gi, '<b class="w3-tag w3-red w3-round w3-text-black">HACKS</b>\n');
							controls = controls.replace(/\sHACKED\s?\:?/gi, '\n\n<b class="w3-tag w3-red w3-round w3-text-black">HACKS</b>\n');

							controls = controls.replace(/^HACKS?\s?\:?/gi, '<b class="w3-tag w3-red w3-round w3-text-black">HACKS</b>\n');
							controls = controls.replace(/\sHACKS?\s?\:?/gi, '\n\n<b class="w3-tag w3-red w3-round w3-text-black">HACKS</b>\n');

						var arrayControls = controls.split('\n'),
							result=null,
							resultKeyEvent=null,
							resultMouseEvent=null;
						var leftKey = App.detect().mobile() ? '&larr;' : '🠜',
							upKey = App.detect().mobile() ? '&uarr;' : '🠝',
							rightKey = App.detect().mobile() ? '&rarr;' : '🠞',
							downKey = App.detect().mobile() ? '&darr;' : '🠟';
							if(typeof arrayControls != 'undefined' && arrayControls.length > 0){
								$.each(arrayControls, function(index, keyCode){
									if(keyCode){			
										/* Keys event */

										/*if(/[^\s]+\s?(\,|or|and)\s?[^\s]+\skeys?\s?(to)?/ig.test(keyCode) && keyCode.toLowerCase().indexOf('keyboard') == -1){
											resultWithMulti = keyCode.match(/([^\s]+\s?(\,|or|and))\s?[^\s]+\skeys?\s?(?:to)?/);					
											resultWithMulti.shift();
											resultMultiKeyEvent = resultWithMulti;
										};*/

										if(/[^\s]+\skeys?\s?(to)?/ig.test(keyCode) && keyCode.toLowerCase().indexOf('keyboard') == -1){
											resultKeyEvent = keyCode.match(/[^\s]+\skeys?\s?(to)?/ig);
											/*if(resultMultiKeyEvent != null){
												resultKeyEvent = resultKeyEvent.concat(resultMultiKeyEvent);
											}	*/			
										};
										/* Mouse event */
										if(/(left|up|right|down|use)\smouse/ig.test(keyCode)){
											resultMouseEvent = keyCode.match(/(left|up|right|down|use)\smouse/ig);												
										}else if(/mouse\swheel\s/ig.test(keyCode)){
											resultMouseEvent = keyCode.match(/mouse\swheel/ig);												
										};
										/* Merge two arrays */
										if(resultKeyEvent != null && resultMouseEvent != null){
											result = resultKeyEvent.concat(resultMouseEvent);
										}else if(resultKeyEvent != null){
											result = resultKeyEvent;
										}else if(resultMouseEvent != null){
											result = resultMouseEvent;
										};
										/* Proccess result */
										if(result && Array.isArray(result) && result.length > 0){
											$.each(result, function(i, controlKey){												
												var keySlug = App.str().slug( controlKey.replace(/(\,|or|and)/i, '').replace(/\skeys?/gi, '') ).replace('-to', ''),
													textControls = (controlKey.toUpperCase().replace(/\skeys?\s?(to)?/gi, '')),
													spaceKey = '';
													if(controlKey.toLowerCase().indexOf(' to') == -1){
														spaceKey = ' ';
													};
													if(keySlug == 'arrow' || keySlug == 'arrows'){
														/* Arrow keys */
														controls = controls.replace(controlKey, '<span class="controls"><section><span>'+upKey+'</span><span>'+leftKey+'</span><span>'+downKey+'</span><span>'+rightKey+'</span></section></span>'+ spaceKey);
													}else if(keySlug == 'left'){
														controls = controls.replace(controlKey, '<span class="controls arrow-key-single"><section><span>'+leftKey+'</span></section></span>'+ spaceKey);

													}else if(keySlug == 'up'){
														controls = controls.replace(controlKey, '<span class="controls arrow-key-single"><section><span>'+upKey+'</span></section></span>'+ spaceKey);

													}else if(keySlug == 'right'){
														controls = controls.replace(controlKey, '<span class="controls arrow-key-single"><section><span>'+rightKey+'</span></section></span>'+ spaceKey);

													}else if(keySlug == 'down'){
														controls = controls.replace(controlKey, '<span class="controls arrow-key-single"><section><span>'+downKey+'</span></section></span>'+ spaceKey);

													}else if(keySlug == 'wasd'){
														/* WASD keys */
														controls = controls.replace(controlKey, '<span class="controls"><section><span>W</span><span>A</span><span>S</span><span>D</span></section></span>'+ spaceKey);
													}else if(keySlug.length == 4 && keySlug.toLowerCase() != 'ctrl' && keySlug.toLowerCase() != 'home'){	
														let keys = keySlug.split('');
														let multiKeyHTML = '<span class="controls"><section>';
															for(let xy in keys){
																multiKeyHTML += '<span>'+ keys[xy].toUpperCase() +'</span>';
															};
															multiKeyHTML += '</section></span>' + spaceKey;
															controls = controls.replace(controlKey, multiKeyHTML);

													}else if(keySlug == 'space' || keySlug == 'spacebar'){	
														controls = controls.replace(controlKey, '<span class="controls only-keyboard"><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span>'+ spaceKey);
													}else if(keySlug == 'left-mouse'){
														/* MOUSE */
														controls = controls.replace(controlKey, '<div class="controls only-mouse"><div class="mouse"><div class="left actived"></div><div class="right"></div></div></div>');
													}else if(keySlug == 'right-mouse'){
														/* MOUSE */
														controls = controls.replace(controlKey, '<div class="controls only-mouse"><div class="mouse"><div class="left"></div><div class="right actived"></div></div></div>');
													}else if(keySlug == 'mouse-wheel'){
														/* MOUSE */
														controls = controls.replace(controlKey, '<div class="controls only-mouse"><div class="mouse"><div class="left"></div><div class="wheel"></div><div class="right"></div></div></div>');
													}else if(keySlug == 'use-mouse'){
														/* MOUSE */
														controls = controls.replace(controlKey, '<div class="controls only-mouse"><div class="mouse"><div class="left"></div><div class="right"></div></div></div>');
													}else{
														controls = controls.replace(controlKey, '<span class="controls only-keyboard"><span>'+ textControls +'</span></span>'+ spaceKey);
													};
											});
										};
									}
								});	
							};
							if(result){
								$('#controls').html(controls);
								$('.quick-controls-box').html('<div class="quick-controls-box-middle">'+ controls.replace(/(\n+|\<br\/?\>)/gi, '    ') + '</div>');
								App.view().showQuickControlsBox();
								App.view().fitQuickControls(true);			
							}else{
								$('.quick-controls-box').empty();
							};
					};

			},
			fitQuickControls: function(next){
				var playboxToolbarWidth = $('.play-tool-box').width(),
					gameNameWidth = App.str().getTextWidth('.game-name'),
					quickControlsBoxWidth = $('.quick-controls-box-middle').outerWidth(true),
					rightEmulatoBoxWidth = $('.emulator-box').outerWidth(true);	
				var expandedQCtrl = function(max){
						if(typeof max != 'undefined' && max == true){
							$('.controls-box')
								.css({left: 5, right: 5, background: 'black', 'border-left': '1px solid transparent'})
								.find('.controls-box-close')
									.css({background: 'black'});
						}else{
							$('.controls-box')
								.css({left: 5, right: 175, background: 'black', 'border-left': '1px solid transparent'})
								.find('.controls-box-close')
									.css({background: 'black'});
						};			
					};
				var collapsedQCtrl = function(){
						var gameNameWidth = App.str().getTextWidth('.game-name');
							if(gameNameWidth > 5 && (App.jqGetWidth() - gameNameWidth) > 500){
								var backgroundColor = (FSG.COOKIE.get('player_is_wide') == 'on') ? 'rgba(0,0,0,0.2)' : 'black';
									$('.controls-box')
										.css({left: gameNameWidth + 20, right: 175, background: backgroundColor, 'border-left': '6px solid transparent'})
										.find('.controls-box-close')
											.css({background: backgroundColor});
							};
					};
					if(quickControlsBoxWidth < (playboxToolbarWidth - (gameNameWidth + rightEmulatoBoxWidth))){
						collapsedQCtrl();
					}else if(quickControlsBoxWidth < (playboxToolbarWidth - rightEmulatoBoxWidth)){
						expandedQCtrl();
					}else{
						expandedQCtrl(true);
					};
					
					if(typeof next != 'undefined' && next == true){
						setTimeout(function(){ App.view().fitQuickControls(); }, 500);
					};
			},
			showQuickControlsBox: function(){
				setTimeout(function(){
					if($('.quick-controls-box').attr('data-hidden') != 'yes' && !App.detect().mobile()){
						$('#controls-box').css({'margin-top': 0});
						setTimeout(function(){ App.view().marqueuControlKeys(); }, 500);
					};
				}, 3000);
				$('.controls-box-close').click(function(){
					$('.quick-controls-box').attr('data-hidden', 'yes');
				});
			},
			marqueuControlKeys: function(){
				var isDirecting = false,
					controlsId = $('.controls-box .scrollbar-white'),
					conltrolsWidth = controlsId.find('.quick-controls-box-middle').outerWidth(true);
					controlsId.animate({scrollLeft: conltrolsWidth - controlsId.width()}, {
						duration: 10000,
						specialEasing: {
						  width: "linear",
						  height: "easeOutBounce"
						},
						step: function(/* now, fx */) {
							var currentPos = controlsId.scrollLeft() + controlsId.outerWidth(true);
								if(currentPos >= conltrolsWidth){ 
									controlsId.stop();
									setTimeout(function(){
										controlsId.animate({scrollLeft: 0}, {
											duration: 1000,
											step: function(){
												isDirecting = true;
											},
											complete: function(){
												isDirecting = false;
											}
										});
									}, 300);
								};
								isDirecting = true;
								
						},
						complete: function(){
							controlsId.stop();
							setTimeout(function(){
								controlsId.animate({scrollLeft: 0}, {
									duration: 1000,
									step: function(){
										isDirecting = true;
									},
									complete: function(){
										isDirecting = false;
									}
								}); 
							}, 300);
						}
					});
					
					controlsId.on('touchmove touchstart', function(){
						controlsId.stop();
					});
			},
			clearOtherGames: function(){
				/* Reset height */
				$('#other_games, #more_games').css({height: 'auto'});
				var offsetOtherGames = $('#other_games').offset();
					if(typeof offsetOtherGames == 'undefined') { return; };
					let bottomOtherGames = offsetOtherGames.top +  $('#other_games').outerHeight(true);
					var offsetMoreGames = $('#more_games').offset(),
						bottomMoreGames = offsetMoreGames.top +  $('#more_games').outerHeight(true);
						if(bottomMoreGames < bottomOtherGames){
							var overHeight = bottomOtherGames - bottomMoreGames,
								realOtherGamesHeight = $('#other_games').height() - (overHeight + 145);
							var gripItemHeight = $('#other_games').find('.grip-item:first').outerHeight(true),
								gripItemRows = Math.floor(realOtherGamesHeight/gripItemHeight),
								realGripItemHeight = (gripItemRows * gripItemHeight) + 50;
								if(realGripItemHeight > 60){
									$('#other_games')
										.addClass('scrollbar-white')
										.css({height: realGripItemHeight, 'overflow-y': "auto", 'overflow-x': 'hidden', 'direction':'rtl', 'text-align': 'left'});
								}else{
									$('#other_games')
										.addClass('scrollbar-white')
										.css({height: (gripItemHeight * 2)  + 50, 'overflow-y': "auto", 'overflow-x': 'hidden', 'direction':'rtl', 'text-align': 'left'});
								};
						}else{
							$('#other_games').css({height: 'auto', 'direction':'ltr'});
						};
			},
			createMobileLayout_iOS: function(img, stopGame, orientation, resize){
				App.gameImgMobi = ((typeof img != 'undefined' && App.gameImgMobi == null) || (typeof img != 'undefined' && App.gameImgMobi != null && img != App.gameImgMobi)) ? img : App.gameImgMobi;
				if(App.detect().iOS()/* || App.detect().localhost()*/){
					if(App.view().getFrameId().attr('src') && App.view().getFrameId().attr('src') != App.frameBlank){
						App.view().getFrameId().attr('data-src', App.view().getFrameId().attr('src'));
						App.view().getFrameId().attr('data-style', App.view().getFrameId().attr('style'));
						
						if(typeof stopGame != 'undefined' && stopGame == true){
							App.view().setPlayerFrame(App.frameBlank);
						};
					};
					if(App.fullscreen().isMax()){ /* When mobile is full-scren */ 
						$('.mobile-overplaybox').remove();
						if(orientation == 'landscape' || typeof orientation == 'undefined'){
							App.view().getFrameId().after('<a class="mobile-logo-btn mobile-logo-btn-landscape">&#x2715 Back</a>');
						}else{
							App.view().getFrameId().after('<a class="mobile-logo-btn">&#x2715 Back</a>');
						};
						/* Exit full-screen mode */
						$('.mobile-logo-btn').click(function(){
							App.fullscreen().cancel(function(){ $('.mobile-logo-btn').remove(); }, App.gameImgMobi);
						});
						/* Restart game */
						if(App.view().getFrameId().attr('src') == App.frameBlank || (App.view().getFrameId().attr('src') != App.view().getFrameId().attr('data-src') && typeof resize == 'undefined') ){
							App.view().setPlayerFrame( App.view().getFrameId().attr('data-src') );
						};

    					App.playerID.cssImportant({		
    						width: 'auto',				
    						height: App.jqGetHeight() + 'px',
    						maxHeight: '10000px',
    						position: 'fixed', 
    						left:0, top: 0, right:0, bottom:0, 
    						'z-index': 9999999, 
    						background: 'black'
    					});
						App.view().getFrameId().css({height: '100%', width: '100%'});	
						
					}else{	
						if(typeof ($('.mobile-overplaybox').get(0)) == 'undefined'){
							try{
								let gameName = App.str().ucwords(App.str().unslug(document.URL.split('/').pop().replace(/\.html/gi, '')));
								let	imgCode = (typeof App.gameImgMobi == 'undefined') 
									? '<img alt="Default Image" src="' + settings.publicUrl +'images/flash.jpg" width="106" height="106">' 
									: '<img alt="'+ gameName +'" src="' + App.gameImgMobi +'" width="106" height="106">';
								let icounter = 1;	
								let icheck = setInterval(function(){
									if(typeof App.view().getFrameId() != "undefined"){											
										App.view().getFrameId().after('<div class="mobile-overplaybox"><div class="mobile-content">'+imgCode+'<button class="playnow">'+ trans.play_now +'</button></div></div>');
										
										/* Active fullscreen */
										$('.playnow').click(function(){
											App.fullscreen().request( App.playerID.get(0) );
										});
										clearInterval(icheck);
									}
									if(icounter > 10){
										clearInterval(icheck);
									}
									icounter++;

								}, 100);
							
							/* Show error on log */		
							}catch(e){
								console.lg(e);
							};
						};
					};
				};
				return true;
			}
		};
	},
	message: function(){
		return {
			get: function(callbackFunc){
				var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent",
					eventer = window[eventMethod],
					messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";

				/* Listen to message from child window */
				eventer(messageEvent,function(e) {
					var key = e.message ? "message" : "data",
						data = e[key];
						/* Call function */
						callbackFunc(data);	
					/* run function */
				}, false);
			},
			post: function(message, permission, iframeId){
				var permission = (typeof permission != 'undefined' && permission != '') ? permission : '*';
					if(typeof iframeId != 'undefined'){
						iframeId.contentWindow.postMessage(message, permission);
					}else{
						window.parent.postMessage(message, permission);
					}	
					
			}
		};
	},
	testEmulators: function(){
		return {
			uploadPathRecently: '',
			targetFile: '',	
			init: function(){
				var _this = this;
					/* Click to select */
					$('#choose-file, #playing').click(function(){ $('#file').click(); });
					$('#file').change(function(e){
						_this.targetFile = e.target.files[0].name;
						var nBytes = e.target.files[0].size;
						var sOutput = nBytes + " bytes";
						/* optional code for multiples approximation */
						const aMultiples = ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
							for (nMultiple = 0, nApprox = nBytes / 1024; nApprox > 1; nApprox /= 1024, nMultiple++) {
								sOutput = nApprox.toFixed(3) + " " + aMultiples[nMultiple] + " (" + nBytes + " bytes)";
							};
						var ext = _this.targetFile.split('.').pop();
							if(ext.toLowerCase() == 'swf'){
								$('#choose-file').val( _this.targetFile );
								$('#emulators-file-upload button[type="submit"]').prop('disabled', false);
								$('#playing').css('border', '0');
								$('#playing').html('<b style="font:Bold 20px/30px Arial;padding:10px;position:absolute;left:50%;top:50%;transform:translate(-50%, -50%)">'+ _this.targetFile +'<i style="display:block;font:12px/30px Arial">'+ sOutput +'</i></b>');
							}else{
								$('#playing').html('<b style="font:Bold 20px/30px Arial;padding:10px;position:absolute;left:50%;top:50%;transform:translate(-50%, -50%)">Only accepted files with the extension .swf!</b>');
								$('#emulators-file-upload button[type="submit"]').prop('disabled', true);
							};
					});
					/* Select a other emulator */
					$('.select-emulator').change(function(){
						var emulator = $(this).val();
							if(emulator && _this.uploadPathRecently != ''){
								$('#playing').html('<iframe title="FSG Player Box" src="'+ _this.uploadPathRecently + '&emulator='+ emulator + '" width="100%" height="100%"></iframe>');
							}
					});
					$('#emulators-file-upload').submit(function(e) {
						e.preventDefault();
						if( !_this.targetFile ) { alert('Please choose your file...'); return; }
						$('#choose-file').val( _this.targetFile );
						$('.select-emulator').prop('disabled', true);
						/* Warning when leave site */
						App.WarningLeave();
						var formData = new FormData(this);
							$('#playing').html('<b style="font:Bold 20px/30px Arial;padding:10px;position:absolute;left:50%;top:50%;transform:translate(-50%, -50%)">'+ trans.uploading +'</b>');
							/* Setup ajax */						
							$.ajaxSetup({
								headers: {
								'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
								},
								superCache: false,
								cache: false
							});
							$.ajax({
								type:'POST',
								url: settings.baseUrl + 'upload/emulators',
								data: formData,
								cache:false,
								contentType: false,
								processData: false,
								success: (data) => {
									this.reset();
									if(data.file != undefined){
										var emulator = $('.select-emulator').find(":selected").val();
											_this.uploadPathRecently = settings.localeBaseUrl + 'embed/test/?file=' +data.file;
											$('#playing').html('<iframe title="FSG Player Box" src="'+ _this.uploadPathRecently + '&emulator='+ emulator + '" width="100%" height="100%"></iframe>');
									}
									console.log('File has been uploaded successfully');
									console.log(data);
									$('#last_file_uploaded').text('Uploaded: ' + _this.targetFile );
									_this.targetFile = '';
									$('#choose-file').val( _this.targetFile );
									$('.select-emulator').prop('disabled', false);
									/* Clear warning when leave site */
									App.clearWarningLeave();
								},
								error: function(data){
									console.log(data);
								}
							});				
						return false;
					});
					var adHeight = $('.emulator-ad-content').height();
						if(adHeight >= 600){
							App.AD().distributeAdTo('.emulator-ad-content', '300x600');
						}else{
							$.ajaxSetup({superCache: false, cache: false});
							$.get(settings.baseUrl + 'api/ads/unit/300x250', {}, function(result){
								App.AD().distributeAdTo('.emulator-ad-content', '300x250');
							});
						};
			}
		};
	},
    FSGModal: function(){
        $('.fsg_modal').each(function(index, modal){
            let prifix_cookie = 'no_show_again_10_',
                expired_cookie = 1; /* 1 ngay */
            let dataFirstShow = $(modal).attr('data-first-show'),
                modalId = $(this).attr('id');
            let lastShowAgain = FSG.COOKIE.get(prifix_cookie + modalId);
                /* Hien lan dau tien hoac duoc thiet lap */
                if((dataFirstShow == 'true' && !lastShowAgain) || (lastShowAgain && lastShowAgain == 'true')){
                    $(modal).show();
                }else{
                    $(modal).hide();   
                };
                $(modal).find('.fsg_close:first').click(function(){
                        dataShowAgain = $(this).attr('data-show-again');
                        if(modalId){
                            $('#'+ modalId).hide();     
                        };
                        if(dataShowAgain && dataShowAgain == 'true'){
							FSG.COOKIE.set(prifix_cookie + modalId, "true", expired_cookie);
                        }else{
                            FSG.COOKIE.set(prifix_cookie + modalId, "false", expired_cookie);
                        };
                    /* Kiem tra xem co cho hien thi tro lai khong */    
                });
        });
    }
};

$(document).ready(function(){ 
	App.init();
});

$(window).on('load', function(){
	App.AD().fillEmptyAd();
});

/* Active event when window resize */
$(window).resize(function(){
	App.slide().gripContent(true);
});