console.log('page_action.js: opened')
chrome.tabs.query({
    active: true,
    currentWindow: true
}, function(tabs) {
  console.log('page_action.js: tab.id =', tabs[0]['id'])
  console.log('page_action.js: sending "give me feeds" message')
  chrome.tabs.sendMessage(tabs[0]['id'], {
    type: "give me feeds"
  }, function(feeds){
    console.log('page_action.js: received feeds', feeds)
    var $list = $('<div>').addClass('list-group')
    $.each(feeds, function(i, feed){
      $list.append('<a class="list-group-item" href="' + feed.url + '">' + feed.title + '</a>')
    })
    $list.appendTo('body')
  })
})
