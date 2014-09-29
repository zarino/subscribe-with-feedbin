Array.prototype.average = function(){
  // Assumes an array of one or more numbers
  var sum = 0;
  for(var i=0; i<this.length; i++){
    sum += this[i]
  }
  return sum / this.length
}

// Takes a list of feeds (objects with "url" and "title" keys)
// and returns a jQuery deferred promise, which on success,
// is resolved with a callback that is passed an 'improved'
// list of feeds.
var parseFeeds = function(feeds){
  var dfd = $.Deferred()
  async.map(feeds, perseFeed, function(err, betterFeeds){
    dfd.resolve(betterFeeds)
  })
  return dfd.promise()
}

// Loads a specified feed via ajax and pulls out a title,
// returning it to the callback function.
var perseFeed = function(feed, callback){
  $.ajax({
    url: feed.url,
    dataType: 'xml'
  }).done(function(xml){
    // Try to find a title in the feed
    var $title = $(xml).find('rss > channel > title, feed > title')
    if($title.length){
      feed.title = $title.text()
    }

    // Find out how often the feed is updated
    var $pubDates = $(xml).find('pubDate')
    var timestamps = []
    var prevTimestamp = null
    var intervals = []
    $pubDates.each(function(){
      timestamps.push( new Date($(this).text()).getTime() / 1000 )
    })
    timestamps.sort()
    $.each(timestamps, function(i, timestamp){
      if(i == 0){
        prevTimestamp = timestamp
      } else {
        intervals.push(timestamp - prevTimestamp)
        prevTimestamp = timestamp
      }
    })
    feed.total = $pubDates.length
    feed.frequency = intervals.average()

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
    parseFeeds(message.feeds).done(function(betterFeeds){
      console.log('background.js: parseFeeds completed successfully.')
      console.log('background.js: showing pageAction icon...')
      showPageAction(sender.tab.id, betterFeeds)
      console.log('background.js: sending improved feeds back to tab ' + sender.tab.id + '...')
      sendImprovedFeeds(sender.tab.id, betterFeeds)
    }).fail(function(feeds){
      // This is currently never executed, because
      // parseFeeds() *always* returns a list of feeds
      console.log('background.js: parseFeeds failed.')
      console.log('background.js: showing pageAction icon...')
      showPageAction(sender.tab.id, feeds)
    })
  }
})
