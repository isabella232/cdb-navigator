
var startTime = (new Date()).getTime();
var current_tab = null;
var current_tab_sha256 = null;
var current_tab_info = null;

var general_template;
var cdb_template;
var index_template;
var prebid_template;
var dfp_template;
var pubmatic_template;
var adfox_template;

var options;

var auth = { status : false };

$(document).ready(function() {

    async.series([
        function (next) {
            $.get('/popup/popup_header.html', function(html) { general_template = Handlebars.compile(html); next(); });
        },
        function (next) {
            $.get('/popup/popup_cdb.html', function(html) { cdb_template = Handlebars.compile(html); next(); });
        },
        function (next) {
            $.get('/popup/popup_dfp.html', function(html) { dfp_template = Handlebars.compile(html); next(); });
        },
        function (next) {
            $.get('/popup/popup_prebid.html', function(html) { prebid_template = Handlebars.compile(html); next(); });
        },
        function (next) {
            $.get('/popup/popup_index.html', function(html) { index_template = Handlebars.compile(html); next(); });
        },
        function (next) {
            $.get('/popup/popup_pubmatic.html', function(html) { pubmatic_template = Handlebars.compile(html); next(); });
        },
        function (next) {
            $.get('/popup/popup_adfox.html', function(html) { adfox_template = Handlebars.compile(html); next(); });
        },
        function (next) {
            // loads existing options
            chrome.storage.sync.get(null, function(items) {
                options = items;
                next();
            });
        },
        function (next) {
            $('#optionButton').click(function() {
            	chrome.runtime.openOptionsPage();
            });
            next();
        },
        function (next) {
            init();
        }
    ]);

});


function send_message(message, callback) {
    //console.log('Send Message: ', message);
    chrome.runtime.sendMessage(message, callback);
}

function init() {
    get_tab_info(function(currentTab) {
        check_tab_sha256(currentTab);
    });
}


function get_tab_info(callback) {

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        current_tab = tabs[0];
    
        send_message({ act : 'get_tab_info', tab : current_tab }, function(info) {
            console.log(info);
            if (info) current_tab_info = info;
            if (info.sha256) current_tab_sha256 = info.sha256;
            if (info.auth) auth = info.auth;
            redraw_tab();
            if (typeof callback == 'function') callback(current_tab);
        });

    });
}

function redraw_tab() {
	if (auth.domainActive) {
		main_display(current_tab_info, current_tab);
	}
}

function check_tab_sha256(currentTab) {
    var check_interval_ms = 500;
    if ((new Date()).getTime()-startTime <= 20000) {
        check_interval_ms = 500;
    } else if ((new Date()).getTime()-startTime <= 30000) {
        check_interval_ms = 1000;
    } else {
        check_interval_ms = 5000;
    }

    send_message({ act : 'get_tab_sha256', tab : currentTab }, function(info) {
        if (info.sha256 && current_tab_sha256!=info.sha256) {
            get_tab_info();
        }
    });

    setTimeout(function() {
        check_tab_sha256(currentTab);
    }, check_interval_ms);
}

function main_display(info, currentTab) {
    $('#content').empty();
    clear_nav();

    if (info)           try { display_general_info(info, currentTab);  } catch (ex) { gconsole.error(ex); }
    if (info.dfp)       try { display_dfp_info(info, currentTab);      } catch (ex) { gconsole.error(ex); }
    if (info.prebid)    try { display_prebid_info(info, currentTab);   } catch (ex) { gconsole.error(ex); }
    if (info.index)     try { display_index_info(info, currentTab);    } catch (ex) { gconsole.error(ex); }
    if (info.pubmatic)  try { display_pubmatic_info(info, currentTab); } catch (ex) { gconsole.error(ex); }
    if (info.adfox)     try { display_adfox_info(info, currentTab);    } catch (ex) { gconsole.error(ex); }
    if (info.cdb)       try { display_cdb_info(info, currentTab);      } catch (ex) { gconsole.error(ex); }
}

function get_cdb_integration_modes(info) {
    return info.cdb && info.cdb.calls && $.unique(info.cdb.calls.map(function(cdb) {
        return cdb.profile;
    }))
}


function limit_text(message, length) {
    var rand = Math.ceil(Math.random()*10000000000000);
    message = message.length <= length ? message : 
                (
                    message.substring(0, length)+
                    '<a href="" id="show_more_link_'+rand+'">...show more</a>'+
                    '<span id="show_more_'+rand+'" style="display:none">'+
                        message.substring(length, message.length)+
                    '</span>'
                )
    $('body').on('click', '#show_more_link_'+rand, function(e) {
        e.preventDefault();
        $('#show_more_'+rand).show();
        $(this).remove(); 
    });
    return message;
}



function is_url_in(url_to_find, url_set) {
    if (!url_to_find) return;

    for(var i in url_set) {
        if (typeof url_set[i] == 'string') {
            if (url_to_find.indexOf(url_set[i]) >= 0) return true;
        } else {
            if (url_set[i].test(url_to_find)) return true;
        }
    }
    return false;
}

function get_domain_from_url(url) {
    var a = document.createElement('a');
    a.href = url;
    return a.hostname.replace(/^www\./, '');
}


function clear_nav() {
    $('#header #nav ul').empty();
}

function add_nav(text, anchor) {
    $('#header #nav ul').append('<li><a href="" data-href="'+anchor+'">'+text+'</a></li>');
    $('#header #nav ul li a').off('click').on('click', function(e) {
        e.preventDefault();
        var target = $(this).data('href');
        $('html, body').stop().animate({scrollTop: $(target).offset().top-70}, 500, 'swing', function() {

        })
    })
}