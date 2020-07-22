

function display_general_info(info, currentTab) {
    $('#content').append(general_template({
        URL          : info.url,
        CDB_PROFILES : get_cdb_integration_modes(info),
        IS_STAGING   : chrome.runtime.id === 'pcgkocombfbjhhpofaahiaadgmkilobf' ||  // published in webstore by "irwan"
        				chrome.runtime.id === 'hanjpfeoaodanaedlnjbbdkpkfaachoc'    // the dev version
    }));

}