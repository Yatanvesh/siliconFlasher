import {readFromStorage, saveToStorage} from "./index";
import {storageKeys} from "../constants";

export const savePost = async post => {
  console.log("saving post");
  let posts = await readFromStorage(storageKeys.POSTS);
  if (!posts) posts = []
  posts.unshift(post);
  await saveToStorage(storageKeys.POSTS, posts);
}

export const getPosts = async () => {
  return  await readFromStorage(storageKeys.POSTS);
  // if (!postIds) return [];
  // let posts = [];
  // for(let i=0;i<posts.length;i++){
  //   let post = await readFromStorage(storageKeys.POST + postIds[i]);
  //   posts.push(post);
  // }
  // return posts;
  // return Promise.all(postIds.map(async postId =>
  //   await readFromStorage(storageKeys.POST + postId)
  // ))
}