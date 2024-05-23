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
import { getCurrentUser, getAllExpenses, getFriends, getGroups, getGroupMembers } from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";
import CustomCard from "../../components/CustomCard";

import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons/faChevronRight";
import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus";
import { CustomButton } from "../../components";

import { Redirect, router } from "expo-router";

const Home = () => {
  const { user, setModalVisible } = useGlobalContext();
  const { data: friendsList, refetch } = useAppwrite(getFriends);
  const { data: groups, refetch: refetchGroups } = useAppwrite(() => getGroups(user.$id));
  const { data: addedMembers, refetch: refetchMembers } = useAppwrite(() => getGroupMembers(), []);


  const [refreshing, setRefreshing] = useState(false);
  const { data: expenses, refetch: refetchExpenses } = useAppwrite(() => getAllExpenses(user.$id));


  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    await refetchMembers()
    await refetchExpenses()
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

      <ScrollView className="h-full mt-2 p-3 bg-gray-100"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <ScrollView
          horizontal
          className="bg-black-300 h-[120px] rounded-xl p-3 mb-5 mt-7"
          contentContainerStyle={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Text className="font-psemibold  text-gray-100">
            Groups <FontAwesomeIcon icon={faChevronRight} color={"white"} />
          </Text>
          <TouchableOpacity
            className="m-2"
            onPress={handleCreateGroup}
          >
            <FontAwesomeIcon icon={faPlus} color={"#21232b"} size={48} />
          </TouchableOpacity>

          {groups.length > 0 ? (
            groups.map((group, index) => (
              <TouchableOpacity
                key={group.$id}
                className="bg-secondary m-2 rounded-lg flex items-center justify-center h-[75px] w-[75px]"
                style={{
                  aspectRatio: 1,
                }}
                onPress={() => router.push("/groups")}
              >
                <Text className="text-black-300 text-sm font-semibold">
                  {group.groupName}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
              <Text className="font-psemibold text-sm text-gray-100">No group found</Text>
          )}

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
          <Text className="font-psemibold text-gray-100">
            Recent Expenses{" "}
            <FontAwesomeIcon icon={faChevronRight} color={"white"} />
          </Text>
          {expenses.length > 0 ? (
            expenses.map((expense, index) => (
              <TouchableOpacity
                key={index}
                className="bg-secondary m-2 rounded-lg flex items-center justify-center h-[75px] w-[75px] "
                style={{
                  aspectRatio: 1,
                }}
              >
                <Text className="text-black-300 text-sm font-semibold">
                  {expense.description}
                </Text>
                <Text className="text-black-300 text-sm font-semibold">
                  ₹{expense.amount}
                </Text>
              </TouchableOpacity>
            ))
          ):(
            <Text className="font-psemibold text-sm ml-4 text-gray-100">No expense found</Text>
          )}
          
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
