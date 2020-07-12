import axios from './config';
export const validateResponseCode = (code) => {
  return Math.floor(code / 100) === 2;
};

export const createUser = async (fcmToken) => {
  try {
    let response = await axios.post(`/user/create`,{
      fcmToken
    });
    if (validateResponseCode(response.status)) {
      return response.data;
    } else
      return false;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const listPosts = async () => {
  try {
    let response = await axios.get(`/post/all`)
    if (validateResponseCode(response.status)) {
      return response.data;
    } else
      return false;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const submitView = async (postId) => {
  try {
    let response = await axios.get(`/post/view/${postId}`)
    if (validateResponseCode(response.status)) {
      return response.data;
    } else
      return false;
  } catch (error) {
    console.log(error);
    return false;
  }
};