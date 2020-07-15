const fs = require("fs-extra");
const {zip} = require("zip-a-folder");

function genProfile(target) {
    copySync(__dirname + "/qmk_default/", target);
}

async function saveKeymap(keymaps, qmk_target) {
    return new Promise((Resolve, Reject) => { 
        try {
            if (!fs.existsSync(qmk_target) || !fs.readdirSync(qmk_target).length) {
                writeKeymap(keymaps, qmk_target); 
                return Resolve();
            }
            console.log("starting backup!");
            zip(qmk_target, `${qmk_target}_old_${new Date().toISOString().split(":").join(";")}.zip`).then(() => {
                writeKeymap(keymaps, qmk_target); 
                Resolve();
            }).catch((err) => {
                console.log(err);
                Reject(err);
            });
        } catch(e) {
            console.log(e);
            Reject(e);
        }
    });
}


function writeKeymap(keymaps, qmk_target) {
    console.log("saved backup!");
    // console.log(process.cwd());
    // console.log(__dirname); 
    let file = null;
    
    fs.copySync(__dirname+"/qmk_templates/", qmk_target);
    fs.readdirSync(qmk_target).forEach(e => {
        if (e.includes("_template")) {
            fs.unlinkSync(qmk_target+`/${e}`);
        }
    });

    file = (fs.readFileSync(__dirname + "/qmk_templates/keymap_template.c")).toString();
    file = file.replace("REPLACE_WITH_KEYMAP", keymapsToString(keymaps.map));
    // console.log(file);
    fs.writeFileSync(`${qmk_target}/keymap.c`, file.split("\t").join("    "));

    
    
    file = (fs.readFileSync(__dirname + "/qmk_templates/layer_names_template.h").toString());
    file = file.replace("REPLACE_LAYER_NAME_DEFINES", Array.from(keymaps.layers.keys()).map(e => `#define ${e} ${keymap.layers.get(e)}`).join("\n"))
                .replace("REPLACE_LAYER_COUNTER", keymaps.layers.size);
    // console.log(file);
    fs.writeFileSync(`${qmk_target}/layer_names.h`, file.split("\t").join("    "));

    
    
    file = (fs.readFileSync(__dirname + "/qmk_templates/color_template.h").toString());
    file = file.replace("REPLACE_COLOR_COUNTS", Array.from(keymaps.colors.keys()).map(e => `#define L${e} ${keymap.colors.get(e).length}`).join("\n"));
    // console.log(file);
    fs.writeFileSync(`${qmk_target}/color.h`, file.split("\t").join("    "));
    


    file = (fs.readFileSync(__dirname + "/qmk_templates/color_template.c").toString());
    
    let layerColor = [];
    keymap.colors.forEach((l, ln) => {
        layerColor.push(colorLayerToRaw(l, ln));
    });
    
    file = file.replace("REPLACE_WITH_LAYER_COLOR", layerColor.join("\n\n"))
                .replace("REPLACE_WITH_LAYER_ARRAYS", colorLayerMapRaw(Array.from(keymaps.colors.keys())));
    // console.log(file);
    fs.writeFileSync(`${qmk_target}/color.c`, file.split("\t").join("    "));
}


function keymapsToString(maps) {
    arr = [];
    maps.forEach((val, key) => {
        arr.push(layerToString(val, key));
    });
    return `const uint16_t PROGMEM keymaps[][MATRIX_ROWS][MATRIX_COLS] = {\n${arr.join(",\n")}\n};`
}

function colorLayerToRaw(layer, lname) {
    let a = [];
    for (let l of layer) {
        a.push(`\t{${l[0]}, ${l[1]}, hex_to_color(${l[2]})}`);
    }
    return `LidColor ${lname}_Colors[L${lname}] = {\n${a.join(",\n")}\n};`;
}

function colorLayerMapRaw(layer_names) {
    let layers = [];
    for (let lname of layer_names) {
        layers.push(`\t[${lname}] = { L${lname},\n\t\t${lname}_Colors\n\t}`);
    }
    return layers.join(",\n");
    // [_MUSE] = { L_MUSE, 
    //     _MUSE_Colors
    // }
}

function layerToString(layer, index) {
    copy = layer.map(e => "" + e.trim());
    return `\t[${index}] = LAYOUT(
        ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()},            ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, \\
        ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()},   ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, \\
        ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()},   ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, \\
        ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, \\
        ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()},                              ${copy.shift()}, \\
        ${copy.shift()}, ${copy.shift()}, ${copy.shift()},                   ${copy.shift()},                            ${copy.shift()}, ${copy.shift()}, ${copy.shift()}, ${copy.shift()},            ${copy.shift()}, ${copy.shift()}, ${copy.shift()} \\
    )`;
}


function loadKeymap(qmk_target) {
    const keymap_c = fs.readFileSync(`${qmk_target}/keymap.c`).toString().match(/keymaps\[\]\[MATRIX_ROWS\]\[MATRIX_COLS\] = \{([\s\S]+?)\};/m);
    if (!keymap_c) return "FAIL";
    const keymap = keymap_c[1].split(/\/\*|\*\//).filter((e, i) => !(i % 2)).join("");
    const layers = [...keymap.matchAll(/\[(.+?)\] = LAYOUT\(([\s\S]+?)^\s*?\)/gm)];
    const layerMaps = {map:new Map(), layers:new Map(), colors:new Map()};
    if (!layers.length) return "FAIL";
    //layers
    for (const layer of layers) {
        layerMaps.map.set(layer[1], layer[2].split(/[\\\n\s]+/).join(" ").split(",").map(e => e.trim()));
    }
    //layer_nums
    const layer_names_h = fs.readFileSync(`${qmk_target}/layer_names.h`).toString();
    for (const layerName of layerMaps.map.keys()) {
        const match = layer_names_h.match(new RegExp(`^\\s*?#define ${layerName} (.+)\\s*?$`, "m"));
        if (!match) return "FAIL";
        layerMaps.layers.set(layerName, parseInt(match[1]));
    }
    //colors
    const  color_c = fs.readFileSync(`${qmk_target}/color.c`).toString();
    const color_h = fs.readFileSync(`${qmk_target}/color.h`).toString();
    let layerLights = color_c.match(/LidLayer LidLayers\[LAYER_COUNT\] = \{([\s\S]+?)};/m);
    if (!layerLights) return "FAIL";
    layerLights = layerLights[1].matchAll(/\[(.+)\] = \{([\s\S]+?)\}/gm);
    if (!layerLights) return "FAIL";
    for (const layer of layerLights) {
        if (layerMaps.map.has(layer[1])) {
            const [color_layer_length, color_layer_name] = layer[2].split(/\/\/.+/).join("").split(",");
            let layer_colors = color_c.match(new RegExp(`${color_layer_name.trim()}\\[${color_layer_length.trim()}\\] = \\{([\\s\\S]+?)\\};`, "m"));
            if (!layer_colors) return "FAIL";
            layer_colors = (layer_colors[1].match(/{.+?}/gm)?.map?.(e => e.split(/{|}/).join("").split(",")) || []).map(e => {
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
            layerMaps.colors.set(layer[1], layer_colors);
        }
    }
    
    return layerMaps;
}

module.exports = {
    loadKeymap,
    saveKeymap,
    genProfile
}   