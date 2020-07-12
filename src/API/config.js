import axios from 'axios';
import {rootURL} from "../constants";

const instance = axios.create({
  baseURL: rootURL
});
const isDebuggingEnabled = (typeof atob !== 'undefined');

instance.interceptors.request.use(function (config) {

  isDebuggingEnabled && console.log("API Request", config);
  return config;
}, function (error) {
  console.log("API Request error", error);
  return Promise.reject(error);
});

instance.interceptors.response.use(function (response) {
  // isDebuggingEnabled && console.log("API Request", config);
  isDebuggingEnabled && console.log("API Response", response);
  return response;
}, function (error) {
  if (error.response && error.response.status === 401)
    console.log("Unauthorized");
  console.log("API Response error", error);
  return Promise.reject(error);
});

export default instance;
