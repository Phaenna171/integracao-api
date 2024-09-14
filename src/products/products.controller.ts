import { Controller, Post, Get, Delete, Param, Body, UseInterceptors, UploadedFile, UseGuards, Put, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody, ApiConsumes, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";

@ApiTags('Products')
@ApiBearerAuth()
@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
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
  async createProduct(
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.productsService.createProduct(body, file);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'Return all products.' })
  async getProducts() {
    return this.productsService.getProducts();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully.' })
  async deleteProduct(@Param('id') id: string) {
    return this.productsService.deleteProduct(id);
  }

  @Put(':productId')
  @UseInterceptors(FileInterceptor('file'))
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
  @ApiParam({ name: 'productId', description: 'ID of the product to update' })
  async updateProduct(@Param('productId') productId: string, @UploadedFile() file: Express.Multer.File, @Body() data: any) {
    if (!productId) {
      throw new BadRequestException('Product ID is required');
    }
    return await this.productsService.updateProduct(productId, data, file);
  }
}
