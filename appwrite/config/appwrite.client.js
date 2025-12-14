import { Account, Avatars, Client, TablesDB } from "node-appwrite"



export const createSessionClient = async () => {

}

const createAdminClient = async () => {
    const client = new Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT)
        .setProject(process.env.APPWRITE_PROJECT)
        .setKey(process.env.APPWRITE_SECRET_KEY);

    return {
        get account() {
            return new Account(client);
        },
        get tablesDB() {
            return new TablesDB(client)
        },
        get avatars() {
            return new Avatars(client);
        }
    }
}