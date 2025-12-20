import { Client, Account, TablesDB } from "react-native-appwrite";
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID } from "@/config/appwrite";

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT!)
  .setProject(APPWRITE_PROJECT_ID!);

export const account = new Account(client);
export const tablesDB = new TablesDB(client);

export { client };
