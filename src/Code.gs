// CORE APPLICATION CODE

// use cache for some long-running functions
// only lasts 10 minutes in cache
const cache = CacheService.getScriptCache();


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
    .addItem('Advanced Scheduler', 'showAdvancedScheduler')
    .addItem('Partner Report', 'partnerReport')
    .addItem('Opponent Report', 'opponentReport')
    .addToUi();
}


/**
 * Adds lodash to project
 */
function onOpenLodash() {
  eval(UrlFetchApp.fetch('https://cdn.jsdelivr.net/npm/lodash@4.17.4/lodash.min.js').getContentText());
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
 * Updates array of players marked active from players sheet.
 * When there is an edit on the sheet and a cached value
 */
function editPlayers(e) {
  let cachekey = 'activePlayers'
  let sheet = e.range.getSheet();
  if (sheet.getSheetName() === 'players') {
    if (e.range.getColumn() === 1) {
      if (cache.get(cachekey)) {
        cache.remove(cachekey);
        console.log(activePlayers());
      }
    }
  }
}


/**
 * Updates array of players listed in schedule
 * When there is an edit on the sheet and a cached value
 */
function editSchedule(e) {
  let cachekey = 'schedulePlayers'
  let sheet = e.range.getSheet();
  if (sheet.getSheetName() === 'schedule') {
    if (cache.get(cachekey)) {
      cache.remove(cachekey);
      console.log(schedulePlayers());
    }
  }
}


/**
 * Displays HTML sidebar for Advanced Scheduler
 */
function showAdvancedScheduler() {
  let sheet = SpreadsheetApp.getActive().getSheetByName('players')
  SpreadsheetApp.getActive().setActiveSheet(sheet)
  let html = HtmlService.createHtmlOutputFromFile('Advanced').setTitle('Advanced Scheduler');
  SpreadsheetApp.getUi().showSidebar(html);
}


/**
 * Displays HTML sidebar for Simple Scheduler
 */
function showSimpleScheduler() {
  let html = HtmlService.createHtmlOutputFromFile('Simple').setTitle('Simple Scheduler');
  SpreadsheetApp.getUi().showSidebar(html);
}


/**
 * Overwrites schedule sheet
 * Sched is array of arrays. First element is sheet headers
 * Each subsequent array has first element of game/round number
 * Subsequent elements are in form 'Joe and Tom \n Mark and Tony'
 */
function writeSchedule(sched) {

  // clear existing rows
  let sheet = SpreadsheetApp.getActive().getSheetByName('schedule');
  sheet.clear();

  // add new rows
  for (let i = 0; i < sched.length; i++) {
    console.log([i, sched[i]]);
    sheet.appendRow(sched[i]);
  }

  // format worksheet
  let headers = sheet.getRange("A1:Z1")
  headers.setFontWeight("bold");
  let range = sheet.getDataRange();
  range.applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY)
  sheet.autoResizeColumns(1, 50)
  sheet.autoResizeRows(1, 50)
  range.setHorizontalAlignment("center")
  SpreadsheetApp.getActive().setActiveSheet(sheet)
}


