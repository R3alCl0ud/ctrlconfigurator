const qmk = require("./javascript/backend.js")

let keymap = undefined; // map as loaded in from file
let modMap = undefined; // all modifications to the map go here

let curLayer = undefined;

function setFolder(fi) {
    let target;
    if (!fi) target = localStorage.targetFolder;
    else {
        target = fi.target.files[0].path.split(/\\|\//);
        target.pop();
        target = target.join("/");
    }

    localStorage.targetFolder = target;

    keymap = qmk.loadKeymap(target);
    console.log(keymap);
    if (keymap === "FAIL") {
        keymap = undefined;
        return alert("Failed to import keyboard profile");
    }
    // for (keymap)
    layerList.innerHTML = '<button onclick="createLayer(\'_New_Layer\')" id="addLayerBtn" class="btn btn-primary btn-lg"> Add Layer</button>';
    let layers = []
    for (const lname in keymap.layers) {
        if (keymap.layers[lname] > layers.length) layers.push(lname);
        else layers = layers.slice(0, keymap.layers[lname]) + [lname] + layers.slice(keymap.layers[lname]);
    }
    for (const lname in keymap.layers) {
        addLayer(lname, keymap.layers[lname]);
    }

    //deep copy biatch
    modMap = JSON.parse(JSON.stringify(keymap));
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
    const r = (0xFF - ((color>>16) & 0xFF)) << 16;
    const g = (0xFF - ((color>>8) & 0xFF)) << 8;
    const b = 0xFF - ((color) & 0xFF);
    //console.log("RGB: "+ (r|g|b).toString(16));
    return r|g|b;
}

function contrastColor(hexcolor){

    // Convert to RGB value
    const c = parseInt(hexcolor.replace("#", ""),16);
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
            if (arr.length > 0 && arr[arr.length-1][2] == color) {
                arr[arr.length-1][1] += 1;
            } else {
                arr.push([i, 1, color]);
            }
        }
    }
    console.log(arr);
    modMap.colors[curLayer] = arr;
}

function setLayer(name) {
    if (keymap !== undefined && keymap.map[name] !== undefined) {
        if (curLayer && curLayer != name) saveLayerColor();
        curLayer = name;
        for (let i = 0; i < 87; i++) {
            const e = document.createElement("div");
            const key = document.getElementById("key"+i);
            e.innerHTML = keymap.map[name][i].split(/KC_/).join('').split('_______').join('TRNS').trim();
            key.innerHTML = "";
            key.appendChild(e);
            key.style.backgroundColor = "#000000";
            key.style.color = "#FFFFFF";
            e.addEventListener("click", () => {e.parentNode.click()});
        }

        if (keymap.colors[name] !== undefined) {
            for (const color of keymap.colors[name]) {
                for (let i = color[0]; i < color[0] + color[1] && i < 87; i++) {
                    document.getElementById("key"+i).style.backgroundColor = intToHex(color[2]);
                    document.getElementById("key"+i).style.color = contrastColor(intToHex(color[2]));
                }
            }
        }
    }
}

function createLayer(name) {
    if (layerList.children.length >= 16) return;

    keymap.layers[name] = layerList.children.length;
    keymap.map[name] = [];
    for (let i = 0; i < 87; i++) {
        keymap.map[name][i]= '_______';
    }
    addLayer(name);
}

function deleteLayer(name) {
    document.getElementById("layer"+name).remove();
}

function addLayer(name) {
    if (layerList.children.length >= 16) return;
    const a = document.createElement("label");
    // console.log(a);
    // a.onclick = () => setLayer(name);
    console.log(name);
    a.draggable = true;
    a.className="btn btn-primary";
    a.innerHTML = `<input type="radio" name="layers" id="${name}" onclick="setLayer('${name}')" autocomplete="off">${name.split("_").join(" ").trim()}</input><div class="button btn deleteLayerBtn btn-danger" onclick="deleteLayer('${name}')" id="d_${name}">&times;</div>`;
    a.id = `layer${name}`;
    layerList.prepend(a);
}


const KB_ASPECT_RATIO = 14/5;
let pickr;
let SelectedKey;

function windowResize() {
    mainkb.style.height = `${mainkb.offsetWidth/(KB_ASPECT_RATIO)}px`
}

window.addEventListener("load", () => {
    if (localStorage.targetFolder && localStorage.targetFolder.length) {
        setFolder((null === undefined) === !0);
    }

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
        key.addEventListener("click", ({target}) => {
            if (target.className != "key") target = target.parentNode;
            SelectedKey = target;
            console.log(keymap.map[curLayer][parseInt(SelectedKey.id.slice(3))]);
            pickr.setColor(target.style.backgroundColor ? target.style.backgroundColor : "#000000");
            //add key selected shit to set the key as selected
        });
    }

    pickr.on("change", (color, pickr) => {
        
        if (SelectedKey){
            const hex = color.toHEXA();
            SelectedKey.style.backgroundColor = hex.toString();
            SelectedKey.style.color = contrastColor(hex.toString());
        }
        // if (SelectedKey?.children[0]) SelectedKey.children[0].color = color.toHEXA().toString();
        //use key selected shit to change the key's color
    });
})




let layerListDragged = null;

// Shit from stack overflow by Владимир Казак
document.addEventListener("dragstart", ({target}) => {
    const id = target.id;
    if (target.parentNode == layerList) {
        layerListDragged = target;
    }
});

document.addEventListener("dragover", (event) => {
    event.preventDefault();
});

document.addEventListener("drop", (event) => {
    let target = null;
    for (const child of layerList.children) {
        if (child.getBoundingClientRect().bottom > event.clientY) {
            target = child;
            break;
        }
    }
    if (!target) {
        target = layerList.children[layerList.children.length-1];
        target.after(layerListDragged);
    } else {
        target.before(layerListDragged);
    }
});

