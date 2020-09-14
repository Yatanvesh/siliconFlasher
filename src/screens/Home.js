/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  View,
  Easing,
  Dimensions,
  Text,
  Image as CoreImage,
  LogBox,
  StatusBar,
  TouchableOpacity
} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import Swiper from 'react-native-swiper'
import {Modal} from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import FlashMessage, {showMessage} from "react-native-flash-message";

LogBox.ignoreLogs(["Animated"]);
import AwesomeButton from 'react-native-really-awesome-button/src/themes/rick';
// import AwesomeButton from "react-native-really-awesome-button";
import {AnimatedBackgroundColorView} from 'react-native-animated-background-color-view';
import Image from 'react-native-image-progress';
import Progress from 'react-native-progress/Pie';
import messaging from '@react-native-firebase/messaging';
import {flashMessageHandler, LocalMessageNotification} from "../notification";
import {downloadImage, uploadImage} from "../API/storage";
import {storageKeys} from "../constants";
import {readFromStorage, requestStoragePermissions, saveToStorage} from "../utils";
import {createUser, listPosts, submitView} from "../API/API";
import {getPosts, savePost} from "../utils/post";
import Eye from '../../assets/visibility.png';
import Download from '../../assets/download.png';

messaging().setBackgroundMessageHandler(flashMessageHandler);

class Home extends React.Component {
  state = {
    url: '',
    imageUploading: false,
    user: {userName: ''},
    posts: [],
    modalVisible: false,
    viewerIndex: 0
  }

  async componentDidMount(): * {
    let token = await messaging().getToken();
    console.log('fcm', token.slice(0, 10));
    const user = await readFromStorage(storageKeys.USER);
    const posts = await getPosts();
    // console.log("saved posts", posts);
    if (posts) this.setState({posts});
    if (!user) {
      let {user} = await createUser(token);
      console.log('created', user);
      this.setState({user});
      saveToStorage(storageKeys.USER, user);
      saveToStorage(storageKeys.POSTS, []);
    } else this.setState({user});
    let self = this;
    messaging().onMessage(async remoteMessage => {
      console.log('Received', remoteMessage);
      const {data} = remoteMessage;
      const {post} = remoteMessage.data;
      const parsedPost = JSON.parse(post);
      LocalMessageNotification(data.sender, parsedPost.postName);
      savePost(parsedPost);
      self.addPost(parsedPost);
    });
    this.updatePostsFromAPI();
  }

  addPost = (post) => {
    const posts = [...this.state.posts];
    posts.unshift(post);
    this.setState({posts});
  }
  updatePostsFromAPI = async () => {
    const {posts} = await listPosts();
    if (posts)
      saveToStorage(storageKeys.POSTS, posts);
    this.setState({posts});
  }
  pickImage = (finishLoadingCallback) => {
    const options = {};
    ImagePicker.showImagePicker(options, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
        finishLoadingCallback();
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
        finishLoadingCallback();
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
        finishLoadingCallback();
      } else {
        console.log('image url', response.uri);
        this.setState({
          imageUri: response.uri,
        });
        let result = await uploadImage(response.uri, this.state.user.userName);
        finishLoadingCallback();
      }
    });
  };
  renderUserName = () => {
    const {user} = this.state;
    if (user && user.userName) {
      return <Text style={{
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
        position: 'absolute', bottom: 10, right: 10
      }}>{user.userName}</Text>
    }
    return null;
  }
  showViewer = index => {
    this.setState({modalVisible: true, viewerIndex: index})
  }
  renderPost = (post, index) => {
    if (post) {
      const date = new Date(post.createdOn);
      return (
        <TouchableOpacity onPress={() => this.showViewer(index)} key={post._id}>
          <Image
            source={{uri: post.contentURL}}
            indicator={Progress}
            onLoad={() => post.createdBy !== this.state.user.userName && submitView(post._id)}
            indicatorProps={{
              size: 100,
              borderWidth: 0,
              color: '#8fcfd1',
              unfilledColor: '#1dd3bd'
            }}
            resizeMode={'contain'}
            style={{
              width: Dimensions.get('window').width,
              height: Dimensions.get('window').height + 60
            }}/>
          <View style={{position: 'absolute', left: 10, top: 10}}>
            {
              post.postName && (
                <Text style={{
                  color: 'white',
                  fontSize: 16
                }}>{post.postName}</Text>
              )
            }
            <Text style={{
              color: 'white',
              fontWeight: 'bold',
              fontSize: 18
            }}>By {post.createdBy}</Text>
            <Text style={{
              color: 'white',
              fontWeight: 'bold',
              fontSize: 14
            }}>{date.toLocaleDateString()}</Text>
            <Text style={{
              color: 'white',
              fontWeight: 'bold',
              fontSize: 14
            }}>{date.getHours()}:{date.getMinutes()}</Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <CoreImage style={{width: 16, height: 16, marginRight: 5}} tintColor={'white'} source={Eye}/>
              <Text style={{color: 'white', fontSize: 16, fontWeight: 'bold'}}>{post.views}</Text>
            </View>
          </View>
          <View style={{position: 'absolute', right: 10, top: 10, alignItems: 'flex-end'}}>
            <Text style={{color: 'white', fontWeight: 'bold', fontSize: 18}}>
              {1 + index}/{this.state.posts.length}
            </Text>
            <TouchableOpacity onPress={() => this.downloadImage(post.contentURL, post.postName)}>
              <CoreImage style={{
                width: 20, height: 20,
              }} tintColor={'white'} source={Download}/>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )
    }
    return null;
  }
  renderPosts = () => {
    const {posts} = this.state;
    if (!posts || posts.length === 0) return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator color={'white'} size={60}/>
      </View>
    );

    return (
      <Swiper loop={false} showsPagination={false} showsButtons={false}>
        {posts.map((post, index) => this.renderPost(post, index))}
      </Swiper>
    )
  }
  renderBroadcastButton = () => {
    return <AwesomeButton
      progress
      type={'primary'}
      style={{position: 'absolute', bottom: 10}}
      onPress={this.pickImage}
    >
      Broadcast
    </AwesomeButton>
  }
  transformImages = () => {
    if (this.state.posts && this.state.posts.length > 0)
      return this.state.posts.map(post => {
        if (post)
          return {url: post.contentURL}
        return null;
      })
    else return [];
  }
  imageViewer = () => {
    return (
      <Modal
        onDismiss={() => this.setState({modalVisible: false})}
        onRequestClose={() => this.setState({modalVisible: false})}
        visible={this.state.modalVisible} transparent={true}>
        <ImageViewer
          index={this.state.viewerIndex}
          imageUrls={this.transformImages()}
          backgroundColor={'#363636'}
          onChange={index => this.setState({viewerIndex: index})}
          onCancel={() => this.setState({modalVisible: false})}
        />
      </Modal>
    )
  }
  downloadImage = async (url, name) => {
    const res = await requestStoragePermissions();
    if (!res) return;
    showMessage({
      message: 'Downloading ' + name,
      type: "info",
    });
    downloadImage(url, name);
  }

  render() {
    return (
      <>
        <StatusBar backgroundColor='#e79cc2' hidden={true}/>
        <SafeAreaView style={{flex: 1}}>
          <AnimatedBackgroundColorView
            color='#383e56'
            initialColor='#e8505b'
            duration={5000}
            easing={Easing.bounce}
            style={{flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 10, paddingTop: 6}}
          >
            <View style={{position: 'absolute'}}>
              {this.renderPosts()}
            </View>
            {this.renderUserName()}
            {this.imageViewer()}
            {this.renderBroadcastButton()}
          </AnimatedBackgroundColorView>
          <FlashMessage position="top" floating={true}/>
        </SafeAreaView>
      </>
    );
  }
};

const styles = StyleSheet.create({});

export default Home;
