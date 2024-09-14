import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from "./auth/auth.module";
import { ProductsModule } from "./products/products.module";
import { BannersModule } from "./banners/banners.module";
import { BlogPostsModule } from "./blog-posts/blog-posts.module";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    AuthModule,
    BannersModule,
    ProductsModule,
    BlogPostsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
