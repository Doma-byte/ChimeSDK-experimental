import React, { useState } from "react";

const AuthContexts = React.createContext("default Value");

const AuthContext = (children) => {
  const [userInfo, setUserInfo] = useState("Gaurav Sharma");
  const [callAction, setCallAction] = useState({});

  const triggerHangUp = () => {
    setCallAction({type: 'hangUp'});
    setTimeout(() => setCallAction({}), 100);
  }
  const value = {
    userInfo, 
    setUserInfo,
    callAction,
    triggerHangUp,
  };
  return (
    <AuthContexts.Provider value={userInfo}>{children}</AuthContexts.Provider>
  );
};

export default AuthContext;
