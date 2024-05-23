import React from 'react';
import { useGlobalContext } from "../../context/GlobalProvider";
import { View, Text, Image, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { icons } from '../../constants';
import { signOut } from "../../lib/appwrite";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons/faRightFromBracket";
import { router } from "expo-router";

const menuItems = [
  { key: 'home', label: 'Home', icon: icons.premium },
  { key: 'contact', label: 'Contact Us', icon: icons.contact },
  { key: 'invite', label: 'Invite Friends', icon: icons.invite },
  { key: 'rate', label: 'Rate us', icon: icons.star },
  { key: 'settings', label: 'Settings', icon: icons.settings },
];

const Profile = () => {
  const { user, setUser, setIsLogged } = useGlobalContext();

  const logout = async () => {
    await signOut();
    setUser(null);
    setIsLogged(false);
    router.replace("/sign-in");
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 }}>
      <Image source={item.icon} style={{ width: 24, height: 24, marginRight: 16 }} />
      <Text style={{ fontSize: 16 }}>{item.label}</Text>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View className="flex flex-row items-center p-5 pt-10 mx-7 mt-12">
      <View className="mr-5 w-16 h-16 border border-secondary rounded-lg flex justify-center items-center">
        <Image
          source={{ uri: user?.avatar }}
          className="w-[90%] h-[90%] rounded-lg"
          resizeMode="cover"
        />
      </View>
      <View>
        <Text style={{ fontSize: 18, color: 'black', fontWeight: 'bold', marginBottom: 5, marginTop: 7 }}>{user?.username}</Text>
        <Text style={{ fontSize: 16, color: 'gray', marginBottom: 8 }}>{user?.email}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex h-full justify-center bg-gray-100">
      <FlatList
        data={menuItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={() => (
          <TouchableOpacity onPress={logout} activeOpacity={0.7} className="flex flex-row justify-center items-center border border-danger mx-12 mt-10 rounded-xl min-h-[62px]">
            <Text className="text-danger text-lg font-psemibold mx-2">Logout</Text>
            <FontAwesomeIcon icon={faRightFromBracket} color={'#FF204E'} />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

export default Profile;
