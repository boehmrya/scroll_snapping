
jQuery(function($) {

  function lazyLoadVideos(element) {
    element.each(function() {
      var lazyVideo = $(this);
      if (lazyVideo.hasClass('lazy')) {
        var lazyVideoChildren = lazyVideo.children();

        lazyVideoChildren.each(function() {
          var thisSource = $(this);
          var thisDataSource = thisSource.attr('data-src');

          // create src attribute
          thisSource.attr('src', thisDataSource);

          // load and play the video
          lazyVideo.get(0).load();
        });

        // remove lazy class so it doesn't replay in the future
        lazyVideo.removeClass('lazy');
      }
    });
  }


  function buildStories() {

    var lastScroll = 0;
    var scrollDirection;
    var currentScroll;

    // Instantiation
    jQuery("#rural-stories").scrollStory({
      autoActivateFirstItem: true,
      triggerOffset: 0,
      easing: 'swing',
      speed: 200,
      containerscroll: function() {
        currentScroll = this._totalScrollComplete;
        if (currentScroll > lastScroll) {
          scrollDirection = 'down';
        }
        else {
          scrollDirection = 'up';
        }
        lastScroll = currentScroll;

        var activeItem = this.getActiveItem();
        var nextIndex = activeItem.index + 1;
        if (nextIndex < this._items.length) {
          if (activeItem.el.hasClass('image-section') &&
              !activeItem.el.hasClass('header') &&
             (scrollDirection == 'down')) {

             // lazy load the next video
             var nextItem = this.getItemByIndex(activeItem.index + 1);
             lazyLoadVideos(nextItem.el.find('.video-wrap video'));
             // auto scroll to the next video section

             // don't auto scroll if in mobile
             if (window.innerWidth > 767) {
               this.next();
             }

          }
        }

      },
      itemfocus: function(ev, item) {

        // show scroll icon when appearing in header
        if (item.el.hasClass('header')) {
          jQuery('.scroll-icon').addClass('show');
        }

        if (item.el.hasClass('video-section')) {
          // load videos when in view
          lazyLoadVideos(item.el.find('.video-wrap video'));
        }

        if (item.el.hasClass('video-section')) {
          // load videos when in view
          lazyLoadVideos(item.el.find('.video-wrap video'));
        }
      },
      itemblur: function(ev, item) {
        // hide scroll icon when leaving header
        if (item.el.hasClass('header')) {
          jQuery('.scroll-icon').removeClass('show');
        }
      }
    });
  }


  function buildQuotes() {
    var w = window.innerWidth;
    if (w > 991) {
      // init controller
      var controller = new ScrollMagic.Controller();

      // Story One Quote
      new ScrollMagic.Scene({triggerElement: ".story.one .row.one", duration: 300, offset: 400})
                .setPin(".story.one .quote-wrap")
                .addTo(controller);

      // Story Two Quote
      new ScrollMagic.Scene({triggerElement: ".story.two .row.two", duration: 300, offset: 200})
                .setPin(".story.two .quote-wrap")
                .addTo(controller);

      // Story Three
      new ScrollMagic.Scene({triggerElement: ".story.three .row.two", duration: 350, offset: 300})
                .setPin(".story.three .quote-wrap")
                .addTo(controller);
    }
  }

  $(document).ready( function() {
    buildStories();
  });

  jQuery( window ).on('load orientationchange', function() {
    buildQuotes();
  });

});
