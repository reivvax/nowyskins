/**
* Contains methods to be used to generate market hash names.
*/

var stattrackString = "StatTrak™";
var souvenirString = "Souvenir";
var starString = "★";
var foilString = "(Foil)";
var stickerString = "Sticker |";
var caseString = "Case"
var caseKeyString = "Case Key";
var keyString = "Key";
var specialItem = 3;
var normalItem = 4;
var stattrakItem = 9;
var souvenirItem = 12;

var qualityMap = {
  3: starString,
  4: '',
  9: stattrackString,
  12: souvenirString
}

/**
 * Helper method to format URL for weapon request.
 */
exports.gunHash = function (wep, skin, wear, quality) {
  var url = '';
  url += qualityMap[quality] ? qualityMap[quality] + ' ' : ''; 
  return url + wep + ' | ' + skin + ' (' + wear + ')';
};

/**
* Helper method to format URL for knife request.
*/
exports.knifeHash = function(knife, skin, wear, quality) {
	var url = starString + ' ';
	url += quality === stattrakItem ? stattrackString + ' ' : ''; 
	url += knife;
	if (skin === null) {
	  return url;
	} else {
	  return url += ' | ' + skin + ' (' + wear + ')';
	}
};

/**
* Helper method to format URL for sticker request.
*/
exports.stickerHash = function(stickerName, foil) {
  if (foil) {
    if (stickerName.indexOf('|') === -1) {
      // This is a regular foil sticker. Ex: 'Sticker | Robo (Foil)'
      return stickerString
        + ' ' + stickerName
        + ' ' + foilString;
    } else {
      /*
      * This is a player sticker with foil.
      * Split the name and event/year up into two parts.
      * Ex: 'Sticker | kennyS (Foil) | Cologne 2015'
      */
      var splitStickerName = stickerName.split(' | ');
      return stickerString
        + ' ' + splitStickerName[0]
        + ' ' + foilString
        + ' | '
        + splitStickerName[1];
    }
  } else {
    // This is a regular sticker with no foil. Ex: 'Sticker | Robo'
    return stickerString
      + ' ' + stickerName;
  }
};

exports.caseHash = function(name) {
  return name + ' ' + caseString;
}

exports.glovesHash = function(wep, skin, wear) {
  return starString + ' ' + wep + ' | ' + skin + ' (' + wear + ')';
}

exports.agentHash = function(name, skin) {
  return name + ' | ' + skin;
}

/**
* Helper method to format URL for key request.
*/
exports.keyHash = function(key) {
  return key.indexOf('eSports') < 0 ?
    (
      key + ' ' + caseKeyString
    ):
    (
      key + ' ' + keyString
    )
}