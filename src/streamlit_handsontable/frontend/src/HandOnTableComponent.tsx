import React, { useCallback } from "react"
import { HotTable } from "@handsontable/react"
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
  table_version: number
  height: number
  afterChange: (data: any) => void
  afterRowAdd: (data: any) => void
  afterRowDelete: (data: any) => void
  onReload: () => void
  hide_columns: string[]
}

// register Handsontable's modules
registerAllModules();

const HandsontableComponent: React.FC<TableProps> = ({
  data: initial_data,
  table_version,
  height,
  afterChange: onAfterChange,
  afterRowAdd: onAfterRowAdd,
  afterRowDelete: onAfterRowDelete,
  onReload,
  hide_columns,
}) => {
  const { columns, data: initial_tabledata } = initial_data

  const hotTableComponent = useRef<any>(null);

  const [tabledata, setTableData] = React.useState(initial_tabledata)


  
  const afterChange = (changes: any, source: any) => {
    const hotTableClass = hotTableComponent.current

    if (hotTableClass) {

      let hotInstance = hotTableClass.hotInstance
      if (changes && changes.length > 0) {

        let physical_changes = changes.map((change: [number, number, any, any]) => {
          const [rowIndex, columnIndex, oldValue, newValue] = change
          const physicalRowIndex = hotInstance.toPhysicalRow(rowIndex);
          const physicalColumnIndex = hotInstance.toPhysicalColumn(columnIndex);
          return [physicalRowIndex, physicalColumnIndex, oldValue, newValue]
        }
        )

        onAfterChange(physical_changes)

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
      //TODO: disable adding row if filters are applied

    }


    // if (index === 0) {
    //   console.log('beforeCreateRow', index, amount, source)
    //   return false
    // }
  }

  const afterRowAdd = (row_index: any, amount: any) => {
    console.log('row added ', row_index)

    const hotTableClass = hotTableComponent.current

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

  const afterRowDelete = (row_index: any) => {
    console.log(row_index)
    const hotTableClass = hotTableComponent.current
    if (row_index && hotTableClass) {
      let hotInstance = hotTableClass.hotInstance
      let physicalRowIndex = hotInstance.toPhysicalRow(row_index);
      onAfterRowDelete(physicalRowIndex)
    }
  }

  // on component mount with hooks
  useEffect(() => {
    console.log('table_version changed')
    const hotTableClass = hotTableComponent.current
    setTableData(initial_tabledata)
    onReload()
  }, [table_version])
  
  useEffect(() => {
    const hotTableClass = hotTableComponent.current
    // console.log('initial_tabledata changed')
  }, [initial_tabledata])




  let hidden_columns_ids = hide_columns.map((col) => columns.indexOf(col)).filter((x) => x !== -1)
  
  // console.log(initial_data)
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
      afterRemoveRow={afterRowDelete}
      colWidths={columns.map((col) => Math.min(999, 100))} //fixme
      stretchH="all"
      ref={hotTableComponent}
    />
  )
}

export default HandsontableComponent
