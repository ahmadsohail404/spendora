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
  const [modalVisible, setModalVisible] = useState(false);
  const [value, setValue] = useState(null);
  const [selectedGroupDropDown, setSelectedGroupDropDown] = useState(null);

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

  const contextValue = {
    isLogged,
    setIsLogged,
    user,
    setUser,
    loading,
    getMoney,
    setGetMoney,
    payMoney,
    setPayMoney,
    modalVisible,
    setModalVisible,
    value,
    setValue,
    selectedGroupDropDown, 
    setSelectedGroupDropDown
  }

  return (
    <GlobalContext.Provider
      value={contextValue}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
