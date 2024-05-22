import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
} from "react-native";

import { images } from "../../constants";
import useAppwrite from "../../lib/useAppwrite";
import { getCurrentUser, getFriends, getGroups, getGroupMembers } from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";
import CustomCard from "../../components/CustomCard";

import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons/faChevronRight";
import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus";
import { CustomButton } from "../../components";

import { Redirect, router } from "expo-router";

const Home = () => {
  const { data: friendsList, refetch } = useAppwrite(getFriends);
  const { data: groups, refetch: refetchGroups } = useAppwrite(getGroups);
  const { data: addedMembers, refetch: refetchMembers } = useAppwrite(getGroupMembers);

  const { user, setModalVisible } = useGlobalContext();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const friends = [
    { name: "F 1" },
    { name: "F 2" },
    { name: "F 3" },
    { name: "F 4" },
    { name: "F 5" },
  ];

  const handleCreateGroup = () => {
    router.push("/groups")
    setModalVisible(true)
  }

  return (
    <SafeAreaView className="bg-primary h-full">
      <View className="flex my-6 px-4 space-y-6">
        <View className="flex justify-between items-start flex-row mb-3">
          <View>
            <Text className="font-pmedium text-sm text-gray-100">
              Welcome Back
            </Text>
            <Text className="text-2xl font-psemibold text-white">
              {user?.username}
            </Text>
          </View>
          <View className="mt-1.5">
            <Image
              source={images.logoSmall}
              className="w-12 h-12"
              resizeMode="contain"
            />
          </View>
        </View>
      </View>

      <CustomCard />

      <ScrollView className="h-full mt-2 p-3 rounded-tl-[225px] rounded-tr-[225px] bg-gray-100"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >

        <ScrollView
          horizontal
          className="bg-gray-100 h-[120px] rounded-xl p-3 mt-14"
          contentContainerStyle={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Text className="font-psemibold  text-black-300">
            Groups <FontAwesomeIcon icon={faChevronRight} color={"black"} />
          </Text>
          <TouchableOpacity
            className="m-2"
            onPress={handleCreateGroup}
          >
            <FontAwesomeIcon icon={faPlus} color={"#21232b"} size={48} />
          </TouchableOpacity>
          {groups.map((group, index) => (
            <TouchableOpacity
              key={group.$id}
              className="bg-secondary m-2 rounded-lg flex items-center justify-center h-[75px] w-[75px] "
              style={{
                aspectRatio: 1,
              }}
              onPress={() => router.push("/groups")}
            >
              <Text className="text-black-300 text-sm font-semibold">
                {group.groupName}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView
          horizontal
          className="bg-black-300 h-[120px] rounded-xl p-3 mb-5"
          contentContainerStyle={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Text className="font-psemibold  text-gray-100">
            Recent Friends{" "}
            <FontAwesomeIcon icon={faChevronRight} color={"white"} />
          </Text>
          {friends.map((friend, index) => (
            <TouchableOpacity
              key={index}
              className="bg-secondary m-2 rounded-lg flex items-center justify-center h-[75px] w-[75px] "
              style={{
                aspectRatio: 1,
              }}
            >
              <Text className="text-black-300 text-lg font-semibold">
                {friend.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <CustomButton
          title="Create an expense"
          handlePress={() => router.push("/create")}
          containerStyles="w-full mt-5"
        />

      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
