/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onCall,HttpsError} = require("firebase-functions/v2/https");
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


exports.checkAuthuser = onCall((data: any,context: { auth: any; })=>{
    if(!context.auth){
        throw new HttpsError('unauthenticated','Endpoint requires authentication')
    }

});
exports.newMessage = onDocumentCreated('rooms/{roomId}/messages',async (event: { data: any; }) =>{
        try {
            const snapShot = event.data;
            if(!snapShot) return
            const newMessage = snapShot.data()
            const userId = newMessage.userId
            await sendNotification(userId, 'You have a new message!');
            return { success: true };
        } catch (error) {
          logger.error('Error sending notification:', error);
          throw new Error('Notification failed');
        }
      });

async function sendNotification(userId:string, message:string) {
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
        await admin.messaging().send(payload);
        logger.info(`Notification sent to ${userId}`);
    }
async function getUserDeviceToken(userId:string) {
        const userDoc = await admin.firestore().collection('users').doc(userId).get();

        if (!userDoc.exists) {
            logger.error(`No user found with ID: ${userId}`);
            return null;
        }
        const token = userDoc.data().token

        return token;
    }
