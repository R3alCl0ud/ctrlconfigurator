const fs = require("fs")

module.exports.parseColor = function(str) {
    
}

module.exports.parseKeymap = function(str) {
    str = str.split("\n").join(" ")
    const match = str.match(/keymaps\[\]\[MATRIX_ROWS\]\[MATRIX_COLS\] = \{(.+?)\};/);
    return match[1];
}