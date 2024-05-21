export const findGolferData = async (golferName, leaderboardResults) => {
    const golfers = await leaderboardResults.find((
        golfer) => golfer.player_name === golferName);
    //console.log(golfers)
    return golfers
};

export const getLiveResults = async (name, liveResults) => {
  const golfers = liveResults.find((golfer) => golfer.player_name === name)
  console.log(golfers)
  return golfers
}

export function findRoundScores (golferName, round) {
  const golfer = round.find((golfer) => golfer.player_name === golferName);
  return golfer;
}

export function getThursdayDate(value, currentDate) {
  let month = currentDate.getMonth() + 1;
  let year = currentDate.getFullYear();

  month = month < 10 ? '0' + month : month;
     
  
  if (value === 0) {
      let day = currentDate.getDate() - 3;
      day = day < 10 ? '0' + day : day;
      return `${year}-${month}-${day}`;
  }
  if (value === 1) {
      let day = currentDate.getDate() + 3;
      day = day < 10 ? '0' + day : day;
      return `${year}-${month}-${day}`;
  }
  if (value === 2) {
      let day = currentDate.getDate() + 2;
      day = day < 10 ? '0' + day : day;
      return `${year}-${month}-${day}`;
  }
  if (value === 3) {
      let day = currentDate.getDate() + 1;
      day = day < 10 ? '0' + day : day;
      return `${year}-${month}-${day}`;
  }
  if (value === 5) {
      let day = currentDate.getDate() - 1;
      day = day < 10 ? '0' + day : day;
      return `${year}-${month}-${day}`;
  }
  if (value === 6) {
      let day = currentDate.getDate() - 2;
      day = day < 10 ? '0' + day : day;
      return `${year}-${month}-${day}`;
  } else {
      let day = currentDate.getDate();
      day = day < 10 ? '0' + day : day;
      return `${year}-${month}-${day}`;
  } 
}

export const getCurrentPosition = (name, liveResults) => {
    const golfer = liveResults.find(g => g.player_name === name);
    if (golfer) {
        return golfer.current_pos;
    } else {
        return;
    }
}

export const getRoundScore = (round, name, liveResults, coursePar) => {
  if (!name) {
    console.error("Empty name provided.");
    return null;
  }

  let currentPos = getCurrentPosition(name, liveResults);
  //console.log("Current position:", currentPos);

  // Check if currentPos is not a valid position or if it's "--"
  if (!currentPos || currentPos === "--") {
    return null;
  }

  // Find the golfer in the liveResults array
  const golfer = liveResults.find(g => g.player_name === name);
  //console.log("Found golfer:", golfer);

  if (!golfer) {
    console.error("Golfer not found in liveResults:", name);
    return null;
  }

  // Depending on the round, return the score or a default value if the score is not available
  if (currentPos !== "CUT") {
    switch (round) {
      case 1: return golfer.R1;
      case 2: return golfer.R2;
      case 3: return golfer.R3;
      case 4: return golfer.R4;
      default:
        console.error("Invalid round number:", round);
        return null;
    }
  } else {
    switch (round) {
      case 1: return golfer.R1;
      case 2: return golfer.R2;
      case 3: return coursePar + 10;
      case 4: return coursePar + 10;
      default:
        console.error("Invalid round number:", round);
        return null;
    }
  }
};


export const getRoundScores = (allUserPicks, liveResults, roundNumber, coursePar) => {
  const roundScores = [];
  allUserPicks.forEach((name) => {
    const currentPos = getCurrentPosition(name, liveResults);

    if (currentPos === "--") {
        return;
    }
    if (currentPos === "CUT" || currentPos === "WD") {
        return coursePar + 10;
    } else {
      const golfer = liveResults.find((golfer) => golfer.player_name === name);
      if (golfer) {
          if (roundNumber === 1) {
              roundScores.push(golfer.R1);
          } else if (roundNumber === 2) {
              roundScores.push(golfer.R2);
          } else if (roundNumber === 3) {
              roundScores.push(golfer.R3);
          } else if (roundNumber === 4) {
              roundScores.push(golfer.R4);
          }
      }
    }
  });
  return roundScores;
};


export const getScore = (name, liveResults) => {
  const golfer = liveResults.find(g => g.player_name === name)
  if (golfer) {
    if (golfer.current_score > 0) {
      return `+${golfer.current_score}`;
    }
    if (golfer.current_score === 0) {
      return `E`;
    }
    return golfer.current_score; 
  } else {
    return;
  }
};