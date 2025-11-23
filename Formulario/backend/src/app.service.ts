import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido } from './entities/pedido.entity';
import { Vela } from './entities/vela.entity';

export interface CrearPedidoDto {
  nombreCompleto: string;
  telefono: string;
  paquetes: string[][];
  tiposPaquetes?: (string | number | null)[];
  coloresPaquetes?: (string | null)[];
}

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepo: Repository<Pedido>,
    @InjectRepository(Vela)
    private readonly velaRepo: Repository<Vela>,
  ) {}

  async crearPedido(dto: CrearPedidoDto) {
    const nuevasVelas: Vela[] = [];

    dto.paquetes.forEach((paquete, indexPaquete) => {
      const tipoVelaPaquete = dto.tiposPaquetes?.[indexPaquete] ?? null;
      const colorEscarchaPaquete = dto.coloresPaquetes?.[indexPaquete] ?? null;

      const tipoVelaString =
        tipoVelaPaquete !== null && tipoVelaPaquete !== undefined
          ? String(tipoVelaPaquete)
          : null;

      paquete.forEach((texto) => {
        if (!texto.trim()) {
          return;
        }

        const vela = new Vela();
        vela.texto = texto;
        vela.tipoVela = tipoVelaString;
        vela.colorEscarcha =
          tipoVelaString === '3' && colorEscarchaPaquete
            ? colorEscarchaPaquete
            : null;
        nuevasVelas.push(vela);
      });
    });

    if (nuevasVelas.length === 0) {
      return {
        mensaje: 'No se recibieron velas para guardar',
      };
    }

    // Buscar si ya existe un pedido con ese teléfono
    let pedido = await this.pedidoRepo.findOne({
      where: { telefono: dto.telefono },
      order: { id: 'DESC' },
    });

    // Si no existe, crearlo
    if (!pedido) {
      pedido = this.pedidoRepo.create({
        nombreCompleto: dto.nombreCompleto,
        telefono: dto.telefono,
      });
      pedido = await this.pedidoRepo.save(pedido);
    }

    // Crear nuevas velas asociadas a ese pedido (no se repite el pedido)
    nuevasVelas.forEach((vela) => {
      vela.pedido = pedido;
    });

    await this.velaRepo.save(nuevasVelas);

    return {
      mensaje: 'Pedido actualizado/creado correctamente en la base de datos',
      pedidoId: pedido.id,
    };
  }

  async buscarPorTelefono(telefono: string) {
    const existente = await this.pedidoRepo.findOne({
      where: { telefono },
      order: { id: 'DESC' },
    });

    if (!existente) {
      return { existe: false };
    }

    return {
      existe: true,
      nombreCompleto: existente.nombreCompleto,
      ultimoPedidoId: existente.id,
    };
  }

  async obtenerPedidos(filtroTelefono?: string) {
    const where = filtroTelefono ? { telefono: filtroTelefono } : {};

    const pedidos = await this.pedidoRepo.find({
      where,
      relations: ['velas'],
      order: { id: 'DESC' },
    });

    return pedidos;
  }

  async confirmarPaquete(pedidoId: number, indexPaquete: number) {
    const pedido = await this.pedidoRepo.findOne({
      where: { id: pedidoId },
      relations: ['velas'],
    });

    if (!pedido) {
      return { ok: false, mensaje: 'Pedido no encontrado' };
    }

    const todasVelas = pedido.velas || [];
    const start = indexPaquete * 10;
    const end = start + 10;
    const velasPaquete = todasVelas.slice(start, end);

    if (velasPaquete.length === 0) {
      return { ok: false, mensaje: 'No hay velas para ese paquete' };
    }

    velasPaquete.forEach((vela) => {
      vela.confirmado = true;
    });

    await this.velaRepo.save(velasPaquete);

    return { ok: true };
  }
}