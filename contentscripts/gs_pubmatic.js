

(function() {

	var check_max_interval = 300000;
	var check_interval_ms = 1000;
	var check_start_time = (new Date()).getTime();

	var sha256_sent = null;

	var events = {
		bidders : {}
	};
	
	var check_interval = setInterval(function() {

		try {

			if ((new Date()).getTime()-check_start_time > check_max_interval) {
				clearInterval(check_interval);
			}

			var PWT = window.PWT;

			if (typeof PWT == 'undefined') return;

			var bidMap = PWT.bidMap;
			var pubmatic_slots = [];

			if (bidMap) {
				for (var i in bidMap) {
					pubmatic_slots.push({
						slot_id 		: i,
						sizes 			: bidMap[i].sizes,
						impression_id 	: bidMap[i].impressionID,
						name 			: bidMap[i].name,
						adapters        : bidMap[i].adapters,
						expired         : bidMap[i].expired
					})
				}	
			}
			

			var detail = {
				pubmatic : {
					slots  			: pubmatic_slots
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

})();