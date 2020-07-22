
var headertag = window.headertag || {};
var headertagconfig = window.headertagconfig || {};

(function() {

	var index_check_max_interval = 300000;
	var index_check_interval_ms = 1000;
	var index_check_start_time = (new Date()).getTime();

	var sha256_sent = null;

	var index_check_interval = setInterval(function() {

		try {

			if ((new Date()).getTime()-index_check_start_time > index_check_max_interval) {
				clearInterval(index_check_interval);
			}

			if (headertagconfig && headertagconfig.partners) {
				var detail = {
					index : {
						version  : headertag.version,
						site_id  : headertagconfig.siteId,
						timeout  : headertagconfig.timeout,
						slots    : headertagconfig.htSlots,
						partners : headertagconfig.partners
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
	}, index_check_interval_ms);


})();
