import { Pipe, PipeTransform } from '@angular/core';
import { multiply, divide } from 'mathjs';

@Pipe({ name: 'formatNumber' })
export class FormatNumberPipe implements PipeTransform {
  transform(value: number, length = 4) {
    const numberLength = Math.pow(10, length);
    return divide(Math.round(multiply(value, numberLength)), numberLength);
  }
}
