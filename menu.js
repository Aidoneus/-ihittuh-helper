"use strict";
const randomId = (add='el') => {
  return add+'-'+String(Math.floor(Math.random()*999999));
};
/**
 * Creates DOM element and inserts it into the tree
 * @param {String} [id=el-xxxxxx] - element ID
 * @param {Object} [par=body] - where to append
 * @returns {Object} reference to new element
 */
const newElement = (id=randomId(),par=document.body) => {
  let tmp = document.createElement('div');
  tmp.id = id;
  par.appendChild(tmp);
  return tmp;
};
const dicts = {en: dict_en, ru: dict_ru};
let dictLocale = chrome.i18n.getMessage('@@ui_locale');
if (!dicts[dictLocale]) {dictLocale = 'en';}
const dict = dicts[dictLocale],
      searchDict = [],
      entryList = [],
      fonts = [Hentuktikonerrti],
      dictFontSize = 32;
let state = {},
    currentFont = {},
    root, fieldMenu, fieldContent;
const updateFont = (cb) => {
  currentFont = {};
  let length = Object.entries(fonts[state.font].font).length,
      i = 1;
  for (let [syllable,img] of Object.entries(fonts[state.font].font)) {
    currentFont[syllable] = new Image();
    i++;
    if (i > length) currentFont[syllable].addEventListener('load',cb);
    currentFont[syllable].src = img;
  }
}
const formSearchDict = () => {
  for (const [predicate, entries] of Object.entries(dict)) {
    let entriesCopy = entries.filter(e=>(e[0]!='*' && e[0]!='#' && e[0]!='=' && e[0]!='|'));
    searchDict.push([predicate,entriesCopy.join('. ')]);
    entryList.push(predicate);
  }
  console.log('Dictionary length:',entryList.length);
};

const filterWordEntries = (isFiltering) => {
  let searchResult = [];
  if (isFiltering) {
    const searchQuery = document.getElementById('searchField').value;
    for (const [predicate, entries] of searchDict) {
      if (entries.includes(searchQuery)) searchResult.push(predicate);
    }
  } else searchResult = entryList.slice();
  renderEntries(searchResult);
};

const renderMenu = () => {
  if (fieldMenu.childNodes.length > 0) for (let entry of fieldMenu.childNodes()) {entry.remove();}

  let searchField = document.createElement('input');
  searchField.type = "search";
  searchField.id = "searchField";
  searchField.placeholder = chrome.i18n.getMessage('searchPlaceholder');
  searchField.maxlength = 20;
  searchField.autofocus = true;
  fieldMenu.appendChild(searchField);

  let searchButton = document.createElement('div');
  searchButton.id = "searchButton";
  searchButton.className = "toolsButton";
  searchButton.textContent = chrome.i18n.getMessage('searchButton');
  searchButton.addEventListener('click', ()=>{filterWordEntries(true)});
  document.addEventListener('keydown', function(event){if (event.key=='Enter') filterWordEntries(true);});
  fieldMenu.appendChild(searchButton);

  let browseButton = document.createElement('div');
  browseButton.id = "browseButton";
  browseButton.className = "toolsButton";
  browseButton.textContent = chrome.i18n.getMessage('browseButton');
  browseButton.addEventListener('click', ()=>{filterWordEntries(false)});
  fieldMenu.appendChild(browseButton);

  let drawingButton = document.createElement('div');
  drawingButton.id = "drawingButton";
  drawingButton.className = "toolsButton";
  drawingButton.textContent = chrome.i18n.getMessage('drawingButton');
  drawingButton.addEventListener('click', renderDrawingMenu);
  fieldMenu.appendChild(drawingButton);
};

const renderCustomText = (syllables=document.getElementById('textToDraw').value.split(' '), dir=state.direction, customTarget) => {
  let currentRow = 1,
      currentColumn = 1,
      currentX = 0,
      currentY = 0,
      tempX = 0,
      tempY = 0,
      drawingCanvas;
  if (customTarget) {
    drawingCanvas = document.createElement('canvas');
    drawingCanvas.id = randomId('drawingCanvas');
    customTarget.appendChild(drawingCanvas);
    for (let s of syllables) {
      let ratio = currentFont[s].width / (customTarget ? dictFontSize : state.size);
      tempY += (customTarget ? dictFontSize : state.size)/9 + currentFont[s].height/ratio;
    }
    tempY = Math.ceil(tempY);
  } else drawingCanvas = document.getElementById('drawingCanvas');
  const freespace = customTarget ? 2 : state.freespace,
        //rows = customTarget ? 1 : state.rows,
        columns = customTarget ? 1 : state.columns,
        letterWidth = customTarget ? dictFontSize : state.size,
        //letterHeight = customTarget ? dictFontSize : state.size,
        canvasWidth = columns * letterWidth + freespace*2,
        canvasHeight = customTarget ? tempY : state.height + freespace*2;
  drawingCanvas.width = canvasWidth;
  drawingCanvas.height = canvasHeight;
  let ctx = drawingCanvas.getContext('2d');
  ctx.clearRect(0,0,canvasWidth,canvasHeight);
  ctx.imageSmoothingEnabled = state.smoothing;

  const print = (syllable,x,y,ratio) => {
    ctx.drawImage(currentFont[syllable],
      x,
      y,
      currentFont[syllable].width/ratio,
      currentFont[syllable].height/ratio);
  };

  tempY = freespace - letterWidth/9;
  tempX = freespace + letterWidth;
  for (let s of syllables) {
    let ratio = currentFont[s].width / (customTarget ? dictFontSize : state.size);
    tempY += letterWidth/9 + currentFont[s].height/ratio;
    if (tempY > canvasHeight) {
      tempY = freespace + currentFont[s].height/ratio;
      tempX += letterWidth/9 + letterWidth;
    }
    print(s,
      canvasWidth - tempX,
      canvasHeight - tempY,
      ratio);
  }

  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = state.color;
  ctx.fillRect(0,0,canvasWidth,canvasHeight);
  ctx.globalCompositeOperation = 'source-over';
};

const renderDrawingMenu = () => {
  while (fieldContent.firstChild) { fieldContent.removeChild(fieldContent.firstChild); }

  let drawingHelp1 = document.createElement('div');
  drawingHelp1.id = randomId('drawingHelp1');
  drawingHelp1.className = "drawingHelp";
  drawingHelp1.textContent = chrome.i18n.getMessage('drawingHelp1');
  fieldContent.appendChild(drawingHelp1);
  let drawingHelp2 = document.createElement('div');
  drawingHelp2.id = randomId('drawingHelp2');
  drawingHelp2.className = "drawingHelp";
  drawingHelp2.textContent = chrome.i18n.getMessage('drawingHelp2');
  fieldContent.appendChild(drawingHelp2);
  let drawingHelp3 = document.createElement('div');
  drawingHelp3.id = randomId('drawingHelp3');
  drawingHelp3.className = "drawingHelp";
  drawingHelp3.textContent = chrome.i18n.getMessage('drawingHelp3');
  fieldContent.appendChild(drawingHelp3);

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

  let textToDraw = document.createElement('input');
  textToDraw.type = "text";
  textToDraw.id = "textToDraw";
  textToDraw.placeholder = chrome.i18n.getMessage('drawTextPlaceholder');
  textToDraw.maxlength = 900;
  fieldContent.appendChild(textToDraw);

  // fonts[state.font].name + 
  //' for ' + fonts[state.font].style +
  //' style of ' + fonts[state.font].lang +
  //' language (artist: '+ fonts[state.font].artist + ')'

  let drawButton = document.createElement('div');
  drawButton.id = "drawButton";
  drawButton.className = "toolsButton";
  drawButton.textContent = chrome.i18n.getMessage('drawButton');
  drawButton.addEventListener('click', ()=>{
    // TODO update sync storage and local state
    updateFont(()=>{renderCustomText()}); // TODO should call that in the callback of the update
  });
  fieldContent.appendChild(drawButton);

  let drawingCanvas = document.createElement('canvas');
  drawingCanvas.id = 'drawingCanvas';
  drawingCanvas.width = 480;
  drawingCanvas.height = 1;
  fieldContent.appendChild(drawingCanvas);
};

const renderEntries = (entries) => {
  updateFont(()=>{
    while (fieldContent.firstChild) { fieldContent.removeChild(fieldContent.firstChild); }
    for (const predicate of entries) {
      let entry = dict[predicate],
          spreadPredicate = '';

      let entrySection = document.createElement('div');
      entrySection.id = randomId('entry');
      entrySection.className = "entry";
      fieldContent.appendChild(entrySection);

      let entryText = document.createElement('div');
      entryText.id = randomId('entryText');
      entryText.className = "entryText";
      entrySection.appendChild(entryText);

      // predicate entries themselves
      let predicateDrawing = document.createElement('div');
      predicateDrawing.id = randomId('predicateDrawing');
      predicateDrawing.className = "predicateDrawing";
      entrySection.appendChild(predicateDrawing);

      let predicateName = document.createElement('div');
      predicateName.id = randomId('predicateName');
      predicateName.className = "predicateName";
      predicateName.textContent = predicate;
      entryText.appendChild(predicateName);
      for (const e of entry) {
        switch (e[0]) {
          case '=':
            break;
          case '*':
            let predicateParent = document.createElement('div');
            predicateParent.id = randomId('predicateParent');
            predicateParent.className = "predicateParent";
            predicateParent.textContent = chrome.i18n.getMessage('parentPredicate') + ' ' + e.slice(1);
            entryText.appendChild(predicateParent);
            break;
          case '#':
            let predicateColor = document.createElement('div');
            predicateColor.id = randomId('predicateColor');
            predicateColor.className = "predicateColor";
            predicateColor.textContent = e;
            predicateColor.style.backgroundColor = e;
            entryText.appendChild(predicateColor);
            break;
          case '|':
            spreadPredicate = e.slice(1);
            break;
          default:
            let predicateMeaning = document.createElement('div');
            predicateMeaning.id = randomId('predicateMeaning');
            predicateMeaning.className = "predicateMeaning";
            predicateMeaning.textContent = '* ' + e;
            entryText.appendChild(predicateMeaning);
            break;
        }
      }
      renderCustomText(spreadPredicate.split(' '),4,predicateDrawing);
    }
  });
};

const init = () => {
  chrome.storage.sync.get(['ʇihittuh_settings'], function(result) {
    state = result['ʇihittuh_settings'];
    formSearchDict();
    root = document.getElementById('toolsRoot');
    fieldMenu = newElement('fieldMenu',root);
    fieldContent = newElement('fieldContent',root);
    renderMenu();
    filterWordEntries(false);
  });
};

document.addEventListener('DOMContentLoaded',init);
