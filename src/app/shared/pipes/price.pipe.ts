import { Pipe, PipeTransform } from '@angular/core';
import { fmtPrice } from '../utils/format';

@Pipe({ name: 'price', standalone: true })
export class PricePipe implements PipeTransform {
  transform(value: number): string {
    return fmtPrice(value);
  }
}