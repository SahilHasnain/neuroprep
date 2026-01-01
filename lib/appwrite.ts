import { Client, Account, Storage, ID } from "react-native-appwrite";
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID } from "@/config/appwrite";

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1" )
  .setProject(APPWRITE_PROJECT_ID || "693e5d70002253bb1cb7")
  .setPlatform("com.neuroprep.app");

export const account = new Account(client);
export const storage = new Storage(client);
export { client, ID };
