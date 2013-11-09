# Subscribe with Feedbin

A Chrome extension for auto-detecting and subscribing to RSS feeds with Feedbin.

## How it works

`inject.js` is run on every page load, and detects whether there are any `application/rss+xml` or `application/atom+xml` links on the page. If it finds any, it notifies `background.js`, which shows the toolbar icon for that page and stores details about the links for later.

Clicking on the toolbar icon opens up `page_actions.html`. If Feedbin.me username and password have already been provided, `page_actions.html` displays the list of feed links collected by `background.js` and lets the user subscribe using the Feedbin API. If the user has not yet stored their Feedbin.me username and password, `page_actions.html` shows a setup form asking for the details.
