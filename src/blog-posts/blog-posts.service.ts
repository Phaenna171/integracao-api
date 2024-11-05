import { Injectable } from '@nestjs/common';
import { ref, set, push, remove, get, getDatabase, update } from 'firebase/database';
import { uploadBytes, ref as storageRef, getDownloadURL, getStorage, deleteObject } from 'firebase/storage';

@Injectable()
export class BlogPostsService {
  async createPost(data: any, file: Express.Multer.File) {
    const storageReference = storageRef(getStorage(), `blog-integracao/${file.originalname}`);
    const uploadResult = await uploadBytes(storageReference, file.buffer);
    const imageUrl = await getDownloadURL(uploadResult.ref);

    const postsRef = ref(getDatabase(), 'blogPosts-integracao');
    const newPostRef = push(postsRef);
    await set(newPostRef, { ...data, image: imageUrl, createdAt: new Date().getTime()  });

    return { success: true, postId: newPostRef.key };
  }

  async deletePost(postId: string) {
    const db = getDatabase();
    const postRef = ref(db, `blogPosts-integracao/${postId}`);

    // Retrieve the blog post details
    const snapshot = await get(postRef);
    if (!snapshot.exists()) {
      throw new Error('Blog post not found');
    }

    const postData = snapshot.val();
    const imageUrl = postData.image;

    // Delete the image from Firebase Storage
    const storage = getStorage();
    const fileRef = storageRef(storage, imageUrl);
    await deleteObject(fileRef);

    // Remove the blog post entry from the database
    await remove(postRef);

    return { success: true };
  }

  async getPosts() {
    const postsRef = ref(getDatabase(), 'blogPosts-integracao');
    const snapshot = await get(postsRef);
    if (!snapshot.exists()) return []
    const data = Object.entries(snapshot.val())?.map(([key, value]: [key: string, value: any]) => ({ ...value, id: key }))
    return data || [];
  }

  async getPostById(id: string) {
    const blogPostsRef = ref(getDatabase(), `blogPosts-integracao/${id}`);
    const snapshot = await get(blogPostsRef);
    return snapshot.val() || [];
  }

  async updatePost(postId: string, data: any, file?: Express.Multer.File) {
    const postRef = ref(getDatabase(), `blogPosts-integracao/${postId}`);

    const snapshot = await get(postRef);
    if (!snapshot.exists()) {
      throw new Error('Post not found');
    }

    if (file) {
      const postData = snapshot.val();
      let imageUrl = postData.image;

      const storage = getStorage();
      const oldImageRef = storageRef(storage, imageUrl);
      await deleteObject(oldImageRef);

      const newImageRef = storageRef(storage, `blog-integracao/${file.originalname}`);
      const uploadResult = await uploadBytes(newImageRef, file.buffer);
      imageUrl = await getDownloadURL(uploadResult.ref);
      await set(postRef, { ...data, image: imageUrl });
    } else await update(postRef, { ...data })

    return { success: true };
  }
}