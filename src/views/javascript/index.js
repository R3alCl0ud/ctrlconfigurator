const qmk = require("./javascript/backend.js");
const { createFile, fstat, existsSync, copySync } = require("fs-extra");
const { dialog } = require("electron").remote;

let keymap = undefined; // map as loaded in from file

let curLayer = undefined;

const KB_ASPECT_RATIO = 14 / 5;
let pickr;
let SelectedKey;
const layerRegex = /(MO|DF|OSL|TG|TO|TT)\((.+?)\)/;

function createProfile() {
    let target = dialog.showOpenDialogSync({
        properties: ['openDirectory']
    });
    if (target !== undefined) {
        try {
            target = target[0].split(/\\|\//).join("/");
            qmk.genProfile(target);
            localStorage.targetFolder = target;
            setFolder(false);
            if (!keymap) {
                swal({
                    text: "Failed to create new profile",
                    icon: "error"
                });
            } else {
                swal({
                    text: "Created New Profile",
                    icon: "success"
                });
            };
        } catch (e) {
            swal({
                title: "Failed to create new profile",
                text: e.toString(),
                icon: "error"
            });
        }
    }
}

function saveAsProfile() {
    if (!keymap) return;
    let target = dialog.showOpenDialogSync({
        properties: ['openDirectory']
    });
    if (target !== undefined) {
        target = target[0].split(/\\|\//).join("/");
        qmk.saveKeymap(keymap, target).catch(e => {
            swal({
                text: "Failed to create new profile",
                icon: "error"
            });
        }).then(() => {
            swal({
                text: "Created New Profile",
                icon: "success"
            });
            localStorage.targetFolder = target;
        });
    }
}


function setFolder(fi) {
    let target = undefined;
    if (fi !== false)
        target = dialog.showOpenDialogSync({
            properties: ['openDirectory']
        });
    if (target === undefined) target = localStorage.targetFolder;
    else {
        target = target[0].split(/\\|\//).join("/");
    }
    if (!target || !existsSync(target)) return;

    localStorage.targetFolder = target;

    keymap = qmk.loadKeymap(target);
    console.log(keymap);
    if (keymap === "FAIL") {
        keymap = undefined;
        return swal({
            text: "Failed to import keyboard profile",
            icon: "error",
        });
    }
    // for (keymap)
    layerList.innerHTML = ""
    keyLayers.innerHTML = ""
    // layerList.innerHTML = '<button onclick="createLayer(\'_New_Layer\')" id="addLayerBtn" class="btn btn-primary btn-lg"> Add Layer</button>';
    let layers = []
    keymap.layers.forEach((layer, lname) => {
        if (layer >= layers.length) layers.push(lname);
        else layers = layers.slice(0, layer).concat([lname], layers.slice(layer));
    });

    for (let lname of layers) {
        addLayer(lname);
    }

    if (layers.length) setLayer(layers[0]);

    // for (const lname in keymap.layers) {
    //     if (keymap.layers[lname] > layers.length) layers.push(lname);
    //     else layers = layers.slice(0, keymap.layers[lname]) + [lname] + layers.slice(keymap.layers[lname]);
    // }
    // for (const lname in keymap.layers) {
    //     addLayer(lname, keymap.layers[lname]);
    // }

    //deep copy biatch
    // modMap = JSON.parse(JSON.stringify(keymap));
}

function makeKeymap() {
    if (curLayer) saveLayerColor();
    if (localStorage.targetFolder !== undefined)
        qmk.saveKeymap(keymap, localStorage.targetFolder).then(() => swal({ text: "Sucessfully saved keymap", icon: "success" })).catch(e => swal({ text: "Failed to save keymap!", icon: "error" }));
}

function intToHex(i) {
    i = (i & 0xFFFFFF).toString(16);
    while (i.length < 6) i = "0" + i;
    // console.log(i);
    return "#" + i;
}

function hexToInt(hex) {
    return parseInt(hex.replace("#", ""), 16);
}

function rgbToInt(rgb) {
    m = rgb.match(/rgb\((\d+), (\d+), (\d+)\)/);
    if (m) {
        return ((parseInt(m[1]) & 0xFF) << 16) | ((parseInt(m[2]) & 0xFF) << 8) | (parseInt(m[3]) & 0xFF);
    } else {
        return 0;
    }
}

function invert(color) {
    const r = (0xFF - ((color >> 16) & 0xFF)) << 16;
    const g = (0xFF - ((color >> 8) & 0xFF)) << 8;
    const b = 0xFF - ((color) & 0xFF);
    //console.log("RGB: "+ (r|g|b).toString(16));
    return r | g | b;
}

function contrastColor(hexcolor) {

    // Convert to RGB value
    const c = parseInt(hexcolor.replace("#", ""), 16);
    const r = (c >> 16) & 255;
    const g = (c >> 8) & 255;
    const b = c & 255;

    // Get YIQ ratio
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

    // Check contrast
    return (yiq >= 128) ? 'black' : 'white';

}

function saveLayerColor() {
    const arr = [];
    for (let i = 0; i < 87; i++) {
        const color = rgbToInt(document.getElementById(`key${i}`).style.backgroundColor);
        if (color) {
            if (arr.length > 0 && arr[arr.length - 1][2] == color && arr[arr.length - 1][0] + arr[arr.length - 1][1] == i) {
                arr[arr.length - 1][1] += 1;
            } else {
                arr.push([i, 1, color]);
            }
        }
    }
    console.log(arr);
    // modMap.colors.set(curLayer, arr);
    keymap.colors.set(curLayer, arr);
}

function setKey() {
    if (!curLayer || !keymap) return;

    keymap.map.get(curLayer)[parseInt(SelectedKey.id.replace("key", ""))] = kname.value;
    SelectedKey.innerHTML = `<div>${kname.value.replace("KC_", "")}</div>`;
}

function setClickedRadioKey(id) {
    if (!curLayer || !keymap) return;

    for (const input of document.getElementsByClassName("keycodeRadio")) {
        if (input.id !== id) {
            input.checked = false;
            input.parentElement.className = "btn btn-info"
        }
    }

    if (/(MO|DF|OSL|TG|TO|TT)/.test(id)) {
        console.log(id)
        let layer = "";
        for (const input of document.getElementsByClassName("layerRadio")) {
            console.log(input.parentElement)
            if (input.parentElement.className.includes("active")) {
                layer = input.id.replace("toggle", "");
            }
        }
        console.log(layer)
        keymap.map.get(curLayer)[parseInt(SelectedKey.id.replace("key", ""))] = `${id}(${layer})`;
        SelectedKey.innerHTML = `<div>${id}(${layer})</div>`;
    } else {
        for (const input of document.getElementsByClassName("layerRadio")) {
            input.checked = false;
            input.parentElement.className = "btn btn-info"
        }
        keymap.map.get(curLayer)[parseInt(SelectedKey.id.replace("key", ""))] = id;
        SelectedKey.innerHTML = `<div>${id.replace("KC_", "").replace("_______", "TRNS")}</div>`;
    }
}

function setClickedLayerKey(layer) {
    if (!curLayer || !keymap) return;

    for (const input of document.getElementsByClassName("toggleCode")) {
        if (input.parentElement.className.includes("active")) {
            keymap.map.get(curLayer)[parseInt(SelectedKey.id.replace("key", ""))] = `${input.id}(${layer})`;
            SelectedKey.innerHTML = `<div>${input.id}(${layer})</div>`;
            return;
        }
    }
    let layerRadio = document.getElementById(`toggle${layer}`);
    layerRadio.checked = false;
    layerRadio.parentElement.className = "btn btn-info";
    // SelectedKey.children[0].innerHTML = SelectedKey.children[0].innerHTML.replace(/\(.+?\)/, "") + `(${layer})`;
}

function setLayer(name) {
    if (keymap !== undefined && keymap.map.has(name)) {
        if (curLayer && curLayer != name) saveLayerColor();
        curLayer = name;
        // lname.value = curLayer.split("_").join(" ").trim();
        for (let i = 0; i < 87; i++) {
            const e = document.createElement("div");
            const key = document.getElementById("key" + i);
            e.innerHTML = keymap.map.get(name)[i].split(/KC_/).join('').split('_______').join('TRNS').trim();
            key.innerHTML = "";
            key.appendChild(e);
            key.style.backgroundColor = "#000000";
            key.style.color = "#FFFFFF";
            e.addEventListener("click", () => { e.parentNode.click() });
        }

        if (keymap.colors.has(name)) {
            keymap.colors.get(name).map(color => {
                for (let i = color[0]; i < color[0] + color[1] && i < 87; i++) {
                    document.getElementById("key" + i).style.backgroundColor = intToHex(color[2]);
                    document.getElementById("key" + i).style.color = contrastColor(intToHex(color[2]));
                }
            });
        }

        layerPill = document.getElementById(`layer${name}`)
        if (layerPill) {
            layerPill.className = "btn btn-primary active"
        }

        for (const child of layerList.children) {
            if (child.id !== `layer${name}`) {
                child.className = "btn btn-primary";
            }
        }
    }
}

function createNewLayer() {
    swal({
        title: "Create New Layer",
        content: {
            element: "input",
            attributes: {
                placeholder: "New Layer"
            }
        }
    }).then(name => {
        if (name.trim().length > 0) {
            name = '_' + name.trim().split(/\s+|\.+|\:+|_+/).join("_");
            createLayer(name);
            setLayer(name);
        } else {
            swal({
                text: "Cannot create a layer with no name",
                icon: "error",
            });
        }
    });
}

function createLayer(name) {
    if (keymap.layers.has(name)) {
        swal({
            text: `Cannot create a layer called \n\n${name}\n\n as it already exists.`,
            icon: "error",
        });
    } else if (keymap.layers.size >= 16) {
        swal({
            text: `Cannot create a new layer as the layer limit (16) has been reached.`,
            icon: "error",
        });
    } else {
        if (layerList.children.length >= 16) {
            swal({
                text: `Cannot create a new layer as the layer limit (16) has been reached.`,
                icon: "error",
            });
            return;
        }
        keymap.layers.set(name, layerList.children.length);
        keymap.colors.set(name, []);
        keymap.map.set(name, []);
        for (let i = 0; i < 87; i++) {
            keymap.map.get(name)[i] = '_______';
        }
        addLayer(name);
    }
}

function copyLayer() {
    if (!curLayer || !keymap) return;
    if (layerList.children.length >= 16) {
        swal({
            text: `Cannot create a new layer as the layer limit (16) has been reached.`,
            icon: "error",
        });
        return;
    }
    swal({
        title: "Copying Layer",
        text:"Enter name of new layer",
        content: {
            element: "input",
            attributes: {
                placeholder: `${curLayer}_COPY`
            }
        }
    }).then(name => {
        if (name.trim() > 0) {
            name = '_' + name.trim().split(/\s+|\.+|\:+|_+/).join("_");
        } else {
            name = curLayer + "_COPY"
        }
        if (keymap.layers.has(name)) {
            swal({
                text: `Cannot create a layer called \n\n${name}\n\n as it already exists.`,
                icon: "error",
            });
            return;
        }
        keymap.layers.set(name, layerList.children.length);
        keymap.colors.set(name, JSON.parse(JSON.stringify(keymap.colors.get(curLayer))));
        keymap.map.set(name, JSON.parse(JSON.stringify(keymap.map.get(curLayer))));
        addLayer(name);
        setLayer(name);
    });
}

function setLayerName() {
    if (curLayer && keymap) {
        let newname = "_" + document.getElementById("lname").value.trim().split(/\s+|\.+|\:+/).join("_");
        let a = document.getElementById(`layer${curLayer}`);
        a.innerHTML = `<input type="radio" name="layers" id="${newname}" onclick="setLayer('${newname}')" autocomplete="off">${newname.split("_").join(" ").trim()}</input><div class="button btn deleteLayerBtn btn-danger" onclick="deleteLayer('${newname}')" id="d${newname}">&times;</div>`;
        a.id = `layer${newname}`;
        keymap.map.forEach(map => {
            for (let i in map) {
                if (map[i].includes(curLayer))
                    map[i] = map[i].replace(curLayer, newname);
            }
        });
        keymap.map.set(newname, keymap.map.get(curLayer));
        keymap.map.delete(curLayer);
        keymap.colors.set(newname, keymap.colors.get(curLayer));
        keymap.colors.delete(curLayer);
        keymap.layers.set(newname, keymap.layers.get(curLayer));
        keymap.layers.delete(curLayer);
        curLayer = newname;
    } else {
        swal("Please Select a Layer", "Cannot change name of layer UNDEFINED", "warning");
    }
    return false;
}

function deleteLayer() {
    let name = curLayer;
    if (keymap.layers.size > 1) {
        let index = (keymap.layers.size - 1) - keymap.layers.get(name);
        if (index == keymap.layers.size - 1) index = keymap.layers.size - 3;
        setLayer(layerList.children[index + 1].id.replace("layer", ""))

        // if (name == layerList.children[layerList.children.length - 1].id.replace("layer", "")) {
        //     setLayer(layerList.children[layerList.children.length - 2].id.replace("layer", ""));
        // } else {
        //     setLayer(layerList.children[layerList.children.length - 1].id.replace("layer", ""));
        // }

        document.getElementById("layer" + name).remove();
        document.getElementById("toggle" + name).parentElement.remove();
        keymap.map.delete(name);
        keymap.colors.delete(name);
        keymap.layers.delete(name);

        //fix numbering on layers
        index = layerList.children.length;
        for (const child of layerList.children) {
            keymap.layers.set(child.id.replace("layer", ""), --index);
        }
    } else {
        //create layer
        //set cur to new
        //delete old layer

        //temp:
        swal({
            text: "Cannot delete last layer",
            icon: "error",
        });
    }
}

function addLayer(name) {
    if (layerList.children.length >= 16) return;
    const a = document.createElement("label");
    // console.log(a);
    // a.onclick = () => setLayer(name);
    console.log(name);
    a.draggable = true;
    a.className = "btn btn-primary";
    a.innerHTML = `<input type="radio" name="layers" id="${name}" onclick="setLayer('${name}')" autocomplete="off">${name.split("_").join(" ").trim()}</input>`;
    a.id = `layer${name}`;
    layerList.prepend(a);
    const listKeys = document.createElement("label");
    listKeys.className = "btn btn-info";
    if (keyLayers.children.length === 0) {
        listKeys.className += " active"
    }
    listKeys.innerHTML = `<input class="layerRadio" type="radio" name="options" id="toggle${name}" onclick="setClickedLayerKey('${name}')" autocomplete="off">${name.split("_").join(" ").trim()}</input>`
    keyLayers.appendChild(listKeys);
}

function renameLayer() {
    if (curLayer && keymap) {
        swal({
            title: `Rename ${curLayer.split("_").join(" ").trim()}`,
            content: {
                element: "input",
                attributes: {
                    placeholder: `${curLayer.split("_").join(" ").trim()}`
                }
            },
            button: {
                text: "Rename!"
            }
        }).then(res => {
            if (res.length) {
                res = '_' + res.trim().split(/\s+|\.+|\:+|_+/).join("_");
                keymap.map.forEach(map => {
                    for (let i in map) {
                        if (map[i].includes(curLayer))
                            map[i] = map[i].replace(curLayer, res);
                    }
                });
                keymap.map.set(res, keymap.map.get(curLayer));
                keymap.map.delete(curLayer);
                keymap.colors.set(res, keymap.colors.get(curLayer));
                keymap.colors.delete(curLayer);
                keymap.layers.set(res, keymap.layers.get(curLayer));
                keymap.layers.delete(curLayer);
                let a = document.getElementById(`layer${curLayer}`);
                a.innerHTML = `<input type="radio" name="layers" id="${res}" onclick="setLayer('${res}')" autocomplete="off">${res.split("_").join(" ").trim()}</input>`;
                a.id = `layer${res}`;
                curLayer = res;
                swal({ text: "Sucessfully Renamed", icon: "success" })
            }
        });
    } else {
        swal("Please Select a Layer", "Cannot change name of layer UNDEFINED", "warning");
    }
}


function windowResize() {
    mainkb.style.height = `${mainkb.offsetWidth / (KB_ASPECT_RATIO)}px`
}

window.addEventListener("load", () => {
    if (localStorage.targetFolder && localStorage.targetFolder.length) {
        setFolder((null === undefined) === !0);
    }

    keyboardTab.addEventListener('mouseup', () => {
        setTimeout(windowResize, 50);
    });
    
    window.addEventListener('resize', windowResize);
    windowResize();

    // https://github.com/Simonwep/pickr (mit liscense woot)
    pickr = new Pickr({
        el: colorChooser.children[0],
        container: colorChooser,
        theme: "monolith",
        lockOpacity: true,
        comparison: false,
        default: "#000000",
        showAlways: true,
        inline: true,
        swatches: null,
        components: {
            palette: true,
            preview: false,
            hue: true,
            interaction: {
                input: true,
                hex: true
            }
        }
    });

    for (const key of document.getElementsByClassName("key")) {
        key.addEventListener("click", ({ target }) => {
            if (target.className != "key") target = target.parentNode;
            if (SelectedKey) {
                SelectedKey.style.borderColor = null
            }
            SelectedKey = target;
            SelectedKey.style.borderColor = "#FFFFFF"
            let keycode = keymap.map.get(curLayer)[parseInt(SelectedKey.id.slice(3))];
            if (layerRegex.test(keycode)) {
                let keyAndLayer = keycode.match(layerRegex)
                for (const input of document.getElementsByClassName("toggleCode")) {
                    if (input.id === keyAndLayer[1]) {
                        input.checked = true;
                        input.parentElement.className = "btn btn-info active"
                    } else {
                        input.checked = false;
                        input.parentElement.className = "btn btn-info"
                    }
                }
                for (const input of document.getElementsByClassName("layerRadio")) {
                    if (input.id === `toggle${keyAndLayer[2]}`) {
                        input.checked = true;
                        input.parentElement.className = "btn btn-info active"
                    } else {
                        input.checked = false;
                        input.parentElement.className = "btn btn-info"
                    }
                }
            } else {
                for (const input of document.getElementsByClassName("keycodeRadio")) {
                    if (input.id !== keycode) {
                        input.checked = false;
                        input.parentElement.className = "btn btn-info"
                    } else {
                        input.checked = true;
                        input.parentElement.className = "btn btn-info active"
                    }
                }
            }
            customKeyCodeText.value = keycode;
            pickr.setColor(target.style.backgroundColor ? target.style.backgroundColor : "#000000");
            //add key selected shit to set the key as selected
        });
    }

    pickr.on("change", (color, pickr) => {

        if (SelectedKey) {
            const hex = color.toHEXA();
            SelectedKey.style.backgroundColor = hex.toString();
            SelectedKey.style.color = contrastColor(hex.toString());
        }
        // if (SelectedKey?.children[0]) SelectedKey.children[0].color = color.toHEXA().toString();
        //use key selected shit to change the key's color
    });

    Sortable.create(layerList, {
        onChange: () => {
            let index = layerList.children.length;
            for (const child of layerList.children) {
                keymap.layers.set(child.id.replace("layer", ""), --index);
            }
        }
    });

    customKeyCodeText.addEventListener("input", e => {
        if (!SelectedKey || !curLayer || !keymap) return;    
        id = e.target.value;
        keymap.map.get(curLayer)[parseInt(SelectedKey.id.slice(3))] = id;
        SelectedKey.innerHTML = `<div>${id.replace("KC_", "").replace("_______", "TRNS")}</div>`;
    })
});




let layerListDragged = null;


// Shit from stack overflow by Владимир Казак
// document.addEventListener("dragstart", ({ target }) => {
//     const id = target.id;
//     if (target.parentNode == layerList) {
//         layerListDragged = target;
//     }
// });

// document.addEventListener("dragover", (event) => {
//     event.preventDefault();
// });

// document.addEventListener("drop", (event) => {
//     let target = null;
//     for (const child of layerList.children) {
//         if (child.getBoundingClientRect().bottom > event.clientY) {
//             target = child;
//             break;
//         }
//     }
//     if (!target) {
//         target = layerList.children[layerList.children.length - 1];
//         target.after(layerListDragged);
//     } else {
//         target.before(layerListDragged);
//     }

//     let index = layerList.children.length;
//     for (const child of layerList.children) {
//         keymap.layers.set(child.id.replace("layer", ""), --index);
//     }
// });

