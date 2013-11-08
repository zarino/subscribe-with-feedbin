chrome.extension.onMessage.addListener(function(request, sender, sendResponse){
  // [request] here is a list of feed objects, sent by inject.js
  if(request.length){
    chrome.pageAction.show(sender.tab.id)
    // We probably want to save the list to local storage,
    // so page_action.js can load it when icon is clicked
  }
  sendResponse("Ok, thanks!")
})
