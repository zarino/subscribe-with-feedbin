var feedNodes = document.querySelectorAll('link[type="application/atom+xml"], link[type="application/rss+xml"]')

if(feedNodes.length){

  var feeds = []
  for(var i=0; i<feedNodes.length; i++){
    feeds.push({
      title: feedNodes[i].title,
      type: feedNodes[i].type,
      url: feedNodes[i].href
    })
  }

  console.log('inject.js: found feeds')
  console.log('inject.js: sending "found feeds" message')

  // Send feeds to `background.js` which will
  // show the pageAction icon in this tab
  chrome.extension.sendMessage({
    type: "found feeds",
    feeds: feeds
  })

}

// Listen for messages from `page_action.html` asking for the list of feeds
chrome.extension.onMessage.addListener(function(message, sender, sendResponse){
  if(message.type == "give me feeds"){
    console.log('inject.js: received "give me feeds" message. Sending feeds...')
    sendResponse(feeds)
  }
})
