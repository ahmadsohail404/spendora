import React, { createContext, useContext, useEffect, useState } from "react";

import { getCurrentUser } from "../lib/appwrite";

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [getMoney, setGetMoney] = useState(200)
  const [payMoney, setPayMoney] = useState(100)

  useEffect(() => {
    getCurrentUser()
      .then((res) => {
        if (res) {
          setIsLogged(true);
          setUser(res);
        } else {
          setIsLogged(false);
          setUser(null);
        }
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const value = {
    isLogged,
    setIsLogged,
    user,
    setUser,
    loading,
    getMoney,
    setGetMoney,
    payMoney,
    setPayMoney
  }

  return (
    <GlobalContext.Provider
      value={value}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
