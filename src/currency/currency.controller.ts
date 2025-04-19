import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { Currency } from './../typeorm/entities/Currency';
import { CreateCurrencyDto, ToggleCurrencyDto } from './dtos/CurrencyDto';
import { User } from 'src/typeorm/entities/User';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { Request } from 'express';

@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createCurrency(
    @Body() data: CreateCurrencyDto,
    @Req() req: Request,
  ): Promise<Currency> {
    return this.currencyService.createCurrency(data, req.user as User);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAllCurrencies(@Req() req: Request): Promise<Currency[]> {
    const currencies = await this.currencyService.findAllCurrencies(
      req.user as User,
    );
    return currencies;
  }

  // @Get(':id')
  // async findCurrencyById(@Param('id') id: string): Promise<Currency> {
  //   return this.currencyService.findCurrencyById(id);
  // }

  //   @Put(':id')
  //   async updateCurrency(
  //     @Param('id') id: string,
  //     @Body() data: Partial<Currency>,
  //   ): Promise<Currency> {
  //     return this.currencyService.updateCurrency(id, data);
  //   }
  @Put('active/:id')
  @UseGuards(JwtAuthGuard)
  async updateCurrencyActiveness(
    @Param('id') id: string,
    @Body() data: ToggleCurrencyDto,
    @Req() req: Request,
  ): Promise<Currency> {
    return this.currencyService.toggleCurrencyActiveness(
      req.user as User,
      id,
      data,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteCurrency(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<void> {
    return this.currencyService.deleteCurrency(id, req.user as User);
  }
}
