import axios from 'axios';

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

export function getThursdayDate(currentDay, currentDate) {
  const newDate = new Date(currentDate);

  let offset;
  switch (currentDay) {
    case 0: // Sunday
      offset = -3;
      break;
    case 1: // Monday
      offset = 3;
      break;
    case 2: // Tuesday
      offset = 2;
      break;
    case 3: // Wednesday
      offset = 1;
      break;
    case 5: // Friday
      offset = -1;
      break;
    case 6: // Saturday
      offset = -2;
      break;
    default: // Thursday
      offset = 0;
  }

  newDate.setDate(currentDate.getDate() + offset);

  const year = newDate.getFullYear();
  const month = String(newDate.getMonth() + 1).padStart(2, '0'); // Always two digits
  const day = String(newDate.getDate()).padStart(2, '0');         // Always two digits

  return `${year}-${month}-${day}`;
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
  const par = coursePar ?? 72;

  if (!name) {
    console.error("Empty name provided.");
    return null;
  }
  
  let currentPos = getCurrentPosition(name, liveResults);
  
  // Check if currentPos is not a valid position or if it's "--"
  if (!currentPos || currentPos === "--") {
    return null;
  }

  // Find the golfer in the liveResults array
  const golfer = liveResults.find(g => g.player_name === name);
  
  if (!golfer) {
    //console.error("Golfer not found in liveResults:", name);
    return par + 10;
  }

  // If the golfer withdrew (WD), return coursePar + 10 for rounds without a valid score
  if (currentPos === "WD") {
    switch (round) {
      case 1: return golfer.R1 ?? par + 10;
      case 2: return golfer.R2 ?? par + 10;
      case 3: return golfer.R3 ?? par + 10;
      case 4: return golfer.R4 ?? par + 10;
      default:
        console.error("Invalid round number:", round);
        return null;
    }
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
      case 1: return golfer.R1
      case 2: return golfer.R2
      case 3: return par + 10;
      case 4: return par + 10;
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
      return; // Skip if position is not valid
    }

    const golfer = liveResults.find((golfer) => golfer.player_name === name);

    if (!golfer) {
      console.error("Golfer not found in liveResults:", name);
      return;
    }

    if (currentPos === "CUT" || currentPos === "WD") {
      // If the golfer is CUT or WD, check if there's a valid score for the round, otherwise return coursePar + 10
      switch (roundNumber) {
        case 1: 
          roundScores.push(golfer.R1 ?? coursePar + 10);
          break;
        case 2: 
          roundScores.push(golfer.R2 ?? coursePar + 10);
          break;
        case 3: 
          roundScores.push(golfer.R3 ?? coursePar + 10);
          break;
        case 4: 
          roundScores.push(golfer.R4 ?? coursePar + 10);
          break;
        default:
          console.error("Invalid round number:", roundNumber);
          break;
      }
    } else {
      // If the golfer is not CUT or WD, simply push the score for the round
      switch (roundNumber) {
        case 1:
          roundScores.push(golfer.R1);
          break;
        case 2:
          roundScores.push(golfer.R2);
          break;
        case 3:
          roundScores.push(golfer.R3);
          break;
        case 4:
          roundScores.push(golfer.R4);
          break;
        default:
          console.error("Invalid round number:", roundNumber);
          break;
      }
    }
  });

  return roundScores;
};

export const getScore = (name, liveResults, coursePar) => {
  if (!Array.isArray(liveResults)) {
    return '-'; // Default value if liveResults is not an array
  }

  const golfer = liveResults.find(g => g.player_name === name);

  if (!golfer) {
    return '-'; // Default value if the golfer is not found
  }

  // Handle the special cases for CUT and WD
  const currentPos = getCurrentPosition(name, liveResults);
  
  if (currentPos === "CUT" || currentPos === "WD") {
    return "+10"; // Return coursePar + 10 if the golfer is CUT or WD
  }

  // Format the score
  const score = golfer.current_score;

  if (score > 0) {
    return `+${score}`;
  } else if (score === 0) {
    return 'E';
  } else {
    return score; // This handles negative scores
  }
};

export const getToday = (name, liveResults) => {
  const golfer = liveResults.find(g => g.player_name === name)
  if (golfer) {
    if (golfer.today > 0) {
      return `+${golfer.today}`;
    }
    if (golfer.today === 0) {
      return `E`;
    }
    return golfer.today; 
  } else {
    return;
  }
};

export const sortUsers = (activeUsers, calculateLowestScores) => {
  let sorted = activeUsers.map(user => {
    const totalScore =
      calculateLowestScores(user.username, 'R1') +
      calculateLowestScores(user.username, 'R2') +
      calculateLowestScores(user.username, 'R3') +
      calculateLowestScores(user.username, 'R4');
    const r4Score = calculateLowestScores(user.username, 'R4');
    const r3Score = calculateLowestScores(user.username, 'R3');
    const r2Score = calculateLowestScores(user.username, 'R2');
    const r1Score = calculateLowestScores(user.username, 'R1');
    return {
      user,
      totalScore,
      r4Score,
      r3Score,
      r2Score,
      r1Score,
    };
  }).sort((a, b) => {
    if (a.totalScore === b.totalScore) {
      if (a.r4Score === b.r4Score) {
        if (a.r3Score === b.r3Score) {
          if (a.r2Score === b.r2Score) {
            return a.r1Score - b.r1Score;
          }
          return a.r2Score - b.r2Score;
        }
        return a.r3Score - b.r3Score;
      }
      return a.r4Score - b.r4Score;
    }
    return a.totalScore - b.totalScore;
  });

  // Adjust positions to handle tie-breaking and knock-on effects
  for (let i = 0; i < sorted.length - 1; i++) {
    let j = i + 1;
    while (j < sorted.length && sorted[i].totalScore === sorted[j].totalScore &&
           sorted[i].r4Score === sorted[j].r4Score &&
           sorted[i].r3Score === sorted[j].r3Score &&
           sorted[i].r2Score === sorted[j].r2Score &&
           sorted[i].r1Score === sorted[j].r1Score) {
      j++;
    }
    if (j > i + 1) {
      const tieGroup = sorted.slice(i, j);
      tieGroup.sort((a, b) => {
        if (a.r4Score === b.r4Score) {
          if (a.r3Score === b.r3Score) {
            if (a.r2Score === b.r2Score) {
              return a.r1Score - b.r1Score;
            }
            return a.r2Score - b.r2Score;
          }
          return a.r3Score - b.r3Score;
        }
        return a.r4Score - b.r4Score;
      });
      sorted.splice(i, tieGroup.length, ...tieGroup);
      i = j - 1;
    }
  }

  return sorted;
};

export const sendSMS = async (phoneNumber, message, messageVolume) => {
  console.log(messageVolume)
  try {
    const response = await axios.post(
      'http://localhost:5000/api/twilio/send-text',
      {
        recipient: phoneNumber,
        textMessage: message,
        messageVolume: messageVolume, // Pass message volume here
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
};

export function areAllActiveUsersInResponse({activeUsers, responseData, tournamentName}) {
  if (!Array.isArray(responseData)) {
    return false;
  }
  return activeUsers.every(user => {
      return responseData.some(data => 
          data.username === user.username && 
          data.results.some(result => result.tournamentName === tournamentName)
      );
  });
}

export const formatDate = (isoDate, addDays = 0) => {
  if (!isoDate) return null; // Handle cases where isoDate is null or undefined

  const date = new Date(isoDate);
  date.setDate(date.getDate() + addDays); // Add the specified number of days

  const options = { month: '2-digit', day: '2-digit', year: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

export const organizeAndCalculateScores = (userData, resultsData, coursePar, format, currentDay) => {
  let organizedData = [];
  
  userData.forEach((user) => {
    user.userPicks.forEach((pick) => {
      pick.golferName.forEach((golfer) => {
        organizedData.push({
          golferName: golfer,
          username: user.username,
          R1: getRoundScore(1, golfer, resultsData, coursePar),
          R2: getRoundScore(2, golfer, resultsData, coursePar),
          R3: getRoundScore(3, golfer, resultsData, coursePar),
          R4: getRoundScore(4, golfer, resultsData, coursePar),
        });
      });
    });
  });
  
  const calculateScores = (username, round) => {
    if (currentDay === 1 || currentDay === 2 || currentDay === 3) return null;

    const userScores = organizedData.filter((item) => item.username === username);
    
    const roundScores = userScores.map((item) => item[round]);

    // Check if all golfers have scores for the current round
    const allGolfersHaveScores = roundScores.every((score) => score !== null && score !== undefined);

    if (!allGolfersHaveScores) return null;

    const teamPar = coursePar * roundScores.length; // Total par for the user's team

    if (format === 'Salary Cap' || format === 'Multi-Week Salary Cap') {
      // Calculate total score for all golfers
      const totalScore = roundScores.reduce((total, score) => total + score, 0);
      let scoreRelativeToPar = totalScore - teamPar;
      return scoreRelativeToPar;
    } else {
      // Calculate lowest 4 scores
      if (roundScores.length < 8) return null; // Not enough valid scores to calculate
      const lowestScores = roundScores.sort((a, b) => a - b).slice(0, 4);
      const totalLowestScore = lowestScores.reduce((total, score) => total + score, 0);
      const scoreRelativeToPar = totalLowestScore - (coursePar * 4); // Par for the lowest 4 golfers
      return scoreRelativeToPar;
    }
  };

  return { organizedData, calculateScores };
};

