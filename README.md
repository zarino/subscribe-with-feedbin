# Subscribe with Feedbin

A Chrome extension for auto-detecting and subscribing to RSS feeds with Feedbin.

## How it works

`inject.js` is run on every page load, and detects whether there are any `application/rss+xml` or `application/atom+xml` links on the page. If it finds any, it notifies `background.js`, which shows the toolbar icon for that page.

`background.js` also tries to "improve" the feed metadata provided by `inject.js`, by loading and parsing each feed to find a more human-readable title. This is done in `background.js` to avoid polluting the host page's global namespace with the jQuery and async.js libraries. Once `background.js` has improved the data, it returns it to `inject.js`, for storage and eventual passage to `page_actions.html`.

Clicking on the toolbar icon opens up `page_actions.html`. If a Feedbin.me username and password have already been provided, `page_actions.html` asks `inject.js` for the current page's feed details and displays them to the user for subscription. If the user has not yet stored their Feedbin.me username and password, `page_actions.html` shows a setup form asking for the details.

Clicking a feed in `page_actions.html` subscribes the user to that feed with Feedbin. It also lets them tag the feed.
