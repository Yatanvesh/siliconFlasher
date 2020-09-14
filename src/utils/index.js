import AsyncStorage from '@react-native-community/async-storage';
import {PermissionsAndroid} from "react-native";

export const saveToStorage = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value)
    await AsyncStorage.setItem(key, jsonValue)
    return true;
  } catch (e) {
    console.log("Storing data to storage failed", e);
    return false;
  }
}

export const readFromStorage = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key)
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.log("Reading data from storage failed", e);
    return false;
  }
}

export const deleteFromStorage = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (exception) {
    return false;
  }
}

export async function requestStoragePermissions() {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        'title': 'Storage Permission',
        'message': 'Flasher needs access to your storage to download Photos.'
      }
    )
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn(err)
    return false;
  }
}

