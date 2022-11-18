const icon =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAI0AAAB0CAYAAAC4w7F0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDcuMS1jMDAwIDc5LmRhYmFjYmIsIDIwMjEvMDQvMTQtMDA6Mzk6NDQgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCAyMy4wIChNYWNpbnRvc2gpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjY5RTRFN0I0RjQzNTExRUNCNDUwOUU1RUQwMTE5QjBEIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjY5RTRFN0I1RjQzNTExRUNCNDUwOUU1RUQwMTE5QjBEIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NjlFNEU3QjJGNDM1MTFFQ0I0NTA5RTVFRDAxMTlCMEQiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NjlFNEU3QjNGNDM1MTFFQ0I0NTA5RTVFRDAxMTlCMEQiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6f6hbuAAAZkklEQVR42uxd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';
export default icon;