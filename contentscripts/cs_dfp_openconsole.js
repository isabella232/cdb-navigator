

var s = document.createElement('script');
s.innerHTML = `
	var googletag = googletag || {};
	googletag.cmd = googletag.cmd || [];

	googletag.cmd.push(function() {
		googletag.openConsole();
	});
`;
(document.head || document.documentElement).appendChild(s);
s.onload = function() { this.remove(); };
