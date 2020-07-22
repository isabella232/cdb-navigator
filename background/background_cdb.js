
var CDB_URLS = [/\/bidder\.criteo\.com\//, /\/bidder2\.criteo\.com\//];
var CDB_URL_FILTERS = ['*://bidder.criteo.com/*', '*://bidder2.criteo.com/*'];

var cdb_profiles = {
	125	: 'CDB Prebid',
	153	: 'CDB Standalone',
	154	: 'CDB Index',
	183	: 'CDB Index',
	184	: 'CDB Standalone',
	185	: 'CDB PreBid',
	198	: 'CDB InApp',
	206	: 'CDB Passback',
	207	: 'CDB Prebid Sandboxed',
	208	: 'CDB Custom Integrations',
	217	: 'CDB InApp SDK',
	218	: 'CDB Pubmatic',
	229	: 'CDB InApp S2S',
	230	: 'CDB Prebid Server',
	231	: 'CDB AMP RTC',
	235	: 'CDB InApp SDKv2',
	274	: 'CDB Prebid Prefetch',
	275	: 'CDB Standalone Adblock'
}


chrome.webRequest.onBeforeRequest.addListener(function(web_request) {
	
	var tabId = web_request.tabId;
	var requestId = web_request.requestId;

	if (is_url_in(web_request.url, CDB_URLS)) {
		var request_body_str = '';
		if (web_request.requestBody && web_request.requestBody.raw) {
			for(var r in web_request.requestBody.raw) {
				var body = web_request.requestBody.raw[r];
				request_body_str += ab2str(body.bytes);
			}
		} else request_body_str = '{}';
		var request_body_json = JSON.parse(request_body_str) || {};

		// Existing slots in request
		if (request_body_json && request_body_json.slots) {
			for (var i in request_body_json.slots) {
				var slot = request_body_json.slots[i];
				var match = slot.impid.match(/(.*)\@.*\@.*/);
				if (match) {
					request_body_json.slots[i].impid = match[1];
					request_body_json.slots[i].pubmatic_impid = match[0]
				}
			}
		}

		// Previous Bid Feedback
		var adapter_timeout = null;
		if (request_body_json && request_body_json.previousBidFeedback) {
			for(var i in request_body_json.previousBidFeedback) {
				var bidFeedback = request_body_json.previousBidFeedback[i];
				if (bidFeedback.adapterTimeout) {
					adapter_timeout = bidFeedback.adapterTimeout;
					break;
				}
			}
		}	
		
		var profile_id = parseInt((web_request.url.match(/profileId=(\d+)/) || [null,null])[1]) || null;
		var pubtag_version = parseInt((web_request.url.match(/ptv=(\d+)/) || [null,null])[1]) || null;
		var prebid_criteo_adapter_version = parseInt((web_request.url.match(/av=(\d+)/) || [null,null])[1]) || null;

		tabInfo[tabId]['cdb'] = tabInfo[tabId]['cdb'] || {};
		tabInfo[tabId]['cdb'].adapter_timeout = tabInfo[tabId]['cdb'].adapter_timeout || adapter_timeout;
		tabInfo[tabId]['cdb'].pubtag_version = tabInfo[tabId]['cdb'].pubtag_version || pubtag_version;
		tabInfo[tabId]['cdb'].calls = tabInfo[tabId]['cdb'].calls || [];
		tabInfo[tabId]['cdb'].calls.push({
			request_id   : requestId,
			request_uri  : web_request.url,
			profile_id   : profile_id,
			profile      : cdb_profiles[profile_id] ? cdb_profiles[profile_id] : 'Unknown CDB Profile',
			request_body : request_body_str,
			publisher    : request_body_json.publisher || {},
			slots        : request_body_json.slots || {},
			is_dynamic_slot : (request_body_json.publisher && request_body_json.publisher.networkid && 
								request_body_json.slots && request_body_json.slots[0] && 
								request_body_json.slots[0].sizes && request_body_json.slots[0].sizes.length>0) || false,
			ts_start     : web_request.timeStamp
		});

		if (prebid_criteo_adapter_version) {
			tabInfo[tabId]['prebid'] = tabInfo[tabId]['prebid'] || {};
			tabInfo[tabId]['prebid'].criteo_adapter_version = tabInfo[tabId]['prebid'].criteo_adapter_version || prebid_criteo_adapter_version;
		}
		
		if (isDomainActive(get_domain_from_url(tabInfo[tabId]['url']))) {
			chrome.browserAction.setBadgeText({text:'CDB', tabId: tabId});
			chrome.browserAction.setIcon({path:'images/icon_32.png', tabId: tabId});
		}

	}

}, {urls: CDB_URL_FILTERS}, ["requestBody"]);


chrome.webRequest.onHeadersReceived.addListener(function(web_request) {

	var tabId = web_request.tabId;
	var requestId = web_request.requestId;

	if (is_url_in(web_request.url, CDB_URLS)) {
		if (tabInfo[tabId] && tabInfo[tabId]['cdb'] && tabInfo[tabId]['cdb'].calls) {
			for(var i in tabInfo[tabId]['cdb'].calls) {
				if (tabInfo[tabId]['cdb'].calls[i].request_id == requestId) {
					var responseHeaders = web_request.responseHeaders;
					tabInfo[tabId]['cdb'].calls[i]['debug'] = [];
					for (var h in responseHeaders) {
						var header = responseHeaders[h];
						if (header.name.indexOf('X-') === 0 && 
							header.name.indexOf('X-Cnection') < 0 &&
							header.name.indexOf('X-Powered-By') < 0 &&
							header.name.indexOf('X-Cache') < 0 &&
							header.name.indexOf('X-Cache-Lookup') < 0) {
							tabInfo[tabId]['cdb'].calls[i]['debug'].push({key: header.name, value: header.value});
						}
					}
				}
			}
		}
	}

}, {urls: CDB_URL_FILTERS}, ["responseHeaders"]);



chrome.webRequest.onErrorOccurred.addListener(function(web_request) {

	var tabId = web_request.tabId;
	var requestId = web_request.requestId;

	if (is_url_in(web_request.url, CDB_URLS)) {
		if (tabInfo[tabId] && tabInfo[tabId]['cdb'] && tabInfo[tabId]['cdb'].calls) {
			for(var i in tabInfo[tabId]['cdb'].calls) {
				if (tabInfo[tabId]['cdb'].calls[i].request_id == requestId) {
					tabInfo[tabId]['cdb'].calls[i].ts_end = web_request.timeStamp;
					tabInfo[tabId]['cdb'].calls[i].time_ms = parseInt(tabInfo[tabId]['cdb'].calls[i].ts_end - tabInfo[tabId]['cdb'].calls[i].ts_start)+' ms';
					tabInfo[tabId]['cdb'].calls[i].status_line = web_request.error;
				}
			}
		}
	}

}, {urls: CDB_URL_FILTERS});


chrome.webRequest.onCompleted.addListener(function(web_request) {

	var tabId = web_request.tabId;
	var requestId = web_request.requestId;

	if (is_url_in(web_request.url, CDB_URLS)) {
		if (tabInfo[tabId] && tabInfo[tabId]['cdb'] && tabInfo[tabId]['cdb'].calls) {
			for(var i in tabInfo[tabId]['cdb'].calls) {
				if (tabInfo[tabId]['cdb'].calls[i].request_id == requestId) {
					tabInfo[tabId]['cdb'].calls[i].ts_end = web_request.timeStamp;
					tabInfo[tabId]['cdb'].calls[i].time_ms = parseInt(tabInfo[tabId]['cdb'].calls[i].ts_end - tabInfo[tabId]['cdb'].calls[i].ts_start)+' ms';
					tabInfo[tabId]['cdb'].calls[i].status_code = web_request.statusCode;
					tabInfo[tabId]['cdb'].calls[i].status_line = web_request.statusLine.replace(/HTTP\/\d\.\d /gi, '');
				}
			}
		}
	}


}, {urls: CDB_URL_FILTERS});

