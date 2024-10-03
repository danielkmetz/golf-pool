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

function getFollowingThursdayDate() {
    const today = new Date();
    const dayOfWeek = today.getDay();
  
    // Calculate the number of days until the next Thursday
    const daysUntilNextThursday = dayOfWeek <= 4 ? 4 - dayOfWeek : 11 - dayOfWeek;
  
    // Add 7 more days to get the following Thursday
    const daysUntilFollowingThursday = daysUntilNextThursday + 7;
  
    // Add the number of days to the current date
    const followingThursday = new Date(today.getTime() + daysUntilFollowingThursday * 24 * 60 * 60 * 1000);
  
    // Set the time to 05:00:00.000 UTC to match the required format
    followingThursday.setUTCHours(5, 0, 0, 0);

    // Return the date in ISO 8601 format with UTC time zone
    return followingThursday.toISOString();
}

function getFollowingFollowingThursdayDate() {
    const today = new Date();
    const dayOfWeek = today.getDay();
  
    // Calculate the number of days until the next Thursday
    const daysUntilNextThursday = dayOfWeek <= 4 ? 4 - dayOfWeek : 11 - dayOfWeek;
  
    // Add 7 more days to get the following Thursday
    const daysUntilFollowingThursday = daysUntilNextThursday + 14;
  
    // Add the number of days to the current date
    const followingThursday = new Date(today.getTime() + daysUntilFollowingThursday * 24 * 60 * 60 * 1000);
  
    // Set the time to 05:00:00.000 UTC to match the required format
    followingThursday.setUTCHours(5, 0, 0, 0);

    // Return the date in ISO 8601 format with UTC time zone
    return followingThursday.toISOString();
}


// Function to send notifications
async function sendTournamentNotifications() {
    try {
        const nextThursday = getNextThursdayDate();
        const followingThursday = getFollowingThursdayDate();
        const followingFollowingThursday = getFollowingFollowingThursdayDate();
        
        // Query for the upcoming tournament
        let tournamentInfo = await ScheduleModel.findOne({ Starts: nextThursday });

        // If no tournament is found, query for the following Thursday
        if (!tournamentInfo) {
            tournamentInfo = await ScheduleModel.findOne({ Starts: followingThursday });
        }

        if (!tournamentInfo) {
            tournamentInfo = await ScheduleModel.findOne({ Starts: followingFollowingThursday });
        }

        if (!tournamentInfo) {
            console.log('No upcoming tournament found');
            return;
        }

        console.log('Upcoming tournament:', tournamentInfo);

        // Retrieve all users with a push token and experience ID
        const users = await UserModel.find({
            userPushToken: { $exists: true, $ne: null },
            experienceId: { $exists: true, $ne: null }  // Ensure experience ID is present
        });

        const pushTokensByExperience = {};

        // Group users by experience ID
        users.forEach(user => {
            const experienceId = user.experienceId;
            if (!pushTokensByExperience[experienceId]) {
                pushTokensByExperience[experienceId] = [];
            }
            pushTokensByExperience[experienceId].push({
                to: user.userPushToken,
                sound: 'default',
                title: 'Upcoming Tournament',
                body: `${tournamentInfo.Name} starts Thursday! Make your picks and get in the action!`,
                data: { tournamentId: tournamentInfo._id } // Optional: send additional data
            });
        });

        console.log('Push tokens grouped by experience:', pushTokensByExperience);

        // Send notifications in batches for each experience ID
        const chunkSize = 100; // Max of 100 notifications per request
        const expoPushUrl = 'https://exp.host/--/api/v2/push/send';

        for (const experienceId in pushTokensByExperience) {
            const messages = pushTokensByExperience[experienceId];

            for (let i = 0; i < messages.length; i += chunkSize) {
                const chunk = messages.slice(i, i + chunkSize);
                try {
                    const response = await axios.post(expoPushUrl, chunk);
                    
                    // Handle the individual results within the batch response
                    response.data.data.forEach(async (result) => {
                        if (result.status === 'error') {
                            console.error(`Error for token ${result.to}:`, result.message);
                            
                            // Handle specific error for invalid tokens
                            if (result.details && result.details.error === 'DeviceNotRegistered') {
                                console.log(`Removing bad token: ${result.to}`);
                                // Remove invalid push token from the database
                                await UserModel.updateOne(
                                    { userPushToken: result.to },
                                    { $unset: { userPushToken: '', experienceId: '' } }  // Clear both pushToken and experienceId
                                );
                            }
                        } else {
                            console.log(`Successfully sent notification to ${result.to}`);
                        }
                    });

                } catch (batchError) {
                    // Log batch-level errors but continue processing the next batch
                    console.error(`Error sending batch for experience ID ${experienceId} starting at index ${i}:`, batchError.response ? batchError.response.data : batchError.message);
                }
            }
        }

        console.log('Notifications sent successfully');
    } catch (error) {
        console.error('General error sending notifications:', error);
    }
}

async function sendNotificationToUsersWithoutPicks() {
    try {
        const nextThursday = getNextThursdayDate();
        
        // Query for the upcoming tournament
        const tournamentInfo = await ScheduleModel.findOne({ Starts: nextThursday });
        const tournamentName = tournamentInfo ? tournamentInfo.Name : 'tournament';

        // Find all users with a push token and experience ID
        const usersWithPushTokens = await UserModel.find({
            userPushToken: { $exists: true, $ne: null },
            experienceId: { $exists: true, $ne: null } // Ensure experience ID is present
        });

        const usersWithoutPicks = [];

        // Iterate over each user to check if they have picks
        for (const user of usersWithPushTokens) {
            const userPicks = await UserPick.findOne({ username: user.username });

            if (!userPicks) {
                usersWithoutPicks.push(user);
            }
        }

        // Group messages by experience ID
        const messagesByExperienceId = {};

        usersWithoutPicks.forEach(user => {
            const experienceId = user.experienceId;
            if (!messagesByExperienceId[experienceId]) {
                messagesByExperienceId[experienceId] = [];
            }
            messagesByExperienceId[experienceId].push({
                to: user.userPushToken,
                sound: 'default',
                title: 'Get your picks in!',
                body: `${user.username}, don’t forget to submit picks before the ${tournamentName} starts tomorrow!`,
                data: { username: user.username }
            });
        });

        // Send notifications in batches grouped by experience ID
        const chunkSize = 100; // Max of 100 notifications per request
        const expoPushUrl = 'https://exp.host/--/api/v2/push/send';

        for (const experienceId in messagesByExperienceId) {
            const messages = messagesByExperienceId[experienceId];

            for (let i = 0; i < messages.length; i += chunkSize) {
                const chunk = messages.slice(i, i + chunkSize);
                try {
                    const response = await axios.post(expoPushUrl, chunk);

                    // Handle the individual results within the batch response
                    response.data.data.forEach(async (result) => {
                        if (result.status === 'error') {
                            console.error(`Error for token ${result.to}:`, result.message);
                            
                            // Handle specific error for invalid tokens
                            if (result.details && result.details.error === 'DeviceNotRegistered') {
                                console.log(`Removing bad token: ${result.to}`);
                                // Remove invalid push token from the database
                                await UserModel.updateOne(
                                    { userPushToken: result.to },
                                    { $unset: { userPushToken: '', experienceId: '' } } // Clear both pushToken and experienceId
                                );
                            }
                        } else {
                            console.log(`Successfully sent notification to ${result.to}`);
                        }
                    });

                } catch (batchError) {
                    // Log batch-level errors but continue processing the next batch
                    console.error(`Error sending batch for experience ID ${experienceId} starting at index ${i}:`, batchError.response ? batchError.response.data : batchError.message);
                }
            }
        }

        console.log('Notifications sent successfully to users without picks.');
    } catch (error) {
        console.error('Error sending notifications:', error);
    }
}

async function sendNotificationToUsersWithPicks() {
    try {
        const nextThursday = getNextThursdayDate();
        
        // Query for the upcoming tournament
        const tournamentInfo = await ScheduleModel.findOne({ Starts: nextThursday });
        const tournamentName = tournamentInfo ? tournamentInfo.Name : 'tournament';

        // Find all users with a push token and experience ID
        const usersWithPushTokens = await UserModel.find({ 
            userPushToken: { $exists: true, $ne: null },
            experienceId: { $exists: true, $ne: null }  // Ensure users have both push token and experience ID
        });

        const usersWithPicks = [];

        // Iterate over each user to check if they have picks
        for (const user of usersWithPushTokens) {
            const userPicks = await UserPick.findOne({ username: user.username });

            if (userPicks) {
                usersWithPicks.push(user);
            }
        }

        // Group users by experience ID
        const usersGroupedByExperience = {};

        usersWithPicks.forEach(user => {
            const experienceId = user.experienceId;
            if (!usersGroupedByExperience[experienceId]) {
                usersGroupedByExperience[experienceId] = [];
            }
            usersGroupedByExperience[experienceId].push({
                to: user.userPushToken,
                sound: 'default',
                title: 'Good luck!',
                body: `The ${tournamentName} is underway!`,
                data: { username: user.username }
            });
        });

        // Send notifications for each experience ID in batches
        const chunkSize = 100; // Max of 100 notifications per request
        const expoPushUrl = 'https://exp.host/--/api/v2/push/send';

        for (const experienceId in usersGroupedByExperience) {
            const messages = usersGroupedByExperience[experienceId];

            for (let i = 0; i < messages.length; i += chunkSize) {
                const chunk = messages.slice(i, i + chunkSize);
                try {
                    const response = await axios.post(expoPushUrl, chunk);

                    // Handle the individual results within the batch response
                    response.data.data.forEach(async (result) => {
                        if (result.status === 'error') {
                            console.error(`Error for token ${result.to}:`, result.message);
                            
                            // Handle specific error for invalid tokens
                            if (result.details && result.details.error === 'DeviceNotRegistered') {
                                console.log(`Removing bad token: ${result.to}`);
                                // Remove invalid push token from the database
                                await UserModel.updateOne({ userPushToken: result.to }, { $unset: { userPushToken: '' } });
                            }
                        } else {
                            console.log(`Successfully sent notification to ${result.to}`);
                        }
                    });

                } catch (batchError) {
                    // Log batch-level errors but continue processing the next batch
                    console.error(`Error sending batch for experience ID ${experienceId} starting at index ${i}:`, batchError.response ? batchError.response.data : batchError.message);
                }
            }
        }

        console.log('Notifications sent successfully to users with picks.');
    } catch (error) {
        console.error('Error sending notifications:', error);
    }
}


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

cron.schedule('0 19 * * 2,3', async () => {
    console.log('Running scheduled task to send notifications to users without picks');
    try {
        await sendNotificationToUsersWithoutPicks();
    } catch (error) {
        console.error('Error during scheduled task:', error);
    }
});

cron.schedule('0 12 * * 1,2', async () => {
    console.log('Running scheduled task to send tournament notifications');
    try {
        await sendTournamentNotifications();
    } catch (error) {
        console.error('Error during scheduled task:', error);
    }
});


cron.schedule('0 10 * * 4', async () => {
    console.log('Running scheduled task to send tournament notifications');
    try {
        await sendNotificationToUsersWithPicks();
    } catch (error) {
        console.error('Error during scheduled task:', error);
    }
});

cron.schedule('0 3 * * 5,6,0,2', async () => {
    console.log('Running scheduled task to reset position notifications');
    try {
        await resetPositionNotifications();
    } catch (error) {
        console.error('Error during scheduled task:', error);
    }
});

module.exports = router;
