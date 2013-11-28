chrome.extension.onMessage.addListener(function(message, sender, sendResponse){
  if(message.type == "found feeds"){
    console.log('background.js: received "found feeds" message.')
    console.log('background.js: sender =', sender)
    console.log('background.js: Showing pageAction icon...')
    chrome.pageAction.show(sender.tab.id)
    var n = message.feeds.length
    chrome.pageAction.setTitle({
      tabId: sender.tab.id,
      title: 'Found ' + n + ' feed' + (n == 1 ? '' : 's')
    })
  }
})
