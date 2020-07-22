
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.act == 'contentscript') {
        contentscript(request, sender, sendResponse);
    }
});


function contentscript(request, sender, sendResponse) {
    var tabId = sender.tab.id;
    if (!tabInfo[tabId]) {
        tabInfo[tabId] = {};
        tabInfo[tabId]['url'] = sender.tab.url;
    }

    console.log('Received data from Content Script for Tab ID ', tabId, ':', request.detail);

    if (request.detail.dfp) {
        tabInfo[tabId]['dfp'] = tabInfo[tabId]['dfp'] || {};
        $.extend(true, tabInfo[tabId]['dfp'], request.detail.dfp);
    }

    if (request.detail.prebid) {
        tabInfo[tabId]['prebid'] = tabInfo[tabId]['prebid'] || {};
        $.extend(true, tabInfo[tabId]['prebid'], request.detail.prebid);
    }
    if (request.detail.index)
        tabInfo[tabId]['index'] = request.detail.index;

    if (request.detail.adfox)
        tabInfo[tabId]['adfox'] = request.detail.adfox;

    if (request.detail.pubmatic)
        tabInfo[tabId]['pubmatic'] = request.detail.pubmatic;

    if (request.detail.criteo)
        tabInfo[tabId]['criteo'] = request.detail.criteo;

    if (request.detail.cdb) {
        tabInfo[tabId]['cdb'] = tabInfo[tabId]['cdb'] || {};
        $.extend(true, tabInfo[tabId]['cdb'], request.detail.cdb);
    }

}

