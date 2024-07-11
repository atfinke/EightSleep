// Constants
const USERNAME = "YOUR_USERNAME";
const PASSWORD = "YOUR_PASSWORD";
const CLIENT_ID = "YOUR_CLIENT_ID";
const CLIENT_SECRET = "YOUR_CLIENT_SECRET";
const USER_ID = "YOUR_USER_ID";
const ROUTINE_ID = "YOUR_ROUTINE_ID";

// Parse input arguments
const HOURS = parseInt(args.plainTexts[0]);
const MINUTES = parseInt(args.plainTexts[1]);

/**
 * Performs authentication and returns an access token.
 * @returns {Promise<string>} The access token.
 */
async function authenticate() {
    const authRequest = new Request("https://auth-api.8slp.net/v1/tokens");
    authRequest.method = "POST";
    authRequest.headers = {
        "Host": "auth-api.8slp.net",
        "Accept": "application/json",
        "Accept-Language": "en-US,en;q=0.9",
        "User-Agent": "iOS App - 6.5.28/53648 - Apple iPhone16,1 - iOS 17.5.1",
        "Connection": "keep-alive",
        "Content-Type": "application/json"
    };
    authRequest.body = JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "password",
        username: USERNAME,
        password: PASSWORD
    });

    const response = await authRequest.loadJSON();
    return response.access_token;
}

/**
 * Updates the sleep routine with new alarm settings.
 * @param {string} accessToken - The authentication token.
 * @returns {Promise<Object>} The updated routine data.
 */
async function updateSleepRoutine(accessToken) {
    const updateRequest = new Request(`https://app-api.8slp.net/v2/users/${USER_ID}/routines/${ROUTINE_ID}`);
    updateRequest.method = "PUT";
    updateRequest.headers = {
        "Host": "app-api.8slp.net",
        "Accept": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "Accept-Language": "en-US,en;q=0.9",
        "User-Agent": "iOS App - 6.5.28/53648 - Apple iPhone16,1 - iOS 17.5.1",
        "Connection": "keep-alive",
        "Content-Type": "application/json"
    };

    updateRequest.body = JSON.stringify({
        id: ROUTINE_ID,
        alarms: [],
        days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
        enabled: true,
        bedtime: {
            time: "22:30:00",
            dayOffset: "MinusOne"
        },
        alarmsToCreate: [
            {
                enabled: true,
                disabledIndividually: false,
                timeWithOffset: {
                    time: `${HOURS.toString().padStart(2, '0')}:${MINUTES.toString().padStart(2, '0')}:00`,
                    dayOffset: "Zero"
                },
                settings: {
                    vibration: {
                        enabled: true,
                        powerLevel: 50,
                        pattern: "rise"
                    },
                    thermal: {
                        enabled: true,
                        level: 20
                    }
                },
                dismissedUntil: "1970-01-01T00:00:00Z",
                snoozedUntil: "1970-01-01T00:00:00Z"
            }
        ]
    });

    return await updateRequest.loadJSON();
}

/**
 * Verifies if the alarm time has been updated correctly.
 * @param {Object} responseData - The response data from the update request.
 * @returns {boolean} True if the alarm time has been updated correctly, false otherwise.
 */
function verifyAlarmUpdate(responseData) {
    const expectedTime = `${HOURS.toString().padStart(2, '0')}:${MINUTES.toString().padStart(2, '0')}:00`;
    const updatedAlarm = responseData.settings.routines[0].alarms[0];

    return updatedAlarm && updatedAlarm.timeWithOffset.time === expectedTime;
}

/**
 * Main function to run the script.
 */
async function main() {
    try {
        const accessToken = await authenticate();
        const updatedRoutine = await updateSleepRoutine(accessToken);
        const isUpdated = verifyAlarmUpdate(updatedRoutine);
        return isUpdated;
    } catch (error) {
        console.error("An error occurred:", error);
        return false;
    }
}

// Run the script
main();