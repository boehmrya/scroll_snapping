jQuery(function($){

    function buildSections() {

      var lastScroll = 0;
      var scrollDirection;
      var currentScroll;

      // Instantiation
      jQuery(".story-wrap").scrollStory({
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


               // don't auto scroll if in mobile
               if (window.innerWidth > 767) {
                 this.next();
               }

            }
          }

        },
        itemfocus: function(ev, item) {
          /*
          if (item.el.hasClass('header')) {
            jQuery('.scroll-icon').addClass('show');
          }
          */
        },
        itemblur: function(ev, item) {
          console.log(item);
        }
      });
    }

    $(document).ready( function() {
      buildSections();
    });


});
