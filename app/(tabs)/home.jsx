import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  StyleSheet,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Pressable,
  Alert
} from "react-native";

import { images } from "../../constants";
import useAppwrite from "../../lib/useAppwrite";
import { getCurrentUser, getAllExpenses, getFriends, getGroups, getGroupMembers, getGroupById } from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";
import CustomCard from "../../components/CustomCard";

import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faChevronRight, faCircleXmark, faPlus } from "@fortawesome/free-solid-svg-icons";
import { CustomButton, FormField } from "../../components";

import { router } from "expo-router";
import Graph from "../../components/Graph";

const Home = () => {
  const { user, setModalVisible } = useGlobalContext();
  const { data: groups, refetch: refetchGroups } = useAppwrite(() => getGroups(user.$id));
  const { data: addedMembers, refetch: refetchMembers } = useAppwrite(() => getGroupMembers(), []);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [totalPaid, setTotalPaid] = useState(0);
  const [willGet, setWillGet] = useState(0);

  const [refreshing, setRefreshing] = useState(false);
  const { data: expenses, refetch: refetchExpenses } = useAppwrite(() => getAllExpenses(user.$id));

  useEffect(() => {
    const calculateFinancials = () => {
      let totalPaid = 0;
      let amountToGet = 0;

      expenses.forEach(expense => {
        if (expense.payer === user.$id) {
          totalPaid += parseFloat(expense.amount);

          if (expense.splitBetween) {
            try {
              const splits = JSON.parse(expense.splitBetween);
              const userSplit = splits.find(split => split.member.email === user.email);

              if (userSplit) {
                amountToGet += parseFloat(expense.amount) - parseFloat(userSplit.amount);
              } else {
                amountToGet += parseFloat(expense.amount);
              }
            } catch (error) {
              console.error("Error parsing splitBetween:", error);
              Alert.alert("Error", "Failed to parse splits: " + error.message);
            }
          } else {
            amountToGet -= parseFloat(expense.amount);
          }
        }
      });

      setTotalPaid(totalPaid);
      setWillGet(amountToGet);
    };

    if (expenses.length > 0) {
      calculateFinancials();
    }
  }, [expenses, user.$id]);



  const onRefresh = async () => {
    setRefreshing(true);
    await refetchGroups();
    await refetchMembers();
    await refetchExpenses();
    setRefreshing(false);
  };

  const handleCreateGroup = () => {
    router.push("/groups");
    setModalVisible(true);
  };

  const handleOpenModal = async (expense) => {
    let groupName = "Personal Expense";
    let splitBetween = [];

    if (expense.groupId) {
      try {
        const group = await getGroupById(expense.groupId);
        groupName = group.groupName;
      } catch (error) {
        console.error("Failed to fetch group name:", error);
        Alert.alert("Error", "Failed to fetch group name");
      }
    }

    if (expense.splitBetween) {
      try {
        splitBetween = JSON.parse(expense.splitBetween);
      } catch (error) {
        console.error("Failed to parse splitBetween:", error);
        Alert.alert("Error", "Failed to parse splitBetween");
      }
    }

    setSelectedExpense({ ...expense, groupName, splitBetween });
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
  };

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
      <CustomCard totalPaid={totalPaid} willGet={willGet} />

      <ScrollView className="h-full mb-12 mt-2 p-3 bg-gray-100"
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
          <Text className="font-psemibold text-gray-100">
            Groups <FontAwesomeIcon icon={faChevronRight} color={"white"} />
          </Text>
          <TouchableOpacity
            className="m-2"
            onPress={handleCreateGroup}
          >
            <FontAwesomeIcon icon={faPlus} color={"#CDCDE0"} size={48} />
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
                className="bg-secondary m-2 rounded-lg flex items-center justify-center h-[75px] w-[75px]"
                style={{
                  aspectRatio: 1,
                }}
                onPress={() => handleOpenModal(expense)}
              >
                <Text className="text-black-300 text-sm font-semibold">
                  {expense.description}
                </Text>
                <Text className="text-black-300 text-sm font-semibold">
                  ₹{expense.amount}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text className="font-psemibold text-sm ml-4 text-gray-100">No expense found</Text>
          )}
        </ScrollView>

        <Text className="font-pmedium text-center mt-5 text-lg mb-5 text-black-100">Expense Breakdown by Category</Text>
        <Graph expenses={expenses} />
        <CustomButton
          title="Create an expense"
          handlePress={() => router.push("/create")}
          containerStyles="w-full mt-5 mb-10"
        />
      </ScrollView>

      {selectedExpense && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalOpen}
          onRequestClose={handleClose}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView} className="bg-gray-100">
              <ScrollView
                style={{ width: '100%', padding: 20 }}
                contentContainerStyle={{
                  flexGrow: 1,
                  justifyContent: 'center',
                  paddingBottom: 20,
                }}
              >
                <View className="flex flex-row items-center justify-between">
                  <Text className="text-2xl font-psemibold text-black">Expense Details</Text>
                  <Pressable onPress={handleClose}>
                    <FontAwesomeIcon icon={faCircleXmark} size={28} color="#FF204E" />
                  </Pressable>
                </View>
                <View className="pb-4">
                  <FormField
                    label="Group Name"
                    value={`Group: ${selectedExpense.groupName}`}
                    placeholder="Enter group name"
                    editable={false}
                  />
                  <FormField
                    label="Amount"
                    value={`Amount: ${String(selectedExpense.amount)}`}
                    placeholder="Amount"
                    editable={false}
                  />
                  <FormField
                    label="Description"
                    value={`Description: ${selectedExpense.description}`}
                    placeholder="Description"
                    editable={false}
                  />
                  <FormField
                    label="Category"
                    value={`Category: ${selectedExpense.category}`}
                    placeholder="Category"
                    editable={false}
                  />
                  <View className="flex flex-row flex-wrap justify-start items-center mt-6">
                    {selectedExpense.splitBetween && selectedExpense.splitBetween.map((member, index) => (
                      <View key={index} className="flex flex-col justify-center items-center my-2">
                        <View className="flex justify-center items-center rounded-xl w-[75px] h-[75px] bg-secondary mx-1">
                          <Text>₹{member.amount}</Text>
                        </View>
                        <Text className="text-sm text-center mt-2 font-pregular text-black-300">
                          {member.member.name}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    height: 450,
    width: 320
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});
