// Listener for "clicked_browser_action" message event
// This function triggers messages to activate download monitoring and phishing protection
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "clicked_browser_action" ) {
      var firstHref = $("a[href^='http']").eq(0).attr("href");
      console.log(firstHref);
      alert("Download Monitoring and Phishing Protection activated");
      chrome.runtime.sendMessage({"message": "activate_download_monitoring", "url": firstHref});
      chrome.runtime.sendMessage({"message": "activate_phishing_protection", "url": firstHref});
    }
  }
);
