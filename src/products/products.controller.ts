import { Controller, Post, Get, Delete, Param, Body, UseInterceptors, UploadedFile, UseGuards, Put, BadRequestException, UploadedFiles } from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody, ApiConsumes, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@ApiTags('Products')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  // Categories routes

  @Get('/category')
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ status: 200, description: 'Return all categories.' })
  @UseGuards(JwtAuthGuard)
  async getCategories() {
    return this.productsService.getCategories();
  }

  @Get('/category/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({ status: 200, description: 'Return a specific category.' })
  async getCategoryById(@Param('id') id: string) {
    return this.productsService.getCategoryById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/category')
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: 201, description: 'Category created successfully.' })
  async createCategory(@Body() createCategoryDto: any) {
    console.log('here 36')
    return this.productsService.createCategory(createCategoryDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/category/:id')
  @ApiOperation({ summary: 'Update a category' })
  @ApiResponse({ status: 200, description: 'Category updated successfully.' })
  async updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: any,
  ) {
    return this.productsService.updateCategory(id, updateCategoryDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/category/:id')
  @ApiOperation({ summary: 'Delete a category' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully.' })
  async deleteCategory(@Param('id') id: string) {
    return this.productsService.deleteCategory(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/mix')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'productImage', maxCount: 1 },
      { name: 'backgroundImage', maxCount: 1 },
    ]),
  )
  @ApiOperation({ summary: 'Create a new mix' })
  @ApiResponse({ status: 201, description: 'Mix created successfully.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        productName: { type: 'string' },
        plantingSeason: { type: 'string' },
        management: { type: 'string' },
        topics: {
          type: 'array',
          items: { type: 'string' },
        },
        productImage: { type: 'string', format: 'binary' },
        backgroundImage: { type: 'string', format: 'binary' },
      },
    },
  })
  async createMix(
    @Body() body: any,
    @UploadedFiles() files: { productImage?: Express.Multer.File[]; backgroundImage?: Express.Multer.File[] },
  ) {
    console.log('Received files:', files, 'Received body:', body);

    const images = [
      ...(files.productImage || []),
      ...(files.backgroundImage || []),
    ];

    return this.productsService.createMix(body, images);
  }

  @Get('/mix')
  @ApiOperation({ summary: 'Get all mixes' })
  @ApiResponse({ status: 200, description: 'Return all mixes.' })
  async getMixes() {
    return this.productsService.getMixes();
  }

  @Get('/mix/:id')
  @ApiOperation({ summary: 'Get mix by ID' })
  @ApiResponse({ status: 200, description: 'Return mix by ID.' })
  async getMixById(@Param('id') id: string) {
    return this.productsService.getMixById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/mix/:id')
  @UseInterceptors(FilesInterceptor('images'))
  @ApiOperation({ summary: 'Update an existing mix' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        productName: { type: 'string' },
        plantingSeason: { type: 'string' },
        management: { type: 'string' },
        topics: {
          type: 'array',
          items: { type: 'string' },
        },
        productImage: { type: 'string', format: 'binary' },
        backgroundImage: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiParam({ name: 'id', description: 'ID of the mix to update' })
  async updateMix(
    @Param('id') id: string,
    @Body() data: any,
    @UploadedFiles() images?: Express.Multer.File[],
  ) {
    if (!id) throw new BadRequestException('Mix ID is required');
    return this.productsService.updateMix(id, data, images);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a mix' })
  @ApiResponse({ status: 200, description: 'Mix deleted successfully.' })
  async deleteMix(@Param('id') id: string) {
    return this.productsService.deleteMix(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FilesInterceptor('carouselPhotos'))
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Product created successfully.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        subtitle: { type: 'string' },
        description: { type: 'string' },
        use: {
          type: 'array',
          items: {
            type: 'string'
          }
        },
        indication: {
          type: 'array',
          items: {
            type: 'string'
          }
        },
        category: { type: 'string' },
        // price: { type: 'number' },
        carouselPhotos: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        table: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              key: { type: 'string' },
              value: { type: 'string' }
            },
            required: ['key', 'value'],
          },
        },
        tableTitle: { type: 'string' }

      },
    },
  })
  async createProduct(
    @Body() body: any,
    @UploadedFiles() carouselPhotos: Express.Multer.File[],
  ) {
    console.log('here 195')
    return this.productsService.createProduct(body, carouselPhotos);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'Return all products.' })
  async getProducts() {
    return this.productsService.getProducts();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'Return all products.' })
  async getProductById(@Param('id') id: string) {
    return this.productsService.getProductById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully.' })
  async deleteProduct(@Param('id') id: string) {
    return this.productsService.deleteProduct(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @UseInterceptors(FilesInterceptor('carouselPhotos'))
  @ApiOperation({ summary: 'Update an existing product' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        subtitle: { type: 'string' },
        description: { type: 'string' },
        use: {
          type: 'string',
          format: 'binary',
        },
        indication: {
          type: 'string',
          format: 'binary',
        },
        category: { type: 'string' },
        price: { type: 'number' },
        carouselPhotos: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        oldPhotos: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
        table: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              key: { type: 'string' },
              value: { type: 'string' }
            },
            required: ['key', 'value'],
          },
        }

      },
    },
  })
  @ApiParam({ name: 'id', description: 'ID of the product to update' })
  async updateProduct(@Param('id') id: string, @Body() data: any, @UploadedFiles() carouselPhotos?: Express.Multer.File[],) {
    if (!id) throw new BadRequestException('Product ID is required');
    return await this.productsService.updateProduct(id, data, carouselPhotos);
  }
}
