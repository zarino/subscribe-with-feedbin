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
    if(email == null || password == null){
      if(feeds.length == 1){
        var message = 'Log into Feedbin to subscribe to this feed'
      } else {
        var message = 'Log into Feedbin to subscribe to these feeds'
      }
      $('body').prepend('<a id="login" class="btn-success" target="_blank" href="' + optionsURL + '">' + message + '</a>')
    } else {
      $('body').prepend('<a id="loggedin" target="_blank" href="' + optionsURL + '">Logged in as ' + email + '</a>')
    }
    var $list = $('<div>').addClass('list-group')
    $.each(feeds, function(i, feed){
      var $a = $('<a class="list-group-item" href="' + feed.url + '">' + feed.title + '</a>')
      $a.on('click', function(e){
        e.preventDefault()
        subscribeToFeed(feed.url, email, password)
      })
      $a.appendTo($list)
    })
    $list.appendTo('body')
  })
}

var subscribeToFeed = function(feedURL, email, password){
  if(email == null || password == null){
    return false
  }
  alert('coming soon!')
}

chrome.tabs.query({
  active: true,
  currentWindow: true
}, function(tabs) {
  chrome.tabs.sendMessage(tabs[0]['id'], {
    type: "give me feeds"
  }, showFeeds)
})


