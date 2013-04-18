`$.scrollomatic`
============

jQuery plugin for fragment scrolling with URL manipulation and support for fixed headers.

Scrollomatic can be applied to a set of anchors that navigate to fragments within the page. When an anchor is clicked, the plugin will smooth-scroll to its target and update the URL fragment to the target. Scrollomatic also updates the URL when known targets are visible on the screen.

**Example**

```javascript
$('a.scroll').scrollomatic({
    duration: 200
});
```

**Behavior**

The plugin updates the URL fragment when:

- an anchor is clicked and the page is scrolled to its target
- the user manually scrolls the page to a point where a target is visible

The plugin supports the following options:

- duration (milliseconds, default: 500): Scroll animation time.
- offset (pixels, default: 0): Fixed offset to always consider as the "top of the page" when scrolling; useful for pages with fixed headers. Can be a literal or a function that returns a literal.
- after (function): Function to execute after scrolling stops after an anchor is clicked. Context will be the clicked anchor. First argument is the fragment being navigated to.

**Quirks**

- Links whose href changes after the plugin is initialized won't be updated in the plugin.
- The plugin should probably only be invoked once per page. This isn't yet enforced by the plugin.
- The URL will only be modified if the browser supports replaceState. If not, no URL changes will occur.
