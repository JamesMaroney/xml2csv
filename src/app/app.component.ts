import {Component, ElementRef, ViewChild} from '@angular/core';
import {Store} from "@ngrx/store";
import {Observable, of} from "rxjs";
import {
  filesAdded,
  setEnabledDataPoints,
  setEnabledFiles,
  setFilterBy,
  setFilterValues,
  generateSheet, filesAdding, addDataPointFromString
} from "./app.actions";
import {AppState, DataPoint, XMLSource} from "./app.reducer";
import {ExportService} from "./export.service";
import {
  getAllFiles,
  getEnabledDataPoints, getFilesUploading, getFilterByDataPoint, getFilterValues,
  getHasEnabledDataPoints,
  getHasLoadedDataPoints,
  getLoadedDataPoints, getSheetGenerating, getSheetGeneratingStatus, getSheetGenerationReport
} from "./app.selectors";
import {extractDataPoints, fileReaderPromise} from "./app.effects";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  public files$: Observable<File[]> | null
  public loadedDataPoints$: Observable<DataPoint[]> | null
  public hasLoadedDataPoints$: Observable<boolean> | null
  public enabledDataPoints$: Observable<DataPoint[]> | null
  public hasEnabledDataPoints$: Observable<boolean> | null
  public filterByDataPoint$: Observable<string | null> | null
  public filterValues$: Observable<Set<string> | null> | null
  public sheetGenerating$: Observable<boolean> | null
  public filesUploading$: Observable<boolean> | null
  public sheetGeneratingStatus$: Observable<string | null> | null
  public sheetGenerationReport$: Observable<any> | null

  @ViewChild("fileInput") fileInput: ElementRef | null = null;
  @ViewChild("filterInput") filterInput: ElementRef | null = null;
  @ViewChild("importedTable") importedTable: ElementRef | null = null;

  constructor(
    private store: Store<{app: AppState}>,
    private exportService: ExportService
  ) {

    this.files$ = store.select(getAllFiles);
    this.loadedDataPoints$ = store.select(getLoadedDataPoints);
    this.hasLoadedDataPoints$ = store.select(getHasLoadedDataPoints);
    this.enabledDataPoints$ = store.select(getEnabledDataPoints);
    this.hasEnabledDataPoints$ = store.select(getHasEnabledDataPoints);
    this.filterByDataPoint$ = store.select(getFilterByDataPoint);
    this.filterValues$ = store.select(getFilterValues);
    this.sheetGenerating$ = store.select(getSheetGenerating);
    this.filesUploading$ = store.select(getFilesUploading);
    this.sheetGeneratingStatus$ = store.select(getSheetGeneratingStatus);
    this.sheetGenerationReport$ = store.select(getSheetGenerationReport);
  }

  public filesSelected(ev: Event){
    const files = Array.from((ev.target as HTMLInputElement).files || []);
    if ( !files ) return;
    requestAnimationFrame(() => this.store.dispatch(filesAdded({files})));
  }

  public selectFile(){
    this.store.dispatch(filesAdding());
    this.fileInput?.nativeElement.focus();
    this.fileInput?.nativeElement.click();
  }

  public trackByFilename(i: number, file: File): string {
    return file.name;
  }

  public trackByStringValue(i: number, val: string): string {
    return val;
  }

  // public getFilename(file: File): string {
  //   return file.name;
  // }
  //
  // public isFileEnabled(file: File): boolean {
  //   return true; //file.enabled;
  // }
  //
  // public onChangeFileSelection(files: File[]){
  //   this.store.dispatch(setEnabledFiles({ files }))
  // }

  public trackByDataPoint(i: number, dp: DataPoint){
    return dp.id;
  }

  public getDataPointName(dp: DataPoint): string {
    return dp.displayName;
  }

  public isDataPointEnabled(dp: DataPoint): boolean {
    return dp.enabled;
  }

  public onChangeDataPointSelection(dataPoints: DataPoint[]){
    this.store.dispatch(setEnabledDataPoints({ dataPoints }))
  }

  public onAddDataPoint(label: string){
    this.store.dispatch(addDataPointFromString({label}))
  }

  public onChangeFilterBy(ev: any){
    this.store.dispatch(setFilterBy({ dataPointId: ev.target.value ?? null }))
  }

  public onPasteFilters(ev: any){
    const target = ev.target;
    requestAnimationFrame(() => {
      const values = target.value.split(/[\s,]/)
      if(this.filterInput) {
        this.filterInput.nativeElement.value = ''
        this.filterInput.nativeElement.blur()
      }
      this.store.dispatch(setFilterValues({values}))
    })
  }

  public generateSheet() {
    this.store.dispatch(generateSheet())
  }
}
