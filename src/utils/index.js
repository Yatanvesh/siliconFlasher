import AsyncStorage from '@react-native-community/async-storage';

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

