

var googletag = window.googletag || {};
googletag.cmd = googletag.cmd || [];

(function() {

	var interesting_targetings = [
		'crt_pb', 'crt_bidid',  // CDB Standalone
		'hb_pb', 'hb_bidder', // CDB Prebid -- standard
		'hb_pb_criteo', 'hb_adid_criteo', // CDB Prebid -- specific bidder
		/^ix_.*om$/, // CDB Index - Criteo
		/^hb_pb_.*/, // Prebid - other bidders
		'pwtecp', 'pwtpid' // Pubmatic 
	];

	var start_time = (new Date()).getTime();

	// [until_seconds, interval_seconds]
	var check_intervals = [
		[60, 1],
		[600, 2],
		[3600, 5],
		[86400, 10]
	];

	var viewportWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    var viewportHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

	var sha256_sent = null;

	googletag.cmd.push(function() {
		dfp();
	});

	function dfp() {

		try {

			if (googletag.pubadsReady) {

				function is_interesting_targeting(key) {
					for(var i in interesting_targetings) {
						var interesting_key = interesting_targetings[i];
						if (typeof interesting_key == 'string') {
							if (key == interesting_key) return true;
						}
						if (typeof interesting_key == 'object' && typeof interesting_key.test == 'function') {
							if (interesting_key.test(key)) return true;
						}
					}
					return false;
				}

				var googletag_slots = [];

				var slots = googletag.pubads().getSlots();
				for(var s in slots) {
					if (slots.hasOwnProperty(s)) {
						var slot = slots[s];
						var targetingMap = slot.getTargetingMap();
						var slot_targeting = [];
						for(var t in targetingMap) {
							if (targetingMap.hasOwnProperty(t) && is_interesting_targeting(t)) {
								slot_targeting.push({key: t, value: (targetingMap && targetingMap[t] ? targetingMap[t].join(',') : '') }); // uses .join() because there's possiblity of multiple values in a single keyvalue https://jira.criteois.com/browse/GSTM-6740
							}
						}

						var sizes = slot.getSizes(viewportWidth, viewportHeight);
						if (!sizes) {
							sizes = slot.getSizes();
						}

						googletag_slots.push({
							element_id	: slot.getSlotElementId(),
							name		: slot.getAdUnitPath(),
							sizes		: sizes ? sizes.map(function(e) { return (typeof e == 'string') ? e : e.getWidth()+'x'+e.getHeight() }) : [],
							targeting	: slot_targeting
						});
					}
				}

				var is_sra = googletag.pubads().isSRA();
				var is_async = true;

				var is_fetch_before_refresh = false;
				var is_fetch_before_keyvalue = false;
				var refresh_index = null;
				var fetchslot_index = null;
				var keyvalue_index = null;

				var events = googletag.getEventLog().getAllEvents();
				for(var e in events) {
					var event = events[e];
					var message = (event && event.getMessage) ? event.getMessage() : null;
					var message_id = message ? message.getMessageId() : null;
					var message_args = message ? message.getMessageArgs() : null;

					if (message_id == 63 && message_args[0] == 'synchronous rendering') {
						is_async = false;
					}
					else if (message_id == 70) { // refreshing ads
						if (refresh_index == null) refresh_index = e;
					}
					else if (message_id == 3) { // fetching ad slot
						if (fetchslot_index == null) fetchslot_index = e;
					}
					else if (message_id == 17 && is_interesting_targeting(message_args[0])) { // Setting targeting attribute for ad slot
						if (keyvalue_index == null) keyvalue_index = e;
					}
				}

				if (refresh_index != null && fetchslot_index != null && parseInt(fetchslot_index) < parseInt(refresh_index)) {
					is_fetch_before_refresh = true;
				}

				if (keyvalue_index != null && fetchslot_index != null && parseInt(fetchslot_index) < parseInt(keyvalue_index)) {
					is_fetch_before_keyvalue = true;
				}

				var detail = {
					dfp : {
						slots   : googletag_slots,
						sra     : is_sra,
						async   : is_async,
						fetch_before_refresh : is_fetch_before_refresh,
						fetch_before_keyvalue : is_fetch_before_keyvalue
					}
				};

				var sha256_now = typeof sha256 == 'function' ? sha256(JSON.stringify(detail)) : JSON.stringify(detail).length;
				if (sha256_now != sha256_sent) {
					sha256_sent = sha256_now;
					document.dispatchEvent(new CustomEvent('gs_plus_cs', {
						detail: detail
					}));
				}
				
			}


		} catch (e) {
			gconsole.error(e);
		}

		var interval_second = null;
		for(var i=0;i<check_intervals.length;i++) {
			var until_seconds = check_intervals[i][0];
			var now_time = (new Date()).getTime();
			if (now_time - start_time <= until_seconds*1000) {
				interval_second = check_intervals[i][1];
				break;
			}
		}

		if (interval_second) {
			setTimeout(function() {
				dfp();
			}, interval_second*1000);	
		}
	}

})();
