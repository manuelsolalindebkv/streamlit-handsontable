import os
import streamlit.components.v1 as components
import pandas as pd
from json import loads
import json
import streamlit as st
from typing import List, Dict

# Create a _RELEASE constant. We'll set this to False while we're developing
# the component, and True when we're ready to package and distribute it.
# (This is, of course, optional - there are innumerable ways to manage your
# release process.)
_RELEASE = True

# Declare a Streamlit component. `declare_component` returns a function
# that is used to create instances of the component. We're naming this
# function "_component_func", with an underscore prefix, because we don't want
# to expose it directly to users. Instead, we will create a custom wrapper
# function, below, that will serve as our component's public API.

# It's worth noting that this call to `declare_component` is the
# *only thing* you need to do to create the binding between Streamlit and
# your component frontend. Everything else we do in this file is simply a
# best practice.

if not _RELEASE:
    _component_func = components.declare_component(
        # We give the component a simple, descriptive name ("my_component"
        # does not fit this bill, so please choose something better for your
        # own component :)
        "handsontable_element",
        # Pass `url` here to tell Streamlit that the component will be served
        # by the local dev server that you run via `npm run start`.
        # (This is useful while your component is in development.)
        url="http://localhost:3001",
    )
else:
    # When we're distributing a production version of the component, we'll
    # replace the `url` param with `path`, and point it to to the component's
    # build directory:
    parent_dir = os.path.dirname(os.path.abspath(__file__))
    build_dir = os.path.join(parent_dir, "frontend/build")
    _component_func = components.declare_component("handsontable_element", path=build_dir)

class HandsontableComponent:

    __instance = None

    def __new__(cls, *args, **kwargs):
        if cls.__instance is None:
            cls.__instance = super(HandsontableComponent,cls).__new__(cls)
        return cls.__instance
    
    def __init__(self, 
                 df: pd.DataFrame, 
                 df_key:str, 
                 columns_config:Dict[str,dict]={},
                 on_change:callable=None, 
                 on_row_add:callable=None, 
                 on_row_delete:callable=None, 
                 hide_columns:List[str]=[],
                 skip_columns:List[str]=[],
                 override_height=900, 
                 key='handsontable',
                **kwargs):
        self.current_df:pd.DataFrame = df
        self.df_json = df.copy().to_json(orient="split")
        self._reaction_version = 0
        self.df_key = df_key
        self.on_change = on_change
        self.on_row_add = on_row_add
        self.on_row_delete = on_row_delete
        self.hide_columns = hide_columns
        self.skip_columns = skip_columns
        self.override_height = override_height
        self.key = key
        self.kwargs = kwargs
        self.last_response_version = 0
        self.reaction = {}
        self.table_version = 0
        self.columns_config = columns_config

        if df_key:
            assert df_key in self.current_df.columns, f"df_key {df_key} not in dataframe columns"

    def update_initial_df(self, df:pd.DataFrame):
        self.current_df = df
        self.df_json = df.copy().to_json(orient="split")
        self.table_version += 1

    # def update_df_row(self, change):
    #     row_id = change['row_id']
    #     column = change['column']
    #     new_value = change['new_value']
    #     self.current_df.loc[self.current_df['id'] == row_id, column] = new_value
    #     # update row version
    #     self.current_df.loc[self.current_df['id'] == row_id, 'version'] += 1

    def reaction_update_row(self,row_dict):
        assert '_row_index' in row_dict, "row_index not in row_dict"
        self.reaction_update_rows([row_dict])

    def reaction_update_rows(self,rows,alert_message:str=None):
        self._reaction_version += 1
        self.reaction = {
            "reaction_id": self._reaction_version,
            "reaction_type": "update_rows",
            "rows": rows
        }
        if alert_message:
            self.reaction['alert_message'] = alert_message

    def reaction_error(self, error_message:str):
        self._reaction_version += 1
        self.reaction = {
            "reaction_id": self._reaction_version,
            "reaction_type": "error",
            "error_message": error_message
        }


    def reaction_update_deleted_row(self):
        self._reaction_version += 1
        self.reaction = {
            "reaction_id": self._reaction_version,
            "reaction_type": "delete_row"
        }

    def reaction_undo_last_command(self):
        self._reaction_version += 1
        self.reaction = {
            "reaction_id": self._reaction_version,
            "reaction_type": "undo"
        }

    def render(self):
      
        component_value = _component_func(
            key=self.key,
            table_version=self.table_version,
            df_json=self.df_json,
            columns_config=json.dumps(self.columns_config),
            df_key=self.df_key,
            reaction=json.dumps(self.reaction),
            hide_columns=self.hide_columns,
            skip_columns=self.skip_columns,
            override_height=self.override_height,
            default=json.dumps({"version": 0}),
        )

        # once reaction has been sent, reset it
        self.reaction = {}

        # Parse component_value since it's JSON and return to Streamlit
        response =  loads(component_value)


        # this if for preventing the rerun of the component
        version = response['version']
        print(f"Response Version: {version}")
        
        # if 'handsontable_el_version' not in st.session_state:
        #     st.session_state.handsontable_el_version = 0
        # if version == st.session_state.handsontable_el_version:
        #     return None
        # st.session_state.handsontable_el_version = version

        if version == self.last_response_version:
            return None
        self.last_response_version = version


        if self.on_change:
            if 'afterChange' in response:
                changes = response['afterChange']
                self.on_change(changes)
        
        if self.on_row_add:
            if 'afterRowAdd' in response:
                afterRowAdd = response['afterRowAdd']
                self.on_row_add(afterRowAdd)

        if self.on_row_delete:
            if 'afterRowDelete' in response:
                ids_to_delete = response['afterRowDelete']
                self.on_row_delete(ids_to_delete)
                    
        return True



