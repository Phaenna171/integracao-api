import { Injectable } from '@nestjs/common';
import { ref, set, push, remove, get, getDatabase, update } from 'firebase/database';
import { uploadBytes, ref as storageRef, getDownloadURL, getStorage, deleteObject } from 'firebase/storage';

@Injectable()
export class ProductsService {
  async createProduct(data: any, files: Express.Multer.File[]) {

    const carouselPhotos = await Promise.all(files.map(async el => {
      const storageReference = storageRef(getStorage(), `products/${el.originalname}`);
      const uploadResult = await uploadBytes(storageReference, el.buffer);
      const imageUrl = await getDownloadURL(uploadResult.ref);
      return imageUrl
    }))

    const productsRef = ref(getDatabase(), 'products');
    const newProductRef = push(productsRef);
    await set(newProductRef, {
      ...data, carouselPhotos, use: JSON.parse(data.use),
      table: JSON.parse(data.table), indication: JSON.parse(data.indication)
    });

    return { success: true, productId: newProductRef.key };
  }

  async deleteProduct(id: string) {
    const db = getDatabase();
    const productRef = ref(db, `products/${id}`);

    // Retrieve the product details
    const snapshot = await get(productRef);
    if (!snapshot.exists()) {
      throw new Error('Product not found');
    }

    const productData = snapshot.val();
    const { carouselPhotos } = productData;

    // Delete the image from Firebase Storage
    const storage = getStorage();
    await Promise.all(carouselPhotos.map(async el => {
      const fileRef = storageRef(storage, el);
      await deleteObject(fileRef);
    }))

    // Remove the product entry from the database
    await remove(productRef);

    return { success: true };
  }

  async getProducts() {
    const productsRef = ref(getDatabase(), 'products');
    const snapshot = await get(productsRef);
    if (!snapshot.exists()) return []
    const data = Object.entries(snapshot.val())?.map(([key, value]: [key: string, value: any]) => ({ ...value, id: key }))
    return data || [];
  }

  async getProductById(id: string) {
    const productsRef = ref(getDatabase(), `products/${id}`);
    const snapshot = await get(productsRef);
    return snapshot.val() || [];
  }

  async updateProduct(id: string, data: any, files?: Express.Multer.File[]) {
    try {
      const productRef = ref(getDatabase(), `products/${id}`);

      // Check if the product exists
      const snapshot = await get(productRef);
      if (!snapshot.exists()) throw new Error('Product not found');

      if (files.length > 0) {
        const productData = snapshot.val();
        const storage = getStorage();

        // If there are existing carouselPhotos, remove the old ones from storage
        if (productData.carouselPhotos && productData.carouselPhotos.length > 0) {
          await Promise.all(
            productData.carouselPhotos.map(async (url: string) => {
              const oldImageRef = storageRef(storage, url);
              await deleteObject(oldImageRef); // Delete old images
            })
          ).catch(e => console.error(e))
        }

        // Upload new carousel photos
        const carouselPhotos = await Promise.all(
          files?.map(async (file) => {
              const newImageRef = storageRef(storage, `products/${file.originalname}`);
              const uploadResult = await uploadBytes(newImageRef, file.buffer);
              return await getDownloadURL(uploadResult.ref); // Get the download URL for the uploaded image
          })
        ).catch(e => console.error(e))
        // Update the product with new data and new carousel photos
        await set(productRef, {
          ...data,
          carouselPhotos, // Update carousel photos
          use: JSON.parse(data.use), // Parse use field
          table: JSON.parse(data.table), // Parse table field
          indication: JSON.parse(data.indication), // Parse indication field
        });
      } else {
        const oldPhotos = data.oldPhotos
        delete data.oldPhotos
        await set(productRef, {
          ...data,
          carouselPhotos: [oldPhotos],
          use: JSON.parse(data.use), // Parse use field
          table: JSON.parse(data.table), // Parse table field
          indication: JSON.parse(data.indication), // Parse indication field
        });
      }

      return { success: true };
    } catch (error) {
      return { error: error.message }
    }
  }

}