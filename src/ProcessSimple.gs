  const sched32 = [
    [[ 3, 28, 17, 14],
    [23, 30, 22,  1],
    [ 2,  9, 27, 25],
    [20,  8, 10, 16],
    [ 0, 24, 26, 11],
    [ 4, 21, 31,  7],
    [19,  6, 29, 15]],

    [[20, 15, 24, 31],
    [ 3, 21, 16, 13],
    [ 6, 30,  4,  5],
    [25, 29, 17,  7],
    [14,  9,  2, 22],
    [27, 12,  1, 11],
    [26, 10, 19, 18]],

    [[10,  4, 23, 12],
    [ 9, 28, 25, 31],
    [ 5, 13, 22,  8],
    [15,  7, 30,  2],
    [16, 19, 11, 14],
    [18, 17, 24,  6],
    [21,  0,  1, 20]],

    [[18, 20, 28,  1],
    [ 8,  9,  3,  4],
    [12, 17,  7,  5],
    [13, 30, 27, 14],
    [ 2,  6, 21, 26],
    [10, 11, 29, 22],
    [15, 23,  0, 16]],

    [[22, 21, 25, 15],
    [26, 12, 20, 14],
    [28,  5, 24, 10],
    [11,  6, 31, 13],
    [23, 27,  7,  3],
    [ 0, 19,  9,  1],
    [18, 30,  8, 29]],

    [[29, 28, 12, 21],
    [ 9, 16, 27,  6],
    [19, 17, 20, 30],
    [ 2,  8, 24, 23],
    [ 5, 11, 18,  7],
    [26, 13, 25,  4],
    [ 0, 22, 31,  3]],

    [[31, 19, 27,  8],
    [20,  5, 29,  2],
    [24, 16, 22, 12],
    [25,  3, 10,  6],
    [17,  1,  7, 13],
    [ 4,  0, 14, 18],
    [23, 28, 26, 15]],

    [[31, 18,  1, 16],
    [23, 14, 21,  5],
    [ 8,  3, 11, 15],
    [26, 17,  9, 10],
    [30, 12, 25,  0],
    [27,  4, 29, 24],
    [13, 19, 28,  2]]
];


/**
 * Creates simple schedule
 */
function getSimpleSchedule(post_data) {
  let sched = [['R', 'Court 1', 'Court 2', 'Court 3', 'Court 4', 'Court 5', 'Court 6', 'Court 7']];
  let players = _.shuffle(post_data['players']);
  let idx = sched32;
  for (let i = 0; i < idx.length; i++) {
    let round = [i + 1];
    for (let j = 0; j < idx[i].length; j++) {
      let matchup = idx[i][j];
      t1 = players[matchup[0]] + ' and ' + players[matchup[1]];
      t2 = players[matchup[2]] + ' and ' + players[matchup[3]];
      console.log(t1 + '\n' + t2);
      round.push(t1 + '\n' + t2);
    }
    sched.push(round)
  }
  return sched;
}


/**
 * Converts player text area into array of string
 * Strips extra space and numbers from names
 */
function processPlayerTextArea(txt) {
  let players = txt.split(/\r?\n/);
  return players.map(x => x.replace(/\d+|^\s+|\s+$/g, '').trim());
}


function processSimpleForm(formData) {
  eval(UrlFetchApp.fetch('https://cdn.jsdelivr.net/npm/lodash@4.17.4/lodash.min.js').getContentText());
  if (formData['n_players'] === '32') {
    let players = processPlayerTextArea(formData['players']);
    formData['players'] = _.shuffle(players);
  }
  
  let sched = getSimpleSchedule(formData);
  writeSchedule(sched);
  SpreadsheetApp.getActive().setActiveSheet(sheet);
  closeSidebar();
}

