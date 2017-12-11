# GateKeeper

The GateKeeper tool has been implemented as a chrome extension. By having the tool as a browser extension, it improves the usability and doesn’t require any complex configuration. The tool depends on cuckoo sandbox for file analysis. So, there should be a working cuckoo sandbox setup in the user’s environment. Once the user installs the extension into his/her browser and clicks the browser extension icon, the tool automatically starts download monitoring and phishing protection. When the user performs any download action, the tool just passes the download and shows a notification to the user stating that the download file is sent for analysis by cuckoo. Once the file analysis has been completed, the tool checks the cuckoo score generated and resumes or cancels the download based on the cuckoo score. If the file analysis predicts the file as malicious then the download is canceled and a notification will be shown to the user stating that the file analysis failed the test. For phishing protection, the tool automatically parses all the URLs in the webpage visited by the user and sends them for analysis. The tool makes use of Phishtank which is a project under OpenDNS. Each URL is analyzed by phishtank and if it finds the URL in its repository then a notification will be shown to user stating that the particular URL is malicious and may contain phishing content.



### Dependencies:

Cuckoo Sandbox		:	Used for file analysis
PhishTank		:	Used for phishing URL detection


Note:
The cuckoo sandbox is configured with windows guest virtual machine. This is required because the Linux guest machine is not fully mature and it doesn’t have support for lot of functionalities which is used in file analysis.


### Setup:

1.	Install Cuckoo Sandbox
	- Cuckoo sandbox should be installed properly for the extension to work. The installation instruction for cuckoo sandbox can be found at the below URL
	  http://docs.cuckoosandbox.org/en/latest/installation/

	- Please note that the cuckoo setup should run windows guest machine for the extension to work properly

2.	Cuckoo Configuration
	- The extension has been configured to connect with cuckoo on localhost with port 1337. The host and port should be configured properly for the extension to work. 
	- This static configuration will be changed in future. The user will be asked to specify the cuckoo host and port so that there can be a single cuckoo instance in the future	       to run multiple tasks in an environment.


### Usage:
-	Load the extension in google chrome.
-	Click the extension icon which says “GateKeeper” to activate the extension.
-	The tool starts download analysis and phishing detection by default
-	From now on all downloads will be monitored and all URLs will be parsed and checked for phishing content



### Future Work:

-	Support to dynamically configure cuckoo setup details within the extension
-	Option to view the cuckoo report within the extension
-	Option to highlight the phishing URL in the webpage
-	Remove cuckoo dependency to configure any dynamic malware analysis platform within the extension


### References:

-	http://docs.cuckoosandbox.org/
-	https://www.phishtank.com/
-	https://chromium.googlesource.com/chromium/src/+/master/chrome/common/extensions/docs/examples/api/downloads/
-	https://developer.chrome.com/extensions/
-	https://stackoverflow.com/

