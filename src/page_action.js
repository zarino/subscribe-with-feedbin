// Loads an email and password (or null and null if
// no details have been saved) from local storage.
var loadCredentials = function(){
  var dfd = $.Deferred()
  chrome.storage.local.get('credentials', function(result){
    if('credentials' in result){
      dfd.resolve(result.credentials.email, result.credentials.password)
    } else {
      dfd.resolve(null, null)
    }
  })
  return dfd.promise()
}

// Ask inject.js for a list of feeds on the current page,
// and then display them for the user to pick from.
// If the user hasn't yet provided their Feedbin login details
// we also show them a link to go set them at options.html.
var showFeeds = function(feeds){
  var optionsURL = chrome.extension.getURL('options.html')
  loadCredentials().done(function(email, password){
    window.email = email
    window.password = password
    if(window.email == null || window.password == null){

      if(feeds.length == 1){
        var message = 'Log into Feedbin to subscribe to this feed'
      } else {
        var message = 'Log into Feedbin to subscribe to these feeds'
      }
      $('body').prepend('<a id="login" class="btn-success" target="_blank" href="' + optionsURL + '">' + message + '</a>')

      $.each(feeds, function(i, feed){
        $('#feeds').append('<a class="list-group-item" href="' + feed.url + '">' + feed.title + '</a>')
      })

    } else {

      $('body').prepend('<a id="loggedin" target="_blank" href="' + optionsURL + '">Logged in as ' + window.email + '</a>')

      $.each(feeds, function(i, feed){
        var $a = $('<a class="list-group-item">')
        $a.attr({
          title: feed.url,
          href: feed.url
        })
        $a.append('<strong>' + feed.title + '</strong>')
        if(feed.frequency){
          var intervalInMinutes = Math.round(feed.frequency/60)
          var intervalInHours = Math.round(feed.frequency/60/60)
          var intervalInDays = Math.round(feed.frequency/60/60/24)
          var intervalInWeeks = Math.round(feed.frequency/60/60/24/7)
          if(intervalInMinutes == 1){
            var updated = 'roughly every minute'
          } else if(intervalInMinutes < 55){
            var updated = 'every ' + intervalInMinutes + ' minutes'
          } else if(intervalInHours == 1){
            var updated = 'roughly every hour'
          } else if(intervalInHours < 23){
            var updated = 'every ' + intervalInHours + ' hours'
          } else if(intervalInDays == 1){
            var updated = 'daily'
          } else if(intervalInDays < 7){
            var updated = 'every ' + intervalInDays + ' days'
          } else if(intervalInWeeks == 1){
            var updated = 'weekly'
          } else if(intervalInWeeks < 11){
            var updated = 'every ' + intervalInWeeks + ' weeks'
          } else {
            var updated = 'every ' + Math.round(intervalInWeeks/4.3) + ' months'
          }
          $a.append('<span class="updated">Updated ' + updated + '</span>')
        }
        $a.on('click', feedClick).appendTo('#feeds')
      })

      // Lazily (ie: so we don't delay displaying the feed list)
      // load current subscriptions and mark list items if subscribed
      getSubscriptions().done(function(subscriptions){
        var feed_urls = _.pluck(subscriptions, 'feed_url')
        $('#feeds a').each(function(){
          var feed = $(this).attr('href')
          if(feed_urls.indexOf(feed) > -1){
            var existing_feed = _.findWhere(subscriptions, {feed_url: feed})
            $(this).addClass('subscribed')
            $(this).attr('data-feed-id', existing_feed.feed_id)
            $(this).attr('title', 'Subscribed ' + moment(existing_feed.created_at).fromNow())
          }
        })
      }).fail(reportAJAXError)

      // Pre-load tags, to make displaying the tag list
      // after new subscriptions quicker
      getTags(window.email, window.password).done(function(tags){
        _.each(tags, function(tag){
          $('#tags').append('<label class="tag"><input type="checkbox" value="' + tag + '"> ' + tag + '</label>')
        })
      }).fail(reportAJAXError)

    }
  })
}

var feedClick = function(e){
  if(e.metaKey){
    // The user wants to open the feed URL in a new window.
    // Bail out early, and let the browser follow the link.
    return true;
  }

  e.preventDefault()
  var $a = $(this)
  var feedURL = $(this).attr('href')
  subscribeToFeed(feedURL, window.email, window.password).done(function(feedObject, jqXHR){

    // Isolate the feed, and show the tags
    $a.addClass('subscribed solo').siblings().slideUp(100)
    $('#tags').slideDown(100)
    $('#tags input').on('change', function(e){
      var $input = $(this)
      if($input.is(':checked')){
        tagFeed(feedObject.feed_id, $(this).val()).fail(reportAJAXError)
      } else {
        untagFeed(feedObject.feed_id, $(this).val()).fail(reportAJAXError)
      }
    })

    // If the feed was already a subscription,
    // find out what tags it had (if any)
    if(typeof $a.attr('data-feed-id') !== 'undefined'){
      getTagsForFeed($a.attr('data-feed-id')).done(function(tags){
        _.each(tags, function(tag){
          $('#tags input[value="' + tag + '"]').attr('checked', true)
        })
      }).fail(reportAJAXError)
    } else {
      $a.attr('title', 'Subscribed a few seconds ago')
    }

  }).fail(reportAJAXError)
}

// Subscribes to a given feed URL. Returns a jQuery Deferred promise.
var subscribeToFeed = function(feedURL, email, password){
  return $.ajax({
    type: 'POST',
    url: 'https://api.feedbin.me/v2/subscriptions.json',
    contentType: 'application/json; charset=utf-8',
    username: email,
    password: password,
    data: JSON.stringify({ feed_url: feedURL })
  })
}

// Get all taggings. Returns a jQuery Deferred promise.
var getTaggings = function(){
  return $.ajax({
    url: 'https://api.feedbin.me/v2/taggings.json',
    username: window.email,
    password: window.password
  })
}

// Get the given user's tags. Returns a jQuery Deferred promise.
var getTags = function(){
  var dfd = $.Deferred()
  getTaggings().done(function(taggings){
    dfd.resolve(_.uniq(_.pluck(taggings, 'name')).sort())
  }).fail(dfd.reject)
  return dfd.promise()
}

// Get all tags applied to the given feed. Returns a jQuery Deferred promise.
var getTagsForFeed = function(feed_id){
  var dfd = $.Deferred()
  getTaggings().done(function(taggings){
    taggingsForThisFeed = _.where(taggings, {feed_id: parseInt(feed_id)})
    dfd.resolve(_.uniq(_.pluck(taggingsForThisFeed, 'name')).sort())
  }).fail(dfd.reject)
  return dfd.promise()
}

// Create a new tagging. Returns a jQuery Deferred promise.
var tagFeed = function(feed_id, tag){
  return $.ajax({
    type: 'POST',
    url: 'https://api.feedbin.me/v2/taggings.json',
    contentType: 'application/json; charset=utf-8',
    username: window.email,
    password: window.password,
    data: JSON.stringify({ feed_id: feed_id, name: tag })
  })
}

// First get all taggings, then find the one with the
// matching `feed_id` and `tag`, and delete it
var untagFeed = function(feed_id, tag){
  var dfd = $.Deferred()
  getTaggings().done(function(taggings){
    // Find the tagging we want
    var matching_taggings = _.findWhere(taggings, {
      feed_id: feed_id,
      name: tag
    })
    if(matching_taggings){
      $.ajax({
        type: 'DELETE',
        url: 'https://api.feedbin.me/v2/taggings/' + matching_taggings.id + '.json',
        username: window.email,
        password: window.password
      }).done(dfd.resolve).fail(dfd.reject)
    } else {
      dfd.resolve()
    }
  }).fail(dfd.reject)
  return dfd.promise()
}

var getSubscriptions = function(){
  return $.ajax({
    type: 'GET',
    url: 'https://api.feedbin.me/v2/subscriptions.json',
    username: window.email,
    password: window.password
  })
}

// Useful for reporting the error returned by subscribeToFeed()
var reportAJAXError = function(jqXHR, textStatus, errorThrown){
  $('body').append('<p id="ajax-error" class="text-danger text-center" title="' + jqXHR.responseJSON.message.replace(/"/g, '&quot;') + '"><strong>Oh no!</strong> ' + jqXHR.status + ' ' + textStatus + '</p>')
  // console.log(jqXHR, textStatus, errorThrown)
}

chrome.tabs.query({
  active: true,
  currentWindow: true
}, function(tabs) {
  chrome.tabs.sendMessage(tabs[0]['id'], {
    type: "give me feeds"
  }, showFeeds)
})
