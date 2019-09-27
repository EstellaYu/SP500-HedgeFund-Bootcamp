# SP500 HedgeFund Bootcamp 
 
The "db_builder" folder has 4 Jupyter Notebooks that were used to build the database.

"Get Financials" pulled the Income Statement and Balance Sheet data from Edgar-Online, https://developer.edgar-online.com/docs

"Get Prices" pulled monthly prices on all the stocks from AlphaVantage, https://www.alphavantage.co/documentation/

"Merge Tables" put the two files together into one file

"Calc Returns" calculated the return series for all combinations of stock selection criteria and economic sectors

The "json" folder has 2 sample json requests, one from Edgar-Online and another from AlphaVantage

The database is in the "data" folder, called CompanyData.sqlite

The files for the website are in the "static" and "templates" folders
