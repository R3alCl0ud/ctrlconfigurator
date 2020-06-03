const fs = require("fs")


function loadColor(qmk_target) {
    return parseColor(fs.readFileSync(`${qmk_target}/color.c`).toString());
}


function parseColor(str) {
    
}

function loadKeymap(qmk_target) {
    const keymap_c = fs.readFileSync(`${qmk_target}/keymap.c`).toString().match(/keymaps\[\]\[MATRIX_ROWS\]\[MATRIX_COLS\] = \{([\s\S]+?)\};/m);
    if (!keymap_c) return "FAIL";
    const keymap = keymap_c[1].split(/\/\*|\*\//).filter((e, i) => !(i % 2)).join("");
    const layers = [...keymap.matchAll(/\[(.+?)\] = LAYOUT\(([\s\S]+?)^\s*?\)/gm)];
    const layerMaps = {map:{}, layers:{}, colors:{}};
    if (!layers.length) return "FAIL";
    //layers
    for (const layer of layers) {
        layerMaps.map[layer[1]] = layer[2].split(/[\\\n\s]+/).join(" ").split(",");
    }
    //layer_nums
    const layer_names_h = fs.readFileSync(`${qmk_target}/layer_names.h`).toString();
    for (const layerName in layerMaps.map) {
        const match = layer_names_h.match(new RegExp(`^\\s*?#define ${layerName} (.+)\\s*?$`, "m"));
        if (!match) return "FAIL";
        layerMaps.layers[layerName] = parseInt(match[1]);
    }
    //colors
    const  color_c = fs.readFileSync(`${qmk_target}/color.c`).toString();
    const color_h = fs.readFileSync(`${qmk_target}/color.h`).toString();
    let layerLights = color_c.match(/LidLayer LidLayers\[LAYER_COUNT\] = \{([\s\S]+?)};/m);
    if (!layerLights) return "FAIL";
    layerLights = layerLights[1].matchAll(/\[(.+)\] = \{([\s\S]+?)\}/gm);
    if (!layerLights) return "FAIL";
    for (const layer of layerLights) {
        if (layerMaps.map[layer[1]]) {
            const [color_layer_length, color_layer_name] = layer[2].split(/\/\/.+/).join("").split(",");
            let layer_colors = color_c.match(new RegExp(`${color_layer_name.trim()}\\[${color_layer_length.trim()}\\] = \\{([\\s\\S]+?)\\};`, "m"));
            if (!layer_colors) return "FAIL";
            layer_colors = layer_colors[1].match(/{.+?}/gm).map(e => e.split(/{|}/).join("").split(",")).map(e => {
                for (let i = 0; i < e.length; i++) {
                    e[i] = e[i].trim();
                    if (isNaN(parseInt(e[i]))) {
                        let mat = color_h.match(new RegExp(`#define ${e[i]} +?(.+)`, "m"));
                        if (mat) {
                            mat = mat[1].match(/(.+) \/\/.+|(.+)/);
                            mat = mat[1] ? mat[1] : mat[2];
                            e[i] = mat.trim();
                        }
                    } 
                    if (e[i].trim().startsWith("hex_to_color")) {
                        e[i] = parseInt(e[i].match(/hex_to_color\((.+)\)/)[1]);
                    } else if (isNaN(parseInt(e[i]))) {
                        const match = e[i].match(/{\s*(.+?),\s*(.+?),\s*(.+?)\s*}/);
                        e[i] = parseInt(match[1]) << 16 | parseInt(match[2]) << 8 | parseInt(match[3]) & 255;
                    } else {
                        e[i] = parseInt(e[i]);
                    }
                }
                return e;
            });
            layerMaps.colors[layer[1]] = layer_colors;
        }
    }
    return layerMaps;
}

module.exports = {
    loadKeymap: loadKeymap,
    loadColor: loadColor
}   