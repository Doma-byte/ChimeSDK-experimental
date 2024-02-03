import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, {useContext, useState} from 'react';
import Configs from '../config/config';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
} from 'react-native';

const Login = ({navigation}) => {
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [error, setError] = useState('');

  const loginEvent = async () => {
    if (email && password) {
      const url = Configs.LoginURL + email + '&password=' + password;
      console.log('URL is ', url);
      try {
        await axios
          .get(url)
          .then(response => {
            console.log('The response data is: ', response.data.Mem_ID);

            const value = {
              name: response.data.Mem_Name + ' ' + response.data.Mem_LName,
              id: response.data.Mem_ID,
              friendid: 0,
              friendname: '-',
              memberToken: response.data.MemberToken,
            };
            console.log('Value is : ', value);
            AsyncStorage.setItem('userName', JSON.stringify(value));
          });
      } catch (err) {
        console.log('Error : ', err);
      }
    } else {
      setError('Please enter your email and password !!');
    }
  };
  return (
    <ScrollView style={Styles.mainView}>
      <View>
        <View>
          <Image
            source={require('../../assets/images/logo.png')}
            style={Styles.logo}
          />
        </View>
        <Text style={Styles.title}>Welcome back!</Text>
        <Text style={Styles.subTitle}>Login to your account to continue</Text>

        <Text style={Styles.inputLable}>Email Address</Text>
        <TextInput
          value={email}
          onChangeText={e => {
            setEmail(e);
          }}
          placeholder="Enter Your Email Address"
          style={Styles.inputBox}
        />

        <Text style={Styles.inputLable}>Your Password </Text>
        <TextInput
          placeholder="Enter Your Password"
          value={password}
          onChangeText={e => {
            setPassword(e);
          }}
          secureTextEntry={true}
          style={Styles.inputBox}
        />

        <Text
          style={[error != '' ? Styles.show : Styles.hide, Styles.errorMsg]}>
          {error}
        </Text>

        <TouchableOpacity onPress={loginEvent} style={{marginTop: 15}}>
          <Text style={Styles.buttonStyle}>Sign In</Text>
        </TouchableOpacity>
        <Text style={{margin: 15, textAlign: 'center', fontSize: 18}}>Or</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={Styles.buttonStyle}>Create New Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Login;
const Styles = StyleSheet.create({
  mainView: {
    backgroundColor: '#fff',
    padding: 15,
    textAlign: 'center',
    height: '100%',
  },
  logo: {
    width: '100%',
    height: 40,
    flex: 0,
    marginTop: 20,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  title: {
    color: '#000',
    fontSize: 24,
    fontWeight: '500',
    textAlign: 'center',
  },
  subTitle: {
    color: '#000',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 0,
    marginBottom: 20,
  },
  inputBox: {
    borderColor: '#ddd',
    borderWidth: 1,
    color: '#000',
    marginBottom: 10,
    width: '100%',
    fontSize: 12,
    padding: 4,
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  inputLable: {
    fontSize: 12,
    lineHeight: 18,
    color: '#212529',
    marginBottom: 0,
  },
  buttonStyle: {
    backgroundColor: '#1866B4',
    color: '#fff',
    padding: 10,
    paddingBottom: 10,
    paddingTop: 10,
    width: '100%',
    fontSize: 12,
    textAlign: 'center',
    borderRadius: 8,
  },
  hide: {
    display: 'none',
  },
  errorMsg: {
    color: '#f00',
    fontWeight: '600',
    fontSize: 12,
  },
});
