/**
 * Gets array of players marked active from players sheet.
 * Uses cache so will not reflect very recent changes. 
 */
function activePlayers() {
  let keyname = 'activePlayers'
  let players = cache.get(keyname);
  if (!players) {
    let p = SpreadsheetApp.getActive().getSheetByName('players').getDataRange().getValues();
    let players = _.filter(p, (e) => e[2] === 'Yes');
    cache.put(keyname, _.map(players, (player) => { return player[0]}));
  }
  
  return cache.get(keyname);
}


/**
 * Generates schedule from AdvancedSchedule menu option / sidebar 
 */
function getAdvancedSchedule(post_data) {
  console.log(JSON.stringify(post_data));
  let gae_url = 'https://pickleball-315623.uc.r.appspot.com';
  let gcr_url = 'https://helloworld-axquv55tla-uc.a.run.app';
  let sched = [['Round#', 'Court 1', 'Court 2', 'Court 3', 'Court 4', 'Court 5', 'Court 6', 'Court 7']];

  if (post_data['method'] === 'basic') {
    idx = geneticSolver(7, 4, 7)
    let players = _.filter(post_data['players'], (e) => e[2] === 'Yes');
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
  data = formData;
  let prange = SpreadsheetApp.getActive().getSheetByName('players').getDataRange();
  data['players'] = prange.getValues();
  let sched = getAdvancedSchedule(data);
  writeSchedule(sched);
  closeSidebar();
}
