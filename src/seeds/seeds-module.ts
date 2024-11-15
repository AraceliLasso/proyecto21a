import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { seedUsuarios } from './usuario.seed';
// import { seedProducts } from './products/product.seed';
// import { seedCategories } from './categories/category.seed';
@Module({})
export class SeedModule {
    constructor(private dataSource: DataSource) {}

    async onModuleInit() {
        // await seedCategories(this.dataSource);
        // await seedProducts(this.dataSource); 
        await seedUsuarios(this.dataSource); 
    }
}
