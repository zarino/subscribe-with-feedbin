chrome.extension.onMessage.addListener(function(message, sender, sendResponse){
  if(message.type == "found feeds"){
    console.log('background.js: received "found feeds" message.')
    console.log('background.js: sender =', sender)
    console.log('background.js: Showing pageAction icon...')
    chrome.pageAction.show(sender.tab.id)
    if(message.feeds.length == 1){
      var title = 'Subscribe to “' + message.feeds[0].title + '”'
    } else {
      var title = 'Subscribe to ' + message.feeds.length + ' feeds'
    }
    chrome.pageAction.setTitle({
      tabId: sender.tab.id,
      title: title
    })
  }
})
