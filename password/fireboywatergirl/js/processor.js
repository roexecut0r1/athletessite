var Processor = {
	onHomepage: true,
	playPageId: null,
	playContentId: null,
	categoryPageId: null,
	categoryRecentGames: [],
	categoryRecentSlug: '',
	lastOrderby: '',
	title: trans.home_title,
	hastag:'',
	currentPage: $('div[data-current-page]'),
	gameBug: null,
	compomentPage:{
		home: '',
		category: '',
		play: ''
	},
	init: function(){
		Processor.NAV().init();
		if(App.detect().FSGBrowser()){
			Processor.hastag = 'fsg-browser-'+ App.getOSName();
		};
		
		if(window.location.pathname == '/'){
			Processor.lazyContent();
		};
		/*Processor.lazyContent();*/

		/* Load content when scrolling */
		$(window).scroll(function(){
			if(window.location.pathname == '/'){
				Processor.lazyContent();
			};
			Processor.footerContentLazy();
		});
	},
	lazyContent: function(callback){
		let _csrfToken = $('meta[name="csrf-token"]').attr('content');
			$('div[data-content-lazy]:visible').each(function(){
				let el = $(this).get(0);
					if(App.view().elementIsVisibleInViewport(el, true)){
						let dataValue = $(el).attr('data-content-lazy');
						let targetId = '#'+ $(el).attr('data-target');
							$(el).removeAttr('data-content-lazy');
							if(dataValue == 'last_played'){								
								Processor.homeController().reloadLastPlayed();
							}else{
								let getFilter = App.flash().getPlayable(),
								filterPlayable = (getFilter == 'emulator') ? 1 : '0,1';
									/* Get newest games */
									if(dataValue == 'new_games'){ 
										if(typeof FSG_STORE != 'undefined' && FSG_STORE.DATA.constructor === Array && FSG_STORE.DATA.length > 0){
											/* Recently games */
											FSG.DB.whereIn({a: filterPlayable}, undefined, FSG_STORE.DATA).orderBy('i', 'DESC').limit(0, 32).get(function(result){
												if(result && result.length > 0){
													Processor.homeController().pushHTMLtoHome(targetId, result);
												};
											}); 
										}else{
											$.ajaxSetup({superCache: true, cacheExpired: 60 * 24, cache: false});
											$.getJSON(settings.baseUrl + 'api/games', {playable: filterPlayable, sort: 'id:desc', num: 32, fields: 'name,slug,image,played,voted', status: 'PUBLISHED', '_token': _csrfToken}, function(result){
												if(result && typeof result.data != 'undefined'){
													Processor.homeController().pushHTMLtoHome(targetId, result.data);
												};
											});
										};
									
									/* Get popular tags */	
									}else if(dataValue == 'tags'){
										$.ajaxSetup({superCache: true, cacheExpired: 60 * 24 * 7, cache: false});
										$.getJSON(settings.baseUrl + 'api/categories', {type: 'tag', sort: 'viewed:desc', num: 50, fields: 'name,slug', published: 1, '_token': _csrfToken}, function(result){
											if(result && typeof result.data != 'undefined'){
												Processor.homeController().pushHTMLtoHome(targetId, result.data);
											};	
										});
									
									/* Get series, tag, PUBLISHED */	
									}else if(dataValue == 'categories'){
										$.ajaxSetup({superCache: true, cacheExpired: 60 * 24 * 7, cache: false});
										$.getJSON(settings.baseUrl + 'api/categories', {type: 'series,collection,PUBLISHED', sort: 'viewed:desc', num: 20, fields: 'name,slug,image', published: 1, featured: 1, '_token': _csrfToken}, function(result){
											if(result && typeof result.data != 'undefined'){
												Processor.homeController().pushHTMLtoHome(targetId, result.data);
											};
										});

									/* Get editor's picks games */	
									}else if(dataValue == 'editer_games'){
										$.ajaxSetup({superCache: true, cacheExpired: 60 * 24 * 7, cache: false});
										$.getJSON(settings.baseUrl + 'api/games', {fields: 'name,slug,image,featured_img,played,voted', playable: filterPlayable, featured: 1, status: 'PUBLISHED', num: 16, sort: 'played:desc', '_token': _csrfToken}, function(result){
											if(result && typeof result.data != 'undefined'){ 
												Processor.homeController().pushHTMLtoHome(targetId, result.data);
											};
										});

									/* Get all popular games */ 
									}else if(dataValue == 'all_games'){										
										if(typeof FSG_STORE != 'undefined' && FSG_STORE.DATA.constructor === Array && FSG_STORE.DATA.length > 0){
											/* All games */
											FSG.DB.whereIn({a: filterPlayable}, undefined, FSG_STORE.DATA).orderBy('p', 'DESC').limit(48, 48).get(function(result){
												if(result && result.length > 0){
													Processor.homeController().pushHTMLtoHome(targetId, result); 
												};
											});
										}else{
											$.ajaxSetup({superCache: true, cacheExpired: 60 * 24 * 7, cache: false});
											$.getJSON(settings.baseUrl + 'api/games', {fields: 'name,slug,image,played,voted', playable: filterPlayable, status: 'PUBLISHED', num: 48, page: 2, sort: 'played:desc', '_token': _csrfToken}, function(result){
												if(result && typeof result.data != 'undefined'){ 
													Processor.homeController().pushHTMLtoHome(targetId, result.data);
												};
											});
										};	
									};
						};
					};
			});
	},
	footerContentLazy: function(){
		var pushPartnerHTML = function(partnerData){
			let partnersHTML = '';	
				for(let s in partnerData){
					partnersHTML += '<a class="footer-list" href="'+ partnerData[s].link +'" target="'+ partnerData[s].target +'">'+ partnerData[s].anchor_text +'</a>';
				};
				$('#partners_list').html(partnersHTML);
		};
		var pushSocialHTML = function(socialData){			
			let socialsHTML = '';
				for(let s in socialData){
					socialsHTML += '<a class="footer-list" href="'+ socialData[s].link +'" target="_blank">'+ socialData[s].name +'</a>';
				};
				$('#socials_list').html(socialsHTML);	
		};

		/* Detect footer is visible  */
		if(App.view().elementIsVisibleInViewport($('#footer').get(0), true) && $('#footer').attr('data-filled') != 'yes'){
			let _csrfToken = $('meta[name="csrf-token"]').attr('content');
				/* Get Partners list */						
				$.ajaxSetup({superCache: true, cacheExpired: 60 * 24 * 365, cache: false});		
				$.getJSON(settings.baseUrl + 'api/partners', {actived: 1, sort: 'priority:desc', num: 5, '_token': _csrfToken}, function(result){
					if(result && typeof result.data != 'undefined'){ 
						pushPartnerHTML(result.data);
					};
				});

				/* Get socials list */
				$.ajaxSetup({superCache: true, cacheExpired: 60 * 24 * 365, cache: false});
				$.getJSON(settings.baseUrl + 'api/socials', {status: 1, '_token': _csrfToken}, function(result){
					if(result && typeof result.data != 'undefined'){ 
						pushSocialHTML(result.data);
					};
				});
				
				/* Confirm footer content loaded */
				$('#footer').attr('data-filled', 'yes');

		};
	},
	setMeta: function(type, gameName, playable, image){
		let typePage = (typeof type == 'undefined') ? 'games' : type;
		let gamePlayable = (typeof playable == 'undefined') ? false : true;
		let categoryImage = (typeof image == 'undefined') ? settings.publicUrl + 'images/flash-2.png' : image;
		let title = $('title'),
			description = $('meta[name="description"]'),
			ogTitle = $('meta[property="og:title"]'),
			ogDescription = $('meta[property="og:description"]'),
			ogUrl = $('meta[property="og:url"]'),
			ogImage = $('meta[property="og:image"]');
			if(typePage == 'games'){
				let originalTitle = (gamePlayable) ? trans.playable_title : trans.play_title;
				let playTitle = originalTitle.replace(/\:name/g, gameName).replace(/\:site/g, settings.siteName),
					playDesc = trans.play_desc.replace(/\:name/g, gameName).replace(/\:site/g, settings.siteName);
					/* Set data */
					title.html( playTitle );
					description.attr('content', playDesc );
					ogTitle.attr('content', playTitle );
					ogDescription.attr('content', playDesc );
					ogUrl.attr('content', document.URL );
					ogImage.attr('content', image);

			}else if(typePage == 'category'){
				let categoryTitle = trans.category_title.replace(/\:name/g, gameName).replace(/\:site/g, settings.siteName),
					categoryDesc = trans.category_desc.replace(/\:name/g, gameName).replace(/\:site/g, settings.siteName);

					title.html( categoryTitle );
					description.attr('content', categoryDesc );
					ogTitle.attr('content', categoryTitle );
					ogDescription.attr('content', categoryDesc );
					ogUrl.attr('content', document.URL );
					ogImage.attr('content', categoryImage);
			}else{
				title.html( trans.home_title );
				description.attr('content', trans.home_desc );
				ogTitle.attr('content', trans.home_title );
				ogDescription.attr('content', trans.home_desc );
				ogUrl.attr('content', document.URL );
				ogImage.attr('content', settings.baseUrl + 'public/images/thumbnail.jpg');
			};

	},
	updateAlert: function(){ /* Copy alert and assign to pages */
		var alertHTML = App.jqGetOuterHtml('.alert-wrapper');				
			Processor.playPageId = $('.play-page');
			Processor.playContentId = $('#content');
			Processor.categoryPageId = $('.category-page');
			if(Processor.playPageId.find('.alert-wrapper').get(0) == undefined && alertHTML && $('.alert-wrapper').is(':visible')){
				Processor.playPageId.prepend(alertHTML);
			};
			if(Processor.categoryPageId.find('.alert-wrapper').get(0) == undefined && alertHTML && $('.alert-wrapper').is(':visible')){
				Processor.categoryPageId.prepend(alertHTML);
			};
			App.playerID = $('.play-box');
			App.view().alertBox();
			return this;
		
	},
	NAV: function(){
		return {
			init: function(){
				/* Main menu */
				Processor.NAV().createQuickMenu();
			},
			setClientSearch:function(){
				$('#search').unbind('submit');
				$('#search').bind('submit', function(){ return false; });
				var pushResult = function(keyword){
						if(keyword == 'undefined'){
							return false;
						};
						if(typeof $('#search').find('.search_result_hidden').get(0) == 'undefined'){
							$('#search').append('<a class="w3-hide search_result_hidden" href="'+ settings.localeBaseUrl + keyword + '">'+ keyword +'</a>');	
						}else{
							$('#search').find('.search_result_hidden').attr({href: settings.localeBaseUrl + keyword}).html(keyword);
						};
						if(FSG.ROUTE.actived != false){
							//FSG.ROUTE.pushLinksToState('#search', true);					
						};
						$('.search_result_hidden').click();
					};
					$('#search input:first').bind('keyup', function(e){
						var keyboard = $.trim($(this).val());
							if(keyboard != ''){
								Processor.NAV().removeSearchValue();
							}else{
								$('.search-close-btn').hide();
							};
							if(e.which == 13){
									pushResult( App.str().slug(keyboard) );
							};
							return false;
					});
					$('#search input:last').click(function(){
						var searchValue = $.trim( $('#search input:first').val() ),
							searchSlug = App.str().slug( searchValue );
							if((searchSlug == '-' || searchSlug == '') && searchValue){
								location.href = settings.localeBaseUrl + searchValue;
							}else{
						 		pushResult( searchSlug );
							};
					});
				var hasValue = $('#search input:first').val();
					if(hasValue && hasValue.length > 0){
						Processor.NAV().removeSearchValue();
					};
			},
			removeSearchValue: function(){
				$('.search-close-btn').show().click(function(){ $('#search input:first').val(''); $('.search-close-btn').hide();$('#search input:first').focus(); });
			},
			createQuickMenu: function(type, cSlug){
				if(type == 'play'){
					/* Main tab */
					$('.quick-filter').html('<a href="'+settings.localeBaseUrl+'" class="default-btn w3-hide-small w3-hide-medium"><span class="left"></span><b class="center">'+ trans.home +'</b><span class="right"></span></a><a href="'+settings.localeBaseUrl+'" class="default-btn w3-hide-small w3-hide-medium actived"><span class="left"></span><b class="center">'+ trans.playing +'</b><span class="right"></span></a>');
					//FSG.ROUTE.pushLinksToState('.quick-filter', true);	
				}else{
					if(App.flash().installed()){
						if(cSlug == 'emulator'){
							$('.quick-filter').html('<a href="'+settings.localeBaseUrl+'" class="default-btn w3-hide-small w3-hide-medium" data-filter="for-you"><span class="left"></span><b class="center">'+ trans.all_games +'</b><span class="right"></span></a><a href="'+settings.localeBaseUrl+'emulator" class="default-btn w3-hide-small w3-hide-medium actived" data-filter="all-games"><span class="left"></span><b class="center">'+ trans.emulator_games +'</b><span class="right"></span></a>');
						}else{
							$('.quick-filter').html('<a href="'+settings.localeBaseUrl+'" class="default-btn w3-hide-small w3-hide-medium actived" data-filter="for-you"><span class="left"></span><b class="center">'+ trans.all_games +'</b><span class="right"></span></a><a href="'+settings.localeBaseUrl+'emulator" class="default-btn w3-hide-small w3-hide-medium" data-filter="all-games"><span class="left"></span><b class="center">'+ trans.emulator_games +'</b><span class="right"></span></a>');
						}
						//FSG.ROUTE.pushLinksToState('.quick-filter', true);
					}else{
						if(App.flash().getPlayable() == 'emulator'){
							$('.quick-filter').html('<a href="'+settings.localeBaseUrl+'" class="default-btn w3-hide-small w3-hide-medium actived" data-filter="for-you"><span class="left"></span><b class="center">'+ trans.for_you +'</b><span class="right"></span></a><a href="'+settings.localeBaseUrl+'" class="default-btn w3-hide-small w3-hide-medium" data-filter="all-games"><span class="left"></span><b class="center">'+ trans.all_games +'</b><span class="right"></span></a>');
						}else{
							$('.quick-filter').html('<a href="'+settings.localeBaseUrl+'" class="default-btn w3-hide-small w3-hide-medium" data-filter="for-you"><span class="left"></span><b class="center">'+ trans.for_you +'</b><span class="right"></span></a><a href="'+settings.localeBaseUrl+'" class="default-btn w3-hide-small w3-hide-medium actived" data-filter="all-games"><span class="left"></span><b class="center">'+ trans.all_games +'</b><span class="right"></span></a>');
						}
						App.flash().freshWebsite();
						App.flash().requestAllGames();
					}
					
				}
			},
			changeLogoTag: function(headerTag){
		        let lastHeaderStyle = $('#nav .nav-content .fs-logo').attr('style'),
		            lastHeaderClass = $('#nav .nav-content .fs-logo').attr('class'),
		            lastHeaderContent = $('#nav .nav-content .fs-logo').html();
    			    $('#nav .nav-content .fs-logo').remove();
		            /* Change to H2*/
    			    if(typeof headerTag == 'undefined'){
    			        $('#nav .nav-content').prepend('<h2 class="'+ lastHeaderClass +'" style="'+ lastHeaderStyle +'">'+ lastHeaderContent +'</h2>');
    			    /* Change to H1 */       
    			    }else{
    			        $('#nav .nav-content').prepend('<h1 class="'+ lastHeaderClass +'" style="'+ lastHeaderStyle +'">'+ lastHeaderContent +'</h1>');
    			    };
    			    //FSG.ROUTE.pushLinksToState('#nav .nav-content', true);
			}
		};
	},
	homeController: function(){
		return {
			init: function(GAMES){
				/* Set meta tag */
				Processor.setMeta('home');
				Processor.currentPage = $('div[data-current-page]');
                Processor.NAV().changeLogoTag('H1');    
				
				if(typeof $('#content .play-nav').get(0) != 'undefined'){
					$('#content .play-tool-box').remove();
					$('#content .play-nav').remove();
					$('#content .play-box').remove();
				};

				if(Processor.currentPage.attr('data-current-page') != 'home'){
					if(GAMES.length > 0 && GAMES.constructor === Array && typeof GAMES[0] != 'undefined'){
						if(Processor.currentPage.attr('data-current-page') == 'category'){
							Processor.currentPage.remove();
						};
						if(Processor.currentPage.attr('data-current-page') == 'play'){
							Processor.currentPage.remove();
						};

						$('.play-page, .category-page, .home-page').remove();
						$('#content').append(Processor.compomentPage.home);
						
						//FSG.ROUTE.pushLinksToState('.popular-tag', true);
							
						let dataFill = $('.home-page').attr('data-fill');
							if(dataFill != 'yes'){
								let filterPlayable = App.flash().getPlayable() == 'emulator' ? 1 : '0,1';
									/* Popular games */
									FSG.DB.whereIn({a: filterPlayable}, undefined, GAMES).limit(0, 48).get(function(result){
										if(result && result.length > 0){
											Processor.homeController().pushHTMLtoHome('#popular-box', result);
										};
									});

									/* Recently games */
									FSG.DB.whereIn({a: filterPlayable}, undefined, GAMES).orderBy('i', 'DESC').limit(0, 32).get(function(result){
										if(result && result.length > 0){
											Processor.homeController().pushHTMLtoHome('#recently-box', result);
										};
									});
									
									/* All games */
									FSG.DB.whereIn({a: filterPlayable}, undefined, GAMES).orderBy('p', 'DESC').limit(48, 48).get(function(result){
										if(result && result.length > 0){
											Processor.homeController().pushHTMLtoHome('#all-games', result); 
										};
									});

									/* Remember content loaded */
									$('.home-page').attr('data-fill', 'yes');
							};
							/* Last played */
							Processor.homeController().reloadLastPlayed(GAMES, '#wrap-last-played-client');

					}else{
						location.reload();
						return false;
					};
				}else{
					$('.play-page, .category-page, .home-page').remove();
					
					$('#content').append(Processor.compomentPage.home);
						
					//FSG.ROUTE.pushLinksToState('.popular-tag', true);

					$(window).scrollTop(0);

					Processor.homeController().reloadLastPlayed();
				};	
				
				/* Cancel fullscreen with IOS */
				if(App.detect().iOS()){
					App.fullscreen().cancel(undefined, App.playGameImg);
				};

				Processor.NAV().createQuickMenu();
				App.AD().fillEmptyAd();
				App.fullscreen().wideSize(false);

				if(Processor.onHomepage){
					$('.panel-scrollbar').get(0).style.scrollSnapType = 'none';
					$('.panel-scrollbar')
						.animate({scrollLeft: 0}, 'show', function(){						
							$(this).get(0).style.scrollSnapType = 'x mandatory';
						});
				};
				Processor.onHomepage = true;
				
				/* Main content */
				Processor.homeController().start(GAMES);
			},
			start: function(GAMES){	
				$('.home-page div[data-ad]').each(function(i, ad){
					var dataUnit = $(this).data('ad');
						App.AD().distributeAdTo(ad, dataUnit);
				});
				App.AD().remove('.play-page, .category-page');

			},
			reloadLastPlayed: function(GAMES, section){
				var section = (typeof section == 'undefined') ? '#wrapper_last_played' : section;
				var arrayLastPlayed = App.played().toArray();
				var pushHTML = function(games){
					let lastPlayedHTML = '', img = '';
						$.each(games, function(i, game){
							if(game != undefined){
								img = (game.image.indexOf('/flash.png') != -1)  ? (settings.publicUrl+'images/flash.png') : (settings.publicUrl + 'storage/' +game.image);
								lastPlayedHTML += '<div class="grip-item">';
								lastPlayedHTML += '<a href="'+settings.localeBaseUrl+ game.slug +'.html">';
								lastPlayedHTML += '<img alt="'+ game.name +'" class="item-img lazyload" src="'+settings.publicUrl+'images/flash.png" data-src="'+img+'" align="left"/>';
								lastPlayedHTML += '<b class="item-text">'+ game.name +'</b>';
								lastPlayedHTML += '<span class="item-category">'+ App.nFormatter(game.played, 1) +'</span>';
								lastPlayedHTML += '<span class="item-stars">'+game.voted +' ★</span>';
								lastPlayedHTML += '</a>';
								lastPlayedHTML += '</div>';
							}
						});
						$(section).show();
						$(section+ ' .grip-content').html(lastPlayedHTML);
						//FSG.ROUTE.pushLinksToState(section+ ' .grip-content', true);
						if('#wrapper_last_played' == 'section'){
							App.slide().gripContent(section, true);
						}else{
							App.slide().gripContent(section);
						};
				};
				if(typeof GAMES == 'undefined'){
					if(arrayLastPlayed.length > 0){						
						let idList = arrayLastPlayed.join(','),
							_csrfToken = $('meta[name="csrf-token"]').attr('content');
								$.ajaxSetup({superCache: true, cacheExpired: 30, cache: false});
								$.getJSON(settings.baseUrl + 'api/games', {fields: 'name,slug,image,voted,played', id: idList, '_token': _csrfToken}, function(result){
									if(result && typeof result.data == 'object'){
										pushHTML( result.data );
									};
								});
					};
				}else{					
					let result = [], counter = 0;
						FSG.DB.whereGt({i: 0}, undefined, GAMES).get(function(games){
							if(games && games.length > 0){
								$.each(games, function(key, val){
									var index = arrayLastPlayed.indexOf(val.i+'');
										if(index != -1 && counter < 32){
											result[index] = Processor.playController().convertItem(val);
											counter++;
										}
								});
								if(result.length > 0){ 
									pushHTML(result);										
								}else{
									$(section).hide();
								};
							}
						});
				};
			},
			pushHTMLtoHome: function(sectionId, result){
				var gameHtml = '';
					if('#collection-and-series' == sectionId){
						for(var i=0; i < result.length; i++){
							if(typeof result[i] != 'undefined'){
								let cateItem = result[i];
								let img = (cateItem.image.indexOf('/flash.png') != -1)  ? (settings.publicUrl+'images/flash.png') : (settings.publicUrl + 'storage/' + cateItem.image);
									gameHtml += '<a class="large-item" href="'+ settings.localeBaseUrl + cateItem.slug +'">';
									gameHtml += '<div class="large-img"><img alt="'+ cateItem.name +'" class="item-img lazyload" data-src="'+ img +'" src="'+settings.publicUrl+'images/flash-2.png"/>';
									gameHtml += '<b class="collections-name">'+ cateItem.name +'</b>';
									gameHtml += '</div>';
									gameHtml += '</a>';
							};
						};		
						$(sectionId).html(gameHtml);
						//FSG.ROUTE.pushLinksToState(sectionId, true);
						App.slide().largeContent('#wrap-'+ sectionId.replace('#', ''));
					}else if('#popular-tags' == sectionId){
						for(var i=0; i < result.length; i++){
							if(typeof result[i] != 'undefined'){
								gameHtml += '<a class="tag-btn" href="'+ settings.localeBaseUrl +  result[i].slug +'">'+  result[i].name +'</a>';
							};
						};		
						$(sectionId).html(gameHtml);
						//FSG.ROUTE.pushLinksToState(sectionId, true);
					}else if('#editer-games' == sectionId){
						for(var i=0; i < result.length; i++){
							if(typeof result[i] != 'undefined'){
								let gameItem = result[i];
									if(typeof gameItem.featured_img != undefined){
										let featured_img = (gameItem.featured_img && gameItem.featured_img.indexOf('/flash.png') != -1)  ? (settings.publicUrl+'images/flash-2.png') : (settings.publicUrl + 'storage/' + gameItem.featured_img);
										let img = (gameItem.image.indexOf('/flash.png') != -1)  ? (settings.publicUrl+'images/flash.png') : (settings.publicUrl + 'storage/' + gameItem.image);

											gameHtml += '<div class="large-item">';
											gameHtml += '<div class="large-img">';
											gameHtml += '<a href="'+ settings.localeBaseUrl + gameItem.slug +'.html"><img alt="'+ gameItem.name +'" class="item-img lazyload" data-src="'+ featured_img +'" src="'+settings.publicUrl+'images/flash-2.png"/></a>';
											gameHtml += '</div>';
											gameHtml += '<div class="grip-item">';
											gameHtml += '<a href="'+ settings.localeBaseUrl + gameItem.slug +'.html">';
											gameHtml += '<img alt="'+ gameItem.name +'" class="item-img lazyload" data-src="'+img+'" src="'+settings.publicUrl+'images/flash.png" align="left"/>';
											gameHtml += '<b class="item-text">'+ gameItem.name +'</b>';
											gameHtml += '<span class="item-category">'+ App.nFormatter(gameItem.played, 1) +'</span>';
											gameHtml += '<span class="item-stars">'+ gameItem.voted +' ★</span>';
											gameHtml += '</a>';
											gameHtml += '</div>';
											gameHtml += '</div>';
									}	
							};
						};
						$(sectionId).html(gameHtml);
						//FSG.ROUTE.pushLinksToState(sectionId, true);
						App.slide().largeContent('#wrap-'+ sectionId.replace('#', ''));
					}else if('#new-games' == sectionId){	
						for(var i=0; i < result.length; i++){
							if(typeof result[i] != 'undefined'){
								var gameItem = Processor.playController().convertItem(result[i]),
									img = (gameItem.image.indexOf('/flash.png') != -1)  ? (settings.publicUrl+'images/flash.png') : (settings.publicUrl + 'storage/' +gameItem.image);
									gameHtml += '<div class="grip-item">';
									gameHtml += '<a href="'+ settings.localeBaseUrl + gameItem.slug +'.html">';
									gameHtml += '<img alt="'+ gameItem.name +'" class="item-img fixed-img lazyload" data-src="'+ img +'" src="'+settings.publicUrl+'images/flash.png" align="left"/>';
									gameHtml += '<b class="item-text fixed-name">'+ gameItem.name +'</b>';
									gameHtml += '<span class="item-category">'+ App.nFormatter(gameItem.played, 1) +'</span>';
									gameHtml += '<span class="item-stars">'+ gameItem.voted +' ★ </span>';
									gameHtml += '</a>';
									gameHtml += '</div>';
							}	
						};
						$(sectionId).html(gameHtml);
						//FSG.ROUTE.pushLinksToState(sectionId, true);
						App.slide().gripContent('#wrap-'+ sectionId.replace('#', ''));
					}else{
						for(var i=0; i < result.length; i++){
							if(typeof result[i] != 'undefined'){
								var gameItem = Processor.playController().convertItem(result[i]),
									img = (gameItem.image.indexOf('/flash.png') != -1)  ? (settings.publicUrl+'images/flash.png') : (settings.publicUrl + 'storage/' +gameItem.image);
									gameHtml += '<div class="grip-item">';
									gameHtml += '<a href="'+ settings.localeBaseUrl + gameItem.slug +'.html">';
									gameHtml += '<img alt="'+ gameItem.name +'" class="item-img fixed-img lazyload" data-src="'+ img +'" src="'+settings.publicUrl+'images/flash.png" align="left"/>';
									gameHtml += '<b class="item-text fixed-name">'+ gameItem.name +'</b>';
									gameHtml += '<span class="item-category">'+ App.nFormatter(gameItem.played, 1) +'</span>';
									gameHtml += '<span class="item-stars">'+ gameItem.voted +' ★ </span>';
									gameHtml += '</a>';
									gameHtml += '</div>';
							}	
						};
						$(sectionId).html(gameHtml);
						if(typeof $(sectionId).get(0) != 'undefined'){
							//FSG.ROUTE.pushLinksToState(sectionId, true);
						};
						App.slide().gripContent('#wrap-'+ sectionId.replace('#', ''));
					};
					
			}
		};
	},
	categoryController: function(){
		return {
			init: function(categorySlug, orderBy, GAMES){
				Processor.currentPage = $('div[data-current-page]');
				$('.play-page, .home-page').remove();

				if(typeof $('#content .play-nav').get(0) != 'undefined'){
					$('#content .play-tool-box').remove();
					$('#content .play-nav').remove();
					$('#content .play-box').remove();
				};
                
                Processor.NAV().changeLogoTag();
                
				if(typeof $('#content .category-page').get(0) == 'undefined'){
					$('#content').append( Processor.compomentPage.category );
					Processor.categoryPageId = $('.category-page');
				};							

				if(Processor.currentPage.attr('data-current-page') == 'category'){
					Processor.currentPage.remove();
				};				
				if(Processor.currentPage.attr('data-current-page') == 'play'){
					Processor.currentPage.remove();
				};
				if(Processor.currentPage.attr('data-current-page') == 'home'){
					/* Processor.compomentPage.home = App.jqGetOuterHtml('div[data-current-page="home"]'); */
					Processor.currentPage.remove();
				};
				$(window).scrollTop(0);
				
				Processor.onHomepage = false;
				
				Processor.playPageId.find('.play-box').empty();

				if(App.detect().iOS()){
					App.fullscreen().cancel(undefined, App.playGameImg);
				};
				/* Menu */
				Processor.NAV().createQuickMenu('category', categorySlug);
				App.AD().fillEmptyAd();
				App.fullscreen().wideSize(false);
				
				/* Main content */
				Processor.categoryController().start(categorySlug, orderBy, GAMES);
			},
			start: function(categorySlug, orderBy, GAMES){
				var categoryName = App.str().ucwords(App.str().unslug(categorySlug));					
					if(Processor.categoryPageId.find('.grip-panel .panel-title').get(0) != undefined){
						Processor.categoryPageId.find('.grip-panel .panel-title').remove();
					}	
					Processor.categoryPageId.find('.grip-panel').prepend('<h1 class="panel-title">'+ categoryName +' Games</h1>');
					if(typeof $('.order-by-box').get() != 'undefined'){
						$('.order-by-box').remove();
					};
					if(categorySlug != 'recent' && categorySlug != 'newest' && categorySlug != 'popular' && categorySlug != 'rated'){
						var orderByHTML = '<div class="order-by-box"><a data-orderby="popular" href="'+ settings.baseUrl + categorySlug +'/popular">'+ trans.orderby_popular +'</a>';
							orderByHTML += '<a data-orderby="newest" href="'+ settings.baseUrl + categorySlug +'/newest">'+ trans.orderby_newest +'</a>';
							orderByHTML += '<a data-orderby="rated" href="'+ settings.baseUrl + categorySlug +'/rated">'+ trans.orderby_rated +'</a></div>';

							Processor.categoryPageId.find('.grip-panel .panel-title').after(orderByHTML);
							//FSG.ROUTE.pushLinksToState('.order-by-box', true);	
							/* Unselect */
							Processor.categoryPageId.find('.grip-panel a[data-orderby]').removeClass('order-by-actived');
							/*  Focus */
							Processor.categoryPageId.find('.grip-panel a[data-orderby="'+ orderBy +'"]').addClass('order-by-actived');					
					};	
					Processor.setMeta('category', categoryName);
					
					/* if(Processor.categoryRecentSlug != categorySlug || Processor.lastOrderby != orderBy){ */
						/* String filter by category */
						let where = {t: ','+categorySlug+',', u: categorySlug}, filterPlayable;

							/* Reset last games of category */
							Processor.categoryRecentGames = [];

							/* String filter by playable */
							if(App.flash().getPlayableByCategory(categorySlug) == 'emulator'){ 
								filterPlayable = {a: 1}; 
							}else { 
								filterPlayable = {t: '0,1'}; 
							};
							if(orderBy == 'popular'){
								FSG.DB.table(GAMES).whereLike(where).whereIn(filterPlayable).orderBy('p', 'DESC').get(function(result){
									if(result && result.length > 0){
										Processor.categoryController().pushHTMLtoCategory(result);						
										/* backup data */		
										if(result.length > 99){
											Processor.categoryRecentGames = result;
										}
									}else{
										Processor.categoryController().categoryNotFound(categorySlug);
									};
								});
							}else if(orderBy == 'newest'){
								FSG.DB.table(GAMES).whereLike(where).whereIn(filterPlayable).orderBy('i', 'DESC').get(function(result){
									if(result && result.length > 0){
										Processor.categoryController().pushHTMLtoCategory(result);						
										/* backup data */		
										if(result.length > 99){
											Processor.categoryRecentGames = result;
										};
									}else{
										Processor.categoryController().categoryNotFound(categorySlug);
									};
								});	
							}else if(orderBy == 'rated'){
								FSG.DB.table(GAMES).whereLike(where).whereIn(filterPlayable).orderBy('v', 'DESC').get(function(result){
									if(result && result.length > 0){
										Processor.categoryController().pushHTMLtoCategory(result);						
										/* backup data */		
										if(result.length > 99){
											Processor.categoryRecentGames = result;
										}
									}else{
										Processor.categoryController().categoryNotFound(categorySlug);
									};
								});
							}else{
								FSG.DB.table(GAMES).whereLike(where).whereIn(filterPlayable).priority({fields: ['u'], value: categorySlug}).get(function(result){
									if(result && result.length > 0){
										Processor.categoryController().pushHTMLtoCategory(result);						
										/* backup data */		
										if(result.length > 99){
											Processor.categoryRecentGames = result;
										}
									}else{
										Processor.categoryController().categoryNotFound(categorySlug);
									};
								});
							}
					/* }; */
					Processor.categoryRecentSlug = categorySlug;
					Processor.lastOrderby = orderBy;
					$('.category-page div[data-ad]').each(function(i, ad){
						var dataUnit = $(this).data('ad');
							App.AD().distributeAdTo(ad, dataUnit);
					});
					App.AD().remove('.play-page, .home-page');
					
					/* Load more games */
					Processor.categoryController().moreGames();
			},
			moreGames: function(){
				var lastScrolltop = 0;
					$(window).scroll(function(){
						if($('.category-page').is(":visible")){
							if(($(window).scrollTop() + $(window).height()) > $(document).height() * (80/100) && lastScrolltop < $(window).scrollTop()) {
								var lastItemLength = Processor.categoryPageId.find('.grip-item').length - 1;
									if(Processor.categoryRecentGames.length > 0 && Processor.categoryRecentGames.length > lastItemLength){
										Processor.categoryController().pushHTMLtoCategory(Processor.categoryRecentGames, lastItemLength, 100, true);
									};
									console.log('Current games: ', lastItemLength);
							}
						}
						lastScrolltop = $(window).scrollTop();
					});
			},
			pushHTMLtoCategory: function(result, offset, take, append){
				var gameHtml = '';
					if(typeof take == 'undefined' && typeof offset == 'undefined'){
						offset = 0;
						take = 100;
					}else if(typeof take == 'undefined' && typeof offset != 'undefined'){
						take = offset;
						offset = 0;
					}else{
						take = offset + take;
					};
					for(var i=offset; i<take; i++){
						if(typeof result[i] != 'undefined'){
							var gameItem = result[i],
								img = (gameItem.m.indexOf('/flash.png') != -1)  ? (settings.publicUrl+'images/flash.png') : (settings.publicUrl + 'storage/' +gameItem.m);
								gameHtml += '<div class="grip-item">';
								gameHtml += '<a href="'+ settings.localeBaseUrl + gameItem.u +'.html">';
								gameHtml += '<img alt="'+ gameItem.n +'" class="item-img fixed-img lazyload" data-src="'+ img +'" src="'+settings.publicUrl+'images/flash.png" align="left"/>';
								gameHtml += '<b class="item-text fixed-name">'+ gameItem.n +'</b>';
								gameHtml += '<span class="item-category">'+ App.nFormatter(gameItem.p, 1) +'</span>';
								gameHtml += '<span class="item-stars">'+ gameItem.v +' ★ </span>';
								gameHtml += '</a>';
								gameHtml += '</div>';
						}	
					};
					if(append == true){
						$('#category_item_list').append(gameHtml);
					}else{
						$('#category_item_list').html(gameHtml);
					}
					//FSG.ROUTE.pushLinksToState('#category_item_list', true);
					App.slide().gripContent('.category-page');
					
			},
			categoryNotFound: function(categorySlug){
				FSG.DB.table('games').whereLike({u: categorySlug}).orderBy({p: 'DESC', a: 'ASC'}).get(function(games){
					if(games && games.length > 0){
						Processor.categoryController().pushHTMLtoCategory(games);
						/* backup data */		
						if(games.length > 99){
							Processor.categoryRecentGames = games;
						}
					}else{					
						var notfoundHtml = '<div style="font:Bold 12px/20px Arial;color:rgba(255,255,255,0.6);display:block;margin:60px 10px;background:rgba(255,255,255,0.3);border-radius:5px;padding:10px">';
							notfoundHtml += '<h3>No results found!</h3>';
							notfoundHtml += '<br />Or some games may be hidden on this device. Because this device does not support or does not have Adobe Flash Player installed.';
							notfoundHtml += '<br />';
							notfoundHtml += '<button class="default-btn playnow" style="width:180px" data-filter="all-games">Try show all games</button>';
							notfoundHtml += '<br class="clear-all"/>';
							notfoundHtml += '</div>';					
							$('#category_item_list').html(notfoundHtml);
							App.flash().requestAllGames();
					}			
				});
			}
		};
	},
	playController: function(){
		return {
			init: function(gameSlug, GAMES){
				Processor.currentPage = $('div[data-current-page]');
				$('.home-page, .category-page').remove();
                
                Processor.NAV().changeLogoTag();
                
				if(typeof $('#content .play-page').get(0) == 'undefined'){
					$('#content').append( Processor.compomentPage.play );
					Processor.playPageId = $('.play-page');
					App.playerID = $('.play-box');
				};

				if(Processor.currentPage.attr('data-current-page') == 'play'){		
					Processor.currentPage.remove();			
				
					if($('#content .play-box').length > 1){
						$('#content .play-tool-box:eq(1)').remove();
						$('#content .play-nav:eq(1)').remove();
						$('#content .play-box:eq(1)').remove();
					};
				};				
				if(Processor.currentPage.attr('data-current-page') == 'category'){
					Processor.currentPage.remove();
				};
				if(Processor.currentPage.attr('data-current-page') == 'home'){
					/* Processor.compomentPage.home = App.jqGetOuterHtml('div[data-current-page="home"]'); */
					Processor.currentPage.remove();
				};
					
				$(window).scrollTop(0);

				/* Use caching */
				if($('.play-page').attr('last-played') == gameSlug){
					Processor.playController().createEmbedCode(gameSlug);
					App.view().createMobileLayout_iOS(App.playGameImg, true, App.gameOrientation);
					Processor.setMeta('games', App.str().ucwords(App.str().unslug(gameSlug)));
					return true;
				};
				
				/* Hide quick controls box */
				$('#controls-box').css({'margin-top': '100%'});
				Processor.categoryRecentGames = [];
				Processor.onHomepage = false;
				/* Setup Menu */
				Processor.NAV().createQuickMenu('play');
				/* Ad */
				App.AD().fillEmptyAd();
				App.fullscreen().wideSize(false);

				/* Show quick control keys box */
				$('.quick-controls-box').attr('data-hidden', 'no');
				
				/* Rest emulators */
				Processor.playPageId.find('.more-info-box').hide();
				Processor.playPageId.find('.para-emulator .pactived').removeClass('pactived');
				
				/* Set logo text */
				Processor.playPageId.find('.play-nav-link').html(settings.logoText);
				
				/* Remove last name */
				if(Processor.playPageId.find('.play-nav-name').get(0) != undefined){
					Processor.playPageId.find('.play-nav-name').remove();
				};
				Processor.playController().start(gameSlug, GAMES);
				if(App.detect().FSGBrowser()){
					App.message().post('GAME_ID::'+gameSlug);
				};
			},
			start: function(gameSlug, GAMES){		
				var gameName = App.str().ucwords(App.str().unslug(gameSlug));
					/* Assgin embed code */
					Processor.playController().createEmbedCode(gameSlug);
					
					/* Label and title */					
					Processor.playContentId.find('.play-nav-arrow').after('<h1 class="play-nav-name">'+ gameName +'</h1>');
					Processor.playContentId.find('.game-name').html( gameName );
					
					$('title').html(trans.play_title.replace(/\:name/g, gameName).replace(/\:site/g, settings.siteName));				
					
					/* AD */	
					$('.play-page div[data-ad]').each(function(i, ad){
						var dataUnit = $(this).data('ad');
							App.AD().distributeAdTo(ad, dataUnit, gameSlug);
					});
					
					/* Remove outer AD */
					App.AD().remove('.home-page, .category-page');
					
					if(GAMES.length > 0 && GAMES.constructor === Array){
						/* Get data and find game */
						FSG.DB.table(GAMES).where({u: gameSlug}).first(function(GAME){
							if(typeof GAME != 'undefined' && GAME != null){							
								if(Processor.playContentId.find('.play-nav-name').get(0) != undefined){
									Processor.playContentId.find('.play-nav-name').remove();
								};
								Processor.playContentId.find('.play-nav-arrow').after('<h1 class="play-nav-name">'+GAME.n+'</h1>');							
								Processor.playContentId.find('.game-name').html(GAME.n);

								Processor.playPageId.find('#views').text(GAME.p);
								if(GAME.a == 1){ /* If game is playable */
									$('title').html(trans.playable_title.replace(/\:name/g, GAME.n).replace(/\:site/g, settings.siteName));
								};
								Processor.playPageId.find('#game_voted').text(GAME.v);
															
								App.rate().to(GAME.v);
								
								/* Create tag list */
								Processor.playController().createTags(gameSlug, GAME);
								
								/* Set default value */
								Processor.playPageId.find('#description p').html( trans.share_to_friends.replace(/\:name/g, GAME.n) );
								Processor.playPageId.find('#controls').html( trans.use_mouse_or_keyboard );
								
								
								/* Get more data */
								Processor.playController().getMoreData(GAME, 0);
								console.log('Get client DATA: ', gameSlug);
							}else{
								/*location.reload();*/
								Processor.playController().getMoreData({u: gameSlug, n: App.str().unslug(gameSlug)}, 1);
								console.log('NO client DATA: ', gameSlug);
							}
						});
					}else{
						Processor.playController().getMoreData({u: gameSlug, n: App.str().unslug(gameSlug)}, 1);
						console.log('NO client DATA: ', gameSlug);
					};

					/* Attach event to reload button */
					App.view().reloadGame();
					/* Detect and turn on wide screen */
					App.fullscreen().detectPlayerWide();
							
					$('.play-page').attr('last-played', gameSlug);
			},
			getMoreData: function(GAME, getMoreData){
				var _csrfToken = $('meta[name="csrf-token"]').attr('content');

					/* Ajax nocache */
					$.ajaxSetup({superCache: true, cacheExpired: 60 * 24 * 7, cache: false});

					/* Get game data */
					$.getJSON(settings.baseUrl+ 'api/get/other/games/'+ GAME.u, {'_token': _csrfToken, get_more_data: getMoreData}, function(res){
						if(res){ 
							/* Add link full to frame */
							if(typeof $('.playbox__layer').get(0) != 'undefined'){
								let moreQuery = encodeURI(JSON.stringify({
									'id' 		: res.game.id,
									'name' 		: (typeof(res.game.name) != 'undefined' && res.game.name) ? res.game.name : null,
									'slug' 		: (typeof(res.game.slug) != 'undefined' && res.game.slug) ? res.game.slug : null,
									'file' 		: (typeof(res.game.file) != 'undefined' && res.game.file) ? res.game.file : null,
									'alt_file' 	: (typeof(res.game.alt_file) != 'undefined' && res.game.alt_file) ? res.game.alt_file : null,
									'alt_game' 	: (typeof(res.game.alt_game) != 'undefined' && res.game.alt_game) ? res.game.alt_game : null,
									'width' 	: (typeof(res.game.width) != 'undefined' && res.game.width) ? res.game.width : 640,
									'height' 	: (typeof(res.game.height) != 'undefined' && res.game.height) ? res.game.height : 480,
									'extension' : (typeof(res.game.extension) != 'undefined' && res.game.extension) ? res.game.extension : null,
									'flashversion' : (typeof(res.game.flashversion) != 'undefined' && res.game.flashversion) ? res.game.flashversion : null,
									'image' 	: (typeof(res.game.image) != 'undefined' && res.game.image) ? res.game.image : null,
									'playable'	: (typeof(res.game.playable) != 'undefined' && res.game.playable) ? res.game.playable : 0,
									'resizable' : (typeof(res.game.resizable) != 'undefined' && res.game.resizable) ? res.game.resizable : 0,
									'avm' 		: (typeof(res.game.avm) != 'undefined' && res.game.avm) ? res.game.avm : 0,
									'flashvars' : (typeof(res.game.flashvars) != 'undefined' && res.game.flashvars) ? res.game.flashvars : null,
									'emulator' 	: (typeof(res.game.emulator) != 'undefined' && res.game.emulator) ? res.game.emulator : null,
									'orientation': (typeof(res.game.alt_file) != 'undefined' && res.game.alt_file) ? res.game.alt_file : null,
									'embed_options': (typeof(res.game.embed_options) != 'undefined' && res.game.embed_options) ? res.game.embed_options : null,
									'name_mvkb' :  (typeof(res.game.name_mvkb) != 'undefined' && res.game.name_mvkb) ? res.game.name_mvkb : null,
									'style_mvkb': (typeof(res.game.style_mvkb) != 'undefined' && res.game.style_mvkb) ? res.game.style_mvkb : null,
									'left_mvkb': (typeof(res.game.left_mvkb) != 'undefined' && res.game.left_mvkb) ? res.game.left_mvkb : null,
									'right_mvkb': (typeof(res.game.right_mvkb) != 'undefined' && res.game.right_mvkb) ? res.game.right_mvkb : null,
									'category_slug': (typeof(res.game.category_slug) != 'undefined' && res.game.category_slug) ? res.game.category_slug : null,
									'created_at' : (typeof(res.game.created_at) != 'undefined' && res.game.created_at) ? res.game.created_at : null,
									'updated_at' :  (typeof(res.game.updated_at) != 'undefined' && res.game.updated_at) ? res.game.updated_at : null,
									'star_user' :  (typeof(res.game.star_user) != 'undefined' && res.game.star_user) ? res.game.star_user : null
								}));								
								
								/* Add frame src */	
								let lastFrameSrc = $('.playbox__layer').attr('data-frame-src');
									if(typeof lastFrameSrc != 'undefined' && lastFrameSrc){
										if(lastFrameSrc.indexOf('?') == -1){
											$('.playbox__layer').attr('data-frame-src', lastFrameSrc + '?game=' + moreQuery);
										}else{
											$('.playbox__layer').attr('data-frame-src', lastFrameSrc + '&game=' + moreQuery);
										};
									};

								/* Remove playbox layout */
								if(res.game.emulator == 'flashplayer' || res.game.emulator == 'supernova'){
									$('.playbox__layer .w3-button').click();
								};
							};

							/* Reset tags */
							if(typeof getMoreData != 'undefined' && getMoreData == 1){
								Processor.playController().createTags(GAME.u, {t: res.tags, g: ''}, res.related_games);
							};
							/* Header tag */
							if(Processor.playContentId.find('.play-nav-name').get(0) != undefined){
								Processor.playContentId.find('.play-nav-name').remove();
							};
							Processor.playContentId.find('.play-nav-arrow').after('<h1 class="play-nav-name">'+res.game.name+'</h1>');							
							Processor.playContentId.find('.game-name').html(res.game.name);
							/* Title website */
							
							App.playGameImg = settings.publicUrl + 'storage/'+res.game.image;
							Processor.setMeta('games', res.game.name, res.game.playable, App.playGameImg);

							if(res.game.description != undefined && res.game.description){	
								var descNONTag = App.str().stripTags(res.game.description);							
									if(descNONTag.length > 300){
										Processor.playPageId.find('#description').html('<details><summary style="cursor:pointer"></summary><p></p></details>');
										Processor.playPageId.find('#description p').html(res.game.description);
										Processor.playPageId.find('#description summary').html( App.str().truncate(descNONTag, 150, '.|?|!|,|:| |/|...') );
									}else{
										Processor.playPageId.find('#description').html(res.game.description);
									};
							}else{
								Processor.playPageId.find('#description').html( trans.share_to_friends.replace(/\:name/g, GAME.n) );
							}
							if(res.game.controls != undefined && res.game.controls){
								Processor.playPageId.find('#controls').html(res.game.controls);
							};
							/* Convert controls to graphic */
							App.view().convertControls();

							if(res.game.voted){
								App.rate().to(res.game.voted);
							};
							Processor.playPageId.find('#width').text(res.game.width);
							Processor.playPageId.find('#height').text(res.game.height);
							Processor.playPageId.find('#size').text(App.bytesToSize(res.game.size));
							Processor.playPageId.find('#downloads').text(res.game.downloaded);
							Processor.playPageId.find('#extension').text(res.game.extension);
							if(res.game.extension.toLowerCase() == 'direct'){
								if(res.game.alt_file){
									location.href = res.game.alt_file;
								}
							}else if(res.game.extension.toLowerCase() == 'swf' || res.game.extension.toLowerCase() == 'unity3d' || res.game.extension.toLowerCase() == 'dcr') {
								Processor.playPageId.find('#download').parents('.more-info-box').show();
								Processor.playPageId.find('#download').html('<a class="tag-btn tag-actived" href="'+settings.baseUrl+'download/'+GAME.u+'" target="_blank">'+ GAME.u +'.'+ res.game.extension.toLowerCase() +'</a><br class="clear-left" />');
							}else{
								Processor.playPageId.find('#download').parents('.more-info-box').remove();
							}					
							Processor.playController().showEmulators(res.game);
							
							/* Vote action */
							App.rate().now(res.game);

							/* add last played */
							App.played().add(res.game.id);

							/* Cache orientation */
							App.gameOrientation = res.game.orientation;

							/* Create pre-load of iOS */
							App.view().createMobileLayout_iOS(App.playGameImg, true, App.gameOrientation);

							/* Save game bug */
							Processor.gameBug = res.game.bug;

							$('#game_bug').click(function(){
								/* Show game bugs */
								Processor.playController().showGameBugs();
							});						
							
							/* Clear height of other games  */
							App.view().clearOtherGames();
							setTimeout(function(){ App.view().clearOtherGames(); }, 3000);
						}
					});
			},
			createTags: function(gameSlug, GAME, relatedGames){
				try{
					if(GAME.t != ''){
						var tags = GAME.t.replace(/^\,+|\,+$/g,"").split(','),
							htmlTag = '',
							lastTag = [];
							for(var i in tags){
								if(tags[i] != '' && typeof (tags[i]) != 'function' && lastTag.indexOf(tags[i]) == -1){
									htmlTag += '<a class="tag-btn" href="'+ settings.localeBaseUrl + tags[i] +'">'+ App.str().ucwords(App.str().unslug(tags[i])) +'</a>';
									lastTag.push(tags[i]);
								}
							};
							htmlTag += '<br class="clear-left" />';
							Processor.playPageId.find('#tag_list').html(htmlTag);
							//FSG.ROUTE.pushLinksToState('#tag_list', true);
						
						/* Get related games */
						if(typeof relatedGames != 'undefined' && relatedGames.length > 0 && relatedGames.constructor === Array){
							Processor.playController().createRelatedBox(relatedGames);
						}else{
							Processor.playController().getRelatedGames(gameSlug, GAME.g, tags[0], 32, function(relatedGames){
								Processor.playController().createRelatedBox(relatedGames);
							});
						};							
					};
				}catch(e){
					console.log(e);
				};
			},
			getRelatedGames: function(gameSlug, rg /* related games */, tags, n, callback){
				FSG.DB.table('games').get(function(data){
					var result = [],
						counter = 0,
						related_games = rg + '',
						gamesListed = [];
						if(typeof related_games != 'undefined' && related_games != ''){
							try{
								var rgArr = (related_games.indexOf(',') != -1) ? related_games.split(',') : [related_games];
									$.each(data, function(index, game){
										if(rgArr.indexOf(game.i + '') != -1 && game.u != gameSlug){
											result.push(game);
											gamesListed.push(game.i);
											counter++;
										}
									});
							}catch(e){
								console.log('Related game error: ', e);
							}
						};
						if(result.length < n && typeof tags != 'undefined' && tags != ''){
							$.each(data, function(index, game){
								if((game.t).indexOf(','+tags + ',') != -1 && counter < n && game.u != gameSlug && gamesListed.indexOf(game.i) == -1){
									result.push(game);
									gamesListed.push(game.i);
									counter++;
								}
							});
						}
						if(result.length < n){
							var limit = n - result.length,
								randGames = Processor.playController().getRandom(data, limit);
								if(typeof randGames != 'undefined' && Array.isArray(randGames) && randGames.length > 0){
									result = result.concat(randGames);
								}
						};				
						callback(result);
				});
			},
			getRandom: function(arr, n) {
				var result = new Array(n),
					len = arr.length,
					taken = new Array(len);
				if (n > len)
					throw new RangeError("getRandom: more elements taken than available");
				while (n--) {
					var x = Math.floor(Math.random() * len);
					result[n] = arr[x in taken ? taken[x] : x];
					taken[x] = --len in taken ? taken[len] : len;
				}
				return result;
			},
			createRelatedBox: function(related_games){
				/* Related games */
				var oneHTML = '', twoHTML = '', thirdHTML = '';
					if($('.right-box').is(":visible") == false){
						for(var i=0; i<related_games.length; i++){
							if(related_games[i] != undefined){
								var gameItem = Processor.playController().convertItem(related_games[i]),
									grayScale = (gameItem.playable != 1 && App.flash().getPlayable() == 'emulator') ? ' w3-grayscale-max' : '',
									img = (gameItem.image.indexOf('/flash.png') != -1)  ? (settings.publicUrl+'images/flash.png') : (settings.publicUrl + 'storage/' +gameItem.image);
									thirdHTML += '<div class="grip-item">';
									thirdHTML += '<a href="'+ settings.localeBaseUrl + gameItem.slug +'.html">';
									thirdHTML += '<img alt="'+ gameItem.name +'" class="item-img fixed-img lazyload'+grayScale+'" data-src="'+ img +'" src="'+settings.publicUrl+'images/flash.png" align="left"/>';
									thirdHTML += '<b class="item-text fixed-name">'+ gameItem.name +'</b>';
									thirdHTML += '<span class="item-category">'+ App.nFormatter(gameItem.played, 1) +'</span>';
									thirdHTML += '<span class="item-stars">'+ gameItem.voted +' ★ </span>';
									thirdHTML += '</a>';
									thirdHTML += '</div>';
							}	
						};
						Processor.playPageId.find('#related_games_third').html(thirdHTML);
						//FSG.ROUTE.pushLinksToState('#related_games_third', true);
					}else{	
						if(related_games != undefined && related_games.length > 0){
							for(var i=0; i<5; i++){
								if(related_games[i] != undefined){
									var gameItem = Processor.playController().convertItem(related_games[i]),
										grayScale = (gameItem.playable != 1 && App.flash().getPlayable() == 'emulator') ? ' w3-grayscale-max' : '',
										img = (gameItem.image.indexOf('/flash.png') != -1)  ? (settings.publicUrl+'images/flash.png') : (settings.publicUrl + 'storage/' +gameItem.image);
										oneHTML += '<a class="related-item" href="'+ settings.localeBaseUrl + gameItem.slug +'.html">';
										oneHTML += '<img alt="'+ gameItem.name +'" class="item-img fixed-img lazyload'+grayScale+'" data-src="'+ img +'" src="'+settings.publicUrl+'images/flash.png"/>';
										oneHTML += '<span class="item-tooltip fixed-name"><i class="tooltip-arrow"></i>'+ gameItem.name +'</span>';
										oneHTML += '</a>';
								}	
							};
							
							for(var i=5; i<17; i++){
								if(related_games[i] != undefined){
									var gameItem = Processor.playController().convertItem(related_games[i]),
										grayScale = (gameItem.playable != 1 && App.flash().getPlayable() == 'emulator') ? ' w3-grayscale-max' : '',
										img = (gameItem.image.indexOf('/flash.png') != -1)  ? (settings.publicUrl+'images/flash.png') : (settings.publicUrl + 'storage/' +gameItem.image);
										twoHTML += '<div class="grip-item">';
										twoHTML += '<a href="'+ settings.localeBaseUrl + gameItem.slug +'.html">';
										twoHTML += '<img alt="'+ gameItem.name +'" class="item-img fixed-img lazyload'+grayScale+'" data-src="'+ img +'" src="'+settings.publicUrl+'images/flash.png" align="left"/>';
										twoHTML += '<b class="item-text fixed-name">'+ gameItem.name +'</b>';
										twoHTML += '<span class="item-category">'+ App.nFormatter(gameItem.played, 1) +'</span>';
										twoHTML += '<span class="item-stars">'+ gameItem.voted +' ★ </span>';
										twoHTML += '</a>';
										twoHTML += '</div>';
								}	
							};
							
							for(var i=17; i<related_games.length; i++){
								if(related_games[i] != undefined){
									var gameItem = Processor.playController().convertItem(related_games[i]),
										grayScale = (gameItem.playable != 1 && App.flash().getPlayable() == 'emulator') ? ' w3-grayscale-max' : '',
										img = (gameItem.image.indexOf('/flash.png') != -1)  ? (settings.publicUrl+'images/flash.png') : (settings.publicUrl + 'storage/' +gameItem.image);
										thirdHTML += '<div class="grip-item">';
										thirdHTML += '<a href="'+ settings.localeBaseUrl + gameItem.slug +'.html">';
										thirdHTML += '<img alt="'+ gameItem.name +'" class="item-img fixed-img lazyload'+grayScale+'" data-src="'+ img +'" src="'+settings.publicUrl+'images/flash.png" align="left"/>';
										thirdHTML += '<b class="item-text fixed-name">'+ gameItem.name +'</b>';
										thirdHTML += '<span class="item-category">'+ App.nFormatter(gameItem.played, 1) +'</span>';
										thirdHTML += '<span class="item-stars">'+ gameItem.voted +' ★ </span>';
										thirdHTML += '</a>';
										thirdHTML += '</div>';
								}	
							};
							Processor.playPageId.find('#related_games_one').html(oneHTML);
							Processor.playPageId.find('#related_games_two').html(twoHTML);
							Processor.playPageId.find('#related_games_third').html(thirdHTML);
						
							/* Add links */
							//FSG.ROUTE.pushLinksToState('#related_games_one', true);
							//FSG.ROUTE.pushLinksToState('#related_games_two', true);
							//FSG.ROUTE.pushLinksToState('#related_games_third', true);
							

						};
					};
					App.slide().gripContent('.play-page');
			},
			convertItem:function(item){
				if(typeof item.name != 'undefined'){
					return item;
				}else{
					var newItem = {};
						newItem.name = item.n;
						newItem.playable = item.a;
						newItem.image = item.m;
						newItem.slug = item.u;
						newItem.played = item.p;
						newItem.voted = item.v;
						return newItem;
				}
			},
			createEmbedCode: function(gameSlug){
				var embedCode = '',
					playerLink = App.detect().mobile() ? 'player/' : 'embed/',
					srcUrl = (settings.localeBaseUrl + playerLink + gameSlug);
					if(App.flash().installed()){
						embedCode = '<iframe id="iframe_container" src="'+ srcUrl +'?emulator=ruffle&toolbar=false" width="100%" height="100%" scrolling="no" frameborder="0" marginheight="0" marginwidth="0" webkitAllowFullScreen="webkitAllowFullScreen" mozallowfullscreen="mozallowfullscreen" allowFullScreen="allowFullScreen" allowtransparency="true" style="background-color: transparent !important"></iframe>';
					}else{
						embedCode = '<iframe id="iframe_container" src="'+ srcUrl +'?toolbar=false" width="100%" height="100%" scrolling="no" frameborder="0" marginheight="0" marginwidth="0" webkitAllowFullScreen="webkitAllowFullScreen" mozallowfullscreen="mozallowfullscreen" allowFullScreen="allowFullScreen" allowtransparency="true" style="background-color: transparent !important"></iframe>';
					}

					/* Embed code added to play page */
					if(App.detect().mobile()){
						Processor.playPageId.find('.play-box').html(embedCode);
					}else{
						Processor.playPageId.find('.play-box').html('<div class="playbox__layer" data-frame-src="'+ srcUrl +'"><button class="w3-button w3-red w3-round-xxlarge">PLAY</button></div>');
						/* Clear playbox layout */
						Processor.playController().clearPlayboxLayout({emulator: ''});
					};

					/* Open ad before load game */
					App.AD().preloadAd();
			},
			clearPlayboxLayout: function(GAME){
					/* On mobile */
					if(App.detect().mobile() || GAME.emulator == 'flashplayer' || GAME.emulator == 'supernova' || GAME.extension == 'POPUP' || GAME.extension == '_blank' || GAME.extension == 'REDIRECT' || GAME.extension == 'UNITY3D' || GAME.extension == 'DCR' || GAME.extension == 'CODE' || GAME.extension == 'DEAD'){						
						let frameScr = $('.playbox__layer').attr('data-frame-src');
							$('.play-box').html('<iframe title="FSG Player" id="iframe_container" src="'+ frameScr +'" width="100%" height="100%" scrolling="no" frameborder="0" marginheight="0" marginwidth="0" webkitAllowFullScreen="on" mozallowfullscreen="on" allowFullScreen="on"></iframe>');
		
					/* On desktop */	
					}else{
						$('.playbox__layer .w3-button').click(function(){ 
							let frameScr = $('.playbox__layer').attr('data-frame-src');
								$('.play-box').html('<iframe title="FSG Player" id="iframe_container" src="'+ frameScr +'" width="100%" height="100%" scrolling="no" frameborder="0" marginheight="0" marginwidth="0" webkitAllowFullScreen="on" mozallowfullscreen="on" allowFullScreen="on"></iframe>');
						});
					};
			},
			showEmulators: function(game){				
				/* Assign Emulator to page */	
				var renderEmulatorHTML = function(game){
						let disabledText = (game.extension != "SWF" && game.extension != "DCR" && game.extension != "UNITY3D") ? ' disabled' : '',
							emulHTML = App.jqGetOuterHtml('.emulator-label') + '<label for="change_emulator">'+ trans.changeEmulator +'</label><select name="change-emulator" id="change_emulator"'+ disabledText+'><optgroup label="'+ trans.changeEmulator +'"></optgroup>';

							/* Render option tag  */
							$.each(settings.emulators, function(i, emul){
								var emulName = emul.name;
									if(App.flash().installed()){
										/* On flash browser (Ruffle default emulator )*/
										if(emul.slug == 'ruffle'){
											emulHTML += '<option value="'+emul.slug+'" selected>'+emulName+'</option>';
										}else{
											emulHTML += '<option value="'+emul.slug+'">'+emulName+'</option>';
										}
									}else{
										/* On modern browser */
										if(game.emulator == emul.slug){
											emulHTML += '<option value="'+emul.slug+'" selected>'+emulName+'</option>';
										}else{
											emulHTML += '<option value="'+emul.slug+'">'+emulName+'</option>';
										}
									}
									
							});
							emulHTML += '</select>';
							if(typeof $('#change_emulator').get(0) == 'undefined'){
								Processor.playContentId.find('.emulator-box').html(emulHTML);
							}else{
								Processor.playContentId.find('#change_emulator').html(emulHTML);								
							};
							
							/* Show more game info */					
							Processor.playPageId.find('.more-info-box').show();					

							/* Attach fullsreen mode event */
							App.fullscreen().attachToButton();

							/* Move fullscreen button */
							App.fullscreen().moveButton();
							
							/* Attach change emulator event for user */
							Processor.playController().changeEmulator(game.slug);
					};
					
					/* Detect emualator got yet? */
					if(settings.emulators.length <=2  || typeof settings.emulators == 'undefined'){
						if(settings.emulators.length == 2){
							settings.emulators = [];
						};
						/* Add default emulator */
						let emualatorName = '';
							if(game.emulator == 'ruffle'){
								emualatorName = 'Ruffle (Default)';
							}else if(game.emulator == 'avm2'){
								emualatorName = 'AVM2 Player';
							}else if(game.emulator == 'flashplayer'){
								emualatorName = 'FSG Flash Player';
							}else if(game.emulator == 'waflash'){
								emualatorName = 'WAFlash Player';
							}else if(game.emulator == 'awayfl'){
								emualatorName = 'AwayFL Player';
							}else{
								emualatorName = App.str().ucwords(game.emulator) + ' Player';
							}
							settings.emulators.push({
								name: emualatorName, slug: game.emulator
							});
							settings.emulators.push({
								name: '...'+ trans.loading +'...', slug: '0'
							}); 

							/* Render HTML*/
							renderEmulatorHTML(game);
					}else{
						renderEmulatorHTML(game);
					};	

					/* Show all emulators when click */
					$('#change_emulator').one('click', function(){	
						if(settings.emulators.length < 3){	
							let _csrfToken = $('meta[name="csrf-token"]').attr('content');
								settings.emulators = [];
								/* Get emulator list */
								$.ajaxSetup({superCache: true, cacheExpired: 60 * 24 * 30, cache: false});
								$.getJSON(settings.baseUrl + 'api/emulators', {fields: 'name,slug', sort: 'order:desc', status: 1, '_token': _csrfToken}, function(result){
									if(result && typeof result.data != 'undefined' && settings.emulators.length < 3){
										for(let eml in result.data){
											settings.emulators.push(result.data[eml]);
										};									
										renderEmulatorHTML(game);
									};
								});	
						};
					});				

					/* Show share box*/
					Processor.playController().shareItBox(game.slug);
			},
			changeEmulator: function(slug){
				$('#change_emulator').unbind('change');
				$('#change_emulator').change(function(){
					let emul = $(this).val();
						if(emul){
							let playerLink;
								if(typeof $('#iframe_container').attr('src') != 'undefined' && $('#iframe_container').attr('src')){
									playerLink = $('#iframe_container').attr('src');
								}else{
									playerLink = App.detect().mobile() ? 'player/' + slug : 'embed/' + slug;
								};
								/* If playbox layout existed */
								if(typeof($('.playbox__layer').get(0)) != 'undefined'){
									playerLink = (typeof $('.playbox__layer').attr('data-frame-src') != 'undefined' && $('.playbox__layer').attr('data-frame-src')) ? $('.playbox__layer').attr('data-frame-src') : playerLink;
								};
								/* Remove emulator parameter */
								if(playerLink.indexOf('emulator=') != -1){
									playerLink = playerLink.replace(/emulator\=[^\&]+/ig, 'emulator='+ emul);
								}else{
									if(playerLink.indexOf('?') == -1){
										playerLink = playerLink + '?emulator='+ emul;
									}else{
										playerLink = playerLink + '&emulator='+ emul;
									};
								};

								/* Remo toolbar parameter */
								if(playerLink.indexOf('toolbar=') != -1){
									playerLink = playerLink.replace(/toolbar\=[^\&]+/ig, 'toolbar=false');
								}else{
									if(playerLink.indexOf('?') == -1){
										playerLink = playerLink + '?toolbar=false';
									}else{
										playerLink = playerLink + '&toolbar=false';
									};
								};

								/* Add new src to playbox layout */
								if(typeof($('.playbox__layer').get(0)) != 'undefined'){
									$('.playbox__layer').attr('data-frame-src', playerLink);

								/* Add to src frame */	
								}else{
									App.view().setPlayerFrame(playerLink);
								};
						};
				});
			},
			showGameBugs: function(){			
				var assginBugsHTML= function(){
					let gameBugsHTML = '';
						$.each(settings.gameBugs, function(i, bug){
							if(bug.slug != ''){
								if(bug.slug == Processor.gameBug && Processor.gameBug != null){
									gameBugsHTML += '<label for="'+bug.slug+'" class="game-bugs-list disabled"><input id="'+bug.slug+'" name="game_bug[]" type="radio" disabled>'+bug.name+'</label>';
								}else{
									gameBugsHTML += '<label for="'+bug.slug+'" class="game-bugs-list"><input id="'+bug.slug+'" name="game_bug[]" type="radio">'+bug.name+'</label>';
								};
							};
						});

						/*Empty last content list*/
						$('.game-bugs-content-list').empty();

						/* Add bug list */
						$('.game-bugs-content-list').html(gameBugsHTML + '<div id="game_bug_feedback_wrapper"><br /><b>'+ trans.feedback +'</b><br /><textarea id="game_bug_feedback" class="game-bug-feedback" cols="50" rows="4"></textarea><br /></div>');

						/* Show bug picked by admin*/
						if(Processor.gameBug != null && Processor.gameBug){
							$.each(settings.gameBugs, function(i, bug){
								if(bug.slug == Processor.gameBug){
									$('.game-bugs-reported').html('<span class="warn warning"></span> <span>'+ bug.name+ '</span>').show();
									$('.game-bugs-box').show();
								};
							});
						}else{
							$('.game-bugs-reported').empty().hide();
						};
					};

					/* Show game bug */	 
					if(typeof settings.gameBugs == 'undefined' || settings.gameBugs.length < 1){
						let _csrfToken = $('meta[name="csrf-token"]').attr('content');
							$.ajaxSetup({superCache: true, cacheExpired: 60 * 24 * 30, cache: false});
							$.getJSON(settings.baseUrl+ 'api/bugs', {'_token': _csrfToken}, function(result){
								if(result && typeof result.data == 'object'){
									settings.gameBugs = [];
									for(let bg in result.data){
										settings.gameBugs.push(result.data[bg]);
									};									
									assginBugsHTML();
								};
							});
					}else{
						assginBugsHTML();
					};	
			},
			shareItBox: function(gameSlug){					
				let share_it_box = $('.share-it-box');
				let shareLocation = settings.baseUrl + 'player/' + gameSlug,
					shareEmbed = '&lt;iframe src=&quot;'+ shareLocation +'&quot; width=&quot;100%&quot; height=&quot;100%&quot; scrolling=&quot;no&quot; frameborder=&quot;0&quot; marginheight=&quot;0&quot; marginwidth=&quot;0&quot; allowfullscreen&gt;&lt;/iframe&gt;',
					shareFb = 'https://www.facebook.com/sharer/sharer.php?u='+ settings.baseUrl + gameSlug +'.html',
					shareTw = 'http://twitter.com/share?text='+ settings.baseUrl + gameSlug +'.html',
					shareLin = 'https://www.linkedin.com/shareArticle?mini=true&url='+ settings.baseUrl + gameSlug +'.html';
					/* Assign */
					share_it_box.find('input:first').val(shareLocation);
					share_it_box.find('textarea:first').html(shareEmbed);
					share_it_box.find('.share-it-list .fb').attr('href' ,shareFb);
					share_it_box.find('.share-it-list .tw').attr('href' ,shareTw);
					share_it_box.find('.share-it-list .lin').attr('href' ,shareLin);
					/* Attach event copy text to inputs */
					Processor.playController().attachCopyCommandToShareBox();
			},
			attachCopyCommandToShareBox: function(){
				$('.share-it-copy').click(function(){
					var target = $(this).attr('data-target');
						if(typeof target != 'undefined'){
							var targetVal = $('#' + target).val();
								if(targetVal && targetVal != trans.copied){
									App.copyToClipboard(targetVal, function(){
										$('#' + target).val(trans.copied);
										setTimeout(function(){ $('#' + target).val( targetVal ); }, 1000);
									});
								};
						};
				});
				$('#share_it').click(function(){
					if(typeof navigator.share != 'undefined'){ 
						navigator.share({
							title: document.title,
							url: document.URL	
						}).catch( console.error );
					}
				});
			},
			playPageLazyContent: function(gameUrl){
				let _csrfToken = $('meta[name="csrf-token"]').attr('content');
					$('#play div[data-play-content-lazy]:visible').each(function(){
						let el = $(this).get(0);
							if(App.view().elementIsVisibleInViewport(el, true)){
								let dataValue = $(el).attr('data-play-content-lazy'); 
									$(el).removeAttr('data-play-content-lazy');
									if(dataValue == 'game_tags'){
										let gameSlug = (typeof gameUrl != 'undefined') ? gameUrl : $(el).attr('data-game-slug');
										let lastTags = [];
											$(el).find('a.category').each(function(){
												lastTags.push( $(this).attr('href').split('/').pop() );
											});
											$.ajaxSetup({superCache: true, cacheExpired: 60 * 24 * 30, cache: false});
											$.getJSON(settings.baseUrl + 'api/categories', {fields: 'name,slug', game: gameSlug, status: 1, num: 30,sort: 'viewed:desc', '_token': _csrfToken}, function(result){
												if(result && typeof result.data != 'undefined'){ 
													let gameTagsHTML = '';
														for(let t in result.data){
															if(lastTags.indexOf(result.data[t].slug) == -1){
																gameTagsHTML += '<a class="tag-btn" href="'+ settings.baseUrl + result.data[t].slug +'">'+ result.data[t].name +'</a>';
															};
														};
														$(el).find('i.tag-loading').remove();
														$(el).find('a.category:last').after(gameTagsHTML);
														//FSG.ROUTE.pushLinksToState('#tag_list', true);
												};
											});
									};
							};
				});
			}
		};	
	}
};

/**
* MAIN Function 
* Connect to database
* Get template
*/

/**
* Initialize Home Script
*/
$(document).ready(function(){
	Processor.init();	
	/*		
	if(typeof $('.pagination').get(0) != 'undefined'){
		$('.pagination a').each(function(){
			$(this).attr('data-click-added', 'true');
		});
	};
	FSG_STORE = FSG.DB.table('games', 'alt-games');
	var componentUrl = (settings.lang != "en" && settings.lang) 
		? 'api/' + settings.lang + '/get/component/home' 
		: 'api/get/component/home';
		
		// Get the template
		
		FSG.VIEW.load('#content', componentUrl, '.play-page', function(){
				// Add compoment to cache
				Processor.compomentPage.home = App.jqGetOuterHtml('.home-page');
				Processor.compomentPage.category = App.jqGetOuterHtml('.category-page');
				Processor.compomentPage.play = App.jqGetOuterHtml('.play-page');
				// Remove all componment
				$('div[data-type-componment]').remove();

				// Client search box
				Processor.NAV().setClientSearch();
				
				 
				// JS FSG Route actived 
				// Options
				 
				FSG.ROUTE.init(true); 
				FSG.ROUTE.debug = false;
				FSG.ROUTE.hastag = Processor.hastag;
				FSG.ROUTE.analyticsCode = settings.analyticsCode;
				
				// Home Page Controller
				// FSG.ROUTE.get(URI, Callback, Parttern)
				
				FSG.ROUTE.get('/{{countryCode}}', function(){ Processor.homeController().init(FSG_STORE.DATA); }, {countryCode: '([a-z]{2})?'});
				
				
				// Play Page Controller 
				// FSG.ROUTE.get(URI, Callback, Parttern)
				
				FSG.ROUTE.get('/{{gameSlug}}.html', function(gameSlug){ Processor.playController().init(gameSlug, FSG_STORE.DATA); });
				FSG.ROUTE.get('/{{countryCode}}/{{gameSlug}}.html', function(gameSlug){ Processor.playController().init(gameSlug, FSG_STORE.DATA); }, {countryCode: '[a-z]{2}'});
				
				
				// Category Page Controller
				// FSG.ROUTE.get(URI, Callback, Parttern)
				
				FSG.ROUTE.get(
					'/{{categorySlug}}', 
					function(categorySlug){ 
						Processor.categoryController().init(categorySlug, 'popular', FSG_STORE.DATA); 
					}, 
					{categorySlug: '([^\.\/]+)'}
				);
				// With country code
				FSG.ROUTE.get(
					'/{{countryCode}}/{{categorySlug}}', 
					function(categorySlug){ 
						Processor.categoryController().init(categorySlug, 'popular', FSG_STORE.DATA); 
					}, 
					{countryCode: '[a-z]{2}',  categorySlug: '([^\.]+)'}
				);
				
				// With orderby
				FSG.ROUTE.get(
					'/{{categorySlug}}/{{orderBy}}', 
					function(categorySlug, orderBy){ 
						Processor.categoryController().init(categorySlug, orderBy, FSG_STORE.DATA); 
					}, 
					{categorySlug: '([^\.\/]+)'}
				);
				// With country code
				FSG.ROUTE.get(
					'/{{countryCode}}/{{categorySlug}}/{{orderBy}}', 
					function(categorySlug, orderBy){ 
						Processor.categoryController().init(categorySlug, orderBy, FSG_STORE.DATA); 
					}, 
					{countryCode: '[a-z]{2}',  categorySlug: '([^\.]+)'}
				);
				
				
				// Page wasn't found!
				// @pageUrl URI
				
				FSG.ROUTE.pageNotFound = function(pageUrl){
					console.warn('This page: ' +pageUrl+ " wasn't found!");
				};
				
				// Show alert from system
				Processor.updateAlert();
		});*/
});

/**
* Work when the browser is resizing
*/
/*var windowWidth = $(window).width();*/
$(window).resize(function(){
	/*if ($(window).width() != windowWidth) {*/
		App.view().createMobileLayout_iOS(App.playGameImg, false, App.gameOrientation, true /*is resize*/);
	/*};*/
});