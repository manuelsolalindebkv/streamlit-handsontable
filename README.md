# Streamlit Handsontable Component

TODO: Fix this README

## Installation

```bash
# optional
# cd src/streamlit_plotly_map/frontend
# npm install
# npm run build
# npm run export
# cd ../../..

python setup.py sdist bdist_wheel
pip install dist/streamlit_plotly_map-0.0.1-py3-none-any.whl

# optional
# pip install -e . # to install the package in editable mode


# optional
# pip install git+https://github.com/manuelsolalindebkv/streamlit-plotly-map.git
```

## Example usage

```python
import streamlit as st
import pandas as pd
import numpy as np

from streamlit_plotly_map import plotly_map

st.title("Map Events")

df = pd.DataFrame(
    np.random.randn(1000, 2) / [50, 50] + [37.76, -122.4],
    columns=['lat', 'lon'])


selected_points = plotly_map(df, key="mymap")

st.write(f"Selected: {selected_points}")

```

