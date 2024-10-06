import { Controller, Post, Get, Delete, Param, UseInterceptors, UploadedFile, ParseFilePipe, FileTypeValidator, BadRequestException, UseGuards, Put, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BannersService } from './banners.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@ApiTags('Banners')
@ApiBearerAuth()
@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|svg|webp)$/)) {
        return callback(new BadRequestException('Only image files are allowed!'), false);
      }
      if (file.size > 10000000) return callback(new BadRequestException('Image are so large. Use image with less than 10MB'), false);
      callback(null, true);
    },
  }))
  @ApiOperation({ summary: 'Create a new banner' })
  @ApiResponse({ status: 201, description: 'Banner created successfully.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        link: { type: 'string' },
        description: { type: 'string' },
        title: { type: 'string' },
      },
    },
  })
  async createBanner(@Body() body: any, @UploadedFile() file: Express.Multer.File) {
    return this.bannersService.createBanner(body, file);
  }

  @Get()
  @ApiOperation({ summary: 'Get all banners' })
  @ApiResponse({ status: 200, description: 'Return all banners.' })
  async getBanners() {
    return this.bannersService.getBanners();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get banner by id' })
  @ApiResponse({ status: 200, description: 'Return banner by id.' })
  async getBannerById(@Param('id') id: string) {
    return this.bannersService.getBannerById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a banner' })
  @ApiResponse({ status: 200, description: 'Banner deleted successfully.' })
  async deleteBanner(@Param('id') id: string) {
    return this.bannersService.deleteBanner(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Update an existing banner' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        link: { type: 'string' },
        description: { type: 'string' },
        title: { type: 'string' },
      },
    },
  })
  @ApiParam({ name: 'id', description: 'ID of the banner to update' })
  async updateBanner(@Param('id') id: string, @Body() body: any, @UploadedFile() file?: Express.Multer.File) {
    if (!id) throw new BadRequestException('Banner ID is required');
    return await this.bannersService.updateBanner(id, body, file);
  }
}
