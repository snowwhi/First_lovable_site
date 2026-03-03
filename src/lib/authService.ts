import { Client, Account, ID } from "appwrite";
import appwriteConfig from "./appwriteConfig";

class AuthService {
  client = new Client();
  account;

  constructor() {
    this.client
      .setEndpoint(appwriteConfig.appwriteUrl)
      .setProject(appwriteConfig.appwriteProjectId);
    this.account = new Account(this.client);
  }

  async createAccount({ email, password, name }) {
    const userAccount = await this.account.create(ID.unique(), email, password, name);
    if (userAccount) {
      return this.login({ email, password });
    }
    return userAccount;
  }

  async login({ email, password }) {
    return await this.account.createEmailPasswordSession(email, password);
  }

  async getCurrentUser() {
    try {
      return await this.account.get();
    } catch {
      return null;
    }
  }

  async logout() {
    return await this.account.deleteSessions();
  }
}

const authService = new AuthService();
export default authService;
