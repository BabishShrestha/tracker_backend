const { google } = require('googleapis');
const { SCOPES } = require('.');
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');
const https = require("https");
const { HOST, PATH } = require('.');

const serviceAccount = require('./service-account.json');

initializeApp({
  credential: cert(serviceAccount)
});



const db = getFirestore();

// const docRef = db.collection('fcm_messages');

// Use serviceAccount object in your server code (e.g., Firebase initialization)
function getAccessToken() {
  return new Promise(function (resolve, reject) {
    // const key = require(serviceAccount);
    const jwtClient = new google.auth.JWT(
      serviceAccount.client_email,
      null,
      serviceAccount.private_key,
      SCOPES,
      null
    );
    jwtClient.authorize(function (err, tokens) {
      if (err) {
        reject(err);
        return;
      }
      resolve(tokens.access_token);
      console.log('Access token: ', tokens.access_token);
    });
  });
}
exports.getAccessToken = getAccessToken;// [END retrieve_access_token]
/**
 * Send HTTP request to FCM with given message.
 *
 * @param {object} fcmMessage will make up the body of the request.
 */
function sendFcmMessage(fcmMessage) {
  return new Promise((resolve, reject) => {
    getAccessToken().then(function (accessToken) {
      const options = {
        hostname: HOST,
        path: PATH,
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + accessToken,
          'Content-Type': 'application/json' // Add content type header
        }
      };

      const request = https.request(options, function (resp) {
        let responseData = '';

        resp.setEncoding('utf8');
        resp.on('data', function (data) {
          console.log('Message sent to Firebase for delivery, response:');
          console.log(data);
          resolve(data); // Resolve the promise on success
        });


      });

      request.on('error', function (err) {
        console.log('Unable to send message to Firebase');
        console.error(err);
        reject(err); // Reject the promise on error
      });

      request.write(JSON.stringify(fcmMessage));
      request.end();
    }).catch(err => {
      console.error('Error getting access token:', err);
      reject(err); // Reject the promise if there's an error getting the access token
    });
  });
}
exports.sendFcmMessage = sendFcmMessage;
async function monitorDeviceStatus() {
  const snapshot = await db.collection('Users').get();
  snapshot.forEach(async (doc) => {
    const data = doc.data();
    const status = data.status;
    const timestamp = new Date(data.timestamp);
    const currentTime = new Date();
    const timeDifference = (currentTime - timestamp) / 1000 / 60; // Difference in minutes

    if (status === 'offline' && timeDifference > 5) { // Assuming 5 minutes as the threshold
      const userId = doc.id;

      const fcmMessage = {
        "message": {
          "topic": "tracer",
          "notification": {
            "title": "Tracer Offline",
            "body": `Device for user ${userId} has gone offline.`
          }
        }
      };

      try {
        const response = await sendFcmMessage(fcmMessage);
        console.log('FCM message sent successfully:', response);
      } catch (err) {
        console.error('Error sending FCM message:', err);
      }
    }
  });
}

exports.monitorDeviceStatus = monitorDeviceStatus;
// Schedule the monitor function
setInterval(monitorDeviceStatus, 60000);
/**
 * Construct a JSON object that will be used to customize
 * the messages sent to iOS and Android devices.
 */
function buildOverrideMessage() {
  const fcmMessage = buildCommonMessage();
  const apnsOverride = {
    'payload': {
      'aps': {
        'badge': 1
      }
    },
    'headers': {
      'apns-priority': '10'
    }
  };

  const androidOverride = {
    'notification': {
      'click_action': 'android.intent.action.MAIN'
    }
  };

  fcmMessage['message']['android'] = androidOverride;
  fcmMessage['message']['apns'] = apnsOverride;

  return fcmMessage;
}
/**
 * Construct a JSON object that will be used to define the
 * common parts of a notification message that will be sent
 * to any app instance subscribed to the news topic.
 */
function buildCommonMessage() {
  return {
    "message": {
      "topic": "news",
      "notification": {
        "title": "FCM Notification",
        "body": "Notification from FCM"
      }
    }
  };
}

