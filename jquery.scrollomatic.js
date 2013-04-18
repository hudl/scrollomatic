;(function($) {
    // jQuery plugin for better scrolling and URL manipulation when navigating to page fragments.
    //
    // Scrollomatic can be applied to a set of anchors that navigate to fragments within the page.
    // When an anchor is clicked, the plugin will smooth-scroll to its target and update the URL
    // fragment to the target.
    //
    // Usage
    //
    //    $('a.scroll').scrollomatic({
    //        duration: 200
    //    });
    //
    // The plugin updates the URL fragment when:
    //
    //    - an anchor is clicked and the page is scrolled to its target
    //    - the user manually scrolls the page to a point where a target is visible
    //
    // The plugin supports the following options:
    //
    //    - duration (milliseconds, default: 500): Scroll animation time.
    //    - offset (pixels, default: 0): Fixed offset to always consider as the "top of the page" when scrolling; useful for pages with fixed headers. Can be a literal or a function that returns a literal.
    //    - after (function): Function to execute after scrolling stops after an anchor is clicked. Context will be the clicked anchor. First argument is the fragment being navigated to.
    //
    // Quirks:
    //
    // - Links whose href changes after the plugin is initialized won't be updated in the plugin.
    // - The plugin should probably only be invoked once per page. This isn't yet enforced by the plugin.
    // - The URL will only be modified if the browser supports replaceState. If not, no URL changes will occur.

    $.fn.scrollomatic = function(options) {
        var o = $.extend({
            offset: 0, // fixed offset to always apply (good for accommodating fixed headers)
            duration: 500, // scroll duration in milliseconds
            after: function () {} // invoked after scrolling complete. arguments: hash (as defined on the link). context will be the clicked link.
        }, options);

        var win = $(window),
            isAutoscrolling = false;

        function getOffset() {
            return typeof(o.offset) === 'function' ? o.offset() : o.offset;
        }

        function setUrlHash(hash) {
            if ('replaceState' in window.history) window.history.replaceState('', '', hash);
        }
        
        function unsetUrlHash() {
            if ('replaceState' in window.history) window.history.replaceState('', document.title, window.location.pathname, window.location.search);
        }

        function scrollToHashTarget(hash, duration, suppressCallbacks) {
            var target = $(hash);
            if (target.length === 0) return;

            var targetOffsetTop = target.offset().top,
                targetMarginTop = parseInt(target.css('margin-top')),
                offset = getOffset(),
                scrollTop = targetOffsetTop - (offset + targetMarginTop);

            isAutoscrolling = true;
            $('html, body').stop().animate({
                scrollTop: scrollTop
            }, duration, 'swing', $.proxy(function () {
                isAutoscrolling = false;
                setUrlHash(hash);
                if (o.after && !suppressCallbacks) o.after.call(this, hash);
            }, this));
        }

        var targets = [];
        
        this.each(function() {
            var $this = $(this);

            var hash = $this.attr('href');
            if (!hash || hash.length === 0 || !hash.charAt(0) === '#') return;

            var target = $(hash);
            if (target.length === 0) return;

            targets.push(target);

            $this.click(function(e) {
                e.preventDefault();
                scrollToHashTarget(hash, o.duration);
            });
        });

        // When scrolling, if we're showing one of the known targets in the viewport, update the 
        // URL fragment to reflect that. If multiple targets are visible, show the topmost one.
        // If none are visible or the page is scrolled to the top, unset the fragment.
        function onScroll () {
            if (isAutoscrolling) return;
            
            var topmost,
                topmostY = 0,
                offset = getOffset(),
                scrollTop = win.scrollTop();

            if (scrollTop == 0/* || scrollTop < offset*/) {
                unsetUrlHash();
                return;
            }

            var windowHeight = win.height();
            for(var i = 0; i < targets.length; i++) {
                var target = targets[i],
                    outerHeight = target.outerHeight(),
                    top = target.offset().top,
                    bottom = top + outerHeight,
                    windowTop = scrollTop + offset,
                    windowBottom = windowTop + windowHeight;

                var isInViewport = !(windowBottom < top || windowTop > bottom);
                if (isInViewport && (!topmost || top < topmostY)) {
                    topmost = target;
                    topmostY = top;
                }
            }

            topmost ? setUrlHash('#' + topmost.attr('id')) : unsetUrlHash();
        };

        $(function () {
            setTimeout(function () {
                // When the page loads with a fragment, it doesn't account for any fixed headers, resulting
                // in the page scrolling too far. After a slight delay, explicitly scroll to the target.
                if (window.location.hash) scrollToHashTarget(window.location.hash, 0, true);
                
                // Wait a bit to bind the scroll handler in case the page was loaded with a fragment. We don't
                // want to handle those scroll events.
                win.scroll(onScroll);
            }, 200);
        });

        return this;
    };
}(jQuery));
