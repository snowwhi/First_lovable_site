import { Client, Databases, Storage, Query, ID, Permission, Role } from "appwrite";
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

  async createPost({ title, slug, content, featuredImage, status, userId }: {
    title: string;
    slug: string;
    content: string;
    featuredImage: string;
    status: string;
    userId?: string;
  }) {
    const permissions = [Permission.read(Role.any())];

    if (userId) {
      permissions.push(Permission.update(Role.user(userId)));
      permissions.push(Permission.delete(Role.user(userId)));
    }

    return await this.databases.createDocument(
      appwriteConfig.appwriteDatabaseid,
      appwriteConfig.appwriteCollectionid,
      slug,
      {
        Title: title,
        Content: content,
        featuredimage: featuredImage,
        status: status,
        userId: userId || "",
      },
      permissions
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

  async makeOwnPostsPublic(userId: string) {
    try {
      const result = await this.getPosts();
      if (!result?.documents?.length) return true;

      await Promise.all(
        result.documents.map(async (doc: any) => {
          const permissions: string[] = doc.$permissions || [];
          const hasPublicRead = permissions.includes('read("any")');
          const isOwnedByUser = permissions.includes(`update("user:${userId}")`) || doc.userId === userId;

          if (!isOwnedByUser || hasPublicRead) return;

          await this.databases.updateDocument(
            appwriteConfig.appwriteDatabaseid,
            appwriteConfig.appwriteCollectionid,
            doc.$id,
            {
              Title: doc.Title,
              Content: doc.Content,
              featuredimage: doc.featuredimage || "",
              status: doc.status || "active",
              userId: doc.userId || userId,
            },
            [
              Permission.read(Role.any()),
              Permission.update(Role.user(userId)),
              Permission.delete(Role.user(userId)),
            ]
          );
        })
      );

      return true;
    } catch {
      return false;
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

  getFileView(fileId: string) {
    return this.bucket.getFileView(appwriteConfig.appwriteBucketid, fileId).toString();
  }
}

const databaseService = new DatabaseService();
export default databaseService;