import {createAction, props} from '@ngrx/store';
import {DataPoint} from "./app.reducer";

// export const noop = createAction('[app] NOOP');

export const filesAdding = createAction('[app] Files Adding');
// @ts-ignore: FileSystemFileHandle is real, trust me
export const filesAdded = createAction('[app] Files Added', props<{files: FileSystemFileHandle[]}>());
export const dataPointsLoaded = createAction('[app] DataPoints Loaded', props<{dataPoints: DataPoint[]}>());
export const addDataPointFromString = createAction('[app] Add DataPoint from String', props<{label: string}>());
export const setEnabledDataPoints = createAction('[app] Set Enabled DataPoints', props<{dataPoints: DataPoint[]}>());
export const setFilterBy = createAction('[app] Set Filter By', props<{dataPointId: string | null}>());
export const setFilterValues = createAction('[app] Set Filter Values', props<{values: string[] | null}>());
export const generateSheet = createAction('[app] Generate Sheet');
export const generateSheetComplete = createAction('[app] Generate Sheet Complete', props<{report: {unmatchedFilterValues: string[]}}>());
export const generateSheetStatus = createAction('[app] Generate Sheet Status', props<{message: string}>());
