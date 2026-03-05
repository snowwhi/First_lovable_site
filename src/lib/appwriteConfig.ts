console.log("All Vite Env Vars:", import.meta.env);
const appwriteConfig = {
    appwriteUrl: import.meta.env.VITE_APPWRITE_ENDPOINT,
    appwriteProjectid: import.meta.env.VITE_APPWRITE_PROJECT_ID,
    appwriteDatabaseid: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    appwriteCollectionid: import.meta.env.VITE_APPWRITE_COLLECTION_ID,
    appwriteBucketid: import.meta.env.VITE_APPWRITE_BUCKET_ID,
};
export default appwriteConfig;