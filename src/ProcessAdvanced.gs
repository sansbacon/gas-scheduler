/**
 * Generates schedule from AdvancedSchedule menu option / sidebar 
 */
function getAdvancedSchedule(post_data) {

  let gae_url = 'https://pickleball-315623.uc.r.appspot.com';
  let gcr_url = 'https://helloworld-axquv55tla-uc.a.run.app';
  let sched = [['#', 'Court 1', 'Court 2', 'Court 3', 'Court 4', 'Court 5', 'Court 6', 'Court 7']];

  if (post_data['method'] === 'basic') {
    let n_players = parseInt(post_data['n_players']);
    let n_matchups = parseInt(n_players / 4);
    let n_rounds = parseInt(post_data['n_games']);
    let idx = geneticSolver(n_matchups, 4, n_rounds);
    let players = _.filter(post_data['players'], (e) => e[1] === 'Yes');
    players = _.map(players, (player) => { return player[0]});
    players = _.shuffle(players);
    for (let i = 0; i < idx.length; i++) {
      let round = [i + 1];
      for (let j = 0; j < idx[i].length; j++) {
        let matchup = idx[i][j];
        t1 = players[matchup[0]] + ' and ' + players[matchup[1]];
        t2 = players[matchup[2]] + ' and ' + players[matchup[3]];
        round.push(t1 + '\n' + t2);
      }
      sched.push(round)
    }
  }

  return sched;
}


/**
 * Processes form data from AdvancedSchedule menu option / sidebar 
 */
function processAdvancedForm(formData) {
  eval(UrlFetchApp.fetch('https://cdn.jsdelivr.net/npm/lodash@4.17.4/lodash.min.js').getContentText());
  data = formData;
  let prange = SpreadsheetApp.getActive().getSheetByName('players').getDataRange();
  data['players'] = prange.getValues();
  let sched = getAdvancedSchedule(data);
  writeSchedule(sched);
  closeSidebar();
}
