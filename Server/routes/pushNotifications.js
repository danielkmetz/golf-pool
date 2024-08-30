const express = require('express');
const router = express.Router();
const ScheduleModel = require('../models/schedule');
const UserPick = require('../models/userPicks');
const UserModel = require('../models/users');
const axios = require('axios');
const cron = require('node-cron');

function getNextThursdayDate() {
    const today = new Date();
    const dayOfWeek = today.getDay();
  
    // Calculate the number of days until the next Thursday
    const daysUntilThursday = dayOfWeek <= 4 ? 4 - dayOfWeek : 11 - dayOfWeek;
  
    // Add the number of days to the current date
    const nextThursday = new Date(today.getTime() + daysUntilThursday * 24 * 60 * 60 * 1000);
  
    // Set the time to 05:00:00.000 UTC to match the required format
    nextThursday.setUTCHours(5, 0, 0, 0);

    // Return the date in ISO 8601 format with UTC time zone
    return nextThursday.toISOString();
}

// Function to send notifications
async function sendTournamentNotifications() {
    try {
        const nextThursday = getNextThursdayDate();
        
        // Query for the upcoming tournament
        const tournamentInfo = await ScheduleModel.findOne({ Starts:  nextThursday});

        if (!tournamentInfo) {
            console.log('No upcoming tournament found');
            return;
        }

        console.log('Upcoming tournament:', tournamentInfo);

        // Retrieve all user push tokens
        const users = await UserModel.find({ userPushToken: { $exists: true, $ne: null } });
        const pushTokens = users.map(user => user.userPushToken);
        console.log('Push tokens:', pushTokens);

        // Prepare messages to send
        const messages = pushTokens.map(token => ({
            to: token,
            sound: 'default',
            title: 'Upcoming Tournament',
            body: `${tournamentInfo.Name} starts Thursday! Make your picks and get in the action!`,
            data: { tournamentId: tournamentInfo._id } // Optional: send additional data
        }));

        // Send notifications in batches
        const chunkSize = 100; // Max of 100 notifications per request
        const expoPushUrl = 'https://exp.host/--/api/v2/push/send';
        for (let i = 0; i < messages.length; i += chunkSize) {
            const chunk = messages.slice(i, i + chunkSize);
            await axios.post(expoPushUrl, chunk);
        }

        console.log('Notifications sent successfully');
    } catch (error) {
        console.error('Error sending notifications:', error);
        throw error; // Rethrow the error to be handled by the caller if needed
    }
}

async function sendNotificationToUsersWithoutPicks() {
    try {
        const nextThursday = getNextThursdayDate();
        
        // Query for the upcoming tournament
        const tournamentInfo = await ScheduleModel.findOne({ Starts:  nextThursday});
        const tournamentName = tournamentInfo ? tournamentInfo.Name : 'tournament';
        // Find all users with a push token
        const usersWithPushTokens = await UserModel.find({ userPushToken: { $exists: true, $ne: null } });

        const usersWithoutPicks = [];

        // Iterate over each user to check if they have picks
        for (const user of usersWithPushTokens) {
            const userPicks = await UserPick.findOne({ username: user.username });

            if (!userPicks) {
                usersWithoutPicks.push(user);
            }
        }
        console.log(usersWithoutPicks);
        // Prepare and send push notifications to users without picks
        const messages = usersWithoutPicks.map(user => ({
            to: user.userPushToken,
            sound: 'default',
            title: 'Get your picks in!',
            body: `${user.username}, don’t forget to submit picks before the ${tournamentName} starts tomorrow!`,
            data: { username: user.username }
        }));

        // Send notifications in batches (if necessary)
        const chunkSize = 100; // Max of 100 notifications per request
        const expoPushUrl = 'https://exp.host/--/api/v2/push/send';
        for (let i = 0; i < messages.length; i += chunkSize) {
            const chunk = messages.slice(i, i + chunkSize);
            await axios.post(expoPushUrl, chunk);
        }

        console.log('Notifications sent successfully to users without picks.');
    } catch (error) {
        console.error('Error sending notifications:', error);
    }
};

async function sendNotificationToUsersWithPicks() {
    try {
        const nextThursday = getNextThursdayDate();
        
        // Query for the upcoming tournament
        const tournamentInfo = await ScheduleModel.findOne({ Starts: nextThursday });
        const tournamentName = tournamentInfo ? tournamentInfo.Name : 'tournament';

        // Find all users with a push token
        const usersWithPushTokens = await UserModel.find({ userPushToken: { $exists: true, $ne: null } });

        const usersWithPicks = [];

        // Iterate over each user to check if they have picks
        for (const user of usersWithPushTokens) {
            const userPicks = await UserPick.findOne({ username: user.username });

            if (userPicks) {
                usersWithPicks.push(user);
            }
        }

        console.log(usersWithPicks);

        // Prepare and send push notifications to users with picks
        const messages = usersWithPicks.map(user => ({
            to: user.userPushToken,
            sound: 'default',
            title: 'Good luck!',
            body: `The ${tournamentName} is underway!`,
            data: { username: user.username }
        }));

        // Send notifications in batches (if necessary)
        const chunkSize = 100; // Max of 100 notifications per request
        const expoPushUrl = 'https://exp.host/--/api/v2/push/send';
        for (let i = 0; i < messages.length; i += chunkSize) {
            const chunk = messages.slice(i, i + chunkSize);
            await axios.post(expoPushUrl, chunk);
        }

        console.log('Notifications sent successfully to users with picks.');
    } catch (error) {
        console.error('Error sending notifications:', error);
    }
};


router.post('/sendPositionNotifications', async (req, res) => {
    try {
        const { userPositionMap } = req.body; // Expecting an array of objects with { username, position }
        console.log(userPositionMap);
        if (!Array.isArray(userPositionMap) || userPositionMap.length === 0) {
            return res.status(400).send('Invalid request format or empty array');
        }

        // Prepare messages to send
        const messages = [];

        for (const user of userPositionMap) {
            const { username, position } = user;
            const foundUser = await UserModel.findOne({ username });
            if (foundUser && foundUser.userPushToken) {
                // Prepare the message
                messages.push({
                    to: foundUser.userPushToken,
                    sound: 'default',
                    title: 'Tournament Update',
                    body: `${username}, you are currently in position ${position}!`,
                    data: { username, position },
                });

                // Update the user's positionNotification to true
                foundUser.positionNotification = true;
                await foundUser.save();
            }
        }

        if (messages.length === 0) {
            return res.status(404).send('No users with push tokens found');
        }

        // Send notifications in batches
        const chunkSize = 100; // Max of 100 notifications per request
        const expoPushUrl = 'https://exp.host/--/api/v2/push/send';
        for (let i = 0; i < messages.length; i += chunkSize) {
            const chunk = messages.slice(i, i + chunkSize);
            await axios.post(expoPushUrl, chunk);
        }

        console.log('Position notifications sent and user status updated successfully');
        res.status(200).send('Position notifications sent and user status updated successfully');
    } catch (error) {
        console.error('Error sending position notifications:', error);
        res.status(500).send('Failed to send position notifications');
    }
});



// Route to manually trigger the notification
router.get('/triggerNotification', async (req, res) => {
    try {
        await sendTournamentNotifications();
        res.status(200).send('Notification sent successfully');
    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).send('Failed to send notification');
    }
});

// Route to manually trigger the notification
router.get('/triggerNotificationForNoPicks', async (req, res) => {
    try {
        await sendNotificationToUsersWithoutPicks();
        res.status(200).send('Notification sent successfully');
    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).send('Failed to send notification');
    }
});

router.get('/triggerStartOfTournament', async (req, res) => {
    try {
        await sendNotificationToUsersWithPicks();
        res.status(200).send('Notification sent successfully');
    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).send('Failed to send notification');
    }
});

router.get('/triggerPositionNotificationReset', async (req, res) => {
    try {
        await resetPositionNotifications();
        res.status(200).send('All position notification fields have been reset to false');
    } catch (error) {
        console.error('Error updating position notifications', error);
        res.status(500).send('Failed to update position notifications');
    }
});

cron.schedule('0 1 * * 3,4', async () => {
    console.log('Running scheduled task to send notifications to users without picks');
    try {
        await sendNotificationToUsersWithoutPicks();
    } catch (error) {
        console.error('Error during scheduled task:', error);
    }
});

cron.schedule('0 20 * * 1', async () => {
    console.log('Running scheduled task to send tournament notifications');
    try {
        await sendTournamentNotifications();
    } catch (error) {
        console.error('Error during scheduled task:', error);
    }
});


cron.schedule('0 16 * * 4', async () => {
    console.log('Running scheduled task to send tournament notifications');
    try {
        await sendTournamentNotifications();
    } catch (error) {
        console.error('Error during scheduled task:', error);
    }
});

cron.schedule('0 9 * * 5,6,0,2', async () => {
    console.log('Running scheduled task to reset position notifications');
    try {
        await resetPositionNotifications();
    } catch (error) {
        console.error('Error during scheduled task:', error);
    }
});

module.exports = router;
