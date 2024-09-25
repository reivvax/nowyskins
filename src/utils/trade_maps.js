const stateMapIntToString = {
    0: 'To be accepted by seller',
    1: 'Trade offer to be sent',
    2: 'To be accepted by buyer',
    3: 'Completed'
}

const stateMapStringToInt = {
    'To be accepted by seller': 0,
    'Trade offer to be sent': 1,
    'To be accepted by buyer': 2,
    'Completed': 3
}

module.exports = {
    stateMapIntToString,
    stateMapStringToInt
}