import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
  Storage,
  Permission,
  Role
} from "react-native-appwrite";

// import Config from 'react-native-config';

export const appwriteConfig = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.sohail.aora",
  projectId: "6623fccc8b52f1782289",
  databaseId: "6623fe00abf9d67b1565",
  userCollectionId: "6623fe249b2ffa15e182",
  friendsCollectionId: "664362830019f02d1a0f",
  expensesCollectionId: "6643711d003931c76e23",
  groupMembersCollectionId: "66437016002b37157b06",
  groupsCollectionId: "66436471002419b54930",
  notificationsCollectionId: "664372c4000fbec9632a",
  paymentsCollectionId: "66437233003654015976",
  storageId: "6623ffadd25ae4794b0c"
};

const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

const account = new Account(client);
const storage = new Storage(client);
const avatars = new Avatars(client);
const databases = new Databases(client);


export async function createUser(email, password, username) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );

    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(username);

    await signIn(email, password);

    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email: email,
        username: username,
        avatar: avatarUrl,
      }
    );

    return newUser;
  } catch (error) {
    throw new Error(error);
  }
}

export async function signIn(email, password) {
  try {
    const session = await account.createEmailSession(email, password);

    return session;
  } catch (error) {
    throw new Error(error);
  }
}

export async function getAccount() {
  try {
    const currentAccount = await account.get();

    return currentAccount;
  } catch (error) {
    throw new Error(error);
  }
}

export async function getCurrentUser() {
  try {
    const currentAccount = await getAccount();
    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function signOut() {
  try {
    const session = await account.deleteSession("current");

    return session;
  } catch (error) {
    throw new Error(error);
  }
}

export async function getFriends() {
  try {
    const friends = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.friendsCollectionId
    );
    return friends.documents;
  } catch (error) {
    throw new Error(error);
  }
}

export async function getExpenses() {
  try {
    const expenses = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.expensesCollectionId
    );

    return expenses.documents;
  } catch (error) {
    throw new Error(error);
  }
}

export async function getGroups(userId) {
  try {
    const groups = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.groupsCollectionId,
      [Query.equal("creator", userId)]
    );
    return groups.documents;
  } catch (error) {
    throw new Error(error);
  }
}



export async function getGroupMembers(groupId) {
  try {
    const groupMembers = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.groupMembersCollectionId,
      [Query.equal("groupId", groupId)]
    );
    return groupMembers.documents;
  } catch (error) {
    throw new Error(error);
  }
}

export async function getNotifications() {
  try {
    const notifications = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId
    );
    return notifications.documents;
  } catch (error) {
    throw new Error(error);
  }
}

export async function getPayments() {
  try {
    const payments = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.paymentsCollectionId
    );
    return payments.documents;
  } catch (error) {
    throw new Error(error);
  }
}

// Example of creating a new group with permissions for the creator and a list of members
export async function createGroup(groupName, creatorId) {
  try {
    let permissions = [
      Permission.read(Role.any()),
      Permission.update(Role.any()),
      Permission.delete(Role.any()),
    ];

    // // Add read permissions for all members
    // memberIds.forEach(memberId => {
    //   permissions.push(Permission.read(Role.member(memberId)));
    // });

    const group = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.groupsCollectionId,
      ID.unique(),
      {
        groupName: groupName,
        creator: creatorId,
        // members: memberIds, // Assuming you have a members field to store member IDs
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      permissions
    );

    return group;
  } catch (error) {
    console.error("Error in createGroup:", error);
    throw new Error(error.message);
  }
}



export async function updateGroup(groupId, groupName, creatorId) {
  try {
    // Assuming there's a 'groupsCollectionId' in your Appwrite project
    const group = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.groupsCollectionId,
      groupId,
      {
        groupName: groupName,
        creator: creatorId,
        updatedAt: new Date().toISOString()
      },
      [
        Permission.read(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any())
      ]
    );
    return group;
  } catch (error) {
    console.error("Error in updateGroup:", error);
    throw new Error(error.message);
  }
}


// Function to add a member to a group
export async function addGroupMember(groupId, userId, userEmail, userName) {
  try {
    const member = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.groupMembersCollectionId,
      ID.unique(),
      {
        groupId: groupId,
        userId: userId,
        email: userEmail,
        name: userName
      },
      [
        Permission.read(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any())
      ]
    );
    return member;
  } catch (error) {
    console.error("Error in addGroupMember:", error);
    throw new Error(error.message);
  }
}


export async function updateGroupMember(groupId, memberId, phone, name) {
  try {
    // Update a specific member's document in the group members collection
    const member = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.groupMembersCollectionId,
      memberId, // The document ID of the group member
      {
        groupId: groupId, // Reaffirm group association, if necessary
        phone: phone,
        name: name,
        updatedAt: new Date().toISOString() // Optional: track when the member was updated
      },
      [
        Permission.read(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any())
      ]
    );
    return member;
  } catch (error) {
    console.error("Error in updateGroupMember:", error);
    throw new Error(error.message);
  }
}

export async function deleteGroup(groupId) {
  try {
    const result = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.groupsCollectionId,
      groupId
    );
    return result;
  } catch (error) {
    console.error("Error in deleteGroup:", error);
    throw new Error(error.message);
  }
}

export async function deleteGroupMember(memberId) {
  try {
    const result = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.groupMembersCollectionId,
      memberId
    );
    return result;
  } catch (error) {
    console.error("Error in deleteGroupMember:", error);
    throw new Error(error.message);
  }
}





