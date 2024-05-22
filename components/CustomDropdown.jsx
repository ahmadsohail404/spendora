import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faUserGroup } from "@fortawesome/free-solid-svg-icons";
import { createGroup, addGroupMember, getGroups } from "../lib/appwrite";
import useAppwrite from "../lib/useAppwrite";
import { useGlobalContext } from '../context/GlobalProvider';


const CustomDropdowm = ({ data }) => {
  const [isFocus, setIsFocus] = useState(false);
  const { value, setValue, selectedGroupDropDown,
    setSelectedGroupDropDown } = useGlobalContext();


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

  return (
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
  );
};

export default CustomDropdowm;

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