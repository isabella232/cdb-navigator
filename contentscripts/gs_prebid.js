
var pbjs = window.pbjs || {};
pbjs.que = pbjs.que || [];

(function() {

	var check_max_interval = 300000;
	var check_interval_ms = 1000;
	var check_start_time = (new Date()).getTime();

	var sha256_sent = null;

	pbjs.que.push(function() {
		
		var check_interval = setInterval(function() {

			try {

				var events = {};
				events.bidders = {};

				if ((new Date()).getTime()-check_start_time > check_max_interval) {
					clearInterval(check_interval);
				}

				var prebid_config = {};
				if (typeof pbjs.getConfig == 'function') {
					prebid_config = pbjs.getConfig();
				}

				var prebid_slots = pbjs.adUnits.slice(0); // clone array

				var all_bid_responses = pbjs.getBidResponses();

				var prebid_bids = [];

				if (prebid_bids.length==0 && pbjs._bidsReceived) { // Removed in Prebid 1.0
					prebid_bids = pbjs._bidsReceived;
				}

				if (prebid_bids.length==0 && prebid_slots.length > 0) { // if pbjs.adUnits exists, we'll retrieve individually
					for(var i in prebid_slots) {
						if (!prebid_slots.hasOwnProperty(i)) continue;
						var bid_responses = pbjs.getBidResponsesForAdUnitCode(prebid_slots[i].code);
						for(var b in bid_responses.bids) {
							if (!bid_responses.bids.hasOwnProperty(b)) continue;
							prebid_bids.push(bid_responses.bids[b]);
						}
					}
				}

				if (prebid_bids.length==0 && Object.keys(all_bid_responses).length > 0) {
					for(var slot_id in all_bid_responses) {
						if (!all_bid_responses.hasOwnProperty(slot_id)) continue;
						for (var b in all_bid_responses[slot_id].bids) {
							if (!all_bid_responses[slot_id].bids.hasOwnProperty(b)) continue;
							prebid_bids.push(all_bid_responses[slot_id].bids[b]);
						}
					}
				}

				// Process bids

				for(var i in prebid_bids) {

					var bid = prebid_bids[i];

					if (!bid.bidderCode) continue;

					// consolidating CPMs into pbjs.adUnits
					for(var j in prebid_slots) {
						if (prebid_slots.hasOwnProperty(j)) {
							var s = prebid_slots[j];
							if (s.code == bid.adUnitCode) {
								for(var k in s.bids) {
									if (s.bids[k].bidder == bid.bidder && typeof prebid_slots[j].bids[k].cpm == 'undefined') {
										prebid_slots[j].bids[k].cpm = parseInt(bid.cpm*100)/100;
										break;
									}
								}
							}
						}
					}

	                events.bidders[bid.bidderCode] = events.bidders[bid.bidderCode] || {
	                    request_ts : bid.requestTimestamp,
	                }

					if (bid.responseTimestamp) {
						events.bidders[bid.bidderCode]['response_ts'] = events.bidders[bid.bidderCode]['response_ts'] || bid.responseTimestamp;
						if (events.bidders[bid.bidderCode]['response_ts'] > bid.responseTimestamp) {
							events.bidders[bid.bidderCode]['response_ts'] = bid.responseTimestamp;
						}
					}
					
					events.bidders[bid.bidderCode]['response_time'] = 
						events.bidders[bid.bidderCode]['response_ts'] - 
						events.bidders[bid.bidderCode]['request_ts'];

					if (bid.requestTimestamp) {
						events['auction_start_ts'] = events['auction_start_ts'] || bid.requestTimestamp;
						if (events['auction_start_ts'] > bid.requestTimestamp) {
							events['auction_start_ts'] = bid.requestTimestamp;
						}
					}
				}

				for(var e in events.bidders) {
					if (events.bidders.hasOwnProperty(e)) {
						var bidder = events.bidders[e];
						bidder.request_ts = bidder.request_ts || events.auction_start_ts;
					}
				}
				

				// ordering bidders based on request_ts
				var bidderOrders = {};
				for(var e in events.bidders) {
					if (events.bidders.hasOwnProperty(e)) {
						var bidder = events.bidders[e];
						bidderOrders[e] = bidder.request_ts;
					}
				}
				var biddersSorted = Object.keys(bidderOrders).sort(function(a,b){return bidderOrders[a]-bidderOrders[b]});
				var bidders_tmp = events.bidders;
				events.bidders = {};
				for(var b in biddersSorted) {
					events.bidders[biddersSorted[b]] = bidders_tmp[biddersSorted[b]];
				}

				var detail = {
					prebid : {
						version         : pbjs.version,
						slots  			: prebid_slots,
						timeout 		: typeof PREBID_TIMEOUT != 'undefined' ? PREBID_TIMEOUT : null,
						send_all_bids	: pbjs._sendAllBids, // this will be removed in Prebid 1.0 (popup_prebid.js fallback to prebid_config)
						events  		: events,
						config          : prebid_config
					}
				};

				var sha256_now = typeof sha256 == 'function' ? sha256(JSON.stringify(detail)) : JSON.stringify(detail).length;
				if (sha256_now != sha256_sent) {
					sha256_sent = sha256_now;
					document.dispatchEvent(new CustomEvent('gs_plus_cs', {
						detail: detail
					}));
				}

			} catch (e) {
				gconsole.error(e);
			}
		}, check_interval_ms);


	});

})();