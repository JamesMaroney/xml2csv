import {
  ChangeDetectorRef,
  Component,
  ContentChild,
  Directive, ElementRef,
  EventEmitter,
  Input, OnChanges,
  Output,
  TemplateRef,
  TrackByFunction, ViewChild
} from '@angular/core';

@Directive({
  selector: '[itemTemplate]'
})
export class ItemTemplateDirective {
  constructor(public templateRef: TemplateRef<unknown>) {}
}

@Component({
  selector: 'app-selector',
  templateUrl: './selector.component.html',
  styleUrls: ['./selector.component.less']
})
export class SelectorComponent<T> implements OnChanges {

  @Output() public changeSelection = new EventEmitter<T[]>()
  @Output() public addItem = new EventEmitter<string>()
  @Input() public items: T[] | null = []
  @Input() public label: string = 'items'
  @Input() public itemTrackBy!: (i: number, item: T) => string
  @Input() public itemLabel!: (item: T) => string
  @Input() public isItemSelected!: (item: T) => boolean
  public selectedItems: T[] = []
  public filterTerm: string = ''
  public exactFilterMatch: boolean = false

  @ViewChild("filterInput") filterInput!: ElementRef;

  constructor(private changeDetectorRef: ChangeDetectorRef) {}

  public get filteredItems() {
    const term = this.filterTerm.toLowerCase();
    return (this.items || []).filter(i => this.itemLabel(i).toLowerCase().indexOf(term) > -1)
  }

  public ngOnChanges() {
    this.selectedItems = (this.items || []).filter(this.isItemSelected)
  }

  onFilterChange(){
    this.filterTerm = this.filterInput.nativeElement.value;
    this.exactFilterMatch = (this.items || []).some((i => this.itemLabel(i) === this.filterTerm))
    this.changeDetectorRef.markForCheck();
  }

  onClickAddItem(){
    this.addItem.emit(this.filterTerm)
    requestAnimationFrame(() => this.onFilterChange())
  }

  includeAll() {
    this.changeSelection.emit(this.items || []);
  }

  excludeAll() {
    this.changeSelection.emit([]);
  }

  toggleItem(item: T, ev: any){
    this.changeSelection.emit(
      ev.target.checked
        ? this.selectedItems.concat([item])
        : this.selectedItems.filter(i => i !== item)
    )
  }
}
