/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest,onCall,HttpsError} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin/app");
const { onDocumentCreated } = require("firebase-functions/firestore");

admin.initializeApp()
// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });


exports.checkAuthuser = onCall((data,context)=>{
    if(!context.auth){
        throw new HttpsError('unauthenticated','Endpoint requires authentication')
    }

});
exports.newMessage = onDocumentCreated('rooms/{roomId}',async (snapShot,context) =>{
        const newMessage = snapShot.data();
        const userId = newMessage.userId
        logger.info('New message created:', newMessage);
        // You can now send a notification or perform any other action
        try {
          // Here you can send a notification to the user
          await sendNotification(userId, 'You have a new message!');
          return { success: true };
        } catch (error) {
          logger.error('Error sending notification:', error);
          throw new Error('Notification failed');
        }
      });

      // Helper function to send notifications
async function sendNotification(userId, message) {
        // Assume you are using Firebase Cloud Messaging (FCM) to send push notifications
        const registrationToken = await getUserDeviceToken(userId);

        if (!registrationToken) {
            throw new Error('No device token found for user');
        }

        const payload = {
            notification: {
            title: 'BlueJay Notification',
            body: message,
            },
            token: registrationToken,
        };

        // Send the notification
        await admin.messaging().send(payload);
        logger.info(`Notification sent to ${userId}`);
    }

    // Helper function to get user's device token (assuming this data is stored in Firestore)
async function getUserDeviceToken(userId) {
        const userDoc = await admin.firestore().collection('users').doc(userId).get();

        if (!userDoc.exists) {
            logger.error(`No user found with ID: ${userId}`);
            return null;
        }

        return userDoc.data().deviceToken; // Assume the device token is stored in the user's document
    }
