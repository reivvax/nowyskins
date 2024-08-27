const qualityMapStringToInt = {
    "Normal": 4,
    "Souvenir": 1,
    "StatTrak": 2,
}

const qualityMapIntToString = {
    0: "Normal",
    1: "Souvenir",
    2: "StatTrak"
}

const exteriorMapStringToInt = {
    "Battle-Scarred": 0,
    "Well-Worn": 1,
    "Field-Tested": 2,
    "Minimal Wear": 3,
    "Factory New": 4,
}

const exteriorMapIntToString = {
    0: "Battle-Scarred",
    1: "Well-Worn",
    2: "Field-Tested",
    3: "Minimal Wear",
    4: "Factory New"
};

const rarityMapStringToInt = {

}

const rarityMapIntToString = {

}

module.exports = {
    qualityMapStringToInt,
    qualityMapIntToString,
    exteriorMapStringToInt,
    exteriorMapIntToString,
    rarityMapStringToInt,
    rarityMapIntToString,
}
