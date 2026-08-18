import streamlit as st
import pandas as pd
import os

# Page Configuration
st.set_page_config(page_title="Citi Account Parser", layout="wide")

def load_data(file_path):
    """Loads the Excel file and performs basic cleaning."""
    if not os.path.exists(file_path):
        return None
    try:
        df = pd.read_excel(file_path)
        # Standardize column names
        df.columns = [str(col).strip() for col in df.columns]
        return df
    except Exception as e:
        st.error(f"Error loading file: {e}")
        return None

def main():
    st.title("🏦 Citi Account Dashboard")
    st.markdown("Upload or process Citi account statements to visualize balances and account details.")

    file_path = "api/Citi Sample Accounts.xlsx"
    df = load_data(file_path)

    if df is not None:
        # Sidebar Filters
        st.sidebar.header("Filters")
        
        # Search
        search_query = st.sidebar.text_input("Search Accounts")
        
        # Currency Filter
        if 'Currency' in df.columns:
            currencies = ["All"] + sorted(df['Currency'].unique().tolist())
            selected_currency = st.sidebar.selectbox("Filter by Currency", currencies)
        else:
            selected_currency = "All"

        # Apply Filters
        filtered_df = df.copy()
        if search_query:
            filtered_df = filtered_df[filtered_df.apply(lambda row: row.astype(str).str.contains(search_query, case=False).any(), axis=1)]
        
        if selected_currency != "All":
            filtered_df = filtered_df[filtered_df['Currency'] == selected_currency]

        # Metrics
        col1, col2, col3 = st.columns(3)
        col1.metric("Total Accounts", len(filtered_df))
        if 'Balance' in filtered_df.columns:
            col2.metric("Total Balance", f"{filtered_df['Balance'].sum():,.2f}")
        
        # Display Data
        st.subheader("Account Details")
        st.dataframe(filtered_df, use_container_width=True)

        # Export
        st.subheader("Export Data")
        csv = filtered_df.to_csv(index=False).encode('utf-8')
        st.download_button(
            label="Download Filtered Data as CSV",
            data=csv,
            file_name='citi_accounts_export.csv',
            mime='text/csv',
        )
    else:
        st.warning(f"File not found at {file_path}. Please ensure the file exists in the 'api' directory.")

if __name__ == "__main__":
    main()