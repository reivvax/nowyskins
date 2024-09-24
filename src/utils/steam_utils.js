const isSteamId64 = function (id) {
    id = BigInt(id);
    const universe = id >> 56n;
    if (universe > 5n) return false;

    const instance = (id >> 32n) & (1n << 20n)-1n;

    // There are currently no documented instances above 4, but this is for good measure
    return instance <= 32n;
};

module.exports = {
    isSteamId64
};