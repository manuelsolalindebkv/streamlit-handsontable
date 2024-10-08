import React, { useCallback } from "react"
import { HotTable } from "@handsontable/react"
import "handsontable/dist/handsontable.full.css"
import { useEffect } from "react"
import { useRef } from "react"
import Handsontable from 'handsontable';
import { registerAllModules } from 'handsontable/registry';



interface TableProps {
  data: {
    columns: string[]
    index: number[]
    data: any[][]
  }
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
  afterChange: onAfterChange,
  afterRowAdd: onAfterRowAdd,
  afterRowDelete: onAfterRowDelete,
  onReload,
  hide_columns,
}) => {
  const { columns, data: initial_tabledata } = initial_data

  const hotTableRef = useRef<Handsontable.Core | null>(null);

  const hotTableComponent = useRef<any>(null);



  // const [tabledata, setTableData] = React.useState(initial_data.data)


  // // Callback to handle data changes
  // const handleTableChange = useCallback((changes, source) => {
  //   if (source !== 'loadData') {
  //     if (changes) {
  //       const updatedData = [...tabledata]; // Make a copy of the current data
  //       changes.forEach(([row, prop, oldValue, newValue]: [number, number, any, any]) => {
  //         updatedData[row][prop-1] = newValue; // Update the cell with new value
  //       });
  //       console.log(tabledata)
  //       console.log(updatedData)
  //       setTableData(updatedData); // Update state
  //     }
  //   }
  // }, [tabledata]);

  // // // Callback for row insert
  // const handleRowInsert = useCallback((index, amount) => {
  //   const newRow = Array(tabledata[0].length).fill(null); // Add empty row
  //   const updatedData = [...tabledata];
  //   updatedData.splice(index, 0, newRow);
  //   // setTableData(updatedData as any);
  //   console.log(updatedData)
  // }, [tabledata]);

  // // Callback for row delete
  // const handleRowRemove = useCallback((index, amount) => {
  //   const updatedData = [...tabledata];
  //   updatedData.splice(index, amount); // Remove the row
  //   setTableData(updatedData as any);
  // }, [tabledata]);

  const afterChange = (changes: any, source: any) => {
    // handleTableChange(changes, source);
    // console.log(source)
    console.log(changes)
    const hotTableClass = hotTableComponent.current
    if (hotTableClass) {
      let hotInstance = hotTableClass.hotInstance
      // get row index
      let res = hotInstance.getCell(changes[0][0], changes[0][1])

      console.log(res)



    }
    console.log(hotTableClass)



    

    // console.log(tabledata)
    if (changes) {
      onAfterChange(changes)
    }
  }

  const afterRowAdd = (row_index: any, amount: any) => {
    console.log('row added ', row_index)

    // handleRowInsert(row_index, amount)
    // $timeout(function() {
    //   $scope.$digest();
    // });


    if (row_index) {
      onAfterRowAdd(row_index)
    }
  }

  const afterRowDelete = (changes: any) => {
    console.log(changes)
    if (changes) {
      onAfterRowDelete(changes)
    }
  }

  // on component mount with hooks
  useEffect(() => {
    console.log('initial data', initial_data)
    // setTableData(initial_data.data)
    onReload()
  }, [initial_data])


  console.log(initial_data)
  let hidden_columns_ids = hide_columns.map((col) => columns.indexOf(col)).filter((x) => x !== -1)

  console.log(hidden_columns_ids)

  return (
    <HotTable
      data={initial_tabledata}
      dropdownMenu={true}
      hiddenColumns={{
        columns: hidden_columns_ids,
        indicators: false,
      }}
      filters={true}
      contextMenu={true} //add and remove rows
      colHeaders={columns}
      rowHeaders={true}
      sortByRelevance={true}
      autoWrapCol={true}
      autoWrapRow={true}
      licenseKey="non-commercial-and-evaluation"
      afterChange={afterChange}
      afterCreateRow={afterRowAdd}
      afterRemoveRow={afterRowDelete}
      width="auto"
      height="auto"
      stretchH="all"
      // ref={hotTableRef}
      ref={hotTableComponent}
    />
  )
}

export default HandsontableComponent
