
function display_pubmatic_info(info, currentTab) {
    add_nav('Pubmatic', '#pubmatic');

    $('#content').append(pubmatic_template({
        PUBMATIC_SLOTS : info.pubmatic.slots ? info.pubmatic.slots.map(function(slot) {
                return {
                    SLOT_ID      : slot.slot_id,
                    SLOT_SIZE    : slot.sizes ? slot.sizes.join(', ') : '',
                    SLOT_BIDDERS : slot.adapters ? Object.entries(slot.adapters).map(function(entry) {
                                var adapter = entry[1];
                                if (Object.entries(adapter.bids).length > 0) {
                                    return {
                                        BIDDER : adapter.adapterID,
                                        BIDS : adapter.bids ? Object.entries(adapter.bids).map(function(entry) {
                                                                    var bid = entry[1];
                                                                    return parseInt(bid.netEcpm*100)/100;
                                                                }).join(', ') : '',
                                        IS_WINNING : adapter.bids ? Object.entries(adapter.bids).map(function(entry) {
                                                                        var bid = entry[1];
                                                                        return bid.isWinningBid;
                                                                    }).filter(function(isWinningBid) {
                                                                        return isWinningBid;
                                                                    }).length>0 : false,
                                        IS_POSTTIMEOUT : adapter.bids ? Object.entries(adapter.bids).map(function(entry) {
                                                                        var bid = entry[1];
                                                                        return bid.isPostTimeout;
                                                                    }).filter(function(isPostTimeout) {
                                                                        return isPostTimeout;
                                                                    }).length>0 : false,
                                        IS_CRITEO : adapter.adapterID == 'criteo'
                                    }
                                }
                            }).filter(function(bidder) {return bidder} ) : [],

                    HAS_CRITEO : slot.adapters ? Object.entries(slot.adapters).map(function(entry) {
                                                    var adapter = entry[1];
                                                    return Object.entries(adapter.bids).length > 0 ? adapter.adapterID : false;
                                                }).filter(function(adapterID) {
                                                    if (adapterID == 'criteo') return adapterID;
                                                }).length>0 : false
                }
            }) : [],
        MISSING_ADUNITS : info.pubmatic.slots ? info.pubmatic.slots.map(function(slot) {
                if (Object.entries(slot.adapters).map(function(entry) {
                                var adapter = entry[1];
                                return Object.entries(adapter.bids).length > 0 ? adapter.adapterID : false;
                            }).filter(function(adapterID) {
                                if (adapterID == 'criteo') return adapterID;
                            }).length==0) {
                    return slot.slot_id
                }
            }).filter(function(slot) { return slot; }) : []
    }));
}


function is_cdb_pubmatic(info) {
    var profiles = get_cdb_integration_modes(info);
    if (!profiles) profiles = [];
    for(var p in profiles) {
        if (/Pubmatic/i.test(profiles[p])) return true;
    }
    return false;
}
