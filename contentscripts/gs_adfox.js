

(function() {

	var check_max_interval = 300000;
	var check_interval_ms = 1000;
	var check_start_time = (new Date()).getTime();

	var sha256_sent = null;

	var check_interval = setInterval(function() {

		try {

			if ((new Date()).getTime()-check_start_time > check_max_interval) {
				clearInterval(check_interval);
			}

			if (window.Ya && window.Ya.headerBidding) {

				var adfox_slots = {};

				var bids = window.Ya.headerBidding.getBidsReceived();
				for (var i in bids) {
					var bid = bids[i];

					if (!adfox_slots[bid.containerId]) adfox_slots[bid.containerId] = {};
					if (!adfox_slots[bid.containerId]['bids']) adfox_slots[bid.containerId]['bids'] = [];

					adfox_slots[bid.containerId]['bids'].push(bid);
				}


				var detail = {
					adfox : {
						slots : adfox_slots
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
	}, check_interval_ms);


})();
