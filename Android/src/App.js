import React, {useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AccountStack from './components/account/accountStack';
import UserStack from './components/chat/userStack';

export const AuthCtx = React.createContext();

const App = () => {
  const [userName, setName] = useState(null);
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  AsyncStorage.getItem('userName').then(val => {
    setName(val);
  });

  return (
    <AuthCtx.Provider value={{userName, setName}}>
      <NavigationContainer>
        {!userName ? <AccountStack setName={setName}/> : <UserStack />}
      </NavigationContainer>
    </AuthCtx.Provider>
  );
};

export default App;
