
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.act == 'get_tab_info') {
        get_tab_info(request, sender, sendResponse);
    }
    else if (request.act == 'get_tab_sha256') {
    	get_tab_sha256(request, sender, sendResponse);
    }
});


function get_tab_info(request, sender, sendResponse) {

	var domain = get_domain_from_url(request.tab.url);

	if (!tabInfo[request.tab.id]) {
		tabInfo[request.tab.id] = {};
		tabInfo[request.tab.id]['url'] = request.tab.url;
		tabInfo[request.tab.id]['domain'] = domain;
	}

	tabInfo[request.tab.id]['auth'] = {
		domainActive : isDomainActive(domain)
	}

	console.log('Received tab request: ', request);

	console.log('Sending tab info', tabInfo[request.tab.id]);

	sendResponse($.extend(true, {}, tabInfo[request.tab.id], {
		sha256: sha256(JSON.stringify(tabInfo[request.tab.id]))
	}));
}


function get_tab_sha256(request, sender, sendResponse) {
	if (!tabInfo[request.tab.id]) {
		tabInfo[request.tab.id] = {};
		tabInfo[request.tab.id]['url'] = request.tab.url;
	}

	sendResponse({
		sha256: sha256(JSON.stringify(tabInfo[request.tab.id]))
	});
}