import streamlit as st
import pandas as pd
import numpy as np

from streamlit_handsontable import handsontable_element


# df = pd.DataFrame(
#     np.random.randn(5, 3),
#     columns=["a", "b", "c"]
# )

def on_change(data):
    print(f"Data changed: {data}")

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

    response = handsontable_element(df2, 
                                    df_key="a",
                                    on_change=on_change,
                                    key="handsontable", 
                                    )

    st.write(f"Response: {response}")


if __name__ == "__main__":
    main()