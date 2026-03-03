import { Client, Databases, Storage, Query, ID } from "appwrite";
import appwriteConfig from "./appwriteConfig";

class DatabaseService {
  client = new Client();
  databases;
  bucket;

  constructor() {
    this.client
      .setEndpoint(appwriteConfig.appwriteUrl)
      .setProject(appwriteConfig.appwriteProjectId);
    this.databases = new Databases(this.client);
    this.bucket = new Storage(this.client);
  }

  async createPost({ title, slug, content, featuredImage, status, userId }) {
    return await this.databases.createDocument(
      appwriteConfig.appwriteDatabaseId,
      appwriteConfig.appwriteCollectionId,
      slug,
      { title, content, featuredImage, status, userId }
    );
  }

  async updatePost(slug, { title, content, featuredImage, status }) {
    return await this.databases.updateDocument(
      appwriteConfig.appwriteDatabaseId,
      appwriteConfig.appwriteCollectionId,
      slug,
      { title, content, featuredImage, status }
    );
  }

  async deletePost(slug) {
    try {
      await this.databases.deleteDocument(
        appwriteConfig.appwriteDatabaseId,
        appwriteConfig.appwriteCollectionId,
        slug
      );
      return true;
    } catch {
      return false;
    }
  }

  async getPost(slug) {
    try {
      return await this.databases.getDocument(
        appwriteConfig.appwriteDatabaseId,
        appwriteConfig.appwriteCollectionId,
        slug
      );
    } catch {
      return null;
    }
  }

  async getPosts(queries = [Query.equal("status", "active")]) {
    try {
      return await this.databases.listDocuments(
        appwriteConfig.appwriteDatabaseId,
        appwriteConfig.appwriteCollectionId,
        queries
      );
    } catch {
      return null;
    }
  }

  async uploadFile(file) {
    try {
      return await this.bucket.createFile(
        appwriteConfig.appwriteBucketId,
        ID.unique(),
        file
      );
    } catch {
      return null;
    }
  }

  async deleteFile(fileId) {
    try {
      await this.bucket.deleteFile(appwriteConfig.appwriteBucketId, fileId);
      return true;
    } catch {
      return false;
    }
  }

  getFilePreview(fileId) {
    return this.bucket.getFilePreview(appwriteConfig.appwriteBucketId, fileId);
  }
}

const databaseService = new DatabaseService();
export default databaseService;
