import React, { useState } from "react";

const AuthContexts = React.createContext("default Value");

const AuthContext = (children) => {
  const [userInfo, setUserInfo] = useState("Gaurav Sharma");
  return (
    <AuthContexts.Provider value={userInfo}>{children}</AuthContexts.Provider>
  );
};

export default AuthContext;
