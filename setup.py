import setuptools

setuptools.setup(
    name="streamlit-handsontable",
    version="0.0.1",
    author="Manuel Solalinde",
    author_email="manolosolalinde@gmail.com",
    description="Handsontable component for Streamlit",
    long_description="Handsontable component for Streamlit",
    long_description_content_type="text/plain",
    url="https://github.com/manuelsolalindebkv/streamlit-handsontable",
    package_dir={"": "src"},
    packages=setuptools.find_packages(where="src"),
    include_package_data=True,
    package_data={
        "streamlit_handsontable": ["frontend/build/**", "frontend/build/static/js/**"]
    },
    classifiers=[],
    python_requires=">=3.6",
    install_requires=[
        "streamlit >= 0.63",
    ],
)
