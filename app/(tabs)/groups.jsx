import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  StyleSheet,
  Pressable,
  RefreshControl,
  FlatList
} from "react-native";
import CustomButton from "../../components/CustomButton";
import FormField from "../../components/FormField";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faPlus, faTrash, faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import useAppwrite from "../../lib/useAppwrite";
import { createGroup, addGroupMember, getGroups, getGroupMembers, updateGroup, deleteGroup, deleteGroupMember } from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";
import { SafeAreaView } from "react-native-safe-area-context";


const Group = () => {
  const { user } = useGlobalContext();
  const { modalVisible, setModalVisible } = useGlobalContext();

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isUpdateGroup, setUpdateGroup] = useState(false)


  // Fetching all groups
  const { data: groups, refetch: refetchGroups } = useAppwrite(getGroups);

  // Fetching members of the selected group
  const { data: groupMembers, refetch: refetchMembers } = useAppwrite(() => getGroupMembers(selectedGroup?.$id));

  const [isSubmitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    groupName: "",
    memberPhone: "",
    memberName: "",
    members: [],
  });

  const handleSelectGroup = async (group) => {
    setSelectedGroup(group);
    setModalVisible(true);
    setUpdateGroup(true)

    try {
      const members = await getGroupMembers(group.$id);
      setForm({
        groupName: group.groupName,
        memberPhone: '',
        memberName: '',
        members: members.map(member => ({
          phone: member.phone,
          name: member.name
        }))
      });
    } catch (error) {
      console.error("Failed to fetch group members:", error);
      Alert.alert("Error", "Failed to fetch group members: " + error.message);
      setUpdateGroup(false)
    }
  };



  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchGroups();
      if (selectedGroup) {
        await refetchMembers();
      }
    } finally {
      setRefreshing(false);
    }
  };


  const handleAddMember = () => {
    if (form.memberPhone && form.memberName) {
      setForm(prevForm => ({
        ...prevForm,
        members: [
          ...prevForm.members,
          {
            phone: form.memberPhone,
            name: form.memberName,
            isNew: true
          }
        ],
        memberPhone: '',
        memberName: '',
      }));
    }
  };


  const handleDeleteGroup = async (groupId) => {
    try {
      await deleteGroup(groupId);
      console.log("Group deleted successfully");
      setForm(prevForm => ({
        ...prevForm,
        groups: prevForm.groups.filter(group => group.$id !== groupId)
      }));
      setSelectedGroup(null);
      setModalVisible(false);
    } catch (error) {
      console.error("Failed to delete group:", error);
      Alert.alert("Error", "Failed to delete group");
    }
  }

  const handleDeleteMember = async (index, memberId) => {
    console.log("Attempting to delete member with ID:", memberId);
    try {
      await deleteGroupMember(memberId);
      console.log("Member deleted successfully");

      await refetchMembers()

      Alert.alert("Success", "Member deleted successfully");
    } catch (error) {
      console.error("Failed to delete member:", error);
      Alert.alert("Error", "Failed to delete member");
    }
  }


  const handleSubmit = async () => {
    if (!form.groupName.trim()) {
      Alert.alert("Validation Error", "Group name is required.");
      return;
    }

    setSubmitting(true);
    try {
      let newGroup;
      if (selectedGroup) {
        // Assuming an updateGroup function exists
        newGroup = await updateGroup(selectedGroup.$id, form.groupName);
        console.log("Group updated successfully");
        Alert.alert("Success", "Group updated successfully");
      } else {
        console.log("Creating group with:", form.groupName, user.$id);
        newGroup = await createGroup(form.groupName, user.$id);
        console.log("Group created successfully");
        Alert.alert("Success", "Group created successfully");
      }

      const memberPromises = form.members.map(member => {
        if (member.isNew) {
          // New member needs to be added
          return addGroupMember(newGroup.$id, user.$id, member.phone, member.name);
        }
      });
      await Promise.all(memberPromises);

      setForm({ groupName: "", members: [], memberPhone: "", memberName: "" });
      setModalVisible(false);
      setSelectedGroup(null);
      refetchGroups();
      console.log(newGroup);
    } catch (error) {
      console.error("Error submitting group:", error.message);
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <SafeAreaView className="bg-primary h-full" refreshControl={
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    }>
      <View className="flex flex-col">
        <View className="flex flex-row items-center justify-between m-7 mb-10">
          <Text className="text-2xl font-psemibold text-white">Groups</Text>
          <CustomButton
            title="Create a group"
            handlePress={() => setModalVisible(true)}
            containerStyles="min-h-[40px] px-2 text-sm"
            isLoading={isSubmitting}
          />
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              Alert.alert('Modal has been closed.');
              setModalVisible(!modalVisible);
            }}>
            <View style={styles.centeredView}>
              <View style={styles.modalView} className="bg-gray-100">
                <ScrollView
                  style={{ width: '100%', padding: 20 }}
                  contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: 'center',
                    paddingBottom: 20,
                  }}>
                  <View className="flex flex-row items-center justify-between" >

                    <Text className="text-2xl font-psemibold text-black">{isUpdateGroup ? "Update group" : "Create a group"}</Text>
                    <Pressable onPress={() => setModalVisible(false)}>
                      <FontAwesomeIcon icon={faCircleXmark} size={28} color="#FF204E" />
                    </Pressable>
                  </View>
                  <FormField
                    label="Group Name"
                    value={form.groupName}
                    onChangeText={(text) => setForm({ ...form, groupName: text })}
                    placeholder="Enter group name"
                  />
                  <Text className="text-xl font-pmedium text-black mt-7">Add Members</Text>
                  <View className="pb-4">
                    <FormField
                      label="Name"
                      value={form.memberName}
                      onChangeText={(text) => setForm({ ...form, memberName: text })}
                      placeholder="Enter name"
                    />
                    <FormField
                      label="Phone"
                      value={form.memberPhone}
                      onChangeText={(text) => setForm({ ...form, memberPhone: text })}
                      placeholder="Enter phone"
                      keyboardType="phone-pad"
                    />
                    <TouchableOpacity onPress={handleAddMember} activeOpacity={0.7} className="flex flex-row justify-center items-center border border-secondary mt-4 mb-5 rounded-xl min-h-[32px]">
                      <Text className="text-secondary text-lg font-psemibold mx-2">Add</Text>
                      <FontAwesomeIcon icon={faPlus} color="#FF9C01" />
                    </TouchableOpacity>
                  </View>
                  {groupMembers.map((member, index) => (
                    <View
                      className="border border-secondary rounded-xl px-2"
                      key={member.$id || index}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 5,
                      }}
                    >
                      <Text style={{ flex: 1, padding: 10, color: "#000000" }}>{member.name} - {member.phone}</Text>
                      <TouchableOpacity onPress={() => handleDeleteMember(index, member.$id)}>
                        <FontAwesomeIcon icon={faTrash} size={20} color="red" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
                <CustomButton
                  title={isUpdateGroup ? "Update Group" : "Create Group"}
                  handlePress={handleSubmit}
                  containerStyles="mt-7 min-h-[45px] px-[70px]"
                  isLoading={isSubmitting}
                />
              </View>
            </View>
          </Modal>
        </View>
        <View>
          <FlatList
            data={groups}
            keyExtractor={item => item.$id}
            renderItem={({ item }) => (
              <TouchableOpacity className="bg-gray-100 mx-6 my-3 p-2 px-3 rounded" onPress={() => handleSelectGroup(item)}>
                <Text className="font-pmedium text-xl text-black-00" style={styles.groupName}>{item.groupName}</Text>
              </TouchableOpacity>
            )}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

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

export default Group;
