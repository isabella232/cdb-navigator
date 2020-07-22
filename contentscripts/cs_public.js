
document.addEventListener('gs_plus_cs', function(e) {
	chrome.runtime.sendMessage({
		act : 'contentscript',
		detail : e.detail 
	}, function(response) {
		
	});
});


function addScript(relative_url) {
	var s = document.createElement('script');
	s.src = chrome.extension.getURL(relative_url);
	(document.head || document.documentElement).appendChild(s);
	s.onload = function() { this.remove(); };
}

addScript('/contentscripts/gs_public.js');
