import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'duration' })
export class DurationPipe implements PipeTransform {
	transform(value: number): string {
		let pad = function(n: number, width: number, z = "0") {
			let ns = n + '';
			return ns.length >= width ? ns : new Array(width - ns.length + 1).join(z) + n;
		};
		let s = Math.floor(value / 1000);
		let m = Math.floor(s / 60);
		s -= m * 60;
		let h = Math.floor(m / 60);
		m -= h * 60;
		return "" + pad(h, 2) + ":" + pad(m, 2) + ":" + pad(s, 2);
	}
}