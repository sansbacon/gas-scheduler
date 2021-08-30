// CORE APPLICATION CODE
// use cache for some long-running functions
// only lasts 10 minutes in cache
const cache = CacheService.getScriptCache();
const _ = LodashGS.load();

// returns array with keys sched, byes, dup_p, dup_o
const gae_url = 'https://pickleball-315623.uc.r.appspot.com';


/**
 * Creates menu items: 
 * Simple Scheduler - opens sidebar for simple scheduler
 * Advanced Scheduler - opens sidebar for advanced scheduler
 * Partner Report - runs partnerReport and displays sheet
 * Opponent Report - runs opponentReport and displays sheet
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Pickleball Scheduler')
    .addItem('Simple Scheduler', 'showSimpleScheduler')
    //.addItem('Advanced Scheduler', 'showAdvancedScheduler')
    .addItem('Round Robin Scheduler', 'showRRScheduler')
    .addItem('Player Report', 'playerReport')
    .addItem('Partner Report', 'partnerReport')
    .addItem('Opponent Report', 'opponentReport')
    .addToUi();
}


/**
 * Gets array of players marked active from players sheet.
 * Uses cache so will not reflect very recent changes. 
 */
function activePlayers() {
  let keyname = 'activePlayers';
  let players = cache.get(keyname);

  // reset cache if no key or empty array
  // cache value is string, so have to serialize/deserialize array  
  if ((!players) || (players.constructor === Array && players.includes(null))) {
    let p = SpreadsheetApp.getActive().getSheetByName('players').getDataRange().getValues();
    players = _.filter(p, (e) => e[1].toLowerCase() === 'yes');
    players = _.map(players, (player) => { return player[0]});
    cache.put(keyname, JSON.stringify(players));
  } else {
    players = JSON.parse(players); 
  }
  
  shuffleArray(players);
  return players;
}


/**
 * Utility function to close HTML sidebar
 */
function closeSidebar() {
  let p = PropertiesService.getScriptProperties();
  if (p.getProperty("sidebar") == "open") {
    let html = HtmlService.createHtmlOutput("<script>google.script.host.close();</script>");
    SpreadsheetApp.getUi().showSidebar(html);
    p.setProperty("sidebar", "close");
  }
}


/**
 * Removes cached value when there is an edit on the sheet and a cached value
 */
function editPlayers(e) {
  let cachekey = 'activePlayers'
  let sheet = e.range.getSheet();
  if (sheet.getSheetName() === 'players') {
    if (e.range.getColumn() === 1) {
      if (cache.get(cachekey)) {
        cache.remove(cachekey);
      }
    }
  }
}


/**
 * Removes cache when there is an edit on the sheet and a cached value
 */
function editSchedule(e) {
  let cachekey = 'schedulePlayers'
  let sheet = e.range.getSheet();
  if (sheet.getSheetName() === 'schedule') {
    if (cache.get(cachekey)) {
      cache.remove(cachekey);
    }
  }
}



/**
 * Gets array of unique player names listed on schedule sheet
 * TODO: add caching back to this
 */
function schedulePlayers() {
  let s = SpreadsheetApp.getActive().getSheetByName('schedule').getDataRange().getValues();
  let sp = new Set();
  for (let i=1; i < s.length; i++) {
    let round_pairings = _.slice(s[i], 1, s[i].length);
    for (let j=0; j < round_pairings.length; j++) {
      let teams = round_pairings[j].split('\n');
      for (let k=0; k < teams.length; k++){
        let team = teams[k].split(' and ');     
        sp.add(team[0]);
        sp.add(team[1]);
      }
    }
  }

  return Array.from(sp);
}


/**
 * Displays HTML sidebar for Simple Scheduler
 */
function showSimpleScheduler() {
  let html = HtmlService.createHtmlOutputFromFile('Simple').setTitle('Simple Scheduler');
  SpreadsheetApp.getUi().showSidebar(html);
}


/**
 * Displays HTML sidebar for Round Robin Scheduler
 */
function showRRScheduler() {
  let html = HtmlService.createHtmlOutputFromFile('RR').setTitle('Round Robin Scheduler');
  SpreadsheetApp.getUi().showSidebar(html);
}


/**
 * Inplace shuffle of array
 */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}


/**
 * Bulk write to sheets - much faster than appending rows
 */
function writeMultipleRows(sheet, data) {
  let lastRow = sheet.getLastRow();
  sheet.getRange(lastRow + 1, 1, data.length, data[0].length).setValues(data);
}


/**
 * Formats schedule sheet
 */
function formatSchedule() {
  let sheet = SpreadsheetApp.getActive().getSheetByName('schedule');
  let headers = sheet.getRange("A1:Z1")
  headers.setFontWeight("bold");
  let range = sheet.getDataRange();
  range.applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY);
  sheet.autoResizeColumns(1, sheet.getLastColumn());
  sheet.autoResizeRows(1, sheet.getLastRow());
  range.setHorizontalAlignment("center");
}


/**
 * Overwrites schedule sheet
 * Sched is array of arrays. First element is sheet headers
 * Each subsequent array has first element of game/round number
 * Subsequent elements are in form 'Joe and Tom \n Mark and Tony'
 * @param {array} sched - Array of arrays of data to write.
 */
function writeSchedule(sched) {
  // clear existing rows
  let sheet = SpreadsheetApp.getActive().getSheetByName('schedule');
  sheet.clear();

  // add new rows
  writeMultipleRows(sheet, sched);
}