
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.act == 'reloadauth') {
        reloadAuth();
    }
});

var auth = {  };

reloadAuth();
setTimeout(function() {
    reloadAuth()
}, 10000);

function reloadAuth() {
    chrome.storage.sync.get('auth', function(item) {
        if (item && item.auth) {
            auth = item.auth;
        }
    });
}

function isDomainActive(domain) {
    return true;
}

