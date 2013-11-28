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
    } else {
      $('body').prepend('<a id="loggedin" target="_blank" href="' + optionsURL + '">Logged in as ' + window.email + '</a>')
      getTags(window.email, window.password).done(function(tags){
        _.each(tags, function(tag){
          $('#tags').append('<label class="tag"><input type="checkbox" value="' + tag + '"> ' + tag + '</label>')
        })
      }).fail(reportAJAXError)
    }
    $.each(feeds, function(i, feed){
      var $a = $('<a class="list-group-item" href="' + feed.url + '">' + feed.title + '</a>')
      $a.on('click', feedClick).appendTo('#feeds')
    })
  })
}

var feedClick = function(e){
  e.preventDefault()
  if(window.email == null || window.password == null){
    // No login details! Send them to the options screen.
    $('#login').trigger('click')
    return false
  }
  var $a = $(this)
  var feedURL = $(this).attr('href')
  subscribeToFeed(feedURL, window.email, window.password).done(function(feedObject, jqXHR){
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
  getTaggings().done(function(data){
    dfd.resolve(_.uniq(_.pluck(data, 'name')).sort())
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

// Useful for reporting the error returned by subscribeToFeed()
var reportAJAXError = function(jqXHR, textStatus, errorThrown){
  $('body').append('<p id="ajax-error" class="text-danger text-center" title="' + jqXHR.responseJSON.message.replace(/"/g, '&quot;') + '"><strong>Oh no!</strong> ' + jqXHR.status + ' ' + textStatus + '</p>')
  console.log(jqXHR, textStatus, errorThrown)
}

chrome.tabs.query({
  active: true,
  currentWindow: true
}, function(tabs) {
  chrome.tabs.sendMessage(tabs[0]['id'], {
    type: "give me feeds"
  }, showFeeds)
})
