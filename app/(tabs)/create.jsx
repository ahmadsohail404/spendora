import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  RefreshControl,
  Alert,
  Switch,
  StyleSheet
} from "react-native";
import { Dropdown } from 'react-native-element-dropdown';
import CustomButton from "../../components/CustomButton";
import FormField from "../../components/FormField";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faUser, faUserGroup, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { getGroups, getGroupMembers, createExpense } from "../../lib/appwrite";
import useAppwrite from "../../lib/useAppwrite";
import { useGlobalContext } from "../../context/GlobalProvider";
import { SafeAreaView } from "react-native-safe-area-context";

const Create = () => {
  const { user } = useGlobalContext();
  const [data, setData] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [members, setMembers] = useState([]);
  const [isFocus, setIsFocus] = useState(false);
  const [isPersonal, setIsPersonal] = useState(false);
  const [isEquallyEnabled, setIsEquallyEnabled] = useState(false);
  const [memberContributions, setMemberContributions] = useState([]);
  const [form, setForm] = useState({
    description: "",
    category: "",
    amount: "",
    splitBetween: []
  });

  const [refreshing, setRefreshing] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);


  // Fetch groups once the user is defined or when demanded
  const { data: groups, refetch: refetchGroups } = useAppwrite(() => getGroups(user.$id));

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchGroups();
    await refetchMembers();
    setRefreshing(false);
  };

  useEffect(() => {
    if (isPersonal) {
      setMembers([]);
      setSelectedGroupId(null)
      setIsEquallyEnabled(false)
    }
  }, [isPersonal])

  async function fetchCategory(description, amount) {
    try {
      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description, amount })
      });
      const data = await response.json();
      return data.prediction;
    } catch (error) {
      console.error("Error fetching category from Flask:", error);
      Alert.alert("Error", "Failed to fetch category: " + error.message);
      return null;
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true);
    let category = form.category;

    const predictedCategory = await fetchCategory(form.description, form.amount);
    if (predictedCategory) {
      category = predictedCategory;
    }

    let splitData = [];
    if (!isPersonal) {
      if (isEquallyEnabled) {
        const splitAmount = (form.amount / members.length).toFixed(2);
        splitData = members.map(member => ({
          member: member,
          amount: splitAmount
        }));
      } else {
        splitData = memberContributions;
        // Calculate the sum of split contributions
        const totalContributed = splitData.reduce((sum, { amount }) => sum + amount, 0);
        // Check if the sum of split amounts equals the total amount
        if (totalContributed !== parseFloat(form.amount)) {
          Alert.alert("Error", "The sum of all contributions does not match the total amount.");
          setSubmitting(false);
          return; // Stop execution if the amounts don't match
        }
      }
    }

    const expenseData = {
      amount: form.amount,
      description: form.description,
      category: category,
      groupId: !isPersonal ? selectedGroupId.value : null,
      splitBetween: JSON.stringify(splitData)
    };

    expenseData.payer = user.$id;

    const memberIds = splitData.map(({ member }) => member.id);

    try {
      const response = await createExpense(expenseData, user.$id, memberIds);
      console.log("Expense created:", response);
      Alert.alert("Success", "Expense added successfully");
      setForm({ description: "", category: "", amount: "", splitBetween: [] });
      setSelectedGroupId(null);
    } catch (error) {
      console.error("Failed to create expense:", error);
      Alert.alert("Error", "Failed to add expense: " + error.message);
      setForm({ description: "", category: "", amount: "", splitBetween: [] });
      setSelectedGroupId(null);
      setIsEquallyEnabled(false)
    } finally {
      setSubmitting(false);
    }
  };




  const toggleSwitch = () => setIsPersonal(previousState => !previousState);

  const toggleEquallySplitSwitch = () => setIsEquallyEnabled(previousState => !previousState);

  useEffect(() => {
    if (!isPersonal) {
      const initialContributions = members.map(member => ({
        member: member,
        amount: isEquallyEnabled ? (form.amount / members.length).toFixed(2) : 0
      }));
      setMemberContributions(initialContributions);
    }
  }, [members, form.amount, isEquallyEnabled, isPersonal]);


  useEffect(() => {
    const formattedData = groups.map(group => ({
      label: group.groupName,
      value: group.$id,
    }));
    setData(formattedData);
  }, [groups]);

  const renderLabel = () => {
    if (form.value || isFocus) {
      return (
        <Text style={[styles.label, isFocus && { color: '#FF9C01' }]}>
          Select a group
        </Text>
      );
    }
    return null;
  };

  useEffect(() => {
    if (selectedGroupId === null) {
      setMembers([])
    }
    console.log("Selected Group Id", selectedGroupId);
  }, [selectedGroupId])

  useEffect(() => {
    console.log("Members:", members);
  }, [members])


  const handleChange = async (item) => {
    console.log("Selected group:", item);
    setSelectedGroupId(item);
    setIsFocus(false);
    try {
      const fetchedMembers = await getGroupMembers(item.value);
      setMembers(fetchedMembers.map(member => ({
        email: member.email,
        name: member.name,
        id: member.$id
      })));

      // Initialize contributions for each member
      setMemberContributions(fetchedMembers.map(member => ({
        memberId: member.$id,
        amount: 0
      })));
    } catch (error) {
      console.error("Failed to fetch group members:", error);
      Alert.alert("Error", "Failed to fetch group members: " + error.message);
    }
  };


  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView className="mb-12 pb-10"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text className="text-2xl font-psemibold text-center text-white mt-8 mx-8 mb-10">Add Expense</Text>
        <View className="flex flex-row items-center justify-center mb-5">
          <Text className="text-sm font-psemibold text-secondary mx-2">Group</Text>
          <Switch
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isPersonal ? '#f5dd4b' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={isPersonal}
          />
          <Text className="text-sm font-psemibold text-secondary mx-2">Personal</Text>
        </View>
        {!isPersonal && (
          <View className="px-2">
            <View style={styles.container}>
              {renderLabel()}
              <Dropdown
                style={[styles.dropdown, isFocus && { borderColor: '#FF9C01' }]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={data}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={!isFocus ? 'Select a group' : '...'}
                searchPlaceholder="Search..."
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={handleChange}
                renderLeftIcon={() => (
                  <FontAwesomeIcon icon={faUserGroup} size={20} color={isFocus ? '#FF9C01' : 'white'} />
                )}
              />
            </View>
            {/* <Text className="text-sm text-center font-psemibold text-secondary">
              {members.length > 0 ? "Group Members found" : "No group member found"}
            </Text> */}
          </View>
        )}
        <View className="mx-8">
          <FormField
            label="Amount"
            value={form.amount} // Convert number to string for TextInput
            onChangeText={(text) => setForm({ ...form, amount: parseFloat(text) || 0 })}
            placeholder="Enter an amount"
          />
          <FormField
            label="Description"
            value={form.description}
            onChangeText={(text) => setForm({ ...form, description: text })}
            placeholder="Enter a description"
          />
          {/* <FormField
            label="Category"
            value={form.category}
            onChangeText={(text) => setForm({ ...form, category: text })}
            placeholder="Enter a category"
            editable={false}
          /> */}
        </View>
        {!isPersonal && (
          <View className="flex flex-row items-center justify-center mt-10 mb-5">
            <Text className="text-sm font-psemibold text-secondary mx-2">Unequally</Text>
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isEquallyEnabled ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleEquallySplitSwitch}
              value={isEquallyEnabled}
            />
            <Text className="text-sm font-psemibold text-secondary mx-2">Equally</Text>
          </View>
        )}

        {!isEquallyEnabled && members.map((member, index) => (
          <View key={member.id} className="flex flex-row justify-between items-center ">
            <View className="flex flex-col justify-center items-center ml-8 mt-6">
              <View className="flex justify-center items-center rounded-full w-[50px] h-[50px] bg-secondary">
                <FontAwesomeIcon icon={faUser} color={"white"} size={28} />
              </View>
              <Text className="text-sm text-center mt-2 font-pregular text-gray-100">
                {member.name}
              </Text>
            </View>
            <FontAwesomeIcon icon={faArrowRight} color={"white"} size={20} />
            <View className="w-[200px] mr-8">
              <FormField
                label="Amount"
                value={String(memberContributions[index]?.amount || '')}
                onChangeText={(text) => {
                  const updatedContributions = memberContributions.map((contribution, idx) =>
                    idx === index ? { ...contribution, amount: parseFloat(text) || 0 } : contribution
                  );
                  setMemberContributions(updatedContributions);
                }}
                placeholder="Enter amount"
              />
            </View>
          </View>
        ))}

        <View className="mx-8">
          <CustomButton
            title="Submit Expense"
            handlePress={handleSubmit}
            containerStyles="mt-7 mb-7"
            isLoading={isSubmitting}
          />
        </View>
      </ScrollView>
    </SafeAreaView >
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    margin: 8,
    paddingTop: 0,
  },
  dropdown: {
    height: 50,
    borderColor: 'white',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginTop: 20
  },
  label: {
    position: 'absolute',
    marginBottom: 10,
    left: 10,
    top: 10,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
    color: "white"
  },
  placeholderStyle: {
    fontSize: 16,
    color: 'white',
    marginLeft: 10
  },
  selectedTextStyle: {
    fontSize: 16,
    color: "white",
    marginLeft: 15
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});

export default Create;
