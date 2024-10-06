import { Controller, Post, Get, Delete, Param, Body, UseInterceptors, UploadedFile, UseGuards, Put, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BlogPostsService } from './blog-posts.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@ApiTags('BlogPosts')
@ApiBearerAuth()
@Controller('blog-posts')
export class BlogPostsController {
  constructor(private readonly blogPostsService: BlogPostsService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new blog post' })
  @ApiResponse({ status: 201, description: 'Blog post created successfully.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        file: {
          type: 'string',
          format: 'binary',
        }
      },
    },
  })
  async createPost(@Body() body: any, @UploadedFile() file: Express.Multer.File) {
    return this.blogPostsService.createPost(body, file);
  }

  @Get()
  @ApiOperation({ summary: 'Get all blog posts' })
  @ApiResponse({ status: 200, description: 'Return all blog posts.' })
  async getPosts() {
    return this.blogPostsService.getPosts();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get all blog posts' })
  @ApiResponse({ status: 200, description: 'Return all blog posts.' })
  async getPostById(@Param('id') id: string) {
    return this.blogPostsService.getPostById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a blog post' })
  @ApiResponse({ status: 200, description: 'Blog post deleted successfully.' })
  async deletePost(@Param('id') id: string) {
    return this.blogPostsService.deletePost(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':postId')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Update an existing blog post' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        file: {
          type: 'string',
          format: 'binary',
        }
      },
    },
  })
  @ApiParam({ name: 'postId', description: 'ID of the blog post to update' })
  async updatePost(@Param('postId') postId: string, @Body() data: any, @UploadedFile() file?: Express.Multer.File,) {
    if (!postId) {
      throw new BadRequestException('Post ID is required');
    }
    return await this.blogPostsService.updatePost(postId, data, file);
  }
}
