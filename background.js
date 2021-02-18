"use strict";

/* TODO list:
 * 3. write ImgWriter canvas functionality properly
 * 4. i18n (ru/en at least) of dictionary (provide proper english translation)
 * 5. i18n (ru/en at lest) of interface
 * 6. math expressions translator
 * 7. 3D font renderer 
 * 8. 9D font renderer
 * 9. tools for block form rules
 * 10. tags! make them work!
 * 11. IDK, user-made entries with JSON import/export for sync storage?
 * 12. also make icon, maybe with "!ih" syllable in glyphic style font
 * 13. make a font editor
 * 14. make a dictionary editor
 * 15. support vector fonts too
*/
/*
chrome.storage.onChanged.addListener(function(changes, namespace) {
  for (let key in changes) {
    console.log('Storage key "%s" in namespace "%s" changed. Old value was "%s", new value is "%s".',
      key, namespace, changes[key].oldValue, changes[key].newValue);
  }
});
*/

// Any new dictionaries are added to popup.html as scripts and spread into dict in menu.js
/* Any new fonts are added to popup.html as scripts,
 * and their "name" property should be added to "fonts" in menu.js
 * Font table:
 * 0: Hentuktikonerrti
 *
 * Directions table:
 * 0: BtT->LtR
 * 1: BtT->Rtl
 * 2: TtB->LtR
 * 3: TtB->RtL
 * 4: LtR->TtB
 * 5: LtR->BtT
 * 6: RtL->TtB
 * 7: RtL->BtT
 * Spiraling starting point and direction are defined by "direction" property.
*/
let state = {};
const defaultSettings = {
  font: 0, // see above
  color: '#aaaaaa',
  smoothing: true,
  // the rest is only applied at the drawing screen
  freespace: 10,
  //autowrap: true, // TODO no support yet, behaves as if it is true
  size: 50, // px
  //direction: 0, // see above, also TODO no support yet, behaves as if it is 4 (for dictionary's sake)
  //boustrophedon: false, // TODO no support yet
  //spiraling: false, // TODO no support yet
  //monospace: false, // TODO no support yet, behaves as if it is false
  columns: 9, 
  //rows: 12, // TODO no support yet
  //width: 320, // TODO no support yet
  height: 320
};
chrome.storage.sync.get(['ʇihittuh_settings'], function(result) {state = result.key;});
if (!state.font) {chrome.storage.sync.set({'ʇihittuh_settings': {...defaultSettings}}); state = {...defaultSettings};}