import { Client, Databases, Storage, Query, ID } from "appwrite";
import appwriteConfig from "./appwriteConfig";

class DatabaseService {
  client = new Client();
  databases;
  bucket;

  constructor() {
    this.client
      .setEndpoint(appwriteConfig.appwriteUrl)
      .setProject(appwriteConfig.appwriteProjectid);
    this.databases = new Databases(this.client);
    this.bucket = new Storage(this.client);
  }

  async createPost({ title, slug, content, featuredImage, status }: {
    title: string;
    slug: string;
    content: string;
    featuredImage: string;
    status: string;
  }) {
    return await this.databases.createDocument(
      appwriteConfig.appwriteDatabaseid,
      appwriteConfig.appwriteCollectionid,
      slug,
      {
        Title: title,
        Content: content,
        featuredimage: featuredImage,
        status: status,
      }
    );
  }

  async updatePost(slug: string, { title, content, featuredImage, status }: {
    title: string;
    content: string;
    featuredImage: string;
    status: string;
  }) {
    return await this.databases.updateDocument(
      appwriteConfig.appwriteDatabaseid,
      appwriteConfig.appwriteCollectionid,
      slug,
      {
        Title: title,
        Content: content,
        featuredimage: featuredImage,
        status: status,
      }
    );
  }

  async deletePost(slug: string) {
    try {
      await this.databases.deleteDocument(
        appwriteConfig.appwriteDatabaseid,
        appwriteConfig.appwriteCollectionid,
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
        appwriteConfig.appwriteDatabaseid,
        appwriteConfig.appwriteCollectionid,
        slug
      );
    } catch {
      return null;
    }
  }

  async getPosts(queries = [Query.equal("status", "active")]) {
    try {
      return await this.databases.listDocuments(
        appwriteConfig.appwriteDatabaseid,
        appwriteConfig.appwriteCollectionid,
        queries
      );
    } catch {
      return null;
    }
  }

  async uploadFile(file: File) {
    try {
      return await this.bucket.createFile(
        appwriteConfig.appwriteBucketid,
        ID.unique(),
        file
      );
    } catch {
      return null;
    }
  }

  async deleteFile(fileId: string) {
    try {
      await this.bucket.deleteFile(appwriteConfig.appwriteBucketid, fileId);
      return true;
    } catch {
      return false;
    }
  }

  getFilePreview(fileId: string) {
    return this.bucket.getFilePreview(appwriteConfig.appwriteBucketid, fileId);
  }
}

const databaseService = new DatabaseService();
export default databaseService;