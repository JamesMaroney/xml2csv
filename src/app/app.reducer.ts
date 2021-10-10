import { createReducer, on } from '@ngrx/store';
import {
  addDataPointFromString,
  dataPointsLoaded,
  filesAdded, filesAdding, generateSheet, generateSheetComplete, generateSheetStatus,
  setEnabledDataPoints,
  setFilterBy, setFilterValues
} from './app.actions';

export interface XMLSource {
  filename: string
  loading: boolean
  document?: Document
  enabled: boolean
  file: File
}

export interface DataPoint {
  id: string
  displayName: string
  nodeName?: string
  attribute?: string
  enabled: boolean
  rootNode?: boolean
}
export type DataPointMap = { [key: string]: DataPoint }

export interface FileBucket {
  length: number
  version: number
}

export interface AppState {
  files: FileBucket
  dataPoints: DataPoint[]
  filterBy: string | null
  filterValues: Set<string> | null
  sheetGenerating: boolean
  sheetGeneratingStatus: string | null
  sheetGenerationReport: { unmatchedFilterValues: string[] } | null
  filesUploading: boolean
}

export const initialState: AppState = {
  files: {
    length: 0,
    version: 0
  },
  dataPoints: [{
    id: '<root>',
    displayName: 'IC',
    rootNode: true,
    enabled: true
  }],
  filterBy: null,
  filterValues: null,
  sheetGenerating: false,
  sheetGeneratingStatus: null,
  sheetGenerationReport: null,
  filesUploading: false
}

// @ts-ignore
const _files: any = window._files = {};

const _appReducer = createReducer(
  initialState,

  on(filesAdding, (state) => {
    return {
      ...state,
      filesUploading: true
    }
  }),

  on(filesAdded, (state, {files}) => {
    console.log('>>>>> filesAdded() handled');
    files.forEach((file: File) => _files[`${file.name}||${file.size}`] = file)
    console.log('>>>>> filesAdded() new state built');
    return {
      ...state,
      filesUploading: false,
      files: {
        length: Object.keys(_files).length,
        version: state.files.version+1
      }
    };
  }),

  on(dataPointsLoaded, (state, { dataPoints }) => {
    return {
      ...state,
      dataPoints: [...state.dataPoints, ...dataPoints]
    }
  }),

  on(setEnabledDataPoints, (state, { dataPoints }) => {
    return {
      ...state,
      dataPoints: state.dataPoints.map((dp) => ({ ...dp, enabled: dataPoints.includes(dp)}))
    };
  }),

  on(addDataPointFromString, (state, { label }) => {
    const id = `${label}>cdata`
    return {
      ...state,
      dataPoints: [...state.dataPoints,  {
              id,
              displayName: label,
              nodeName: label,
              enabled: true
            }]
    }
  }),

  on(setFilterBy, (state, { dataPointId }) => {
    return {
      ...state,
      filterBy: dataPointId
    }
  }),

  on(setFilterValues, (state, { values }) => {
    console.log('>>>>> setFilterValues handled', {values})
    return {
      ...state,
      filterValues: new Set(values)
    }
  }),

  on(generateSheet, (state) => {
    return {
      ...state,
      sheetGenerating: true
    }
  }),

  on(generateSheetComplete, (state, {report}) => {
    return {
      ...state,
      sheetGenerating: false,
      sheetGenerationReport: report
    }
  }),

  on(generateSheetStatus, (state, { message }) => {
    return {
      ...state,
      sheetGeneratingStatus: message
    }
  }),
);

export function appReducer(state: any, action: any) {
  return _appReducer(state, action);
}
