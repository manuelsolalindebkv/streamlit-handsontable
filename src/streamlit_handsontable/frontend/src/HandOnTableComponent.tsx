import React, { useCallback } from "react"
import { HotColumn, HotTable } from "@handsontable/react"
import "handsontable/dist/handsontable.full.css"
import { useEffect } from "react"
import { useRef } from "react"
// import Handsontable from 'handsontable';
import { registerAllModules } from 'handsontable/registry';



interface TableProps {
  data: {
    columns: string[]
    index: number[]
    data: any[][]
  }
  df_key: string
  table_version: number
  // Dict[str, dict]
  columns_config: { [key: string]: { [key: string]: any } }
  reaction: any
  height: number
  afterChange: (data: any) => void
  afterRowAdd: (data: any) => void
  afterRowDelete: (data: any) => void
  afterReaction: () => void
  onReload: () => void
  hide_columns: string[]
}

// register Handsontable's modules
registerAllModules();

const HandsontableComponent: React.FC<TableProps> = ({
  data: initial_data,
  df_key,
  table_version,
  columns_config,
  reaction,
  height,
  afterChange: onAfterChange,
  afterRowAdd: onAfterRowAdd,
  afterRowDelete: onAfterRowDelete,
  afterReaction: onAfterReaction,
  onReload,
  hide_columns,
}) => {
  const { columns, data: initial_tabledata } = initial_data
  const { reaction_id } = reaction

  //updata columns config for all columns
  let hotcolumn_settings: { [key: string]: any }[] = []
  columns.forEach((col,index) => {
    let column_dict: { [key: string]: any } = {}
    if (columns_config.hasOwnProperty(col)) {
      column_dict = columns_config[col]
    } 
    column_dict['data'] = index
    hotcolumn_settings.push(column_dict)
  })

  console.log('hotcolumn_settings', hotcolumn_settings)

  


  const [tabledata, setTableData] = React.useState(initial_tabledata)
  
  // columns that start with _ are metadata columns
  const metadata_columns = columns.filter((col) => col.startsWith('_'))
  const id_column = columns.indexOf('_id')
  const version_column = columns.indexOf('_version')
  
  
  
  const hotTableComponent = useRef<any>(null);

  const afterChange = (changes: any, source: any) => {
    const hotTableClass = hotTableComponent.current

    if (reaction_id) {
      console.log('skiping afterchange')
      return
    } else {
      console.log('afterchange triggered','source: ', source)
    }

    if (hotTableClass) {

      let hotInstance = hotTableClass.hotInstance
      if (changes && changes.length > 0) {

        // filter out changes in metadata columns
        changes = changes.filter((change: [number, number, any, any]) => {
          const [rowIndex, columnIndex, oldValue, newValue] = change
          const column = columns[columnIndex]
          return !metadata_columns.includes(column)
        })

        // filter out changes where null is replace by undefined
        changes = changes.filter((change: [number, number, any, any]) => {
          const [rowIndex, columnIndex, oldValue, newValue] = change
          const empty_cells = [null, undefined, '']
          return !(empty_cells.includes(oldValue) && empty_cells.includes(newValue))
        })
          console.log('changes', changes)

        let physical_changes = changes.map((change: [number, number, any, any]) => {
          const [rowIndex, columnIndex, oldValue, newValue] = change
          const physicalRowIndex = hotInstance.toPhysicalRow(rowIndex);
          const physicalColumnIndex = hotInstance.toPhysicalColumn(columnIndex);
          return [physicalRowIndex, physicalColumnIndex, oldValue, newValue]
        })

        console.log('physical_changes', physical_changes)

        let list_of_changes = []
        for (let physical_change of physical_changes) {

          // check the format of the new value
          let [rowIndex, columnIndex, oldValue, newValue] = physical_change
          let column_name = columns[columnIndex]
          if (columns_config.hasOwnProperty(column_name)) {
            let column_config = columns_config[column_name]
            if (column_config.hasOwnProperty('type')) {
              let column_type = column_config['type']
              if (column_type === 'numeric') {
                newValue = parseFloat(newValue)
              } else if (column_type === 'checkbox') {
                //make sure newValue is boolean
                newValue = newValue === true
              } else if (column_type === 'date') {
                //use text value for date
                // pass
              } else if (column_type === 'text') {
                //pass
              }
            }
          }



          //create dictionary with values in metadata columns
          let metadata_dict = metadata_columns.reduce((acc: { [key: string]: any }, col) => {
            let col_index = columns.indexOf(col)
            let value = hotInstance.getSourceDataAtCell(physical_change[0], col_index)
            acc[col] = value
            return acc
          }, {})
          
          let column = columns[columnIndex]
          list_of_changes.push({
            row_index: rowIndex,
            column: column,
            old_value: oldValue,
            new_value: newValue,
            ...metadata_dict
          })

          // increase version count for row
          let version = hotInstance.getSourceDataAtCell(rowIndex, version_column)
          hotInstance.suspendRender()
          hotInstance.suspendExecution()
          hotInstance.setSourceDataAtCell(rowIndex, version_column, version + 1)
          hotInstance.resumeRender()
          hotInstance.resumeExecution()
        }
        
        console.log('list_of_changes', list_of_changes)

        if (list_of_changes.length > 0) {
          onAfterChange(list_of_changes)
        }
        else {
          console.log('no changes')
        }

      }

    } else {
      console.error('hotTableClass is null')
      onAfterChange([])
    }

  }

  const beforeCreateRow = (index: any, amount: any, source: any) => {
    console.log('beforeCreateRow', index, amount, source)
    const hotTableClass = hotTableComponent.current
    if (!hotTableClass) {
      console.error('hotTableClass is null')
      return false
    } else {
      let hotInstance = hotTableClass.hotInstance
      // check if filters are applied

      // Get the Filters plugin
      const filtersPlugin = hotInstance.getPlugin('Filters');

      console.log('filtersPlugin', filtersPlugin)
      console.log('hotTableClass', hotTableClass)
      console.log('hotInstance', hotInstance)
      // TODO: disable adding row if filters are applied

    }


    // if (index === 0) {
    //   console.log('beforeCreateRow', index, amount, source)
    //   return false
    // }
  }

  const afterRowAdd = (row_index: any, amount: any) => {
    console.log('row added ', row_index)

    const hotTableClass = hotTableComponent.current

    if (reaction_id) {
      console.log('skiping afterRowAdd')
      return
    }

    if (row_index && hotTableClass) {
      let hotInstance = hotTableClass.hotInstance
      let physicalRowIndex = hotInstance.toPhysicalRow(row_index);
      console.log('physicalRowIndex', physicalRowIndex)
      onAfterRowAdd(physicalRowIndex)
    } else {
      // TODO: error adding row before first row
      if (row_index === 0) {
        onAfterRowAdd(row_index)
      } else {
        console.error('hotTableClass is null')
      }
    }
  }


  const beforeRowDelete = (index: any, amount: any, physicalRows: any, source: any) => {
    console.log(index, amount, physicalRows, source)

    const hot = hotTableComponent.current.hotInstance
    let row_ids = physicalRows.map((index: number) => hot.getSourceDataAtCell(index, id_column))
    console.log('row_ids', row_ids)
    onAfterRowDelete(row_ids)
  }


  // on component mount with hooks
  useEffect(() => {
    console.log('reaction triggered')
    const hotTableClass = hotTableComponent.current
    // setTableData(initial_tabledata)
    // onReload()

    const hot = hotTableClass.hotInstance

    const { reaction_type } = reaction

    

    if (reaction_type === 'update_rows') {
        if (reaction.hasOwnProperty('alert_message')) {
          const alert_message = reaction['alert_message']
          alert(alert_message)
        }
        const rows = reaction['rows']
        for (let row of rows) {
          let row_index = row['_row_index']

          // use columns to create the updated row
          let updated_row = columns.map((col) => row[col])

          // update row with updated_row data
          // hot.populateFromArray(row_index, 0, [updated_row]);

          // update row with updated_row data
          // hot.suspendRender()
          console.log('updating row', row_index, updated_row)

          updated_row.map((value, col_index) => {
            // if (value !== null){
              hot.setSourceDataAtCell(row_index, col_index, value)
            // }
          })
          // hot.resumeRender()
        }

    } else if (reaction_type === 'undo') {
      // trigger an alert
      alert('Error: undoing')

      hot.undo()
      
    } else if (reaction_type === 'error') {
      // trigger an alert
      const error = reaction['error_message']
      alert('Error: ' + error)
    }

    onAfterReaction()
    
    // onAfterReaction()
    // hot.resumeExecution()
    // hot.resumeRender()
    
  }, [reaction_id])

  useEffect(() => {
    const hotTableClass = hotTableComponent.current
    console.log('initial_tabledata changed')
    
  }, [initial_tabledata])

  useEffect(() => {
    
    setTableData(initial_tabledata)
    
  }, [table_version])






  let hidden_columns_ids = hide_columns.map((col) => columns.indexOf(col)).filter((x) => x !== -1)

  console.log(reaction)
  // console.log(hidden_columns_ids)

  return (
    <HotTable
      data={tabledata}
      height={height}
      dropdownMenu={['filter_by_condition', 'filter_action_bar', 'filter_by_value']}
      hiddenColumns={{
        columns: hidden_columns_ids,
        indicators: false,
      }}
      columnSorting={true}
      filters={true}
      contextMenu={true} //add and remove rows
      // contextMenu={['row_above', 'row_below', '---------', 'undo', 'redo']}
      colHeaders={columns}
      rowHeaders={true}
      sortByRelevance={true}
      autoWrapCol={true}
      autoWrapRow={true}
      licenseKey="non-commercial-and-evaluation"
      afterChange={afterChange}
      afterCreateRow={afterRowAdd}
      beforeCreateRow={beforeCreateRow}
      beforeRemoveRow={beforeRowDelete}
      // afterRemoveRow={afterRowDelete}
      colWidths={columns.map((col) => Math.min(999, 100))} // FIXME
      stretchH="all"
      ref={hotTableComponent}
      undo={true}
      dateFormat="YYYY-MM-DD"
      columns={columns.map((col) => {
        return {
          readOnly: metadata_columns.includes(col),
        }
      })}
      manualColumnResize={true} // Allow column width to be changed
    >
      
      {hotcolumn_settings.map((col_settings, index) => {
        return <HotColumn 
              key={index} 
              {...col_settings} 
              readOnly={metadata_columns.includes(columns[index])}
        />
      })}

    </HotTable>
  )
}

export default HandsontableComponent
