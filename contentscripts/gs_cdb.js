

var Criteo = window.Criteo || {};
Criteo.events = Criteo.events || [];

(function() {

	var cdb_check_max_interval = 300000;
	var cdb_check_interval_ms = 1000;
	var cdb_check_start_time = (new Date()).getTime();

	var sha256_sent = null;

	Criteo.events.push(function() {

		var cdb_check_interval = setInterval(function() {

			try {

				if ((new Date()).getTime()-cdb_check_start_time > cdb_check_max_interval) {
					clearInterval(cdb_check_interval);
				}

				var price_granularity = null;
				if (typeof criteo_pubtag == 'object') {
					price_granularity = criteo_pubtag.standaloneBidder ? criteo_pubtag.standaloneBidder.lineItemRanges : null;
				}

				var detail = {
					cdb : {
						// Criteo Publisher Tag has been loaded
						// (Criteo.events has been converted from array to object with push)
						publisher_tag : Criteo.events.hasOwnProperty('push'),
						price_granularity : price_granularity
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
		}, cdb_check_interval_ms);

	});

})();
