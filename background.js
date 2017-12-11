
var allLinks = [];
var visibleLinks = [];

// Called when the user clicks extension icon
// This function also triggers a message "clicked_browser_action"
chrome.browserAction.onClicked.addListener(function(tab) {
  //alert("Action triggered")
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"});
  });
});


// This function gets triggered when the extension is loaded
// This function gathers all the links from the page and sorts it into new variable
chrome.extension.onRequest.addListener(function(links) {
  for (var index in links) {
    allLinks.push(links[index]);
  }
  allLinks.sort();
  visibleLinks = allLinks;
  checkLinks();
});


// This function checks the URLs in page for phishing content.
// Each URL is sent to phishtank and checked for phishing
// Phishtank is a project under OpenDNS
function checkLinks() {
  for (var link in visibleLinks) {
      mylink = visibleLinks[link];
      //alert(mylink);
      var checkgoogle = mylink.includes("google");
      if (checkgoogle == false) {
      var xhrobj = new XMLHttpRequest();
      xhrobj.open("POST", 'http://checkurl.phishtank.com/checkurl/');
      var formData1 = new FormData();
      formData1.append("url",mylink);
      formData1.append("format",'json');
      formData1.append("app_key",'8b2e8d2043689b5ea71937361ea61551f2170e35db89a187228e3c29ad6467eb');
      //xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      xhrobj.onreadystatechange = function() {
              if(xhrobj.readyState == XMLHttpRequest.DONE && xhrobj.status == 200) {
                        var myresponsejson1 = JSON.parse(this.responseText);
                        //myresponse = xhr.responseText;
                        // Use 'this' keyword everywhere if this doesnt work correctly
                        //alert(this.responseText);
                        myStatus = myresponsejson1.results.in_database
                        //alert(myStatus);
                        if (myStatus == true) {
                            var opt3 = {
                                            type: "basic",
                                            title: "Gate Keeper - Found Suspicios URL",
                                            message: myresponsejson1.results.url,
                                            iconUrl: "Gatekeeper.png"
                                      };
                            chrome.notifications.create(opt3);
                        }
                        
              }
      }
      xhrobj.send(formData1); }
  }
}


// This is the listener for messages triggered from content page
// This function checks the message and activate certain protections
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "activate_download_monitoring" ) {
      chrome.downloads.onCreated.addListener(function(downloadItem) {
      chrome.downloads.pause(downloadItem.id);
      // Download is paused and sent for processing in cuckoo
      durl = downloadItem.finalUrl;
      did = downloadItem.id;
      urldata = {'url': durl};
      var opt1 = {
                  type: "progress",
                  title: "Gate Keeper",
                  message: "Download sent for Analysis",
                  iconUrl: "Gatekeeper.png",
                  progress: 20
                };
      chrome.notifications.create(opt1);
      // Notification is triggered saying that the download is sent for analysis
      var xhr = new XMLHttpRequest();
      xhr.open("POST", 'http://localhost:1337/tasks/create/url',true);
      var formData = new FormData();
      formData.append("url",durl);
      //xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      xhr.onreadystatechange = function() {
              if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
                        var myresponsejson = JSON.parse(xhr.responseText);
                        myid = myresponsejson.task_id;
                        setTimeout(reporting(myid, durl, did), 3000);
                        
              }
      }
      xhr.send(formData); 
      });
    }
    if( request.message === "activate_phishing_protection" ) {
      //alert("phishing-protection-activated");
        chrome.windows.getCurrent(function (currentWindow) {
          chrome.tabs.query({active: true, windowId: currentWindow.id},
                                function(activeTabs) {
                           chrome.tabs.executeScript(
                            // send_links.js is inserted into all the frames in page to gather links
                                  activeTabs[0].id, {file: 'send_links.js', allFrames: true});
                      });
      });        
    }
  }
);


// Function to check if the download is safe or not
// Gets the report from cuckoo and verifies the score
// Download is resumed or canceled based on the cuckoo score
// Notification will be triggered when the download is canceled
function reporting(myid, durl, did) {
      var myviewurl = 'http://localhost:1337/tasks/view/' + myid
                        var xhr1 = new XMLHttpRequest();
                        xhr1.open("GET", myviewurl, true);
                        xhr1.onreadystatechange = function() {
                              if(xhr1.readyState == XMLHttpRequest.DONE && xhr1.status == 200) {
                                    var myresponse1json = JSON.parse(xhr1.responseText);
                                    var mystatus = myresponse1json.task.status;
                                    if (mystatus == 'reported') {
                                              var xhr2 = new XMLHttpRequest();
                                              var myreporturl = 'http://localhost:1337/tasks/report/' + myid
                                              xhr2.open("GET", myreporturl, true);
                                              xhr2.onreadystatechange = function() {
                                                    if(xhr2.readyState == XMLHttpRequest.DONE && xhr2.status == 200) {
                                                            var myreport = JSON.parse(xhr2.responseText);
                                                            myscore = myreport.info.score;
                                                            // Check score to decide action
                                                            if (myscore < 6) {
                                                                    chrome.downloads.resume(did);
                                                            }
                                                            else {
                                                                    chrome.downloads.cancel(did);
                                                                    var opt2 = {
                                                                                  type: "progress",
                                                                                  title: "Gate Keeper",
                                                                                  message: "Analysis check failed!!",
                                                                                  iconUrl: "Gatekeeper.png",
                                                                                  progress: 100
                                                                                };
                                                                    chrome.notifications.create(opt2);
                                                            }  
                                                    }
                                              }
                                              xhr2.send(null);
                                      }
                                      else {
                                              reporting(myid, durl, did);
                                      }
                                  }
                        }
                        xhr1.send(null);
}