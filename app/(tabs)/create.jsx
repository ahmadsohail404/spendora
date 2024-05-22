import React, { useContext, useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import CustomButton from "../../components/CustomButton";
import FormField from "../../components/FormField";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faPlus, faTrash, faUserGroup } from "@fortawesome/free-solid-svg-icons";
import { createGroup, addGroupMember, getGroups, getGroupMembers } from "../../lib/appwrite";
import useAppwrite from "../../lib/useAppwrite";
import { useGlobalContext } from "../../context/GlobalProvider";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomDropdown from "../../components/CustomDropdown";

const Create = () => {
  const { user, setModalVisible, selectedGroupDropDown, setSelectedGroupDropDown } = useGlobalContext();

  const [data, setData] = useState([]);
  const [memberData, setMemberData] = useState([]);
  const [form, setForm] = useState({
    groupName: "",
    memberPhone: "",
    memberName: "",
    members: [],
  });

  const { data: groups, refetch: refetchGroups } = useAppwrite(getGroups);
  // const { data: groupMembers, refetch: refetchMembers } = useAppwrite(() => getGroupMembers(selectedGroupDropDown));

  // useEffect(() => {
  //   if (groups) {
  //     const formattedData = groups.map(group => ({
  //       label: group.groupName,
  //       value: group.$id,
  //     }));
  //     setData(formattedData);
  //   }
  // }, [groups]);

  // useEffect(() => {
  //   if (selectedGroupDropDown) {
  //     refetchMembers();
  //   }
  // }, [selectedGroupDropDown]);

  // useEffect(() => {
  //   console.log("Group Members:", groupMembers);
  // }, [groupMembers]);

  const handleAddMember = () => {
    if (form.memberPhone && form.memberName) {
      setForm((prevForm) => ({
        ...prevForm,
        members: [
          ...prevForm.members,
          { phone: form.memberPhone, name: form.memberName },
        ],
        memberPhone: "",
        memberName: "",
      }));
    }
  };

  const handleSubmit = async () => {
    console.log("Group Name:", form.groupName);

    try {
      const newGroup = await createGroup(form.groupName, user.$id);
      console.log("New Group:", newGroup); // Log the new group
      for (let member of form.members) {
        await addGroupMember(newGroup.$id, user.$id, member.phone, member.name);
      }

      console.log("Group created with members added successfully");
      setForm({ groupName: "", members: [], memberPhone: "", memberName: "" });
      router.push("/create");
    } catch (error) {
      console.error("Error creating group or adding members:", error.message);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View className="p-2">
          <CustomDropdown
            data={data}
          />
        </View>
        <View className="flex flex-col items-center">
          <Text className="text-xl font-psemibold text-secondary">OR</Text>
          <CustomButton
            title="Create a group"
            handlePress={() => {
              router.push("/groups")
              setModalVisible(true)
            }}
            containerStyles="mt-5 px-[95px]"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Create;
