import {createFeatureSelector, createSelector} from "@ngrx/store";
import {AppState} from "./app.reducer";

export const getAppState = createFeatureSelector<AppState>('app')
// @ts-ignore
export const getAllFiles = createSelector(getAppState, s => Object.values(window._files as File[]))
export const getHasFiles = createSelector(getAllFiles, files => files?.length > 0)

export const getLoadedDataPoints = createSelector(getAppState, s =>
  Object.values(s.dataPoints)
)
export const getHasLoadedDataPoints = createSelector(
  getLoadedDataPoints,
  getAllFiles,
  (dataPoints, files) => files.length > 0 && dataPoints.length > 0
)
export const getEnabledDataPoints = createSelector(getLoadedDataPoints, dataPoints =>
  dataPoints.filter(dp => dp.enabled)
)
export const getHasEnabledDataPoints = createSelector(
  getHasLoadedDataPoints,
  getEnabledDataPoints,
  (hasDataPoints, enabledDataPoints) => hasDataPoints && enabledDataPoints.length > 0
)
export const getFilterByDataPoint = createSelector(getAppState, s => s.filterBy)
export const getFilterValues = createSelector(getAppState, s => s.filterValues)

export const getSheetGenerating = createSelector(getAppState, s => s.sheetGenerating)
export const getSheetGeneratingStatus = createSelector(getAppState, s => s.sheetGeneratingStatus)
export const getSheetGenerationReport = createSelector(getAppState, s => s.sheetGenerationReport)
export const getFilesUploading = createSelector(getAppState, s => s.filesUploading)
// const getTableHeader = createSelector(
//   getDataPoints,
//   (dataPoints) => ['filename', ...dataPoints.map(dp => dp.displayName)]
// )
// const _processTableData = (dataPoints: DataPoint[], file: XMLSource) => [
//       file.filename,
//       ...dataPoints.map( dataPoint => {
//         const node = file.document?.getElementsByTagName(dataPoint.nodeName)[0]
//         return (node && ( dataPoint.attribute ? node.getAttribute(dataPoint.attribute) : node.textContent ) || '')
//       })
//     ]
// const getAllTableData = createSelector(
//   getDataPoints,
//   getAllFiles,
//   (dataPoints, files) => {
//     return files.map( file => _processTableData(dataPoints, file))
//   }
// )
// const getTableDataSlice = (skip: number, take: number) => createSelector(
//   getDataPoints,
//   getFilesSlice(skip, take),
//   (dataPoints, files) => {
//     return files.map( file => _processTableData(dataPoints, file))
//   }
// )
