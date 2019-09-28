# SP500 HedgeFund Bootcamp 
 
The "db_builder" folder has 4 Jupyter Notebooks that were used to build the database.

"Get Financials" pulled the Income Statement and Balance Sheet data from Edgar-Online, https://developer.edgar-online.com/docs

"Get Prices" pulled monthly prices on all the stocks from AlphaVantage, https://www.alphavantage.co/documentation/

"Merge Tables" put the two files together into one file

"Calc Returns" calculated the return series for all combinations of stock selection criteria and economic sectors

The "json" folder has 2 sample json requests, one from Edgar-Online and another from AlphaVantage

The database is in the "data" folder, called CompanyData.sqlite

The files for the website are in the "static" and "templates" folders

A comment on the data.  Financial Stocks do not have "EBIT", or "Earnings before Interest and Taxes".  For all other companies, interest payments are a "cost of capital" as opposed to a part of their normal business operations.  Thus, EBIT generally represents the amount of money a company has after running their normal operations, but before paying interest expense and taxes.  Financials, on the other hand, are in the business of borrowing, holding and lending money.  Since interest payments are an integral part of their business, we can't separate out the interest payments that are for "normal business operations" versus "cost of capital".  Thus there is no "EBIT" for financials.  In the graphs, anything related to EBIT and Financials has been set to zero.
