
var tabInfo = {};

var ALL_VALID_URLS = ['http://', 'https://'];


chrome.webRequest.onBeforeRequest.addListener(function(web_request) {
	
	var tabId = web_request.tabId;
	var requestId = web_request.requestId;

	// full page reload, this will reset all tab info
	if (web_request.type == 'main_frame') { 
		tabInfo[tabId] = {};
		tabInfo[tabId]['url'] = web_request.url;
	}

}, {urls: ["<all_urls>"]}, ["requestBody"]);



chrome.webNavigation.onCommitted.addListener(function(navigation) {

	var tabId = navigation.tabId;

	if (navigation.frameId == 0) { // = main_frame

		if (is_url_in(navigation.url, ALL_VALID_URLS)) {
			async.series([
				function(next) {
					chrome.tabs.executeScript(tabId, {file: "/contentscripts/gconsole.min.js"}, function() { if (chrome.runtime.lastError) console.warn(chrome.runtime.lastError.message); next(); });
				},
				function(next) {
					chrome.tabs.executeScript(tabId, {file: "/vendor/sha256.min.js"}, function() { if (chrome.runtime.lastError) console.warn(chrome.runtime.lastError.message); next(); });
				},
				function(next) {
					chrome.tabs.executeScript(tabId, {file: "/contentscripts/cs_public.js"}, function() { if (chrome.runtime.lastError) console.warn(chrome.runtime.lastError.message); next(); });
				}
			]);
		}
	}

}, {urls: ["<all_urls>"]})



chrome.tabs.onUpdated.addListener(function (tabId , info) {

  	if (info.status === 'complete') {

    	chrome.tabs.get(tabId, function(tab) {

    		if (chrome.runtime.lastError) {
    			console.log(chrome.runtime.lastError.message);
    		}
    		else {
		  		// all valid URLs
		  		if (is_url_in(tab.url, ALL_VALID_URLS)) {
			    }
    		}
    	})
  	}
});

// MEMORY MANAGEMENT
setInterval(function() {
	chrome.tabs.query({}, function(tabs) {
		var activeTabIds = [];
		for(var t in tabs) activeTabIds.push(tabs[t].id);

		for(var t in tabInfo) {
			if (tabInfo.hasOwnProperty(t)) {
				if (activeTabIds.includes(parseInt(t))) {

				} else {
					removeInfoForTabId(t);
				}
			}
		}
	});
}, 30000);

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
	console.log('Tab ID', tabId, 'is removed', removeInfo);
	removeInfoForTabId(tabId);
});

function removeInfoForTabId(tabId) {
	console.log('Removing info for tabId '+tabId);
	if (tabInfo[tabId]) 
		delete tabInfo[tabId];
}


function ab2str(buf) {
	return String.fromCharCode.apply(null, new Uint8Array(buf));
}

function is_url_in(url_to_find, url_set) {
	if (!url_to_find) return;

	for(var i in url_set) {
		if (typeof url_set[i] == 'string') {
			if (url_to_find.indexOf(url_set[i]) >= 0) return true;
		} else {
			if (url_set[i].test(url_to_find)) return true;
		}
	}
	return false;
}


function get_domain_from_url(url) {
    var a = document.createElement('a');
    a.href = url;
    return a.hostname.replace(/^www\./, '');
}
