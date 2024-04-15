function getNextThursdayDate() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  
    // Calculate the number of days until the next Thursday
    const daysUntilThursday = dayOfWeek <= 4 ? 4 - dayOfWeek : 11 - dayOfWeek;
  
    // Add the number of days to the current date
    const nextThursday = new Date(today.getTime() + daysUntilThursday * 24 * 60 * 60 * 1000);
  
    return nextThursday;
  }

module.exports = getNextThursdayDate;  