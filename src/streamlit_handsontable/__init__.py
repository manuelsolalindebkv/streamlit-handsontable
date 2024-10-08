import os
import streamlit.components.v1 as components
import pandas as pd
from json import loads
import json
import streamlit as st
from typing import List

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

version_control = 0

def handsontable_element(df: pd.DataFrame,
                        df_key=None, 
                        on_change:callable=None,
                        on_row_add:callable=None,
                        on_row_delete:callable=None,
                        hide_columns:List[str]=[],
                        override_height=900,
                        key='handsontable',
                        **kwargs):
    """Create a new instance of "handsontable_element".
    """

    # convert df to json object
    df_json = df.copy().to_json(orient="split")

    component_value = _component_func(
        key=key,
        df_json=df_json,
        hide_columns=hide_columns,
        override_height=override_height,
        default=json.dumps({"version": 0}),
    )

    # Parse component_value since it's JSON and return to Streamlit
    response =  loads(component_value)

    version = response['version']

    if 'handsontable_el_version' not in st.session_state:
        st.session_state.handsontable_el_version = 0

    if version == st.session_state.handsontable_el_version:
        return None
    
    st.session_state.handsontable_el_version = version

    if on_change:
        if 'afterChange' in response:
            afterchange = response['afterChange']
            # sample afterchange [[1, 1, 2, None]]
            changes = []
            for change in afterchange:
                # get the row and column from the dataframe
                column = df.columns[change[1]]
                # use df_key to get the row_id
                row_id = df.iloc[change[0]][df_key]
                changes.append({
                    'row_id': row_id,
                    'column': column,
                    'old_value': change[2],
                    'new_value': change[3]
                })
            on_change(changes)
    
    if on_row_add:
        if 'afterRowAdd' in response:
            afterRowAdd = response['afterRowAdd']
            on_row_add(afterRowAdd)

    if on_row_delete:
        if 'afterRowDelete' in response:
            afterRowDelete = response['afterRowDelete']
            on_row_delete(afterRowDelete)
                
    return True



