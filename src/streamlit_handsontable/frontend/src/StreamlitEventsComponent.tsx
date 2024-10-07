import { Streamlit, withStreamlitConnection } from "streamlit-component-lib";
import React, { useEffect } from "react";
import HandsOnTable from "./HandsOnTableExample";
import HandsontableComponent from "./HandOnTableComponent";




const jsonData = {
  columns: ["a", "b", "c"],
  index: [0, 1, 2, 3, 4],
  data: [
    [-0.2203645667, -0.1364460677, 0.7803492434],
    [-1.1966197248, 1.1900065576, 0.3441884038],
    [0.6643105109, -0.4865369531, 0.9699144943],
    [1.4745054581, -0.2389977022, 1.2352231319],
    [0.3313587927, 0.146335964, 0.0602939244]
  ]
};

const StreamlitEventsComponent = ({ args }: { args: any }) => {
  const override_height = args["override_height"];
  const df_json = args["df_json"];

  const df_data = JSON.parse(df_json)

  // Pull Plotly object from args and parse
  // const plot_obj = JSON.parse(args["plot_obj"]);
  // const override_width = args["override_width"];
  // const max_selections = args["max_selections"];
  // const selection_color = args["selection_color"];

  // Event booleans
  // const click_event = args["click_event"];
  // const select_event = args["select_event"];
  // const hover_event = args["hover_event"];


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
      console.log(data)
      response[event] = data;
    }
    
    if (event === 'afterRowDelete') {
      console.log(data)
      response[event] = data;
    }

    let response_str: string;
    response_str = JSON.stringify(response);
    Streamlit.setComponentValue(response_str);

  };

  return(
    <div>

    <h1>Handsontable Example</h1>
      <HandsontableComponent 
          afterChange={(data) => plotlyEventHandler(data,'afterChange')}
          afterRowAdd={(data) => plotlyEventHandler(data,'afterRowAdd')}
          afterRowDelete={(data) => plotlyEventHandler(data,'afterRowDelete')}
          data={df_data} />
      <h1>HandsOnTabl</h1>
      <HandsOnTable />
    </div>
  )

  
  
};

export default withStreamlitConnection(StreamlitEventsComponent);

