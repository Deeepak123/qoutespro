import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
    name: 'searchFilter'
})
export class SearchFilter implements PipeTransform {
    transform(value: any, args?: any): any {
        if (!args) {
            return value;
        }
        return value.filter((item: any) => {
            let rVal = (item.authorName.toUpperCase().includes(args.toUpperCase()));
            return rVal;
        })
    }
}