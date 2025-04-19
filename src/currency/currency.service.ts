import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Currency } from './../typeorm/entities/Currency';
import { CreateCurrencyDto, ToggleCurrencyDto } from './dtos/CurrencyDto';
import { User, UserRole } from 'src/typeorm/entities/User';

@Injectable()
export class CurrencyService {
  constructor(
    @InjectRepository(Currency)
    private readonly currencyRepository: Repository<Currency>,
  ) {}

  async createCurrency(data: CreateCurrencyDto, user: User): Promise<Currency> {
    if (user.role !== UserRole.SUPERADMIN) {
      throw new ForbiddenException('Only superadmins can create currencies');
    }

    const currency = this.currencyRepository.create({
      ...data,
      decimals: 2,
      author: user,
    });
    return this.currencyRepository.save(currency);
  }

  async findAllCurrencies(user: User): Promise<Currency[]> {
    let q = {};
    if (user.role !== UserRole.SUPERADMIN && user.role !== UserRole.ADMIN) {
      q = { inactive_at: IsNull() };
    }
    return await this.currencyRepository.find({
      where: q,
    });
  }

  async findCurrencyById(id: string): Promise<Currency> {
    const currency = await this.currencyRepository.findOne({ where: { id } });
    if (!currency) {
      throw new NotFoundException(`Currency with ID "${id}" not found`);
    }
    return currency;
  }

  //   async updateCurrency(id: string, data: Partial<Currency>): Promise<Currency> {
  //     await this.findCurrencyById(id); // Ensure the currency exists
  //     await this.currencyRepository.update(id, {data});
  //     return this.findCurrencyById(id);
  //   }
  async toggleCurrencyActiveness(
    user: User,
    id: string,
    data: ToggleCurrencyDto,
  ): Promise<Currency> {
    if (user.role !== UserRole.SUPERADMIN) {
      throw new ForbiddenException('Only superadmins can create currencies');
    }

    // Find the currency to ensure it exists
    const currency = await this.findCurrencyById(id);

    // Check the value of `inactiveNow` to decide whether to deactivate or activate
    if (data.inactiveNow === true) {
      // If inactiveNow is true, deactivate the currency by setting inactiveAt to the current timestamp
      if (currency.inactive_at !== null) {
        throw new ConflictException({
          description: `Currency with ID "${id}" is already inactive.`,
        });
      }
      await this.currencyRepository.update(id, { inactive_at: new Date() });
    } else {
      // If inactiveNow is false, activate the currency by setting inactiveAt to null
      if (currency.inactive_at === null) {
        throw new ConflictException({
          description: `Currency with ID "${id}" is already active.`,
        });
      }
      await this.currencyRepository.update(id, { inactive_at: null });
    }

    // Return the updated currency
    return this.findCurrencyById(id);
  }

  async deleteCurrency(id: string, user: User): Promise<void> {
    if (user.role !== UserRole.SUPERADMIN) {
      throw new ForbiddenException('Only superadmins can delete currencies');
    }
    if (!(await this.findCurrencyById(id)))
      throw new NotFoundException('currency not found'); // Ensure the currency exists
    await this.currencyRepository.delete(id).catch((err) => {
      if (err.code === '23503') {
        throw new ForbiddenException(
          'deleting this currency has been restricted due to it being posssibly linked to a transactionm, a price or some other entity',
        );
      }
    });
  }
}
