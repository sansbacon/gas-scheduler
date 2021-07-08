/**
 * ProcessRR.gs
 * Handles creation of Round Robin schedule
 * Can add byes and randomly pair players together  
 */


/**
 * Adds adjustments for byes
 * @param {array} sched - Array of array of string.
 * @return {array}
 */
function byeAdjustment(sched) {
  let adjustedSchedule = [];

  // loop through each round
  // loop through each matchup
  for (let i=0; i < sched.length; i++) {
    if (i === 0) {
      let headers = sched[i];
      headers.pop();
      headers.push('Bye');
      adjustedSchedule.push(headers);
    }

    else {
      let roundSchedule = [];
      
      // find the bye
      let byeIdx = null;
      let byeVal = null;
      for (let j=0; j < sched[i].length; j++) {
        let matchup = sched[i][j];
        
        // if this is a Bye, then don't add it to the schedule
        // instead, store the index and value to swap at the end
        if (matchup.includes('Bye')) {
          byeIdx = j;
          byeVal = matchup.replace('Bye', '').replace('\n', '').trim();
        } else {
          roundSchedule.push(matchup);
        }      
      }

      // swap with last element (if not already last)
      roundSchedule.push(byeVal);
      adjustedSchedule.push(roundSchedule);
    }  
  }

  return adjustedSchedule;
}


/**
 * Gets scheduled partners and randomly pairs others 
 * Sheet has two columns - player 1 and player 2
 */
function getRRPartners() {
  let data = null;
  let s = SpreadsheetApp.getActive().getSheetByName('rr_players').getDataRange().getValues();

  // first element is headers - not needed here
  s.shift();
  
  // break up 2D array into columns
  let arrayColumn = (arr, n) => arr.map(x => x[n]);
  let player1 = arrayColumn(s, 0);
  let player2 = arrayColumn(s, 1);
  player2 = player2.filter(function(e){ return e === 0 || e });

  // test for uneven number of players
  if ((player1.length + player2.length) % 2 === 1) {
    throw 'Uneven number of players';
  }

  // if same length, then data is fine, do nothing
  // if not same length, then have to pair players
  if (player1.length === player2.length) {
    data = s;
  } 
  
  else {
    let pairings = [];

    // iterate over existing pairings
    for (let i=0; i < player2.length; i++) {
      pairings.push([player1[i], player2[i]])
    }

    // create new pairings
    let unmatched = _.shuffle(_.slice(player1, player2.length, player1.length))
    for (let i=0; i < unmatched.length; i+=2) {
      pairings.push([unmatched[i], unmatched[i + 1]])
    }

    data = pairings;
  }

  return data;
}


/**
 * Gets pairings for partners
 */
function partnerPairings(teams) {

  if (teams.length % 2 == 1) {
    teams.push('Bye');
  }

  const teamCount = teams.length;
  const rounds = teamCount - 1;
  const half = teamCount / 2;

  // fix headers to account for possible byes
  // add the courts then add bye with odd # teams
  let headers = ['#']
  
  for (let i=1; i <= Math.floor(teams.length / 2); i++) {
    headers.push('Court ' + i.toString());
  }

  const tournamentPairings = [headers];

  const teamIndexes = teams.map((_, i) => i).slice(1);

  for (let round=0; round < rounds; round++) {
    const roundPairings = [(round + 1).toString()];
    const newteamIndexes = [0].concat(teamIndexes);
    const firstHalf = newteamIndexes.slice(0, half);
    const secondHalf = newteamIndexes.slice(half, teamCount).reverse();

    for (let i = 0; i < firstHalf.length; i++) {
      let team1 = teams[firstHalf[i]];
      let team2 = teams[secondHalf[i]];
      let matchup = null;
       
      if (team1.indexOf('Bye') >= 0) {
        matchup = 'Bye' + '\n' + team2.join(' and ');
      }

      else if (team2.indexOf('Bye') >= 0) {
        matchup = 'Bye' + '\n' + team1.join(' and ');
      }

      else {
        matchup = team1.join(' and ') + '\n' + team2.join(' and ');
      }

      roundPairings.push(matchup);
    }

    // rotating the array
    teamIndexes.push(teamIndexes.shift());
    tournamentPairings.push(roundPairings);
  }

  return tournamentPairings;
}


/**
 * Processes form from RR.html
 * @param {array} formData - the data from RR.html form submission.
 */
function processRRForm(formData) {
  let n_games = parseInt(formData['n_games']);
  let teams = getRRPartners();
  let sched = partnerPairings(teams);
  
  // remove the extra pairings
  sched = sched.slice(0, n_games + 1); 

  // now account for byes
  if (teams.indexOf('Bye') > 0) {
    sched = byeAdjustment(sched);
  }  
  
  writeSchedule(sched);
  formatSchedule();
  let sheet = SpreadsheetApp.getActive().getSheetByName('schedule')
  SpreadsheetApp.getActive().setActiveSheet(sheet);
  closeSidebar();
}
