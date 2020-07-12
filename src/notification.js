const PushNotification = require("react-native-push-notification");
import messaging from '@react-native-firebase/messaging';
import LaunchApplication from "react-native-bring-foreground";
import {appPackageId} from "./constants";
import {savePost} from "./utils/post";

export const flashMessageHandler = async (remoteMessage) => {
  console.log('Remote Message handled in the background!', remoteMessage);
  const {data} = remoteMessage;
  LocalMessageNotification(data.sender, data.post.postName);
  const {post} = data;
  const parsedPost = JSON.parse(post);
  await savePost(parsedPost);
  LaunchApplication.open(appPackageId);
}

export const configureFCMNotification = async () => {
  try {
    let deviceToken = await messaging().getToken();
    PushNotification.configure({
      onRegister: (token) => {
        // console.log("TOKEN:", token);
      },
      onNotification: handleNotification,
      senderID: deviceToken,
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
      visibility: 'public',

    });
  } catch (error) {
    console.log("error", error);
  }
};

const handleNotification = async (notification) => {
  console.log("General Notification", notification);
  if (notification.foreground) {
    console.log("Handled notification in App"); // no need for this actually
  }
};

export const LocalMessageNotification = (senderName,postName) => {
  PushNotification.localNotification({
    autoCancel: false, // (optional) default: true
    largeIcon: "ic_launcher",
    smallIcon: "ic_notification",
    color: "green",
    vibrate: true,
    vibration: 300,
    priority: "high",
    visibility: "public",
    importance: "high",
    allowWhileIdle: true,
    ignoreInForeground: false,
    // ongoing:true,
    /* iOS and Android properties */
    title: `Received ${postName}`,
    message: `by ${senderName}`,
    playSound: true,
    number: 10,
  });
}
