import {AsyncStorage} from 'react-native';
import axios from 'axios';
import {AuthCtx} from '../../App';
import Configs from "../config/config";
import React, {useContext, useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  View,
  Image,
  CheckBox,
  ScrollView,
  FlatList,
} from 'react-native';

const Friends = ({navigation}) => {
  const [myFriends, setFriends] = useState(null);
  const {userName, setName} = useContext(AuthCtx);
  var value1 = JSON.parse(userName);
  useEffect(() => {
    AsyncStorage.getItem('userName')
    .then(val => {
      //console.log(val,'13')
      var value = JSON.parse(val);
      const link =
      Configs.FriendListURL +
      value.memberToken +
      '&page=1&pageSize=100';
      // setName(value)
      console.log('Link is ', link);
      fetch();
        axios.get(link).then(Response => {
          // console.log("REsponse of friend is : ",Response.data);
          setFriends(Response.data);
        });
      })
      .catch(error => {
        AsyncStorage.removeItem('userName');
      });
  }, []);

  function Logout() {
    setName(null);
    AsyncStorage.removeItem('userName');
    //console.log(AsyncStorage.getItem('UserId'))
  }

  function chatStart(friendInfo) {
    navigation.navigate('Message', {
      friendId: friendInfo.Mem_ID,
      friendName: friendInfo.Mem_Name,
      friendPhoto: friendInfo.Mem_Photo,
    });
  }
  return (
    <View>
      <View style={Styles.header}>
        <Text>{value1.name}</Text>
        <TouchableOpacity onPress={() => Logout()}>
          <Text style={Styles.logoutBtn}>Logout</Text>
        </TouchableOpacity>
      </View>
      <View>
        <ScrollView>
          <FlatList
            style={Styles.mainView}
            data={myFriends}
            keyExtractor={item => item.Id}
            renderItem={({item, index}) => (
              <TouchableOpacity
                style={Styles.userInfo}
                onPress={() => chatStart(item)}
                key={{index}}>
                <Image
                  source={{uri: item.Mem_Photo}}
                  style={Styles.userImage}
                />
                <View>
                  <Text style={Styles.userName}>{item.Mem_Name}</Text>
                  <Text style={Styles.userName}>11 Mutual Friends</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </ScrollView>
      </View>
    </View>
  );
};

export default Friends;

const Styles = StyleSheet.create({
  mainView: {
    backgroundColor: '#fff',
    padding: 15,
    textAlign: 'center',
    height: '100%',
  },
  header: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    padding: 10,
    zIndex: 9,
    position: 'absolute',
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignContent: 'center',
    width: '100%',
    backgroundColor: '#f1f1f1',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  userImage: {
    width: 50,
    height: 50,
    backgroundColor: '#ddd',
    marginRight: 15,
    borderRadius: 100,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
  },
});
