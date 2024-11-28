import { Injectable, NotFoundException } from '@nestjs/common';
import { ref, set, push, remove, get, getDatabase, update } from 'firebase/database';
import { uploadBytes, ref as storageRef, getDownloadURL, getStorage, deleteObject } from 'firebase/storage';

@Injectable()
export class ProductsService {
  async createProduct(data: any, files: Express.Multer.File[]) {

    const carouselPhotos = await Promise.all(files.map(async el => {
      const storageReference = storageRef(getStorage(), `products-integracao/${el.originalname}`);
      const uploadResult = await uploadBytes(storageReference, el.buffer);
      const imageUrl = await getDownloadURL(uploadResult.ref);
      return imageUrl
    }))

    const productsRef = ref(getDatabase(), 'products-integracao');
    const newProductRef = push(productsRef);
    await set(newProductRef, {
      ...data, carouselPhotos,
      table: JSON.parse(data.table)
    });

    return { success: true, productId: newProductRef.key };
  }

  async deleteProduct(id: string) {
    const db = getDatabase();
    const productRef = ref(db, `products-integracao/${id}`);

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
    const productsRef = ref(getDatabase(), 'products-integracao');
    const snapshot = await get(productsRef);
    if (!snapshot.exists()) return []
    const data = Object.entries(snapshot.val())?.map(([key, value]: [key: string, value: any]) => ({ ...value, id: key }))
    return data || [];
  }

  async getProductById(id: string) {
    const productsRef = ref(getDatabase(), `products-integracao/${id}`);
    const snapshot = await get(productsRef);
    return snapshot.val() || [];
  }

  async updateProduct(id: string, data: any, files?: Express.Multer.File[]) {
    try {
      const productRef = ref(getDatabase(), `products-integracao/${id}`);

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
            const newImageRef = storageRef(storage, `products-integracao/${file.originalname}`);
            const uploadResult = await uploadBytes(newImageRef, file.buffer);
            return await getDownloadURL(uploadResult.ref); // Get the download URL for the uploaded image
          })
        ).catch(e => console.error(e))
        // Update the product with new data and new carousel photos
        await set(productRef, {
          ...data,
          carouselPhotos, // Update carousel photos
          table: JSON.parse(data.table), // Parse table field
        });
      } else {
        const oldPhotos = data.oldPhotos
        delete data.oldPhotos
        await set(productRef, {
          ...data,
          carouselPhotos: [oldPhotos],
          table: JSON.parse(data.table), // Parse table field
        });
      }

      return { success: true };
    } catch (error) {
      return { error: error.message }
    }
  }


  async getCategories(): Promise<any[]> {
    const snapshot = await get(ref(getDatabase(), 'categories-integracao'))
    const categories = snapshot.val();
    if (!categories) return [];
    return Object.keys(categories).map((key) => ({
      id: key,
      name: categories[key],
    }));
  }

  async getCategoryById(id: string): Promise<any> {
    const snapshot = await get(ref(getDatabase(), `categories-integracao/${id}`))
    const category = snapshot.val();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return { id, ...category };
  }

  async createCategory(createCategoryDto: any): Promise<any> {
    // Fetch all categories to determine the next ID
    const categories = await this.getCategories();
    const newId = (categories.length + 1).toString(); // Incremental ID as string

    // Create the new category
    await set(ref(getDatabase(), `categories-integracao/${newId}`), createCategoryDto.name);

    return { id: newId, name: createCategoryDto.name};
  }

  async updateCategory(id: string, updateCategoryDto: any): Promise<any> {
    const categoryRef = ref(getDatabase(), `categories-integracao/${id}`);
    const snapshot = await get(categoryRef)

    if (!snapshot.exists()) {
      throw new NotFoundException('Category not found');
    }

    // Update the category
    await set(categoryRef, updateCategoryDto.name).catch(e => console.error(e));

    return { id, name: updateCategoryDto.name };
  }

  async deleteCategory(id: string): Promise<void> {
    const categoryRef = ref(getDatabase(), `categories-integracao/${id}`);
    const snapshot = await get(categoryRef)

    if (!snapshot.exists()) {
      throw new NotFoundException('Category not found');
    }

    // Delete the category
    await remove(categoryRef);
  }

}