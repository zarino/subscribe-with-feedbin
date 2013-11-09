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
    $.each(feeds, function(i, feed){
      $('body').append('<a href="' + feed.url + '">' + feed.title + '</a>')
    })
  })
})
