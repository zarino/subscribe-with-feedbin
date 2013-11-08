var feedNodes = document.querySelectorAll('link[type="application/atom+xml"], link[type="application/rss+xml"]')

if(feedNodes.length){
  console.log('found', feedNodes.length, 'feed' + (feedNodes.length==1?'':'s'))

  var feeds = []
  for(var i=0; i<feedNodes.length; i++){
    feeds.push({
      title: feedNodes[i].title,
      type: feedNodes[i].type,
      url: feedNodes[i].href
    })
  }

  console.log('telling background.js...')
  chrome.extension.sendMessage(feeds, function(response){
    console.log('background.js responded:', response)
  })

}
