chrome.extension.onMessage.addListener(function(request, sender, sendResponse){
  if(request.length){
    chrome.pageAction.show(sender.tab.id)
  }
  sendResponse("Ok, thanks!")
})
