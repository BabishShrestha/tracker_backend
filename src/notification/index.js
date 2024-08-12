const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');

const PROJECT_ID = 'tracker-app-3dab3';
const HOST = 'fcm.googleapis.com';
exports.HOST = HOST;
const PATH = '/v1/projects/' + PROJECT_ID + '/messages:send';
exports.PATH = PATH;
const MESSAGING_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';
const SCOPES = [MESSAGING_SCOPE];
exports.SCOPES = SCOPES;
const fs = require('fs');
const { getAccessToken } = require('./getAccessToken');
const { sendFcmMessage } = require('./getAccessToken');
const { buildCommonMessage } = require('./getAccessToken');

const app = express();


// Middleware for parsing JSON bodies
app.use(bodyParser.json());


app.get('/get-access-token', async (req, res) => {
  try {
    getAccessToken().then(function (accessToken) {
      res.send(accessToken);
    });
  } catch (error) {
    console.log(error);

  }
});

/**
 * Get a valid access token.
 */
// [START retrieve_access_token]

// Your existing code for exporting other constants and functions


exports.buildCommonMessage = buildCommonMessage;

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log('Example app listening on port!' + port);
}
);
app.post('/send-fcm-message', async (req, res) => {
  try {
    const response = sendFcmMessage(req.body);
    console.log('Response:', response); // Log the response
    response.then(function (data) {
      console.log('Data:', data); // Log the response
      res.json(data);
    }
    );

    // if (response) {
    //   res.json(response);
    // } else if (response.status == 200) {
    //   res.json(response);
    // }
  } catch (error) {
    console.error('Error:', error); // Log any errors
    res.status(500).send('Internal Server Error');
  }
});



// Future < void> addNotification(RemoteMessage message) async {
//   try {
//     await notificationCollection
//       .add(
//         NotificationModel(
//           title: message.notification?.title ?? '',
//           body: message.notification?.body ?? '',
//           sentTime: DateTime.now(),
//           senderId: message.senderId ?? '',
//           messageId: message.messageId ?? '',
//           messageType: message.data['type'] ?? '',
//         ).toJson(),
//       )
//       .whenComplete(() {
//         log('Notification added to database');
//       }).catchError((e) {
//         log('Error adding Notification to database: $e');
//       });
//   } catch (e) {
//     log(e.toString());
//   }
// }
// const message = process.argv[2];

// if (message && message == 'common-message') {
//   const commonMessage = buildCommonMessage();
//   console.log('FCM request body for message using common notification object:');
//   console.log(JSON.stringify(commonMessage, null, 2));
//   sendFcmMessage(buildCommonMessage());
// } else if (message && message == 'override-message') {
//   const overrideMessage = buildOverrideMessage();
//   console.log('FCM request body for override message:');
//   console.log(JSON.stringify(overrideMessage, null, 2));
//   sendFcmMessage(buildOverrideMessage());
// } else {
//   console.log('Invalid command. Please use one of the following:\n'
//       + 'node index.js common-message\n'
//       + 'node index.js override-message');
// }
