const n_courts = 7;

const sched32_8 = [[[3,28,17,14],[23,30,22,1],[2,9,27,25],[20,8,10,16],[0,24,26,11],[4,21,31,7],[19,6,29,15],[5,12,13,18]],[[20,15,24,31],[3,21,16,13],[6,30,4,5],[25,29,17,7],[14,9,2,22],[27,12,1,11],[26,10,19,18],[0,8,23,28]],[[10,4,23,12],[9,28,25,31],[5,13,22,8],[15,7,30,2],[16,19,11,14],[18,17,24,6],[21,0,1,20],[3,26,27,29]],[[18,20,28,1],[8,9,3,4],[12,17,7,5],[13,30,27,14],[2,6,21,26],[10,11,29,22],[15,23,0,16],[19,24,25,31]],[[22,21,25,15],[26,12,20,14],[28,5,24,10],[11,6,31,13],[23,27,7,3],[0,19,9,1],[18,30,8,29],[2,4,16,17]],[[29,28,12,21],[9,16,27,6],[19,17,20,30],[2,8,24,23],[5,11,18,7],[26,13,25,4],[0,22,31,3],[1,10,14,15]],[[31,19,27,8],[20,5,29,2],[24,16,22,12],[25,3,10,6],[17,1,7,13],[4,0,14,18],[23,28,26,15],[9,11,21,30]],[[31,18,1,16],[23,14,21,5],[8,3,11,15],[26,17,9,10],[30,12,25,0],[27,4,29,24],[13,19,28,2],[6,7,20,22]]];

const sched28_12 = [[[3,5,12,1],[23,27,20,25],[10,24,0,9],[18,2,6,16],[15,17,22,14],[4,21,11,13],[7,8,26,19]],[[6,15,13,5],[1,10,17,4],[16,21,23,26],[18,27,14,24],[7,2,11,0],[3,25,9,19],[12,20,8,22]],[[1,20,24,16],[18,4,22,7],[6,0,12,26],[8,3,2,14],[13,10,27,19],[23,11,9,15],[17,5,21,25]],[[27,4,5,26],[10,7,25,16],[6,24,11,22],[0,13,1,8],[3,20,15,18],[19,2,23,17],[12,21,9,14]],[[8,5,18,11],[14,4,25,6],[24,23,12,7],[20,2,26,10],[27,1,9,22],[15,0,19,21],[16,17,3,13]],[[19,5,22,16],[18,0,23,10],[11,26,1,14],[17,20,9,7],[21,3,6,27],[2,13,12,25],[24,8,4,15]],[[11,16,27,15],[21,2,1,7],[8,9,17,6],[13,25,26,24],[10,5,20,14],[3,0,23,22],[18,4,12,19]],[[8,21,10,22],[27,0,12,16],[17,26,3,24],[6,11,19,20],[13,14,23,7],[15,1,18,25],[5,9,4,2]],[[17,7,27,8],[14,21,24,19],[5,23,6,1],[2,22,26,15],[0,25,20,4],[18,16,9,13],[3,10,12,11]],[[25,23,8,11],[13,27,20,22],[4,9,3,26],[1,19,14,16],[0,2,5,24],[12,17,18,21],[7,10,6,15]],[[2,10,6,27],[20,1,21,13],[15,12,9,19],[22,26,18,25],[3,5,24,7],[23,4,16,8],[14,17,11,0]],[[5,25,22,21],[8,10,19,3],[26,12,20,14],[9,24,2,16],[11,13,4,17],[0,27,7,15],[23,18,6,1]]];


/**
 * Creates simple schedule
 */
function getSimpleSchedule(post_data) {
    let idx = null;

    // setup headers for schedule
    // if groups > n_courts, then add column for BYE
    let sched = [['R']];
    let groups = Math.floor(parseInt(post_data['n_players']) / 4);
    if (groups <= n_courts) {
        for (let i = 1; i <= groups; i++) {
          sched[0].push('Court ' + i.toString());
        }
    } else {
        for (let i = 1; i <= n_courts; i++) {
          sched[0].push('Court ' + i.toString());
        }
        sched[0].push('BYE');
    }

    // create schedule (as array of array of int)
    let players = post_data['players'];
    console.log('getSimpleSchedule:' + '\n' + JSON.stringify(players));
    if (post_data['n_players'] === '32' && post_data['n_games'] === '8') {
      idx = sched32;
    } else if (post_data['n_players'] === '28' && post_data['n_games'] === '12'){
      idx = sched28_12;
    }  else {
      size = 4
      rounds = parseInt(post_data['n_games']);
      idx = geneticSolver(groups, size, rounds);
    }

    // convert schedule to human-readable format
    for (let i = 0; i < idx.length; i++) {
      let round = [i + 1];
      for (let j = 0; j < idx[i].length; j++) {
        let matchup = idx[i][j];
        t1 = players[matchup[0]] + ' and ' + players[matchup[1]];
        t2 = players[matchup[2]] + ' and ' + players[matchup[3]];
        let pairing = t1 + '\n' + t2;
        round.push(pairing);
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
  if (txt.includes('\n')) {
    let players = txt.split(/\r?\n/);
    return players.map(x => x.replace(/\d+|^\s+|\s+$/g, '').trim());
  } else {
    return activePlayers();
  }
}


/**
 * Processes simple form
 * Uses player names if supplied, otherwise reads from sheet
 */
function processSimpleForm(formData) {
  let players = processPlayerTextArea(formData['players']);
  console.log('processSimple:' + '\n' + JSON.stringify(players));
  formData['players'] = players;
  let sched = getSimpleSchedule(formData);
  writeSchedule(sched);
  formatSchedule();
  let sheet = SpreadsheetApp.getActive().getSheetByName('schedule');
  SpreadsheetApp.getActive().setActiveSheet(sheet);
  closeSidebar();
}