// CORE APPLICATION CODE
// use cache for some long-running functions
// only lasts 10 minutes in cache
const cache = CacheService.getScriptCache();

/**
 * Adds lodash to project
 */
function onOpenLodash() {
  eval(UrlFetchApp.fetch('https://cdn.jsdelivr.net/npm/lodash@4.17.4/lodash.min.js').getContentText());
}


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
