var Play = {
	playerID: $('.play-box'),
	puffinFullscreen: false,
	emulators: [],
	init: function(){
		App.fullscreen().attachToButton();
		App.rate().now(GAME);
		App.gameOrientation = GAME.orientation;
		App.playGameImg = GAME.img;
		App.view().createMobileLayout_iOS(GAME.img, true, GAME.orientation);
		App.view().reloadGame();
		App.view().convertControls();
		Play.sortGameOnMob();
		App.fullscreen().moveButton();
		App.played().add(GAME.id);
		App.slide().init();
		App.AD().preloadAd();
		if(App.detect().FSGBrowser()){
			App.message().post('GAME_ID::'+ GAME.slug);
		};
		App.fullscreen().detectPlayerWide(function(){
			App.view().clearOtherGames();
		});
		Processor.playContentId = $('#content');
		Processor.playPageId = $('.play-page');

		/* Show all emulators */ 
		Processor.playController().showEmulators(GAME);

		$('#game_bug').click(function(){
			Processor.gameBug = GAME.bug;

			/* Show all game bugs */
			Processor.playController().showGameBugs();
		});

		/* Clear layout before gameplay */
		Processor.playController().clearPlayboxLayout(GAME);

		/* Attach copy command */
		Processor.playController().attachCopyCommandToShareBox();

		Processor.playController().playPageLazyContent();

		$(window).scroll(function(){
			Processor.playController().playPageLazyContent();
		});
	},
	sortGameOnMob: function(){
		var list = [];
			if($('.right-box').is(":visible") == false){
				$('.fixed-games a').each(function(index, value){
					var img = ($(value).find('.fixed-img').attr('data-src') != undefined) 
							? $(value).find('.fixed-img').attr('data-src') 
							: $(value).find('.fixed-img').attr('src'),
						data = {href: $(value).attr('href'), 
							img: img,
							name: $(value).find('.fixed-name').text(),
							size: $(value).data('size'),
							stars: $(value).data('stars')
						};
						list.push(data);
				});
			};
			if(list.length > 0){
				var moreHTML = '';
					for(var i in list){
						moreHTML += '<div class="grip-item">';
						moreHTML += '<a href="'+ list[i].href +'">';
						moreHTML += '<img alt="'+ list[i].name +'" class="item-img lazyload" src="'+settings.publicUrl+'images/flash.png" data-src="'+ list[i].img +'" align="left"/>';
						moreHTML += '<b class="item-text">'+ list[i].name +'</b>';
						moreHTML += '<span class="item-category">'+ list[i].size +'</span>';
						moreHTML += '<span class="item-stars">'+ list[i].stars +' ★</span>';
						moreHTML += '</a>';
						moreHTML += '</div>';
					};
					$('.more-games').prepend(moreHTML);
					setTimeout(function(){ App.slide().gripContent(); }, 300);
			}
	}
};

$(document).ready(function(){
	Play.init();
});

var windowWidth = $(window).width();
$(window).resize(function(){
	if ($(window).width() != windowWidth) {
		App.view().createMobileLayout_iOS(GAME.img, false, GAME.orientation);
	};
});