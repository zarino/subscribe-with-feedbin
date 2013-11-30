// Takes a list of feeds (objects with "url" and "title" keys)
// and returns a jQuery deferred promise, which on success,
// is resolved with a callback that is passed an 'improved'
// list of feeds.
var getBetterTitles = function(feeds){
  var dfd = $.Deferred()
  async.map(feeds, getBetterTitleForFeed, function(err, betterFeeds){
    dfd.resolve(betterFeeds)
  })
  return dfd.promise()
}

// Loads a specified feed via ajax and pulls out a title,
// returning it to the callback function.
var getBetterTitleForFeed = function(feed, callback){
  $.ajax({
    url: feed.url,
    dataType: 'xml'
  }).done(function(xml){
    var $title = $(xml).find('rss > channel > title, feed > title')
    if($title.length){
      feed.title = $title.text()
    }
    callback(null, feed)
  }).fail(function(){
    callback(null, feed)
  })
}

var showPageAction = function(tab_id, feeds){
  chrome.pageAction.show(tab_id)
  var n = feeds.length
  chrome.pageAction.setTitle({
    tabId: tab_id,
    title: 'Found ' + n + ' feed' + (n == 1 ? '' : 's')
  })
}

var sendImprovedFeeds = function(tab_id, feeds){
  chrome.tabs.sendMessage(tab_id, {
    type: "improved feeds",
    feeds: feeds
  })
}

chrome.extension.onMessage.addListener(function(message, sender, sendResponse){
  if(message.type == "found feeds"){
    console.log('background.js: received "found feeds" message.')
    console.log('background.js: getting better titles for feeds...')
    getBetterTitles(message.feeds).done(function(feeds){
      console.log('background.js: got better titles.')
      console.log('background.js: showing pageAction icon...')
      showPageAction(sender.tab.id, feeds)
      console.log('background.js: sending improved feeds back to tab ' + sender.tab.id + '...')
      sendImprovedFeeds(sender.tab.id, feeds)
    }).fail(function(feeds){
      // This is currently never executed, because
      // getBetterTitles() *always* returns a list of feeds
      console.log('background.js: couldn\'t get better titles.')
      console.log('background.js: showing pageAction icon...')
      showPageAction(sender.tab.id, feeds)
    })
  }
})
