define([
/*====="../core/Column", =====*/
/*====="../core/Cell", =====*/
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/query",
	"dojo/_base/json",
	"dojo/_base/Deferred",
	"dojo/_base/sniff",
	'dojo/_base/array',
	"dojo/DeferredList",
	"dojo/dom-class",
	"dojo/keys",
	"../core/_Module",
	"../core/util",
	"dojo/date/locale",
	'../core/model/extensions/Lazy',
	// 'dijit/focus',
	"dijit/form/TextBox",
	"dojo/NodeList-traverse"
], function(/*=====Column, Cell, =====*/declare, lang, query, json, Deferred, sniff, array, DeferredList, domClass, keys, _Module, util, locale, Lazy){

/*=====
	Cell.beginEdit = function(){
		// summary:
		//		Begin editing mode on this cell
	};

	Cell.cancelEdit = function(){
		// summary:
		//		Cancel editing mode on this cell.
	};

	Cell.applyEdit = function(){
		// summary:
		//		Apply change to store for this cell
	};

	Cell.isEditing = function(){
		// summary:
		//		Check whether this cell is in editing mode.
	};

	Cell.editor = function(){
		// summary:
		//		Get the editor in this cell if it is in editing mode.
	};

	Column.isEditable = function(){
		// summary:
		//		Check if the cells in this column are editable.
	};

	Column.isAlwaysEditing = function(){
		// summary:
		//		Check if the cells in this column are always editing.
	};

	Column.setEditable = function(editable){
		// summary:
		//		Set editable to the cells of this column
	};

	Column.editor = function(){
		// summary:
		//		Get predefined editor for cells in this column
	};

	Column.setEditor = function(dijitClass, args){
		// summary:
		//		Set editor for cells in this column
		// dijitClass:
		//		The dijit class to be used as the editor.
		// args: Edit.__EditorArgs
		//		Any args that are related to this editor.
	};

	var Edit = declare(_Module, {
		// summary:
		//		This module provides editing mode for grid cells.
		// description:
		//		This module relies on an implementation of the CellWidget module.
		//		The editing mode means there will be an editable widget appearing in the grid cell.
		//		This implementation also covers "alwaysEditing" mode for grid columns,
		//		which means all the cells in this column are always in editing mode.

		begin: function(rowId, colId){
			// summary:
			//		Begin to edit a cell with defined editor widget.
			// rowId: String
			//		The row ID of this cell
			// colId: String
			//		The column ID of this cell
			// returns:
			//		A deferred object indicating when the cell has completely changed into eidting mode.
		},

		cancel: function(rowId, colId){
			// summary:
			//		Cancel the edit. And end the editing state.
			// rowId: String
			//		The row ID of this cell
			// colId: String
			//		The column ID of this cell
			// returns:
			//		A deferred object indicating when the cell value has been successfully restored.
		},

		apply: function(rowId, colId){
			// summary:
			//		Apply the edit value to the grid store. And end the editing state.
			// rowId: String
			//		The row ID of this cell
			// colId: String
			//		The column ID of this cell
			// returns:
			//		A deferred object indicating when the change has been written back to the store.
		},

		isEditing: function(rowId, colId){
			// summary:
			//		Check whether a cell is in editing mode.
			// rowId: String
			//		The row ID of this cell
			// colId: String
			//		The column ID of this cell
			// returns:
			//		Whether the cell is in eidting mode.
		},

		setEditor: function(colId, editor, args){
			// summary:
			//		Define the editor widget to edit a column of a grid.
			//		The widget should have a get and set method to get value and set value.
			// colId: String
			//		A column ID
			// editor: Function|String
			//		Class constructor or declared name of an editor widget
			// args: __GridCellEditorArgs?
			//		Any args that are related to this editor.
		},

		onBegin: function(cell){
			// summary:
			//		Fired when a cells enters editing mode.
			// cell: gridx.core.Cell
			//		The cell object
		},

		onApply: function(cell, applySuccess){
			// summary:
			//		Fired when the change in a cell is applied to the store.
			// cell: gridx.core.Cell
			//		The cell object
			// applySuccess: Boolean
			//		Whether the change is successfully applied to the store
		},

		onCancel: function(cell){
			// summary:
			//		Fired when an editing cell is canceled.
			// cell: gridx.core.Cell
			//		The cell object
		}
	});

	Edit.__EditorArgs = declare([], {
		// summary:
		//		Arguments for the editor.

		// props: String
		//		The properties to be used when creating the dijit in a editing cell.
		//		Just like data-dojo-props for a widget.
		props: '',

		// constraints: Object
		//		If the editor widget has some constraints, it can be set here instead of in props.
		constraints: null,

		// useGridData: Boolean
		//		Whether to feed the editor with grid data or store data.
		//		This property is only effective when toEditor is not provided.
		useGridData: false,

		// valueField: String
		//		The property name of the editor used to take the data. In most cases it is "value",
		//		so editor.set('value', ...) can do the job.
		valueField: 'value',

		toEditor: function(storeData, gridData){
			// summary:
			//		By default the dijit used in an editing cell will use store value.
			//		If this default behavior can not meet the requirement (for example, store data is freely formatted date string,
			//		while the dijit is dijit.form.DateTextBox, which requires a Date object), this function can be used.
		},

		fromEditor: function(valueInEditor){
			// summary:
			//		By default when applying an editing cell, the value of the editor dijit will be retreived by get('value') and
			//		directly set back to the store. If this can not meet the requirement, this getEditorValue function can be used
			//		to get a suitable value from editor.
		}
	});

	Edit.__ColumnDefinition = declare([], {
		// summary:
		//		Column definition parameters defined by Edit.

		// editable: Boolean
		//		If true then the cells in this column will be editable. Default is false.
		editable: false,

		canEdit: function(cell){
			// summary:
			//		Decide whether a cell is editable.
			//		This makes it possible to config some cells to be uneditable in an edtibale column.
			// cell: gridx.core.Cell
			//		The cell object
			// returns:
			//		True if this cell should be editable, false if not.
		},

		// alwaysEditing: Boolean
		//		If true then the cells in this column will always be in editing mode. Default is false.
		alwaysEditing: false,

		// applyDelay: Integer
		//		When alwaysEditing, this is the timeout to apply changes when onChange event of editor is fired.
		applyDelay: 500,

		// editor: Widget Class (Function) | String
		//		Set the dijit/widget to be used when a cell is in editing mode.
		//		The default dijit is dijit.form.TextBox.
		//		This attribute can either be the declared class name of a dijit or 
		//		the class construct function of a dijit (the one that is used behide "new" keyword).
		editor: '',

		onEditorCreated: function(editor, column){
			// summary:
			//		Fired when an editor is created.
			// editor: Widget
			//		The created editor widget.
			// column: gridx.core.Column
			//		The column this cell widget is created for.
			// tags:
			//		callback
		},

		initializeEditor: function(editor, cell){
			// summary:
			//		Do special initialization for the current cell.
			//		Called every time a cell widget is applied into a cell, no matter if it is just created or reused.
			// editor: Widget
			//		The created editor widget.
		},

		uninitializeEditor: function(editor, cell){
			// summary:
			//		Called every time a cell widget is reused to a cell.
			// editor: Widget
			//		The created editor widget.
		},

		getEditorConnects: function(editor, cell){
		},

		// editorArgs: Edit.__EditorArgs
		editorArgs: null,

		customApplyEdit: function(cell, value){
			// summary:
			//		If editing a cell is not as simple as setting a value to a store field, custom logic can be put here.
			//		For example, setting multiple fields of store for a formatted cell.
			//		Can return a Deferred object if the work can not be done synchronously.
		}
	});

	return Edit;
=====*/

	// function getTypeData(col, storeData, gridData, lazyData){
		// if(col.storePattern && (col.dataType == 'date' || col.dataType == 'time')){
			// if(lazyData !== undefined){
				// return locale.parse(lazyData, col.storePattern);
			// }else{
				// return locale.parse(storeData, col.storePattern);
			// }
		// }
		// return gridData;
	// }
// 
	// function dateTimeFormatter(field, parseArgs, formatArgs, rawData){
		// var d = locale.parse(rawData[field], parseArgs);
		// return d ? locale.format(d, formatArgs) : rawData[field];
	// }
// 
	// function getEditorValueSetter(toEditor){
		// return toEditor && function(gridData, storeData, lazyData, cellWidget){
			// var editor = cellWidget.gridCellEditField,
				// cell = cellWidget.cell,
				// editorArgs = cell.column.editorArgs;
			// editor.set(editorArgs && editorArgs.valueField || 'value', toEditor(storeData, gridData, lazyData, cell, editor));
		// };
	// }
	
	function getTypeData(col, storeData, gridData, cell){
		if(col.storePattern && (col.dataType == 'date' || col.dataType == 'time')){
			// if(lang.isFunction(cell.lazyData)){
				// return locale.parse(cell.lazyData(), col.storePattern);
			// }
			return locale.parse(storeData, col.storePattern);
		}
		return gridData;
	}
	
	function dateTimeFormatter(field, parseArgs, formatArgs, rawData){
		var d = locale.parse(rawData[field], parseArgs);
		return d ? locale.format(d, formatArgs) : rawData[field];
	}
	
	function getEditorValueSetter(toEditor){
		return toEditor && function(gridData, storeData, cellWidget){
			var editor = cellWidget.gridCellEditField,
			cell = cellWidget.cell,
			editorArgs = cell.column.editorArgs;
			editor.set(editorArgs && editorArgs.valueField || 'value', toEditor(storeData, gridData, cell, editor));
		};
	}	

	return declare(_Module, {
		name: 'edit',

		forced: ['cellWidget'],
		
		modelExtensions: [Lazy],

		constructor: function(){
			this._init();
		},

		getAPIPath: function(){
			return {
				edit: this
			};
		},

		preload: function(){
			var t = this,
				g = t.grid;
			if(t.arg('lazy')){
				// lang.mixin(t.cellMixin, {
					// setLazyData: function(v){
						// return this.grid.edit.setLazyData(this.row.id, this.column.id, v);
					// },
// 					
					// lazyData: function(){
						// var v = this.grid.edit.getLazyData(this.row.id, this.column.id);
						// if(v !== undefined){
							// //console.log(v, this.rawData());
							// return v;														
						// }
						// return this.rawData();
					// }
				// });
				t.model.setLazyable(true);
			}
			g.domNode.removeAttribute('aria-readonly');
			t.connect(g, 'onCellDblClick', '_onUIBegin');
			t.connect(g.cellWidget, 'onCellWidgetCreated', '_onCellWidgetCreated');
			t.connect(g.cellWidget, 'initializeCellWidget', function(widget, cell){
				var column = cell.column;
				if(column.initializeEditor && widget.gridCellEditField){
					column.initializeEditor(widget.gridCellEditField, cell);
				}
			});
			t.connect(g.cellWidget, 'uninitializeCellWidget', function(widget, cell){
				var column = cell.column;
				if(column.uninitializeEditor && widget.gridCellEditField){
					column.uninitializeEditor(widget.gridCellEditField, cell);
				}
			});
			t.connect(g.cellWidget, 'collectCellWidgetConnects', function(widget, output){
				var column = widget.cell.column;
				if(column.getEditorConnects){
					var cnnts = column.getEditorConnects(widget, widget.cell);
					output.push.apply(output, cnnts);
				}
			});
			t.connect(g.body, 'onAfterRow', function(row){
				query('.gridxCell', row.node()).forEach(function(node){
					if(g._columnsById[node.getAttribute('colid')].editable){
						node.removeAttribute('aria-readonly');
					}
				});
			});
		},
		
		lazy: false,
		
		load: function(){
			//Must init focus after navigable cell, so that "edit" focus area will be on top of the "navigablecell" focus area.
			this._initFocus();
			this.loaded.callback();
		},

		cellMixin: {
			beginEdit: function(){
				return this.grid.edit.begin(this.row.id, this.column.id);
			},

			cancelEdit: function(){
				return this.grid.edit.cancel(this.row.id, this.column.id);
			},

			applyEdit: function(){
				return this.grid.edit.apply(this.row.id, this.column.id);
			},

			isEditing: function(){
				return this.grid.edit.isEditing(this.row.id, this.column.id);
			},

			editor: function(){
				var cw = this.grid.cellWidget.getCellWidget(this.row.id, this.column.id);
				return cw && cw.gridCellEditField;
			},

			isEditable: function(){
				var col = this.column;
				return col.isEditable() && (!col.canEdit || col.canEdit(this));
			}
		},

		columnMixin: {
			isEditable: function(){
				var col = this.grid._columnsById[this.id];
				return col.editable;
			},

			isAlwaysEditing: function(){
				return this.grid._columnsById[this.id].alwaysEditing;
			},

			setEditable: function(editable){
				this.grid._columnsById[this.id].editable = !!editable;
				return this;
			},

			editor: function(){
				return this.grid._columnsById[this.id].editor;
			},

			setEditor: function(/*dijit|short name*/dijitClass, args){
				this.grid.edit.setEditor(this.id, dijitClass, args);
				return this;
			}
		},

		//Public------------------------------------------------------------------------------
		begin: function(rowId, colId){
			var d = new Deferred(),
				t = this,
				g = t.grid;
			if(!t.isEditing(rowId, colId)){
				var row = g.row(rowId, 1),	//1 as true
					col = g._columnsById[colId];
				if(row && row.cell(colId, 1).isEditable()){
					g.cellWidget.setCellDecorator(rowId, colId, 
						t._getDecorator(colId), 
						getEditorValueSetter((col.editorArgs && col.editorArgs.toEditor) ||
							lang.partial(getTypeData, col)));
					t._record(rowId, colId);
					g.body.refreshCell(row.visualIndex(), col.index).then(function(){
						t._focusEditor(rowId, colId);
						d.callback(true);
						g.resize();
						t.onBegin(g.cell(rowId, colId, 1));
					});
				}else{
					d.callback(false);
				}
			}else{
				t._record(rowId, colId);
				t._focusEditor(rowId, colId);
				d.callback(true);
				t.onBegin(g.cell(rowId, colId, 1));
			}
			return d;
		},

		cancel: function(rowId, colId){
			var d = new Deferred(),
				t = this,
				g = t.grid,
				m = t.model,
				row = g.row(rowId, 1);
			if(row){
				var cw = g.cellWidget, 
					col = g._columnsById[colId];
				if(col){
					if(col.alwaysEditing){
						var rowCache = m.byId(rowId);
						cw = cw.getCellWidget(rowId, colId);
						cw.setValue(rowCache.data[colId], rowCache.rawData[col.field]);
						d.callback();
						t.onCancel(g.cell(rowId, colId, 1));
					}else{
						t._erase(rowId, colId);
						cw.restoreCellDecorator(rowId, colId);
						g.body.refreshCell(row.visualIndex(), col.index).then(function(){
							d.callback();
							t.onCancel(g.cell(rowId, colId, 1));
						});
					}
				}
			}else{
				d.callback();
			}
			return d;
		},

		apply: function(rowId, colId){
			var d = new Deferred(),
				t = this,
				g = t.grid,
				cell = g.cell(rowId, colId, 1);
			if(cell){
				var widget = g.cellWidget.getCellWidget(rowId, colId),
					editor = widget && widget.gridCellEditField;
				if(editor && (!lang.isFunction(editor.isValid) || editor.isValid())){
					var editorArgs = cell.column.editorArgs,
						valueField = editorArgs && editorArgs.valueField || 'value',
						v = editor.get(valueField),
						finish = function(success, e){
							if(!success){
								console.warn('Can not apply change! Error message: ', e);
							}
							t._erase(rowId, colId);
							if(cell.column.alwaysEditing){
								d.callback(success);
								t.onApply(cell, success, e, t.arg('lazy'));
							}else{
								g.cellWidget.restoreCellDecorator(rowId, colId);
								g.body.refreshCell(cell.row.visualIndex(), cell.column.index()).then(function(){
									d.callback(success);
									g.resize();
									t.onApply(cell, success, e, t.arg('lazy'));
								});
							}
						};
					try{
						if(editorArgs && editorArgs.fromEditor){
							v = editorArgs.fromEditor(v, widget.cell);
						}else if(cell.column.storePattern){
							v = locale.format(v, cell.column.storePattern);
						}
						if(lang.isFunction(cell.column.customApplyEdit)){
							Deferred.when(cell.column.customApplyEdit(cell, v), function(){
								finish(true);
							}, function(e){
								finish(false, e);
							});
						}else if(cell.rawData() === v && !t.arg('lazy')){
							finish(true);
						}else{
							// if(t.arg('lazy') && !t._inCallBackMode){
								// Deferred.when(t.setLazyData(rowId, colId, v, false), function(){
									// finish(true);
								// }, function(e){
									// finish(false, e);
								// });
							// }else{
								Deferred.when(cell.setRawData(v, t.arg('lazy')), function(){
									finish(true);
								}, function(e){
									finish(false, e);
								});									
							// }			
						    t._inCallBackMode = false;		
						}
					}catch(e){
						finish(false, e);
					}
					return d;
				}
			}
			d.callback(false);
			return d;
		},

		save: function(){
			var t = this;
			for(var id in this._lazyIds){
				console.log('id in lazy is: ' + id);
				var lazyData = t._lazyData[id];
				Deferred.when(t.grid.row(id, 1).setRawData(lazyData), function(){
					delete lazyData;
					delete t._lazyIds[id];
					console.log('save lazy edit success in rowid: ' + id);
				}, function(){
					console.log('save lazy edit fail in rowid: ' + id);
				});
			};
			console.log('let us save the data');
		},
		
		clear: function(){
			t._lazyIds = {};
			t._lazyData = {};
			t._lazyDataChangeList = {};
		},
		
		isEditing: function(rowId, colId){
			var col = this.grid._columnsById[colId];
			if(col && col.alwaysEditing){
				return true;
			}
			var widget = this.grid.cellWidget.getCellWidget(rowId, colId);
			return !!widget && !!widget.gridCellEditField;
		},

		setEditor: function(colId, editor, args){
			var col = this.grid._columnsById[colId],
				editorArgs = col.editorArgs = col.editorArgs || {};
			col.editor = editor;
			lang.mixin(editorArgs, args || {});
		},
		
		getLazyData: function(rowId, colId){
			var t = this,
				f = t.grid._columnsById[colId].field;
			
			if(t.arg('lazy')){
				r = t._lazyDataChangeList[rowId];
				if(r){
					return r[f]? r[f].list[r[f].index] : undefined;
				}
			}
			return undefined;
		},

		setLazyData: function(rowId, colId, value, isRollBack){
			var t = this,
				g = t.grid,
				cache = t.model.byId(rowId),
				lazyData = t._lazyData[rowId] || {},
				col = t.grid._columnsById[colId],
				f = col.field || colId,
				cell;

			lazyData[f] = value;
			t._lazyData[rowId] = lazyData;
			
			if(!isRollBack){
				t._addLazyDataChange(rowId, colId, value);
			}
			//t._inCallBackMode = false;
			
			for(var cid in t.grid._columnsById){
				var c = t.grid._columnsById[cid],
					success,
					e;
				if(f == c.field){
					try{
						cache.data[cid] = c.formatter? c.formatter(lazyData): value;
						cell = t.grid.cell(rowId, cid, 1); 
						success = true;
					}catch(e){
						success = false;
					}
						g.body.refreshCell(cell.row.visualIndex(), cell.column.index()).then(function(){
							t.onApply(cell, success, e, true);
						});					
				}
			}
			this._lazyIds[rowId] = 1;
		},
		
		//Events-------------------------------------------------------------------
		onBegin: function(/* cell */){},

		onApply: function(/* cell, applySuccess */){},

		onCancel: function(/* cell */){},

		//Private------------------------------------------------------------------
		_init: function(){
			this._editingCells = {};
			this._lazyIds = {};
			this._lazyData = {};
			this._lazyDataChangeList = {};
			this._inCallBackMode = false;
			
			for(var i = 0, cols = this.grid._columns, len = cols.length; i < len; ++i){
				var c = cols[i];
				if(c.storePattern && c.field && (c.dataType == 'date' || c.dataType == 'time')){
					c.gridPattern = c.gridPattern || 
						(!lang.isFunction(c.formatter) && 
							(lang.isObject(c.formatter) || 
							typeof c.formatter == 'string') && 
						c.formatter) || 
						c.storePattern;
					var pattern;
					if(lang.isString(c.storePattern)){
						pattern = c.storePattern;
						c.storePattern = {};
						c.storePattern[c.dataType + 'Pattern'] = pattern;
					}
					c.storePattern.selector = c.dataType;
					if(lang.isString(c.gridPattern)){
						pattern = c.gridPattern;
						c.gridPattern = {};
						c.gridPattern[c.dataType + 'Pattern'] = pattern;
					}
					c.gridPattern.selector = c.dataType;
					c.formatter = lang.partial(dateTimeFormatter, c.field, c.storePattern, c.gridPattern);
				}
			}
			this._initAlwaysEdit();
		},

		_initAlwaysEdit: function(){
			var t = this;
			array.forEach(t.grid._columns, function(col){
				if(col.alwaysEditing){
					col.editable = true;
					col.navigable = true;
					var needCellWidget = col.needCellWidget;
					col.needCellWidget = function(cell){
						return needCellWidget.apply(col, arguments) && cell.isEditable();
					};
					col.userDecorator = t._getDecorator(col.id);
					col.setCellValue = getEditorValueSetter((col.editorArgs && col.editorArgs.toEditor) ||
							lang.partial(getTypeData, col));
					col.decorator = function(){ return ''; };
					//FIXME: this breaks encapsulation
					col._cellWidgets = {};
					col._backupWidgets = [];
				}
			});
		},

		_getColumnEditor: function(colId){
			var editor = this.grid._columnsById[colId].editor;
			if(lang.isFunction(editor)){
				return editor.prototype.declaredClass;
			}else if(lang.isString(editor)){
				return editor;
			}else{
				return 'dijit.form.TextBox';
			}
		},

		_onCellWidgetCreated: function(widget, column){
			var t = this,
				editor = widget.gridCellEditField;
			if(editor){
				if(column.alwaysEditing){
					widget.connect(editor, 'onChange', function(){
						var rn = widget.domNode.parentNode;
						while(rn && !domClass.contains(rn, 'gridxRow')){
							rn = rn.parentNode;
						}
						if(rn){
							//TODO: is 500ms okay?
							var delay = column.editorArgs && column.editorArgs.applyDelay || 500;
							clearTimeout(editor._timeoutApply);
							editor._timeoutApply = setTimeout(function(){
								t.apply(rn.getAttribute('rowid'), column.id);
							}, delay);
						}
					});
				}
				if(column.onEditorCreated){
					column.onEditorCreated(editor, column);
				}
			}
		},

		_focusEditor: function(rowId, colId, forced){
			var cw = this.grid.cellWidget,
				func = function(){
					var widget = cw.getCellWidget(rowId, colId),
						editor = widget && widget.gridCellEditField;
					if(editor && !editor.focused && lang.isFunction(editor.focus) || forced){
						editor.focus();
					}
				};
			if(sniff('webkit')){
				func();
			}else{
				setTimeout(func, 1);
			}
		},

		_getDecorator: function(colId){
			var className = this._getColumnEditor(colId),
				p, properties,
				col = this.grid._columnsById[colId],
				editorArgs = col.editorArgs || {},
				useGridData = editorArgs.useGridData,
				constraints = editorArgs.constraints || {},
				props = editorArgs.props || '',
				pattern = col.gridPattern || col.storePattern,
				textDir = col.textDir || this.grid.textDir;
			if(pattern){
				constraints = lang.mixin({}, pattern, constraints);
			}
			constraints = json.toJson(constraints);
			constraints = constraints.substring(1, constraints.length - 1);
			if(textDir){
				props += [(props ? ', ' : ''),
					'dir: "', (this.grid.isLeftToRight() ? 'ltr' : 'rtl'),
					'", textDir: "', textDir, (constraints ? '", ' : '"')
				].join('');
			}else if(props && constraints){
				props += ', ';
			}
			return function(){
				var a =
				["<div data-dojo-type='", className, "' ",
					"data-dojo-attach-point='gridCellEditField' ",
					"class='gridxCellEditor gridxHasGridCellValue ",
					useGridData ? "" : "gridxUseStoreData",
					"' data-dojo-props='",
					props, constraints,
					"'></div>"
				].join('');
				console.log(a);
				return a;
			};
		},

		_record: function(rowId, colId){
			var cells = this._editingCells, r = cells[rowId];
			if(!r){
				r = cells[rowId] = {};
			}
			r[colId] = 1;
		},

		_erase: function(rowId, colId){
			var cells = this._editingCells, r = cells[rowId];
			if(r){
				delete r[colId];
			}
		},

		_applyAll: function(){
			var cells = this._editingCells,
				r, c;
			for(r in cells){
				for(c in cells[r]){
					this.apply(r, c);
				}
			}
		},

		_addLazyDataChange: function(rowid, columnid, value){
			var lazyData,
				t = this,
				f = t.grid._columnsById[columnid].field;
			var rowLazy = t._lazyDataChangeList[rowid];
			if(!rowLazy){
				rowLazy = t._lazyDataChangeList[rowid] = {};
			}
			
			var colLazy = rowLazy[f];
			if(!colLazy){
				colLazy = rowLazy[f] = {index: 0, list: [t.grid.cell(rowid, columnid, 1).rawData()]};
			}
			if(colLazy.list.length == 5 && colLazy.index == 4){
				colLazy.list.shift();
				colLazy.index--;
			}
			colLazy.list.splice(colLazy.index + 1, (colLazy.list.length - 1 - colLazy.index), value);
			// colLazy.index = colLazy.index == 4 ? 4 : colLazy.index + 1;
		    colLazy.index = colLazy.list.length - 1;
		},
		
		_onUIBegin: function(evt){
			if(!this.isEditing(evt.rowId, evt.columnId)){
				this._applyAll();
			}
			return this.begin(evt.rowId, evt.columnId);
		},

		//Focus-----------------------------------------------------
		_initFocus: function(){
			var t = this,
				g = t.grid,
				f = g.focus;
			if(f){
				f.registerArea({
					name: 'edit',
					priority: 1,
					scope: t,
					doFocus: t._onFocus,
					doBlur: t._doBlur,
					onFocus: t._onFocus,
					onBlur: t._onBlur,
					connects: [
						t.connect(g, 'onCellKeyDown', '_onKey'),
						t.connect(t, '_focusEditor', '_focus')
					]
				});
			}else{
				//If not keyboard support, at least single clicking on other cells should apply the changes.
				t.connect(g, 'onCellMouseDown', function(e){
					var cells = t._editingCells;
					if(!cells[e.rowId] || !cells[e.rowId][e.columnId]){
						t._applyAll();
					}
				});
			}
		},

		_onFocus: function(evt){
			var t = this;
			if(evt){
				var n = query(evt.target).closest('.gridxCell', t.grid.bodyNode)[0];
				if(n){
					var colId = n.getAttribute('colid'),
						rowId = n.parentNode.parentNode.parentNode.parentNode.getAttribute('rowid');
					//Fix #7627: in chrome evt.target will be the cell node when using CheckBox
					if(t.isEditing(rowId, colId)/* && n != evt.target*/){
						t._record(rowId, colId);
						//If in alwaysEditing mode, should be same as CellWidget, so ignore this "edit" focus area.
						return !t.grid._columnsById[colId].alwaysEditing;
					}
				}
				return false;
			}
			return t._editing;
		},

		_doBlur: function(evt, step){
			var t = this,
				g = t.grid,
				view = g.view,
				body = g.body;
			if(t._editing && step){
				var rowIndex = view.getRowInfo({
						parentId: t.model.parentId(t._focusCellRow),
						rowIndex: t.model.idToIndex(t._focusCellRow)
					}).visualIndex,
					colIndex = g._columnsById[t._focusCellCol].index,
					dir = step > 0 ? 1 : -1,
					checker = function(r, c){
						return g._columns[c].editable;
					};
				body._nextCell(rowIndex, colIndex, dir, checker).then(function(obj){
					g.focus.stopEvent(evt);
					t._applyAll();
					t._focusCellCol = g._columns[obj.c].id;
					var rowInfo = view.getRowInfo({visualIndex: obj.r});
					t._focusCellRow = t.model.indexToId(rowInfo.rowIndex, rowInfo.parentId);
					//This breaks encapsulation a little....
					body._focusCellCol = obj.c;
					body._focusCellRow = obj.r;
					t.begin(t._focusCellRow, t._focusCellCol);
				});
				return false;
			}
			return true;
		},

		_onBlur: function(){
			this._applyAll();
			return true;
		},

		_focus: function(rowId, colId){
			var t = this;
			t._editing = true;
			t._focusCellCol = colId;
			t._focusCellRow = rowId;
			t.grid.focus.focusArea('edit');
		},

		_blur: function(){
			this._editing = false;
			var focus = this.grid.focus;
			if(focus){
				if(sniff('ie')){
					setTimeout(function(){
						focus.focusArea('body');
					}, 1);
				}else{
					focus.focusArea('body');
				}
			}
		},
		
		_undoLazyData: function(rowid, columnid){
			var t = this,
				lazyRow = t._lazyDataChangeList[rowid],
				f = t.grid._columnsById[columnid].field;
			if(lazyRow && lazyRow[f]){
				if(lazyRow[f].index > 0){
					t._inCallBackMode = true;
					var index = --lazyRow[f].index;
					var value = lazyRow[f].list[index];
					t.setLazyData(rowid, columnid, value, true);
				}
			}
		},
		
		_redoLazyData: function(rowid, columnid){
			var t = this,
				lazyRow = t._lazyDataChangeList[rowid],
				f = t.grid._columnsById[columnid].field;
			if(lazyRow && lazyRow[f]){
				if(lazyRow[f].index < 4){
					t._inCallBackMode = true;
					var index = ++lazyRow[f].index;
					var value = lazyRow[f].list[index];
					t.setLazyData(rowid, columnid, value, true);
				}
			}
		},

		_onKey: function(e){
			var t = this,
				g = t.grid,
				col = g._columnsById[e.columnId];
			if(col.editable){
				var editing = t.isEditing(e.rowId, e.columnId);
				if(e.keyCode == keys.ENTER){
					if(editing){
						t.apply(e.rowId, e.columnId).then(function(success){
							if(success){
								t._blur();
							}
							if(col.alwaysEditing){
								t._focusEditor(e.rowId, e.columnId);
							}
						});
					}else if(g.focus.currentArea() == 'body'){
						//If not doing this, some dijit, like DateTextBox/TimeTextBox will show validation error.
						g.focus.stopEvent(e);
						t._onUIBegin(e);
					}
				}else if(e.keyCode == keys.ESCAPE && editing){
					t.cancel(e.rowId, e.columnId).then(lang.hitch(t, t._blur)).then(function(){
						g.focus.focusArea('body');
					});
				}else if(e.keyCode == 90 && e.ctrlKey){
					if(editing && t.arg('lazy')){
						t._undoLazyData(e.rowId, e.columnId);
						// setTimeout(function(){
						t._focusEditor(e.rowId, e.columnId, true);
						// }, 2000);
					}
				}else if(e.keyCode == 89 && e.ctrlKey){
					if(editing && t.arg('lazy')){
						t._redoLazyData(e.rowId, e.columnId);
						t._focusEditor(e.rowId, e.columnId, true);
					}
										
				}
			}
			if(t._editing && e.keyCode !== keys.TAB){
				e.stopPropagation();
			}
		}
	});
});
