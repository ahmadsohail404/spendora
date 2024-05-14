import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
  Storage,
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
    console.log(friends.documents);
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

export async function getGroups() {
  try {
    const groups = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.groupsCollectionId
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