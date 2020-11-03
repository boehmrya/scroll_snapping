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
          console.log(activeItem);
          var nextIndex = activeItem.index + 1;
          if (nextIndex < this._items.length) {
            if (scrollDirection == 'down' && activeItem.percentScrollComplete > 0.05) {
              this.next();
            }
            else if (scrollDirection == 'up' && activeItem.percentScrollComplete < 0.95) {
              this.index(activeItem.index);
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
