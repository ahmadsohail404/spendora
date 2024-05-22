import React, { useContext, useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Switch,
  StyleSheet
} from "react-native";
import { Dropdown } from 'react-native-element-dropdown';
import CustomButton from "../../components/CustomButton";
import FormField from "../../components/FormField";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faUserGroup } from "@fortawesome/free-solid-svg-icons";
import { getGroups, getGroupMembers } from "../../lib/appwrite";
import useAppwrite from "../../lib/useAppwrite";
import { useGlobalContext } from "../../context/GlobalProvider";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList } from "react-native-gesture-handler";


const Create = () => {
  const { user, setModalVisible, selectedGroupDropDown, setSelectedGroupDropDown, value, setValue } = useGlobalContext();

  const [data, setData] = useState([]);
  const [memberData, setMemberData] = useState([]);
  const [form, setForm] = useState({
    description: "",
    category: "",
    amount: 0,
    splitBetween: []
  });

  const { data: groups, refetch: refetchGroups } = useAppwrite(() => getGroups(user.$id));

  const { data: groupMembers, loading, refetch: refetchMembers } = useAppwrite(
    () => selectedGroupDropDown ? getGroupMembers(selectedGroupDropDown.$id) : Promise.resolve([]),
    [selectedGroupDropDown?.$id]
  );

  const [isFocus, setIsFocus] = useState(false);

  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);


  const renderLabel = () => {
    if (value || isFocus) {
      return (
        <Text style={[styles.label, isFocus && { color: '#FF9C01' }]}>
          Select a group
        </Text>
      );
    }
    return null;
  };


  useEffect(() => {
    if (groups) {
      const formattedData = groups.map(group => ({
        label: group.groupName,
        value: group.$id,
      }));
      setData(formattedData);
    }
  }, [groups]);

  useEffect(() => {
    console.log("Selected group ID has changed:", selectedGroupDropDown?.$id);
    if (selectedGroupDropDown?.$id) {
      refetchMembers().then(() => console.log("Members refetched for group:", selectedGroupDropDown.$id));
    }
  }, [selectedGroupDropDown?.$id]);



  // useEffect(() => {
  //   console.log("Group Members:", groupMembers);
  // }, [groupMembers]);


  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>

        <Text className="text-2xl font-psemibold text-center text-white mt-8 mx-8 mb-10">Add Expense</Text>
        <View className="flex flex-row items-center justify-center">
          <Text className="text-sm font-psemibold text-secondary mx-2">Group</Text>
          <View>
            <Switch
              className="flex flex-1 justify-center items-center"
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleSwitch}
              value={isEnabled}
            />
          </View>
          <Text className="text-sm font-psemibold text-secondary mx-2">Personal</Text>
        </View>
        {!isEnabled && (
          <>
            <View className="p-2">
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
                  value={value}
                  onFocus={() => setIsFocus(true)}
                  onBlur={() => setIsFocus(false)}
                  onChange={item => {
                    console.log("Dropdown item selected:", item);
                    setValue(item.value);
                    setSelectedGroupDropDown(item)
                    setIsFocus(false);
                  }}
                  renderLeftIcon={() => (
                    <FontAwesomeIcon icon={faUserGroup} size={20} color={isFocus ? '#FF9C01' : 'white'} />
                  )}
                />
              </View>
            </View>

            {value && (
                <Text className="text-sm text-center font-psemibold text-secondary">
                  {groupMembers.length > 0 ? "Group Members found" : "No group member found"}
                </Text>
            )}
          </>
        )}

        <View className="mx-8">
          <FormField
            label="Amount"
            value={form.amount}
            onChangeText={(text) => setForm({ ...form, amount: text })}
            placeholder="Enter an amount"
          />
          <FormField
            label="Description"
            value={form.description}
            onChangeText={(text) => setForm({ ...form, description: text })}
            placeholder="Enter a description"
          />
          <FormField
            label="Category"
            value={form.category}
            onChangeText={(text) => setForm({ ...form, category: text })}
            placeholder="Enter a category"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Create;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    margin: 8,
  },
  dropdown: {
    height: 50,
    borderColor: 'white',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginTop: 20
  },
  icon: {
    marginRight: 5,
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