

function display_cdb_info(info, currentTab) {
    add_nav('CDB', '#cdb');
    $('#content').append(cdb_template({
        IS_STANDALONE : is_cdb_standalone(info),
        IS_INDEX      : is_cdb_index(info),
        IS_PREBID     : is_cdb_prebid(info),
        IS_PUBMATIC   : is_cdb_pubmatic(info),
        PRICE_GRANULARITY : get_cdb_price_granularity(info),
        PUBTAG_VERSION : info.cdb.pubtag_version || null,
        CDB_CALLS    : info.cdb.calls && info.cdb.calls.filter(function(cdb) { 
            // CURRENTLY THERE's DUAL REQUEST on SOME PUBLISHERS (e.g. weather.com, washingtonpost.com) WHEN SEEN FROM APAC
            // HOWEVER DOESN'T SEEM TO HAPPEN WHEN SEEN FROM THE US
            // THE FIRST REQUEST RESPONDED WITH 400 Service Worker Fallback Required
            // WE'LL REMOVE IT FOR NOW
            if (cdb.status_line != '400 Service Worker Fallback Required') {
                return cdb;
            }
        }).map(function(cdb) {
            return {
                URL          : cdb.request_uri,
                PUBLISHER    : cdb.publisher,
                SLOTS        : cdb.slots.map(function(slot) { 
                        return {
                            IMPID  : slot.impid,
                            ZONEID : slot.zoneid || null,
                            SIZES  : (slot.sizes || []).join(', ')
                        } 
                    }),
                DYNAMIC_SLOT : cdb.is_dynamic_slot || false,
                CDB_DEBUG    : cdb.debug ? cdb.debug.map(function(debug) {
                        return {
                            DEBUG_NAME  : debug.key,
                            DEBUG_VALUE : limit_text(debug.value, 200)
                        };
                    }) : [],
                TIME_MS      : cdb.time_ms,
                STATUS       : cdb.status_line,
                TOO_MANY_SLOTS : cdb.slots.length > 8
            }
        })
    }));
}


function get_cdb_price_granularity(info) {
    return info.cdb.price_granularity && info.cdb.price_granularity.length>0 ? info.cdb.price_granularity.map(function(bucket) {
                return bucket.lowerBound + '..' + bucket.upperBound + ':' + bucket.increment;
            }).join(';') : 'Unknown';
}


function get_cdb_zoneids_by_slotid(info, slotid) {
    var zone_ids = [];
    if (info.cdb && info.cdb.calls) {
        info.cdb.calls.forEach(function(cdb) {
            cdb.slots.forEach(function(s) {
                if (s.impid == slotid)
                    zone_ids.push(s.zoneid);
            })
        })
    }
    return zone_ids
}

function is_cdb_standalone(info) {
    var profiles = get_cdb_integration_modes(info);
    if (!profiles) profiles = [];
    for(var p in profiles) {
        if (/Standalone/i.test(profiles[p])) return true;
    }
    return false;
}


function is_cdb_index(info) {
    var profiles = get_cdb_integration_modes(info);
    if (!profiles) profiles = [];
    for(var p in profiles) {
        if (/Index/i.test(profiles[p])) return true;
    }
    return false;
}


function is_cdb_prebid(info) {
    var profiles = get_cdb_integration_modes(info);
    if (!profiles) profiles = [];
    for(var p in profiles) {
        if (/Prebid/i.test(profiles[p])) return true;
    }
    return false;
}
