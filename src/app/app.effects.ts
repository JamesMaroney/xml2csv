import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {filter, mergeMap, withLatestFrom} from 'rxjs/operators';
import {dataPointsLoaded, filesAdded, generateSheet, generateSheetComplete, generateSheetStatus} from "./app.actions";
import {AppState, DataPoint, DataPointMap} from "./app.reducer";
import { Store } from "@ngrx/store";
import {getEnabledDataPoints, getFilterByDataPoint, getFilterValues, getHasLoadedDataPoints} from "./app.selectors";
import {ExportService} from "./export.service";
import {noop} from "rxjs";


function isParseError(parsedDocument: Document): boolean {
    // parser and parsererrorNS could be cached on startup for efficiency
    var parser = new DOMParser(),
        errorneousParse = parser.parseFromString('<', 'application/xml'),
        parsererrorNS = errorneousParse.getElementsByTagName("parsererror")[0].namespaceURI || '';

    if (parsererrorNS === 'http://www.w3.org/1999/xhtml') {
        // In PhantomJS the parseerror element doesn't seem to have a special namespace, so we are just guessing here :(
        return parsedDocument.getElementsByTagName("parsererror").length > 0;
    }

    return parsedDocument.getElementsByTagNameNS(parsererrorNS, 'parsererror').length > 0;
}

export const fileReaderPromise = (file: File): Promise<Document> => {
  return new Promise( (resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(''+reader.result, "application/xml");

      if(isParseError(dom)) {
        alert(`Failed to read ${file.name}! XML parse error.`);
        reject('xmlparseerror')
      } else {
        resolve(dom)
      }
    };
    reader.onabort = () => reject('aborted');
    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  })
}

export const extractDataPoints = (document: Document): DataPointMap => {
  // build DataPoints mapping from imported document
  return Object.fromEntries(
    Array.from(document?.firstChild?.childNodes || [])
      .flatMap(node => {
        // build DataPoints mapping based on attributes
        const dataPoints: [string, DataPoint][] =
          // @ts-ignore: attributes does exist
          Array.from((node.attributes as NamedNodeMap) || [])
            .map(attr => {
              const id = `${node.nodeName}@${attr.localName}`
              return [
                id,
                {
                  id,
                  displayName: `${node.nodeName} ${attr.localName}`,
                  nodeName: node.nodeName,
                  attribute: attr.localName,
                  enabled: false
                }]
            })
        // add cdata/textContent to DataPoints if needed
        if (node.textContent?.trim()) {
          const id = `${node.nodeName}>cdata`
          dataPoints.unshift( [
            id,
            {
              id,
              displayName: node.nodeName,
              nodeName: node.nodeName,
              enabled: false
            }]
          )
        }
        return dataPoints
      })
  )
}

const getDataPointValue = (doc: Document, dataPoint: DataPoint) => {
  if(dataPoint.rootNode) return doc.getRootNode()?.childNodes[0]?.nodeName

  const node = doc?.getElementsByTagName(dataPoint.nodeName!)[0]
  return (node && ( dataPoint.attribute ? node.getAttribute(dataPoint.attribute) : node.textContent ) || '')
}

// const getRootNodeName = (doc: Document) => {
// }

@Injectable()
export class AppEffects {

  loadDataPoints$ = createEffect(() => this.actions$.pipe(
    ofType(filesAdded),
    withLatestFrom(this.store.select(getHasLoadedDataPoints)),
    mergeMap( async ([{files}]) => {
      console.log('>>>>> loadDataPoints$')
      const document = await fileReaderPromise(files[0])
      const dataPoints = Object.values(extractDataPoints(document))
      return dataPointsLoaded({dataPoints})
    }),
  ));

  generateSheet$ = createEffect(() => this.actions$.pipe(
    ofType(generateSheet),
    withLatestFrom(
      this.store.select(getEnabledDataPoints),
      this.store.select(getFilterByDataPoint),
      this.store.select(getFilterValues)
    ),
    mergeMap( ([, enabledDataPoints, filterByDataPointId, filterValues]) => {
      setTimeout(() => {
        this.store.dispatch(generateSheetStatus({message: 'Preparing to Read Files'}))
        const files = Object.values((window as any)._files)
        let files_read = 0
        const total_files = files.length
        const start_time = Date.now()
        const matched_filter_items = new Set()
        const readers = files.map(f =>
          fileReaderPromise(f as File).then(doc => {
            files_read++;
            if(files_read % 100 === 0) {
              const elapsed_time = Date.now() - start_time
              const estimated_completion_time = new Date(start_time + ((elapsed_time * total_files) / files_read))
              const message = `Read ${files_read.toLocaleString()} of ${total_files.toLocaleString()} Files. ETA: ${estimated_completion_time.toLocaleTimeString()}`
              this.store.dispatch(generateSheetStatus({message}))
              console.log(message)
            }
            const dps = enabledDataPoints.map(dp => getDataPointValue(doc, dp))
            if( !filterByDataPointId ) return dps
            const filterByDataPoint = enabledDataPoints.find(dp => dp.id === filterByDataPointId)
            const filterValue = getDataPointValue(doc, filterByDataPoint!)
            if( filterValues?.has(filterValue) ) {
              matched_filter_items.add(filterValue)
              return dps
            }
            return false
          })
        )
        Promise.all(readers).then( rows => {
          this.store.dispatch(generateSheetStatus({message: 'Filtering Records'}))
          rows = rows.filter(Boolean)
          rows.unshift(enabledDataPoints.map(dp => dp.displayName))
          this.store.dispatch(generateSheetStatus({message: 'Preparing Spreadsheet'}))
          this.exportService.exportArrayToExcel(rows as string[][], 'export')
          // dispatch complete event
          this.store.dispatch(generateSheetStatus({message: 'Complete!'}))
          const unmatchedFilterValues = [...(filterValues||[])].filter(v => !matched_filter_items.has(v))
          this.store.dispatch(generateSheetComplete({report: {unmatchedFilterValues}}))
        })
      }, 10)
      return [noop()]
    })
  ), {dispatch: false})

  constructor(
    private actions$: Actions,
    private store: Store<AppState>,
    private exportService: ExportService
  ) {}
}
