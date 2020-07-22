

function display_index_info(info, currentTab) {
    add_nav('Index', '#index');
    var index_slots = [];
    if (info.index.slots) {
        for(var devicetype in info.index.slots) {
            var slots = info.index.slots[devicetype];
            for(var slotid in slots) {
                index_slots.push({
                    SLOT_ID    : slotid,
                    ELEMENT_ID : slots[slotid].divId,
                    SIZE       : slots[slotid].sizeMapping['0x0'].map(function(s) { return s[0]+'x'+s[1]; }).join(', '),
                    BIDDERS    : get_index_bidders_by_slotid(info, slotid)
                });
            }
        }
    }
    $('#content').append(index_template({
        VERSION : info.index.version,
        INDEX_SLOTS : index_slots,
        SITE_ID : info.index.site_id,
        TIMEOUT : info.index.timeout,
        PRICE_GRANULARITY : get_index_price_granularity(info)

    }));
}

function get_index_price_granularity(info) {
    return info.index && info.index.partners && info.index.partners.CRTB && 
            info.index.partners.CRTB.roundingBuckets.buckets.map(function(bucket) { 
                return bucket.range[0]+'..'+bucket.range[1]+':'+bucket.granularity; 
            }).join(';');
}

function get_index_bidders_by_slotid(info, slotid) {
    var bidders = [];
    if (info.index.partners) {
        for (var partnerid in info.index.partners) {
            if (info.index.partners[partnerid][slotid]) {
                for (var i in info.index.partners[partnerid][slotid]) {
                    bidders.push({
                        BIDDER : partnerid,
                        PARAM  : JSON.stringify(info.index.partners[partnerid][slotid][i])
                    });
                }
            }
        }
    }
    return bidders;
}



function is_cdb_index(info) {
    var profiles = get_cdb_integration_modes(info);
    if (!profiles) profiles = [];
    for(var p in profiles) {
        if (/Index/i.test(profiles[p])) return true;
    }
    return false;
}

