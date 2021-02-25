"use strict";

// Any new dictionaries are added to popup.html as scripts and spread into dict in menu.js
/* Any new fonts are added to popup.html as scripts,
 * and their "name" property should be added to "fonts" in menu.js
 *
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
 *
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
  height: 320,

  lastQuery: '',
};
chrome.storage.sync.get(['ʇihittuh_settings'], function(result) {
  state = result.key;
});
if (!state.font) {
  chrome.storage.sync.set({'ʇihittuh_settings': {...defaultSettings}});
  state = {...defaultSettings};
}
