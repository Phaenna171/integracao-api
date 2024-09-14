import { Injectable } from '@nestjs/common';
import { ref, set, push, remove, get, getDatabase } from 'firebase/database';
import { uploadBytes, ref as storageRef, getDownloadURL, getStorage, deleteObject } from 'firebase/storage';

@Injectable()
export class ProductsService {
  async createProduct(data: any, file: Express.Multer.File) {
    const storageReference = storageRef(getStorage(), `products/${file.originalname}`);
    const uploadResult = await uploadBytes(storageReference, file.buffer);
    const imageUrl = await getDownloadURL(uploadResult.ref);

    const productsRef = ref(getDatabase(), 'products');
    const newProductRef = push(productsRef);
    await set(newProductRef, { ...data, imageUrl });

    return { success: true, productId: newProductRef.key };
  }

  async deleteProduct(productId: string) {
    const db = getDatabase();
    const productRef = ref(db, `products/${productId}`);

    // Retrieve the product details
    const snapshot = await get(productRef);
    if (!snapshot.exists()) {
      throw new Error('Product not found');
    }

    const productData = snapshot.val();
    const imageUrl = productData.imageUrl;

    // Delete the image from Firebase Storage
    const storage = getStorage();
    const fileRef = storageRef(storage, imageUrl);
    await deleteObject(fileRef);

    // Remove the product entry from the database
    await remove(productRef);

    return { success: true };
  }

  async getProducts() {
    const productsRef = ref(getDatabase(), 'products');
    const snapshot = await get(productsRef);
    return snapshot.val() || [];
  }

  async updateProduct(productId: string, data: any, file: Express.Multer.File) {
    const productRef = ref(getDatabase(), `products/${productId}`);

    const snapshot = await get(productRef);
    if (!snapshot.exists()) {
      throw new Error('Product not found');
    }

    const productData = snapshot.val();
    let imageUrl = productData.imageUrl;

    if (file) {
      const storage = getStorage();
      const oldImageRef = storageRef(storage, imageUrl);
      await deleteObject(oldImageRef);

      const newImageRef = storageRef(storage, `products/${file.originalname}`);
      const uploadResult = await uploadBytes(newImageRef, file.buffer);
      imageUrl = await getDownloadURL(uploadResult.ref);
    }

    await set(productRef, { ...data, imageUrl });
    return { success: true };
  }
}