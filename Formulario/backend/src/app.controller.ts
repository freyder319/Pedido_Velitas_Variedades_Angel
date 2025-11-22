import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import type { CrearPedidoDto } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('pedidos')
  crearPedido(@Body() body: CrearPedidoDto) {
    return this.appService.crearPedido(body);
  }

  @Get('clientes/telefono/:telefono')
  buscarPorTelefono(@Param('telefono') telefono: string) {
    return this.appService.buscarPorTelefono(telefono);
  }

  // Ruta "oculta" de admin para ver pedidos
  // Ejemplo: GET /admin/pedidos?clave=514022&telefono=3001234567
  @Get('admin/pedidos')
  async obtenerPedidosAdmin(
    @Query('clave') clave: string,
    @Query('telefono') telefono?: string,
  ) {
    if (clave !== '514022') {
      return { autorizado: false, mensaje: 'Clave incorrecta' };
    }

    const pedidos = await this.appService.obtenerPedidos(telefono);
    return { autorizado: true, pedidos };
  }

  @Post('admin/pedidos/:id/confirmar-paquete')
  async confirmarPaquete(
    @Param('id') id: string,
    @Body('clave') clave: string,
    @Body('indexPaquete') indexPaquete: number,
  ) {
    if (clave !== '514022') {
      return { ok: false, mensaje: 'Clave incorrecta' };
    }

    const resultado = await this.appService.confirmarPaquete(
      Number(id),
      Number(indexPaquete),
    );

    return resultado;
  }
}