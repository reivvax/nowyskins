function validateEmail(email) {
    var regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
}

function validateTradeLink(tradelink) {
    regex = /^https:\/\/steamcommunity\.com\/tradeoffer\/new\/\?partner=(\d+)&token=[a-zA-Z0-9]{8}$/;
    const match = tradelink.match(regex);
    const steamIDBase = 76561197960265728;
    return match != null && match.length >= 2 && parseInt(match[1], 10) + steamIDBase == user.steam_id;
}