import RNFetchBlob from "rn-fetch-blob";
import ImageResizer from "react-native-image-resizer";
import {rootURL} from "../constants";

const getFileExtension = (path) => path.slice(((path.lastIndexOf(".") - 1) >>> 0) + 2);

export const uploadImage = async (path, userName='default') => {
  try {
    let fileExtension = getFileExtension(path);
    console.log("Uploading from ", path);
    let compressedPath = await compressImage(path);
    const uploadData = [
      {
        name: "mediaContent",
        filename: path,
        type: "image/jpg", //+ fileExtension,
        data: RNFetchBlob.wrap(compressedPath),
      },
    ];
    uploadData.push({
      name:'userName',
      data:userName
    });
    let response = await RNFetchBlob.fetch(
      "PUT",
      rootURL + '/post/create',
      {
        "Content-Type": "multipart/form-data",
      },
      uploadData,
    );
    console.log(response.data);
    return response.data;
  } catch (e) {
    console.log("error", e);
    return false;
  }
};


export const compressImage = async (uri) => {
  try {
    console.log("Starting compressor for ", uri);
    let extension = getFileExtension(uri);
    if (extension === "jpg") extension = "jpeg"; //Imageresizer demands this
    if (extension !== "jpeg" && extension !== "png") {
      //We have something other than jpg or png, maybe a bmp?
      console.log("Compressor changing extension to jpg from", extension);
      extension = "jpg";
    }
    let compressedImage = await ImageResizer.createResizedImage(
      uri,
      1000,
      2000,
      'JPEG',//extension.toUpperCase(),
      80,
      0,
    );
    console.log("Compressed image response", compressedImage);
    console.log("Compressed to ", compressedImage.size / 1000, "kb");
    return compressedImage.path;
  } catch (error) {
    console.log("Compression error", error);
    return false;
  }
};
