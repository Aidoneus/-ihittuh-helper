"use strict";

function uniqueId(add = "el") {
  return `${add}-${Date.now()}`;
};

function setProp(el, propertyName, propertyValue) {
  if (typeof propertyValue === "undefined") return;
  el[propertyName] = propertyValue;
}

/**
 * Creates DOM element and inserts it into the tree
 * @param {String} [id=el-xxxxxx] - element ID
 * @param {Object} [par=body] - where to append
 * @param {Object} config - possible properties for element
 * @returns {Object} reference to new element
 */
function newElement(id = uniqueId(), par = document.body, config) {
  let tmp = document.createElement(config?.tagName ? config.tagName : 'div');
  tmp.id = id;

  if (config) {
    setProp(tmp, "type",      config.type);
    setProp(tmp, "maxlength", config.maxlength);
    setProp(tmp, "autofocus", config.autofocus);
    setProp(tmp, "className", config.className);
    setProp(tmp, "width",     config.width);
    setProp(tmp, "height",    config.height);

    setProp(tmp, "placeholder", typeof config.placeholder === "undefined"
      ? undefined
      : chrome.i18n.getMessage(config.placeholder)
    );
    let elTextAppendix = typeof config.textContentAppendix === "undefined"
          ? "" : config.textContentAppendix,
        elTextContent = (
          typeof config.textContentI18n === "undefined"
            ? (typeof config.textContent === "undefined" ? "" : config.textContent) + elTextAppendix
            : chrome.i18n.getMessage(config.textContentI18n) + elTextAppendix
        );
    setProp(tmp, "textContent", elTextContent);

    if (config.cb) {
      config.cb.map(cbConfig => {
        tmp.addEventListener(cbConfig.event, cbConfig.action);
      });
    }
    
    if (config.style) {
      config.style.map(styleConfig => {
        tmp.style[styleConfig.p] = styleConfig.v;
      });
    }
  }

  par.appendChild(tmp);
  return tmp;
};

/**
 * Creates a clickable button
 * @param {String} [id=el-xxxxxx] - element ID
 * @param {Object} [par=body] - where to append
 * @param {Function} action - what to do upon click
 * @returns {Object} reference to new element
 */
function newButton(id = uniqueId(), par = document.body, action) {
  return newElement(id, par, {
    className: "toolsButton", textContentI18n: id,
    cb: [ {event: "click", action: action} ]
  });
}

/**
 * Removes all children of the passed element
 * @param {Object} el - which element to purge
 */
function purgeElement(el) {
  //if (el.childNodes.length > 0) {
  //  for (let entry of el.childNodes()) { entry.remove(); }
  //}
  while(el.childNodes.length > 0) el.childNodes[0].remove();
}

const dicts = {
  en: dict_en, ru: dict_ru
};
let dictLocale = chrome.i18n.getMessage('@@ui_locale');
if (!dicts[dictLocale]) dictLocale = 'en';
const dict = dicts[dictLocale],
      searchDict = [],
      entryList = [],
      fonts = [Hentuktikonerrti],
      dictFontSize = 32;
let state = {},
    currentFont = {},
    root, fieldMenu, fieldContent;

function updateFont(cb) {
  currentFont = {};
  let length = Object.entries(fonts[state.font].font).length,
      i = 1;
  for (let [syllable, img] of Object.entries(fonts[state.font].font)) {
    currentFont[syllable] = new Image();
    i++;
    if (i > length) currentFont[syllable].addEventListener('load', cb);
    currentFont[syllable].src = img;
  }
}

function formSearchDict() {
  for (const [predicate, entries] of Object.entries(dict)) {
    let entriesCopy = entries.filter(e => (e[0] != '*' && e[0] != '#' && e[0] != '=' && e[0] != '|'));
    searchDict.push([predicate,entriesCopy.join('. ')]);
    entryList.push(predicate);
  }
  console.log('Dictionary length:', entryList.length);
};

function filterWordEntries(isFiltering) {
  let searchResult = [];
  if (isFiltering) {
    const searchQuery = document.getElementById('searchField').value;
    for (const [predicate, entries] of searchDict) {
      if (entries.includes(searchQuery)) searchResult.push(predicate);
    }
  } else searchResult = entryList.slice();
  renderEntries(searchResult);
};

function renderMenu() {
  purgeElement(fieldMenu);

  newElement("searchField", fieldMenu, {
    tagName: "input",
    type: "search", placeholder: "searchPlaceholder", maxlength: 20, autofocus: true
  });
  newButton("searchButton", fieldMenu, () => { filterWordEntries(true); });
  newButton("browseButton", fieldMenu, () => { filterWordEntries(false); });
  newButton("drawingButton", fieldMenu, renderDrawingMenu);

  document.addEventListener("keydown", function(event) {
    if (event.key == "Enter") filterWordEntries(true);
  });
};

function renderCustomText(
  syllables = document.getElementById("textToDraw").value.split(" "),
  dir = state.direction,
  customTarget
) {
  let currentRow = 1, currentColumn = 1,
      currentX = 0, currentY = 0,
      tempX = 0, tempY = 0,
      drawingCanvas;
  if (customTarget) {
    drawingCanvas = document.createElement("canvas");
    drawingCanvas.id = uniqueId("drawingCanvas");
    customTarget.appendChild(drawingCanvas);
    for (let s of syllables) {
      let ratio = currentFont[s].width / (customTarget ? dictFontSize : state.size);
      tempY += (customTarget ? dictFontSize : state.size) / 9 + currentFont[s].height / ratio;
    }
    tempY = Math.ceil(tempY);
  } else drawingCanvas = document.getElementById("drawingCanvas");
  const freespace = customTarget ? 2 : state.freespace,
        // rows = customTarget ? 1 : state.rows,
        columns = customTarget ? 1 : state.columns,
        letterWidth = customTarget ? dictFontSize : state.size,
        // letterHeight = customTarget ? dictFontSize : state.size,
        canvasWidth = columns * letterWidth + freespace * 2,
        canvasHeight = customTarget ? tempY : state.height + freespace * 2;
  drawingCanvas.width = canvasWidth;
  drawingCanvas.height = canvasHeight;
  let ctx = drawingCanvas.getContext("2d");
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.imageSmoothingEnabled = state.smoothing;

  const print = (syllable, x, y, ratio) => {
    ctx.drawImage(
      currentFont[syllable],
      x, y,
      currentFont[syllable].width/ratio,
      currentFont[syllable].height/ratio
    );
  };

  tempY = freespace - letterWidth / 9;
  tempX = freespace + letterWidth;
  for (let s of syllables) {
    let ratio = currentFont[s].width / (customTarget ? dictFontSize : state.size);
    tempY += letterWidth / 9 + currentFont[s].height / ratio;
    if (tempY > canvasHeight) {
      tempY = freespace + currentFont[s].height / ratio;
      tempX += letterWidth / 9 + letterWidth;
    }
    print(
      s,
      canvasWidth - tempX,
      canvasHeight - tempY,
      ratio
    );
  }

  ctx.globalCompositeOperation = "source-in";
  ctx.fillStyle = state.color;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  ctx.globalCompositeOperation = "source-over";
};

function renderDrawingMenu() {
  purgeElement(fieldContent);

  newElement("drawingHelp1", fieldContent, { className: "drawingHelp", textContentI18n: "drawingHelp1" });
  newElement("drawingHelp2", fieldContent, { className: "drawingHelp", textContentI18n: "drawingHelp2" });
  newElement("drawingHelp3", fieldContent, { className: "drawingHelp", textContentI18n: "drawingHelp3" });

  // TODO
  // font selector
  // color picker
  // padding
  // font size
  // width and height
  // rows and columns
  // direction selector
  // smoothing bool
  // autowrap bool
  // monospace bool
  // boustrophedon bool
  // spiraling bool

  newElement("textToDraw", fieldContent, {
    tagName: "input", type: "text", placeholder: "drawTextPlaceholder", maxlength: 900
  });

  // fonts[state.font].name + 
  //' for ' + fonts[state.font].style +
  //' style of ' + fonts[state.font].lang +
  //' language (artist: '+ fonts[state.font].artist + ')'
  newButton("drawButton", fieldContent, () => {
    // TODO update sync storage and local state
    updateFont(() => { renderCustomText(); }); // TODO should call that in the callback of the update
  });
  newElement("drawingCanvas", fieldContent, { tagName: "canvas", width: 480, height: 1 });
};

function renderEntries(entries) {
  updateFont( () => {
    purgeElement(fieldContent);
    for (const predicate of entries) {
      let entry = dict[predicate],
          spreadPredicate = '';

      let entrySection = newElement(uniqueId("entry"), fieldContent, {className: "entry"}),
          entryText = newElement(uniqueId("entryText"), entrySection, {className: "entryText"}),
          predicateDrawing = newElement(uniqueId("predicateDrawing"), entrySection, {className: "predicateDrawing"}),
          predicateName = newElement(uniqueId("predicateName"), entryText, {
            className: "predicateName", textContent: predicate
          });

      for (const e of entry) {
        switch (e[0]) {
          case "=":
            break;
          case "*":
            newElement(uniqueId("predicateParent"), entryText, {
              className: "predicateParent", textContentI18n: "parentPredicate",
              textContentAppendix: " " + e.slice(1)
            });
            break;
          case "#":
            newElement(uniqueId("predicateColor"), entryText, {
              className: "predicateColor", textContent: e, style: [ {p: "backgroundColor", v: e} ]
            });
            break;
          case "|":
            spreadPredicate = e.slice(1);
            break;
          default:
            newElement(uniqueId("predicateMeaning"), entryText, {
              className: "predicateMeaning", textContent: "* " + e
            });
            break;
        }
      }
      renderCustomText(spreadPredicate.split(" "), 4, predicateDrawing);
    }
  });
};

const init = () => {
  chrome.storage.sync.get(["ʇihittuh_settings"], function(result) {
    state = result["ʇihittuh_settings"];
    formSearchDict();
    root = document.getElementById("toolsRoot");
    fieldMenu = newElement("fieldMenu", root);
    fieldContent = newElement("fieldContent", root);
    renderMenu();
    filterWordEntries(false);
  });
};

document.addEventListener("DOMContentLoaded", init);
