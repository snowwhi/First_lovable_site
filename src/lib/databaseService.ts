import { Client, Databases, Storage, Query, ID } from "appwrite";
import appwriteConfig from "./appwriteConfig";

class DatabaseService {
  client = new Client();
  databases: Databases;
  bucket: Storage;

  constructor() {
    this.client
      .setEndpoint(appwriteConfig.appwriteUrl)
      .setProject(appwriteConfig.appwriteProjectId);
    this.databases = new Databases(this.client);
    this.bucket = new Storage(this.client);
  }

  async createPost({ title, slug, content, featuredImage, status, userId }: {
    title: string; slug: string; content: string; featuredImage: string; status: string; userId: string;
  }) {
    return await this.databases.createDocument(
      appwriteConfig.appwriteDatabaseId,
      appwriteConfig.appwriteCollectionId,
      slug,
      { title, content, featuredImage, status, userId }
    );
  }

  async updatePost(slug: string, { title, content, featuredImage, status }: {
    title: string; content: string; featuredImage: string; status: string;
  }) {
    return await this.databases.updateDocument(
      appwriteConfig.appwriteDatabaseId,
      appwriteConfig.appwriteCollectionId,
      slug,
      { title, content, featuredImage, status }
    );
  }

  async deletePost(slug: string) {
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

  async getPost(slug: string) {
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

  async uploadFile(file: File) {
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

  async deleteFile(fileId: string) {
    try {
      await this.bucket.deleteFile(appwriteConfig.appwriteBucketId, fileId);
      return true;
    } catch {
      return false;
    }
  }

  getFilePreview(fileId: string) {
    return this.bucket.getFilePreview(appwriteConfig.appwriteBucketId, fileId);
  }
}

const databaseService = new DatabaseService();
export default databaseService;
