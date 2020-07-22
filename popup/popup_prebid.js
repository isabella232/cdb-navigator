

function display_prebid_info(info, currentTab) {
    add_nav('Prebid', '#prebid');
    var timeline_full_width_ms = 3000;

    if (info.prebid.events && info.prebid.events.bidders) {
        for(var bidder in info.prebid.events.bidders) {
            info.prebid.events.bidders[bidder].css = {};
            // a little bit of fix here -- sometimes request_ts is empty, we'll take the default auction_start_ts
            info.prebid.events.bidders[bidder].request_ts = info.prebid.events.bidders[bidder].request_ts || info.prebid.events.auction_start_ts;
            info.prebid.events.bidders[bidder].response_time = info.prebid.events.bidders[bidder].response_ts - info.prebid.events.bidders[bidder].request_ts;

            info.prebid.events.bidders[bidder].css.left = (info.prebid.events.bidders[bidder].request_ts - info.prebid.events.auction_start_ts)/timeline_full_width_ms*100;
            info.prebid.events.bidders[bidder].css.width = (info.prebid.events.bidders[bidder].response_ts - info.prebid.events.bidders[bidder].request_ts)/timeline_full_width_ms*100;
        }
    }

    $('#content').append(prebid_template({
        PREBID_VERSION : info.prebid.version,
        PREBID_SLOTS : info.prebid.slots && info.prebid.slots.map(function(slot) {
            if (!slot.sizes || !isNaN(slot.sizes[0])) slot.sizes = [slot.sizes];
            return {
                SLOT_ELEMENT_ID : slot.code,
                SLOT_SIZE       : slot.sizes && slot.sizes.map(function(e) { 
                                    return e ? ($.isArray(e) ? e.map(function(e) { return e } ).join('x') : e) : 'Unknown size';
                                  }).join(', '),
                SLOT_BIDDERS    : slot.bids && slot.bids.map(function(bid) {
                    return {
                        BIDDER    : bid.bidder,
                        IS_CRITEO : bid.bidder=='criteo',
                        BIDS      : bid.cpm
                    }
                }),
                HAS_CRITEO      : slot.bids.filter(function(bid) { if (bid.bidder=='criteo') return bid; }).length>0
            }
        }),
        TIMEOUT : info.prebid.timeout || (info.prebid.config && info.prebid.config.bidderTimeout) || null,
        SEND_ALL_BIDS : info.prebid.send_all_bids || (info.prebid.config && info.prebid.config.enableSendAllBids),
        EVENTS : info.prebid.events,
        MISSING_ADUNITS : info.prebid.slots && info.prebid.slots.map(function(slot) {
            for (var i in slot.bids) {
                if (slot.bids[i].bidder !== 'criteo') {
                    return slot.code;
                }
            }
        }).filter(function(slot) { return slot }),
        PRICE_GRANULARITY : get_prebid_price_granularity(info),
        CRITEO_ADAPTER_VERSION : info.prebid.criteo_adapter_version || null
    }));
}



function get_prebid_price_granularity(info) {
    return info.prebid.config && info.prebid.config.priceGranularity != 'custom' ? info.prebid.config.priceGranularity : 
            info.prebid.config && info.prebid.config.customPriceBucket.buckets.map(function(e) {
                return e.min+'..'+e.max+':'+e.increment;
            }).join(';')
}



function is_cdb_prebid(info) {
    var profiles = get_cdb_integration_modes(info);
    if (!profiles) profiles = [];
    for(var p in profiles) {
        if (/Prebid/i.test(profiles[p])) return true;
    }
    return false;
}


