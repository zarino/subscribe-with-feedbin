# Subscribe with Feedbin

A Chrome extension for auto-detecting and subscribing to RSS feeds with Feedbin.

## How it works

`inject.js` is run on every page load, and detects whether there are any `application/rss+xml` or `application/atom+xml` links on the page. If it finds any, it notifies `background.js`, which shows the toolbar icon for that page.

Clicking on the toolbar icon opens up `page_actions.html`. If a Feedbin.me username and password have already been provided, `page_actions.html` asks `inject.js` for the current page's feed details and displays them to the user for subscription. If the user has not yet stored their Feedbin.me username and password, `page_actions.html` shows a setup form asking for the details.

Clicking a feed in `page_actions.html` subscribes the user to that feed with Feedbin. It also lets them tag the feed.
