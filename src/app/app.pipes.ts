
import { Pipe, PipeTransform } from '@angular/core';
import {DataPoint, XMLSource} from "./app.reducer";

@Pipe({name: 'getValue'})
export class GetValuePipe implements PipeTransform {
  transform(file: File, dataPoint: DataPoint): string{
    // const node = file.document?.getElementsByTagName(dataPoint.nodeName)[0]
    // return (node && ( dataPoint.attribute ? node.getAttribute(dataPoint.attribute) : node.textContent ) || '')
    return '';
  }
}
