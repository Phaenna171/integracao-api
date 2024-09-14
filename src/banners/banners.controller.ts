import { Controller, Post, Get, Delete, Param, UseInterceptors, UploadedFile, ParseFilePipe, FileTypeValidator, BadRequestException, UseGuards, Put } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BannersService } from './banners.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@ApiTags('Banners')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        return callback(new BadRequestException('Only image files are allowed!'), false);
      }
      if(file.size > 10000000) return callback(new BadRequestException('Image are so large. Use image with less than 10MB'), false);
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
      },
    },
  })
  async createBanner(@UploadedFile() file: Express.Multer.File) {
    return this.bannersService.createBanner(file);
  }

  @Get()
  @ApiOperation({ summary: 'Get all banners' })
  @ApiResponse({ status: 200, description: 'Return all banners.' })
  async getBanners() {
    return this.bannersService.getBanners();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a banner' })
  @ApiResponse({ status: 200, description: 'Banner deleted successfully.' })
  async deleteBanner(@Param('id') id: string) {
    return this.bannersService.deleteBanner(id);
  }

  @Put(':bannerId')
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
          description: 'New banner image (optional)',
        },
      },
    },
  })
  @ApiParam({ name: 'bannerId', description: 'ID of the banner to update' })
  async updateBanner(@Param('bannerId') bannerId: string, @UploadedFile() file: Express.Multer.File) {
    if (!bannerId) {
      throw new BadRequestException('Banner ID is required');
    }
    return await this.bannersService.updateBanner(bannerId, file);
  }
}
