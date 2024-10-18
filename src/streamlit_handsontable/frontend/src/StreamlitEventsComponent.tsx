import { Streamlit, withStreamlitConnection } from "streamlit-component-lib";
import React, { useEffect } from "react";
// import HandsOnTable from "./HandsOnTableExample";
import HandsontableComponent from "./HandOnTableComponent";




// const jsonData = {
//   columns: ["a", "b", "c"],
//   index: [0, 1, 2, 3, 4],
//   data: [
//     [-0.2203645667, -0.1364460677, 0.7803492434],
//     [-1.1966197248, 1.1900065576, 0.3441884038],
//     [0.6643105109, -0.4865369531, 0.9699144943],
//     [1.4745054581, -0.2389977022, 1.2352231319],
//     [0.3313587927, 0.146335964, 0.0602939244]
//   ]
// };

var version_count = 1;

const StreamlitEventsComponent = ({ args }: { args: any }) => {
  const override_height = args["override_height"];
  const df_json = args["df_json"];
  const df_data = JSON.parse(df_json)
  const table_version = args["table_version"];
  const hide_columns = args["hide_columns"];
  const reaction = JSON.parse(args["reaction"]);
  const df_key = args["df_key"];
  const columns_config = JSON.parse(args["columns_config"]);

  const { reaction_id } = reaction;

  const [local_reaction, setLocalReaction] = React.useState(reaction);

  console.log(df_data);
  console.log(columns_config);

  const { columns } = df_data;
  const columns_with_dates: string[] = columns.filter((col: string, index: number) => {
    if (columns_config.hasOwnProperty(col)) {
      if (columns_config[col].hasOwnProperty('type')) {
        if (columns_config[col]['type'] === 'date') {
          return true;
        }
      }
    }
  });
  const columns_with_dates_index: number[] = columns_with_dates.map((col: string) => columns.indexOf(col));
  console.log('columns_with_dates', columns_with_dates)
  // // df_data.data is an array of arrays that has numeric objects that are time in milliseconds
  // // We need to convert them to date strings of format 'YYYY-MM-DD'
  // df_data.data.forEach((row: any[]) => {
  //   columns_with_dates_index.forEach((col_index: number) => {
  //     row[col_index] = new Date(row[col_index]).toISOString();
  //   });
  // });


  useEffect(() => {
    Streamlit.setFrameHeight(override_height);
  }, [override_height]);


  /** Click handler for plot. */
  const plotlyEventHandler = (data: any, event: string) => {

    var response: { [key: string]: any } = {};
    if (event === 'afterChange') {
      response[event] = data;
    }

    if (event === 'afterRowAdd') {
      response[event] = data;
    }
    
    if (event === 'afterRowDelete') {
      response[event] = data;
    }

    if (event === 'afterUndo') {
      response[event] = true;
    }

    version_count += 1;
    response['version'] = version_count;

    console.log('version_count', version_count);
    
    console.log('response', response);
    let response_str: string;
    response_str = JSON.stringify(response);
    // setLocalReaction({reaction_id:undefined});
    let returned_value = Streamlit.setComponentValue(response_str);
    

  };

  useEffect(() => {
    setLocalReaction(reaction);
  },[reaction_id]) 

  const afterReaction = () => {
    console.log('afterReaction');
    setLocalReaction({reaction_id:undefined});
  }

  // console.log('local_reaction', local_reaction);

  return(
    <div>
      <HandsontableComponent
          data={df_data} 
          df_key={df_key}
          columns_config={columns_config} 
          table_version={table_version}
          reaction={local_reaction}
          height={override_height}
          afterChange={(data) => plotlyEventHandler(data,'afterChange')}
          afterRowAdd={(data) => plotlyEventHandler(data,'afterRowAdd')}
          afterRowDelete={(data) => plotlyEventHandler(data,'afterRowDelete')}
          afterReaction={afterReaction}
          onReload={() => console.log('reloaded')}
          hide_columns={hide_columns}
          />
    </div>
  )

  
  
};

export default withStreamlitConnection(StreamlitEventsComponent);

