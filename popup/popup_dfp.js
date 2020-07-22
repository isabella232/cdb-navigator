
function display_dfp_info(info, currentTab) {
    add_nav('DFP', '#dfp');
    $('#content').append(dfp_template({
        DFP_SLOTS : info.dfp.slots.map(function(slot) {
            return {
                SLOT_NAME         : slot.name,
                SLOT_ELEMENT_ID   : slot.element_id,
                SLOT_SIZE         : slot.sizes.join(', '),
                TARGETINGS        : slot.targeting.length > 0 ? slot.targeting.map(function(e) { return e.key+'='+(e.value?e.value:''); }) : [],
                ZONE_IDS          : get_cdb_zoneids_by_slotid(info, slot.element_id)
            };
        }),
        SRA      : info.dfp.sra,
        ASYNC    : info.dfp.async,
        FETCH_BEFORE_REFRESH : info.dfp.fetch_before_refresh,
        FETCH_BEFORE_KEYVALUE : info.dfp.fetch_before_keyvalue
    }));
    $('#dfp_open_console_btn').on('click', dfp_open_console);
}


function dfp_open_console() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        currentTab = tabs[0];
        chrome.tabs.executeScript(currentTab.id, {file: "/contentscripts/cs_dfp_openconsole.js"});
        window.close();
    });
}
