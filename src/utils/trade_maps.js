const stateMap = {
    0: 'To be accepted by seller',
    1: 'Trade offer to be sent',
    2: 'To be accepted by buyer',
    3: 'Completed',
    4: 'Cancelled',
    'To be accepted by seller': 0,
    'Trade offer to be sent': 1,
    'To be accepted by buyer': 2,
    'Completed': 3,
    'Cancelled': 4
}

module.exports = {
    stateMap
}