import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'projects' })
export class ProjectsPipe implements PipeTransform {
	transform(value: string[][]): string {
		let result = [];
		for(let i = 0; i < value.length; i++) {
			let names: string[] = value[i];
			result.push(names.join(" / "));
		}
		return result.join(", ");
	}
}