import React, { useCallback } from "react"
import { HotTable } from "@handsontable/react"
import "handsontable/dist/handsontable.full.css"
import { useEffect } from "react"

interface TableProps {
  data: {
    columns: string[]
    index: number[]
    data: number[][]
  }
  afterChange: (data: any) => void
  afterRowAdd: (data: any) => void
  afterRowDelete: (data: any) => void
}

const HandsontableComponent: React.FC<TableProps> = ({
  data: initial_data,
  afterChange: onAfterChange,
  afterRowAdd: onAfterRowAdd,
  afterRowDelete: onAfterRowDelete,
}) => {
  const { columns, data: initial_tabledata } = initial_data

  const [tabledata, setTableData] = React.useState(initial_data.data)


  // Callback to handle data changes
  const handleTableChange = useCallback((changes, source) => {
    if (source !== 'loadData') {
      if (changes) {
        const updatedData = [...tabledata]; // Make a copy of the current data
        changes.forEach(([row, prop, oldValue, newValue]: [number, number, any, any]) => {
          updatedData[row][prop-1] = newValue; // Update the cell with new value
        });
        console.log(tabledata)
        console.log(updatedData)
        setTableData(updatedData); // Update state
      }
    }
  }, [tabledata]);

  // // Callback for row insert
  // const handleRowInsert = useCallback((index, amount) => {
  //   const newRow = Array(tabledata[0].length).fill(''); // Add empty row
  //   const updatedData = [...tabledata];
  //   updatedData.splice(index, 0, newRow);
  //   setTableData(updatedData as any);
  // }, [tabledata]);

  // // Callback for row delete
  // const handleRowRemove = useCallback((index, amount) => {
  //   const updatedData = [...tabledata];
  //   updatedData.splice(index, amount); // Remove the row
  //   setTableData(updatedData as any);
  // }, [tabledata]);

  const afterChange = (changes: any, source: any) => {
    handleTableChange(changes, source);
    console.log(source)
    console.log(changes)
    console.log(tabledata)
    if (changes) {
      onAfterChange(changes)
    }
  }

  const afterRowAdd = (row_index: any, amount: any) => {


    console.log('row added ', row_index)
    // add new row to data base on new added row index


    

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
    setTableData(initial_data.data)
  }, [initial_data])

  // Combine index with data rows
  const formattedData = initial_tabledata.map((row, index) => [index, ...row])

  console.log(tabledata)
  return (
    <HotTable
      data={formattedData}
      dropdownMenu={true}
      contextMenu={true}
      colHeaders={["Index", ...columns]}
      rowHeaders={true}
      licenseKey="non-commercial-and-evaluation"
      afterChange={afterChange}
      afterCreateRow={afterRowAdd}
      afterRemoveRow={afterRowDelete}
      // afterChangesObserved={afterChange}
      width="auto"
      height="auto"
      stretchH="all"
    />
  )
}

export default HandsontableComponent
