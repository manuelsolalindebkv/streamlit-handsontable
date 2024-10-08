import streamlit as st
import pandas as pd
import numpy as np

from streamlit_handsontable import handsontable_element
from json import loads
from time import sleep
import random


# df = pd.DataFrame(
#     np.random.randn(5, 3),
#     columns=["a", "b", "c"]
# )

def on_change(data):
    print(f"Data changed: {data}")

    # edit the dataframe
    df = st.session_state.df_handsontable
    for change in data:
        row_id = change['row_id']
        column = change['column']
        new_value = change['new_value']
        df.loc[df['id'] == row_id, column] = new_value

    st.session_state.df_handsontable = df
    print(df)
    st.rerun()

def on_row_add(row_index):
    print(f"Row added: {row_index}")

    # Add a new row to the dataframe
    uid = random.randint(0, 1000)

    new_row = {
            "id": uid,
            "a": None,
            "b": None,
            "c": None
        }
    
    df = st.session_state.df_handsontable

    # use row_index position to insert the new row in the dataframe in the correct position (do not use append)
    df.loc[row_index-0.5] = new_row

    # sort by index
    df = df.sort_index().reset_index(drop=True)
    st.session_state.df_handsontable = df
    print(df)

    st.rerun()

    

def on_row_delete(row_index):
    print(f"Row deleted: {row_index}")

    df = st.session_state.df_handsontable
    df = df.drop(row_index)
    df = df.reset_index(drop=True)
    st.session_state.df_handsontable = df
    print(df)

    st.rerun()


def main():

    st.title("Component")

    df2 = pd.DataFrame(
        {
            "id": [1, 2, 3],
            "a": [1, 2, 3],
            "b": [4, 5, 6],
            "c": [7, 8, 9]
        }
    )

    if "df_handsontable" not in st.session_state:
        st.session_state.df_handsontable = df2
        sleep(1)

    response = handsontable_element(df=st.session_state.df_handsontable,
                                    df_key="id",
                                    on_change=on_change,
                                    on_row_add=on_row_add,
                                    on_row_delete=on_row_delete,
                                    hide_columns=['id', 'b'],
                                    key="handsontable", 
                                    )

    st.write(f"Response: {response}")


if __name__ == "__main__":
    main()