

function display_adfox_info(info, currentTab) {
    add_nav('Adfox', '#adfox');
    var adfox_slots = [];
    if (info.adfox.slots) {

        for (var slotid in info.adfox.slots) {
            var slot = info.adfox.slots[slotid];
            adfox_slots.push({
                SLOT_ID    : slotid,
                BIDS       : slot.bids.map(function(bid) {
                    return {
                        BIDDER  : bid.adapterName,
                        HAS_BID : bid.errorCode ? false : true,
                        CPM     : bid.cpm
                    }
                })
            })
        }
    }
    $('#content').append(adfox_template({
        ADFOX_SLOTS : adfox_slots,
    }));
}