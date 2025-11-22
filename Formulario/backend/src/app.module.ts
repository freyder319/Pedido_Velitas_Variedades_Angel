import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Pedido } from './entities/pedido.entity';
import { Vela } from './entities/vela.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'velitas_db',
      entities: [Pedido, Vela],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Pedido, Vela]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
