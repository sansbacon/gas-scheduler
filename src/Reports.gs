// CODE FOR REPORTS (PARTNER AND OPPONENT)

/**
 * Gets square (n_players x n_players) matrix of player opponent counts
 */
function getOpponents() {
  eval(UrlFetchApp.fetch('https://cdn.jsdelivr.net/npm/lodash@4.17.4/lodash.min.js').getContentText());

  // get players listed on schedule
  let players = schedulePlayers();

  // initialize pairings matrix
  let ipairings = _.range(players.length).map(() => _.range(players.length).fill(0));

  // loop through pairings data
  let s = SpreadsheetApp.getActive().getSheetByName('schedule').getDataRange().getValues();
  for (let i=1; i < s.length; i++) {
    let round_pairings = _.slice(s[i], 1, s[i].length);
    for (let j=0; j < round_pairings.length; j++) {
      let teams = round_pairings[j].split('\n');
      let t1p = teams[0].split(' and ');
      let t2p = teams[1].split(' and ');
      let p1idx = players.indexOf(t1p[0]);
      let p2idx = players.indexOf(t1p[1]);
      let p3idx = players.indexOf(t2p[0]);
      let p4idx = players.indexOf(t2p[1]);
      ipairings[p1idx][p3idx] += 1;
      ipairings[p1idx][p4idx] += 1;
      ipairings[p2idx][p3idx] += 1;
      ipairings[p2idx][p4idx] += 1;
      ipairings[p3idx][p1idx] += 1;
      ipairings[p3idx][p2idx] += 1;
      ipairings[p4idx][p1idx] += 1;
      ipairings[p4idx][p2idx] += 1;
    }
  }

  // add players to pairings
  headers = [''].concat(players);
  rows = [headers]
  for (let i=0; i < players.length; i++) {
    row = [players[i]].concat(ipairings[i]);
    rows.push(row);
  }

  return rows;
}


/**
 * Gets square (n_players x n_players) matrix of player partner counts
 */
function getPartners() {
  eval(UrlFetchApp.fetch('https://cdn.jsdelivr.net/npm/lodash@4.17.4/lodash.min.js').getContentText());

  // get players listed on schedule
  let players = schedulePlayers();

  // initialize pairings matrix
  let ipairings = _.range(players.length).map(() => _.range(players.length).fill(0));

  // loop through pairings data
  let s = SpreadsheetApp.getActive().getSheetByName('schedule').getDataRange().getValues();
  for (let i=1; i < s.length; i++) {
    let round_pairings = _.slice(s[i], 1, s[i].length);
    for (let j=0; j < round_pairings.length; j++) {
      let teams = round_pairings[j].split('\n');
      for (let k=0; k < teams.length; k++){
        let team = teams[k].split(' and ');     
        let p1idx = players.indexOf(team[0]);
        let p2idx = players.indexOf(team[1]);
        ipairings[p1idx][p2idx] += 1;
        ipairings[p2idx][p1idx] += 1;
      }
    }
  }

  // add players to pairings
  headers = [''].concat(players);
  rows = [headers]
  for (let i=0; i < players.length; i++) {
    row = [players[i]].concat(ipairings[i]);
    rows.push(row);
  }

  return rows;
}


/**
 * Shows square (n_players x n_players) matrix of player opponent counts
 */
function opponentReport() {
  let opponents = getOpponents();
  writePairings(opponents, 'opponent_report');
}


/**
 * Shows square (n_players x n_players) matrix of player partner counts
 */
function partnerReport() {
  let partners = getPartners();
  writePairings(partners, 'partner_report');
}


/**
 * Gets array of unique player names listed on schedule sheet
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
 * Bulk write to sheets - much faster than appending rows
 */
function writeMultipleRows(sheet, data) {
  let lastRow = sheet.getLastRow();
  sheet.getRange(lastRow + 1, 1, data.length, data[0].length).setValues(data);
}


/**
 * Shows square (n_players x n_players) matrix of player partner counts
 */
function writePairings(data, pairingsType='partner_report') {
  let sheet = SpreadsheetApp.getActive().getSheetByName(pairingsType);
  sheet.clear();
  writeMultipleRows(sheet, data);

  // format sheet headers
  let headers = sheet.getRange("A1:AZ1");
  headers.setFontWeight("bold");
  let col = sheet.getRange("A1:A100");
  col.setFontWeight("bold");

  // sheet shading
  let range = sheet.getDataRange();
  range.applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY);

  // sheet alignment
  sheet.autoResizeColumns(1, 50);
  sheet.autoResizeRows(1, 50);
  range.setHorizontalAlignment("center");
  SpreadsheetApp.getActive().setActiveSheet(sheet);
}

